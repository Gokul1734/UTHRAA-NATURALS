import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import ConditionalNavbar from './components/layout/ConditionalNavbar';
import ConditionalFooter from './components/layout/ConditionalFooter';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import PhoneLogin from './pages/PhoneLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import AdvertisementManagement from './pages/Admin/AdvertisementManagement';
import FinanceManagement from './pages/Admin/FinanceManagement';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <ConditionalNavbar />
          <main className="min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/phone-login" element={<PhoneLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/orders" element={<OrderManagement />} />
              <Route path="/admin/advertisements" element={<AdvertisementManagement />} />
              <Route path="/admin/finance" element={<FinanceManagement />} />
              
              {/* Additional Admin Routes (to be implemented) */}
              <Route path="/admin/users" element={<div className="p-6 text-center">User Management - Coming Soon</div>} />
              <Route path="/admin/stock" element={<div className="p-6 text-center">Stock Management - Coming Soon</div>} />
              <Route path="/admin/delivery" element={<div className="p-6 text-center">Delivery Management - Coming Soon</div>} />
              <Route path="/admin/reports" element={<div className="p-6 text-center">Reports & Analytics - Coming Soon</div>} />
              <Route path="/admin/settings" element={<div className="p-6 text-center">System Settings - Coming Soon</div>} />
            </Routes>
          </main>
          <ConditionalFooter />
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
      </Router>
    </Provider>
  );
}

export default App;
