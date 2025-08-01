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

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
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

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20' 
          : 'bg-white/80 backdrop-blur-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Uthraa Naturals
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
                  className="text-gray-700 hover:text-green-600 transition-all duration-300 font-medium relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
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
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                    isSearchFocused 
                      ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                      : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                  } focus:outline-none focus:ring-4 focus:ring-green-100`}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </motion.div>
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-3">
            {/* Search Icon for Mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </motion.button>

            {/* Wishlist */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Link to="/wishlist" className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 relative block">
                <Heart className="h-5 w-5 text-gray-600" />
              </Link>
            </motion.div>

            {/* Cart */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Link to="/cart" className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 relative block">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {cartItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
                >
                  <User className="h-5 w-5 text-gray-600" />
                </motion.button>
                <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-white/20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="h-4 w-4 mr-3" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/phone-login"
                    className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
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
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
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
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden border-t border-gray-200 py-6 bg-white/95 backdrop-blur-xl rounded-b-2xl shadow-xl"
            >
              {/* Mobile Search */}
              <motion.form variants={menuItemVariants} onSubmit={handleSearch} className="mb-6 px-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </motion.form>

              {/* Mobile Navigation Links */}
              <div className="space-y-2 px-4">
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
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon && <link.icon className="h-5 w-5 mr-3" />}
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                {user ? (
                  <>
                    <motion.div variants={menuItemVariants}>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-5 w-5 mr-3" />
                        Profile
                      </Link>
                    </motion.div>
                    <motion.div variants={menuItemVariants}>
                      <Link
                        to="/my-orders"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="h-5 w-5 mr-3" />
                        My Orders
                      </Link>
                    </motion.div>
                    <motion.div variants={menuItemVariants}>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 font-medium"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={menuItemVariants} className="pt-4">
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar; 