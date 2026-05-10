const express = require('express');
const router = express.Router();
const { Notification, Complaint } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      include: [{ model: Complaint, attributes: ['id', 'complaintId', 'title', 'status'] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    const formatted = notifications.map((n) => {
      const data = n.toJSON();
      if (n.Complaint) {
        data.complaint = { _id: n.Complaint.id, ...n.Complaint.toJSON() };
      }
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
    const [affected] = await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    if (affected === 0) return res.status(404).json({ message: 'Notification not found' });
    const notification = await Notification.findByPk(req.params.id);
    res.json({ success: true, notification: notification.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.user.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
