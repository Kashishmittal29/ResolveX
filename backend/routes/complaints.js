const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { Complaint, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../utils/upload');
const { classifyComplaint } = require('../services/nlpClassifier');
const { autoAssignComplaint } = require('../services/autoAssignment');
const { notifyStatusChange, notifyAssignment } = require('../services/notificationService');
const { sendEmail, getComplaintSubmittedTemplate, getComplaintAssignedTemplate, getComplaintResolvedTemplate } = require('../services/emailService');
const SLA_CONFIG = require('../config/sla');

function generateComplaintId() {
  return `RX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function getSlaDeadline(category) {
  const hours = SLA_CONFIG[category] || SLA_CONFIG.OTHER;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

// POST /api/complaints
router.post(
  '/',
  protect,
  authorize('student'),
  upload.single('image'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isIn(['ELECTRICAL', 'PLUMBING', 'HVAC', 'INFRASTRUCTURE', 'CLEANLINESS', 'SECURITY', 'IT_SUPPORT', 'LIBRARY', 'CAFETERIA', 'TRANSPORT', 'OTHER']).withMessage('Valid category is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      let { title, description, category, location, priority } = req.body;
      const nlpResult = classifyComplaint(title, description);
      if (!priority) priority = nlpResult.priority;
      category = category || nlpResult.category;

      const complaint = new Complaint({
        complaintId: generateComplaintId(),
        title,
        description,
        category,
        location,
        priority,
        priorityScore: nlpResult.priorityScore,
        submittedBy: req.user._id,
        image: req.file ? req.file.path : null,
        nlpCategory: nlpResult.category,
        nlpPriority: nlpResult.priority,
        slaDeadline: getSlaDeadline(category),
        timeline: [{ status: 'PENDING', note: 'Complaint submitted', updatedBy: req.user._id, timestamp: new Date() }],
      });

      const assignResult = await autoAssignComplaint(complaint);
      if (assignResult.assigned) {
        complaint.assignedTo = assignResult.staff._id;
        complaint.assignedDepartment = assignResult.staff.department;
        complaint.status = 'IN_PROGRESS';
        complaint.timeline.push({
          status: 'IN_PROGRESS',
          note: `Auto-assigned to ${assignResult.staff.name}`,
          updatedBy: null,
          timestamp: new Date(),
        });
        await complaint.save();
        await notifyAssignment(complaint, assignResult.staff._id);
      } else {
        await complaint.save();
      }

      const populated = await Complaint.findById(complaint._id)
        .populate('submittedBy', 'name email')
        .populate('assignedTo', 'name email department');

      // SEND CONFIRMATION EMAIL TO STUDENT
      try {
        const htmlBody = getComplaintSubmittedTemplate({
          complaintId: populated.complaintId,
          studentName: populated.submittedBy.name,
          title: populated.title,
          category: populated.category,
          priority: populated.priority,
          location: populated.location,
          slaDeadline: populated.slaDeadline,
          id: populated._id.toString(),
        });
        await sendEmail(
          populated.submittedBy.email,
          'Complaint Submitted Successfully - ResolveX',
          htmlBody
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError.message);
      }

      // SEND ASSIGNMENT EMAIL TO STAFF (if auto-assigned)
      if (populated.assignedTo) {
        try {
          const htmlBody = getComplaintAssignedTemplate({
            complaintId: populated.complaintId,
            title: populated.title,
            description: populated.description,
            category: populated.category,
            priority: populated.priority,
            location: populated.location,
            slaDeadline: populated.slaDeadline,
            submittedByName: populated.submittedBy.name,
            id: populated._id.toString(),
          }, populated.assignedTo.name);
          await sendEmail(
            populated.assignedTo.email,
            'New Complaint Assigned - ResolveX',
            htmlBody
          );
        } catch (emailError) {
          console.error('Failed to send assignment email:', emailError.message);
        }
      }

      res.status(201).json({ success: true, complaint: formatComplaint(populated) });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET /api/complaints
router.get(
  '/',
  protect,
  [
    query('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED']),
    query('category').optional(),
    query('priority').optional(),
    query('department').optional(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { status, category, priority, department, page = 1, limit = 20 } = req.query;
      const where = {};

      if (req.user.role === 'student') {
        where.submittedBy = req.user._id;
      } else if (req.user.role === 'staff') {
        where.$or = [
          { assignedTo: req.user._id },
          { assignedDepartment: req.user.department },
        ];
      }
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (department) where.assignedDepartment = department;

      const complaints = await Complaint.find(where)
        .populate('submittedBy', 'name email')
        .populate('assignedTo', 'name email department')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const count = await Complaint.countDocuments(where);

      res.json({
        success: true,
        complaints: complaints.map(formatComplaint),
        pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET /api/complaints/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email studentId')
      .populate('assignedTo', 'name email department')
      .populate('timeline.updatedBy', 'name');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'student' && complaint.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'staff') {
      const isAssigned = complaint.assignedTo && complaint.assignedTo._id.toString() === req.user._id.toString();
      const isDept = complaint.assignedDepartment === req.user.department;
      if (!isAssigned && !isDept) return res.status(403).json({ message: 'Access denied' });
    }

    let formatted = formatComplaint(complaint);
    res.json({ success: true, complaint: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/complaints/:id
router.patch(
  '/:id',
  protect,
  authorize('admin', 'staff'),
  [
    body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED']),
    body('assignedTo').optional(),
    body('note').optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

      const oldStatus = complaint.status;
      const { status, assignedTo, note } = req.body;

      if (status) {
        complaint.status = status;
        const timeline = complaint.timeline || [];
        timeline.push({
          status,
          note: note || `Status changed to ${status}`,
          updatedBy: req.user._id,
          timestamp: new Date(),
        });
        complaint.timeline = timeline;
        if (status === 'RESOLVED') complaint.resolvedAt = new Date();
        await notifyStatusChange(complaint, oldStatus, status, req.user._id);
      }
      if (assignedTo !== undefined) {
        complaint.assignedTo = assignedTo ? assignedTo : null;
        await notifyAssignment(complaint, assignedTo);
      }

      await complaint.save();
      const updated = await Complaint.findById(complaint._id)
        .populate('submittedBy', 'name email')
        .populate('assignedTo', 'name email department');

      // SEND RESOLUTION EMAIL TO STUDENT (if status changed to RESOLVED)
      if (status === 'RESOLVED' && updated.submittedBy) {
        try {
          const htmlBody = getComplaintResolvedTemplate({
            complaintId: updated.complaintId,
            studentName: updated.submittedBy.name,
            title: updated.title,
            resolvedAt: updated.resolvedAt,
            resolutionNotes: note || 'No additional notes provided.',
            id: updated._id.toString(),
          }, req.user.name);
          await sendEmail(
            updated.submittedBy.email,
            'Your Complaint Has Been Resolved - ResolveX',
            htmlBody
          );
        } catch (emailError) {
          console.error('Failed to send resolution email:', emailError.message);
        }
      }

      res.json({ success: true, complaint: formatComplaint(updated) });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST /api/complaints/classify
router.post(
  '/classify',
  protect,
  [body('title').trim().notEmpty(), body('description').trim().notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    res.json({ success: true, ...classifyComplaint(req.body.title, req.body.description) });
  }
);

function formatComplaint(c) {
  const data = c.toObject ? c.toObject() : c;
  const out = { ...data, id: data._id.toString(), _id: data._id.toString() };
  if (data.submittedBy && typeof data.submittedBy === 'object' && data.submittedBy._id) {
    const u = data.submittedBy;
    out.submittedBy = { id: u._id.toString(), _id: u._id.toString(), name: u.name, email: u.email, studentId: u.studentId };
  }
  if (data.assignedTo && typeof data.assignedTo === 'object' && data.assignedTo._id) {
    const u = data.assignedTo;
    out.assignedTo = { id: u._id.toString(), _id: u._id.toString(), name: u.name, email: u.email, department: u.department };
  }
  if (out.timeline && out.timeline.length) {
    out.timeline = out.timeline.map((t) => {
      if (t.updatedBy && typeof t.updatedBy === 'object' && t.updatedBy._id) {
        return {
          ...t,
          updatedBy: { id: t.updatedBy._id.toString(), _id: t.updatedBy._id.toString(), name: t.updatedBy.name },
        };
      }
      return t;
    });
  }
  return out;
}

module.exports = router;
