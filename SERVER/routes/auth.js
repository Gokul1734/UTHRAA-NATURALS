const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, checkUserExists } = require('../middleware/auth');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/phone-login', authController.phoneLogin);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-token', authController.verifyToken);
router.post('/logout', authController.logout);

// Profile routes - require authentication and user existence check
router.get('/profile', protect, checkUserExists, authController.getProfile);
router.put('/profile', protect, checkUserExists, authController.updateProfile);

module.exports = router; 