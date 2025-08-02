const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Mock orders for testing when MongoDB is not available
const mockOrders = [
  {
    _id: 'order1',
    user: 'user1',
    items: [
      {
        product: 'product1',
        quantity: 2,
        price: 299,
        name: 'Organic Turmeric Powder'
      }
    ],
    totalAmount: 598,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: {
      name: 'John Doe',
      phone: '+91 9876543210',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    orderDate: new Date('2024-01-15'),
    deliveryDate: new Date('2024-01-18')
  },
  {
    _id: 'order2',
    user: 'user2',
    items: [
      {
        product: 'product2',
        quantity: 1,
        price: 599,
        name: 'Ayurvedic Hair Oil'
      }
    ],
    totalAmount: 599,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: {
      name: 'Jane Smith',
      phone: '+91 9876543211',
      street: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    orderDate: new Date('2024-01-20')
  }
];

// Create new order
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'cod',
      notes
    } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate and calculate order items
    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: 'Invalid item data' });
      }

      let product;
      try {
        product = await Product.findById(item.product);
      } catch (error) {
        console.log('MongoDB not available, using mock data');
        product = { _id: item.product, name: 'Mock Product', price: item.price || 100, stock: 50 };
      }

      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal
      });

      // Update product stock
      try {
        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { stock: -item.quantity } }
        );
      } catch (error) {
        console.log('MongoDB not available, skipping stock update');
      }
    }

    const orderData = {
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      status: 'pending',
      notes,
      orderDate: new Date()
    };

    let order;
    
    try {
      order = new Order(orderData);
      await order.save();
      
      // Populate user and product details
      order = await Order.findById(order._id)
        .populate('user', 'name email phone')
        .populate('items.product', 'name images');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      order = {
        _id: Date.now().toString(),
        ...orderData,
        createdAt: new Date()
      };
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    let orders, total;
    
    try {
      orders = await Order.find(query)
        .populate('items.product', 'name images')
        .sort({ orderDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      total = await Order.countDocuments(query);
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      orders = mockOrders.filter(order => order.user === userId);
      total = orders.length;
    }

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let order;
    
    try {
      const query = userRole === 'admin' ? { _id: id } : { _id: id, user: userId };
      
      order = await Order.findOne(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name images description');
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      order = mockOrders.find(o => o._id === id);
      
      if (userRole !== 'admin' && order && order.user !== userId) {
        order = null;
      }
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const updateData = { status };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (status === 'delivered') {
      updateData.deliveryDate = new Date();
    }

    let order;
    
    try {
      order = await Order.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('user', 'name email phone');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      order = { _id: id, ...updateData, updatedAt: new Date() };
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let order;
    
    try {
      const query = userRole === 'admin' ? { _id: id } : { _id: id, user: userId };
      order = await Order.findOne(query);
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      order = mockOrders.find(o => o._id === id);
      
      if (userRole !== 'admin' && order && order.user !== userId) {
        order = null;
      }
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    try {
      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }

      // Update order status
      order = await Order.findByIdAndUpdate(
        id,
        { status: 'cancelled', cancelledAt: new Date() },
        { new: true }
      );
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      order = { ...order, status: 'cancelled', cancelledAt: new Date() };
    }

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus,
      dateFrom,
      dateTo,
      search
    } = req.query;

    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by payment status
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      query.orderDate = {};
      if (dateFrom) query.orderDate.$gte = new Date(dateFrom);
      if (dateTo) query.orderDate.$lte = new Date(dateTo);
    }

    let orders, total;
    
    try {
      let dbQuery = Order.find(query)
        .populate('user', 'name email phone')
        .populate('items.product', 'name')
        .sort({ orderDate: -1 });

      // Search functionality
      if (search) {
        dbQuery = dbQuery.find({
          $or: [
            { 'shippingAddress.name': { $regex: search, $options: 'i' } },
            { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
          ]
        });
      }

      orders = await dbQuery
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      total = await Order.countDocuments(query);
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      orders = mockOrders.filter(order => {
        if (status && order.status !== status) return false;
        if (paymentStatus && order.paymentStatus !== paymentStatus) return false;
        if (search) {
          return order.shippingAddress.name.toLowerCase().includes(search.toLowerCase()) ||
                 order.shippingAddress.phone.includes(search);
        }
        return true;
      });
      total = orders.length;
    }

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order statistics (Admin only)
const getOrderStats = async (req, res) => {
  try {
    let stats;
    
    try {
      const [
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.aggregate([
          { $match: { status: 'delivered' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      stats = {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      };
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      stats = {
        totalOrders: 150,
        pendingOrders: 25,
        deliveredOrders: 100,
        cancelledOrders: 25,
        totalRevenue: 89750
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Track order
const trackOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    let order;
    
    try {
      order = await Order.findOne({ trackingNumber })
        .populate('items.product', 'name images')
        .select('status trackingNumber orderDate deliveryDate shippingAddress items');
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      order = mockOrders.find(o => o.trackingNumber === trackingNumber);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found with this tracking number' });
    }

    res.json(order);
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  trackOrder
}; 