import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingCart, Share2, Star, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { getFirstImageUrl } from '../utils/imageUtils';
import { handleAuthForCart, handleAuthForWishlist } from '../utils/authUtils';
import { API_BASE_URL, UPLOAD_URL } from '../config/environment';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullIngredients, setShowFullIngredients] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  // Get cart and wishlist state from Redux
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  
  // Check if product is in cart and get its quantity
  const cartItem = cartItems.find(item => item._id === id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;
  const isInWishlist = wishlistItems.some(item => item._id === id);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

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
        dispatch(removeFromWishlist(product._id));
        toast.success('Removed from wishlist');
      } else {
        dispatch(addToWishlist(product));
        toast.success('Added to wishlist');
      }
    };

    handleAuthForWishlist(wishlistAction, navigate);
  };

  const handleAddToCart = () => {
    const cartAction = () => {
      setIsAddingToCart(true);
      try {
        dispatch(addToCart({
          ...product,
          quantity: quantity
        }));
        toast.success('Added to cart');
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add to cart');
      } finally {
        setIsAddingToCart(false);
      }
    };

    handleAuthForCart(cartAction, navigate);
  };

  const handleRemoveFromCart = () => {
    const removeAction = () => {
      try {
        dispatch(removeFromCart(product._id));
        toast.success('Removed from cart');
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove from cart');
      }
    };

    handleAuthForCart(removeAction, navigate);
  };

  const handleUpdateQuantity = (newQuantity) => {
    const updateAction = () => {
      try {
        if (newQuantity <= 0) {
          dispatch(removeFromCart(product._id));
          toast.success('Removed from cart');
        } else {
          dispatch(updateQuantity({ id: product._id, quantity: newQuantity }));
          toast.success('Cart updated');
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('Failed to update cart');
      }
    };

    handleAuthForCart(updateAction, navigate);
  };

  const handleBuyNow = () => {
    const buyNowAction = () => {
      try {
        // Add to cart first
        dispatch(addToCart({
          ...product,
          quantity: quantity
        }));

        // Store buy now data in sessionStorage
        const buyNowData = {
          type: 'buy-now',
          productId: product._id,
          quantity: quantity,
          totalAmount: product.price * quantity
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const calculateDiscount = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-start justify-start p-6">
        <div className="text-left">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-start justify-start p-6">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
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
              className="w-10 h-10 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-lg font-medium text-green-800 min-w-[2rem] text-center">
              {cartQuantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(cartQuantity + 1)}
              disabled={isAddingToCart || (product.stock && cartQuantity >= product.stock)}
              className="w-10 h-10 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleRemoveFromCart}
            className="w-full border border-red-300 text-red-600 py-3 px-6 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            Remove from Cart
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-16 text-center text-lg font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            disabled={product.stock && quantity >= product.stock}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || !product.stock || product.stock === 0}
          className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Section - Product Images */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={getImageSrc(product.images?.[selectedImage])}
                  alt={product.name || 'Product Image'}
                  className="w-full h-96 lg:h-[500px] object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-green-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageSrc(image)}
                      alt={`${product.name || 'Product'} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Section - Product Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Title */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-sm text-gray-600">Brand: {product.brand}</p>
              )}
            </div>

            {/* Price Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                  ₹{product.price?.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.originalPrice?.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                      {calculateDiscount()}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Engagement Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddToWishlist}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
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
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Size: {product.size || 'N/A'}</label>
              <div className="flex space-x-3">
                {['Buy 1', 'Buy 4', 'Buy 7'].map((size) => (
                  <button
                    key={size}
                    onClick={() => {/* Size selection is not directly tied to product.size in this component */}}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      product.size === size
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
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

            {/* Delivery Check */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">Check Delivery Charges</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={6}
                />
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Check
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {showFullDescription 
                  ? (product.description || 'No description available')
                  : `${getSubstring(product.description, 100)}${shouldShowReadMore(product.description, 100) ? '...' : ''}`
                }
                {shouldShowReadMore(product.description, 100) && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-green-600 hover:text-green-700 ml-1"
                  >
                    {showFullDescription ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </p>
            </div>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Ingredients</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {showFullIngredients 
                    ? (product.ingredients || 'No ingredients information available')
                    : `${getSubstring(product.ingredients, 150)}${shouldShowReadMore(product.ingredients, 150) ? '...' : ''}`
                  }
                  {shouldShowReadMore(product.ingredients, 150) && (
                    <button
                      onClick={() => setShowFullIngredients(!showFullIngredients)}
                      className="text-green-600 hover:text-green-700 ml-1"
                    >
                      {showFullIngredients ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Product Details</h3>
              <div className="space-y-2 text-sm">
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="text-gray-900">{product.weight} {product.unit}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">{product.category.name}</span>
                  </div>
                )}
                {product.stock !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-medium ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
              {/* Free Delivery badge removed as per new_code */}
              <div className="flex items-center space-x-2">
                {/* Truck icon removed as per new_code */}
                <span className="text-sm text-gray-600">Free Delivery</span>
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

export default ProductDetail; 