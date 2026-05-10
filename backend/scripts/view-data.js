/**
 * View data in MySQL database (no MySQL CLI needed)
 * Run: npm run view-data
 */
require('dotenv').config();
const { sequelize, User, Complaint, Notification } = require('../models');

async function viewData() {
  try {
    await sequelize.authenticate();
    console.log('\n=== ResolveX Database Data ===\n');

    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'department'] });
    console.log('--- USERS ---');
    if (users.length === 0) {
      console.log('(No users. Run: npm run seed)');
    } else {
      console.table(users.map((u) => u.get({ plain: true })));
    }

    const complaints = await Complaint.findAll({
      attributes: ['id', 'complaintId', 'title', 'category', 'status', 'priority', 'createdAt'],
    });
    console.log('\n--- COMPLAINTS ---');
    if (complaints.length === 0) {
      console.log('(No complaints. Run: npm run seed)');
    } else {
      console.table(complaints.map((c) => c.get({ plain: true })));
    }

    const notifications = await Notification.findAll({
      attributes: ['id', 'type', 'title', 'isRead', 'createdAt'],
      limit: 10,
    });
    console.log('\n--- NOTIFICATIONS (last 10) ---');
    if (notifications.length === 0) {
      console.log('(No notifications)');
    } else {
      console.table(notifications.map((n) => n.get({ plain: true })));
    }

    console.log('\n');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('Unknown database')) {
      console.error('\nRun first: npm run create-db');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('\nMake sure MySQL server is running.');
    }
    process.exit(1);
  }
}

viewData();
