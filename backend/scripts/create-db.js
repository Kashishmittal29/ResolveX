/**
 * Verifies and initializes the CampusConnect MongoDB connection
 * Run: npm run create-db
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function verifyDatabase() {
  const connStr = process.env.MONGODB_URI || 
                  process.env.MONGO_URI || 
                  'mongodb://atlas-sql-69ac545a7f876f9874ec4caf-4g1lbm.a.query.mongodb.net/campusconnect?ssl=true&authSource=admin';

  console.log('Connecting to MongoDB...');
  try {
    const conn = await mongoose.connect(connStr);
    console.log(`Database connected successfully to: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
}

verifyDatabase();
