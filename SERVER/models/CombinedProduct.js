const mongoose = require('mongoose');

const combinedProductItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const combinedProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  products: [combinedProductItemSchema],
  combinedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  savings: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for active products
combinedProductSchema.index({ isActive: 1 });
combinedProductSchema.index({ category: 1 });

// Pre-save hook to generate SKU if not provided
combinedProductSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    this.sku = `COMBO-${timestamp.slice(-8)}-${random}`;
  }
  next();
});

module.exports = mongoose.model('CombinedProduct', combinedProductSchema); 