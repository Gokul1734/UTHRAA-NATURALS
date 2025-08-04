import toast from 'react-hot-toast';

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in, false otherwise
 */
export const isAuthenticated = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  return !!user;
};

/**
 * Get current user from session storage
 * @returns {Object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
  return JSON.parse(sessionStorage.getItem('user') || 'null');
};

/**
 * Show login prompt and optionally redirect to login page
 * @param {string} action - The action that requires login (e.g., 'add to cart', 'add to wishlist')
 * @param {Function} navigate - React Router navigate function (optional)
 * @returns {boolean} True if user should proceed with action, false if login is required
 */
export const requireAuth = (action, navigate = null) => {
  if (isAuthenticated()) {
    return true;
  }
  
  const actionText = action || 'perform this action';
  toast.error(`Please login to ${actionText}`);
  
  if (navigate) {
    // Small delay to show the toast before redirecting
    setTimeout(() => {
      navigate('/phone-login');
    }, 1500);
  }
  
  return false;
};

/**
 * Handle authentication for cart actions
 * @param {Function} action - The action to perform if authenticated
 * @param {Function} navigate - React Router navigate function
 * @param {string} actionName - Name of the action for error message
 */
export const handleAuthForCart = (action, navigate, actionName = 'add to cart') => {
  if (requireAuth(actionName, navigate)) {
    action();
  }
};

/**
 * Handle authentication for wishlist actions
 * @param {Function} action - The action to perform if authenticated
 * @param {Function} navigate - React Router navigate function
 * @param {string} actionName - Name of the action for error message
 */
export const handleAuthForWishlist = (action, navigate, actionName = 'add to wishlist') => {
  if (requireAuth(actionName, navigate)) {
    action();
  }
}; 