const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/auth');

// All dashboard routes - temporarily removing authentication for development
router.get('/overview', dashboardController.getDashboardOverview);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/sales-analytics', dashboardController.getSalesAnalytics);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/user-analytics', dashboardController.getUserAnalytics);
router.get('/inventory-analytics', dashboardController.getInventoryAnalytics);
router.get('/revenue-analytics', dashboardController.getRevenueAnalytics);
router.get('/complete', dashboardController.getCompleteDashboard);

module.exports = router; 