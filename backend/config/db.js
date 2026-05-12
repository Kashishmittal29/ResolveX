const { Sequelize } = require('sequelize');
const path = require('path');

const dialect = process.env.DB_DIALECT || 'mysql';

let sequelize;

if (dialect === 'sqlite') {
  // SQLite for local development — no MySQL password required
  const storagePath = process.env.DB_STORAGE || path.join(__dirname, '..', 'database', 'resolvex.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  // MySQL for production (Render, TiDB, etc.)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'resolvex',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      // Only use SSL in production (local MySQL usually doesn't have SSL)
      ...(process.env.NODE_ENV === 'production' && {
        dialectOptions: {
          ssl: { rejectUnauthorized: true },
        },
      }),
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database Connected (${dialect})`);
  } catch (error) {
    // Don't log the error message in production as it may contain sensitive info
    console.error(
      `Database connection error: ${process.env.NODE_ENV === 'production' ? 'Contact administrator' : error.message}`
    );
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
