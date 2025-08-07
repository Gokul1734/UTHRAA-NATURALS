const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://uthraa-naturals.vercel.app']
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uthraa-naturals';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });

    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    
    // MongoDB event listeners
    mongoose.connection.on('error', (err) => {
      console.error('🔴 MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🟢 MongoDB reconnected');
    });

    return true;

  } catch (error) {
    console.error('🔴 MongoDB connection failed:', error.message);
    console.log('⚠️ Server will run with mock data for testing');
    return false;
  }
};

// Initialize database connection
connectDB();

// Create HTTP server
const server = require('http').createServer(app);

// Socket.IO setup
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://uthraa-naturals.vercel.app']
      : ['http://localhost:5173', 'http://localhost:5174'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join order tracking room
  socket.on('join-order-tracking', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`👥 Client ${socket.id} joined order tracking room: order-${orderId}`);
  });

  // Leave order tracking room
  socket.on('leave-order-tracking', (orderId) => {
    socket.leave(`order-${orderId}`);
    console.log(`👋 Client ${socket.id} left order tracking room: order-${orderId}`);
  });

  // Handle admin status updates
  socket.on('admin-status-update', (data) => {
    const { orderId, status, trackingNumber, estimatedDelivery } = data;
    console.log(`📦 Admin updated order ${orderId} to status: ${status}`);
    
    // Emit to all clients tracking this order
    io.to(`order-${orderId}`).emit('order-status-updated', {
      orderId,
      status,
      trackingNumber,
      estimatedDelivery,
      updatedAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Uthraa Naturals API',
    version: '1.0.0',
    description: 'Comprehensive e-commerce API for natural and organic products',
    documentation: {
      baseUrl: `http://localhost:${process.env.PORT || 5000}`,
      endpoints: {
        public: [
          'GET / - API Information',
          'GET /api/health - System Health Check',
          'GET /api/products - Browse Products',
          'GET /api/products/featured - Featured Products',
          'GET /api/products/search?q=term - Search Products',
          'GET /api/categories - Browse Categories',
          'GET /api/orders/track/:trackingNumber - Track Order'
        ],
        authentication: [
          'POST /api/auth/register - User Registration',
          'POST /api/auth/login - User Login',
          'POST /api/auth/send-otp - Send OTP',
          'POST /api/auth/verify-otp - Verify OTP',
          'POST /api/auth/refresh-token - Refresh JWT Token',
          'POST /api/auth/logout - User Logout'
        ],
        protected: [
          'GET /api/auth/profile - Get User Profile',
          'PUT /api/auth/profile - Update User Profile',
          'POST /api/products/:id/review - Add Product Review',
          'POST /api/orders - Create Order',
          'GET /api/orders - Get User Orders',
          'PUT /api/users/profile - Update Profile',
          'POST /api/users/change-password - Change Password',
          'GET /api/users/addresses - Get User Addresses',
          'POST /api/upload/image - Upload Images',
          'POST /api/upload/avatar - Upload Profile Picture'
        ],
        admin: [
          'GET /api/admin - Admin Panel Overview',
          'GET /api/dashboard - Analytics Dashboard',
          'POST /api/products - Create Product',
          'PUT /api/products/:id - Update Product',
          'DELETE /api/products/:id - Delete Product',
          'POST /api/categories - Create Category',
          'PUT /api/categories/:id - Update Category',
          'DELETE /api/categories/:id - Delete Category',
          'GET /api/orders/admin - Get All Orders',
          'PUT /api/orders/:id/status - Update Order Status',
          'GET /api/users/admin - Get All Users',
          'POST /api/upload/product-images - Upload Product Images'
        ]
      }
    },
    features: [
      'JWT Authentication with Refresh Tokens',
      'Role-based Access Control (User/Admin)',
      'OTP Authentication Support',
      'Product Management with Reviews',
      'Order Management with Tracking',
      'File Upload with Multer',
      'Analytics Dashboard',
      'Advanced Search & Filtering',
      'Mock Data Support for Development',
      'MongoDB with Mongoose ODM'
    ],
    status: 'operational',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: dbStatus === 'disconnected' ? 'Using mock data for testing' : 'Database connected successfully'
  });
});

// Load API Routes
console.log('🔄 Loading API routes...');

// Authentication routes
app.use('/api/auth', require('./routes/auth'));
console.log('✅ Auth routes loaded');

// Cart routes
app.use('/api/cart', require('./routes/cart'));
console.log('✅ Cart routes loaded');

// Wishlist routes
app.use('/api/wishlist', require('./routes/wishlist'));
console.log('✅ Wishlist routes loaded');

// Product routes
app.use('/api/products', require('./routes/products'));
console.log('✅ Product routes loaded');

// Category routes
app.use('/api/categories', require('./routes/categories'));
console.log('✅ Category routes loaded');

// Order routes
app.use('/api/orders', require('./routes/orders'));
console.log('✅ Order routes loaded');

// User routes
app.use('/api/users', require('./routes/users'));
console.log('✅ User routes loaded');

// Dashboard routes
app.use('/api/dashboard', require('./routes/dashboard'));
console.log('✅ Dashboard routes loaded');

// Admin routes
app.use('/api/admin', require('./routes/admin'));
console.log('✅ Admin routes loaded');

// Upload routes
app.use('/api/upload', require('./routes/upload'));
console.log('✅ Upload routes loaded');

console.log('🎉 All API routes loaded successfully');

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/*',
      'GET /api/products',
      'GET /api/categories',
      'POST /api/orders',
      'GET /api/users/*',
      'GET /api/dashboard/*',
      'GET /api/admin/*',
      'POST /api/upload/*'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🔴 Server error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({ 
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🟡 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('🔴 MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🟡 SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('🔴 MongoDB connection closed.');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`📖 API Docs: http://localhost:${PORT}/`);
  console.log('✅ Server ready to accept requests!');
  console.log('🔌 Socket.IO server is running');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('💡 Solutions:');
    console.error('   1. taskkill /F /IM node.exe');
    console.error('   2. set PORT=3001 && node server.js');
    console.error('   3. Create .env file with PORT=3001');
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});

module.exports = app; 