const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTPService = require('../services/otpService');

// Mock admin users for testing when MongoDB is not available
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

const testAdminUser = {
  _id: 'testadmin123',
  name: 'Test Admin',
  email: 'test@admin.com',
  password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
  role: 'admin',
  phone: '+1 555-123-4567',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'Test Country'
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
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    { expiresIn: '7d' }
  );
};

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    let user;
    try {
      user = await User.findOne({ $or: [{ email }, { phone }] });
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      if (email === mockAdminUser.email || phone === mockAdminUser.phone) {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    if (user) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    // Create new user
    try {
      user = new User({
        name,
        email,
        password,
        phone,
        address,
        role: 'user'
      });

      await user.save();
      console.log('User created successfully');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      user = {
        _id: Date.now().toString(),
        name,
        email,
        phone,
        role: 'user'
      };
    }

    // Generate tokens
    const token = generateToken(user._id, user.email, user.role, user.name, user.phone);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    let user;
    try {
      user = await User.findOne({ email }).select('+password');
    } catch (error) {
      console.log('MongoDB not available, checking mock users');
      if (email === mockAdminUser.email) {
        user = mockAdminUser;
      } else if (email === testAdminUser.email) {
        user = testAdminUser;
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = generateToken(user._id, user.email, user.role, user.name, user.phone);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful',
      token,
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
    
    // Find user
    let user;
    try {
      user = await User.findById(decoded.userId);
    } catch (error) {
      if (decoded.userId === mockAdminUser._id) {
        user = mockAdminUser;
      } else if (decoded.userId === testAdminUser._id) {
        user = testAdminUser;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, user.email, user.role, user.name, user.phone);
    const newRefreshToken = generateRefreshToken(user._id);

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Find user
    let user;
    try {
      user = await User.findById(decoded.userId);
    } catch (error) {
      if (decoded.userId === mockAdminUser._id) {
        user = mockAdminUser;
      } else if (decoded.userId === testAdminUser._id) {
        user = testAdminUser;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      message: 'Token is valid',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      tokenInfo: {
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const result = await OTPService.sendOTP(phone);
    
    if (result.success) {
      res.json({ message: 'OTP sent successfully', sessionId: result.sessionId });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, sessionId } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const result = await OTPService.verifyOTP(phone, otp, sessionId);
    
    if (result.success) {
      // Find or create user with this phone number
      let user;
      try {
        user = await User.findOne({ phone });
        if (!user) {
          user = new User({
            phone,
            name: `User ${phone}`,
            email: `${phone}@uthraa.com`,
            role: 'user',
            verified: true
          });
          await user.save();
        }
      } catch (error) {
        // Mock user for testing
        user = {
          _id: Date.now().toString(),
          phone,
          name: `User ${phone}`,
          role: 'user'
        };
      }

      // Generate token
      const token = generateToken(user._id, user.email || '', user.role, user.name, user.phone);
      
      res.json({
        message: 'OTP verified successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    let user;
    try {
      user = await User.findById(req.user.userId);
    } catch (error) {
      // Use mock user data
      if (req.user.userId === mockAdminUser._id) {
        user = mockAdminUser;
      } else if (req.user.userId === testAdminUser._id) {
        user = testAdminUser;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    let user;
    try {
      user = await User.findByIdAndUpdate(
        req.user.userId,
        { name, email, phone, address },
        { new: true, runValidators: true }
      );
    } catch (error) {
      return res.json({
        message: 'Profile updated successfully (mock)',
        user: { name, email, phone, address }
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
};

module.exports = {
  register,
  login,
  refreshToken,
  verifyToken,
  sendOTP,
  verifyOTP,
  logout,
  getProfile,
  updateProfile
}; 