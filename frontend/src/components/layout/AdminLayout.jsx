import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings,
  FileText,
  Image,
  Truck,
  LogOut,
  Menu,
  X,
  Folder,
  Home,
  ChevronRight,
  BarChart3,
  User
} from 'lucide-react';
import Logo from '../common/Logo';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  const adminMenuItems = [
    {
      title: 'Dashboard',
      icon: TrendingUp,
      href: '/admin',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Products',
      icon: Package,
      href: '/admin/products',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Categories',
      icon: Folder,
      href: '/admin/categories',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
     title: 'Tax and Offers',
     icon: DollarSign,
     href: '/admin/finance',
     color: 'text-yellow-600',
     bgColor: 'bg-yellow-50'
   },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Users',
      icon: Users,
      href: '/admin/users',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Stock Management',
      icon: TrendingUp,
      href: '/admin/stock',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Ads',
      icon: Image,
      href: '/admin/advertisements',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const handleLogout = () => {
    console.log('🔍 Admin logout initiated');
    
    // Clear session storage directly (same as main navbar)
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    console.log('🔍 Session storage cleared, navigating to phone-login');
    
    // Use React Router navigation instead of Redux logout
    navigate('/phone-login', { replace: true });
    
    // Close sidebar
    setSidebarOpen(false);
    
    // Show success message
    toast.success('Logged out successfully');
  };

  const isActive = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:inset-0 lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Logo size="small" showText={false} />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs sm:text-sm text-gray-500">Uthraa Naturals</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@uthraanaturals.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 sm:px-4 py-4 space-y-1 overflow-y-auto">
            {adminMenuItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-3 sm:px-4 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 group touch-manipulation ${
                  isActive(item.href)
                    ? `${item.bgColor} ${item.color} shadow-sm`
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 mr-3 flex-shrink-0 ${
                  isActive(item.href) ? item.color : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                <span className="truncate">{item.title}</span>
                {isActive(item.href) && (
                  <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                )}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 space-y-3">
            <Link
              to="/"
              onClick={() => {
                console.log('🔍 Navigating from admin to store');
                setSidebarOpen(false);
              }}
              className="flex items-center px-3 py-3 sm:px-4 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 touch-manipulation"
              replace={true}
            >
              <Home className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-gray-400" />
              <span>Back to Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 sm:px-4 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200 touch-manipulation"
            >
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Profile Icon */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors touch-manipulation"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden sm:block">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {adminMenuItems.find(item => isActive(item.href))?.title || 'Admin Panel'}
                </h2>
              </div>
            </div>
            
            {/* Profile Icon */}
            <div className="relative profile-dropdown">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.name || 'Admin'}
                </span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@uthraanaturals.com'}</p>
                  </div>
                  <Link
                    to="/"
                    onClick={() => {
                      console.log('🔍 Navigating from admin to store (profile dropdown)');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    replace={true}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Back to Store
                  </Link>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 