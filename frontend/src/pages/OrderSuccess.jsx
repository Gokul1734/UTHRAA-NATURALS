import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  Package, 
  Truck, 
  Home, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  ArrowRight,
  Download,
  Share2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/environment';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(location.state?.orderDetails || null);
  const [loading, setLoading] = useState(false);

  // Safety check for API_BASE_URL
  const apiBaseUrl = API_BASE_URL || 'http://localhost:5000/api';
  console.log('🔍 API_BASE_URL:', apiBaseUrl);

  console.log('🔍 OrderSuccess component mounted');
  console.log('🔍 Location state:', location.state);
  console.log('🔍 Order details from state:', location.state?.orderDetails);

  useEffect(() => {
    // If no order details in state, try to get from localStorage or redirect
    if (!orderDetails) {
      console.log('🔍 No order details in state, checking localStorage...');
      const savedOrder = localStorage.getItem('lastOrderDetails');
      if (savedOrder) {
        console.log('🔍 Found order details in localStorage');
        setOrderDetails(JSON.parse(savedOrder));
      } else {
        console.log('🔍 No order details found, redirecting to home');
        // Redirect to home if no order details
        navigate('/', { replace: true });
      }
    } else {
      console.log('🔍 Order details found in state, saving to localStorage');
      // Save order details to localStorage for persistence
      localStorage.setItem('lastOrderDetails', JSON.stringify(orderDetails));
    }
  }, [orderDetails, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-purple-600 bg-purple-100';
      case 'shipped':
        return 'text-orange-600 bg-orange-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'confirmed':
        return <Check className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <Check className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const downloadInvoice = async () => {
    if (!orderDetails?.orderId) {
      toast.error('Order details not available');
      return;
    }
    
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header for invoice download');
      }
      
      console.log('🔍 Downloading invoice for order:', orderDetails.orderId);
      console.log('🔍 Invoice API URL:', `${apiBaseUrl}/orders/${orderDetails.orderId}/invoice`);
      
      // First, test if the API is available
      const healthCheck = await fetch(`${apiBaseUrl.replace('/api', '')}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!healthCheck.ok) {
        console.log('🔍 API health check failed, showing fallback message');
        toast.error('Invoice service temporarily unavailable. Please try again later.');
        return;
      }
      
      const response = await axios.get(
        `${apiBaseUrl}/orders/${orderDetails.orderId}/invoice`,
        {
          headers: headers,
          responseType: 'blob'
        }
      );
      
      console.log('🔍 Invoice download successful');
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderDetails.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('🔍 Error downloading invoice:', error);
      if (error.response?.status === 404) {
        toast.error('Invoice not available for this order');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Invoice service temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to download invoice');
      }
    } finally {
      setLoading(false);
    }
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Order Details',
        text: `Order ID: ${orderDetails?.orderId}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Order ID: ${orderDetails?.orderId}`);
    }
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-8 text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6 text-lg">
            Thank you for your order. We'll send you updates on your order status via email and SMS.
          </p>
          
          {/* Order ID Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
            <Package className="h-4 w-4 mr-2" />
            Order ID: {orderDetails.orderId}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium text-gray-900">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(orderDetails.orderDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-lg text-gray-900">₹{orderDetails.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                    {getStatusIcon(orderDetails.status)}
                    <span className="ml-1 capitalize">{orderDetails.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipping Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-left text-gray-900">Delivery Address</h3>
                    <p className="text-gray-600 text-left text-sm">
                      {orderDetails.shippingAddress?.label && (
                        <span className="block font-medium">{orderDetails.shippingAddress.label}</span>
                      )}
                      {orderDetails.shippingAddress?.street}<br />
                      {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state} {orderDetails.shippingAddress?.zipCode}<br />
                      {orderDetails.shippingAddress?.country}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-left text-gray-900">Estimated Delivery</h3>
                    <p className="text-gray-600 text-left text-sm">
                      {orderDetails.estimatedDelivery 
                        ? new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '3-5 business days'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              
              <div className="space-y-4 text-left">
                <div className="flex justify-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-gray-600 text-left text-sm">Email</span>
                    <p className="font-medium text-gray-900">{orderDetails.customerInfo?.email}</p>
                  </div>
                </div>
                
                <div className="flex justify-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-gray-600 text-left text-sm">Phone</span>
                    <p className="font-medium text-gray-900">{orderDetails.customerInfo?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    if (!orderDetails?.orderId) {
                      toast.error('Order details not available');
                      return;
                    }
                    
                    try {
                      const token = sessionStorage.getItem('token');
                      console.log('🔍 Token available:', !!token);
                      
                      const headers = {
                        'Content-Type': 'application/json',
                      };
                      
                      if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                        console.log('🔍 Added Authorization header');
                        
                        // Validate token by checking user profile
                        try {
                          const profileResponse = await fetch(`${apiBaseUrl}/auth/profile`, {
                            headers: headers
                          });
                          
                          if (!profileResponse.ok) {
                            console.log('🔍 Token validation failed, using fallback navigation');
                            // Fallback: Navigate to order tracking with current order data
                            const cleanOrderId = orderDetails.orderId?.replace(/^#/, '') || orderDetails.orderId;
                            navigate(`/order-tracking/${cleanOrderId}`, { 
                              state: { orderData: orderDetails } 
                            });
                            return;
                          }
                          
                          console.log('🔍 Token validation successful');
                        } catch (profileError) {
                          console.log('🔍 Token validation error, using fallback navigation');
                          // Fallback: Navigate to order tracking with current order data
                          const cleanOrderId = orderDetails.orderId?.replace(/^#/, '') || orderDetails.orderId;
                          navigate(`/order-tracking/${cleanOrderId}`, { 
                            state: { orderData: orderDetails } 
                          });
                          return;
                        }
                      } else {
                        console.log('🔍 No token available, will use fallback navigation');
                        // Fallback: Navigate to order tracking with current order data
                        const cleanOrderId = orderDetails.orderId?.replace(/^#/, '') || orderDetails.orderId;
                        navigate(`/order-tracking/${cleanOrderId}`, { 
                          state: { orderData: orderDetails } 
                        });
                        return;
                      }
                      
                      // Clean orderId to remove any leading '#' (if present)
                      // Defensive: If orderId is missing or not a string, fallback to empty string
                      let cleanOrderId = '';
                      if (orderDetails.orderId && typeof orderDetails.orderId === 'string') {
                        cleanOrderId = orderDetails.orderId.replace(/^#/, '');
                      } else if (orderDetails.orderId) {
                        cleanOrderId = String(orderDetails.orderId).replace(/^#/, '');
                      }

                      console.log('🔍 Clean orderId:', cleanOrderId);
                      console.log('🔍 API URL:', `${apiBaseUrl}/orders/${cleanOrderId}`);
                      
                      // First, test if the API is available
                      const healthCheck = await fetch(`${apiBaseUrl.replace('/api', '')}/api/health`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      
                      if (!healthCheck.ok) {
                        console.log('🔍 API health check failed, using fallback navigation');
                        // Fallback: Navigate to order tracking with current order data
                        navigate(`/order-tracking/${cleanOrderId}`, { 
                          state: { orderData: orderDetails } 
                        });
                        return;
                      }
                      
                      const response = await fetch(`${apiBaseUrl}/orders/${cleanOrderId}`, {
                        headers: headers
                      });
                      
                      console.log('🔍 Response status:', response.status);
                      console.log('🔍 Response headers:', response.headers);
                      
                      // Check if response is JSON
                      const contentType = response.headers.get('content-type');
                      if (!contentType || !contentType.includes('application/json')) {
                        console.error('🔍 API returned non-JSON response:', contentType);
                        console.log('🔍 Using fallback navigation with current order data');
                        // Fallback: Navigate to order tracking with current order data
                        navigate(`/order-tracking/${cleanOrderId}`, { 
                          state: { orderData: orderDetails } 
                        });
                        return;
                      }
                      
                      if (response.ok) {
                        const data = await response.json();
                        console.log('🔍 Order data received:', data);
                        // Navigate with order data, use cleanOrderId in URL
                        navigate(`/order-tracking/${cleanOrderId}`, { 
                          state: { orderData: data.order } 
                        });
                      } else {
                        console.error('🔍 API error response:', response.status, response.statusText);
                        
                        // Try to get error details
                        try {
                          const errorData = await response.json();
                          console.log('🔍 Error details:', errorData);
                        } catch (parseError) {
                          console.log('🔍 Could not parse error response');
                        }
                        
                        if (response.status === 401) {
                          console.log('🔍 Unauthorized - token might be expired, using fallback navigation');
                          // Fallback: Navigate to order tracking with current order data
                          navigate(`/order-tracking/${cleanOrderId}`, { 
                            state: { orderData: orderDetails } 
                          });
                        } else if (response.status === 403) {
                          console.log('🔍 Forbidden - order might not belong to user, using fallback navigation');
                          // Fallback: Navigate to order tracking with current order data
                          navigate(`/order-tracking/${cleanOrderId}`, { 
                            state: { orderData: orderDetails } 
                          });
                        } else if (response.status === 404) {
                          console.log('🔍 Order not found in API, using fallback navigation');
                          // Fallback: Navigate to order tracking with current order data
                          navigate(`/order-tracking/${cleanOrderId}`, { 
                            state: { orderData: orderDetails } 
                          });
                        } else {
                          toast.error('Failed to load order details');
                        }
                      }
                    } catch (error) {
                      console.error('🔍 Error fetching order:', error);
                      if (error.name === 'SyntaxError') {
                        console.log('🔍 JSON parsing error, using fallback navigation');
                        // Fallback: Navigate to order tracking with current order data
                        const cleanOrderId = orderDetails.orderId?.replace(/^#/, '') || orderDetails.orderId;
                        navigate(`/order-tracking/${cleanOrderId}`, { 
                          state: { orderData: orderDetails } 
                        });
                      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                        console.log('🔍 Network error, using fallback navigation');
                        // Fallback: Navigate to order tracking with current order data
                        const cleanOrderId = orderDetails.orderId?.replace(/^#/, '') || orderDetails.orderId;
                        navigate(`/order-tracking/${cleanOrderId}`, { 
                          state: { orderData: orderDetails } 
                        });
                      } else {
                        toast.error('Failed to load order details');
                      }
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium text-blue-900">Track Order</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </button>
                
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-green-900">View All Orders</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </button>
                
                <button
                  onClick={downloadInvoice}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-purple-900">
                      {loading ? 'Downloading...' : 'Download Invoice'}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                </button>
                
                <button
                  onClick={shareOrder}
                  className="w-full flex items-center justify-between p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Share2 className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="font-medium text-orange-900">Share Order</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-orange-600" />
                </button>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Shopping</h3>
              <p className="text-gray-600 text-left text-sm mb-4">
                Discover more amazing products from our collection.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Browse Products
              </button>
            </div>

            {/* Support */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our customer support team is here to help you.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@uthraanaturals.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 