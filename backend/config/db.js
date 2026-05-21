const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 
                    process.env.MONGO_URI || 
                    'mongodb://atlas-sql-69ac545a7f876f9874ec4caf-4g1lbm.a.query.mongodb.net/resolvex?ssl=true&authSource=admin';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(connStr);
    console.log(`Database Connected (MongoDB: ${mongoose.connection.host})`);
  } catch (error) {
    console.error(`Database connection error:`, error.message, error);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
