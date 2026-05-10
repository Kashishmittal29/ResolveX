const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'resolvex',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,           // Maximum connections in pool
      min: 0,            // Minimum connections in pool
      acquire: 30000,    // Max time in ms to get a connection
      idle: 10000,       // Max time in ms for idle connection before release
    },
    // DATABASE SECURITY: Enable SSL for encrypted connections (especially in production)
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: true }
          : { rejectUnauthorized: false }, // Dev uses self-signed certs
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected (with SSL security enabled)');
  } catch (error) {
    // Don't log the error message in production as it may contain sensitive info
    console.error(
      `Database connection error: ${process.env.NODE_ENV === 'production' ? 'Contact administrator' : error.message}`
    );
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
