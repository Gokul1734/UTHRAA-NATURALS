import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Package, 
  Truck, 
  Percent, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  DollarSign,
  Weight,
  Tag,
  ShoppingCart,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { API_BASE_URL } from '../../config/environment';

const FinanceManagement = () => {
  const navigate = useNavigate();
  
  // State for different sections
  const [activeTab, setActiveTab] = useState('tax');
  const [loading, setLoading] = useState(false);
  
  // Tax Settings
  const [taxSettings, setTaxSettings] = useState({
    gst: 18,
    cgst: 9,
    sgst: 9,
    isActive: true
  });
  
  // Delivery Charges by Weight
  const [deliveryCharges, setDeliveryCharges] = useState([
    { id: 1, minWeight: 0, maxWeight: 1000, charge: 0, isActive: true },
    { id: 2, minWeight: 1000, maxWeight: 5000, charge: 100, isActive: true },
    { id: 3, minWeight: 5000, maxWeight: 10000, charge: 200, isActive: true },
    { id: 4, minWeight: 10000, maxWeight: null, charge: 300, isActive: true }
  ]);
  
  // Product Offers
  const [productOffers, setProductOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [newOffer, setNewOffer] = useState({
    name: '',
    description: '',
    discountType: 'percentage', // percentage or fixed
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    applicableProducts: [] // product IDs
  });

  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  const token = user?.token || sessionStorage.getItem('token');
  
  // Available products for offers
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tax settings
      await fetchTaxSettings();
      
      // Fetch delivery charges
      await fetchDeliveryCharges();
      
      // Fetch product offers
      await fetchProductOffers();
      
      // Fetch available products
      await fetchAvailableProducts();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxSettings = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Using token for tax settings request');
      } else {
        console.log('🔍 No token available for tax settings request');
      }
      
      console.log('🔍 Fetching tax settings from admin endpoint...');
      const response = await fetch(`${API_BASE_URL}/admin/tax-settings`, {
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Tax settings response:', data);
        
        // Handle the admin controller response format
        if (data.success && data.settings) {
          setTaxSettings(data.settings);
          console.log('🔍 Tax settings updated:', data.settings);
        } else if (data.settings) {
          // Fallback for direct settings access
          setTaxSettings(data.settings);
          console.log('🔍 Tax settings updated (fallback):', data.settings);
        } else {
          console.error('🔍 Unexpected tax settings response format:', data);
        }
      } else {
        console.error('🔍 Failed to fetch tax settings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tax settings:', error);
    }
  };

  const fetchDeliveryCharges = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/delivery-charges`, {
        headers: headers
      });
      if (response.ok) {
        const data = await response.json();
        // Add id fields to each delivery charge entry for proper state management
        const chargesWithIds = data.charges.map((charge, index) => ({
          ...charge,
          id: charge.id || index + 1
        }));
        setDeliveryCharges(chargesWithIds);
      }
    } catch (error) {
      console.error('Error fetching delivery charges:', error);
    }
  };

  const fetchProductOffers = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/product-offers`, {
        headers: headers
      });
      if (response.ok) {
        const data = await response.json();
        setProductOffers(data.offers);
      }
    } catch (error) {
      console.error('Error fetching product offers:', error);
    }
  };

  const fetchAvailableProducts = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: headers
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching available products:', error);
    }
  };

  // Tax Settings Functions
  const forceEnableTax = async () => {
    try {
      const updatedSettings = {
        ...taxSettings,
        isActive: true
      };
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/tax-settings`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updatedSettings)
      });
      
      if (response.ok) {
        setTaxSettings(updatedSettings);
        toast.success('Tax has been force enabled successfully');
        console.log('🔍 Tax force enabled:', updatedSettings);
      } else {
        toast.error('Failed to force enable tax');
      }
    } catch (error) {
      console.error('Error force enabling tax:', error);
      toast.error('Failed to force enable tax');
    }
  };

  const saveTaxSettings = async () => {
    try {

       const token = sessionStorage.getItem('token') || 'null';


       const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      const response = await fetch(`${API_BASE_URL}/admin/tax-settings`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(taxSettings)
      });
      
      if (response.ok) {
        toast.success('Tax settings updated successfully');
      } else {
        toast.error('Failed to update tax settings');
      }
    } catch (error) {
      console.error('Error saving tax settings:', error);
      toast.error('Failed to save tax settings');
    }
  };

  // Delivery Charges Functions
  const addDeliveryCharge = () => {
    const newId = Math.max(...deliveryCharges.map(d => d.id), 0) + 1;
    setDeliveryCharges([...deliveryCharges, {
      id: newId,
      minWeight: 0,
      maxWeight: null,
      charge: 0,
      isActive: true
    }]);
  };

  const updateDeliveryCharge = (id, field, value) => {
    setDeliveryCharges(prev => prev.map(charge => 
      charge.id === id ? { ...charge, [field]: value } : charge
    ));
  };

  const removeDeliveryCharge = (id) => {
    setDeliveryCharges(prev => prev.filter(charge => charge.id !== id));
  };

  const saveDeliveryCharges = async () => {
    try {
       const token = sessionStorage.getItem('token') || 'null';
       console.log(token);
       const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      
      // Remove id fields before sending to backend
      const chargesForBackend = deliveryCharges.map(({ id, ...charge }) => charge);
      
      const response = await fetch(`${API_BASE_URL}/admin/delivery-charges`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ charges: chargesForBackend })
      });
      
      if (response.ok) {
        toast.success('Delivery charges updated successfully');
      } else {
        toast.error('Failed to update delivery charges');
      }
    } catch (error) {
      console.error('Error saving delivery charges:', error);
      toast.error('Failed to save delivery charges');
    }
  };

  // Product Offers Functions
  const openOfferModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setNewOffer(offer);
    } else {
      setEditingOffer(null);
      setNewOffer({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        startDate: '',
        endDate: '',
        isActive: true,
        applicableProducts: []
      });
    }
    setShowOfferModal(true);
  };

  const saveOffer = async () => {
    try {
       const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔍 Added Authorization header');
      }
      const url = editingOffer 
        ? `${API_BASE_URL}/admin/product-offers/${editingOffer._id}`
        : `${API_BASE_URL}/admin/product-offers`;
      
      const method = editingOffer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: headers,
        body: JSON.stringify(newOffer)
      });
      
      if (response.ok) {
        toast.success(`Offer ${editingOffer ? 'updated' : 'created'} successfully`);
        setShowOfferModal(false);
        fetchProductOffers();
      } else {
        toast.error(`Failed to ${editingOffer ? 'update' : 'create'} offer`);
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error('Failed to save offer');
    }
  };

  const deleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/product-offers/${offerId}`, {
        method: 'DELETE',
        headers: headers
      });
      
      if (response.ok) {
        toast.success('Offer deleted successfully');
        fetchProductOffers();
      } else {
        toast.error('Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const tabs = [
    { id: 'tax', label: 'Tax Settings', icon: Percent },
    { id: 'delivery', label: 'Delivery Charges', icon: Truck },
    { id: 'offers', label: 'Product Offers', icon: Tag }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pricing & Offers Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage tax rates, delivery charges, and offers</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto scrollbar-hide" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          {/* Tax Settings */}
          {activeTab === 'tax' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Tax Configuration</h2>
                <div className="flex gap-2">
                  <button
                    onClick={fetchTaxSettings}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                  >
                    <Settings className="h-4 w-4" />
                    Refresh
                  </button>
                  <button
                    onClick={saveTaxSettings}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4" />
                    Save Settings
                  </button>
                  <button
                    onClick={forceEnableTax}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base"
                  >
                    <Percent className="h-4 w-4" />
                    Force Enable Tax
                  </button>
                </div>
              </div>
              


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxSettings.gst}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, gst: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxSettings.cgst}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, cgst: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxSettings.sgst}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, sgst: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="taxActive"
                    checked={taxSettings.isActive}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="taxActive" className="ml-2 text-sm text-gray-700">
                    Enable Tax Calculation
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Delivery Charges */}
          {activeTab === 'delivery' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Delivery Charges by Weight</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={addDeliveryCharge}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4" />
                    Add Rule
                  </button>
                  <button
                    onClick={saveDeliveryCharges}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="space-y-4 overflow-x-auto">
                {deliveryCharges.map((charge, index) => (
                  <div key={charge.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg min-w-[600px]">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Weight (g)</label>
                        <input
                          type="number"
                          value={charge.minWeight}
                          onChange={(e) => updateDeliveryCharge(charge.id, 'minWeight', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Weight (g)</label>
                        <input
                          type="number"
                          value={charge.maxWeight || ''}
                          onChange={(e) => updateDeliveryCharge(charge.id, 'maxWeight', e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          placeholder="No limit"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Charge (₹)</label>
                        <input
                          type="number"
                          value={charge.charge}
                          onChange={(e) => updateDeliveryCharge(charge.id, 'charge', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={charge.isActive}
                          onChange={(e) => updateDeliveryCharge(charge.id, 'isActive', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Active</label>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeliveryCharge(charge.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Product Offers */}
          {activeTab === 'offers' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Product Offers</h2>
                <button
                  onClick={() => openOfferModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4" />
                  Create Offer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto">
                {productOffers.map((offer) => (
                  <div key={offer._id} className="border border-gray-200 rounded-lg p-4 min-w-[280px]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 truncate">{offer.name}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openOfferModal(offer)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteOffer(offer._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{offer.description}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span className="font-medium">
                          {offer.discountValue}{offer.discountType === 'percentage' ? '%' : '₹'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Order:</span>
                        <span>₹{offer.minOrderValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Product Offers Modal */}
        <AnimatePresence>
          {showOfferModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                    </h2>
                    <button
                      onClick={() => setShowOfferModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Offer Name</label>
                      <input
                        type="text"
                        value={newOffer.name}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter offer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                      <select
                        value={newOffer.discountType}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, discountType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newOffer.description}
                      onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter offer description"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                      <input
                        type="number"
                        value={newOffer.discountValue}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, discountValue: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Value</label>
                      <input
                        type="number"
                        value={newOffer.minOrderValue}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, minOrderValue: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount</label>
                      <input
                        type="number"
                        value={newOffer.maxDiscount}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, maxDiscount: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={newOffer.startDate}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={newOffer.endDate}
                        onChange={(e) => setNewOffer(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="offerActive"
                      checked={newOffer.isActive}
                      onChange={(e) => setNewOffer(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="offerActive" className="ml-2 text-sm text-gray-700">
                      Active Offer
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowOfferModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveOffer}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingOffer ? 'Update Offer' : 'Create Offer'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default FinanceManagement; 