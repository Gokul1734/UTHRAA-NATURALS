import { API_BASE_URL } from '../config/environment';

class DeliveryChargesService {
  constructor() {
    this.deliveryCharges = [];
    this.isLoaded = false;
  }

  async fetchDeliveryCharges() {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      console.log('🔍 Fetching delivery charges from MongoDB via API...');
      console.log('🔍 API URL:', `${API_BASE_URL}/public/delivery-charges`);

      // Use dedicated public endpoint for delivery charges from MongoDB
      const response = await fetch(`${API_BASE_URL}/public/delivery-charges`, {
        headers: headers
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Delivery charges data from MongoDB:', data);
        
        // Handle different response structures from MongoDB
        let charges = [];
        if (data.charges && Array.isArray(data.charges)) {
          charges = data.charges;
        } else if (Array.isArray(data)) {
          charges = data;
        } else if (data.data && Array.isArray(data.data)) {
          charges = data.data;
        } else {
          console.warn('🔍 Unexpected data structure from MongoDB:', data);
          charges = [];
        }

        // Ensure MongoDB ObjectId is handled properly
        this.deliveryCharges = charges.map(charge => ({
          id: charge._id || charge.id,
          minWeight: charge.minWeight || 0,
          maxWeight: charge.maxWeight,
          charge: charge.charge || 0,
          isActive: charge.isActive !== false, // Default to true if not specified
          createdAt: charge.createdAt,
          updatedAt: charge.updatedAt
        }));

        this.isLoaded = true;
        console.log('🔍 Processed delivery charges:', this.deliveryCharges);
        return this.deliveryCharges;
      } else {
        console.error('🔍 Failed to fetch delivery charges from MongoDB');
        console.error('🔍 Response status:', response.status);
        console.error('🔍 Response status text:', response.statusText);
        
        // Try to get error details
        try {
          const errorData = await response.text();
          console.error('🔍 Error response body:', errorData);
        } catch (e) {
          console.error('🔍 Could not read error response body');
        }
        
        return this.getDefaultDeliveryCharges();
      }
    } catch (error) {
      console.error('🔍 Error fetching delivery charges from MongoDB:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return this.getDefaultDeliveryCharges();
    }
  }

  getDefaultDeliveryCharges() {
    // Default delivery charges if API fails
    return [
      { id: 1, minWeight: 0, maxWeight: 1000, charge: 0, isActive: true },
      { id: 2, minWeight: 1000, maxWeight: 5000, charge: 100, isActive: true },
      { id: 3, minWeight: 5000, maxWeight: 10000, charge: 200, isActive: true },
      { id: 4, minWeight: 10000, maxWeight: null, charge: 300, isActive: true }
    ];
  }

  calculateDeliveryCharge(cartWeight) {
    if (!this.isLoaded) {
      // If not loaded, use default charges
      this.deliveryCharges = this.getDefaultDeliveryCharges();
    }

    // Find the applicable delivery charge rule
    const applicableRule = this.deliveryCharges
      .filter(rule => rule.isActive)
      .find(rule => {
        const minWeight = rule.minWeight || 0;
        const maxWeight = rule.maxWeight;
        
        if (maxWeight === null) {
          // No upper limit
          return cartWeight >= minWeight;
        } else {
          return cartWeight >= minWeight && cartWeight <= maxWeight;
        }
      });

    return applicableRule ? applicableRule.charge : 0;
  }

  getDeliveryChargeBreakdown(cartWeight) {
    const charge = this.calculateDeliveryCharge(cartWeight);
    const applicableRule = this.deliveryCharges
      .filter(rule => rule.isActive)
      .find(rule => {
        const minWeight = rule.minWeight || 0;
        const maxWeight = rule.maxWeight;
        
        if (maxWeight === null) {
          return cartWeight >= minWeight;
        } else {
          return cartWeight >= minWeight && cartWeight <= maxWeight;
        }
      });

    return {
      charge,
      rule: applicableRule,
      weight: cartWeight,
      isFree: charge === 0
    };
  }

  async loadDeliveryCharges() {
    if (!this.isLoaded) {
      await this.fetchDeliveryCharges();
    }
    return this.deliveryCharges;
  }

  // Force refresh delivery charges from MongoDB
  async refreshDeliveryCharges() {
    console.log('🔍 Refreshing delivery charges from MongoDB...');
    this.isLoaded = false;
    return await this.fetchDeliveryCharges();
  }

  // Validate MongoDB delivery charge data
  validateDeliveryChargeData(charge) {
    return {
      id: charge._id || charge.id,
      minWeight: typeof charge.minWeight === 'number' ? charge.minWeight : 0,
      maxWeight: charge.maxWeight === null ? null : (typeof charge.maxWeight === 'number' ? charge.maxWeight : 0),
      charge: typeof charge.charge === 'number' ? charge.charge : 0,
      isActive: charge.isActive !== false,
      createdAt: charge.createdAt,
      updatedAt: charge.updatedAt
    };
  }

  // Get delivery charges status
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      count: this.deliveryCharges.length,
      activeCount: this.deliveryCharges.filter(rule => rule.isActive).length,
      lastUpdated: this.deliveryCharges.length > 0 ? 
        Math.max(...this.deliveryCharges.map(rule => new Date(rule.updatedAt || rule.createdAt || 0)).map(date => date.getTime())) : null
    };
  }
}

// Create a singleton instance
const deliveryChargesService = new DeliveryChargesService();

export default deliveryChargesService; 