const { Complaint, User } = require('../models');
const { Op } = require('sequelize');
const { notifyEscalation } = require('../services/notificationService');
const { sendEmail, getSlaBreachedTemplate } = require('../services/emailService');

async function checkSlaEscalation() {
  const overdue = await Complaint.findAll({
    where: {
      status: { [Op.in]: ['PENDING', 'IN_PROGRESS'] },
      slaDeadline: { [Op.lt]: new Date() },
    },
    include: [
      { model: User, as: 'submittedByUser', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'assignedToUser', attributes: ['id', 'name', 'email'] },
    ],
  });

  for (const complaint of overdue) {
    complaint.status = 'ESCALATED';
    complaint.escalationReason = `SLA breach: Not resolved by ${complaint.slaDeadline}`;
    const timeline = complaint.timeline || [];
    timeline.push({ status: 'ESCALATED', note: complaint.escalationReason, updatedBy: null, timestamp: new Date().toISOString() });
    complaint.timeline = timeline;
    await complaint.save();
    await notifyEscalation(complaint, complaint.escalationReason);

    // SEND SLA BREACH ALERT EMAILS TO ALL ADMINS
    try {
      const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id', 'name', 'email'] });
      const htmlBody = getSlaBreachedTemplate({
        complaintId: complaint.complaintId,
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority,
        location: complaint.location,
        createdAt: complaint.createdAt,
        slaDeadline: complaint.slaDeadline,
        assignedToName: complaint.assignedToUser?.name || 'Unassigned',
        id: complaint.id,
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
