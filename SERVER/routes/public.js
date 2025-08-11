const express = require('express');
const router = express.Router();
const DeliveryCharges = require('../models/DeliveryCharges');
const TaxSettings = require('../models/TaxSettings');

// GET /public/delivery-charges - Get delivery charges (no auth required)
router.get('/delivery-charges', async (req, res) => {
  try {
    console.log('🔍 Public delivery charges request received');
    
    // Find the most recent delivery charges document
    const deliveryChargesDoc = await DeliveryCharges.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!deliveryChargesDoc) {
      console.log('🔍 No delivery charges found, returning default data');
      // Return default delivery charges if none exist
      return res.json({
        charges: [
          { id: 1, minWeight: 0, maxWeight: 1000, charge: 0, isActive: true },
          { id: 2, minWeight: 1000, maxWeight: 5000, charge: 100, isActive: true },
          { id: 3, minWeight: 5000, maxWeight: 10000, charge: 200, isActive: true },
          { id: 4, minWeight: 10000, maxWeight: null, charge: 300, isActive: true }
        ]
      });
    }

    // Transform the data to match frontend expectations
    const charges = deliveryChargesDoc.charges.map((charge, index) => ({
      id: charge._id || index + 1,
      minWeight: charge.minWeight,
      maxWeight: charge.maxWeight,
      charge: charge.charge,
      isActive: charge.isActive,
      createdAt: deliveryChargesDoc.createdAt,
      updatedAt: deliveryChargesDoc.updatedAt
    }));

    console.log('🔍 Returning delivery charges:', charges);
    
    res.json({
      charges: charges
    });

  } catch (error) {
    console.error('🔍 Error fetching delivery charges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery charges',
      error: error.message
    });
  }
});

// GET /public/tax-settings - Get tax settings (no auth required)
router.get('/tax-settings', async (req, res) => {
  try {
    console.log('🔍 Public tax settings request received');
    
    // Find the most recent tax settings document
    const taxSettingsDoc = await TaxSettings.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!taxSettingsDoc) {
      console.log('🔍 No tax settings found, returning default data');
      // Return default tax settings if none exist
      return res.json({
        settings: {
          gst: 18,
          cgst: 9,
          sgst: 9,
          isActive: true
        }
      });
    }

    // Transform the data to match frontend expectations
    const settings = {
      gst: taxSettingsDoc.gst,
      cgst: taxSettingsDoc.cgst,
      sgst: taxSettingsDoc.sgst,
      isActive: taxSettingsDoc.isActive,
      _id: taxSettingsDoc._id,
      createdAt: taxSettingsDoc.createdAt,
      updatedAt: taxSettingsDoc.updatedAt
    };

    console.log('🔍 Returning tax settings:', settings);
    
    res.json({
      settings: settings
    });

  } catch (error) {
    console.error('🔍 Error fetching tax settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax settings',
      error: error.message
    });
  }
});

// GET /public/pricing-data - Get both delivery charges and tax settings
router.get('/pricing-data', async (req, res) => {
  try {
    console.log('🔍 Public pricing data request received');
    
    // Fetch both delivery charges and tax settings
    const [deliveryChargesDoc, taxSettingsDoc] = await Promise.all([
      DeliveryCharges.findOne().sort({ createdAt: -1 }).lean(),
      TaxSettings.findOne().sort({ createdAt: -1 }).lean()
    ]);

    // Process delivery charges
    let charges = [];
    if (deliveryChargesDoc) {
      charges = deliveryChargesDoc.charges.map((charge, index) => ({
        id: charge._id || index + 1,
        minWeight: charge.minWeight,
        maxWeight: charge.maxWeight,
        charge: charge.charge,
        isActive: charge.isActive,
        createdAt: deliveryChargesDoc.createdAt,
        updatedAt: deliveryChargesDoc.updatedAt
      }));
    } else {
      // Default delivery charges
      charges = [
        { id: 1, minWeight: 0, maxWeight: 1000, charge: 0, isActive: true },
        { id: 2, minWeight: 1000, maxWeight: 5000, charge: 100, isActive: true },
        { id: 3, minWeight: 5000, maxWeight: 10000, charge: 200, isActive: true },
        { id: 4, minWeight: 10000, maxWeight: null, charge: 300, isActive: true }
      ];
    }

    // Process tax settings
    let settings = {};
    if (taxSettingsDoc) {
      settings = {
        gst: taxSettingsDoc.gst,
        cgst: taxSettingsDoc.cgst,
        sgst: taxSettingsDoc.sgst,
        isActive: taxSettingsDoc.isActive,
        _id: taxSettingsDoc._id,
        createdAt: taxSettingsDoc.createdAt,
        updatedAt: taxSettingsDoc.updatedAt
      };
    } else {
      // Default tax settings
      settings = {
        gst: 18,
        cgst: 9,
        sgst: 9,
        isActive: true
      };
    }

    console.log('🔍 Returning pricing data:', { charges, settings });
    
    res.json({
      deliveryCharges: { charges },
      taxSettings: { settings },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔍 Error fetching pricing data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing data',
      error: error.message
    });
  }
});

module.exports = router; 