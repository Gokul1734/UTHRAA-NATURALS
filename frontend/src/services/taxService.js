import { API_BASE_URL } from '../config/environment';

class TaxService {
  constructor() {
    this.taxSettings = {
      gst: 18,
      cgst: 9,
      sgst: 9,
      isActive: true
    };
    this.isLoaded = false;
  }

  async fetchTaxSettings() {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      console.log('🔍 Fetching tax settings from MongoDB via API...');
      console.log('🔍 API URL:', `${API_BASE_URL}/public/tax-settings`);

      // Use dedicated public endpoint for tax data from MongoDB
      const response = await fetch(`${API_BASE_URL}/public/tax-settings`, {
        headers: headers
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Tax settings data from MongoDB:', data);
        
        // Handle different response structures from MongoDB
        let settings = {};
        if (data.settings && typeof data.settings === 'object') {
          settings = data.settings;
        } else if (typeof data === 'object' && !Array.isArray(data)) {
          settings = data;
        } else if (data.data && typeof data.data === 'object') {
          settings = data.data;
        } else {
          console.warn('🔍 Unexpected data structure from MongoDB:', data);
          settings = {};
        }

        // Ensure MongoDB data is properly mapped
        this.taxSettings = {
          gst: settings.gst || 18,
          cgst: settings.cgst || 9,
          sgst: settings.sgst || 9,
          isActive: settings.isActive !== false, // Default to true if not specified
          _id: settings._id,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
        };

        this.isLoaded = true;
        console.log('🔍 Processed tax settings:', this.taxSettings);
        return this.taxSettings;
      } else {
        console.error('🔍 Failed to fetch tax settings from MongoDB');
        console.error('🔍 Response status:', response.status);
        console.error('🔍 Response status text:', response.statusText);
        
        // Try to get error details
        try {
          const errorData = await response.text();
          console.error('🔍 Error response body:', errorData);
        } catch (e) {
          console.error('🔍 Could not read error response body');
        }
        
        return this.getDefaultTaxSettings();
      }
    } catch (error) {
      console.error('🔍 Error fetching tax settings from MongoDB:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return this.getDefaultTaxSettings();
    }
  }

  getDefaultTaxSettings() {
    // Default tax settings if API fails
    return {
      gst: 18,
      cgst: 9,
      sgst: 9,
      isActive: true
    };
  }

  calculateTax(amount) {
    if (!this.isLoaded) {
      // If not loaded, use default settings
      this.taxSettings = this.getDefaultTaxSettings();
    }

    if (!this.taxSettings.isActive) {
      return 0;
    }

    return amount * (this.taxSettings.gst / 100);
  }

  getTaxBreakdown(amount) {
    const totalTax = this.calculateTax(amount);
    const cgst = totalTax * (this.taxSettings.cgst / this.taxSettings.gst);
    const sgst = totalTax * (this.taxSettings.sgst / this.taxSettings.gst);

    return {
      total: totalTax,
      cgst: cgst,
      sgst: sgst,
      rate: this.taxSettings.gst,
      isActive: this.taxSettings.isActive
    };
  }

  async loadTaxSettings() {
    if (!this.isLoaded) {
      await this.fetchTaxSettings();
    }
    return this.taxSettings;
  }

  // Force refresh tax settings from MongoDB
  async refreshTaxSettings() {
    console.log('🔍 Refreshing tax settings from MongoDB...');
    this.isLoaded = false;
    return await this.fetchTaxSettings();
  }

  // Validate MongoDB tax settings data
  validateTaxSettingsData(settings) {
    return {
      gst: typeof settings.gst === 'number' ? settings.gst : 18,
      cgst: typeof settings.cgst === 'number' ? settings.cgst : 9,
      sgst: typeof settings.sgst === 'number' ? settings.sgst : 9,
      isActive: settings.isActive !== false,
      _id: settings._id,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    };
  }

  // Get tax settings status
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      gstRate: this.taxSettings.gst,
      isActive: this.taxSettings.isActive,
      lastUpdated: this.taxSettings.updatedAt || this.taxSettings.createdAt
    };
  }
}

// Create a singleton instance
const taxService = new TaxService();

export default taxService; 