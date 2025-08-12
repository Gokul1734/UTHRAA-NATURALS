const express = require('express');
const router = express.Router();
const {
  // Category controllers
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Product controllers
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} = require('../controllers/adminController');

const financeController = require('../controllers/financeController');
const userManagementController = require('../controllers/userManagementController');
const { admin, protect } = require('../middleware/auth');

// ==================== CATEGORY ROUTES ====================

// Get all categories (Admin)
router.get('/categories', protect, admin, getAllCategories);

// Get category by ID (Admin)
router.get('/categories/:id', protect, admin, getCategoryById);

// Create new category (Admin)
router.post('/categories', protect, admin, createCategory);

// Update category (Admin)
router.put('/categories/:id', protect, admin, updateCategory);

// Delete category (Admin)
router.delete('/categories/:id', protect, admin, deleteCategory);

// ==================== PRODUCT ROUTES ====================

// Get all products (Admin)
router.get('/products', protect, admin, getAllProducts);

// Get product by ID (Admin)
router.get('/products/:id', protect, admin, getProductById);

// Create new product (Admin)
router.post('/products', protect, admin, createProduct);

// Update product (Admin)
router.put('/products/:id', protect, admin, updateProduct);

// Delete product (Admin)
router.delete('/products/:id', protect, admin, deleteProduct);

// Get products by category (Admin)
router.get('/categories/:categoryId/products', getProductsByCategory);

// ==================== USER MANAGEMENT ROUTES ====================

// Get all users with statistics and categorization
router.get('/users', protect, admin, userManagementController.getAllUsersWithStats);

// Get user details with order history
router.get('/users/:userId', protect, admin, userManagementController.getUserDetails);

// Update user status (activate/deactivate)
router.patch('/users/:userId/status', protect, admin, userManagementController.updateUserStatus);

// Get user analytics
router.get('/users/analytics/overview', protect, admin, userManagementController.getUserAnalytics);

// ==================== EMAIL MANAGEMENT ROUTES ====================

// Get email templates
router.get('/email/templates', protect, admin, userManagementController.getEmailTemplates);

// Send bulk email
router.post('/email/send-bulk', protect, admin, userManagementController.sendBulkEmail);

// Finance Management Routes
router.get('/tax-settings', protect, admin, financeController.getTaxSettings);
router.put('/tax-settings', protect, admin, financeController.updateTaxSettings);

router.get('/delivery-charges', protect, admin, financeController.getDeliveryCharges);
router.put('/delivery-charges', protect, admin, financeController.updateDeliveryCharges);

router.get('/product-offers', protect, admin, financeController.getProductOffers);
router.post('/product-offers', protect, admin, financeController.createProductOffer);
router.put('/product-offers/:id', protect, admin, financeController.updateProductOffer);
router.delete('/product-offers/:id', protect, admin, financeController.deleteProductOffer);

router.get('/combined-products', protect, admin, financeController.getCombinedProducts);
router.post('/combined-products', protect, admin, financeController.createCombinedProduct);
router.put('/combined-products/:id', protect, admin, financeController.updateCombinedProduct);
router.delete('/combined-products/:id', protect, admin, financeController.deleteCombinedProduct);

module.exports = router; 