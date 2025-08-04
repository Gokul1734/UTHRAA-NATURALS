import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserCart } from '../../store/slices/cartSlice';
import { loadUserWishlist } from '../../store/slices/wishlistSlice';
import { getCurrentUserId } from '../../utils/storageUtils';

/**
 * Component to load user-specific data (cart and wishlist) when the app starts
 * This ensures that if a user is already logged in, their data is loaded
 */
const UserDataLoader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is logged in and load their data
    const userId = getCurrentUserId();
    if (userId && user) {
      console.log('🔄 Loading user-specific data for user:', userId);
      
      // Load user-specific cart and wishlist data
      dispatch(loadUserCart());
      dispatch(loadUserWishlist());
    }
  }, [dispatch, user]);

  // This component doesn't render anything
  return null;
};

export default UserDataLoader; 