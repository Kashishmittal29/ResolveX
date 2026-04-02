require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const { connectDB, sequelize } = require('./config/db');
const { checkSlaEscalation } = require('./jobs/slaEscalation');

const app = express();
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  require('./models');
  await connectDB();
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`ResolveX API running on port ${PORT}`);
  });
  setInterval(checkSlaEscalation, 15 * 60 * 1000);
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

module.exports = app;
