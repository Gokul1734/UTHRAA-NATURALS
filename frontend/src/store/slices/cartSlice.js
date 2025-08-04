import { createSlice } from '@reduxjs/toolkit';
import { 
  getUserStorageData, 
  setUserStorageData, 
  removeUserStorageData, 
  migrateToUserStorage 
} from '../../utils/storageUtils';

// Get cart from user-specific localStorage with migration support
const getInitialCartItems = () => {
  // First try to migrate old data
  const migratedData = migrateToUserStorage('cartItems', []);
  if (migratedData.length > 0) {
    return migratedData;
  }
  
  // Then get user-specific data
  return getUserStorageData('cartItems', []);
};

const cartItems = getInitialCartItems();

// Helper function to calculate totals
const calculateCartTotals = (items) => {
  const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const tax = total * 0.18; // 18% GST
  const shipping = total > 500 ? 0 : 50; // Free shipping above ₹500
  const grandTotal = total + tax + shipping;
  return { total, tax, shipping, grandTotal };
};

const initialState = {
  cartItems,
  ...calculateCartTotals(cartItems),
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      console.log('🔍 Cart slice: Adding item to cart:', item);
      const existingItem = state.cartItems.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        state.cartItems = state.cartItems.map((cartItem) =>
          cartItem._id === existingItem._id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        state.cartItems.push(item);
      }

      console.log('🔍 Cart slice: Updated cart items:', state.cartItems);

      // Save to user-specific localStorage
      setUserStorageData('cartItems', state.cartItems);
      
      // Calculate totals
      const totals = calculateCartTotals(state.cartItems);
      Object.assign(state, totals);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
      setUserStorageData('cartItems', state.cartItems);
      
      // Calculate totals
      const totals = calculateCartTotals(state.cartItems);
      Object.assign(state, totals);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((item) => item._id === id);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          state.cartItems = state.cartItems.filter((item) => item._id !== id);
        }
      }
      setUserStorageData('cartItems', state.cartItems);
      
      // Calculate totals
      const totals = calculateCartTotals(state.cartItems);
      Object.assign(state, totals);
    },
    clearCart: (state) => {
      state.cartItems = [];
      removeUserStorageData('cartItems');
      
      // Reset totals
      Object.assign(state, calculateCartTotals([]));
    },
    calculateTotals: (state) => {
      const totals = calculateCartTotals(state.cartItems);
      Object.assign(state, totals);
    },
    // Load cart for a specific user (called when user logs in)
    loadUserCart: (state) => {
      const userCartItems = getUserStorageData('cartItems', []);
      state.cartItems = userCartItems;
      const totals = calculateCartTotals(userCartItems);
      Object.assign(state, totals);
    },
    // Clear cart when user logs out
    clearUserCart: (state) => {
      state.cartItems = [];
      const totals = calculateCartTotals([]);
      Object.assign(state, totals);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  calculateTotals,
  loadUserCart,
  clearUserCart,
} = cartSlice.actions;

export default cartSlice.reducer; 