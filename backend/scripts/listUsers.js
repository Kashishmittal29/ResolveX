require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models');

async function list() {
  try {
    const connStr = process.env.MONGODB_URI || 
                    process.env.MONGO_URI || 
                    'mongodb://atlas-sql-69ac545a7f876f9874ec4caf-4g1lbm.a.query.mongodb.net/campusconnect?ssl=true&authSource=admin';

    await mongoose.connect(connStr);
    console.log('Connected to MongoDB');

    const users = await User.find({}).select('name email role department');
    console.log('Current users in DB:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Failed to list users:', error);
    process.exit(1);
  }
}

list();
