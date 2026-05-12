const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users
router.get('/', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'staff') {
      where.role = 'staff';
      where.department = req.user.department;
    }
    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'department'],
    });
    const formatted = users.map((u) => ({ ...u.toJSON(), _id: u.id }));
    res.json({ success: true, users: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/staff
router.get('/staff', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role: 'staff', isActive: true },
      attributes: ['id', 'name', 'email', 'department'],
    });
    const formatted = staff.map((s) => ({ ...s.toJSON(), _id: s.id }));
    res.json({ success: true, staff: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
