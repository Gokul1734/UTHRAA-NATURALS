const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock admin users for testing when MongoDB is not available
const mockAdminUser = {
  _id: 'admin123',
  name: 'Admin User',
  email: 'admin@uthraa.com',
  phone: '+91 1234567890',
  role: 'admin',
  address: {
    street: '123 Admin Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India'
  },
  createdAt: new Date()
};

// Generate JWT Token
const generateToken = (userId, email, role, name, phone) => {
  const tokenPayload = {
    userId,
    email,
    role,
    name,
    phone,
    loginTime: new Date().toISOString()
  };

  return jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'fallback-secret',
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d',
      issuer: 'uthraa-naturals',
      audience: 'uthraa-users'
    }
  );
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    { expiresIn: '7d' }
  );
};

// Phone login - Main authentication method
const phoneLogin = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Ensure phone is a string and clean it
    const phoneString = String(phone);
    const cleanPhone = phoneString.replace(/\D/g, '');
    
    // Validate phone number length
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    }
    
    // Special handling for admin phone number
    if (cleanPhone === '1234567890') {
      const adminUser = {
        _id: 'admin123',
        name: 'Admin User',
        email: 'admin@uthraa.com',
        phone: '+91 1234567890',
        role: 'admin',
        address: {
          street: '123 Admin Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        createdAt: new Date()
      };

      const token = generateToken(adminUser._id, adminUser.email, adminUser.role, adminUser.name, adminUser.phone);
      const refreshToken = generateRefreshToken(adminUser._id);

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        message: 'Admin login successful',
        token,
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone,
          role: adminUser.role,
          address: adminUser.address
        },
        redirectTo: '/admin'
      });
    }

    // For regular users, find or create user
    let user;
    try {
      user = await User.findOne({ phone: `+91${cleanPhone}` });
      
      if (!user) {
        // Create new user with minimal info
        user = new User({
          phone: `+91${cleanPhone}`,
          name: `User ${cleanPhone}`,
          email: `${cleanPhone}@uthraa.com`,
          password: 'temp-password-' + Date.now(), // Temporary password
          role: 'user',
          isPhoneVerified: true, // Mark as verified since we're bypassing OTP
          isProfileComplete: false // Mark as incomplete for profile completion
        });
        await user.save();
        console.log('New user created and saved to database:', user._id);
      } else {
        console.log('Existing user found:', user._id);
      }
    } catch (error) {
      console.log('MongoDB not available, using mock user');
      // Create mock user for testing
      user = {
        _id: Date.now().toString(),
        phone: `+91${cleanPhone}`,
        name: `User ${cleanPhone}`,
        email: `${cleanPhone}@uthraa.com`,
        role: 'user',
        address: {}
      };
    }

    // Generate tokens
    const token = generateToken(user._id, user.email || '', user.role, user.name, user.phone);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Phone login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        role: user.role,
        address: user.address || {},
        isProfileComplete: user.isProfileComplete || false
      },
      redirectTo: '/'
    });
  } catch (error) {
    console.error('Phone login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
    const newToken = generateToken(decoded.userId);

    res.json({ token: newToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, address } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    
    // Mark profile as complete if name is provided
    if (name && !user.isProfileComplete) {
      user.isProfileComplete = true;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  phoneLogin,
  refreshToken,
  verifyToken,
  logout,
  getProfile,
  updateProfile
}; 