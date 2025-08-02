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

// ==================== CATEGORY ROUTES ====================

// Get all categories (Admin)
router.get('/categories', getAllCategories);

// Get category by ID (Admin)
router.get('/categories/:id', getCategoryById);

// Create new category (Admin)
router.post('/categories', createCategory);

// Update category (Admin)
router.put('/categories/:id', updateCategory);

// Delete category (Admin)
router.delete('/categories/:id', deleteCategory);

// ==================== PRODUCT ROUTES ====================

// Get all products (Admin)
router.get('/products', getAllProducts);

// Get product by ID (Admin)
router.get('/products/:id', getProductById);

// Create new product (Admin)
router.post('/products', createProduct);

// Update product (Admin)
router.put('/products/:id', updateProduct);

// Delete product (Admin)
router.delete('/products/:id', deleteProduct);

// Get products by category (Admin)
router.get('/categories/:categoryId/products', getProductsByCategory);

module.exports = router; 