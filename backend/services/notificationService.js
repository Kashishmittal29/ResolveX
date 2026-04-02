const { Notification } = require('../models');

async function createNotification(userId, complaintId, type, title, message) {
  return await Notification.create({
    userId,
    complaintId,
    type,
    title,
    message,
  });
}

async function notifyStatusChange(complaint, oldStatus, newStatus, userId) {
  const messages = {
    IN_PROGRESS: 'Your complaint is now being worked on.',
    RESOLVED: 'Your complaint has been resolved!',
    ESCALATED: 'Your complaint has been escalated for priority handling.',
  };
  const msg = messages[newStatus] || `Status updated to ${newStatus}`;
  await createNotification(
    complaint.submittedBy,
    complaint.id,
    'STATUS_CHANGE',
    `Complaint #${complaint.complaintId} - Status Update`,
    msg
  );
}

async function notifyAssignment(complaint, staffId) {
  await createNotification(
    complaint.submittedBy,
    complaint.id,
    'ASSIGNMENT',
    `Complaint #${complaint.complaintId} - Assigned`,
    'Your complaint has been assigned to a staff member.'
  );
  if (staffId) {
    await createNotification(
      staffId,
      complaint.id,
      'ASSIGNMENT',
      `New Complaint Assigned - #${complaint.complaintId}`,
      `You have been assigned complaint: ${complaint.title}`
    );
  }
}

async function notifyEscalation(complaint, reason) {
  await createNotification(
    complaint.submittedBy,
    complaint.id,
    'ESCALATION',
    `Complaint #${complaint.complaintId} - Escalated`,
    reason || 'Your complaint has been escalated due to SLA breach.'
  );
}

module.exports = {
  createNotification,
  notifyStatusChange,
  notifyAssignment,
  notifyEscalation,
};
