import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { removeFromWishlist, clearWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { getFirstImageUrl } from '../utils/imageUtils';

const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) {
      navigate('/phone-login');
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  const handleRemoveFromWishlist = (productId) => {
    setUpdating(true);
    try {
      dispatch(removeFromWishlist(productId));
      toast.success('Product removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove product from wishlist');
    } finally {
      setUpdating(false);
    }
  };

  const handleMoveToCart = (product) => {
    setUpdating(true);
    try {
      // Add to cart
      dispatch(addToCart({
        ...product,
        quantity: 1
      }));
      
      // Remove from wishlist
      dispatch(removeFromWishlist(product._id));
      
      toast.success('Product moved to cart successfully');
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Failed to move product to cart');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearWishlist = () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }
    
    setUpdating(true);
    try {
      dispatch(clearWishlist());
      toast.success('Wishlist cleared successfully');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Heart className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products to your wishlist to save them for later.</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/products')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Products
              </button>
              <button
                onClick={() => navigate('/')}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {wishlistItems.length} items
            </span>
          </div>
          <button
            onClick={handleClearWishlist}
            disabled={updating}
            className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            Clear All
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={getFirstImageUrl(item.images)}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleRemoveFromWishlist(item._id)}
                      disabled={updating}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Heart className="h-3 w-3 inline mr-1" />
                      Saved
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-green-600 font-bold text-lg mb-3">
                    ₹{item.price || 299}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      disabled={updating}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => navigate(`/product/${item._id}`)}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 