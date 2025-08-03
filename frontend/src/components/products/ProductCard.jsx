import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { getFirstImageUrl } from '../../utils/imageUtils';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  
  // Get wishlist state from Redux
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const isInWishlist = wishlistItems.some(item => item._id === product._id);

  // Get the proper image URL
  const imageUrl = getFirstImageUrl(product.images || [product.image]);

  const handleImageError = () => {
    setImageError(true);
  };

  const addToCartHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      console.log('🔍 Adding to cart:', product);
      dispatch(addToCart({
        ...product,
        quantity: 1
      }));
      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlistHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

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

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/phone-login');
      return;
    }

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
              onClick={addToCartHandler}
              disabled={isAddingToCart}
              className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-lg transition-colors disabled:opacity-50"
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
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
          <button
            onClick={addToCartHandler}
            disabled={isAddingToCart || !product.stock || product.stock === 0}
            className="w-full border border-green-600 text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard; 