/**
 * SANITIZATION MIDDLEWARE
 * =======================
 * Prevents NoSQL/MongoDB injection-style attacks by stripping $ and . from object keys.
 * While ResolveX uses MySQL + Sequelize (not MongoDB), this pattern is good practice
 * to prevent any potential injection through nested object keys.
 * 
 * Example:
 * - Input: { "$where": "...", "user.role": "admin" }
 * - Output: { "where": "...", "userrole": "admin" }
 */

const sanitize = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Remove $ and . from keys (prevents injection patterns)
      const cleanKey = key.replace(/[\$\.]/g, '');
      sanitized[cleanKey] = sanitize(obj[key]);
    }
  }
  return sanitized;
};

/**
 * Express middleware that sanitizes req.body, req.query, req.params
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = sanitizeMiddleware;
