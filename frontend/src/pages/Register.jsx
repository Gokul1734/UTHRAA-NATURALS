import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, CheckCircle } from 'lucide-react';
import { register } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await dispatch(register(registerData));
    
    if (register.fulfilled.match(result)) {
      toast.success('Registration successful!');
      navigate('/');
    } else {
      toast.error(message || 'Registration failed');
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean);
      return parts.join('-');
    }
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const formatted = e.target.value;
    setFormData({
      ...formData,
      phone: formatted
    });
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

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: 'gray', text: '' };
    if (password.length < 6) return { strength: 1, color: 'red', text: 'Weak' };
    if (password.length < 8) return { strength: 2, color: 'yellow', text: 'Fair' };
    if (password.length < 10) return { strength: 3, color: 'blue', text: 'Good' };
    return { strength: 4, color: 'green', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
            Create your account
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-sm text-gray-600 mb-8"
          >
            Or{' '}
            <Link
              to="/login"
              className="font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              sign in to your existing account
            </Link>
          </motion.p>
        </motion.div>

        <motion.form 
          variants={containerVariants}
          className="space-y-6" 
          onSubmit={handleSubmit}
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput('')}
                className={`appearance-none relative block w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  focusedInput === 'name' 
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                    : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                } focus:outline-none focus:ring-4 focus:ring-green-100`}
                placeholder="Enter your full name"
              />
            </div>
          </motion.div>

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
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <div className="absolute left-12 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                <span className="text-gray-500 text-sm font-medium">+91</span>
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput('')}
                className={`appearance-none relative block w-full pl-16 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  focusedInput === 'phone' 
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                    : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                } focus:outline-none focus:ring-4 focus:ring-green-100`}
                placeholder="555-123-4567"
                maxLength="12"
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
                autoComplete="new-password"
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
            
            {/* Password strength indicator */}
            {formData.password && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.color === 'red' ? 'bg-red-500' :
                        passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                        passwordStrength.color === 'blue' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength.color === 'red' ? 'text-red-600' :
                    passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                    passwordStrength.color === 'blue' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput('')}
                className={`appearance-none relative block w-full pl-12 pr-12 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                  focusedInput === 'confirmPassword' 
                    ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                    : formData.confirmPassword && formData.password === formData.confirmPassword
                    ? 'border-green-500 bg-green-50'
                    : formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                } focus:outline-none focus:ring-4 focus:ring-green-100`}
                placeholder="Confirm your password"
              />
              <motion.button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </motion.button>
              
              {/* Password match indicator */}
              {formData.confirmPassword && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2 z-10">
                  {formData.password === formData.confirmPassword ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-red-500 rounded-full"></div>
                  )}
                </div>
              )}
            </div>
            
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 text-xs mt-1"
              >
                Passwords do not match
              </motion.p>
            )}
          </motion.div>

          <motion.button
            variants={itemVariants}
            type="submit"
            disabled={isLoading || formData.password !== formData.confirmPassword}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create account'
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

        {/* Alternative Options */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 pt-6 border-t border-gray-200"
        >
          <p className="text-center text-sm text-gray-600 mb-4">
            Already have an account?
          </p>
          <div className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Sign in to existing account
              </Link>
            </motion.div>
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
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register; 