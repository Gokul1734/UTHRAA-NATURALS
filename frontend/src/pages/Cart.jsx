import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, total, tax, shipping, grandTotal } = useSelector((state) => state.cart);

  if (cartItems.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
            <p className="text-gray-600 mb-8">Your cart is empty</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600">Cart functionality coming soon...</p>
          <p className="text-sm text-gray-500 mt-2">
            Items in cart: {cartItems.length} | Total: ₹{grandTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart; 