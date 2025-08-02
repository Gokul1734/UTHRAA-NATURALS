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

// Admin routes
router.get('/admin/all', protect, admin, orderController.getAllOrders);
router.get('/admin/stats', protect, admin, orderController.getOrderStats);
router.patch('/admin/:id/status', protect, admin, orderController.updateOrderStatus);

module.exports = router; 