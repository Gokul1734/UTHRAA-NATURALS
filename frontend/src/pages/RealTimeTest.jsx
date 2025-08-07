import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Wifi,
  WifiOff,
  Play,
  Square
} from 'lucide-react';
import toast from 'react-hot-toast';
import socketService from '../services/socketService';

const RealTimeTest = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [orderId, setOrderId] = useState('TEST-ORDER-001');
  const [currentStatus, setCurrentStatus] = useState('pending');
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  useEffect(() => {
    // Connect to Socket.IO
    const socket = socketService.connect();
    setIsConnected(socketService.getConnectionStatus());

    // Listen for connection status changes
    socket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected to real-time server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Disconnected from real-time server');
    });

    // Listen for order status updates
    const handleStatusUpdate = (data) => {
      console.log('📦 Received real-time update:', data);
      if (data.orderId === orderId) {
        setCurrentStatus(data.status);
        setLastUpdate(new Date());
        toast.success(`Order status updated to: ${data.status}`, {
          duration: 3000,
          icon: '📦'
        });
      }
    };

    socketService.onOrderStatusUpdate(handleStatusUpdate);

    return () => {
      socketService.offOrderStatusUpdate(handleStatusUpdate);
    };
  }, [orderId]);

  const startTracking = () => {
    socketService.joinOrderTracking(orderId);
    setIsTracking(true);
    toast.success(`Started tracking order: ${orderId}`);
  };

  const stopTracking = () => {
    socketService.leaveOrderTracking(orderId);
    setIsTracking(false);
    toast.success(`Stopped tracking order: ${orderId}`);
  };

  const simulateAdminUpdate = (status) => {
    socketService.emitAdminStatusUpdate({
      orderId,
      status,
      trackingNumber: 'TRK123456789',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'confirmed': return <CheckCircle className="h-5 w-5" />;
      case 'processing': return <Package className="h-5 w-5" />;
      case 'shipped': return <Truck className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Order Tracking Test</h1>
          <p className="text-gray-600">Test the real-time order status update functionality</p>
        </div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Status</h2>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {lastUpdate && (
              <div className="text-sm text-gray-600">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Tracking</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter order ID"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={startTracking}
                disabled={isTracking}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  isTracking
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Play className="h-4 w-4" />
                <span>Start Tracking</span>
              </button>
              
              <button
                onClick={stopTracking}
                disabled={!isTracking}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  !isTracking
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <Square className="h-4 w-4" />
                <span>Stop Tracking</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Current Status:</span>
              <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                {getStatusIcon(currentStatus)}
                <span>{currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Admin Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Simulation</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click the buttons below to simulate admin status updates. 
            {isTracking ? ' You should see real-time updates!' : ' Start tracking first to see updates.'}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => simulateAdminUpdate(status)}
                disabled={!isTracking}
                className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  !isTracking
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {getStatusIcon(status)}
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RealTimeTest; 