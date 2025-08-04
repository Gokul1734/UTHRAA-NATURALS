const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock admin users for testing when MongoDB is not available
const mockAdminUser = {
  _id: 'admin123',
  name: 'Admin User',
  email: 'admin@uthraa.com',
  role: 'admin',
  phone: '+91 1234567890'
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

      // Get user from database
      let user;
      try {
        user = await User.findById(decoded.userId).select('-password');
      } catch (error) {
        console.log('MongoDB not available, checking mock users');
        if (decoded.userId === mockAdminUser._id) {
          user = mockAdminUser;
        }
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found in database' });
      }

      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Check if user exists in database
const checkUserExists = async (req, res, next) => {
  try {
    const { userId } = req.user;
    
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      console.log('MongoDB not available, checking mock users');
      if (userId === mockAdminUser._id) {
        user = mockAdminUser;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found in database' });
    }

    req.userData = user;
    next();
  } catch (error) {
    console.error('Check user exists error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, admin, checkUserExists }; 