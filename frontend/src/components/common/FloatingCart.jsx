import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, X, ChevronUp, ChevronDown } from 'lucide-react';

const FloatingCart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, total, grandTotal, shipping, tax } = useSelector((state) => state.cart);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Don't show on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) return null;

  // Calculate total weight
  const totalWeight = cartItems.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    return sum + (weight * item.quantity);
  }, 0);

  // Calculate total items
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Show floating cart when there are items in cart
  useEffect(() => {
    setIsVisible(cartItems.length > 0);
  }, [cartItems.length]);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-xl"
      >
        {/* Main Floating Cart Bar */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white">
          {/* Left Side - Cart Info */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
            <motion.div 
              className="relative"
              animate={totalItems > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
              {totalItems > 0 && (
                <motion.span 
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </motion.span>
              )}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
                {totalWeight > 0 && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{totalWeight.toFixed(1)}g</span>
                  </div>
                )}
              </div>
              <motion.p 
                className="text-lg sm:text-xl font-bold text-green-600"
                animate={totalItems > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                ₹{grandTotal?.toFixed(2) || '0.00'}
              </motion.p>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isExpanded ? "Collapse cart" : "Expand cart"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              ) : (
                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              )}
            </button>
            
            <button
              onClick={handleCartClick}
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              View Cart
            </button>
            
            <button
              onClick={handleCheckout}
              className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold shadow-sm"
            >
              Checkout
            </button>
          </div>
        </div>

        {/* Expanded Cart Items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-gray-50 border-t border-gray-200 overflow-hidden"
            >
              <div className="p-3 sm:p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100"
                    >
                      <img
                        src={item.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">Qty: {item.quantity}</span>
                          <span className="font-semibold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Quick Summary */}
                <motion.div 
                  className="mt-3 pt-3 border-t border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{total?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? 'Free' : `₹${shipping?.toFixed(2) || '0.00'}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₹{tax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold mt-1 pt-1 border-t border-gray-100">
                    <span>Total:</span>
                    <span className="text-green-600">₹{grandTotal?.toFixed(2) || '0.00'}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCart; 