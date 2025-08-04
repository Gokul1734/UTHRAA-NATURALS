import { loadUserCart, clearUserCart } from '../slices/cartSlice';
import { loadUserWishlist, clearUserWishlist } from '../slices/wishlistSlice';

/**
 * Middleware to handle user-specific data (cart and wishlist) when users log in or out
 */
export const userDataMiddleware = (store) => (next) => (action) => {
  // Handle auth actions that should trigger user data loading/clearing
  if (action.type === 'auth/loadUserData') {
    // Load user-specific cart and wishlist data
    store.dispatch(loadUserCart());
    store.dispatch(loadUserWishlist());
    return next(action);
  }

  if (action.type === 'auth/clearUserData') {
    // Clear user-specific cart and wishlist data
    store.dispatch(clearUserCart());
    store.dispatch(clearUserWishlist());
    return next(action);
  }

  // Handle direct login/logout actions
  if (action.type === 'auth/directLogin') {
    // Load user-specific data after direct login
    setTimeout(() => {
      store.dispatch(loadUserCart());
      store.dispatch(loadUserWishlist());
    }, 100);
    return next(action);
  }

  if (action.type === 'auth/directLogout') {
    // Clear user-specific data after direct logout
    store.dispatch(clearUserCart());
    store.dispatch(clearUserWishlist());
    return next(action);
  }

  // Handle async auth actions
  if (action.type === 'auth/login/fulfilled' || action.type === 'auth/register/fulfilled') {
    // Load user-specific data after successful login/register
    setTimeout(() => {
      store.dispatch(loadUserCart());
      store.dispatch(loadUserWishlist());
    }, 100);
    return next(action);
  }

  if (action.type === 'auth/logout/fulfilled') {
    // Clear user-specific data after logout
    store.dispatch(clearUserCart());
    store.dispatch(clearUserWishlist());
    return next(action);
  }

  return next(action);
}; 