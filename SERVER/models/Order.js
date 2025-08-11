const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true
  }
});

const orderAddressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
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
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    sparse: true // Allow multiple documents without orderId initially
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  itemCount: {
    type: Number,
    required: true
  },
  // Customer information
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  // Shipping address
  shippingAddress: orderAddressSchema,
  // Billing address (same as shipping by default)
  billingAddress: orderAddressSchema,
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'card', 'upi'],
    default: 'cod'
  },
  paymentId: String,
  // Shipping information
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'same-day'],
    default: 'standard'
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  // Order weight information
  orderWeight: {
    type: Number,
    default: 0,
    description: 'Total weight of the order in grams'
  },
  // Tracking information
  trackingNumber: String,
  estimatedDelivery: Date,
  // Order notes
  notes: String,
  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date
}, {
  timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
  // Always generate orderId if it doesn't exist or is empty
  if (!this.orderId || this.orderId.trim() === '') {
    console.log('🔍 No orderId found, generating new one...');
    try {
      this.orderId = await this.constructor.generateNextOrderId();
      console.log('🔍 OrderId generated successfully:', this.orderId);
    } catch (error) {
      console.error('Error generating order ID:', error);
      // Fallback to timestamp-based ID if counting fails
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substr(2, 9).toUpperCase();
      this.orderId = `ORD-${timestamp.slice(-8)}-${random}`;
      console.log('🔍 Using fallback orderId:', this.orderId);
    }
  } else {
    console.log('🔍 OrderId already exists:', this.orderId);
  }
  next();
});

// Post-save hook to ensure orderId is set
orderSchema.post('save', function(doc) {
  console.log('🔍 Order saved with ID:', doc.orderId);
});

// Instance method to update order status
orderSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  
  // Update relevant timestamps
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = new Date();
      break;
    case 'shipped':
      this.shippedAt = new Date();
      break;
    case 'delivered':
      this.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
  }
  
  return this.save();
};

// Static method to get orders by user
orderSchema.statics.getUserOrders = async function(userId) {
  return this.find({ userId })
    .populate('items.productId')
    .sort({ createdAt: -1 });
};

// Static method to get order by order ID
orderSchema.statics.getByOrderId = async function(orderId) {
  console.log('🔍 getByOrderId called with orderId:', orderId);
  
  // Clean the orderId - remove any extra spaces or special characters
  const cleanOrderId = orderId ? orderId.trim() : orderId;
  console.log('🔍 Cleaned orderId:', cleanOrderId);
  
  // First try to find by orderId (exact match)
  let order = await this.findOne({ orderId: cleanOrderId })
    .populate('items.productId')
    .populate('userId', 'name email phone');
  
  console.log('🔍 Order found by orderId:', order ? 'Yes' : 'No');
  
  // If not found by orderId, try to find by MongoDB _id (for backward compatibility)
  if (!order && cleanOrderId && cleanOrderId.length === 24) { // MongoDB ObjectId is 24 characters
    console.log('🔍 Trying to find by MongoDB _id as fallback');
    order = await this.findById(cleanOrderId)
      .populate('items.productId')
      .populate('userId', 'name email phone');
    console.log('🔍 Order found by _id:', order ? 'Yes' : 'No');
  }
  
  // If still not found, try to find by orderId with # prefix (for backward compatibility)
  if (!order && cleanOrderId && !cleanOrderId.startsWith('#')) {
    console.log('🔍 Trying to find by orderId with # prefix (backward compatibility)');
    const orderIdWithHash = `#${cleanOrderId}`;
    order = await this.findOne({ orderId: orderIdWithHash })
      .populate('items.productId')
      .populate('userId', 'name email phone');
    console.log('🔍 Order found by orderId with #:', order ? 'Yes' : 'No');
  }
  
  // If still not found, try to find by orderId without # prefix (for backward compatibility)
  if (!order && cleanOrderId && cleanOrderId.startsWith('#')) {
    console.log('🔍 Trying to find by orderId without # prefix (backward compatibility)');
    const orderIdWithoutHash = cleanOrderId.substring(1);
    order = await this.findOne({ orderId: orderIdWithoutHash })
      .populate('items.productId')
      .populate('userId', 'name email phone');
    console.log('🔍 Order found by orderId without #:', order ? 'Yes' : 'No');
  }
  
  if (order) {
    console.log('🔍 Order ID from database:', order.orderId);
    console.log('🔍 Order user ID:', order.userId?._id || order.userId);
    console.log('🔍 Order status:', order.status);
  } else {
    console.log('🔍 No order found with any method');
  }
  
  return order;
};

// Static method to generate next order ID
orderSchema.statics.generateNextOrderId = async function() {
  try {
    console.log('🔍 Generating next order ID...');
    
    // Find the highest order number from ORD format first
    const lastOrdOrder = await this.findOne({ orderId: { $regex: /^ORD\d+$/ } }, {}, { sort: { 'orderId': -1 } });
    
    let nextNumber = 1;
    if (lastOrdOrder && lastOrdOrder.orderId) {
      console.log('🔍 Last ORD order ID found:', lastOrdOrder.orderId);
      // Extract number from existing orderId (e.g., "ORD00001" -> 1)
      const match = lastOrdOrder.orderId.match(/ORD(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
        console.log('🔍 Next number will be:', nextNumber);
      }
    } else {
      // If no ORD orders found, check for old format orders
      const lastOldOrder = await this.findOne({ orderId: { $regex: /^#\d+$/ } }, {}, { sort: { 'orderId': -1 } });
      if (lastOldOrder && lastOldOrder.orderId) {
        console.log('🔍 Last old format order ID found:', lastOldOrder.orderId);
        // Extract number from old format (e.g., "#000018" -> 18)
        const match = lastOldOrder.orderId.match(/#(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
          console.log('🔍 Next number from old format will be:', nextNumber);
        }
      } else {
        console.log('🔍 No previous orders found, starting with #1');
      }
    }
    
    // Format the order ID with leading zeros (e.g., ORD00001, ORD00002)
    const paddedNumber = nextNumber.toString().padStart(5, '0');
    const newOrderId = `ORD${paddedNumber}`;
    
    console.log('🔍 Generated order ID:', newOrderId);
    return newOrderId;
  } catch (error) {
    console.error('Error generating order ID:', error);
    // Fallback to timestamp-based ID if counting fails
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    const fallbackId = `ORD-${timestamp.slice(-8)}-${random}`;
    console.log('🔍 Using fallback order ID:', fallbackId);
    return fallbackId;
  }
};

module.exports = mongoose.model('Order', orderSchema); 