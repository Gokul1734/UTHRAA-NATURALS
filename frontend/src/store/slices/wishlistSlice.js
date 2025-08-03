import { createSlice } from '@reduxjs/toolkit';

// Get wishlist from localStorage
const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];

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
        // Save to localStorage
        localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
      } else {
        console.log('🔍 Wishlist slice: Item already in wishlist');
      }
    },
    removeFromWishlist: (state, action) => {
      console.log('🔍 Wishlist slice: Removing item from wishlist:', action.payload);
      state.wishlistItems = state.wishlistItems.filter(item => item._id !== action.payload);
      console.log('🔍 Wishlist slice: Updated wishlist items:', state.wishlistItems);
      // Save to localStorage
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      localStorage.removeItem('wishlistItems');
    },
    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },
    setWishlistError: (state, action) => {
      state.error = action.payload;
    },
    loadWishlistFromStorage: (state, action) => {
      state.wishlistItems = action.payload || [];
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    }
  }
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistLoading,
  setWishlistError,
  loadWishlistFromStorage
} = wishlistSlice.actions;

export default wishlistSlice.reducer; 