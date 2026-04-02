const { Complaint } = require('../models');
const { Op } = require('sequelize');
const { notifyEscalation } = require('../services/notificationService');

async function checkSlaEscalation() {
  const overdue = await Complaint.findAll({
    where: {
      status: { [Op.in]: ['PENDING', 'IN_PROGRESS'] },
      slaDeadline: { [Op.lt]: new Date() },
    },
  });

  for (const complaint of overdue) {
    complaint.status = 'ESCALATED';
    complaint.escalationReason = `SLA breach: Not resolved by ${complaint.slaDeadline}`;
    const timeline = complaint.timeline || [];
    timeline.push({ status: 'ESCALATED', note: complaint.escalationReason, updatedBy: null });
    complaint.timeline = timeline;
    await complaint.save();
    await notifyEscalation(complaint, complaint.escalationReason);
  }

  if (overdue.length > 0) {
    console.log(`SLA Escalation: ${overdue.length} complaint(s) escalated`);
  }
}

module.exports = { checkSlaEscalation };
