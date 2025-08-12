const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false, // Made optional for phone-only login
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: false, // Made optional for phone-only login
    unique: true,
    sparse: true, // Allow multiple null values
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty email
        return validator.isEmail(v);
      },
      message: 'Please provide a valid email'
    }
  },
  password: {
    type: String,
    required: false, // Made optional for phone-only login
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
  // Multiple addresses for checkout
  addresses: [{
    label: {
      type: String,
      required: true,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home'
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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
    default: true // Set to true by default since we're bypassing OTP
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
    enum: ['phone'],
    default: 'phone' // Only phone method available
  },
  // Profile completion status
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  // Wishlist functionality
  wishlist: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving (only if password exists)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method (handle cases where password might not exist)
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 