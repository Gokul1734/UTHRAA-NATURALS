import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBrandName, getShortBrandName, getLogoPath, getFallbackLogoPath } from '../../utils/brandUtils';

const Logo = ({ size = 'default', showText = true, className = '' }) => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Get brand names from utilities
  const brandName = getBrandName();
  const shortBrandName = getShortBrandName();

  // Logo sizes
  const sizeClasses = {
    small: {
      logo: 'w-8 h-8',
      text: 'text-sm',
      container: 'space-x-2'
    },
    default: {
      logo: 'w-10 h-10',
      text: 'text-lg sm:text-xl',
      container: 'space-x-2 sm:space-x-3'
    },
    large: {
      logo: 'w-16 h-16',
      text: 'text-2xl sm:text-3xl',
      container: 'space-x-3 sm:space-x-4'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  const handleLogoLoad = () => {
    setLogoLoaded(true);
  };

  const handleLogoError = () => {
    setLogoError(true);
    setLogoLoaded(true);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex-shrink-0 ${className}`}
    >
      <Link to="/" className={`flex items-center ${currentSize.container}`}>
        {/* Logo Image */}
        <div className="relative">
          {!logoError ? (
            <img
              src={getLogoPath()}
              alt={`${brandName} Logo`}
              className={`${currentSize.logo} object-contain transition-opacity duration-300 ${
                logoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleLogoLoad}
              onError={handleLogoError}
            />
          ) : (
            // Fallback logo when image fails to load
            <div className={`${currentSize.logo} bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-sm sm:text-lg">U</span>
            </div>
          )}
          
          {/* Decorative dot */}
          {!logoError && (
            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* Brand Name */}
        {showText && (
          <div className="flex flex-col">
            <span className={`font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hidden xs:block ${currentSize.text}`}>
              {brandName}
            </span>
            <span className={`font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent xs:hidden ${currentSize.text}`}>
              {shortBrandName}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default Logo; 