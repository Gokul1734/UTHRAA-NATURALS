import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid, List, Search, Star, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { getProducts } from '../store/slices/productSlice';
import { getCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/products/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  
  const dispatch = useDispatch();
  const { products, isLoading, totalPages, currentPage, total } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  // Get current filters from URL
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'createdAt';
  const currentOrder = searchParams.get('order') || 'desc';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentPage_ = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    setLocalSearch(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    const params = {
      page: currentPage_.toString(),
      limit: '12',
      search: currentSearch,
      category: currentCategory,
      sort: currentSort,
      order: currentOrder,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
    };
    
    // Remove empty params
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });
    
    dispatch(getProducts(params));
  }, [dispatch, searchParams, currentSearch, currentCategory, currentSort, currentOrder, currentMinPrice, currentMaxPrice, currentPage_]);

  // Prevent scroll when filters modal is open on mobile
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);

  const updateURLParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when filters change
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    updateURLParams(key, value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateURLParams('search', localSearch);
  };

  const clearFilters = () => {
    setSearchParams({});
    setLocalSearch('');
  };

  const handlePageChange = (page) => {
    updateURLParams('page', page.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilters && !event.target.closest('.filters-container') && !event.target.closest('.filter-toggle-btn')) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  return (
    <div className="pt-14 sm:pt-16 lg:pt-18 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Our Products
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Discover our complete range of natural and organic products
          </p>
          {total > 0 && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Showing {products.length} of {total} products
            </p>
          )}
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search products..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                />
              </div>
            </form>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle-btn lg:hidden flex items-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation"
              >
                <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">Filters</span>
                {(currentCategory || currentMinPrice || currentMaxPrice) && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </button>

              {/* Clear Filters */}
              {(currentSearch || currentCategory || currentMinPrice || currentMaxPrice) && (
                <button
                  onClick={clearFilters}
                  className="px-3 sm:px-4 py-3 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors touch-manipulation"
                >
                  Clear
                </button>
              )}

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center space-x-1 border border-gray-300 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={currentCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={`${currentSort}-${currentOrder}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      handleFilterChange('sort', sort);
                      handleFilterChange('order', order);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="ratings-desc">Highest Rated</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentMinPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={currentMaxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Filters Modal */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
              
              {/* Filter Modal */}
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="filters-container fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 lg:hidden max-h-[85vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors touch-manipulation"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category
                    </label>
                    <select
                      value={currentCategory}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Sort By
                    </label>
                    <select
                      value={`${currentSort}-${currentOrder}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        handleFilterChange('sort', sort);
                        handleFilterChange('order', order);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="ratings-desc">Highest Rated</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Min Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={currentMinPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Max Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="10000"
                        value={currentMaxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                  <div className="flex gap-3">
                    <button
                      onClick={clearFilters}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium touch-manipulation"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium touch-manipulation"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {isLoading ? (
            <div className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {[...Array(12)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl h-64 sm:h-80 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-left py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Try adjusting your search criteria or browse our categories
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium touch-manipulation"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-8 sm:mt-12 flex justify-center"
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage_ - 1)}
                      disabled={currentPage_ === 1}
                      className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors touch-manipulation"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage_ - 1 && page <= currentPage_ + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg transition-colors touch-manipulation ${
                              page === currentPage_
                                ? 'bg-green-600 text-white border-green-600'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage_ - 2 ||
                        page === currentPage_ + 2
                      ) {
                        return <span key={page} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage_ + 1)}
                      disabled={currentPage_ === totalPages}
                      className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors touch-manipulation"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Products; 