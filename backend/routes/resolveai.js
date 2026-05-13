const express = require('express');
const router = express.Router();
const https = require('https');
const { protect, authorize } = require('../middleware/auth');
const { Complaint, User, sequelize } = require('../models');
const { classifyComplaint } = require('../services/nlpClassifier');
const { autoAssignComplaint } = require('../services/autoAssignment');
const { sendEmail, getComplaintSubmittedTemplate } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calls the OpenAI Chat Completions API using Node's built-in https module.
 * Returns the full parsed response object.
 */
function callOpenAI(systemPrompt, userMessage) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return reject(new Error('OPENAI_API_KEY is not configured'));
    }

    const body = JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** Mirrors the generateComplaintId helper used in complaints.js */
function generateComplaintId() {
  return `RX-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;
}

/** Inline SLA deadline calculator (avoids importing the config file). */
function getSlaDeadline(category) {
  const SLA_HOURS = {
    ELECTRICAL: 24,
    PLUMBING: 24,
    HVAC: 48,
    SECURITY: 12,
    IT_SUPPORT: 48,
    OTHER: 72,
  };
  const hours = SLA_HOURS[category] || 72;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

// ─── POST /api/resolveai/analyze ─────────────────────────────────────────────
router.post('/analyze', protect, authorize('student'), async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'description is required' });
    }

    const systemPrompt = `You are an assistant for a campus complaint system. Given a complaint description, return ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "category": one of [ELECTRICAL, PLUMBING, HVAC, IT_SUPPORT, SECURITY, OTHER],
  "priority": one of [LOW, MEDIUM, HIGH, CRITICAL],
  "suggestedTitle": a short 5-10 word title for the complaint,
  "reasoning": one sentence explaining why you chose this category and priority,
  "confidence": a number 0-100 representing your confidence
}`;

    const aiResponse = await callOpenAI(systemPrompt, description.trim());
    let rawText = aiResponse?.choices?.[0]?.message?.content || '{}';

    // Strip any markdown fences before parsing
    rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    let classification;
    try {
      classification = JSON.parse(rawText);
    } catch {
      classification = {
        category: 'OTHER',
        priority: 'MEDIUM',
        suggestedTitle: 'Campus Issue Report',
        reasoning: 'Could not parse AI response — defaulted to OTHER/MEDIUM.',
        confidence: 0,
      };
    }

    // Similar open complaints in the same category
    const [similarComplaints] = await sequelize.query(
      `SELECT id, title, status, category, location, createdAt
       FROM complaints
       WHERE category = ? AND status != 'RESOLVED'
       ORDER BY createdAt DESC LIMIT 3`,
      { replacements: [classification.category] }
    );

    // Predicted resolution time from historical resolved data
    const [resolutionRows] = await sequelize.query(
      `SELECT AVG(TIMESTAMPDIFF(HOUR, createdAt, updatedAt)) as avgHours
       FROM complaints
       WHERE category = ? AND status = 'RESOLVED' LIMIT 50`,
      { replacements: [classification.category] }
    );
    const predictedResolutionHours = Math.round(
      resolutionRows[0]?.avgHours || 24
    );

    return res.json({
      success: true,
      classification,
      similarComplaints,
      predictedResolutionHours,
    });
  } catch (error) {
    console.error('[ResolveAI /analyze]', error.message);
    return res.status(500).json({ message: error.message });
  }
});

// ─── POST /api/resolveai/quick-submit ─────────────────────────────────────────
router.post('/quick-submit', protect, authorize('student'), async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body;

    if (!title || !description || !category || !priority || !location) {
      return res.status(400).json({
        message:
          'All fields are required: title, description, category, priority, location',
      });
    }

    // Use NLP classifier to confirm category
    const nlpResult = classifyComplaint(title, description);

    const complaint = await Complaint.create({
      complaintId: generateComplaintId(),
      title,
      description,
      category,
      location,
      priority,
      priorityScore: nlpResult.priorityScore,
      submittedBy: req.user.id,
      nlpCategory: nlpResult.category,
      nlpPriority: nlpResult.priority,
      slaDeadline: getSlaDeadline(category),
      status: 'PENDING',
      timeline: [
        {
          status: 'PENDING',
          note: 'Complaint submitted via ResolveAI',
          updatedBy: req.user.id,
        },
      ],
    });

    // Auto-assign to the best available staff member
    const assignResult = await autoAssignComplaint(complaint);
    if (assignResult.assigned) {
      complaint.assignedTo = assignResult.staff.id;
      complaint.assignedDepartment = assignResult.staff.department;
      complaint.status = 'IN_PROGRESS';
      complaint.timeline = [
        ...(complaint.timeline || []),
        {
          status: 'IN_PROGRESS',
          note: `Auto-assigned to ${assignResult.staff.name}`,
          updatedBy: null,
        },
      ];
    }
    await complaint.save();

    // Populate associations for the email template
    const populated = await Complaint.findByPk(complaint.id, {
      include: [
        { model: User, as: 'submittedByUser', attributes: ['id', 'name', 'email'] },
        {
          model: User,
          as: 'assignedToUser',
          attributes: ['id', 'name', 'email', 'department'],
        },
      ],
    });

    // Email notification to student
    try {
      if (populated?.submittedByUser) {
        const htmlBody = getComplaintSubmittedTemplate({
          complaintId: populated.complaintId,
          studentName: populated.submittedByUser.name,
          title: populated.title,
          category: populated.category,
          priority: populated.priority,
          location: populated.location,
          slaDeadline: populated.slaDeadline,
          id: populated.id,
        });
        await sendEmail(
          populated.submittedByUser.email,
          'Complaint Submitted Successfully - ResolveX',
          htmlBody
        );
      }
    } catch (emailErr) {
      console.error('[ResolveAI quick-submit] Email error:', emailErr.message);
    }

    // Firebase Firestore notification
    try {
      await createNotification(
        req.user.id,
        complaint.id,
        'SUBMISSION',
        `Complaint Submitted — ${complaint.complaintId}`,
        `Your complaint "${title}" has been submitted and is being processed.`
      );
    } catch (notifErr) {
      console.error(
        '[ResolveAI quick-submit] Notification error:',
        notifErr.message
      );
    }

    return res.status(201).json({ success: true, complaint: populated });
  } catch (error) {
    console.error('[ResolveAI /quick-submit]', error.message);
    return res.status(500).json({ message: error.message });
  }
});

// ─── GET /api/resolveai/faq ───────────────────────────────────────────────────
router.get('/faq', protect, authorize('student'), (req, res) => {
  const faqs = [
    {
      id: 1,
      question: 'How long does an electrical repair usually take?',
      answer:
        'Electrical issues have a 24-hour SLA. Simple fixes like bulb replacements or tripped breakers are often resolved within a few hours. Complex wiring issues may take up to 48 hours depending on parts availability and technician scheduling.',
      category: 'ELECTRICAL',
    },
    {
      id: 2,
      question: 'What should I do if there is a major water leak?',
      answer:
        'Report it immediately as CRITICAL priority. Turn off any nearby water valves if it is safe to do so. Plumbing emergencies share a 24-hour SLA, and critical issues are escalated to the top of the queue. The maintenance team will be notified in real-time.',
      category: 'PLUMBING',
    },
    {
      id: 3,
      question: 'My room AC is not cooling — how do I report it?',
      answer:
        'Submit an HVAC complaint with your block and room number. HVAC complaints have a 48-hour SLA. Include details such as the current temperature reading and whether the unit powers on at all — this helps technicians come fully prepared.',
      category: 'HVAC',
    },
    {
      id: 4,
      question: 'The campus WiFi is very slow in my block. What can I do?',
      answer:
        'Submit an IT Support complaint specifying your block, floor, and the approximate times of the slowdown. The IT team investigates network issues within 48 hours. If multiple students in the same area report the same problem, the system flags it as higher priority.',
      category: 'IT_SUPPORT',
    },
    {
      id: 5,
      question: 'I suspect unauthorised access near my hostel. Who handles it?',
      answer:
        'Security complaints have the highest urgency with a 12-hour SLA. Submit immediately and select CRITICAL priority if there is an active threat. The security team is notified in real-time. For immediate danger, also contact campus security directly by phone.',
      category: 'SECURITY',
    },
    {
      id: 6,
      question: 'Can I track the status of my complaint after submission?',
      answer:
        'Yes. Every complaint receives a unique ID (e.g. RX-XXXXX). You can view real-time status updates, assigned staff details, and the full activity timeline on your Student Dashboard. You also receive email notifications on every status change.',
      category: 'OTHER',
    },
    {
      id: 7,
      question: 'What happens if my complaint is not resolved within the deadline?',
      answer:
        'ResolveX monitors all complaints against SLA deadlines automatically. If a complaint is not resolved on time it is escalated, flagged as ESCALATED in the system, and an alert email is sent to administrators for immediate action.',
      category: 'OTHER',
    },
    {
      id: 8,
      question: 'How do I avoid submitting a duplicate complaint?',
      answer:
        'Use the ResolveAI "Analyze" tab before submitting. Paste your description and the assistant will show any similar open complaints in the same category. If an existing complaint matches your issue, check its status instead of creating a new one.',
      category: 'OTHER',
    },
  ];

  return res.json({ success: true, faqs });
});

// ─── GET /api/resolveai/my-stats ──────────────────────────────────────────────
router.get('/my-stats', protect, authorize('student'), async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT
         COUNT(*) as total,
         SUM(CASE WHEN status = 'RESOLVED'  THEN 1 ELSE 0 END) as resolved,
         SUM(CASE WHEN status = 'PENDING'   THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'ESCALATED' THEN 1 ELSE 0 END) as escalated,
         AVG(CASE WHEN status = 'RESOLVED'
             THEN TIMESTAMPDIFF(HOUR, createdAt, updatedAt) END) as avgResolutionHours
       FROM complaints
       WHERE submittedBy = ?`,
      { replacements: [req.user.id] }
    );

    const raw = rows[0] || {};
    const stats = {
      total: parseInt(raw.total) || 0,
      resolved: parseInt(raw.resolved) || 0,
      pending: parseInt(raw.pending) || 0,
      escalated: parseInt(raw.escalated) || 0,
      avgResolutionHours:
        raw.avgResolutionHours != null
          ? Math.round(parseFloat(raw.avgResolutionHours))
          : null,
    };

    return res.json({ success: true, stats });
  } catch (error) {
    console.error('[ResolveAI /my-stats]', error.message);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
