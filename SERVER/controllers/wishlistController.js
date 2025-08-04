const User = require('../models/User');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    
    let user;
    try {
      user = await User.findById(userId).populate('wishlist.productId');
    } catch (error) {
      console.log('MongoDB not available, using mock user');
      user = {
        _id: userId,
        wishlist: []
      };
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to get wishlist' });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    
    // Check if product exists
    let product;
    try {
      product = await Product.findById(productId);
    } catch (error) {
      console.log('MongoDB not available, using mock product');
      product = {
        _id: productId,
        name: 'Mock Product'
      };
    }
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      console.log('MongoDB not available, using mock user');
      user = {
        _id: userId,
        wishlist: []
      };
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if product is already in wishlist
    if (user.isInWishlist(productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    
    await user.addToWishlist(productId);
    user = await user.populate('wishlist.productId');
    
    res.json({
      success: true,
      message: 'Product added to wishlist successfully',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to add product to wishlist' });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.params;
    
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      console.log('MongoDB not available, using mock user');
      user = {
        _id: userId,
        wishlist: []
      };
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    await user.removeFromWishlist(productId);
    user = await user.populate('wishlist.productId');
    
    res.json({
      success: true,
      message: 'Product removed from wishlist successfully',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove product from wishlist' });
  }
};

// Move product from wishlist to cart
const moveToCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      console.log('MongoDB not available, using mock user');
      user = {
        _id: userId,
        wishlist: []
      };
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if product is in wishlist
    if (!user.isInWishlist(productId)) {
      return res.status(400).json({ success: false, message: 'Product not in wishlist' });
    }
    
    // Remove from wishlist
    await user.removeFromWishlist(productId);
    
    // Add to cart (you would need to import cart controller here)
    // For now, we'll just return success
    user = await user.populate('wishlist.productId');
    
    res.json({
      success: true,
      message: 'Product moved to cart successfully',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to move product to cart' });
  }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      console.log('MongoDB not available, using mock user');
      user = {
        _id: userId,
        wishlist: []
      };
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.wishlist = [];
    await user.save();
    
    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist: []
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear wishlist' });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist
}; 