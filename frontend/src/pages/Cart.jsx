import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, MapPin, User, Package, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { removeFromCart, updateQuantity, clearCart, updateDeliveryCharges, updateTaxCalculations } from '../store/slices/cartSlice';
import { getFirstImageUrl } from '../utils/imageUtils';
import AdvertisementPopup from '../components/advertisements/AdvertisementPopup';
import deliveryChargesService from '../services/deliveryChargesService';
import taxService from '../services/taxService';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, total, tax, shipping, grandTotal, cartWeight } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [deliveryChargeBreakdown, setDeliveryChargeBreakdown] = useState(null);
  const [taxBreakdown, setTaxBreakdown] = useState(null);
  const [pricingDataLoaded, setPricingDataLoaded] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const token = sessionStorage.getItem('token');

  // Memoize loadPricingData to prevent infinite loops
  const loadPricingData = useCallback(async () => {
    if (pricingDataLoaded) return; // Prevent multiple loads
    
    try {
      console.log('🔍 Loading pricing data in Cart component...');
      
      // Check if services are already loaded
      const deliveryChargesLoaded = deliveryChargesService.isLoaded;
      const taxSettingsLoaded = taxService.isLoaded;
      
      if (deliveryChargesLoaded && taxSettingsLoaded) {
        console.log('🔍 Pricing data already loaded by global loader, skipping...');
        setPricingDataLoaded(true);
        return;
      }
      
      // Load both delivery charges and tax settings
      await Promise.all([
        deliveryChargesService.loadDeliveryCharges(),
        taxService.loadTaxSettings()
      ]);

      // Force enable tax if it's disabled (temporary fix)
      if (!taxService.taxSettings.isActive) {
        console.log('🔍 Tax is disabled, forcing enable...');
        await taxService.forceEnableTax();
      }
      
      dispatch(updateDeliveryCharges());
      dispatch(updateTaxCalculations());
      setPricingDataLoaded(true);
      
      console.log('✅ Pricing data loaded successfully');
    } catch (error) {
      console.error('Error loading pricing data:', error);
    }
  }, [dispatch, pricingDataLoaded]);

  // Initial load effect - only run once
  useEffect(() => {
    if (!user) {
      navigate('/phone-login');
      return;
    }
    
    // Prevent multiple initializations
    if (loading === false) return;
    
    const initializeCart = async () => {
      await loadPricingData();
      setLoading(false);
    };
    
    initializeCart();
  }, [user]); // Remove loadPricingData from dependencies to prevent infinite loops

  // Update delivery charge breakdown when cart weight changes (only after pricing data is loaded)
  useEffect(() => {
    if (pricingDataLoaded && cartWeight !== undefined && !loading) {
      const breakdown = deliveryChargesService.getDeliveryChargeBreakdown(cartWeight);
      setDeliveryChargeBreakdown(breakdown);
    }
  }, [cartWeight, pricingDataLoaded, loading]);

  // Update tax breakdown when cart total changes (only after pricing data is loaded)
  useEffect(() => {
    if (pricingDataLoaded && total !== undefined && !loading) {
      const taxData = taxService.getTaxBreakdown(total);
      setTaxBreakdown(taxData);
    }
  }, [total, pricingDataLoaded, loading]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity is 0 or less, remove the item
      handleRemoveItem(productId);
      return;
    }
    
    setUpdating(true);
    try {
      dispatch(updateQuantity({ id: productId, quantity: newQuantity }));
      // Removed toast notification for cart actions
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = (productId) => {
    setUpdating(true);
    try {
      dispatch(removeFromCart(productId));
      // Removed toast notification for cart actions
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }
    
    try {
      dispatch(clearCart());
      // Removed toast notification for cart actions
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handlePayment = () => {
    // Here you would integrate with a payment gateway
    toast.success('Payment processed successfully!');
    // Redirect to order success page
    navigate('/order-success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4 sm:mb-8"></div>
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-left"
          >
            <ShoppingBag className="h-16 sm:h-24 w-16 sm:w-24 text-gray-400 mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Looks like you haven't added any products to your cart yet.</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate('/products')}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/')}
                className="border border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
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
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {cartItems.length} items
            </span>
          </div>
          <button
            onClick={handleClearCart}
            disabled={updating}
            className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 text-sm sm:text-base self-start sm:self-auto"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Cart Items</h2>
                <div className="space-y-4 sm:space-y-6">
                  <AnimatePresence>
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-3 sm:pt-4 pr-3 sm:pr-4 pb-3 sm:pb-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <img
                            src={getFirstImageUrl(item.images)}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                            <p className="text-gray-600 text-sm">₹{item.price}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                              disabled={updating}
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 1;
                                  if (newQuantity >= 1 && newQuantity <= 99) {
                                    handleUpdateQuantity(item._id, newQuantity);
                                  }
                                }}
                                disabled={updating}
                                className="w-12 sm:w-16 text-center border border-gray-300 rounded-lg px-1 sm:px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                              />
                            </div>
                            
                            <button
                              onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                              disabled={updating}
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-end gap-3 sm:gap-5">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{item.price * item.quantity}</p>
                            <button
                              onClick={() => {
                                if (window.confirm(`Remove "${item.name}" from cart?`)) {
                                  handleRemoveItem(item._id);
                                }
                              }}
                              disabled={updating}
                              className="text-red-600 hover:text-red-700 mt-1 sm:mt-2 p-1 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 sticky top-20 sm:top-24">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{total?.toFixed(2) || '0.00'}</span>
                </div>
                
                {/* Cart Weight Information */}
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Cart Weight
                  </span>
                  <span className="font-medium">{(cartWeight || 0).toFixed(1)}g</span>
                </div>
                
                {/* Tax */}
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-medium">₹{(tax || 0).toFixed(2)}</span>
                </div>
                
                {/* Tax Breakdown */}
                {taxBreakdown && taxBreakdown.isActive && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <div className="flex justify-between">
                      <span>GST Rate:</span>
                      <span>{taxBreakdown.rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST ({taxBreakdown.rate / 2}%):</span>
                      <span>₹{taxBreakdown.cgst?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST ({taxBreakdown.rate / 2}%):</span>
                      <span>₹{taxBreakdown.sgst?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                )}
                
                {/* Delivery Charges */}
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shipping === 0 ? 'Free' : `₹${shipping?.toFixed(2) || '0.00'}`}
                  </span>
                </div>
                
                {/* Delivery Charge Breakdown */}
                {deliveryChargeBreakdown && deliveryChargeBreakdown.rule && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <div className="flex justify-between">
                      <span>Weight Range:</span>
                      <span>
                        {deliveryChargeBreakdown.rule.minWeight}g - 
                        {deliveryChargeBreakdown.rule.maxWeight ? `${deliveryChargeBreakdown.rule.maxWeight}g` : 'No limit'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>₹{deliveryChargeBreakdown.rule.charge} per order</span>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{grandTotal?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={updating || cartItems.length === 0}
                className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCheckout(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Customer Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Shipping Address
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {checkoutData?.items?.map((item, index) => (
                        <div key={index} className="flex justify-between py-2">
                          <span className="text-gray-600">{item.name} x {item.quantity}</span>
                          <span className="font-medium">₹{item.total}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₹{checkoutData?.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Payment
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advertisement Popup */}
      <AdvertisementPopup page="cart" />
    </div>
  );
};

export default Cart; 