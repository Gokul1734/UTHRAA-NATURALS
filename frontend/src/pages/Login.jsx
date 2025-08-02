import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Phone, User, Shield } from 'lucide-react';
import { login } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, message } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(message || 'Login failed');
    }
  };

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
    <div className="pt-14 sm:pt-16 lg:pt-18 min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-tr from-teal-200 to-cyan-300 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-emerald-200 to-green-300 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg border border-white/20"
      >
        <motion.div variants={itemVariants}>
          <motion.div 
            className="flex items-center justify-center mb-6 sm:mb-8"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your account to continue
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput('')}
                className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                  focusedInput === 'email'
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                    : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                } focus:outline-none focus:ring-4 focus:ring-green-100`}
                placeholder="Enter your email"
                required
              />
              <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput('')}
                className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-2 rounded-xl transition-all duration-300 text-sm sm:text-base ${
                  focusedInput === 'password'
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                    : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                } focus:outline-none focus:ring-4 focus:ring-green-100`}
                placeholder="Enter your password"
                required
              />
              <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                )}
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded touch-manipulation"
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-600">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-green-600 hover:text-green-500 transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="mt-6 sm:mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-3">
            <Link
              to="/phone-login"
              className="w-full inline-flex justify-center items-center px-4 py-3 sm:py-4 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base font-medium text-gray-700 touch-manipulation"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
              Continue with Phone
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-green-600 hover:text-green-500 transition-colors font-semibold"
            >
              Sign up here
            </Link>
          </p>
        </motion.div>

        {/* Quick Access Info */}
        <motion.div variants={itemVariants} className="mt-6 sm:mt-8 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
          <div className="flex items-start space-x-3">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-green-800 mb-1">
                New to Uthraa Naturals?
              </h4>
              <p className="text-xs sm:text-sm text-green-700 leading-relaxed">
                Create an account to track orders, save favorites, and get personalized recommendations.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div variants={itemVariants} className="mt-4 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By signing in, you agree to our{' '}
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

export default Login; 