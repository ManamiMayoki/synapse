const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'synapse_academic_cse_jwt_secret_key_2026_super_secure'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        // Fallback for mock demo tokens in dev mode
        req.user = {
          id: decoded.id || 'usr_demo',
          name: decoded.name || 'Academic User',
          email: decoded.email || 'user@synapse.edu',
          role: decoded.role || 'student',
          studentId: decoded.studentId || '364',
          batch: decoded.batch || '32',
        };
        return next();
      }

      req.user = user;
      return next();
    } catch (error) {
      console.warn('[Auth Middleware] Invalid token:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Token verification failed. Please sign in again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'No authorization token provided in Bearer header.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Role [${req.user.role}] is not permitted to perform this administrative action. Required: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
