import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Upload,
  X,
  Calendar,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';

const AdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'popup',
    image: '',
    link: '',
    startDate: '',
    endDate: '',
    isActive: true,
    showOnPages: [],
    targetAudience: 'all',
    priority: 1,
    maxImpressions: 0,
    currentImpressions: 0,
    maxClicks: 0,
    currentClicks: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdvertisements();
  }, [user, navigate]);

  const fetchAdvertisements = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockAds = [
        {
          _id: '1',
          title: 'Summer Sale - 50% Off!',
          description: 'Get amazing discounts on all organic products',
          type: 'popup',
          image: 'https://via.placeholder.com/400x300?text=Summer+Sale',
          link: '/products?sale=summer',
          startDate: '2024-06-01',
          endDate: '2024-08-31',
          isActive: true,
          showOnPages: ['home', 'products'],
          targetAudience: 'all',
          priority: 1,
          maxImpressions: 10000,
          currentImpressions: 3456,
          maxClicks: 500,
          currentClicks: 123,
          createdAt: '2024-05-15T10:30:00Z'
        },
        {
          _id: '2',
          title: 'New Product Launch',
          description: 'Discover our latest organic honey collection',
          type: 'banner',
          image: 'https://via.placeholder.com/800x200?text=New+Honey+Collection',
          link: '/products/category/honey',
          startDate: '2024-07-01',
          endDate: '2024-09-30',
          isActive: true,
          showOnPages: ['home'],
          targetAudience: 'new',
          priority: 2,
          maxImpressions: 5000,
          currentImpressions: 1234,
          maxClicks: 200,
          currentClicks: 45,
          createdAt: '2024-06-20T14:20:00Z'
        }
      ];
      setAdvertisements(mockAds);
    } catch (error) {
      toast.error('Error fetching advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingAd) {
        // Update advertisement
        setAdvertisements(prev => prev.map(ad => 
          ad._id === editingAd._id 
            ? { ...ad, ...formData }
            : ad
        ));
        toast.success('Advertisement updated successfully');
      } else {
        // Create new advertisement
        const newAd = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setAdvertisements(prev => [newAd, ...prev]);
        toast.success('Advertisement created successfully');
      }
      
      resetForm();
      setShowModal(false);
    } catch (error) {
      toast.error('Error saving advertisement');
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      type: ad.type,
      image: ad.image,
      link: ad.link,
      startDate: ad.startDate,
      endDate: ad.endDate,
      isActive: ad.isActive,
      showOnPages: ad.showOnPages,
      targetAudience: ad.targetAudience,
      priority: ad.priority,
      maxImpressions: ad.maxImpressions,
      currentImpressions: ad.currentImpressions,
      maxClicks: ad.maxClicks,
      currentClicks: ad.currentClicks
    });
    setImagePreview(ad.image);
    setShowModal(true);
  };

  const handleDelete = async (adId) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        setAdvertisements(prev => prev.filter(ad => ad._id !== adId));
        toast.success('Advertisement deleted successfully');
      } catch (error) {
        toast.error('Error deleting advertisement');
      }
    }
  };

  const toggleActive = async (adId) => {
    try {
      setAdvertisements(prev => prev.map(ad => 
        ad._id === adId 
          ? { ...ad, isActive: !ad.isActive }
          : ad
      ));
      toast.success('Advertisement status updated');
    } catch (error) {
      toast.error('Error updating advertisement status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'popup',
      image: '',
      link: '',
      startDate: '',
      endDate: '',
      isActive: true,
      showOnPages: [],
      targetAudience: 'all',
      priority: 1,
      maxImpressions: 0,
      currentImpressions: 0,
      maxClicks: 0,
      currentClicks: 0
    });
    setImageFile(null);
    setImagePreview('');
    setEditingAd(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'popup': return 'bg-red-100 text-red-800';
      case 'banner': return 'bg-blue-100 text-blue-800';
      case 'sidebar': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (now < start) return 'bg-yellow-100 text-yellow-800';
    if (now > end) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive, startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (!isActive) return 'Inactive';
    if (now < start) return 'Scheduled';
    if (now > end) return 'Expired';
    return 'Active';
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advertisement Management</h1>
            <p className="text-gray-600 mt-2">Manage popups, banners, and promotional content</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Advertisement
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ads</p>
                <p className="text-2xl font-bold text-gray-900">{advertisements.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Ads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {advertisements.filter(ad => ad.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {advertisements.reduce((sum, ad) => sum + ad.currentImpressions, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {advertisements.reduce((sum, ad) => sum + ad.currentClicks, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advertisements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map((ad) => (
            <motion.div
              key={ad._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Ad Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(ad.type)}`}>
                    {ad.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.isActive, ad.startDate, ad.endDate)}`}>
                    {getStatusText(ad.isActive, ad.startDate, ad.endDate)}
                  </span>
                </div>
              </div>

              {/* Ad Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{ad.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.description}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Impressions:</span>
                    <div className="font-medium">{ad.currentImpressions.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Clicks:</span>
                    <div className="font-medium">{ad.currentClicks.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">CTR:</span>
                    <div className="font-medium">
                      {ad.currentImpressions > 0 
                        ? ((ad.currentClicks / ad.currentImpressions) * 100).toFixed(2) + '%'
                        : '0%'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Priority:</span>
                    <div className="font-medium">{ad.priority}</div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(ad._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        ad.isActive 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={ad.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {ad.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(ad)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <a
                    href={ad.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View Link →
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add/Edit Advertisement Modal */}
        <AnimatePresence>
          {showModal && (
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
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          className="input-field"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type *
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                          >
                            <option value="popup">Popup</option>
                            <option value="banner">Banner</option>
                            <option value="sidebar">Sidebar</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <input
                            type="number"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            min="1"
                            max="10"
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Link URL
                        </label>
                        <input
                          type="url"
                          name="link"
                          value={formData.link}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    {/* Scheduling & Targeting */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Scheduling & Targeting</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date *
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Audience
                        </label>
                        <select
                          name="targetAudience"
                          value={formData.targetAudience}
                          onChange={handleInputChange}
                          className="input-field"
                        >
                          <option value="all">All Users</option>
                          <option value="new">New Users</option>
                          <option value="returning">Returning Users</option>
                          <option value="premium">Premium Users</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Show On Pages
                        </label>
                        <div className="space-y-2">
                          {['home', 'products', 'product-detail', 'cart', 'checkout'].map((page) => (
                            <label key={page} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.showOnPages.includes(page)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      showOnPages: [...prev.showOnPages, page]
                                    }));
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      showOnPages: prev.showOnPages.filter(p => p !== page)
                                    }));
                                  }
                                }}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize">
                                {page.replace('-', ' ')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Impressions
                          </label>
                          <input
                            type="number"
                            name="maxImpressions"
                            value={formData.maxImpressions}
                            onChange={handleInputChange}
                            min="0"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Clicks
                          </label>
                          <input
                            type="number"
                            name="maxClicks"
                            value={formData.maxClicks}
                            onChange={handleInputChange}
                            min="0"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advertisement Image */}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Advertisement Image</h3>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="ad-image-upload"
                      />
                      <label
                        htmlFor="ad-image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload image</span>
                      </label>
                    </div>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingAd ? 'Update Advertisement' : 'Create Advertisement'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdvertisementManagement; 