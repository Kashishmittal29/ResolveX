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
    const maskedUri = connStr.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`Connecting to MongoDB: ${maskedUri}`);

    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000, // Fail fast after 10 seconds
    });

    console.log(`✅ Database Connected (Host: ${mongoose.connection.host})`);

    // Automatically drop legacy duplicate unique index if it exists on complaints collection
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections({ name: 'complaints' }).toArray();
      if (collections.length > 0) {
        const complaintsCollection = db.collection('complaints');
        const indexes = await complaintsCollection.indexes();
        const hasLegacyIndex = indexes.some(idx => idx.name === 'referenceId_1');
        if (hasLegacyIndex) {
          console.log('🧹 Found legacy index "referenceId_1" on complaints collection. Dropping it...');
          await complaintsCollection.dropIndex('referenceId_1');
          console.log('✅ Legacy index "referenceId_1" successfully dropped!');
        }
      }
    } catch (indexError) {
      console.warn('⚠️  Could not check or drop legacy complaints index:', indexError.message);
    }
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
