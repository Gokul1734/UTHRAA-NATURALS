import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { addToCart, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { getFirstImageUrl } from '../../utils/imageUtils';
import { handleAuthForCart, handleAuthForWishlist } from '../../utils/authUtils';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get cart and wishlist state from Redux
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  
  // Check if product is in cart and get its quantity
  const cartItem = cartItems.find(item => item._id === product._id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;
  const isInWishlist = wishlistItems.some(item => item._id === product._id);

  // Get the proper image URL
  const imageUrl = getFirstImageUrl(product.images || [product.image]);

  const handleImageError = () => {
    setImageError(true);
  };

  const addToCartHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const addToCartAction = () => {
      setIsAddingToCart(true);
      try {
        console.log('🔍 Adding to cart:', product);
        dispatch(addToCart({
          ...product,
          quantity: 1
        }));
        // Removed toast notification for cart actions
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add to cart');
      } finally {
        setIsAddingToCart(false);
      }
    };

    handleAuthForCart(addToCartAction, navigate);
  };

  const removeFromCartHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const removeFromCartAction = () => {
      try {
        console.log('🔍 Removing from cart:', product._id);
        dispatch(removeFromCart(product._id));
        // Removed toast notification for cart actions
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove from cart');
      }
    };

    handleAuthForCart(removeFromCartAction, navigate);
  };

  const updateQuantityHandler = async (e, newQuantity) => {
    e.preventDefault();
    e.stopPropagation();
    
    const updateQuantityAction = () => {
      try {
        if (newQuantity <= 0) {
          dispatch(removeFromCart(product._id));
          // Removed toast notification for cart actions
        } else {
          dispatch(updateQuantity({ id: product._id, quantity: newQuantity }));
          // Removed toast notification for cart actions
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('Failed to update cart');
      }
    };

    handleAuthForCart(updateQuantityAction, navigate);
  };

  const toggleWishlistHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const toggleWishlistAction = () => {
      setIsAddingToWishlist(true);
      try {
        console.log('🔍 Toggling wishlist for product:', product._id, 'Current state:', isInWishlist);
        if (isInWishlist) {
          dispatch(removeFromWishlist(product._id));
          toast.success('Removed from wishlist');
        } else {
          dispatch(addToWishlist(product));
          toast.success('Added to wishlist');
        }
      } catch (error) {
        console.error('Error toggling wishlist:', error);
        toast.error('Failed to update wishlist');
      } finally {
        setIsAddingToWishlist(false);
      }
    };

    handleAuthForWishlist(toggleWishlistAction, navigate);
  };

  const handleBuyNow = async () => {
    const buyNowAction = () => {
      try {
        // Add to cart first
        dispatch(addToCart({
          ...product,
          quantity: 1
        }));

        // Store buy now data in sessionStorage
        const buyNowData = {
          type: 'buy-now',
          productId: product._id,
          quantity: 1,
          totalAmount: product.price
        };
        sessionStorage.setItem('buyNowData', JSON.stringify(buyNowData));
        
        // Navigate to checkout
        navigate('/checkout?type=buy-now');
      } catch (error) {
        console.error('Buy now error:', error);
        toast.error('Failed to process buy now');
      }
    };

    handleAuthForCart(buyNowAction, navigate);
  };

  // Render cart controls based on whether item is in cart
  const renderCartControls = () => {
    if (isInCart) {
      return (
        <div className="flex items-center justify-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-2">
          <button
            onClick={(e) => updateQuantityHandler(e, cartQuantity - 1)}
            disabled={isAddingToCart}
            className="p-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-sm font-medium text-green-800 min-w-[1.5rem] text-center">
            {cartQuantity}
          </span>
          <button
            onClick={(e) => updateQuantityHandler(e, cartQuantity + 1)}
            disabled={isAddingToCart || (product.stock && cartQuantity >= product.stock)}
            className="p-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={addToCartHandler}
        disabled={isAddingToCart || !product.stock || product.stock === 0}
        className="w-full border border-green-600 text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <ShoppingCart className="h-4 w-4" />
        <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
      </button>
    );
  };

  // List view layout
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        <div className="flex">
          {/* Product Image */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
            <img
              src={imageUrl}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
            {isInCart && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                {cartQuantity}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors text-lg">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < (product.rating || 4)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.reviewCount || 12})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-green-600 font-bold text-lg">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-gray-500 text-sm line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <div className="flex space-x-2">
                  <button
                    onClick={toggleWishlistHandler}
                    disabled={isAddingToWishlist}
                    className={`p-2 rounded-full transition-colors ${
                      isInWishlist 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  
                  <Link to={`/product/${product._id}`}>
                    <button className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                </div>

                {/* Cart Controls */}
                <div className="w-32">
                  {renderCartControls()}
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={!product.stock || product.stock === 0}
                  className="w-32 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view layout (original)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          onError={handleImageError}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Cart Badge */}
        {isInCart && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
            {cartQuantity}
          </div>
        )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleWishlistHandler}
              disabled={isAddingToWishlist}
              className={`p-2 rounded-full shadow-lg transition-colors ${
                isInWishlist 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isInCart ? removeFromCartHandler : addToCartHandler}
              disabled={isAddingToCart}
              className={`p-2 rounded-full shadow-lg transition-colors ${
                isInCart 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              <ShoppingCart className="h-4 w-4" />
            </motion.button>
            
            <Link to={`/product/${product._id}`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Badge */}
        {product.isNew && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            New
          </div>
        )}
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < (product.rating || 4)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.reviewCount || 12})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 font-bold text-lg">
              ₹{product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-500 text-sm line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          {product.stock && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleBuyNow}
            disabled={!product.stock || product.stock === 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
          {renderCartControls()}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard; 