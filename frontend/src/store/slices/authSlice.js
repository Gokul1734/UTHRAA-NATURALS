import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/environment';

// Get user from sessionStorage
const user = JSON.parse(sessionStorage.getItem('user'));

const initialState = {
  user: user || null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Phone login
export const phoneLogin = createAsyncThunk(
  'auth/phoneLogin',
  async (phoneData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/phone-login`, phoneData);
      if (response.data) {
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        sessionStorage.setItem('token', response.data.token);
        // Load user-specific cart and wishlist after login
        thunkAPI.dispatch(loadUserData());
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Direct login (for when user data is already available)
export const directLogin = createAsyncThunk(
  'auth/directLogin',
  async (userData, thunkAPI) => {
    try {
      // Load user-specific cart and wishlist after login
      thunkAPI.dispatch(loadUserData());
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Load user data (cart, wishlist, etc.)
export const loadUserData = createAsyncThunk(
  'auth/loadUserData',
  async (_, thunkAPI) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user) {
        return thunkAPI.rejectWithValue('No user found');
      }

      // Load cart data
      thunkAPI.dispatch({ type: 'cart/loadCart' });
      
      // Load wishlist data
      thunkAPI.dispatch({ type: 'wishlist/loadWishlist' });

      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      // Clear session storage
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      
      // Clear cart and wishlist
      thunkAPI.dispatch({ type: 'cart/clearCart' });
      thunkAPI.dispatch({ type: 'wishlist/clearWishlist' });
      
      return null;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, thunkAPI) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data) {
        // Update user in session storage
        const currentUser = JSON.parse(sessionStorage.getItem('user'));
        const updatedUser = { ...currentUser, ...response.data.user };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Phone Login
      .addCase(phoneLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(phoneLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(phoneLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Direct Login
      .addCase(directLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(directLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(directLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Load User Data
      .addCase(loadUserData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserData.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(loadUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isSuccess = false;
        state.isError = false;
        state.message = '';
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer; 