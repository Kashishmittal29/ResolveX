const express = require('express');
const router = express.Router();
const { Complaint } = require('../models');
const { protect, authorize } = require('../middleware/auth');

// GET /api/analytics/overview
router.get('/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, escalated] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'PENDING' }),
      Complaint.countDocuments({ status: 'IN_PROGRESS' }),
      Complaint.countDocuments({ status: 'RESOLVED' }),
      Complaint.countDocuments({ status: 'ESCALATED' }),
    ]);
    res.json({ success: true, stats: { total, pending, inProgress, resolved, escalated } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/by-category
router.get('/by-category', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/by-priority
router.get('/by-priority', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/trends
router.get('/trends', protect, authorize('admin'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await Complaint.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/peak-hours
router.get('/peak-hours', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/department-performance
router.get('/department-performance', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $match: { assignedDepartment: { $ne: null } } },
      {
        $group: {
          _id: '$assignedDepartment',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          total: 1,
          resolved: 1,
          resolutionRate: {
            $multiply: [
              { $divide: ['$resolved', '$total'] },
              100,
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/analytics/frequent-issues
router.get('/frequent-issues', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $match: { category: { $ne: 'OTHER' } } },
      {
        $group: {
          _id: { category: '$category', location: '$location' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 2 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
