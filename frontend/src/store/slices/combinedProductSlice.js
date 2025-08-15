import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config/environment';

const initialState = {
  combinedProducts: [],
  combinedProduct: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all combined products
export const getCombinedProducts = createAsyncThunk(
  'combinedProducts/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public/combined-products`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single combined product
export const getCombinedProduct = createAsyncThunk(
  'combinedProducts/getOne',
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public/combined-products/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const combinedProductSlice = createSlice({
  name: 'combinedProducts',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCombinedProduct: (state) => {
      state.combinedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCombinedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCombinedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.combinedProducts = action.payload.combinedProducts;
      })
      .addCase(getCombinedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCombinedProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCombinedProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.combinedProduct = action.payload.combinedProduct;
      })
      .addCase(getCombinedProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCombinedProduct } = combinedProductSlice.actions;
export default combinedProductSlice.reducer;
