const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!connStr) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    console.error('   Please add MONGODB_URI to your environment variables.');
    process.exit(1);
  }

  try {
    // Log the host only (not credentials) for security
    const maskedUri = connStr.replace(/:([^@]+)@/, ':****@');
    console.log(`Connecting to MongoDB: ${maskedUri}`);

    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000, // Fail fast after 10 seconds
    });

    console.log(`✅ Database Connected (Host: ${mongoose.connection.host})`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
