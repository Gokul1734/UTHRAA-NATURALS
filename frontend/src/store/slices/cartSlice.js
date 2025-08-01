import { createSlice } from '@reduxjs/toolkit';

// Get cart from localStorage
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

const initialState = {
  cartItems,
  total: 0,
  tax: 0,
  shipping: 0,
  grandTotal: 0,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
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

      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
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
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
    calculateTotals: (state) => {
      const total = state.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      state.total = total;
      state.tax = total * 0.18; // 18% GST
      state.shipping = total > 500 ? 0 : 50; // Free shipping above ₹500
      state.grandTotal = total + state.tax + state.shipping;
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