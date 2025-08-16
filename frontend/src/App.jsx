import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ConditionalNavbar from './components/layout/ConditionalNavbar';
import ConditionalFooter from './components/layout/ConditionalFooter';
import UserDataLoader from './components/common/UserDataLoader';
import StorageDebugger from './components/debug/StorageDebugger';
import FloatingCart from './components/common/FloatingCart';
import DeliveryChargesLoader from './components/common/DeliveryChargesLoader';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CombinedProductDetail from './pages/CombinedProductDetail';
import CombinedProducts from './pages/CombinedProducts';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import PhoneLogin from './pages/PhoneLogin';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderSuccess from './pages/OrderSuccess';
import About from './pages/About';
import Contact from './pages/Contact';
import OrderTracking from './pages/OrderTracking';
import RealTimeTest from './pages/RealTimeTest';
import useScrollToTop from './utils/useScrollToTop';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import OrderManagement from './pages/Admin/OrderManagement';

import AdvertisementManagement from './pages/Admin/AdvertisementManagement';
import FinanceManagement from './pages/Admin/FinanceManagement';
import UserManagement from './pages/Admin/UserManagement';
import StockManagement from './pages/Admin/StockManagement';

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
  
  // Check if current path is admin
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      <UserDataLoader />
      <DeliveryChargesLoader />
      {!isAdminPage && <ConditionalNavbar />}
      <main className="min-h-screen pb-20 sm:pb-24">
        <Routes>
          {/* Public Routes (No Authentication Required) */}
          <Route path="/" element={<Home />} />
          <Route path="/phone-login" element={<PhoneLogin />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/combined-products" element={<CombinedProducts />} />
          <Route path="/combined-product/:id" element={<CombinedProductDetail />} />
          
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
          <Route path="/admin/users" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />
          <Route path="/admin/stock" element={
            <AdminRoute>
              <StockManagement />
            </AdminRoute>
          } />
          
          {/* Development/Testing Routes */}
          <Route path="/real-time-test" element={<RealTimeTest />} />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminPage && <ConditionalFooter />}
      <FloatingCart />
      <StorageDebugger />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </Provider>
  );
}

export default App;
