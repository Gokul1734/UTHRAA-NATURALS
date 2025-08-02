const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// User routes - temporarily removing authentication for development
router.put('/profile', userController.updateUserProfile);
router.post('/change-password', userController.changePassword);
router.get('/addresses', userController.getUserAddresses);
router.post('/addresses', userController.addUserAddress);

// Admin routes - temporarily removing authentication for development
router.get('/admin/all', userController.getAllUsers);
router.get('/admin/stats', userController.getUserStats);
router.get('/admin/search', userController.searchUsers);
router.get('/admin/:id', userController.getUserById);
router.put('/admin/:id', userController.updateUserByAdmin);
router.delete('/admin/:id', userController.deleteUser);
router.patch('/admin/:id/status', userController.toggleUserStatus);

module.exports = router; 