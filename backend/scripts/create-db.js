/**
 * Creates the resolvex database (no MySQL CLI needed)
 * Run: npm run create-db
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
  const dbName = process.env.DB_NAME || 'resolvex';
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  console.log('Connecting to MySQL (without database)...');
  try {
    const conn = await mysql.createConnection(config);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database '${dbName}' created successfully (or already exists).`);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\nMake sure MySQL server is running.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nCheck DB_USER and DB_PASSWORD in .env');
    }
    process.exit(1);
  }
}

createDatabase();
