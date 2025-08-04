const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, checkUserExists, admin } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);
router.use(checkUserExists);

// Address management routes (MUST come before parameterized routes)
router.get('/addresses', orderController.getUserAddresses);
router.post('/addresses', orderController.addAddress);
router.put('/addresses/:addressId', orderController.updateAddress);
router.delete('/addresses/:addressId', orderController.deleteAddress);

// Order management routes
router.post('/create', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:orderId/invoice', orderController.downloadInvoice);
router.get('/:orderId', orderController.getOrderById);

// Utility routes
router.post('/fix-existing-orders', admin, orderController.fixExistingOrders);
router.get('/debug/all-orders', admin, orderController.listAllOrders);
router.get('/debug/test-orderid', orderController.testOrderIdGeneration);

// Admin routes
router.get('/admin/all', admin, orderController.getAllOrders);
router.get('/admin/stats', admin, orderController.getOrderStats);
router.put('/admin/:orderId/status', admin, orderController.updateOrderStatus);

module.exports = router; 