const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect, checkUserExists } = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);
router.use(checkUserExists);

// Cart routes
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

// Buy now route
router.post('/buy-now', cartController.buyNow);

module.exports = router; 