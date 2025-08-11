const mongoose = require('mongoose');
const DeliveryCharges = require('./models/DeliveryCharges');
const TaxSettings = require('./models/TaxSettings');
require('dotenv').config();

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uthraa-naturals';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });

    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    return true;

  } catch (error) {
    console.error('🔴 MongoDB connection failed:', error.message);
    return false;
  }
};

// Seed delivery charges data
const seedDeliveryCharges = async () => {
  try {
    console.log('🔍 Seeding delivery charges...');
    
    // Check if delivery charges already exist
    const existingCharges = await DeliveryCharges.findOne();
    if (existingCharges) {
      console.log('🔍 Delivery charges already exist, skipping...');
      return existingCharges;
    }

    // Create default delivery charges
    const deliveryCharges = new DeliveryCharges({
      charges: [
        {
          minWeight: 0,
          maxWeight: 1000,
          charge: 0,
          isActive: true
        },
        {
          minWeight: 1000,
          maxWeight: 5000,
          charge: 100,
          isActive: true
        },
        {
          minWeight: 5000,
          maxWeight: 10000,
          charge: 200,
          isActive: true
        },
        {
          minWeight: 10000,
          maxWeight: null,
          charge: 300,
          isActive: true
        }
      ]
    });

    const savedCharges = await deliveryCharges.save();
    console.log('✅ Delivery charges seeded successfully:', savedCharges);
    return savedCharges;

  } catch (error) {
    console.error('🔴 Error seeding delivery charges:', error);
    throw error;
  }
};

// Seed tax settings data
const seedTaxSettings = async () => {
  try {
    console.log('🔍 Seeding tax settings...');
    
    // Check if tax settings already exist
    const existingTaxSettings = await TaxSettings.findOne();
    if (existingTaxSettings) {
      console.log('🔍 Tax settings already exist, skipping...');
      return existingTaxSettings;
    }

    // Create default tax settings
    const taxSettings = new TaxSettings({
      gst: 18,
      cgst: 9,
      sgst: 9,
      isActive: true
    });

    const savedTaxSettings = await taxSettings.save();
    console.log('✅ Tax settings seeded successfully:', savedTaxSettings);
    return savedTaxSettings;

  } catch (error) {
    console.error('🔴 Error seeding tax settings:', error);
    throw error;
  }
};

// Main seeding function
const seedPricingData = async () => {
  try {
    console.log('🚀 Starting pricing data seeding...');
    
    // Connect to MongoDB
    const connected = await connectDB();
    if (!connected) {
      console.error('🔴 Failed to connect to MongoDB');
      process.exit(1);
    }

    // Seed both delivery charges and tax settings
    const [deliveryCharges, taxSettings] = await Promise.all([
      seedDeliveryCharges(),
      seedTaxSettings()
    ]);

    console.log('🎉 Pricing data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Delivery Charges: ${deliveryCharges.charges.length} rules created`);
    console.log(`   - Tax Settings: GST ${taxSettings.gst}%, CGST ${taxSettings.cgst}%, SGST ${taxSettings.sgst}%`);
    
    // Test the public endpoints
    console.log('\n🔍 Testing public endpoints...');
    console.log('   - GET /public/delivery-charges');
    console.log('   - GET /public/tax-settings');
    console.log('   - GET /public/pricing-data');

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔴 MongoDB connection closed');
    process.exit(0);

  } catch (error) {
    console.error('🔴 Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedPricingData();
}

module.exports = { seedPricingData, seedDeliveryCharges, seedTaxSettings }; 