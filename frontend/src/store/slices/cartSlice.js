import { createSlice } from '@reduxjs/toolkit';

// Get cart from localStorage
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

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

      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      
      // Calculate totals
      const totals = calculateCartTotals(state.cartItems);
      Object.assign(state, totals);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      
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
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
      
      // Calculate totals
      const totals = calculateCartTotals(state.cartItems);
      Object.assign(state, totals);
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
      
      // Reset totals
      Object.assign(state, calculateCartTotals([]));
    },
    calculateTotals: (state) => {
      const totals = calculateCartTotals(state.cartItems);
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
} = cartSlice.actions;

export default cartSlice.reducer; 