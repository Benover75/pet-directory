// middlewares/authMiddleware.js
const { jwtSecret } = require('../config/db'); // <-- import secret
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization header provided' });

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization header format' });

    const token = parts[1];
    const decoded = jwt.verify(token, jwtSecret); // <-- use Docker secret
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional middleware: only allow admin users
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
