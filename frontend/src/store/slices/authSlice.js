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

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      if (response.data) {
        sessionStorage.setItem('user', JSON.stringify(response.data));
        // Load user-specific cart and wishlist after registration
        thunkAPI.dispatch(loadUserData());
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, userData);
      if (response.data) {
        sessionStorage.setItem('user', JSON.stringify(response.data));
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

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      // Clear user-specific data before logout
      thunkAPI.dispatch(clearUserData());
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
);

// Get user profile
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      const token = sessionStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, config);
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
    // Direct login action for phone login
    directLogin: (state, action) => {
      state.user = action.payload;
      state.isSuccess = true;
    },
    // Direct logout action
    directLogout: (state) => {
      state.user = null;
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    },
    // Load user-specific data (cart and wishlist)
    loadUserData: (state) => {
      // This action will be handled by the store to dispatch cart and wishlist actions
    },
    // Clear user-specific data
    clearUserData: (state) => {
      // This action will be handled by the store to dispatch cart and wishlist actions
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      });
  }
});

export const {
  reset,
  directLogin,
  directLogout,
  loadUserData,
  clearUserData
} = authSlice.actions;

export default authSlice.reducer; 