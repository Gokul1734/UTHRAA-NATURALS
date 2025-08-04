const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect, checkUserExists } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(protect);
router.use(checkUserExists);

// Wishlist routes
router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove/:productId', wishlistController.removeFromWishlist);
router.post('/move-to-cart', wishlistController.moveToCart);
router.delete('/clear', wishlistController.clearWishlist);

module.exports = router; 