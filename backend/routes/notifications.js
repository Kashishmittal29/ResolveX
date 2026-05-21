const express = require('express');
const router = express.Router();
const { Notification, Complaint } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('complaintId', 'complaintId title status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    const formatted = notifications.map((n) => {
      const data = n.toObject ? n.toObject() : n;
      data.id = data._id.toString();
      data._id = data._id.toString();
      if (data.complaintId && typeof data.complaintId === 'object' && data.complaintId._id) {
        data.complaint = {
          id: data.complaintId._id.toString(),
          _id: data.complaintId._id.toString(),
          complaintId: data.complaintId.complaintId,
          title: data.complaintId.title,
          status: data.complaintId.status,
        };
      }
      delete data.complaintId;
      return data;
    });

    res.json({ success: true, notifications: formatted, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const affected = await Notification.updateOne(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    if (affected.matchedCount === 0) return res.status(404).json({ message: 'Notification not found' });
    const notification = await Notification.findById(req.params.id);
    res.json({ success: true, notification: notification.toObject() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
