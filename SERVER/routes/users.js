const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// User routes (protected)
router.put('/profile', protect, userController.updateUserProfile);
router.post('/change-password', protect, userController.changePassword);
router.get('/addresses', protect, userController.getUserAddresses);
router.post('/addresses', protect, userController.addUserAddress);

// Admin routes
router.get('/admin/all', protect, admin, userController.getAllUsers);
router.get('/admin/stats', protect, admin, userController.getUserStats);
router.get('/admin/search', protect, admin, userController.searchUsers);
router.get('/admin/:id', protect, admin, userController.getUserById);
router.put('/admin/:id', protect, admin, userController.updateUserByAdmin);
router.delete('/admin/:id', protect, admin, userController.deleteUser);
router.patch('/admin/:id/status', protect, admin, userController.toggleUserStatus);

module.exports = router; 