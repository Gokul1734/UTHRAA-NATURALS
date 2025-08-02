const express = require('express');
const router = express.Router();

// Simple dashboard statistics (no MongoDB)
router.get('/stats', (req, res) => {
  try {
    res.json({
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      lowStockItems: 0,
      recentOrders: [],
      recentProducts: [],
      topProducts: [],
      categoryStats: [],
      productsByCategory: []
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products for dashboard display
router.get('/products', (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get dashboard products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories for dashboard display
router.get('/categories', (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Get dashboard categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 