const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
  this.updatedAt = new Date();
  next();
});

// Static method to get or create cart for user (populated)
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ userId }).populate('items.productId');
  if (!cart) {
    cart = new this({ userId, items: [] });
    await cart.save();
  }
  return cart;
};

// Static method to get or create cart for user (unpopulated - for updates)
cartSchema.statics.getOrCreateCartForUpdate = async function(userId) {
  let cart = await this.findOne({ userId });
  if (!cart) {
    cart = new this({ userId, items: [] });
    await cart.save();
  }
  return cart;
};

// Instance method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, price) {
  const existingItem = this.items.find(item => {
    const itemProductId = item.productId._id || item.productId; // Handle populated case
    return itemProductId.toString() === productId.toString();
  });
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = price; // Update price in case it changed
  } else {
    this.items.push({ productId, quantity, price });
  }
  
  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  // Handle both populated and unpopulated cart items
  const item = this.items.find(item => {
    const itemProductId = item.productId._id || item.productId; // Handle populated case
    return itemProductId.toString() === productId.toString();
  });
  
  if (item) {
    if (quantity <= 0) {
      this.items = this.items.filter(item => {
        const itemProductId = item.productId._id || item.productId; // Handle populated case
        return itemProductId.toString() !== productId.toString();
      });
    } else {
      item.quantity = quantity;
    }
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => {
    const itemProductId = item.productId._id || item.productId; // Handle populated case
    return itemProductId.toString() !== productId.toString();
  });
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  return this.save();
};

// Instance method to get cart with populated products
cartSchema.methods.getPopulatedCart = async function() {
  return this.populate('items.productId');
};

module.exports = mongoose.model('Cart', cartSchema); 