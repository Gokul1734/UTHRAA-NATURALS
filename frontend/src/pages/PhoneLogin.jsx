import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Phone, Shield, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { directLogin } from '../store/slices/authSlice';
import { API_BASE_URL } from '../config/environment';

const PhoneLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) { // Limit to 10 digits
      setPhone(value);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const requestData = { phone: phone };
      
      const response = await axios.post(`${API_BASE_URL}/auth/phone-login`, requestData);

      if (response.data.token) {
        // Store user data in sessionStorage
        const userData = {
          ...response.data.user,
          token: response.data.token
        };
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('token', response.data.token);
        
        // Dispatch to Redux store
        dispatch(directLogin({
          token: response.data.token,
          user: response.data.user
        }));
        
        // Show appropriate message based on user type
        if (response.data.user.role === 'admin') {
          toast.success('Admin login successful!');
        } else {
          toast.success('Login successful!');
        }
        
        // Navigate based on response
        if (response.data.redirectTo) {
          navigate(response.data.redirectTo);
        } else {
          // Default navigation based on role
          if (response.data.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      }
    } catch (error) {
      console.error('Frontend error:', error);
      const message = error.response?.data?.message || 'Failed to login';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Check if this is admin phone number
  const isAdminPhone = phone === '1234567890';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200 to-cyan-300 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200 to-green-300 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div 
            className="flex items-center justify-center mb-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className={`p-4 rounded-2xl shadow-lg ${
                isAdminPhone 
                  ? 'bg-gradient-to-br from-purple-400 to-indigo-600' 
                  : 'bg-gradient-to-br from-green-400 to-emerald-600'
              }`}>
                {isAdminPhone ? (
                  <Crown className="w-8 h-8 text-white" />
                ) : (
                  <Phone className="w-8 h-8 text-white" />
                )}
              </div>
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                isAdminPhone ? 'bg-purple-500' : 'bg-green-500'
              }`}>
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className={`text-3xl font-bold bg-clip-text text-transparent mb-3 ${
              isAdminPhone 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600'
            }`}
          >
            {isAdminPhone ? 'Admin Login' : 'Welcome to Uthraa Naturals'}
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 text-sm leading-relaxed"
          >
            {isAdminPhone 
              ? 'Welcome back, Admin! Enter your phone number to access the admin panel'
              : 'Enter your phone number for instant login - no password needed'
            }
          </motion.p>
        </motion.div>

        {/* Phone Number Form */}
        <motion.form
          variants={itemVariants}
          onSubmit={handlePhoneLogin}
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <span className="text-gray-500 text-sm font-medium">+91</span>
              </div>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput('')}
                placeholder="1234567890"
                className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  focusedInput === 'phone' 
                    ? (isAdminPhone 
                        ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100' 
                        : 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                      )
                    : (isAdminPhone
                        ? 'border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                      )
                } focus:outline-none focus:ring-4 ${
                  isAdminPhone ? 'focus:ring-purple-100' : 'focus:ring-green-100'
                }`}
                maxLength="10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              {isAdminPhone 
                ? 'Secure admin access with phone verification'
                : 'Instant login - no OTP or password required'
              }
            </p>
          </motion.div>

          <motion.button
            variants={itemVariants}
            type="submit"
            disabled={loading || phone.length < 10}
            className={`w-full text-white py-4 px-6 rounded-xl font-semibold text-lg focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
              isAdminPhone
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:ring-purple-200'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isAdminPhone ? 'Accessing Admin Panel...' : 'Logging in...'}
              </div>
            ) : (
              isAdminPhone ? 'Access Admin Panel' : 'Login Instantly'
            )}
          </motion.button>
        </motion.form>

        {/* Admin Info */}
        {isAdminPhone && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl"
          >
            <div className="flex items-center text-purple-700 text-sm">
              <Crown className="w-4 h-4 mr-2" />
              <span className="font-medium">Admin Access</span>
            </div>
            <p className="text-purple-600 text-xs mt-1">
              You'll be redirected to the admin dashboard after login
            </p>
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div variants={itemVariants} className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By logging in, you agree to our{' '}
            <Link to="/terms" className="text-green-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-green-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PhoneLogin; 