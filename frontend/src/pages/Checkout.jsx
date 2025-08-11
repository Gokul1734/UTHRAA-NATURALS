import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  CreditCard, 
  Truck,
  ArrowLeft,
  Home,
  Building,
  Star,
  Package
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/environment';
import { clearCart } from '../store/slices/cartSlice';
import { getFirstImageUrl } from '../utils/imageUtils';
import deliveryChargesService from '../services/deliveryChargesService';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addressRequestInProgress, setAddressRequestInProgress] = useState(false);
  
  // Get cart data from Redux
  const { cartItems, total, tax, shipping, grandTotal } = useSelector((state) => state.cart);
  
  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const token = sessionStorage.getItem('token');
  
  // Address and form states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  // New address form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });
  
  // Order details
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [notes, setNotes] = useState('');

  // Weight conversion function
  const convertToGrams = (weight, unit) => {
    if (!weight) return 0;
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) return 0;
    
    switch (unit?.toLowerCase()) {
      case 'g':
      case 'gram':
      case 'grams':
        return weightValue;
      case 'kg':
      case 'kilo':
      case 'kilos':
      case 'kilogram':
      case 'kilograms':
        return weightValue * 1000;
      case 'mg':
      case 'milligram':
      case 'milligrams':
        return weightValue / 1000;
      case 'lb':
      case 'lbs':
      case 'pound':
      case 'pounds':
        return weightValue * 453.592;
      case 'oz':
      case 'ounce':
      case 'ounces':
        return weightValue * 28.3495;
      default:
        return weightValue; // Assume grams if unit is not recognized
    }
  };

  // Calculate total weight
  const calculateTotalWeight = () => {
    const type = searchParams.get('type');
    
    if (type === 'buy-now') {
      const buyNowData = JSON.parse(sessionStorage.getItem('buyNowData') || 'null');
      if (buyNowData && buyNowData.product) {
        const weightInGrams = convertToGrams(buyNowData.product.weight, buyNowData.product.unit);
        return weightInGrams * buyNowData.quantity;
      }
      return 0;
    } else {
      return cartItems.reduce((total, item) => {
        const weightInGrams = convertToGrams(item.weight, item.unit);
        return total + (weightInGrams * item.quantity);
      }, 0);
    }
  };

  // Format weight for display
  const formatWeight = (weightInGrams) => {
    if (weightInGrams === 0) return 'Weight not available';
    
    if (weightInGrams >= 1000) {
      const kg = weightInGrams / 1000;
      return `${kg.toFixed(2)} kg`;
    } else {
      return `${weightInGrams.toFixed(0)} g`;
    }
  };

  // Get total weight for display
  const totalWeight = calculateTotalWeight();
  const formattedWeight = formatWeight(totalWeight);

  // Get current order items for display
  const getCurrentOrderItems = () => {
    const type = searchParams.get('type');
    
    if (type === 'buy-now') {
      const buyNowData = JSON.parse(sessionStorage.getItem('buyNowData') || 'null');
      if (buyNowData && buyNowData.product) {
        return [buyNowData.product];
      }
      return [];
    } else {
      return cartItems;
    }
  };

  const currentOrderItems = getCurrentOrderItems();

  // Initialize checkout on component mount
  useEffect(() => {
    const initCheckout = async () => {
      if (!user) {
        navigate('/phone-login');
        return;
      }
      
      // Check if cart is empty for cart-type checkout
      const type = searchParams.get('type');
      if (!type && cartItems.length === 0) {
        navigate('/cart');
        return;
      }
      
      setLoading(true);
      try {
        // Validate buy-now data if needed
        if (type === 'buy-now') {
          const buyNowData = JSON.parse(sessionStorage.getItem('buyNowData') || 'null');
          if (!buyNowData) {
            navigate('/products');
            return;
          }
        }
        
        // Fetch addresses
        await fetchAddresses();
      } catch (error) {
        console.error('Error initializing checkout:', error);
        toast.error('Failed to initialize checkout');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, []); // Empty dependency array - only run once on mount

  const fetchAddresses = async () => {
    if (addressRequestInProgress) {
      console.log('🔍 Address request already in progress, skipping fetch.');
      return;
    }
    setAddressRequestInProgress(true);
    
    try {
      console.log('🔍 Fetching addresses...');
      console.log('🔍 Token:', token ? 'Present' : 'Missing');
      console.log('🔍 User:', user);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      const response = await axios.get(`${API_BASE_URL}/orders/addresses`, {
        headers: headers
      });
      
      console.log('🔍 Addresses response:', response.data);
      
      // Handle different response structures
      let addresses = [];
      if (response.data.success && response.data.addresses) {
        addresses = response.data.addresses;
      } else if (Array.isArray(response.data)) {
        addresses = response.data;
      } else if (response.data.addresses) {
        addresses = response.data.addresses;
      }
      
      setAddresses(addresses);
      
      // Select default address if available
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        const addressId = defaultAddress._id || defaultAddress._id?.toString();
        setSelectedAddressId(addressId);
        console.log('🔍 Selected default address ID:', addressId);
      } else if (addresses.length > 0) {
        const addressId = addresses[0]._id || addresses[0]._id?.toString();
        setSelectedAddressId(addressId);
        console.log('🔍 Selected first address ID:', addressId);
      } else {
        console.log('🔍 No addresses available');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      console.error('Error response:', error.response?.data);
      
      // Set empty addresses array if there's an error
      setAddresses([]);
      
      // Show user-friendly error message
      if (error.response?.status === 401) {
        toast.error('Please log in again to access your addresses');
        navigate('/phone-login');
      } else if (error.response?.status === 404) {
        console.log('🔍 No addresses found, this is normal for new users');
        // Don't create default address - let user add their own
      } else {
        toast.error('Failed to load addresses. You can add a new address below.');
      }
    } finally {
      setAddressRequestInProgress(false);
    }
  };

  const addNewAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }
    
    if (addressRequestInProgress) {
      toast.error('Please wait, address request in progress.');
      return;
    }
    
    setSaving(true);
    setAddressRequestInProgress(true);
    try {
      console.log('🔍 Adding new address:', newAddress);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      const response = await axios.post(`${API_BASE_URL}/orders/addresses`, newAddress, {
        headers: headers
      });
      
      console.log('🔍 Add address response:', response.data);
      
      // Handle different response structures
      let newAddressData;
      if (response.data.success && response.data.address) {
        newAddressData = response.data.address;
      } else if (response.data.address) {
        newAddressData = response.data.address;
      } else {
        newAddressData = response.data;
      }
      
      setAddresses(prev => [...prev, newAddressData]);
      setSelectedAddressId(newAddressData._id || newAddressData._id?.toString());
      setShowAddAddress(false);
      setNewAddress({
        label: 'Home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: false
      });
      
      toast.success('Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Please log in again to add addresses');
        navigate('/phone-login');
      } else {
        toast.error('Failed to add address. Please try again.');
      }
    } finally {
      setSaving(false);
      setAddressRequestInProgress(false);
    }
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      await axios.delete(`${API_BASE_URL}/orders/addresses/${addressId}`, {
        headers: headers
      });
      
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      
      // If deleted address was selected, select first available
      if (selectedAddressId === addressId && addresses.length > 1) {
        const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
        setSelectedAddressId(remainingAddresses[0]._id);
      }
      
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address or add a new one');
      return;
    }
    
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all customer information');
      return;
    }
    
    setPlacingOrder(true);
    try {
      let orderData;
      const type = searchParams.get('type');
      
      console.log('🔍 Placing order with type:', type);
      console.log('🔍 Selected address ID:', selectedAddressId);
      console.log('🔍 Customer info:', customerInfo);
      console.log('🔍 Cart items:', cartItems);
      console.log('🔍 Grand total:', grandTotal);
      
      if (type === 'buy-now') {
        // Buy now order
        const buyNowData = JSON.parse(sessionStorage.getItem('buyNowData') || 'null');
        console.log('🔍 Buy now data:', buyNowData);
        
        orderData = {
          type: 'buy-now',
          productId: buyNowData.productId,
          quantity: buyNowData.quantity,
          selectedAddressId,
          customerInfo,
          paymentMethod,
          shippingMethod,
          notes,
          orderWeight: totalWeight // Add total weight
        };
      } else {
        // Cart order
        orderData = {
          type: 'cart',
          items: cartItems.map(item => ({
            productId: item._id,
            quantity: item.quantity,
            price: item.price,
            name: item.name
          })),
          selectedAddressId,
          customerInfo,
          paymentMethod,
          shippingMethod,
          notes,
          totalAmount: grandTotal,
          subtotal: total,
          tax: tax,
          shipping: shipping,
          orderWeight: totalWeight // Add total weight
        };
      }
      
      console.log('🔍 Sending order data to backend:', orderData);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      const response = await axios.post(`${API_BASE_URL}/orders/create`, orderData, {
        headers: headers
      });
      
      console.log('🔍 Order created successfully:', response.data);
      
      // Clear buy now data from sessionStorage
      if (type === 'buy-now') {
        sessionStorage.removeItem('buyNowData');
      }
      
      toast.success('Order placed successfully!');
      
      console.log('🔍 About to navigate to order success page...');
      console.log('🔍 Order details:', response.data.order);
      
      // Save order details to localStorage as backup
      localStorage.setItem('lastOrderDetails', JSON.stringify(response.data.order));
      
      // Redirect to order success page with order details
      navigate('/order-success', { 
        state: { 
          orderDetails: response.data.order,
          orderType: type 
        },
        replace: true
      });
      
      console.log('🔍 Navigation completed');
      
      // Clear cart after successful order
      dispatch(clearCart());
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message);
      toast.error('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const getShippingCost = () => {
    // Use the delivery charges from the cart (already calculated based on weight)
    return shipping || 0;
  };

  const getTotalAmount = () => {
    const shippingCost = getShippingCost();
    const type = searchParams.get('type');
    
    if (type === 'buy-now') {
      const buyNowData = JSON.parse(sessionStorage.getItem('buyNowData') || 'null');
      return (buyNowData?.totalAmount || 0) + shippingCost;
    } else {
      return grandTotal + shippingCost;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 sm:w-1/4 mb-4 sm:mb-8"></div>
            <div className="space-y-3 sm:space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Customer Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center px-3 sm:px-4 py-2 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base self-start sm:self-auto"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add New Address
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-left py-6 sm:py-8">
                  <MapPin className="h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No delivery addresses found</p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">Please add your delivery address to continue with checkout</p>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id || address._id?.toString()}
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-colors ${
                        selectedAddressId === (address._id || address._id?.toString())
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAddressId(address._id || address._id?.toString())}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            {address.label === 'Home' && <Home className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />}
                            {address.label === 'Office' && <Building className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />}
                            {address.label === 'Other' && <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />}
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{address.label}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit address
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddress(address._id || address._id?.toString());
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs sm:text-sm text-gray-600">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Shipping & Payment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Shipping & Payment
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Shipping Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    Shipping Method
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { id: 'standard', name: 'Standard Delivery', cost: 0, time: '3-5 business days' },
                      { id: 'express', name: 'Express Delivery', cost: 100, time: '1-2 business days' },
                      { id: 'same-day', name: 'Same Day Delivery', cost: 200, time: 'Same day' }
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                          shippingMethod === method.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.id}
                            checked={shippingMethod === method.id}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">{method.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600">{method.time}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 text-sm sm:text-base">
                            {method.cost === 0 ? 'Free' : `₹${method.cost}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
                      { id: 'online', name: 'Online Payment', icon: '💳' },
                      { id: 'upi', name: 'UPI Payment', icon: '📱' }
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-lg sm:text-xl">{method.icon}</span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 sticky top-20 sm:top-24"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {currentOrderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={getFirstImageUrl(item.images)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden items-center justify-center w-full h-full">
                        <span className="text-xs text-gray-500">IMG</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.weight && (
                        <p className="text-xs text-gray-500">
                          Weight: {item.weight} {item.unit}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Weight Display */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Total Package Weight</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{formattedWeight}</span>
                </div>
                {totalWeight > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    This includes the weight of all items in your order
                  </p>
                )}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-medium">₹{tax}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {getShippingCost() === 0 ? 'Free' : `₹${getShippingCost()}`}
                  </span>
                </div>
                <div className="border-t pt-2 sm:pt-3">
                  <div className="flex justify-between font-semibold text-sm sm:text-base">
                    <span>Total</span>
                    <span>₹{getTotalAmount()}</span>
                  </div>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={placingOrder || !selectedAddressId}
                className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
              >
                {placingOrder ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 sm:mr-2"></div>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    Place Order
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Add Address Modal */}
        <AnimatePresence>
          {showAddAddress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddAddress(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Label
                      </label>
                      <select
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter street address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="ZIP Code"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                        Set as default address
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => setShowAddAddress(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addNewAddress}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Adding...' : 'Add Address'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout; 