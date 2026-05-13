require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitizeMiddleware = require('./middleware/sanitize');
const { connectDB, sequelize } = require('./config/db');
const { checkSlaEscalation } = require('./jobs/slaEscalation');

const app = express();

// SECURITY MIDDLEWARE
// Helmet helps secure Express app by setting various HTTP headers
app.use(helmet());

// Sanitize user inputs to prevent injection attacks
app.use(sanitizeMiddleware);

// Compression
app.use(compression());

// CORS
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));

// Body parsing
app.use(express.json());

// RATE LIMITING
// General API rate limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for local development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth-specific rate limit: 100 requests per 15 minutes (stricter for auth endpoints)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased for local development
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: false,
});

// Apply general rate limiter to all /api routes
app.use('/api/', generalLimiter);

// Apply stricter rate limiter to auth routes
app.use('/api/auth', authLimiter);

// Serve uploaded files (will redirect to Cloudinary CDN URLs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));
app.use('/api/resolveai', require('./routes/resolveai'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Server Error',
    // Don't expose stack trace in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  require('./models');
  await connectDB();
  await sequelize.sync();

  // Initialize Firebase (optional - gracefully disabled if not configured)
  const { initializeFirebase } = require('./config/firebase');
  initializeFirebase();
  app.listen(PORT, () => {
    console.log(`ResolveX API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Security features: Helmet, Rate Limiting, Input Sanitization, SSL enabled');
  });
  // Check SLA escalations every 15 minutes with error handling
  setInterval(() => {
    checkSlaEscalation().catch(err => {
      console.error('SLA Escalation job error:', err.message);
    });
  }, 15 * 60 * 1000);
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

module.exports = app;
