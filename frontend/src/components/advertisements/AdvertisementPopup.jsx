import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, Sparkles, Gift, Clock, ArrowRight, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import advertisementService from '../../services/advertisementService';

const AdvertisementPopup = ({ page = 'home', onClose }) => {
  const [advertisement, setAdvertisement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the highest priority active advertisement for this page
    const activeAd = advertisementService.getHighestPriorityAd(page);
    
    if (activeAd) {
      // Check if user has seen this ad recently for this specific page
      const hasSeenRecently = advertisementService.hasSeenAdRecentlyForPage(activeAd._id, page, 2);
      
      if (!hasSeenRecently) {
        setAdvertisement(activeAd);
        
        // Show popup after a short delay
        const timer = setTimeout(() => {
          setIsVisible(true);
          // Record impression
          advertisementService.recordImpression(activeAd._id);
          // Mark as seen
          advertisementService.markAdAsSeen(activeAd._id);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [page]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleAction = () => {
    if (advertisement) {
      // Record click
      advertisementService.recordClick(advertisement._id);
      
      // Navigate to the link
      if (advertisement.link.startsWith('http')) {
        window.open(advertisement.link, '_blank');
      } else {
        navigate(advertisement.link);
      }
      
      handleClose();
    }
  };

  const getTimeRemaining = () => {
    if (!advertisement) return '';
    
    const now = new Date();
    const endDate = new Date(advertisement.endDate);
    const diff = endDate - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Ending soon!';
  };

  const getIcon = () => {
    if (!advertisement) return <Sparkles />;
    
    const title = advertisement.title.toLowerCase();
    if (title.includes('sale') || title.includes('discount') || title.includes('off')) {
      return <Gift />;
    }
    if (title.includes('new') || title.includes('launch')) {
      return <Star />;
    }
    if (title.includes('shipping') || title.includes('delivery')) {
      return <Clock />;
    }
    if (title.includes('free') || title.includes('offer')) {
      return <Heart />;
    }
    return <Zap />;
  };

  if (!advertisement || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ 
              scale: isClosing ? 0.8 : 1, 
              opacity: isClosing ? 0 : 1, 
              y: isClosing ? 50 : 0 
            }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: isClosing ? 0.2 : 0.5
            }}
            className="relative max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)`
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 border border-white/20"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>

            {/* Main Content */}
            <div className="relative">
              {/* Background Pattern */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, ${advertisement.backgroundColor} 0%, transparent 50%)`
                }}
              />
              
              {/* Image Section */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={advertisement.image}
                  alt={advertisement.title}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"
                />
                
                {/* Floating Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20"
                  style={{ color: advertisement.backgroundColor }}
                >
                  {getIcon()}
                </motion.div>

                {/* Time Remaining Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1 border border-white/20 shadow-lg">
                    <Clock className="h-3 w-3" />
                    {getTimeRemaining()}
                  </div>
                </div>

                {/* Urgency Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 border border-red-400/20 shadow-lg">
                    <Zap className="h-3 w-3" />
                    Limited Time!
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold mb-3"
                  style={{ color: 'black' }}
                >
                  {advertisement.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm mb-4 text-gray-600 leading-relaxed"
                >
                  {advertisement.description}
                </motion.p>

                {/* Stats Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between text-xs text-gray-500 mb-4 bg-gray-50/50 rounded-lg p-2"
                >
                  <span>👁️ {advertisement.currentImpressions.toLocaleString()} views</span>
                  <span>🎯 {advertisement.currentClicks.toLocaleString()} clicks</span>
                  <span>⭐ Priority {advertisement.priority}</span>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleAction}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 relative overflow-hidden group"
                  style={{
                    backgroundColor: advertisement.buttonColor || advertisement.backgroundColor,
                    color: advertisement.buttonTextColor || '#FFFFFF'
                  }}
                >
                  {/* Button Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  <span className="relative z-10">Shop Now</span>
                  <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 text-center text-xs text-gray-800"
                >
                  Limited time offer • Don't miss out!
                </motion.div>
              </div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -top-2 -left-2 w-8 h-8 rounded-full opacity-20"
              style={{ backgroundColor: advertisement.backgroundColor }}
            />
            <motion.div
              animate={{ 
                rotate: -360,
                scale: [1, 0.9, 1]
              }}
              transition={{ 
                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full opacity-30"
              style={{ backgroundColor: advertisement.backgroundColor }}
            />

            {/* Additional Decorative Elements */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-1/2 -left-4 w-2 h-2 rounded-full opacity-30"
              style={{ backgroundColor: advertisement.backgroundColor }}
            />
            <motion.div
              animate={{ 
                y: [0, 10, 0],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute bottom-1/2 -right-4 w-3 h-3 rounded-full opacity-40"
              style={{ backgroundColor: advertisement.backgroundColor }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdvertisementPopup; 