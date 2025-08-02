const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getActiveCategories);
router.get('/hierarchy', categoryController.getCategoryHierarchy);
router.get('/with-count', categoryController.getCategoriesWithProductCount);
router.get('/search', categoryController.searchCategories);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.get('/admin/all', protect, admin, categoryController.getAllCategories);
router.post('/', protect, admin, categoryController.createCategory);
router.put('/:id', protect, admin, categoryController.updateCategory);
router.delete('/:id', protect, admin, categoryController.deleteCategory);
router.patch('/order', protect, admin, categoryController.updateCategoryOrder);

module.exports = router; 