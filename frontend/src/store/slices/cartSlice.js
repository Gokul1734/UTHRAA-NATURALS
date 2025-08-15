import { createSlice } from '@reduxjs/toolkit';
import { 
  getUserStorageData, 
  setUserStorageData, 
  removeUserStorageData, 
  migrateToUserStorage 
} from '../../utils/storageUtils';
import deliveryChargesService from '../../services/deliveryChargesService';
import taxService from '../../services/taxService';

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

// Helper function to calculate cart weight
const calculateCartWeight = (items) => {
  return items.reduce((totalWeight, item) => {
    const itemWeight = parseFloat(item.weight) || 0;
    return totalWeight + (itemWeight * (item.quantity || 1));
  }, 0);
};

// Helper function to calculate totals
const calculateCartTotals = (items) => {
  const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  
  // Calculate cart weight
  const cartWeight = calculateCartWeight(items);
  
  // Calculate tax using tax service (with fallback)
  let tax = 0;
  try {
    if (taxService.isLoaded) {
      tax = taxService.calculateTax(total);
    } else {
      // If tax service is not loaded yet, use default 18%
      console.warn('Tax service not loaded yet, using default 18%');
      tax = total * 0.18;
    }
  } catch (error) {
    console.warn('Tax service error, using default 18%:', error);
    tax = total * 0.18;
  }
  
  // Calculate delivery charge based on weight (with fallback)
  let deliveryCharge = 0;
  try {
    if (deliveryChargesService.isLoaded) {
      deliveryCharge = deliveryChargesService.calculateDeliveryCharge(cartWeight);
    } else {
      // If delivery charges service is not loaded yet, use default calculation
      console.warn('Delivery charges service not loaded yet, using default calculation');
      if (cartWeight <= 1000) {
        deliveryCharge = 0;
      } else if (cartWeight <= 5000) {
        deliveryCharge = 100;
      } else if (cartWeight <= 10000) {
        deliveryCharge = 200;
      } else {
        deliveryCharge = 300;
      }
    }
  } catch (error) {
    console.warn('Delivery charges service error, using default calculation:', error);
    // Default delivery charge calculation
    if (cartWeight <= 1000) {
      deliveryCharge = 0;
    } else if (cartWeight <= 5000) {
      deliveryCharge = 100;
    } else if (cartWeight <= 10000) {
      deliveryCharge = 200;
    } else {
      deliveryCharge = 300;
    }
  }
  
  const grandTotal = total + tax + deliveryCharge;
  return { total, tax, shipping: deliveryCharge, grandTotal, cartWeight };
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
    // Update delivery charges (called when delivery charges are loaded)
    updateDeliveryCharges: (state) => {
      const totals = calculateCartTotals(state.cartItems);
      Object.assign(state, totals);
    },
    // Update tax calculations (called when tax settings are loaded)
    updateTaxCalculations: (state) => {
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
  loadUserCart,
  clearUserCart,
  updateDeliveryCharges,
  updateTaxCalculations,
} = cartSlice.actions;

export default cartSlice.reducer; 