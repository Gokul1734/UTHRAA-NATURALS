const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTPService = require('../services/otpService');
const { protect } = require('../middleware/auth');

// Mock admin user for testing when MongoDB is not available
const mockAdminUser = {
  _id: 'admin123',
  name: 'Admin User',
  email: 'admin@uthraa.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
  role: 'admin',
  phone: '+91 98765 43210',
  address: {
    street: '123 Admin Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India'
  },
  createdAt: new Date()
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    let user;
    try {
      user = await User.findOne({ $or: [{ email }, { phone }] });
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      // If MongoDB is not available, check against mock user
      if (email === mockAdminUser.email || phone === mockAdminUser.phone) {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    if (user) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    try {
      user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'user'
      });

      await user.save();
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      // If MongoDB is not available, return success response
      user = {
        _id: Date.now().toString(),
        name,
        email,
        phone,
        role: 'user'
      };
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user (email/password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    let user;
    try {
      user = await User.findOne({ email });
    } catch (error) {
      console.log('MongoDB not available, checking mock admin user');
      // If MongoDB is not available, check against mock admin user
      if (email === mockAdminUser.email) {
        user = mockAdminUser;
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for phone login
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Find user by phone number
    let user;
    try {
      user = await User.findOne({ phone });
    } catch (error) {
      console.log('MongoDB not available, checking mock admin user');
      if (phone === mockAdminUser.phone) {
        user = mockAdminUser;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found with this phone number' });
    }

    // Generate OTP
    const otp = OTPService.generateOTP();

    try {
      // Save OTP to user document
      user.phoneVerificationOTP = otp;
      user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
    } catch (error) {
      console.log('MongoDB not available, using mock OTP');
      // For mock data, we'll just log the OTP
      console.log(`Mock OTP for ${phone}: ${otp}`);
    }

    // Send OTP via SMS
    try {
      await OTPService.sendOTP(phone, otp);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    res.json({
      message: 'OTP sent successfully',
      phone: phone.replace(/\d(?=\d{4})/g, '*') // Mask phone number
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and login
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Find user by phone number
    let user;
    try {
      user = await User.findOne({ phone }).select('+phoneVerificationOTP +phoneVerificationExpires');
    } catch (error) {
      console.log('MongoDB not available, checking mock admin user');
      if (phone === mockAdminUser.phone) {
        user = mockAdminUser;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP
    let isValidOTP = false;
    try {
      isValidOTP = user.verifyOTP(otp);
    } catch (error) {
      console.log('MongoDB not available, using mock verification');
      // For mock data, accept any 6-digit OTP
      isValidOTP = /^\d{6}$/.test(otp);
    }

    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    try {
      user.clearOTP();
      user.isPhoneVerified = true;
      await user.save();
    } catch (error) {
      console.log('MongoDB not available, skipping OTP clear');
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      message: 'Phone verification successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: true
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Find user by phone number
    let user;
    try {
      user = await User.findOne({ phone });
    } catch (error) {
      console.log('MongoDB not available, checking mock admin user');
      if (phone === mockAdminUser.phone) {
        user = mockAdminUser;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found with this phone number' });
    }

    // Generate new OTP
    const otp = OTPService.generateOTP();

    try {
      // Save new OTP to user document
      user.phoneVerificationOTP = otp;
      user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
    } catch (error) {
      console.log('MongoDB not available, using mock OTP');
      console.log(`Mock OTP for ${phone}: ${otp}`);
    }

    // Send new OTP via SMS
    try {
      await OTPService.sendOTP(phone, otp);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    res.json({
      message: 'OTP resent successfully',
      phone: phone.replace(/\d(?=\d{4})/g, '*') // Mask phone number
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (protected route)
router.get('/profile', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    let user;
    try {
      user = await User.findById(req.user._id);
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      return res.json({
        message: 'Profile updated successfully (mock)',
        user: { ...req.user, name, email, phone, address }
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router; 