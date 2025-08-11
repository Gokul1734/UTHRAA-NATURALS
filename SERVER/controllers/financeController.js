const TaxSettings = require('../models/TaxSettings');
const DeliveryCharges = require('../models/DeliveryCharges');
const ProductOffer = require('../models/ProductOffer');
const CombinedProduct = require('../models/CombinedProduct');

// Tax Settings Controllers
const getTaxSettings = async (req, res) => {
  try {
    let settings = await TaxSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new TaxSettings({
        gst: 18,
        cgst: 9,
        sgst: 9,
        isActive: true
      });
      await settings.save();
    }
    
    res.json({
      success: true,
      settings: settings
    });
  } catch (error) {
    console.error('Get tax settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get tax settings' });
  }
};

const updateTaxSettings = async (req, res) => {
  try {
    const { gst, cgst, sgst, isActive } = req.body;
    
    let settings = await TaxSettings.findOne();
    
    if (!settings) {
      settings = new TaxSettings();
    }
    
    settings.gst = gst || 18;
    settings.cgst = cgst || 9;
    settings.sgst = sgst || 9;
    settings.isActive = isActive !== undefined ? isActive : true;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Tax settings updated successfully',
      settings: settings
    });
  } catch (error) {
    console.error('Update tax settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update tax settings' });
  }
};

// Delivery Charges Controllers
const getDeliveryCharges = async (req, res) => {
  try {
    let charges = await DeliveryCharges.findOne();
    
    if (!charges) {
      // Create default charges if none exist
      charges = new DeliveryCharges({
        charges: [
          { minWeight: 0, maxWeight: 1000, charge: 0, isActive: true },
          { minWeight: 1000, maxWeight: 5000, charge: 100, isActive: true },
          { minWeight: 5000, maxWeight: 10000, charge: 200, isActive: true },
          { minWeight: 10000, maxWeight: null, charge: 300, isActive: true }
        ]
      });
      await charges.save();
    }
    
    res.json({
      success: true,
      charges: charges.charges
    });
  } catch (error) {
    console.error('Get delivery charges error:', error);
    res.status(500).json({ success: false, message: 'Failed to get delivery charges' });
  }
};

const updateDeliveryCharges = async (req, res) => {
  try {
    const { charges } = req.body;
    
    let deliveryCharges = await DeliveryCharges.findOne();
    
    if (!deliveryCharges) {
      deliveryCharges = new DeliveryCharges();
    }
    
    deliveryCharges.charges = charges;
    await deliveryCharges.save();
    
    res.json({
      success: true,
      message: 'Delivery charges updated successfully',
      charges: deliveryCharges.charges
    });
  } catch (error) {
    console.error('Update delivery charges error:', error);
    res.status(500).json({ success: false, message: 'Failed to update delivery charges' });
  }
};

// Product Offers Controllers
const getProductOffers = async (req, res) => {
  try {
    const offers = await ProductOffer.find().populate('applicableProducts', 'name price');
    
    res.json({
      success: true,
      offers: offers
    });
  } catch (error) {
    console.error('Get product offers error:', error);
    res.status(500).json({ success: false, message: 'Failed to get product offers' });
  }
};

const createProductOffer = async (req, res) => {
  try {
    const offerData = req.body;
    
    const offer = new ProductOffer(offerData);
    await offer.save();
    
    res.json({
      success: true,
      message: 'Product offer created successfully',
      offer: offer
    });
  } catch (error) {
    console.error('Create product offer error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product offer' });
  }
};

const updateProductOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const offer = await ProductOffer.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Product offer not found' });
    }
    
    res.json({
      success: true,
      message: 'Product offer updated successfully',
      offer: offer
    });
  } catch (error) {
    console.error('Update product offer error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product offer' });
  }
};

const deleteProductOffer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const offer = await ProductOffer.findByIdAndDelete(id);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Product offer not found' });
    }
    
    res.json({
      success: true,
      message: 'Product offer deleted successfully'
    });
  } catch (error) {
    console.error('Delete product offer error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product offer' });
  }
};

// Combined Products Controllers
const getCombinedProducts = async (req, res) => {
  try {
    const combinedProducts = await CombinedProduct.find().populate('products.productId', 'name price images');
    
    res.json({
      success: true,
      combinedProducts: combinedProducts
    });
  } catch (error) {
    console.error('Get combined products error:', error);
    res.status(500).json({ success: false, message: 'Failed to get combined products' });
  }
};

const createCombinedProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    const combinedProduct = new CombinedProduct(productData);
    await combinedProduct.save();
    
    res.json({
      success: true,
      message: 'Combined product created successfully',
      combinedProduct: combinedProduct
    });
  } catch (error) {
    console.error('Create combined product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create combined product' });
  }
};

const updateCombinedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const combinedProduct = await CombinedProduct.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!combinedProduct) {
      return res.status(404).json({ success: false, message: 'Combined product not found' });
    }
    
    res.json({
      success: true,
      message: 'Combined product updated successfully',
      combinedProduct: combinedProduct
    });
  } catch (error) {
    console.error('Update combined product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update combined product' });
  }
};

const deleteCombinedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const combinedProduct = await CombinedProduct.findByIdAndDelete(id);
    
    if (!combinedProduct) {
      return res.status(404).json({ success: false, message: 'Combined product not found' });
    }
    
    res.json({
      success: true,
      message: 'Combined product deleted successfully'
    });
  } catch (error) {
    console.error('Delete combined product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete combined product' });
  }
};

module.exports = {
  getTaxSettings,
  updateTaxSettings,
  getDeliveryCharges,
  updateDeliveryCharges,
  getProductOffers,
  createProductOffer,
  updateProductOffer,
  deleteProductOffer,
  getCombinedProducts,
  createCombinedProduct,
  updateCombinedProduct,
  deleteCombinedProduct
}; 