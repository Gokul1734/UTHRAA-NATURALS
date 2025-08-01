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
  Truck
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Fetch dashboard stats
    fetchDashboardStats();
  }, [user, navigate]);

  const fetchDashboardStats = async () => {
    try {
      // This would be replaced with actual API calls
      setStats({
        totalProducts: 156,
        totalOrders: 89,
        totalUsers: 234,
        totalRevenue: 125000,
        pendingOrders: 12,
        lowStockItems: 8
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const adminModules = [
    {
      title: 'Product Management',
      description: 'Add, edit, and manage products',
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/products'
    },
    {
      title: 'Order Management',
      description: 'Process orders and track deliveries',
      icon: ShoppingCart,
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    {
      title: 'User Management',
      description: 'Manage customer accounts',
      icon: Users,
      color: 'bg-purple-500',
      href: '/admin/users'
    },
    {
      title: 'Finance Management',
      description: 'Track revenue and financial reports',
      icon: DollarSign,
      color: 'bg-yellow-500',
      href: '/admin/finance'
    },
    {
      title: 'Stock Management',
      description: 'Monitor inventory levels',
      icon: TrendingUp,
      color: 'bg-red-500',
      href: '/admin/stock'
    },
    {
      title: 'Advertisement Management',
      description: 'Manage popups and promotions',
      icon: Image,
      color: 'bg-indigo-500',
      href: '/admin/advertisements'
    },
    {
      title: 'Delivery Management',
      description: 'Track shipments and delivery instructions',
      icon: Truck,
      color: 'bg-orange-500',
      href: '/admin/delivery'
    },
    {
      title: 'Reports & Analytics',
      description: 'View detailed reports and insights',
      icon: FileText,
      color: 'bg-teal-500',
      href: '/admin/reports'
    },
    {
      title: 'System Settings',
      description: 'Configure website settings',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/admin/settings'
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(module.href)}
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 ${module.color} rounded-lg`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">{module.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{module.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard; 