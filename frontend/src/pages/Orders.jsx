import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Eye,
  Calendar,
  MapPin,
  CreditCard,
  Phone,
  Mail
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/environment';

const Orders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  
  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!user) {
      navigate('/phone-login');
      return;
    }
    
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      const response = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
        headers: headers
      });
      
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
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
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return 'Order placed, waiting for confirmation';
      case 'confirmed':
        return 'Order confirmed, preparing for processing';
      case 'processing':
        return 'Order is being processed and packed';
      case 'shipped':
        return 'Order has been shipped and is on its way';
      case 'delivered':
        return 'Order has been delivered successfully';
      case 'cancelled':
        return 'Order has been cancelled';
      case 'refunded':
        return 'Order has been refunded';
      default:
        return 'Order status unknown';
    }
  };

  const getEstimatedDeliveryDate = (order) => {
    if (order?.estimatedDelivery) {
      return new Date(order.estimatedDelivery);
    }
    
    const orderDate = new Date(order?.orderDate);
    const status = order?.status;
    
    let daysToAdd = 5;
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewOrderDetails = async (orderId) => {
    try {
      console.log('🔍 Fetching order details for:', orderId);
      console.log('🔍 API URL:', `${API_BASE_URL}/orders/${orderId}`);
      console.log('🔍 Token:', token ? 'Present' : 'Missing');
      
      setLoadingOrderDetails(true);
      setShowOrderDetails(true);
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: headers
      });
      
      console.log('🔍 Order details received:', response.data.order);
      setSelectedOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      console.error('🔍 Error response:', error.response?.data);
      console.error('🔍 Error status:', error.response?.status);
      console.error('🔍 Error message:', error.message);
      
      if (error.response?.status === 404) {
        toast.error('Order not found');
      } else if (error.response?.status === 403) {
        toast.error('Access denied to this order');
      } else if (error.response?.status === 401) {
        toast.error('Please login again');
      } else {
        toast.error('Failed to load order details');
      }
      setShowOrderDetails(false);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your orders and view order history</p>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 sm:py-12"
          >
            <Package className="h-12 sm:h-16 w-12 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Start Shopping
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id || order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        {getOrderStatusIcon(order.status)}
                        <div className="flex flex-col">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 hidden sm:block">
                            {getOrderStatusDescription(order.status)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-left text-gray-900 text-sm sm:text-base">Order #{order.orderId}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {formatDate(order.orderDate)}
                        </p>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <p className="text-xs text-blue-600 mt-1">
                            Estimated delivery: {formatDate(getEstimatedDeliveryDate(order))}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-semibold text-gray-900">₹{order.totalAmount}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {order.shippingMethod === 'standard' ? 'Standard' : 
                         order.shippingMethod === 'express' ? 'Express' : 
                         order.shippingMethod === 'same-day' ? 'Same Day' : 
                         order.shippingMethod} delivery
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    {order.items.slice(0, 2).map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-2 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-left text-gray-900 text-xs sm:text-sm truncate">{item.name}</h4>
                          <p className="text-xs sm:text-sm text-left text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 text-xs sm:text-sm">₹{item.total}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs sm:text-sm text-gray-600 text-center">
                        +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-gray-200 space-y-3 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>{order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="capitalize">{order.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            // Clean orderId to remove any leading '#' (if present)
                            const cleanOrderId = order.orderId?.replace(/^#/, '');
                            
                            const headers = {
                              'Content-Type': 'application/json',
                            };
                            
                            // Add authorization header if token exists
                            const token = sessionStorage.getItem('token');
                            if (token) {
                              headers['Authorization'] = `Bearer ${token}`;
                              console.log('🔍 Added Authorization header');
                            }
                            
                            // Fetch order details via API
                            const response = await fetch(`${API_BASE_URL}/orders/${cleanOrderId}`, {
                              headers: headers
                            });
                            
                            if (response.ok) {
                              const data = await response.json();
                              // Navigate with order data, use cleanOrderId in URL
                              navigate(`/order-tracking/${cleanOrderId}`, { 
                                state: { orderData: data.order } 
                              });
                            } else {
                              toast.error('Failed to load order details');
                            }
                          } catch (error) {
                            console.error('Error fetching order:', error);
                            toast.error('Failed to load order details');
                          }
                        }}
                        className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                      >
                        <Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => {
              console.log('🔍 Clicked outside modal');
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                    {loadingOrderDetails ? 'Loading Order Details...' : `Order Details - #${selectedOrder?.orderId}`}
                  </h2>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {!loadingOrderDetails && selectedOrder && (
                      <button
                        onClick={async () => {
                          try {
                            // Fetch order details via API
                            const orderId = selectedOrder.orderId?.replace(/^#/, '');
                            console.log('🔍 Order ID:', orderId);
                            
                            const headers = {
                              'Content-Type': 'application/json',
                            };
                            
                            // Add authorization header if token exists
                            const token = sessionStorage.getItem('token');
                            if (token) {
                              headers['Authorization'] = `Bearer ${token}`;
                              console.log('🔍 Added Authorization header');
                            }
                            
                            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                              headers: headers
                            });
                            
                            if (response.ok) {
                              const data = await response.json();
                              // Navigate with order data
                              navigate(`/order-tracking/${orderId}`, { 
                                state: { orderData: data.order } 
                              });
                            } else {
                              toast.error('Failed to load order details');
                            }
                          } catch (error) {
                            console.error('Error fetching order:', error);
                            toast.error('Failed to load order details');
                          }
                        }}
                        className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                      >
                        <Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Track Order
                      </button>
                    )}
                    <button
                      onClick={() => {
                        console.log('🔍 Closing modal');
                        setShowOrderDetails(false);
                        setSelectedOrder(null);
                      }}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </div>
                </div>

                {loadingOrderDetails ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600">Loading order details...</span>
                  </div>
                ) : (
                  <>
                    {console.log('🔍 Rendering modal with order:', selectedOrder)}

                    {/* Order Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Order Information
                        </h3>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium font-mono">{selectedOrder.orderId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Date:</span>
                            <span className="font-medium">{formatDate(selectedOrder.orderDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getOrderStatusColor(selectedOrder.status)}`}>
                              {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium capitalize">{selectedOrder.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                              selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping Method:</span>
                            <span className="font-medium capitalize">
                              {selectedOrder.shippingMethod === 'standard' ? 'Standard Delivery' : 
                               selectedOrder.shippingMethod === 'express' ? 'Express Delivery' : 
                               selectedOrder.shippingMethod === 'same-day' ? 'Same Day Delivery' : 
                               selectedOrder.shippingMethod}
                            </span>
                          </div>
                          {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated Delivery:</span>
                              <span className="font-medium text-blue-600">
                                {formatDate(getEstimatedDeliveryDate(selectedOrder))}
                              </span>
                            </div>
                          )}
                          {selectedOrder.trackingNumber && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tracking Number:</span>
                              <span className="font-medium font-mono">{selectedOrder.trackingNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Shipping Address
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-600">
                          <p className="font-medium text-gray-900">{selectedOrder.customerInfo?.name}</p>
                          {selectedOrder.shippingAddress?.label && (
                            <p className="text-xs text-gray-500 mb-1">({selectedOrder.shippingAddress.label})</p>
                          )}
                          <p>{selectedOrder.shippingAddress?.street}</p>
                          <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                          <p>{selectedOrder.shippingAddress?.country}</p>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {selectedOrder.customerInfo?.phone}
                            </p>
                            <p className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {selectedOrder.customerInfo?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Order Status Timeline
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <div className="space-y-2 sm:space-y-3">
                          {[
                            { status: 'pending', label: 'Order Placed', timestamp: selectedOrder.orderDate },
                            { status: 'confirmed', label: 'Order Confirmed', timestamp: selectedOrder.confirmedAt },
                            { status: 'processing', label: 'Processing', timestamp: selectedOrder.processingAt },
                            { status: 'shipped', label: 'Shipped', timestamp: selectedOrder.shippedAt },
                            { status: 'delivered', label: 'Delivered', timestamp: selectedOrder.deliveredAt }
                          ].map((step, index) => {
                            const isCompleted = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status) >= index;
                            const isCurrent = selectedOrder.status === step.status;
                            
                            return (
                              <div key={step.status} className="flex items-center space-x-2 sm:space-x-3">
                                <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                  ) : (
                                    <span className="text-xs">{index + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className={`text-xs sm:text-sm font-medium ${
                                    isCompleted ? 'text-gray-900' : 'text-gray-500'
                                  }`}>
                                    {step.label}
                                  </span>
                                  {step.timestamp && (
                                    <span className="text-xs text-gray-500 ml-1 sm:ml-2">
                                      {formatDate(step.timestamp)}
                                    </span>
                                  )}
                                </div>
                                {isCurrent && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Order Items</h3>
                      <div className="space-y-3 sm:space-y-4">
                        {selectedOrder.items?.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-500">IMG</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
                              <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-xs sm:text-sm text-gray-600">Price: ₹{item.price} each</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{item.total}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Order Summary</h3>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">₹{selectedOrder.totalAmount - (selectedOrder.shippingCost || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium">₹{selectedOrder.shippingCost || 0}</span>
                        </div>
                        <div className="border-t pt-1.5 sm:pt-2">
                          <div className="flex justify-between font-semibold text-sm sm:text-base">
                            <span>Total:</span>
                            <span>₹{selectedOrder.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div className="mt-4 sm:mt-6">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Order Notes</h3>
                        <p className="text-gray-600 text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded-lg">
                          {selectedOrder.notes}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 