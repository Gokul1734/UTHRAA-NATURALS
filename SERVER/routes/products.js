const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// Protected routes (require authentication)
router.post('/:id/review', protect, productController.addReview);

// Admin routes
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);
router.patch('/:id/stock', protect, admin, productController.updateStock);
router.get('/admin/low-stock', protect, admin, productController.getLowStockProducts);

module.exports = router; 