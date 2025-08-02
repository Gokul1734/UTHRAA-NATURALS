const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/auth');

// All dashboard routes require admin access
router.get('/overview', protect, admin, dashboardController.getDashboardOverview);
router.get('/recent-orders', protect, admin, dashboardController.getRecentOrders);
router.get('/sales-analytics', protect, admin, dashboardController.getSalesAnalytics);
router.get('/top-products', protect, admin, dashboardController.getTopProducts);
router.get('/user-analytics', protect, admin, dashboardController.getUserAnalytics);
router.get('/inventory-analytics', protect, admin, dashboardController.getInventoryAnalytics);
router.get('/revenue-analytics', protect, admin, dashboardController.getRevenueAnalytics);
router.get('/complete', protect, admin, dashboardController.getCompleteDashboard);

module.exports = router; 