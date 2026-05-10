const { Notification } = require('../models');
const { getFirestore, getAdmin } = require('../config/firebase');

async function createNotification(userId, complaintId, type, title, message) {
  // Save to MySQL
  const notification = await Notification.create({
    userId,
    complaintId,
    type,
    title,
    message,
  });

  // Also save to Firestore for real-time sync
  try {
    const db = getFirestore();
    if (db) {
      const admin = getAdmin();
      await db.collection('notifications').add({
        userId,
        complaintId,
        type,
        title,
        message,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('⚠️  Failed to save notification to Firestore:', error.message);
    // Continue - MySQL save was successful
  }

  return notification;
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
