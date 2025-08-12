const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, checkUserExists } = require('../middleware/auth');

// Authentication routes
router.post('/phone-login', authController.phoneLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-token', authController.verifyToken);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router; 