import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Package, Filter, Search } from 'lucide-react';
import CombinedProductCard from '../components/products/CombinedProductCard';
import { getCombinedProducts } from '../store/slices/combinedProductSlice';

const CombinedProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { combinedProducts, loading } = useSelector((state) => state.combinedProducts);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    dispatch(getCombinedProducts());
  }, [dispatch]);

  useEffect(() => {
    let filtered = [...(combinedProducts || [])];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.combinedPrice - b.combinedPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.combinedPrice - a.combinedPrice);
        break;
      case 'savings':
        filtered.sort((a, b) => (b.savings || 0) - (a.savings || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProducts(filtered);
  }, [combinedProducts, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading combo offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <Package className="h-6 w-6 text-green-600 mr-2" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Combo Offers & Bundles
              </h1>
            </div>
          </div>
          
          <p className="text-gray-600 max-w-3xl">
            Discover our carefully curated combo offers and save money while enjoying multiple products together. 
            Each package is designed to provide maximum value and convenience.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search combo offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="savings">Highest Savings</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredProducts.length} combo offer{filteredProducts.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((combinedProduct, index) => (
              <motion.div
                key={combinedProduct._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <CombinedProductCard combinedProduct={combinedProduct} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No combo offers found' : 'No combo offers available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No combo offers match your search for "${searchTerm}". Try adjusting your search terms.`
                : 'Check back later for new combo offers and special bundles.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Clear search
              </button>
            )}
          </motion.div>
        )}

        {/* Call to Action */}
        {filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12 pt-8 border-t border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Explore our individual products or contact us to create a custom combo package for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Browse All Products
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CombinedProducts;
