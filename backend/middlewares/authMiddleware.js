// backend/middlewares/authMiddleware.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// helper untuk ambil token dari header
function getTokenFromHeader(req) {
  const authHeader = req.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim(); // potong "Bearer "
}

const protect = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // verifikasi JWT
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    // ambil user dari DB
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // attach user dan lanjut
    req.user = user;
    next();

  } catch (error) {
    // Token invalid atau expired
    return res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin only' });
  }
  next();
};

module.exports = { protect, adminOnly };
