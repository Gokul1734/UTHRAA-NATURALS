import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Package, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { getFirstImageUrl } from '../../utils/imageUtils';
import { handleAuthForCart, handleAuthForWishlist } from '../../utils/authUtils';
import { UPLOAD_URL } from '../../config/environment';
import toast from 'react-hot-toast';

const CombinedProductCard = ({ combinedProduct }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const isInWishlist = wishlistItems.some(item => item._id === combinedProduct._id);

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${UPLOAD_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const calculateDiscount = () => {
    if (combinedProduct.originalPrice && combinedProduct.originalPrice > combinedProduct.combinedPrice) {
      return Math.round(((combinedProduct.originalPrice - combinedProduct.combinedPrice) / combinedProduct.originalPrice) * 100);
    }
    return 0;
  };

  const handleAddToWishlist = () => {
    const wishlistAction = () => {
      if (isInWishlist) {
        dispatch(removeFromWishlist(combinedProduct._id));
        toast.success('Removed from wishlist');
      } else {
        dispatch(addToWishlist(combinedProduct));
        toast.success('Added to wishlist');
      }
    };

    // Check if user is logged in, if not redirect to login
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/phone-login');
      return;
    }

    wishlistAction();
  };

  const handleAddToCart = () => {
    const cartAction = () => {
      setIsAddingToCart(true);
      try {
        dispatch(addToCart({
          ...combinedProduct,
          quantity: 1,
          isCombinedProduct: true
        }));
        toast.success('Added to cart');
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add to cart');
      } finally {
        setIsAddingToCart(false);
      }
    };

    // Check if user is logged in, if not redirect to login
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/phone-login');
      return;
    }

    cartAction();
  };

  const handleViewDetails = () => {
    navigate(`/combined-product/${combinedProduct._id}`);
  };

  // Get the first image from the first product for the main display
  const getMainImage = () => {
    if (combinedProduct.images && combinedProduct.images.length > 0) {
      return getImageSrc(combinedProduct.images[0]);
    }
    
    // Fallback to first product's image
    if (combinedProduct.products && combinedProduct.products.length > 0) {
      const firstProduct = combinedProduct.products[0].productId;
      if (firstProduct && firstProduct.images && firstProduct.images.length > 0) {
        return getImageSrc(firstProduct.images[0]);
      }
    }
    
    return '/placeholder-product.jpg';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      {/* Product Images */}
      <div className="relative">
        <div className="aspect-w-1 aspect-h-1">
          <img
            src={getMainImage()}
            alt={combinedProduct.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>

        {/* Combo Badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Package className="w-3 h-3 mr-1" />
            COMBO OFFER
          </span>
        </div>

        {/* Discount Badge */}
        {calculateDiscount() > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {calculateDiscount()}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleAddToWishlist}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart 
            className={`w-4 h-4 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
          {combinedProduct.name}
        </h3>

        {/* Included Products Preview */}
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Includes:</p>
          <div className="flex flex-wrap gap-1">
            {combinedProduct.products?.slice(0, 3).map((item, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {item.productId?.name}
                {item.quantity > 1 && ` (${item.quantity})`}
              </span>
            ))}
            {combinedProduct.products?.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                +{combinedProduct.products.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{combinedProduct.combinedPrice?.toFixed(2)}
            </span>
            {combinedProduct.originalPrice && combinedProduct.originalPrice > combinedProduct.combinedPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{combinedProduct.originalPrice?.toFixed(2)}
              </span>
            )}
          </div>
          {combinedProduct.savings > 0 && (
            <span className="text-xs text-green-600 font-medium">
              Save ₹{combinedProduct.savings?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating */}
        {combinedProduct.rating && (
          <div className="flex items-center space-x-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(combinedProduct.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({combinedProduct.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !combinedProduct.stock || combinedProduct.stock === 0}
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          
          <button
            onClick={handleViewDetails}
            className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Status */}
        {combinedProduct.stock !== undefined && (
          <div className="mt-2 text-xs text-center">
            <span className={`font-medium ${
              combinedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {combinedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CombinedProductCard;
