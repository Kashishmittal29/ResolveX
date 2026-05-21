const { Complaint, User } = require('../models');
const { notifyEscalation } = require('../services/notificationService');
const { sendEmail, getSlaBreachedTemplate } = require('../services/emailService');

async function checkSlaEscalation() {
  const overdue = await Complaint.find({
    status: { $in: ['PENDING', 'IN_PROGRESS'] },
    slaDeadline: { $lt: new Date() },
  })
  .populate('submittedBy', 'name email')
  .populate('assignedTo', 'name email');

  for (const complaint of overdue) {
    complaint.status = 'ESCALATED';
    complaint.escalationReason = `SLA breach: Not resolved by ${complaint.slaDeadline}`;
    const timeline = complaint.timeline || [];
    timeline.push({ status: 'ESCALATED', note: complaint.escalationReason, updatedBy: null, timestamp: new Date() });
    complaint.timeline = timeline;
    await complaint.save();
    await notifyEscalation(complaint, complaint.escalationReason);

    // SEND SLA BREACH ALERT EMAILS TO ALL ADMINS
    try {
      const admins = await User.find({ role: 'admin' }).select('name email');
      const htmlBody = getSlaBreachedTemplate({
        complaintId: complaint.complaintId,
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority,
        location: complaint.location,
        createdAt: complaint.createdAt,
        slaDeadline: complaint.slaDeadline,
        assignedToName: complaint.assignedTo?.name || 'Unassigned',
        id: complaint._id.toString(),
      });

      for (const admin of admins) {
        await sendEmail(
          admin.email,
          '🚨 SLA Escalation Alert - ResolveX',
          htmlBody
        );
      }
    } catch (emailError) {
      console.error('Failed to send SLA escalation emails:', emailError.message);
    }
  }

  if (overdue.length > 0) {
    console.log(`SLA Escalation: ${overdue.length} complaint(s) escalated and admin emails sent`);
  }
}

module.exports = { checkSlaEscalation };
