import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowLeft, RefreshCw, CheckCircle, Shield, Smartphone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { login } from '../store/slices/authSlice';

const PhoneLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [focusedInput, setFocusedInput] = useState('');

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', {
        phone: `+1${phone.replace(/\D/g, '')}` // Add country code
      });

      if (response.data.message) {
        setMaskedPhone(response.data.phone);
        setStep('otp');
        setCountdown(60); // 60 seconds countdown
        toast.success('OTP sent successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        phone: `+1${phone.replace(/\D/g, '')}`,
        otp
      });

      if (response.data.token) {
        dispatch(login({
          token: response.data.token,
          user: response.data.user
        }));
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/resend-otp', {
        phone: `+1${phone.replace(/\D/g, '')}`
      });

      if (response.data.message) {
        setCountdown(60);
        toast.success('OTP resent successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setCountdown(0);
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

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
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
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-4 rounded-2xl shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3"
          >
            {step === 'phone' ? 'Phone Login' : 'Verify OTP'}
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-gray-600 text-sm leading-relaxed"
          >
            {step === 'phone' 
              ? 'Enter your phone number to receive a secure verification code'
              : `Enter the 6-digit code sent to ${maskedPhone}`
            }
          </motion.p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 'phone' ? 'bg-green-500 scale-125' : 'bg-green-300'}`}></div>
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${step === 'otp' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 'otp' ? 'bg-green-500 scale-125' : 'bg-gray-300'}`}></div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Phone Number Step */}
          {step === 'phone' && (
            <motion.form
              key="phone"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleSendOTP}
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <span className="text-gray-500 text-sm font-medium">+1</span>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="555-123-4567"
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all duration-300 ${
                      focusedInput === 'phone' 
                        ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                    } focus:outline-none focus:ring-4 focus:ring-green-100`}
                    maxLength="12"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  We'll send a secure verification code to this number
                </p>
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading || !phone}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </motion.button>
            </motion.form>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <motion.form
              key="otp"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-3">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onFocus={() => setFocusedInput('otp')}
                    onBlur={() => setFocusedInput('')}
                    placeholder="123456"
                    className={`block w-full px-6 py-4 border-2 rounded-xl text-center text-2xl font-mono tracking-widest transition-all duration-300 ${
                      focusedInput === 'otp' 
                        ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:bg-green-50'
                    } focus:outline-none focus:ring-4 focus:ring-green-100`}
                    maxLength="6"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center flex items-center justify-center">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Enter the 6-digit code from your SMS
                </p>
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify & Login'
                )}
              </motion.button>

              {/* Resend OTP */}
              <motion.div variants={itemVariants} className="text-center">
                {countdown > 0 ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">
                      Resend code in <span className="font-semibold text-green-600">{countdown}s</span>
                    </p>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="text-sm text-green-600 hover:text-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                    {resendLoading ? 'Sending...' : 'Resend Code'}
                  </motion.button>
                )}
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Back Button */}
        {step === 'otp' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={goBackToPhone}
            className="w-full mt-6 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 transition-all duration-300 py-2 rounded-lg hover:bg-gray-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Phone Number
          </motion.button>
        )}

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
                to="/login"
                className="block w-full text-center py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email & Password Login
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/register"
                className="block w-full text-center py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 font-medium"
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

export default PhoneLogin; 