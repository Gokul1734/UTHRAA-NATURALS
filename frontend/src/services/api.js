import { API_BASE_URL } from '../config/environment';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Category API calls
export const categoryAPI = {
  // Get all categories
  getAll: () => apiCall('/categories'),
  
  // Get category by ID
  getById: (id) => apiCall(`/categories/${id}`),
  
  // Create new category
  create: (categoryData) => apiCall('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
  
  // Update category
  update: (id, categoryData) => apiCall(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  }),
  
  // Delete category
  delete: (id) => apiCall(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Product API calls
export const productAPI = {
  // Get all products
  getAll: () => apiCall('/products'),
  
  // Get product by ID
  getById: (id) => apiCall(`/products/${id}`),
  
  // Get products by category
  getByCategory: (categoryId) => apiCall(`/products?category=${categoryId}`),
  
  // Create new product
  create: (productData) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  
  // Update product
  update: (id, productData) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  
  // Delete product
  delete: (id) => apiCall(`/products/${id}`, {
    method: 'DELETE',
  }),
  
  // Upload product images
  uploadImages: (formData) => apiCall('/products/upload-images', {
    method: 'POST',
    headers: {}, // Let browser set Content-Type for FormData
    body: formData,
  }),
};

// Order API calls
export const orderAPI = {
  // Get all orders
  getAll: () => apiCall('/orders'),
  
  // Get order by ID
  getById: (id) => apiCall(`/orders/${id}`),
  
  // Update order status
  updateStatus: (id, status) => apiCall(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  // Update payment status
  updatePayment: (id, isPaid) => apiCall(`/orders/${id}/payment`, {
    method: 'PUT',
    body: JSON.stringify({ isPaid }),
  }),
  
  // Update delivery status
  updateDelivery: (id, isDelivered, trackingNumber) => apiCall(`/orders/${id}/delivery`, {
    method: 'PUT',
    body: JSON.stringify({ isDelivered, trackingNumber }),
  }),
};

// User API calls
export const userAPI = {
  // Get all users
  getAll: () => apiCall('/users'),
  
  // Get user by ID
  getById: (id) => apiCall(`/users/${id}`),
  
  // Update user
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  // Delete user
  delete: (id) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: () => apiCall('/dashboard/stats'),
  
  // Get recent orders
  getRecentOrders: () => apiCall('/dashboard/recent-orders'),
  
  // Get top products
  getTopProducts: () => apiCall('/dashboard/top-products'),
  
  // Get revenue data
  getRevenueData: (period = 'month') => apiCall(`/dashboard/revenue?period=${period}`),
};

// File upload helper
export const uploadFile = async (file, type = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  return apiCall('/upload', {
    method: 'POST',
    headers: {}, // Let browser set Content-Type for FormData
    body: formData,
  });
};

export default {
  categoryAPI,
  productAPI,
  orderAPI,
  userAPI,
  dashboardAPI,
  uploadFile,
}; 