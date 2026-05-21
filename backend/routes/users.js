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
    const users = await User.find(where).select('name email role department');
    const formatted = users.map((u) => {
      const obj = u.toObject();
      obj.id = obj._id.toString();
      obj._id = obj._id.toString();
      return obj;
    });
    res.json({ success: true, users: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/staff
router.get('/staff', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff', isActive: true }).select('name email department');
    const formatted = staff.map((s) => {
      const obj = s.toObject();
      obj.id = obj._id.toString();
      obj._id = obj._id.toString();
      return obj;
    });
    res.json({ success: true, staff: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
