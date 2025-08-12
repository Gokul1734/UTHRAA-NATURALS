import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Plus, 
  Minus, 
  Edit, 
  Search, 
  Filter, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { productAPI } from '../../services/api';
import { getFirstImageUrl } from '../../utils/imageUtils';
import AdminLayout from '../../components/layout/AdminLayout';
import toast from 'react-hot-toast';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out, in
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdateData, setStockUpdateData] = useState({
    stock: '',
    operation: 'set' // set, add, subtract
  });
  const [updatingStock, setUpdatingStock] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inStockCount: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
  }, [currentPage, searchTerm, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user') || 'null');
      
      if (!token || !user) {
        setError('Authentication required. Please login again.');
        setProducts([]);
        return;
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        setError('Admin access required.');
        setProducts([]);
        return;
      }

      const params = {
        page: currentPage,
        limit: 10,
        sort: 'stock',
        order: 'asc'
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (stockFilter !== 'all') {
        params.stockStatus = stockFilter;
      }

      const data = await productAPI.getAllAdmin(params);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.total || 0);
      
      // Calculate stats
      calculateStats(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.message.includes('Not authorized') || error.message.includes('no token')) {
        setError('Authentication required. Please login again.');
      } else {
        setError('Failed to load products. Please try again.');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      // Check if user is authenticated
      const token = sessionStorage.getItem('token');
      if (!token) {
        return;
      }

      const data = await productAPI.getLowStock(10);
      setLowStockProducts(data || []);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };

  const calculateStats = (productsList) => {
    const total = productsList.length;
    const lowStock = productsList.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = productsList.filter(p => p.stock === 0).length;
    const inStock = productsList.filter(p => p.stock > 10).length;

    setStats({
      totalProducts: total,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      inStockCount: inStock
    });
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockUpdateData({
      stock: product.stock.toString(),
      operation: 'set'
    });
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setSelectedProduct(null);
    setStockUpdateData({ stock: '', operation: 'set' });
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || !stockUpdateData.stock) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    // Check if user is authenticated
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required. Please login again.');
      return;
    }

    try {
      setUpdatingStock(true);
      
      const stockData = {
        stock: parseInt(stockUpdateData.stock),
        operation: stockUpdateData.operation
      };

      await productAPI.updateStock(selectedProduct._id, stockData);
      
      toast.success('Stock updated successfully');
      closeStockModal();
      fetchProducts();
      fetchLowStockProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      if (error.message.includes('Not authorized') || error.message.includes('no token')) {
        toast.error('Authentication required. Please login again.');
      } else {
        toast.error(error.message || 'Failed to update stock');
      }
    } finally {
      setUpdatingStock(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
    if (stock <= 10) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-100', icon: TrendingDown };
    return { text: 'In Stock', color: 'text-green-600 bg-green-100', icon: Package };
  };

  const getStockStatusIcon = (stock) => {
    const status = getStockStatus(stock);
    const IconComponent = status.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-start justify-start min-h-screen p-6">
          <div className="text-left">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
            <p className="text-gray-600">Loading stock data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-2">Manage product inventory and monitor stock levels</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inStockCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockCount}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStockCount}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <h3 className="text-orange-800 font-medium">Low Stock Alert</h3>
                  <p className="text-orange-700 text-sm">
                    {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} have low stock (≤10 units)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStockFilter('low')}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStockFilter('all');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={getFirstImageUrl(product.images)}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-left text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">₹{product.price}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium">{product.stock}</span>
                        <span className="text-gray-500 ml-1">units</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStockStatus(product.stock).color}`}>
                          {getStockStatusIcon(product.stock)}
                          <span className="ml-1">{getStockStatus(product.stock).text}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openStockModal(product)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Update Stock
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No products found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, totalProducts)}
                    </span>{' '}
                    of <span className="font-medium">{totalProducts}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stock Update Modal */}
        <AnimatePresence>
          {showStockModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                          Update Stock - {selectedProduct?.name}
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Operation
                            </label>
                            <select
                              value={stockUpdateData.operation}
                              onChange={(e) => setStockUpdateData({
                                ...stockUpdateData,
                                operation: e.target.value
                              })}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="set">Set to</option>
                              <option value="add">Add</option>
                              <option value="subtract">Subtract</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={stockUpdateData.stock}
                              onChange={(e) => setStockUpdateData({
                                ...stockUpdateData,
                                stock: e.target.value
                              })}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter quantity"
                            />
                          </div>

                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-600">
                              Current stock: <span className="font-medium">{selectedProduct?.stock}</span> units
                            </p>
                            {stockUpdateData.operation === 'add' && stockUpdateData.stock && (
                              <p className="text-sm text-gray-600 mt-1">
                                New stock will be: <span className="font-medium">{selectedProduct?.stock + parseInt(stockUpdateData.stock)}</span> units
                              </p>
                            )}
                            {stockUpdateData.operation === 'subtract' && stockUpdateData.stock && (
                              <p className="text-sm text-gray-600 mt-1">
                                New stock will be: <span className="font-medium">{Math.max(0, selectedProduct?.stock - parseInt(stockUpdateData.stock))}</span> units
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleStockUpdate}
                      disabled={updatingStock || !stockUpdateData.stock}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStock ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Update Stock
                    </button>
                    <button
                      type="button"
                      onClick={closeStockModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default StockManagement;
