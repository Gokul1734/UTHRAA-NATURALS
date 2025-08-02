const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-token', authController.verifyToken);
router.post('/logout', authController.logout);

// OTP routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Profile routes - temporarily removing authentication for development
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);

module.exports = router; 