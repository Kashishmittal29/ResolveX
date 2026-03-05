/**
 * ==========================================
 * Database Configuration - MySQL + Sequelize
 * ==========================================
 */

import { Sequelize } from 'sequelize';

// Database configuration
// Update these values with your MySQL credentials
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'resolvex_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  // Pool configuration for better performance
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // Model settings
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: false
  }
});

// Test database connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connection authenticated'))
  .catch(err => console.error('❌ Database connection error:', err));

export { sequelize };

