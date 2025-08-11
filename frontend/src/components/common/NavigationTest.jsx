import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavigationTest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const testNavigation = (path) => {
    console.log(`🔍 Navigating to: ${path}`);
    console.log(`🔍 Current location: ${location.pathname}`);
    navigate(path);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-semibold mb-2">Navigation Test</h3>
      <div className="space-y-2">
        <button
          onClick={() => testNavigation('/')}
          className="block w-full text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Home
        </button>
        <button
          onClick={() => testNavigation('/products')}
          className="block w-full text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Products
        </button>
        <button
          onClick={() => testNavigation('/about')}
          className="block w-full text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
        >
          About
        </button>
        <button
          onClick={() => testNavigation('/contact')}
          className="block w-full text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
        >
          Contact
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-600">
        Current: {location.pathname}
      </div>
    </div>
  );
};

export default NavigationTest; 