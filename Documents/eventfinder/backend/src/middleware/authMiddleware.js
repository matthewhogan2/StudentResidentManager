const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authMiddleware(req, res, next) {
  try {
    const cookieName = process.env.COOKIE_NAME || 'jwt';
    const token = req.cookies[cookieName];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user data
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // attach user to request
    next(); // allow access
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
