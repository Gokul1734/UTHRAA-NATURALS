import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';

const FinanceManagement = () => {
  const [financialData, setFinancialData] = useState({
    revenue: {
      total: 0,
      monthly: 0,
      weekly: 0,
      daily: 0
    },
    orders: {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0
    },
    customers: {
      total: 0,
      new: 0,
      returning: 0
    },
    products: {
      total: 0,
      sold: 0,
      lowStock: 0
    }
  });
  const [transactions, setTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchFinancialData();
    fetchTransactions();
  }, [user, navigate, selectedPeriod]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData = {
        revenue: {
          total: 1250000,
          monthly: 125000,
          weekly: 31250,
          daily: 4464
        },
        orders: {
          total: 1250,
          completed: 1100,
          pending: 120,
          cancelled: 30
        },
        customers: {
          total: 850,
          new: 150,
          returning: 700
        },
        products: {
          total: 156,
          sold: 89,
          lowStock: 8
        }
      };
      setFinancialData(mockData);
    } catch (error) {
      toast.error('Error fetching financial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Mock transactions - replace with actual API call
      const mockTransactions = [
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          customer: 'John Doe',
          amount: 1286.64,
          status: 'completed',
          paymentMethod: 'online',
          date: '2024-01-15T10:30:00Z',
          items: 3
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          customer: 'Jane Smith',
          amount: 899.99,
          status: 'pending',
          paymentMethod: 'cod',
          date: '2024-01-14T15:45:00Z',
          items: 2
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          customer: 'Mike Johnson',
          amount: 2345.50,
          status: 'completed',
          paymentMethod: 'upi',
          date: '2024-01-13T09:20:00Z',
          items: 5
        }
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      toast.error('Error fetching transactions');
    }
  };

  const generateReport = (type) => {
    // Mock report generation - replace with actual implementation
    const reportContent = `
      UTHRAA NATURALS - ${type.toUpperCase()} REPORT
      ===========================================
      
      Generated on: ${new Date().toLocaleDateString()}
      Period: ${selectedPeriod}
      
      REVENUE SUMMARY:
      Total Revenue: ₹${financialData.revenue.total.toLocaleString()}
      Monthly Revenue: ₹${financialData.revenue.monthly.toLocaleString()}
      Weekly Revenue: ₹${financialData.revenue.weekly.toLocaleString()}
      Daily Revenue: ₹${financialData.revenue.daily.toLocaleString()}
      
      ORDER SUMMARY:
      Total Orders: ${financialData.orders.total}
      Completed Orders: ${financialData.orders.completed}
      Pending Orders: ${financialData.orders.pending}
      Cancelled Orders: ${financialData.orders.cancelled}
      
      CUSTOMER SUMMARY:
      Total Customers: ${financialData.customers.total}
      New Customers: ${financialData.customers.new}
      Returning Customers: ${financialData.customers.returning}
      
      PRODUCT SUMMARY:
      Total Products: ${financialData.products.total}
      Products Sold: ${financialData.products.sold}
      Low Stock Items: ${financialData.products.lowStock}
    `;
    
    // Create and download report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${type}-${selectedPeriod}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`${type} report generated and downloaded`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'online': return '💳';
      case 'cod': return '💰';
      case 'upi': return '📱';
      default: return '💳';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Management</h1>
            <p className="text-gray-600 mt-2">Track revenue and financial performance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={() => generateReport('summary')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{financialData.revenue.total.toLocaleString()}
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5%
                </div>
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialData.orders.total.toLocaleString()}
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.3%
                </div>
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialData.customers.total.toLocaleString()}
                </p>
                <div className="flex items-center text-sm text-purple-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15.2%
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialData.products.sold.toLocaleString()}
                </p>
                <div className="flex items-center text-sm text-orange-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +6.7%
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="font-semibold">₹{financialData.revenue.monthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weekly Revenue</span>
                <span className="font-semibold">₹{financialData.revenue.weekly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily Revenue</span>
                <span className="font-semibold">₹{financialData.revenue.daily.toLocaleString()}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-semibold">
                    ₹{(financialData.revenue.total / financialData.orders.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Orders</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{financialData.orders.completed}</span>
                  <span className="text-green-600 text-sm">
                    ({((financialData.orders.completed / financialData.orders.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Orders</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{financialData.orders.pending}</span>
                  <span className="text-yellow-600 text-sm">
                    ({((financialData.orders.pending / financialData.orders.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelled Orders</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{financialData.orders.cancelled}</span>
                  <span className="text-red-600 text-sm">
                    ({((financialData.orders.cancelled / financialData.orders.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue chart will be displayed here</p>
                <p className="text-sm text-gray-400">Integration with chart library required</p>
              </div>
            </div>
          </div>

          {/* Sales Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Sales Distribution</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Sales distribution chart will be displayed here</p>
                <p className="text-sm text-gray-400">Integration with chart library required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <button
                onClick={() => generateReport('transactions')}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.orderNumber}</div>
                      <div className="text-sm text-gray-500">{transaction.items} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{transaction.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                        <span className="text-sm text-gray-900 capitalize">{transaction.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => generateReport('revenue')}
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <DollarSign className="h-8 w-8 mx-auto mb-2" />
            <h4 className="font-semibold">Revenue Report</h4>
            <p className="text-sm opacity-90">Generate detailed revenue analysis</p>
          </button>
          <button
            onClick={() => generateReport('orders')}
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
            <h4 className="font-semibold">Order Report</h4>
            <p className="text-sm opacity-90">Export order statistics</p>
          </button>
          <button
            onClick={() => generateReport('customers')}
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            <Users className="h-8 w-8 mx-auto mb-2" />
            <h4 className="font-semibold">Customer Report</h4>
            <p className="text-sm opacity-90">Customer analytics and insights</p>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinanceManagement; 