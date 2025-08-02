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

// Admin routes - temporarily removing authentication for development
router.get('/admin/all', categoryController.getAllCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.patch('/order', categoryController.updateCategoryOrder);

module.exports = router; 