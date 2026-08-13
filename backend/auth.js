const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mentor-management-dev-secret';


// ==========================================
// PASSWORD HASH
// ==========================================

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}


// ==========================================
// PASSWORD VERIFY
// ==========================================

function verifyPassword(password, passwordHash) {
  return hashPassword(password) === passwordHash;
}


// ==========================================
// CREATE JWT TOKEN
// ==========================================

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET);
}


// ==========================================
// VERIFY JWT TOKEN
// ==========================================

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format'
      });
    }

    const token = parts[1];

    const decoded = verifyToken(token);

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}


// ==========================================
// ROLE AUTHORIZATION
// ==========================================

function allowRoles(...roles) {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  };
}


module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  requireAuth,
  allowRoles
};