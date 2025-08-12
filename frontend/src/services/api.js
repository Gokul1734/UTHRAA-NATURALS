import { API_BASE_URL } from '../config/environment';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from sessionStorage
  const token = sessionStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
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
  // Get all categories (Admin)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/categories?${queryString}`);
  },
  
  // Get category by ID (Admin)
  getById: (id) => apiCall(`/admin/categories/${id}`),
  
  // Create new category (Admin)
  create: (categoryData) => apiCall('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
  
  // Update category (Admin)
  update: (id, categoryData) => apiCall(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  }),
  
  // Delete category (Admin)
  delete: (id) => apiCall(`/admin/categories/${id}`, {
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
  
  // Update stock
  updateStock: (id, stockData) => apiCall(`/products/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify(stockData),
  }),
  
  // Get low stock products
  getLowStock: (threshold = 10) => apiCall(`/products/admin/low-stock?threshold=${threshold}`),
  
  // Get all products (Admin)
  getAllAdmin: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/products?${queryString}`);
  },
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
  
  // Admin order management
  getAllAdmin: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/orders/admin/all?${queryString}`);
  },
  
  // Update order status (Admin)
  updateStatusAdmin: (orderId, status) => apiCall(`/orders/admin/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  // Export orders (Admin)
  exportOrders: (format = 'csv') => apiCall(`/orders/admin/export?format=${format}`),
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
  
  // Admin user management
  getAllAdmin: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/users?${queryString}`);
  },
  
  // Get user analytics (Admin)
  getAnalytics: () => apiCall('/admin/users/analytics/overview'),
  
  // Get user details (Admin)
  getUserDetails: (userId) => apiCall(`/admin/users/${userId}`),
  
  // Update user status (Admin)
  updateUserStatus: (userId, status) => apiCall(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  // Send bulk email (Admin)
  sendBulkEmail: (emailData) => apiCall('/admin/email/send-bulk', {
    method: 'POST',
    body: JSON.stringify(emailData),
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

// Finance Management API calls
export const financeAPI = {
  // Tax settings
  getTaxSettings: () => apiCall('/admin/tax-settings'),
  updateTaxSettings: (taxData) => apiCall('/admin/tax-settings', {
    method: 'PUT',
    body: JSON.stringify(taxData),
  }),
  
  // Delivery charges
  getDeliveryCharges: () => apiCall('/admin/delivery-charges'),
  updateDeliveryCharges: (deliveryData) => apiCall('/admin/delivery-charges', {
    method: 'PUT',
    body: JSON.stringify(deliveryData),
  }),
  
  // Product offers
  getProductOffers: () => apiCall('/admin/product-offers'),
  createProductOffer: (offerData) => apiCall('/admin/product-offers', {
    method: 'POST',
    body: JSON.stringify(offerData),
  }),
  updateProductOffer: (offerId, offerData) => apiCall(`/admin/product-offers/${offerId}`, {
    method: 'PUT',
    body: JSON.stringify(offerData),
  }),
  deleteProductOffer: (offerId) => apiCall(`/admin/product-offers/${offerId}`, {
    method: 'DELETE',
  }),
  
  // Combined products
  getCombinedProducts: () => apiCall('/admin/combined-products'),
  createCombinedProduct: (productData) => apiCall('/admin/combined-products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  updateCombinedProduct: (productId, productData) => apiCall(`/admin/combined-products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),
  deleteCombinedProduct: (productId) => apiCall(`/admin/combined-products/${productId}`, {
    method: 'DELETE',
  }),
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
  financeAPI,
  uploadFile,
}; 