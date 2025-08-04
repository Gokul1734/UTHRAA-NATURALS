import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ConditionalNavbar from './components/layout/ConditionalNavbar';
import ConditionalFooter from './components/layout/ConditionalFooter';
import UserDataLoader from './components/common/UserDataLoader';
import StorageDebugger from './components/debug/StorageDebugger';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import PhoneLogin from './pages/PhoneLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import About from './pages/About';
import Contact from './pages/Contact';
import OrderTracking from './pages/OrderTracking';
import useScrollToTop from './utils/useScrollToTop';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import AdvertisementManagement from './pages/Admin/AdvertisementManagement';
import FinanceManagement from './pages/Admin/FinanceManagement';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin'] }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/phone-login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/phone-login" replace />;
  }
  
  return children;
};

// Component to handle scroll behavior inside Router context
function AppContent() {
  // Hook to automatically scroll to top on route changes
  useScrollToTop();

  return (
    <div className="App">
      <UserDataLoader />
      <ConditionalNavbar />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes (No Authentication Required) */}
          <Route path="/" element={<Home />} />
          <Route path="/phone-login" element={<PhoneLogin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* Protected Routes (Require Authentication) */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/order-success" element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } />
          <Route path="/order-tracking" element={
            <ProtectedRoute>
              <Navigate to="/orders" replace />
            </ProtectedRoute>
          } />
          <Route path="/order-tracking/:orderId" element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute>
              <ProductManagement />
            </AdminRoute>
          } />
          <Route path="/admin/categories" element={
            <AdminRoute>
              <CategoryManagement />
            </AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute>
              <OrderManagement />
            </AdminRoute>
          } />
          <Route path="/admin/advertisements" element={
            <AdminRoute>
              <AdvertisementManagement />
            </AdminRoute>
          } />
          <Route path="/admin/finance" element={
            <AdminRoute>
              <FinanceManagement />
            </AdminRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ConditionalFooter />
      <StorageDebugger />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
