import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShoppingBag, 
  Heart, 
  User, 
  Search,
  Leaf,
  ChevronDown
} from 'lucide-react';
import { useSelector } from 'react-redux';
import Logo from '../common/Logo';

const ConditionalNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { cartItems = [] } = useSelector((state) => state.cart) || {};
  const { wishlistItems = [] } = useSelector((state) => state.wishlist) || {};
  
  // Get user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  const closeMenu = () => setIsOpen(false);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleProfileAction = (action) => {
    setIsProfileDropdownOpen(false);
    if (action === 'logout') {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      window.location.reload();
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const cartItemCount = Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item?.quantity || 0), 0) : 0;
  const wishlistItemCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-100' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Uthraa Naturals</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'text-primary bg-green-50'
                      : 'text-gray-700 hover:text-primary hover:bg-green-50'
                  }`}
                >
                  {item.name}
                  {location.pathname === item.href && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-green-50 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/wishlist')}
                className="relative p-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {wishlistItemCount}
                  </span>
                )}
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/cart')}
                className="relative p-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
                title="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </motion.button>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-300 mx-2"></div>

              {/* User Menu */}
              {user ? (
                <div className="relative profile-dropdown">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden xl:block text-left">
                      <div className="text-sm font-medium text-gray-900 leading-tight">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-large border border-gray-100 py-2 profile-dropdown z-50"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-primary transition-colors"
                            onClick={() => handleProfileAction('profile')}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </Link>
                          <Link
                            to="/orders"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-primary transition-colors"
                            onClick={() => handleProfileAction('orders')}
                          >
                            <ShoppingBag className="w-4 h-4 mr-3" />
                            Orders
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-primary transition-colors"
                              onClick={() => handleProfileAction('admin')}
                            >
                              <Leaf className="w-4 h-4 mr-3" />
                              Admin Dashboard
                            </Link>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={() => handleProfileAction('logout')}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <X className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/phone-login"
                    className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-6 space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? 'text-primary bg-green-50'
                        : 'text-gray-700 hover:text-primary hover:bg-green-50'
                    }`}
                    onClick={closeMenu}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <hr className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        navigate('/wishlist');
                        closeMenu();
                      }}
                      className="relative p-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
                      title="Wishlist"
                    >
                      <Heart className="w-5 h-5" />
                      {wishlistItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {wishlistItemCount}
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/cart');
                        closeMenu();
                      }}
                      className="relative p-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
                      title="Cart"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {cartItemCount}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {user ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{user.name.split(' ')[0]}</div>
                        <div className="text-xs text-gray-500">{user.role === 'admin' ? 'Admin' : 'Customer'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link
                        to="/phone-login"
                        className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                        onClick={closeMenu}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="btn-primary text-sm px-4 py-2"
                        onClick={closeMenu}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-center pt-32 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-large border-0 focus:ring-2 focus:ring-primary focus:outline-none text-lg"
                  autoFocus
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConditionalNavbar; 