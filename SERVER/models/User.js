const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true,
    validate: {
      validator: function(v) {
        // Basic phone validation - can be customized based on country
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Phone verification fields
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationOTP: {
    type: String,
    select: false
  },
  phoneVerificationExpires: {
    type: Date,
    select: false
  },
  // Login method preference
  loginMethod: {
    type: String,
    enum: ['email', 'phone'],
    default: 'email'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP method
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationOTP = otp;
  this.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

// Verify OTP method
userSchema.methods.verifyOTP = function(otp) {
  if (!this.phoneVerificationOTP || !this.phoneVerificationExpires) {
    return false;
  }
  
  if (this.phoneVerificationExpires < new Date()) {
    return false;
  }
  
  return this.phoneVerificationOTP === otp;
};

// Clear OTP after verification
userSchema.methods.clearOTP = function() {
  this.phoneVerificationOTP = undefined;
  this.phoneVerificationExpires = undefined;
};

module.exports = mongoose.model('User', userSchema); 