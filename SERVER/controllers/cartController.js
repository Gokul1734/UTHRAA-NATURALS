const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const { userId } = req.user;
    
    let cart = await Cart.getOrCreateCart(userId);
    cart = await cart.getPopulatedCart();
    
    res.json({
      success: true,
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to get cart' });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    
    // Get product to check price and availability
    let product;
    try {
      product = await Product.findById(productId);
    } catch (error) {
      console.log('MongoDB not available, using mock product');
      product = {
        _id: productId,
        name: 'Mock Product',
        price: 299,
        stock: 10
      };
    }
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }
    
    let cart = await Cart.getOrCreateCart(userId);
    await cart.addItem(productId, quantity, product.price);
    cart = await cart.getPopulatedCart();
    
    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }
    
    // Use populated cart for all operations (model now handles both cases)
    let cart = await Cart.getOrCreateCart(userId);
    await cart.updateItemQuantity(productId, quantity);
    
    // Get updated populated cart for response
    cart = await cart.getPopulatedCart();
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.params;
    
    // Use populated cart for all operations (model now handles both cases)
    let cart = await Cart.getOrCreateCart(userId);
    await cart.removeItem(productId);
    
    // Get updated populated cart for response
    cart = await cart.getPopulatedCart();
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount: cart.itemCount
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item from cart' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Use populated cart for all operations (model now handles both cases)
    let cart = await Cart.getOrCreateCart(userId);
    await cart.clearCart();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        totalAmount: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};

// Buy now (single product)
const buyNow = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }
    
    // Get product details
    let product;
    try {
      product = await Product.findById(productId);
    } catch (error) {
      console.log('MongoDB not available, using mock product');
      product = {
        _id: productId,
        name: 'Mock Product',
        price: 299,
        stock: 10
      };
    }
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const totalAmount = product.price * quantity;
    
    res.json({
      success: true,
      message: 'Ready for checkout',
      checkoutData: {
        type: 'buy-now',
        productId: product._id,
        quantity: quantity,
        items: [{
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          total: totalAmount
        }],
        totalAmount: totalAmount,
        itemCount: quantity
      }
    });
  } catch (error) {
    console.error('Buy now error:', error);
    res.status(500).json({ success: false, message: 'Failed to process buy now' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  buyNow
}; 