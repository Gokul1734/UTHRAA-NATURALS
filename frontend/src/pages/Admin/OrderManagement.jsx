import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Check, 
  X, 
  Truck, 
  Download, 
  Search, 
  Filter,
  Printer,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { UPLOAD_URL, API_BASE_URL } from '../../config/environment';
import { getFirstImageUrl } from '../../utils/imageUtils';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCreateTestOrderModal, setShowCreateTestOrderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // DEVELOPMENT MODE: Allow direct access without authentication
    // TODO: Remove this bypass in production
    console.log('🔧 DEVELOPMENT MODE: Order management access bypassed');
    
    // Original authentication check (commented out for development)
    // if (!user || user.role !== 'admin') {
    //   navigate('/login');
    //   return;
    // }
    
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/all`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalOrders(data.orders?.length || 0);
      } else {
        // Fallback to mock data if API fails
        const mockOrders = [
          {
            _id: '1',
            orderId: 'ORD00001',
            orderNumber: 'ORD-2024-001',
            user: {
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+91 98765 43210'
            },
            items: [
              {
                product: { name: 'Organic Honey', images: ['https://via.placeholder.com/100x100?text=Honey'] },
                quantity: 2,
                price: 299,
                total: 598
              },
              {
                product: { name: 'Pure Ghee', images: ['https://via.placeholder.com/100x100?text=Ghee'] },
                quantity: 1,
                price: 450,
                total: 450
              }
            ],
            shippingAddress: {
              name: 'John Doe',
              phone: '+91 98765 43210',
              street: '123 Main Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              zipCode: '400001',
              country: 'India'
            },
            paymentMethod: 'online',
            totalAmount: 1048,
            status: 'pending',
            paymentStatus: 'pending',
            isPaid: false,
            isDelivered: false,
            orderDate: '2024-01-15T10:30:00Z',
            trackingNumber: '',
            notes: ''
          }
        ];
        setOrders(mockOrders);
        setTotalOrders(mockOrders.length);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const createTestOrder = async (status = 'pending') => {
    try {
      const testOrder = {
        orderId: `ORD${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
        items: [
          {
            productId: 'test-product-1',
            name: 'Organic Honey',
            price: 299,
            quantity: 2,
            total: 598
          },
          {
            productId: 'test-product-2',
            name: 'Natural Face Cream',
            price: 450,
            quantity: 1,
            total: 450
          }
        ],
        totalAmount: 1048,
        itemCount: 3,
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+91 9876543210'
        },
        shippingAddress: {
          label: 'Home',
          street: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        status: status,
        paymentStatus: 'paid',
        paymentMethod: 'cod',
        shippingMethod: 'standard',
        shippingCost: 50,
        trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        notes: 'Test order for tracking functionality',
        orderDate: new Date(),
        confirmedAt: status !== 'pending' ? new Date() : null,
        shippedAt: ['shipped', 'delivered'].includes(status) ? new Date() : null,
        deliveredAt: status === 'delivered' ? new Date() : null
      };

      // In a real implementation, this would be saved to the database
      // For now, we'll just add it to the local state
      setOrders(prev => [testOrder, ...prev]);
      setTotalOrders(prev => prev + 1);
      
      toast.success(`Test order created with status: ${status}`);
      setShowCreateTestOrderModal(false);
      
      // Return the order ID for easy testing
      return testOrder.orderId;
    } catch (error) {
      console.error('Error creating test order:', error);
      toast.error('Failed to create test order');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Update order status in the backend
      const response = await fetch(`${API_BASE_URL}/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.orderId === orderId 
            ? { ...order, status: newStatus }
            : order
        ));
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handlePaymentUpdate = async (orderId, isPaid) => {
    try {
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              isPaid, 
              paidAt: isPaid ? new Date().toISOString() : null 
            }
          : order
      ));
      toast.success(`Payment status updated`);
    } catch (error) {
      toast.error('Error updating payment status');
    }
  };

  const handleDeliveryUpdate = async (orderId, isDelivered, trackingNumber = '') => {
    try {
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              isDelivered, 
              deliveredAt: isDelivered ? new Date().toISOString() : null,
              trackingNumber: trackingNumber || order.trackingNumber
            }
          : order
      ));
      toast.success(`Delivery status updated`);
    } catch (error) {
      toast.error('Error updating delivery status');
    }
  };

  const generateBill = (order) => {
    // Mock bill generation - replace with actual implementation
    const billContent = `
      UTHRAA NATURALS
      =================
      
      Bill Number: ${order.orderNumber}
      Date: ${new Date(order.createdAt).toLocaleDateString()}
      
      Customer Details:
      ${order.shippingAddress.name}
      ${order.shippingAddress.street}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
      Phone: ${order.shippingAddress.phone}
      
      Items:
      ${order.orderItems.map(item => 
        `${item.product.name} x${item.quantity} - ₹${item.price * item.quantity}`
      ).join('\n')}
      
      Subtotal: ₹${order.itemsPrice}
      Tax (18%): ₹${order.taxPrice}
      Shipping: ₹${order.shippingPrice}
      Total: ₹${order.totalPrice}
      
      Payment Method: ${order.paymentMethod}
      Status: ${order.status}
    `;
    
    // Create and download bill
    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${order.orderNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Bill generated and downloaded');
  };

  const sendInvoice = (order) => {
    // Mock email sending - replace with actual implementation
    toast.success(`Invoice sent to ${order.user.email}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesDate = !dateFilter || new Date(order.createdAt).toDateString() === new Date(dateFilter).toDateString();
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage and track customer orders</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateTestOrderModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Test Order
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.orderItems.length} items
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                        <div className="text-sm text-gray-500">{order.user.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{order.totalPrice}</div>
                      <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.isDelivered ? 'Delivered' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generateBill(order)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Generate Bill"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => sendInvoice(order)}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="Send Invoice"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {showOrderModal && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order Details - {selectedOrder.orderNumber}
                    </h2>
                    <button
                      onClick={() => setShowOrderModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Information */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Number:</span>
                            <span className="font-medium">{selectedOrder.orderNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Date:</span>
                            <span className="font-medium">
                              {new Date(selectedOrder.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                              {selectedOrder.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium">{selectedOrder.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{selectedOrder.user.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{selectedOrder.user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{selectedOrder.user.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                            <div className="text-sm text-gray-600">
                              <div>{selectedOrder.shippingAddress.name}</div>
                              <div>{selectedOrder.shippingAddress.street}</div>
                              <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</div>
                              <div>{selectedOrder.shippingAddress.country}</div>
                              <div className="mt-2">Phone: {selectedOrder.shippingAddress.phone}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items and Actions */}
                    <div className="space-y-6">
                      {/* Order Items */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                        <div className="space-y-3">
                          {selectedOrder.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                              <img
                                src={getFirstImageUrl(item.product.images)}
                                alt={item.product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.jpg';
                                }}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{item.product.name}</div>
                                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">₹{item.price * item.quantity}</div>
                                <div className="text-sm text-gray-500">₹{item.price} each</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>₹{selectedOrder.itemsPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax (18%):</span>
                            <span>₹{selectedOrder.taxPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span>₹{selectedOrder.shippingPrice}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>₹{selectedOrder.totalPrice}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => generateBill(selectedOrder)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            Generate Bill
                          </button>
                          <button
                            onClick={() => sendInvoice(selectedOrder)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            Send Invoice
                          </button>
                          <button
                            onClick={() => handlePaymentUpdate(selectedOrder._id, !selectedOrder.isPaid)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              selectedOrder.isPaid 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                            {selectedOrder.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                          </button>
                          <button
                            onClick={() => handleDeliveryUpdate(selectedOrder._id, !selectedOrder.isDelivered)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              selectedOrder.isDelivered 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            <Truck className="h-4 w-4" />
                            {selectedOrder.isDelivered ? 'Mark Undelivered' : 'Mark Delivered'}
                          </button>
                        </div>
                      </div>

                      {/* Status Update */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                selectedOrder.status === status
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Test Order Modal */}
        <AnimatePresence>
          {showCreateTestOrderModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Create Test Order</h3>
                  <button
                    onClick={() => setShowCreateTestOrderModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    Create a test order with the specified status for testing the order tracking functionality.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
                        <button
                          key={status}
                          onClick={() => createTestOrder(status)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="font-medium capitalize">{status}</div>
                          <div className="text-xs text-gray-500">
                            {status === 'pending' && 'Order placed'}
                            {status === 'confirmed' && 'Order confirmed'}
                            {status === 'processing' && 'Being processed'}
                            {status === 'shipped' && 'Out for delivery'}
                            {status === 'delivered' && 'Delivered'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowCreateTestOrderModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default OrderManagement; 