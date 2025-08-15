import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingCart, Share2, Star, Minus, Plus, Shield, Check, Package, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { getCombinedProduct } from '../store/slices/combinedProductSlice';
import { UPLOAD_URL } from '../config/environment';
import deliveryChargesService from '../services/deliveryChargesService';

const CombinedProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedBuyQuantity, setSelectedBuyQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  // Get cart and wishlist state from Redux
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { combinedProduct, loading } = useSelector((state) => state.combinedProducts);
  
  // Check if product is in cart and get its quantity
  const cartItem = cartItems.find(item => item._id === id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;
  const isInWishlist = wishlistItems.some(item => item._id === id);

  useEffect(() => {
    if (id) {
      dispatch(getCombinedProduct(id));
    }
  }, [id, dispatch]);

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${UPLOAD_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const getSubstring = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) : text;
  };

  const shouldShowReadMore = (text, maxLength) => {
    return text && text.length > maxLength;
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

  const handleRemoveFromCart = () => {
    const removeAction = () => {
      try {
        dispatch(removeFromCart(combinedProduct._id));
        toast.success('Removed from cart');
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove from cart');
      }
    };

    // Check if user is logged in, if not redirect to login
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (!user) {
      toast.error('Please login to manage cart');
      navigate('/phone-login');
      return;
    }

    removeAction();
  };

  const handleUpdateQuantity = (newQuantity) => {
    const updateAction = () => {
      try {
        if (newQuantity <= 0) {
          dispatch(removeFromCart(combinedProduct._id));
          toast.success('Removed from cart');
        } else {
          dispatch(updateQuantity({ id: combinedProduct._id, quantity: newQuantity }));
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('Failed to update cart');
      }
    };

    // Check if user is logged in, if not redirect to login
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (!user) {
      toast.error('Please login to manage cart');
      navigate('/phone-login');
      return;
    }

    updateAction();
  };

  const handleBuyNow = () => {
    const buyNowAction = () => {
      try {
        // Add to cart first
        dispatch(addToCart({
          ...combinedProduct,
          quantity: 1,
          isCombinedProduct: true
        }));

        // Store buy now data in sessionStorage
        const buyNowData = {
          type: 'buy-now',
          productId: combinedProduct._id,
          quantity: 1,
          totalAmount: combinedProduct.combinedPrice * 1,
          product: {
            ...combinedProduct,
            quantity: 1,
            isCombinedProduct: true
          }
        };
        sessionStorage.setItem('buyNowData', JSON.stringify(buyNowData));
        
        // Navigate to checkout
        navigate('/checkout?type=buy-now');
      } catch (error) {
        console.error('Buy now error:', error);
        toast.error('Failed to process buy now');
      }
    };

    // Check if user is logged in, if not redirect to login
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (!user) {
      toast.error('Please login to purchase this product');
      navigate('/phone-login');
      return;
    }

    buyNowAction();
  };

  const handleBuyQuantity = (buyQuantity) => {
    const buyQuantityAction = () => {
      setIsAddingToCart(true);
      try {
        dispatch(addToCart({
          ...combinedProduct,
          quantity: buyQuantity,
          isCombinedProduct: true
        }));
        setSelectedBuyQuantity(buyQuantity);
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

    buyQuantityAction();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: combinedProduct.name,
        text: combinedProduct.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const calculateDiscount = () => {
    if (combinedProduct.originalPrice && combinedProduct.originalPrice > combinedProduct.combinedPrice) {
      return Math.round(((combinedProduct.originalPrice - combinedProduct.combinedPrice) / combinedProduct.originalPrice) * 100);
    }
    return 0;
  };

  // Get the main image for display
  const getMainImage = () => {
    if (combinedProduct?.images && combinedProduct.images.length > 0) {
      return getImageSrc(combinedProduct.images[selectedImage]);
    }
    
    // Fallback to first product's image
    if (combinedProduct?.products && combinedProduct.products.length > 0) {
      const firstProduct = combinedProduct.products[0].productId;
      if (firstProduct && firstProduct.images && firstProduct.images.length > 0) {
        return getImageSrc(firstProduct.images[0]);
      }
    }
    
    return '/placeholder-product.jpg';
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-start justify-start p-6">
        <div className="text-left">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading combo offer...</p>
        </div>
      </div>
    );
  }

  if (!combinedProduct) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-start justify-start p-6">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Combo offer not found</h2>
          <p className="text-gray-600">The combo offer you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Render cart controls based on whether item is in cart
  const renderCartControls = () => {
    if (isInCart) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <button
              onClick={() => handleUpdateQuantity(cartQuantity - 1)}
              disabled={isAddingToCart}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <span className="text-base sm:text-lg font-medium text-green-800 min-w-[1.5rem] sm:min-w-[2rem] text-center">
              {cartQuantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(cartQuantity + 1)}
              disabled={isAddingToCart || (combinedProduct.stock && cartQuantity >= combinedProduct.stock)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
          <button
            onClick={handleRemoveFromCart}
            className="w-full border border-red-300 text-red-600 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm sm:text-base"
          >
            Remove from Cart
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || !combinedProduct.stock || combinedProduct.stock === 0}
          className="w-full border border-gray-300 text-gray-700 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Combo Offers
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
          {/* Left Section - Product Images */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={getMainImage()}
                  alt={combinedProduct.name || 'Combo Offer Image'}
                  className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
            </div>

            {/* Combo Badge */}
            <div className="flex justify-center">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center">
                <Package className="w-4 h-4 mr-2" />
                COMBO OFFER
              </span>
            </div>
          </motion.div>

          {/* Right Section - Product Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Product Title */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {combinedProduct.name}
              </h1>
              <p className="text-sm text-gray-600">Combo Package</p>
            </div>

            {/* Price Section */}
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl sm:text-2xl lg:text-3xl justify-center font-bold text-gray-900">
                  ₹{combinedProduct.combinedPrice?.toFixed(2)}
                </span>
                {combinedProduct.originalPrice && combinedProduct.originalPrice > combinedProduct.combinedPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{combinedProduct.originalPrice?.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                      {calculateDiscount()}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Savings */}
            {combinedProduct.savings > 0 && (
              <div className="text-center">
                <span className="text-green-600 font-semibold">
                  You Save: ₹{combinedProduct.savings?.toFixed(2)}
                </span>
              </div>
            )}

            {/* Rating */}
            {combinedProduct.rating && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(combinedProduct.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {combinedProduct.rating} ({combinedProduct.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Product Description */}
            <div className="space-y-3 lg:hidden">
              <h3 className="font-bold text-lg text-gray-900">Description</h3>
              <p className="text-gray-700 text-base leading-relaxed font-medium">
                {showFullDescription 
                  ? (combinedProduct.description || 'No description available')
                  : `${getSubstring(combinedProduct.description, 150)}${shouldShowReadMore(combinedProduct.description, 150) ? '...' : ''}`
                }
                {shouldShowReadMore(combinedProduct.description, 150) && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-green-600 hover:text-green-700 ml-1 font-semibold"
                  >
                    {showFullDescription ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </p>
            </div>

            {/* Engagement Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleAddToWishlist}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all w-full sm:w-auto justify-center ${
                  isInWishlist
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {isInWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
                </span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all w-full sm:w-auto justify-center"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Quick Add to Cart</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: 'Buy 1', quantity: 1 },
                  { label: 'Buy 2', quantity: 2 },
                  { label: 'Buy 3', quantity: 3 }
                ].map((option) => (
                  <button
                    key={option.quantity}
                    onClick={() => handleBuyQuantity(option.quantity)}
                    disabled={isAddingToCart || !combinedProduct.stock || combinedProduct.stock === 0}
                    className={`px-3 sm:px-4 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedBuyQuantity === option.quantity
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Controls */}
            {renderCartControls()}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Product Description - Desktop view */}
            <div className="space-y-3 hidden lg:block">
              <h3 className="font-medium text-gray-900">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {showFullDescription 
                  ? (combinedProduct.description || 'No description available')
                  : `${getSubstring(combinedProduct.description, 100)}${shouldShowReadMore(combinedProduct.description, 100) ? '...' : ''}`
                }
                {shouldShowReadMore(combinedProduct.description, 100) && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-green-600 hover:text-green-700 ml-1"
                  >
                    {showFullDescription ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </p>
            </div>

            {/* Included Products */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Included Products</h3>
              <div className="space-y-3">
                {combinedProduct.products?.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getImageSrc(item.productId?.images?.[0])}
                          alt={item.productId?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.productId?.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Quantity: {item.quantity} | Price: ₹{item.price?.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.productId?.weight} {item.productId?.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          ₹{(item.price * item.quantity)?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Package Details</h3>
              <div className="space-y-2 text-sm">
                {combinedProduct.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">{combinedProduct.category.name}</span>
                  </div>
                )}
                {combinedProduct.stock !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-medium ${
                      combinedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {combinedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="text-gray-900">{combinedProduct.products?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Combo Package</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Quality Assured</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CombinedProductDetail;
