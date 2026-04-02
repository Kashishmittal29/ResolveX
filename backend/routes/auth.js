const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['student', 'staff', 'admin']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password, role, department, studentId, phone } = req.body;
      const exists = await User.findOne({ where: { email: email.toLowerCase() } });
      if (exists) return res.status(400).json({ message: 'User already exists with this email' });

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'student',
        department: department || 'GENERAL',
        studentId,
        phone,
      });

      const token = generateToken(user.id);
      res.status(201).json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ where: { email: email.toLowerCase() } });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ message: 'Invalid credentials' });
      if (!user.isActive) return res.status(401).json({ message: 'Account is deactivated' });

      const token = generateToken(user.id);
      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
