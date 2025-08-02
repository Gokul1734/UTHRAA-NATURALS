const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// User routes (protected)
router.post('/', protect, orderController.createOrder);
router.get('/my-orders', protect, orderController.getUserOrders);
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/cancel', protect, orderController.cancelOrder);

// Public routes
router.get('/track/:trackingNumber', orderController.trackOrder);

// Admin routes - temporarily removing authentication for development
router.get('/admin/all', orderController.getAllOrders);
router.get('/admin/stats', orderController.getOrderStats);
router.patch('/admin/:id/status', orderController.updateOrderStatus);

module.exports = router; 