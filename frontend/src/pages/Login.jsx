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
    <div className="pt-16 min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
        <motion.div variants={itemVariants}>
          <motion.div 
            className="flex items-center justify-center mb-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-4 rounded-2xl shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-center text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3"
          >
            Sign in to your account
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-sm text-gray-600 mb-8"
          >
            Or{' '}
            <Link
              to="/register"
              className="font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              create a new account
            </Link>
          </motion.p>
        </motion.div>

        <motion.form 
          variants={containerVariants}
          className="space-y-6" 
          onSubmit={handleSubmit}
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput('')}
                className={`appearance-none relative block w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  focusedInput === 'email' 
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                    : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                } focus:outline-none focus:ring-4 focus:ring-green-100`}
                placeholder="Enter your email"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput('')}
                className={`appearance-none relative block w-full pl-12 pr-12 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  focusedInput === 'password' 
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                    : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                } focus:outline-none focus:ring-4 focus:ring-green-100`}
                placeholder="Enter your password"
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                Forgot your password?
              </a>
            </div>
          </motion.div>

          <motion.button
            variants={itemVariants}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </motion.button>

          {isError && (
            <motion.div 
              variants={itemVariants}
              className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200"
            >
              {message}
            </motion.div>
          )}
        </motion.form>

        {/* Alternative Login Options */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <p className="text-center text-sm text-gray-600 mb-4">
            Or continue with
          </p>
          <div className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/phone-login"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                <Phone className="w-5 h-5" />
                Phone Number Login
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/register"
                className="w-full flex items-center justify-center py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Create New Account
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 