import { createSlice } from '@reduxjs/toolkit';
import { 
  getUserStorageData, 
  setUserStorageData, 
  removeUserStorageData, 
  migrateToUserStorage 
} from '../../utils/storageUtils';

// Get wishlist from user-specific localStorage with migration support
const getInitialWishlistItems = () => {
  // First try to migrate old data
  const migratedData = migrateToUserStorage('wishlistItems', []);
  if (migratedData.length > 0) {
    return migratedData;
  }
  
  // Then get user-specific data
  return getUserStorageData('wishlistItems', []);
};

const wishlistItems = getInitialWishlistItems();

const initialState = {
  wishlistItems,
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      console.log('🔍 Wishlist slice: Adding item to wishlist:', action.payload);
      const existingItem = state.wishlistItems.find(item => item._id === action.payload._id);
      if (!existingItem) {
        state.wishlistItems.push(action.payload);
        console.log('🔍 Wishlist slice: Updated wishlist items:', state.wishlistItems);
        // Save to user-specific localStorage
        setUserStorageData('wishlistItems', state.wishlistItems);
      } else {
        console.log('🔍 Wishlist slice: Item already in wishlist');
      }
    },
    removeFromWishlist: (state, action) => {
      console.log('🔍 Wishlist slice: Removing item from wishlist:', action.payload);
      state.wishlistItems = state.wishlistItems.filter(item => item._id !== action.payload);
      console.log('🔍 Wishlist slice: Updated wishlist items:', state.wishlistItems);
      // Save to user-specific localStorage
      setUserStorageData('wishlistItems', state.wishlistItems);
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      removeUserStorageData('wishlistItems');
    },
    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },
    setWishlistError: (state, action) => {
      state.error = action.payload;
    },
    loadWishlistFromStorage: (state, action) => {
      state.wishlistItems = action.payload || [];
      setUserStorageData('wishlistItems', state.wishlistItems);
    },
    // Load wishlist for a specific user (called when user logs in)
    loadUserWishlist: (state) => {
      const userWishlistItems = getUserStorageData('wishlistItems', []);
      state.wishlistItems = userWishlistItems;
    },
    // Clear wishlist when user logs out
    clearUserWishlist: (state) => {
      state.wishlistItems = [];
    },
  }
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistLoading,
  setWishlistError,
  loadWishlistFromStorage,
  loadUserWishlist,
  clearUserWishlist
} = wishlistSlice.actions;

export default wishlistSlice.reducer; 