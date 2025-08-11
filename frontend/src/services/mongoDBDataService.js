import deliveryChargesService from './deliveryChargesService';
import taxService from './taxService';
import { API_BASE_URL } from '../config/environment';

class MongoDBDataService {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  // Test MongoDB connection and data fetching
  async testMongoDBConnection() {
    console.log('🔍 Testing MongoDB connection...');
    
    const results = {
      deliveryCharges: null,
      taxSettings: null,
      timestamp: new Date().toISOString(),
      success: false
    };

    try {
      // Test delivery charges endpoint
      console.log('🔍 Testing delivery charges endpoint...');
      const deliveryResponse = await fetch(`${API_BASE_URL}/public/delivery-charges`);
      results.deliveryCharges = {
        status: deliveryResponse.status,
        ok: deliveryResponse.ok,
        data: deliveryResponse.ok ? await deliveryResponse.json() : null,
        error: !deliveryResponse.ok ? await deliveryResponse.text() : null
      };

      // Test tax settings endpoint
      console.log('🔍 Testing tax settings endpoint...');
      const taxResponse = await fetch(`${API_BASE_URL}/public/tax-settings`);
      results.taxSettings = {
        status: taxResponse.status,
        ok: taxResponse.ok,
        data: taxResponse.ok ? await taxResponse.json() : null,
        error: !taxResponse.ok ? await taxResponse.text() : null
      };

      results.success = results.deliveryCharges.ok && results.taxSettings.ok;
      
      console.log('🔍 MongoDB connection test results:', results);
      return results;
    } catch (error) {
      console.error('🔍 MongoDB connection test failed:', error);
      results.error = error.message;
      return results;
    }
  }

  // Get comprehensive status of all MongoDB data
  async getMongoDBStatus() {
    const status = {
      timestamp: new Date().toISOString(),
      deliveryCharges: deliveryChargesService.getStatus(),
      taxSettings: taxService.getStatus(),
      connection: await this.testMongoDBConnection()
    };

    console.log('🔍 MongoDB Status:', status);
    return status;
  }

  // Refresh all MongoDB data
  async refreshAllMongoDBData() {
    console.log('🔍 Refreshing all MongoDB data...');
    
    try {
      const [deliveryCharges, taxSettings] = await Promise.all([
        deliveryChargesService.refreshDeliveryCharges(),
        taxService.refreshTaxSettings()
      ]);

      const result = {
        success: true,
        timestamp: new Date().toISOString(),
        deliveryCharges: {
          count: deliveryCharges.length,
          activeCount: deliveryCharges.filter(rule => rule.isActive).length
        },
        taxSettings: {
          gstRate: taxSettings.gst,
          isActive: taxSettings.isActive
        }
      };

      console.log('🔍 MongoDB data refresh completed:', result);
      return result;
    } catch (error) {
      console.error('🔍 MongoDB data refresh failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Start monitoring MongoDB data
  startMonitoring(intervalMs = 300000) { // Default: 5 minutes
    if (this.isMonitoring) {
      console.log('🔍 MongoDB monitoring already active');
      return;
    }

    console.log(`🔍 Starting MongoDB monitoring (interval: ${intervalMs}ms)`);
    this.isMonitoring = true;
    
    this.monitoringInterval = setInterval(async () => {
      console.log('🔍 MongoDB monitoring check...');
      await this.getMongoDBStatus();
    }, intervalMs);
  }

  // Stop monitoring MongoDB data
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.isMonitoring = false;
      console.log('🔍 MongoDB monitoring stopped');
    }
  }

  // Get MongoDB data statistics
  getMongoDBStatistics() {
    const deliveryStatus = deliveryChargesService.getStatus();
    const taxStatus = taxService.getStatus();

    return {
      deliveryCharges: {
        totalRules: deliveryStatus.count,
        activeRules: deliveryStatus.activeCount,
        inactiveRules: deliveryStatus.count - deliveryStatus.activeCount,
        lastUpdated: deliveryStatus.lastUpdated ? new Date(deliveryStatus.lastUpdated).toISOString() : null
      },
      taxSettings: {
        gstRate: taxStatus.gstRate,
        isActive: taxStatus.isActive,
        lastUpdated: taxStatus.lastUpdated ? new Date(taxStatus.lastUpdated).toISOString() : null
      },
      system: {
        deliveryChargesLoaded: deliveryStatus.isLoaded,
        taxSettingsLoaded: taxStatus.isLoaded,
        monitoringActive: this.isMonitoring
      }
    };
  }

  // Validate MongoDB data integrity
  validateMongoDBData() {
    const deliveryCharges = deliveryChargesService.deliveryCharges;
    const taxSettings = taxService.taxSettings;

    const validation = {
      deliveryCharges: {
        isValid: true,
        errors: [],
        warnings: []
      },
      taxSettings: {
        isValid: true,
        errors: [],
        warnings: []
      }
    };

    // Validate delivery charges
    if (!Array.isArray(deliveryCharges)) {
      validation.deliveryCharges.isValid = false;
      validation.deliveryCharges.errors.push('Delivery charges is not an array');
    } else {
      deliveryCharges.forEach((rule, index) => {
        if (typeof rule.minWeight !== 'number') {
          validation.deliveryCharges.errors.push(`Rule ${index}: minWeight must be a number`);
        }
        if (rule.maxWeight !== null && typeof rule.maxWeight !== 'number') {
          validation.deliveryCharges.errors.push(`Rule ${index}: maxWeight must be null or a number`);
        }
        if (typeof rule.charge !== 'number') {
          validation.deliveryCharges.errors.push(`Rule ${index}: charge must be a number`);
        }
        if (rule.minWeight > rule.maxWeight && rule.maxWeight !== null) {
          validation.deliveryCharges.warnings.push(`Rule ${index}: minWeight is greater than maxWeight`);
        }
      });
    }

    // Validate tax settings
    if (typeof taxSettings.gst !== 'number' || taxSettings.gst < 0) {
      validation.taxSettings.errors.push('GST rate must be a positive number');
    }
    if (typeof taxSettings.cgst !== 'number' || taxSettings.cgst < 0) {
      validation.taxSettings.errors.push('CGST rate must be a positive number');
    }
    if (typeof taxSettings.sgst !== 'number' || taxSettings.sgst < 0) {
      validation.taxSettings.errors.push('SGST rate must be a positive number');
    }
    if (Math.abs((taxSettings.cgst + taxSettings.sgst) - taxSettings.gst) > 0.01) {
      validation.taxSettings.warnings.push('CGST + SGST should equal GST rate');
    }

    validation.deliveryCharges.isValid = validation.deliveryCharges.errors.length === 0;
    validation.taxSettings.isValid = validation.taxSettings.errors.length === 0;

    return validation;
  }
}

// Create a singleton instance
const mongoDBDataService = new MongoDBDataService();

export default mongoDBDataService; 