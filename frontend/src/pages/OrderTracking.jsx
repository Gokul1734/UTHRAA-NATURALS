import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  ArrowLeft,
  Eye,
  User,
  ShoppingBag,
  FileText,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/environment';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  
  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    console.log('🔍 OrderTracking useEffect triggered');
    console.log('🔍 User:', user);
    console.log('🔍 OrderId:', orderId);
    console.log('🔍 Location state:', location.state);
    
    if (!user) {
      console.log('🔍 No user found, redirecting to login');
      navigate('/phone-login');
      return;
    }
    
    if (!orderId) {
      console.log('🔍 No orderId found, setting error');
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    // Check if order data was passed through navigation state
    if (location.state?.orderData) {
      console.log('🔍 Using order data from location state');
      setOrder(location.state.orderData);
      setLoading(false);
    } else {
      console.log('🔍 Fetching order details from API');
      fetchOrderDetails();
    }

    // Cleanup function
    return () => {
      // No cleanup needed for socket service
    };
  }, [orderId, location.state]);

  const fetchOrderDetails = async () => {
    try {
      console.log('🔍 Starting fetchOrderDetails');
      setLoading(true);
      setError(null);
      
      // Clean the orderId - remove # if present
      const cleanOrderId = orderId?.replace('#', '');
      console.log('🔍 Clean orderId:', cleanOrderId);
      console.log('🔍 API URL:', `${API_BASE_URL}/orders/${cleanOrderId}`);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      const response = await axios.get(`${API_BASE_URL}/orders/${cleanOrderId}`, {
        headers: headers
      });

      console.log('🔍 Order Details response:', response.data);
      
      if (response.data.success) {
        const orderData = response.data.order;
        console.log('🔍 Setting order data:', orderData);
        setOrder(orderData);
      } else {
        console.log('🔍 API returned success: false');
        setError('Order not found');
      }
    } catch (error) {
      console.error('🔍 Error fetching order details:', error);
      console.error('🔍 Error response:', error.response?.data);
      console.error('🔍 Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        setError('Order not found');
      } else if (error.response?.status === 403) {
        setError('Access denied - this order does not belong to you');
      } else {
        setError('Failed to load order details');
      }
      
      toast.error('Failed to load order details', {
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusSteps = () => {
    const steps = [
      { 
        key: 'pending', 
        label: 'Order Placed', 
        description: 'Your order has been placed successfully',
        icon: <Clock className="h-4 w-4" />
      },
      { 
        key: 'confirmed', 
        label: 'Order Confirmed', 
        description: 'Your order has been confirmed and is being prepared',
        icon: <CheckCircle className="h-4 w-4" />
      },
      { 
        key: 'processing', 
        label: 'Processing', 
        description: 'Your order is being processed and packed',
        icon: <Package className="h-4 w-4" />
      },
      { 
        key: 'shipped', 
        label: 'Shipped', 
        description: 'Your order has been shipped and is on its way',
        icon: <Truck className="h-4 w-4" />
      },
      { 
        key: 'delivered', 
        label: 'Delivered', 
        description: 'Your order has been delivered successfully',
        icon: <CheckCircle className="h-4 w-4" />
      }
    ];
    console.log('Order Status:', order);
    const currentIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
      timestamp: getStatusTimestamp(step.key)
    }));
  };

  const getStatusTimestamp = (status) => {
    switch (status) {
      case 'pending':
        return order?.orderDate;
      case 'confirmed':
        return order?.confirmedAt;
      case 'processing':
        return order?.processingAt;
      case 'shipped':
        return order?.shippedAt;
      case 'delivered':
        return order?.deliveredAt;
      default:
        return null;
    }
  };

  const getEstimatedDeliveryDate = () => {
    if (order?.estimatedDelivery) {
      return new Date(order.estimatedDelivery);
    }
    
    // Calculate estimated delivery based on order date and status
    const orderDate = new Date(order?.orderDate);
    const status = order?.status;
    
    let daysToAdd = 5; // Default 5 days for standard delivery
    
    switch (status) {
      case 'pending':
      case 'confirmed':
        daysToAdd = 5;
        break;
      case 'processing':
        daysToAdd = 4;
        break;
      case 'shipped':
        daysToAdd = 2;
        break;
      case 'delivered':
        return orderDate;
      default:
        daysToAdd = 5;
    }
    
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    return estimatedDate;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    const steps = getOrderStatusSteps();
    const currentIndex = steps.findIndex(step => step.current);
    return Math.round(((currentIndex + 1) / steps.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white rounded-xl shadow-sm border p-8"
          >
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error === 'Order ID is required' ? 'Invalid Order URL' : 'Order Not Found'}
            </h2>
            <p className="text-gray-600 mb-4">
              {error === 'Order ID is required' 
                ? 'The order tracking URL is invalid. Please check the link and try again.'
                : error
              }
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
            )}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
              <button
                onClick={() => navigate('/orders')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                View All Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600">Order {order.orderId}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getOrderStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Order Progress</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{getProgressPercentage()}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>
              
              {/* Status Steps */}
              <div className="space-y-6">
                {getOrderStatusSteps().map((step, index) => (
                  <motion.div 
                    key={step.key} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    {/* Step Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      step.completed 
                        ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                        : step.current 
                          ? 'bg-blue-500 border-blue-500 text-white shadow-lg animate-pulse'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : step.current ? (
                        step.icon
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                        <h3 className={`font-semibold text-base ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </h3>
                        {step.timestamp && (
                          <span className={`text-sm ${
                            step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {formatDate(step.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                      
                      {/* Current Status Highlight */}
                      {step.current && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <p className="text-sm text-blue-700 font-medium">
                            <strong>Current Status:</strong> Your order is currently at this stage.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tracking Information */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
              >
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center text-lg">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Shipping Method:</span>
                      <span className="font-semibold text-blue-900 capitalize">
                        {order.shippingMethod === 'standard' ? 'Standard Delivery' : 
                         order.shippingMethod === 'express' ? 'Express Delivery' : 
                         order.shippingMethod === 'same-day' ? 'Same Day Delivery' : 
                         order.shippingMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Shipping Cost:</span>
                      <span className="font-semibold text-blue-900">
                        {order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">Tracking Number:</span>
                        <span className="font-semibold text-blue-900 font-mono">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Order Date:</span>
                      <span className="font-semibold text-blue-900">
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Estimated Delivery:</span>
                      <span className="font-semibold text-blue-900">
                        {formatDate(getEstimatedDeliveryDate())}
                      </span>
                    </div>
                    {order.status === 'shipped' && order.estimatedDelivery && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">Expected Delivery:</span>
                        <span className="font-semibold text-blue-900">
                          {formatDate(order.estimatedDelivery)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border p-6 mt-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-500 font-medium">IMG</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ₹{item.price} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">₹{item.total}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Details Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border p-6 sticky top-24 space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
              
              {/* Order Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Order Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{formatDate(order.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium">{order.customerInfo?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{order.customerInfo?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{order.customerInfo?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-semibold">{order.shippingAddress?.label}</p>
                      <p>{order.shippingAddress?.street}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                      <p>{order.shippingAddress?.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{order.totalAmount - (order.shippingCost || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">₹{order.shippingCost || 0}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 