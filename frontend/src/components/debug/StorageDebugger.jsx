import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getUserStorageKeys, getCurrentUserId } from '../../utils/storageUtils';

/**
 * Debug component to show user-specific storage information
 * This is for development/testing purposes only
 */
const StorageDebugger = () => {
  const [storageKeys, setStorageKeys] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  useEffect(() => {
    const keys = getUserStorageKeys();
    setStorageKeys(keys);
  }, [user, cartItems, wishlistItems]);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Show Storage Debug Info"
        >
          🔧
        </button>
      </div>
    );
  }

  const currentUserId = getCurrentUserId();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">Storage Debug</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Current User ID:</strong> {currentUserId || 'Not logged in'}
        </div>
        
        <div>
          <strong>User-specific Storage Keys:</strong>
          <ul className="mt-1 ml-4">
            {storageKeys.map((key, index) => (
              <li key={index} className="text-xs text-gray-600">{key}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <strong>Cart Items:</strong> {cartItems.length}
        </div>
        
        <div>
          <strong>Wishlist Items:</strong> {wishlistItems.length}
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={() => {
              console.log('User Storage Keys:', storageKeys);
              console.log('Cart Items:', cartItems);
              console.log('Wishlist Items:', wishlistItems);
            }}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            Log to Console
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageDebugger; 