import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  User
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/environment';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  
  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!user) {
      navigate('/phone-login');
      return;
    }
    
    fetchOrderDetails();
  }, [user, navigate, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
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

  const getOrderStatusSteps = () => {
    const steps = [
      { 
        key: 'pending', 
        label: 'Order Placed', 
        description: 'Your order has been placed successfully',
        icon: <Clock className="h-5 w-5" />
      },
      { 
        key: 'confirmed', 
        label: 'Order Confirmed', 
        description: 'Your order has been confirmed and is being prepared',
        icon: <CheckCircle className="h-5 w-5" />
      },
      { 
        key: 'processing', 
        label: 'Processing', 
        description: 'Your order is being processed and packed',
        icon: <Package className="h-5 w-5" />
      },
      { 
        key: 'shipped', 
        label: 'Shipped', 
        description: 'Your order has been shipped and is on its way',
        icon: <Truck className="h-5 w-5" />
      },
      { 
        key: 'delivered', 
        label: 'Delivered', 
        description: 'Your order has been delivered successfully',
        icon: <CheckCircle className="h-5 w-5" />
      }
    ];
    
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600">Order #{order.orderId}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
              
              <div className="space-y-6">
                {getOrderStatusSteps().map((step, index) => (
                  <div key={step.key} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.current 
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : step.current ? (
                        step.icon
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </h3>
                        {step.timestamp && (
                          <span className={`text-xs ${
                            step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {formatDate(step.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                      {step.current && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-700">
                            <strong>Current Status:</strong> Your order is currently at this stage.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracking Information */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
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
                
                {/* Delivery Progress Bar */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-blue-700 mb-2">
                      <span>Delivery Progress</span>
                      <span>{Math.round((getOrderStatusSteps().findIndex(step => step.current) + 1) / 5 * 100)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(getOrderStatusSteps().findIndex(step => step.current) + 1) / 5 * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6 mt-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500">IMG</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ₹{item.price} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Details Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
              
              <div className="space-y-6">
                {/* Order Information */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{order.orderId}</span>
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
                  <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{order.customerInfo?.name}</span>
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
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{order.shippingAddress?.label}</p>
                        <p>{order.shippingAddress?.street}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                        <p>{order.shippingAddress?.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
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
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Order Notes</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 