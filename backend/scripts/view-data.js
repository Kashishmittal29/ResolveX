/**
 * View data in MongoDB database
 * Run: npm run view-data
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User, Complaint, Notification } = require('../models');

async function viewData() {
  try {
    const connStr = process.env.MONGODB_URI || 
                    process.env.MONGO_URI || 
                    'mongodb://atlas-sql-69ac545a7f876f9874ec4caf-4g1lbm.a.query.mongodb.net/campusconnect?ssl=true&authSource=admin';

    await mongoose.connect(connStr);
    console.log('\n=== CampusConnect Database Data (MongoDB) ===\n');

    const users = await User.find().select('name email role department');
    console.log('--- USERS ---');
    if (users.length === 0) {
      console.log('(No users. Run: npm run seed)');
    } else {
      console.table(users.map((u) => u.toObject()));
    }

    const complaints = await Complaint.find().select('complaintId title category status priority createdAt');
    console.log('\n--- COMPLAINTS ---');
    if (complaints.length === 0) {
      console.log('(No complaints. Run: npm run seed)');
    } else {
      console.table(complaints.map((c) => c.toObject()));
    }

    const notifications = await Notification.find().select('type title isRead createdAt').limit(10);
    console.log('\n--- NOTIFICATIONS (last 10) ---');
    if (notifications.length === 0) {
      console.log('(No notifications)');
    } else {
      console.table(notifications.map((n) => n.toObject()));
    }

    console.log('\n');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

viewData();
