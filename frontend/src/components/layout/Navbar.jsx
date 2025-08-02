import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import { calculateTotals } from '../../store/slices/cartSlice';
import { ShoppingCart, User, Menu, X, Search, Heart, Phone, LogOut, Settings, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dispatch(calculateTotals());
  }, [cartItems, dispatch]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileSearch(false);
      setIsMenuOpen(false);
    }
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Animation variants
  const menuVariants = {
    closed: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    },
    open: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-white/20' 
            : 'bg-white/90 backdrop-blur-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm sm:text-lg">U</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hidden xs:block">
                  Uthraa Naturals
                </span>
                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent xs:hidden">
                  Uthraa
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Products' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' }
              ].map((link) => (
                <motion.div
                  key={link.to}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to={link.to} 
                    className="text-gray-700 hover:text-green-600 transition-all duration-300 font-medium relative group py-2"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md xl:max-w-lg mx-4 lg:mx-6 xl:mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                >
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={`w-full pl-10 lg:pl-12 pr-4 py-2 lg:py-3 border-2 rounded-xl transition-all duration-300 text-sm lg:text-base ${
                      isSearchFocused 
                        ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                    } focus:outline-none focus:ring-4 focus:ring-green-100`}
                  />
                  <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </motion.div>
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {/* Mobile Search Icon */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 touch-manipulation"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </motion.button>

              {/* Wishlist */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link to="/wishlist" className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 relative block touch-manipulation">
                  <Heart className="h-5 w-5 text-gray-600" />
                </Link>
              </motion.div>

              {/* Cart */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link to="/cart" className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 relative block touch-manipulation">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  {cartItemCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg min-w-[1.25rem]"
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* User Menu - Desktop */}
              {user ? (
                <div className="relative group hidden sm:block">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 touch-manipulation"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                  </motion.button>
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/20">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Package className="h-4 w-4 mr-3" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/phone-login"
                      className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 touch-manipulation"
                      title="Phone Login"
                    >
                      <Phone className="h-5 w-5 text-gray-600" />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm lg:text-base"
                    >
                      Login
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 touch-manipulation"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {showMobileSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-gray-200 py-3"
              >
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                      autoFocus
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div 
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Menu */}
              <motion.div 
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="mobile-menu-container lg:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-xl rounded-b-3xl shadow-2xl border-t border-gray-100 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
              >
                <div className="px-4 py-6 space-y-2">
                  {/* Mobile Navigation Links */}
                  {[
                    { to: '/', label: 'Home', icon: null },
                    { to: '/products', label: 'Products', icon: Package },
                    { to: '/about', label: 'About', icon: null },
                    { to: '/contact', label: 'Contact', icon: null },
                    { to: '/wishlist', label: 'Wishlist', icon: Heart }
                  ].map((link) => (
                    <motion.div key={link.to} variants={menuItemVariants}>
                      <Link
                        to={link.to}
                        className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all duration-300 font-medium touch-manipulation"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.icon && <link.icon className="h-5 w-5 mr-4 text-green-600" />}
                        <span className="text-base">{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  {user ? (
                    <>
                      {/* User Info */}
                      <motion.div variants={menuItemVariants} className="px-4 py-3 bg-green-50 rounded-2xl">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </motion.div>
                      
                      {/* User Menu Items */}
                      <motion.div variants={menuItemVariants}>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all duration-300 font-medium touch-manipulation"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-5 w-5 mr-4 text-green-600" />
                          <span className="text-base">Profile</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={menuItemVariants}>
                        <Link
                          to="/my-orders"
                          className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all duration-300 font-medium touch-manipulation"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Package className="h-5 w-5 mr-4 text-green-600" />
                          <span className="text-base">My Orders</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={menuItemVariants}>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all duration-300 font-medium touch-manipulation"
                        >
                          <LogOut className="h-5 w-5 mr-4 text-red-500" />
                          <span className="text-base">Logout</span>
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {/* Login Options */}
                      <motion.div variants={menuItemVariants}>
                        <Link
                          to="/phone-login"
                          className="flex items-center px-4 py-4 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all duration-300 font-medium touch-manipulation"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Phone className="h-5 w-5 mr-4 text-green-600" />
                          <span className="text-base">Phone Login</span>
                        </Link>
                      </motion.div>
                      <motion.div variants={menuItemVariants}>
                        <Link
                          to="/login"
                          className="block w-full text-center px-4 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg text-base touch-manipulation"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login / Register
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar; 