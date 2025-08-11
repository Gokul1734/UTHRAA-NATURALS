import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Settings,
  FileText,
  Image,
  Truck,
  Folder,
  Loader2,
  Eye,
  Edit,
  Plus,
  ArrowRight,
  TrendingDown,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { API_BASE_URL, UPLOAD_URL } from '../../config/environment';
import { getFirstImageUrl } from '../../utils/imageUtils';

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    overview: {},
    analytics: {},
    recentOrders: [],
    topProducts: [],
    salesData: [],
    orderStatusBreakdown: {},
    userGrowth: [],
    revenueGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // DEVELOPMENT MODE: Allow direct access without authentication
    // TODO: Remove this bypass in production
    console.log('🔧 DEVELOPMENT MODE: Admin dashboard access bypassed');
    
    // Original authentication check (commented out for development)
    // if (!user || user.role !== 'admin') {
    //   navigate('/login');
    //   return;
    // }

    // Fetch dashboard stats
    fetchDashboardStats();
  }, [user, navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-600', text: 'Out of Stock' };
    if (stock <= 10) return { color: 'text-orange-600', text: 'Low Stock' };
    return { color: 'text-green-600', text: 'In Stock' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  };

  const adminModules = [
    {
      title: 'Products',
      description: 'Add, edit, and manage products',
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/products'
    },
    {
      title: 'Categories',
      description: 'Organize products into categories',
      icon: Folder,
      color: 'bg-indigo-500',
      href: '/admin/categories'
    },
    {
      title: 'Orders',
      description: 'Process orders and track deliveries',
      icon: ShoppingCart,
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    {
      title: 'Users',
      description: 'Manage customer accounts',
      icon: Users,
      color: 'bg-purple-500',
      href: '/admin/users'
    },
    {
      title: 'Tax and Offers',
      description: 'Track revenue and financial reports',
      icon: DollarSign,
      color: 'bg-yellow-500',
      href: '/admin/finance'
    },
    {
      title: 'Stock',
      description: 'Monitor inventory levels',
      icon: TrendingUp,
      color: 'bg-red-500',
      href: '/admin/stock'
    },
    {
      title: 'Ads',
      description: 'Manage popups and promotions',
      icon: Image,
      color: 'bg-indigo-500',
      href: '/admin/advertisements'
    },
    {
      title: 'Delivery',
      description: 'Track shipments and delivery instructions',
      icon: Truck,
      color: 'bg-orange-500',
      href: '/admin/delivery'
    },
    {
      title: 'Reports',
      description: 'View detailed reports and insights',
      icon: FileText,
      color: 'bg-teal-500',
      href: '/admin/reports'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/admin/settings'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard statistics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.overview.totalOrders || 0)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.overview.totalRevenue || 0)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.overview.totalUsers || 0)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardStats.overview.totalProducts || 0)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Analytics</h3>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium text-gray-900">{formatNumber(dashboardStats.overview.activeUsers || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Verified Users</span>
                <span className="text-sm font-medium text-gray-900">{formatNumber(dashboardStats.overview.verifiedUsers || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Categories</span>
                <span className="text-sm font-medium text-gray-900">{formatNumber(dashboardStats.overview.totalCategories || 0)}</span>
              </div>
            </div>
          </motion.div>

          {/* Order Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Analytics</h3>
              <ShoppingCart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="text-sm font-medium text-orange-600">{formatNumber(dashboardStats.overview.pendingOrders || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivered Orders</span>
                <span className="text-sm font-medium text-green-600">{formatNumber(dashboardStats.overview.deliveredOrders || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(dashboardStats.analytics.revenueAnalytics?.averageOrderValue || 0)}</span>
              </div>
            </div>
          </motion.div>

          {/* Inventory Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Analytics</h3>
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Low Stock Items</span>
                <span className="text-sm font-medium text-orange-600">{formatNumber(dashboardStats.overview.lowStockProducts || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Out of Stock</span>
                <span className="text-sm font-medium text-red-600">{formatNumber(dashboardStats.analytics.inventoryAnalytics?.outOfStockProducts || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Stock Level</span>
                <span className="text-sm font-medium text-gray-900">{Math.round(dashboardStats.analytics.inventoryAnalytics?.averageStock || 0)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Order Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(dashboardStats.orderStatusBreakdown || {}).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                  status === 'delivered' ? 'bg-green-100' :
                  status === 'shipped' ? 'bg-blue-100' :
                  status === 'processing' ? 'bg-yellow-100' :
                  status === 'confirmed' ? 'bg-purple-100' :
                  status === 'pending' ? 'bg-orange-100' :
                  status === 'cancelled' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  {status === 'delivered' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                   status === 'shipped' ? <Truck className="h-6 w-6 text-blue-600" /> :
                   status === 'processing' ? <RefreshCw className="h-6 w-6 text-yellow-600" /> :
                   status === 'confirmed' ? <CheckCircle className="h-6 w-6 text-purple-600" /> :
                   status === 'pending' ? <Clock className="h-6 w-6 text-orange-600" /> :
                   status === 'cancelled' ? <XCircle className="h-6 w-6 text-red-600" /> :
                   <FileText className="h-6 w-6 text-gray-600" />}
                </div>
                <p className="text-sm font-medium text-gray-900">{formatNumber(count)}</p>
                <p className="text-xs text-gray-500 capitalize">{status}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {dashboardStats.recentOrders?.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {dashboardStats.topProducts?.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">Sales: {formatNumber(product.sales)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</p>
                    <p className={`text-xs font-medium ${getStockStatus(product.stock).color}`}>
                      {getStockStatus(product.stock).text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 6 Months)</h3>
            <div className="space-y-2">
              {dashboardStats.userGrowth?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(item.users / Math.max(...dashboardStats.userGrowth.map(u => u.users))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatNumber(item.users)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Revenue Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth (Last 6 Months)</h3>
            <div className="space-y-2">
              {dashboardStats.revenueGrowth?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(item.revenue / Math.max(...dashboardStats.revenueGrowth.map(r => r.revenue))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Admin Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {adminModules.map((module, index) => (
              <motion.button
                key={module.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                onClick={() => navigate(module.href)}
                className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{module.title}</h4>
                <p className="text-xs text-gray-500">{module.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard; 