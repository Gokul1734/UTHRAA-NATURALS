// Advertisement Service
class AdvertisementService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.advertisements = this.loadFromStorage();
  }

  // Load advertisements from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('advertisements');
      return stored ? JSON.parse(stored) : this.getDefaultAdvertisements();
    } catch (error) {
      console.error('Error loading advertisements from storage:', error);
      return this.getDefaultAdvertisements();
    }
  }

  // Save advertisements to localStorage
  saveToStorage(advertisements) {
    try {
      localStorage.setItem('advertisements', JSON.stringify(advertisements));
    } catch (error) {
      console.error('Error saving advertisements to storage:', error);
    }
  }

  // Get default advertisements for demo
  getDefaultAdvertisements() {
    return [
      {
        _id: '1',
        title: 'Summer Sale - 50% Off!',
        description: 'Get amazing discounts on all organic products. Limited time offer!',
        type: 'popup',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
        link: '/products?sale=summer',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        isActive: true,
        isCurrentlyActive: true,
        showOnPages: ['home', 'products'],
        targetAudience: 'all',
        priority: 1,
        maxImpressions: 10000,
        currentImpressions: 3456,
        maxClicks: 500,
        currentClicks: 123,
        createdAt: '2024-05-15T10:30:00Z',
        backgroundColor: '#10B981',
        textColor: '#FFFFFF',
        buttonColor: '#059669',
        buttonTextColor: '#FFFFFF'
      },
      {
        _id: '2',
        title: 'New Product Launch',
        description: 'Discover our latest organic honey collection. Pure and natural!',
        type: 'popup',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop',
        link: '/products/category/honey',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        isActive: true,
        isCurrentlyActive: true,
        showOnPages: ['home'],
        targetAudience: 'new',
        priority: 2,
        maxImpressions: 5000,
        currentImpressions: 1234,
        maxClicks: 200,
        currentClicks: 45,
        createdAt: '2024-06-20T14:20:00Z',
        backgroundColor: '#F59E0B',
        textColor: '#FFFFFF',
        buttonColor: '#D97706',
        buttonTextColor: '#FFFFFF'
      },
      {
        _id: '3',
        title: 'Free Shipping on Orders Above ₹999',
        description: 'Enjoy free delivery on all orders above ₹999. Shop now and save!',
        type: 'popup',
        image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&h=600&fit=crop',
        link: '/products',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        isCurrentlyActive: true,
        showOnPages: ['home', 'products', 'cart'],
        targetAudience: 'all',
        priority: 3,
        maxImpressions: 15000,
        currentImpressions: 7890,
        maxClicks: 800,
        currentClicks: 234,
        createdAt: '2024-01-01T00:00:00Z',
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        buttonColor: '#2563EB',
        buttonTextColor: '#FFFFFF'
      }
    ];
  }

  // Get all advertisements
  async getAllAdvertisements() {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${this.baseURL}/advertisements`);
      // return await response.json();
      
      return this.advertisements;
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      return [];
    }
  }

  // Get active advertisements for a specific page
  getActiveAdvertisements(page = 'home') {
    const now = new Date();
    return this.advertisements.filter(ad => {
      const startDate = new Date(ad.startDate);
      const endDate = new Date(ad.endDate);
      
      return ad.isActive && 
             ad.isCurrentlyActive &&
             now >= startDate && 
             now <= endDate &&
             ad.showOnPages.includes(page) &&
             (ad.maxImpressions === 0 || ad.currentImpressions < ad.maxImpressions);
    }).sort((a, b) => a.priority - b.priority);
  }

  // Get the highest priority active advertisement
  getHighestPriorityAd(page = 'home') {
    const activeAds = this.getActiveAdvertisements(page);
    return activeAds.length > 0 ? activeAds[0] : null;
  }

  // Create new advertisement
  async createAdvertisement(adData) {
    try {
      const newAd = {
        _id: Date.now().toString(),
        ...adData,
        currentImpressions: 0,
        currentClicks: 0,
        createdAt: new Date().toISOString(),
        isCurrentlyActive: adData.isActive
      };
      
      this.advertisements.unshift(newAd);
      this.saveToStorage(this.advertisements);
      
      return newAd;
    } catch (error) {
      console.error('Error creating advertisement:', error);
      throw error;
    }
  }

  // Update advertisement
  async updateAdvertisement(id, adData) {
    try {
      const index = this.advertisements.findIndex(ad => ad._id === id);
      if (index !== -1) {
        this.advertisements[index] = {
          ...this.advertisements[index],
          ...adData,
          isCurrentlyActive: adData.isActive
        };
        this.saveToStorage(this.advertisements);
        return this.advertisements[index];
      }
      throw new Error('Advertisement not found');
    } catch (error) {
      console.error('Error updating advertisement:', error);
      throw error;
    }
  }

  // Delete advertisement
  async deleteAdvertisement(id) {
    try {
      this.advertisements = this.advertisements.filter(ad => ad._id !== id);
      this.saveToStorage(this.advertisements);
      return true;
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      throw error;
    }
  }

  // Toggle advertisement active status
  async toggleAdvertisementStatus(id) {
    try {
      const index = this.advertisements.findIndex(ad => ad._id === id);
      if (index !== -1) {
        this.advertisements[index].isActive = !this.advertisements[index].isActive;
        this.advertisements[index].isCurrentlyActive = this.advertisements[index].isActive;
        this.saveToStorage(this.advertisements);
        return this.advertisements[index];
      }
      throw new Error('Advertisement not found');
    } catch (error) {
      console.error('Error toggling advertisement status:', error);
      throw error;
    }
  }

  // Record impression
  recordImpression(adId) {
    const ad = this.advertisements.find(a => a._id === adId);
    if (ad) {
      ad.currentImpressions++;
      this.saveToStorage(this.advertisements);
    }
  }

  // Record click
  recordClick(adId) {
    const ad = this.advertisements.find(a => a._id === adId);
    if (ad) {
      ad.currentClicks++;
      this.saveToStorage(this.advertisements);
    }
  }

  // Check if user has seen this ad recently (to avoid showing same ad repeatedly)
  hasSeenAdRecently(adId, hours = 24) {
    const key = `ad_seen_${adId}`;
    const lastSeen = localStorage.getItem(key);
    if (!lastSeen) return false;
    
    const lastSeenTime = new Date(lastSeen);
    const now = new Date();
    const hoursSinceLastSeen = (now - lastSeenTime) / (1000 * 60 * 60);
    
    return hoursSinceLastSeen < hours;
  }

  // Check if user has seen this ad recently for specific pages
  hasSeenAdRecentlyForPage(adId, page, hours = 24) {
    // For home page, always allow showing ads (return false)
    if (page === 'home') {
      return false;
    }
    
    // For other pages, check recent viewing history
    return this.hasSeenAdRecently(adId, hours);
  }

  // Mark ad as seen
  markAdAsSeen(adId) {
    const key = `ad_seen_${adId}`;
    localStorage.setItem(key, new Date().toISOString());
  }

  // Get advertisement statistics
  getStatistics() {
    const totalAds = this.advertisements.length;
    const activeAds = this.advertisements.filter(ad => ad.isActive).length;
    const totalImpressions = this.advertisements.reduce((sum, ad) => sum + ad.currentImpressions, 0);
    const totalClicks = this.advertisements.reduce((sum, ad) => sum + ad.currentClicks, 0);
    
    return {
      totalAds,
      activeAds,
      totalImpressions,
      totalClicks,
      averageCTR: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0
    };
  }
}

export default new AdvertisementService(); 