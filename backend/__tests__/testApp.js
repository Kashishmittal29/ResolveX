require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/auth', require('../routes/auth'));
app.use('/api/complaints', require('../routes/complaints'));
app.use('/api/notifications', require('../routes/notifications'));
module.exports = app;
