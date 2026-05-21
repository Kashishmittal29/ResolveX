const express = require('express');
const router = express.Router();
const { Complaint, sequelize } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const dialect = sequelize.getDialect();

// GET /api/analytics/overview
router.get('/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, escalated] = await Promise.all([
      Complaint.count(),
      Complaint.count({ where: { status: 'PENDING' } }),
      Complaint.count({ where: { status: 'IN_PROGRESS' } }),
      Complaint.count({ where: { status: 'RESOLVED' } }),
      Complaint.count({ where: { status: 'ESCALATED' } }),
    ]);
    res.json({ success: true, stats: { total, pending, inProgress, resolved, escalated } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/by-category
router.get('/by-category', protect, authorize('admin'), async (req, res) => {
  try {
    const [data] = await sequelize.query(
      `SELECT category AS \`_id\`, COUNT(*) AS count FROM complaints GROUP BY category ORDER BY count DESC`
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/by-priority
router.get('/by-priority', protect, authorize('admin'), async (req, res) => {
  try {
    const [data] = await sequelize.query(
      `SELECT priority AS \`_id\`, COUNT(*) AS count FROM complaints GROUP BY priority ORDER BY count DESC`
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/trends
router.get('/trends', protect, authorize('admin'), async (req, res) => {
  try {
    let query;
    if (dialect === 'sqlite') {
      query = `SELECT DATE(createdAt) AS \`_id\`, COUNT(*) AS count 
       FROM complaints WHERE createdAt >= datetime('now', '-30 days') 
       GROUP BY DATE(createdAt) ORDER BY \`_id\``;
    } else {
      query = `SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS \`_id\`, COUNT(*) AS count 
       FROM complaints WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
       GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d') ORDER BY \`_id\``;
    }
    const [data] = await sequelize.query(query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/peak-hours
router.get('/peak-hours', protect, authorize('admin'), async (req, res) => {
  try {
    let query;
    if (dialect === 'sqlite') {
      query = `SELECT CAST(strftime('%H', createdAt) AS INTEGER) AS \`_id\`, COUNT(*) AS count FROM complaints 
       GROUP BY strftime('%H', createdAt) ORDER BY \`_id\``;
    } else {
      query = `SELECT HOUR(createdAt) AS \`_id\`, COUNT(*) AS count FROM complaints 
       GROUP BY HOUR(createdAt) ORDER BY \`_id\``;
    }
    const [data] = await sequelize.query(query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/department-performance
router.get('/department-performance', protect, authorize('admin'), async (req, res) => {
  try {
    const [data] = await sequelize.query(
      `SELECT assignedDepartment AS \`_id\`, COUNT(*) AS total, 
       SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved,
       SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS resolutionRate
       FROM complaints WHERE assignedDepartment IS NOT NULL 
       GROUP BY assignedDepartment ORDER BY total DESC`
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/frequent-issues
router.get('/frequent-issues', protect, authorize('admin'), async (req, res) => {
  try {
    let query;
    if (dialect === 'sqlite') {
      query = `SELECT category, location, COUNT(*) AS count 
       FROM complaints WHERE category != 'OTHER' 
       GROUP BY category, location HAVING COUNT(*) >= 2 
       ORDER BY count DESC LIMIT 10`;
    } else {
      query = `SELECT category, location, COUNT(*) AS count 
       FROM complaints WHERE category != 'OTHER' 
       GROUP BY category, location HAVING count >= 2 
       ORDER BY count DESC LIMIT 10`;
    }
    const [data] = await sequelize.query(query);
    const formatted = data.map((r) => ({
      _id: { category: r.category, location: r.location },
      count: r.count,
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
