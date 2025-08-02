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
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { API_BASE_URL, UPLOAD_URL } from '../../config/environment';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Helper function to get proper image URL for categories
  const getCategoryImageSrc = (imageUrl) => {
    if (!imageUrl) return '/placeholder-category.jpg';
    
    // If it's already a complete URL (starts with http), use as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it starts with /uploads, it's our uploaded file - prepend server URL
    if (imageUrl.startsWith('/uploads')) {
      return `${UPLOAD_URL}${imageUrl}`;
    }
    
    // If it's just a filename, assume it's in the uploads folder
    if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
      return `${UPLOAD_URL}/uploads/${imageUrl}`;
    }
    
    // For category images, try the categories subfolder
    if (!imageUrl.startsWith('/uploads/categories')) {
      return `${UPLOAD_URL}/uploads/categories/${imageUrl}`;
    }
    
    // Otherwise assume it's a relative path and prepend server URL
    return `${UPLOAD_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  // Helper function to get proper image URL for products
  const getProductImageSrc = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    
    // If it's already a complete URL (starts with http), use as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it starts with /uploads, it's our uploaded file - prepend server URL
    if (imageUrl.startsWith('/uploads')) {
      return `${UPLOAD_URL}${imageUrl}`;
    }
    
    // If it's just a filename, assume it's in the uploads folder
    if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
      return `${UPLOAD_URL}/uploads/${imageUrl}`;
    }
    
    // For product images, try the products subfolder
    if (!imageUrl.startsWith('/uploads/products')) {
      return `${UPLOAD_URL}/uploads/products/${imageUrl}`;
    }
    
    // Otherwise assume it's a relative path and prepend server URL
    return `${UPLOAD_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

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
      setStats({
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalUsers: data.totalUsers || 0,
        totalRevenue: data.totalRevenue || 0,
        pendingOrders: data.pendingOrders || 0,
        lowStockItems: data.lowStockItems || 0
      });

      // Set recent products and products by category
      setRecentProducts(data.recentProducts || []);
      setProductsByCategory(data.productsByCategory || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
      
      // Fallback to empty data if API fails
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockItems: 0
      });
      setRecentProducts([]);
      setProductsByCategory([]);
    } finally {
      setLoading(false);
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
      title: 'Category Management',
      description: 'Organize products into categories',
      icon: Folder,
      color: 'bg-indigo-500',
      href: '/admin/categories'
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

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-6 lg:mb-8"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Welcome back, {user?.name || 'Admin'}</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
              <p className="text-red-800 text-sm sm:text-base">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Products</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Orders</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Users</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending Orders</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Low Stock Items</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin Modules */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {adminModules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:scale-105 touch-manipulation"
                onClick={() => navigate(module.href)}
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 ${module.color} rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    <module.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="ml-3 text-sm sm:text-base lg:text-lg font-semibold text-gray-900 truncate">{module.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">{module.description}</p>
                <div className="flex items-center text-blue-600 text-xs sm:text-sm font-medium group-hover:text-blue-700">
                  <span>Access Module</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Products Section */}
        {recentProducts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8 sm:mb-10"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Recent Products</h2>
              <button
                onClick={() => navigate('/admin/products')}
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm sm:text-base font-medium touch-manipulation"
              >
                View All Products
                <Plus className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {recentProducts && recentProducts.length > 0 ? (
                recentProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <img
                        src={getProductImageSrc(product.images[0])}
                        alt={product.name}
                        className="w-full h-32 sm:h-40 lg:h-48 object-cover"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">{product.category?.name}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm sm:text-lg font-bold text-gray-900">₹{product.price}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(product.stock).color}`}>
                          {getStockStatus(product.stock).text}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/admin/products/${product._id}`)}
                          className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                          className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-gray-600 text-white text-xs sm:text-sm rounded-lg hover:bg-gray-700 transition-colors touch-manipulation"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No recent products</p>
                  <p className="text-sm">Products will appear here once added.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Products by Category Section */}
        {productsByCategory.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8 sm:mb-10"
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Products by Category</h2>
            <div className="space-y-4 sm:space-y-6">
              {productsByCategory && productsByCategory.length > 0 ? (
                productsByCategory.map((category, categoryIndex) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * categoryIndex }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          src={getCategoryImageSrc(category.image)}
                          alt={category.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{category.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">{category.productCount} products</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/categories/${category._id}`)}
                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium touch-manipulation"
                      >
                        View Category
                      </button>
                    </div>
                    {category.products && category.products.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {category.products.map((product, productIndex) => (
                          <div
                            key={product._id}
                            className="border border-gray-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow"
                          >
                            <img
                              src={getProductImageSrc(product.images[0])}
                              alt={product.name}
                              className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-md mb-2"
                            />
                            <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{product.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">₹{product.price}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStockStatus(product.stock).color}`}>
                              {getStockStatus(product.stock).text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No categories with products</p>
                  <p className="text-sm">Categories with products will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard; 