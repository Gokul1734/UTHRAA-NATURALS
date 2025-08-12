const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's addresses
const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.user;
    // console.log('🔍 User ID:', userId);
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      addresses: user.addresses || []
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, message: 'Failed to get addresses' });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { label, street, city, state, zipCode, country = 'India', isDefault = false } = req.body;
    
    if (!label || !street || !city || !state || !zipCode) {
      return res.status(400).json({ success: false, message: 'All address fields are required' });
    }
    
    // Create the new address object
    const newAddress = {
      label,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: false, // Will be set properly below
      createdAt: new Date()
    };
    
    // Use atomic operations to prevent version conflicts
    let updateOperation;
    
    // First, check if this is the first address
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.addresses.length === 0 && isDefault) {
      // First address and user wants it as default
      newAddress.isDefault = true;
      updateOperation = {
        $push: { addresses: newAddress }
      };
    } else if (isDefault) {
      // Setting as default - unset others and add new one
      newAddress.isDefault = true;
      updateOperation = {
        $set: { 'addresses.$[].isDefault': false },
        $push: { addresses: newAddress }
      };
    } else {
      // Regular address - just add it
      updateOperation = {
        $push: { addresses: newAddress }
      };
    }
    
    // Use findOneAndUpdate for atomic operation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateOperation,
      { 
        new: true, 
        runValidators: true,
        upsert: false
      }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get the newly added address (it will be the last one)
    const addedAddress = updatedUser.addresses[updatedUser.addresses.length - 1];
    
    res.json({
      success: true,
      message: 'Address added successfully',
      address: addedAddress
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: 'Failed to add address' });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { addressId } = req.params;
    const { label, street, city, state, zipCode, country, isDefault } = req.body;
    
    // Build update object for the specific address
    const updateFields = {};
    if (label) updateFields['addresses.$.label'] = label;
    if (street) updateFields['addresses.$.street'] = street;
    if (city) updateFields['addresses.$.city'] = city;
    if (state) updateFields['addresses.$.state'] = state;
    if (zipCode) updateFields['addresses.$.zipCode'] = zipCode;
    if (country) updateFields['addresses.$.country'] = country;
    
    let updateOperation = {};
    
    if (Object.keys(updateFields).length > 0) {
      updateOperation.$set = updateFields;
    }
    
    // Handle default address setting
    if (isDefault !== undefined) {
      if (isDefault) {
        // First unset all defaults, then set this one as default
        updateOperation.$set = {
          ...updateOperation.$set,
          'addresses.$[].isDefault': false,
          'addresses.$.isDefault': true
        };
      } else {
        updateOperation.$set = {
          ...updateOperation.$set,
          'addresses.$.isDefault': false
        };
      }
    }
    
    // Use findOneAndUpdate for atomic operation
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: userId, 
        'addresses._id': addressId 
      },
      updateOperation,
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User or address not found' });
    }
    
    // Find the updated address
    const updatedAddress = updatedUser.addresses.find(addr => addr._id.toString() === addressId);
    
    res.json({
      success: true,
      message: 'Address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { addressId } = req.params;
    
    // First, get the user to check if the address exists and if it's default
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const addressToDelete = user.addresses.find(addr => addr._id.toString() === addressId);
    if (!addressToDelete) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    
    const isDefaultAddress = addressToDelete.isDefault;
    const remainingAddressesCount = user.addresses.length - 1;
    
    // Use atomic operation to remove the address
    let updateOperation = {
      $pull: { addresses: { _id: addressId } }
    };
    
    // If deleting default address and there are other addresses, make the first one default
    if (isDefaultAddress && remainingAddressesCount > 0) {
      // We need to handle this in two steps since we can't easily set a specific address as default in one operation
      // First remove the address
      await User.findByIdAndUpdate(userId, updateOperation);
      
      // Then set the first remaining address as default
      const updatedUser = await User.findById(userId);
      if (updatedUser && updatedUser.addresses.length > 0) {
        await User.findByIdAndUpdate(
          userId,
          { $set: { 'addresses.0.isDefault': true } }
        );
      }
    } else {
      // Just remove the address
      await User.findByIdAndUpdate(userId, updateOperation);
    }
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

// Create order
const createOrder = async (req, res) => {
  console.log('🔍 Creating order with data:', req.body);
  const { userId } = req.user;
  const { 
    type = 'cart', 
    productId, 
    quantity = 1, 
    selectedAddressId, 
    customerInfo, 
    paymentMethod = 'cod',
    shippingMethod = 'standard',
    notes,
    orderWeight = 0 // Extract orderWeight from request body
  } = req.body;
  try {
    
    console.log('🔍 User ID:', userId);
    console.log('🔍 Selected Address ID:', selectedAddressId);
    console.log('🔍 Customer Info:', customerInfo);
    console.log('🔍 Order type:', type);
    console.log('🔍 Items:', req.body.items);
    
    if (!selectedAddressId || !customerInfo) {
      return res.status(400).json({ success: false, message: 'Address and customer info are required' });
    }
    
    // Validate customer info fields
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer name, email, and phone are required' 
      });
    }
    
    // Get user and selected address
    const user = await User.findById(userId);
    console.log('🔍 Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Handle both string and ObjectId address IDs
    const selectedAddress = user.addresses.find(addr => {
      const addrId = addr._id?.toString() || addr._id;
      return addrId === selectedAddressId;
    });
    console.log('🔍 Selected address:', selectedAddress ? 'Found' : 'Not found');
    
    if (!selectedAddress) {
      return res.status(400).json({ success: false, message: 'Selected address not found' });
    }
    
    let orderItems = [];
    let totalAmount = 0;
    let itemCount = 0;
    
    if (type === 'buy-now') {
      // Single product purchase
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required for buy now' });
      }
      
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      
      // Check stock availability
      if (product.stock < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}` 
        });
      }
      
      const itemTotal = product.price * quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        total: itemTotal
      });
      
      totalAmount = itemTotal;
      itemCount = quantity;
    } else {
      // Cart purchase - use items sent from frontend
      if (!req.body.items || req.body.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart items are required' });
      }
      
      // Validate stock for all items
      for (const item of req.body.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ 
            success: false, 
            message: `Product not found: ${item.name}` 
          });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }
      }
      
      orderItems = req.body.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }));
      
      // Use total amount from frontend if provided, otherwise calculate
      totalAmount = req.body.totalAmount || orderItems.reduce((sum, item) => sum + item.total, 0);
      itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // Calculate shipping cost
    let shippingCost = 0;
    switch (shippingMethod) {
      case 'express':
        shippingCost = 100;
        break;
      case 'same-day':
        shippingCost = 200;
        break;
      default:
        shippingCost = 0; // Free standard shipping
    }
    
    totalAmount += shippingCost;
    
    // Generate order ID
    console.log('🔍 Generating order ID...');
    const orderId = await Order.generateNextOrderId();
    console.log('🔍 Generated order ID:', orderId);
    
    console.log('🔍 Order weight from frontend:', orderWeight, 'grams');
    
    // Create order
    console.log('🔍 Creating order object...');
    const order = new Order({
      orderId, // Explicitly set the orderId
      userId,
      items: orderItems,
      totalAmount,
      itemCount,
      customerInfo,
      shippingAddress: selectedAddress,
      billingAddress: selectedAddress, // Same as shipping for now
      paymentMethod,
      shippingMethod,
      shippingCost,
      orderWeight, // Use the weight from frontend
      notes
    });
    
    console.log('🔍 Order object created, saving to database...');
    await order.save();
    console.log('🔍 Order saved successfully with ID:', order.orderId);
    
    // Reduce stock for all ordered items
    console.log('🔍 Reducing stock for ordered items...');
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
        console.log(`🔍 Reduced stock for ${product.name}: ${item.quantity} units`);
      }
    }
    
    console.log('🔍 Sending order response:', {
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      status: order.status,
      orderDate: order.orderDate
    });
    
    res.json({
      success: true,
      message: 'Order created successfully',
      order: order // Return the complete order object
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // console.log('🔍 getUserOrders called for userId:', userId);
    
    const orders = await Order.getUserOrders(userId);
    
    // console.log('🔍 Found orders:', orders.length);
    // orders.forEach((order, index) => {
    //   console.log(`🔍 Order ${index + 1}:`, {
    //     _id: order._id,
    //     orderId: order.orderId,
    //     status: order.status
    //   });
      
      // Check if order has orderId, if not, generate one
    //   if (!order.orderId) {
    //     console.log(`🔍 Order ${index + 1} missing orderId, will need to fix`);
    //   }
    // });
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to get orders' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    
    console.log('🔍 getOrderById called with orderId:', orderId);
    console.log('🔍 User ID:', userId);
    
    const order = await Order.getByOrderId(orderId);
    
    console.log('🔍 Order found:', order ? 'Yes' : 'No');
    
    if (!order) {
      console.log('🔍 Order not found for orderId:', orderId);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if order belongs to user - convert both to strings for comparison
    const orderUserId = order.userId._id?.toString() || order.userId.toString();
    const currentUserId = userId?.toString();
    
    console.log('🔍 Order user ID:', orderUserId);
    console.log('🔍 Current user ID:', currentUserId);
    console.log('🔍 IDs match:', orderUserId === currentUserId);
    
    if (orderUserId !== currentUserId) {
      console.log('🔍 Access denied - order does not belong to user');
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    console.log('🔍 Sending order response');
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to get order' });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to get orders' });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;
    
    console.log('🔍 updateOrderStatus called with orderId:', orderId);
    
    const order = await Order.getByOrderId(orderId);
    
    if (!order) {
      console.log('🔍 Order not found for orderId:', orderId);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    console.log('🔍 Order found, updating status to:', status);
    
    // Store previous status for stock restoration
    const previousStatus = order.status;
    
    // Update order status
    await order.updateStatus(status);
    
    // Handle stock restoration for cancelled orders
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      console.log('🔍 Order cancelled, restoring stock...');
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
          console.log(`🔍 Restored stock for ${product.name}: ${item.quantity} units`);
        }
      }
    }
    
    // Update tracking information if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }
    
    await order.save();
    
    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`order-${order.orderId}`).emit('order-status-updated', {
        orderId: order.orderId,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        updatedAt: new Date()
      });
      console.log(`📦 Emitted order status update for order ${order.orderId}: ${status}`);
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
};

// Get order statistics (Admin only)
const getOrderStats = async (req, res) => {
  try {
    const [totalOrders, pendingOrders, confirmedOrders, shippedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' })
    ]);
    
    const stats = {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders
    };
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get order statistics' });
  }
};

// Download invoice
const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;
    
    const order = await Order.getByOrderId(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if order belongs to user
    const orderUserId = order.userId._id?.toString() || order.userId.toString();
    const currentUserId = userId?.toString();
    
    if (orderUserId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // For now, return order details as JSON
    // In a real implementation, you would generate a PDF invoice
    res.json({
      success: true,
      message: 'Invoice download feature coming soon',
      order: {
        orderId: order.orderId,
        orderDate: order.orderDate,
        customerInfo: order.customerInfo,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to download invoice' });
  }
};

// Fix existing orders without orderId
const fixExistingOrders = async (req, res) => {
  try {
    console.log('🔍 Fixing existing orders without orderId...');
    
    // Find all orders without orderId
    const ordersWithoutOrderId = await Order.find({ orderId: { $exists: false } });
    console.log('🔍 Found orders without orderId:', ordersWithoutOrderId.length);
    
    for (let i = 0; i < ordersWithoutOrderId.length; i++) {
      const order = ordersWithoutOrderId[i];
      const newOrderId = await Order.generateNextOrderId();
      
      console.log(`🔍 Fixing order ${order._id} with new orderId: ${newOrderId}`);
      
      order.orderId = newOrderId;
      await order.save();
    }
    
    console.log('🔍 All orders fixed successfully');
    
    res.json({
      success: true,
      message: `Fixed ${ordersWithoutOrderId.length} orders`,
      fixedCount: ordersWithoutOrderId.length
    });
  } catch (error) {
    console.error('Fix existing orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fix orders' });
  }
};

// List all orders (for debugging)
const listAllOrders = async (req, res) => {
  try {
    console.log('🔍 Listing all orders in database...');
    
    const allOrders = await Order.find({}).select('_id orderId userId status createdAt');
    
    console.log('🔍 Total orders in database:', allOrders.length);
    allOrders.forEach((order, index) => {
      console.log(`🔍 Order ${index + 1}:`, {
        _id: order._id,
        orderId: order.orderId || 'MISSING',
        userId: order.userId,
        status: order.status,
        createdAt: order.createdAt
      });
    });
    
    res.json({
      success: true,
      totalOrders: allOrders.length,
      orders: allOrders
    });
  } catch (error) {
    console.error('List all orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to list orders' });
  }
};

// Test orderId generation
const testOrderIdGeneration = async (req, res) => {
  try {
    console.log('🔍 Testing orderId generation...');
    
    const testOrderId = await Order.generateNextOrderId();
    console.log('🔍 Generated test orderId:', testOrderId);
    
    res.json({
      success: true,
      testOrderId: testOrderId
    });
  } catch (error) {
    console.error('Test orderId generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to test orderId generation' });
  }
};

// Get orders grouped by pincode (Admin only)
const getOrdersByPincode = async (req, res) => {
  try {
    const { pincode } = req.query;
    
    let query = {};
    if (pincode) {
      query['shippingAddress.zipCode'] = pincode;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 });
    
    // Group by pincode
    const groupedOrders = {};
    orders.forEach(order => {
      const pincode = order.shippingAddress.zipCode;
      if (!groupedOrders[pincode]) {
        groupedOrders[pincode] = [];
      }
      groupedOrders[pincode].push(order);
    });
    
    res.json({
      success: true,
      groupedOrders: groupedOrders,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('Get orders by pincode error:', error);
    res.status(500).json({ success: false, message: 'Failed to get orders by pincode' });
  }
};

// Get orders grouped by weight category (Admin only)
const getOrdersByWeight = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name images weight')
      .sort({ createdAt: -1 });
    
    // Calculate weight and group by category
    const groupedOrders = {
      light: [],
      medium: [],
      heavy: []
    };
    
    orders.forEach(order => {
      // Use stored orderWeight if available, otherwise calculate from product data
      const totalWeight = order.orderWeight || order.items.reduce((total, item) => {
        const productWeight = item.productId?.weight || 0;
        return total + (productWeight * item.quantity);
      }, 0);
      
      let category = 'light';
      if (totalWeight >= 5000) {
        category = 'heavy';
      } else if (totalWeight >= 1000) {
        category = 'medium';
      }
      
      groupedOrders[category].push({
        ...order.toObject(),
        totalWeight,
        weightCategory: category
      });
    });
    
    res.json({
      success: true,
      groupedOrders: groupedOrders,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('Get orders by weight error:', error);
    res.status(500).json({ success: false, message: 'Failed to get orders by weight' });
  }
};

// Bulk update order status (Admin only)
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status, trackingNumber, estimatedDelivery } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Order IDs array is required' });
    }
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    console.log('🔍 Bulk update order status called with orderIds:', orderIds);
    console.log('🔍 New status:', status);
    
    const io = req.app.get('io');
    
    const updatePromises = orderIds.map(async (orderId) => {
      const order = await Order.getByOrderId(orderId);
      if (order) {
        console.log(`🔍 Updating order ${order.orderId} to status: ${status}`);
        
        // Store previous status for stock restoration
        const previousStatus = order.status;
        
        await order.updateStatus(status);
        if (trackingNumber) {
          order.trackingNumber = trackingNumber;
        }
        if (estimatedDelivery) {
          order.estimatedDelivery = new Date(estimatedDelivery);
        }
        await order.save();
        
        // Handle stock restoration for cancelled orders
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
          console.log(`🔍 Order ${order.orderId} cancelled, restoring stock...`);
          for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (product) {
              product.stock += item.quantity;
              await product.save();
              console.log(`🔍 Restored stock for ${product.name}: ${item.quantity} units`);
            }
          }
        }
        
        // Emit Socket.IO event for real-time updates
        if (io) {
          io.to(`order-${order.orderId}`).emit('order-status-updated', {
            orderId: order.orderId,
            status: order.status,
            trackingNumber: order.trackingNumber,
            estimatedDelivery: order.estimatedDelivery,
            updatedAt: new Date()
          });
          console.log(`📦 Emitted bulk order status update for order ${order.orderId}: ${status}`);
        }
        
        return { orderId: order.orderId, success: true };
      }
      console.log(`🔍 Order not found for orderId: ${orderId}`);
      return { orderId, success: false, error: 'Order not found' };
    });
    
    const results = await Promise.all(updatePromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`🔍 Bulk update completed: ${successful.length} successful, ${failed.length} failed`);
    
    res.json({
      success: true,
      message: `Updated ${successful.length} orders successfully`,
      results: {
        successful: successful.length,
        failed: failed.length,
        details: results
      }
    });
  } catch (error) {
    console.error('Bulk update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk update order status' });
  }
};

// Get order analytics (Admin only)
const getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const [
      totalOrders,
      totalRevenue,
      ordersByStatus,
      ordersByPaymentMethod,
      ordersByWeight,
      topPincodes
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, totalWeight: { $sum: '$orderWeight' } } }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$shippingAddress.zipCode', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    res.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        ordersByPaymentMethod,
        totalWeight: ordersByWeight[0]?.totalWeight || 0,
        topPincodes
      }
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get order analytics' });
  }
};

// Export orders to CSV (Admin only)
const exportOrders = async (req, res) => {
  try {
    const { format = 'csv', filters = {} } = req.query;
    
    let query = {};
    
    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.pincode) query['shippingAddress.zipCode'] = filters.pincode;
    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name weight')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      const csvData = orders.map(order => {
        // Use stored orderWeight if available, otherwise calculate from product data
        const totalWeight = order.orderWeight || order.items.reduce((total, item) => {
          const productWeight = item.productId?.weight || 0;
          return total + (productWeight * item.quantity);
        }, 0);
        
        return {
          'Order ID': order.orderId,
          'Order Number': order.orderNumber,
          'Customer Name': order.userId?.name || '',
          'Customer Email': order.userId?.email || '',
          'Customer Phone': order.userId?.phone || '',
          'Shipping Address': `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
          'Total Amount': order.totalAmount,
          'Total Weight (g)': totalWeight,
          'Weight Source': order.orderWeight ? 'Stored' : 'Calculated',
          'Status': order.status,
          'Payment Method': order.paymentMethod,
          'Payment Status': order.paymentStatus,
          'Order Date': order.createdAt,
          'Items Count': order.items.length
        };
      });
      
      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csv = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        orders: orders
      });
    }
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to export orders' });
  }
};

module.exports = {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  downloadInvoice,
  fixExistingOrders,
  listAllOrders,
  testOrderIdGeneration,
  getOrdersByPincode,
  getOrdersByWeight,
  bulkUpdateOrderStatus,
  getOrderAnalytics,
  exportOrders
}; 