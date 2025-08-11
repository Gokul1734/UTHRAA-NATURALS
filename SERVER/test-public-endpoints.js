const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Test delivery charges endpoint
const testDeliveryCharges = async () => {
  try {
    console.log('🔍 Testing /public/delivery-charges endpoint...');
    
    const response = await axios.get(`${BASE_URL}/public/delivery-charges`);
    
    console.log('✅ Delivery charges endpoint working');
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('🔴 Delivery charges endpoint failed:', error.response?.data || error.message);
    return null;
  }
};

// Test tax settings endpoint
const testTaxSettings = async () => {
  try {
    console.log('🔍 Testing /public/tax-settings endpoint...');
    
    const response = await axios.get(`${BASE_URL}/public/tax-settings`);
    
    console.log('✅ Tax settings endpoint working');
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('🔴 Tax settings endpoint failed:', error.response?.data || error.message);
    return null;
  }
};

// Test combined pricing data endpoint
const testPricingData = async () => {
  try {
    console.log('🔍 Testing /public/pricing-data endpoint...');
    
    const response = await axios.get(`${BASE_URL}/public/pricing-data`);
    
    console.log('✅ Pricing data endpoint working');
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('🔴 Pricing data endpoint failed:', error.response?.data || error.message);
    return null;
  }
};

// Test server health
const testServerHealth = async () => {
  try {
    console.log('🔍 Testing server health...');
    
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    console.log('✅ Server health check passed');
    console.log('📊 Response status:', response.status);
    console.log('📊 Database status:', response.data.database);
    
    return response.data;
  } catch (error) {
    console.error('🔴 Server health check failed:', error.response?.data || error.message);
    return null;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting public endpoints tests...');
  console.log('📍 Base URL:', BASE_URL);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('');

  // Test server health first
  const health = await testServerHealth();
  if (!health) {
    console.error('🔴 Server is not running or not accessible');
    process.exit(1);
  }

  console.log('');

  // Test individual endpoints
  const deliveryCharges = await testDeliveryCharges();
  console.log('');
  
  const taxSettings = await testTaxSettings();
  console.log('');
  
  const pricingData = await testPricingData();
  console.log('');

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   - Server Health: ${health ? '✅ PASS' : '🔴 FAIL'}`);
  console.log(`   - Delivery Charges: ${deliveryCharges ? '✅ PASS' : '🔴 FAIL'}`);
  console.log(`   - Tax Settings: ${taxSettings ? '✅ PASS' : '🔴 FAIL'}`);
  console.log(`   - Pricing Data: ${pricingData ? '✅ PASS' : '🔴 FAIL'}`);

  const allPassed = health && deliveryCharges && taxSettings && pricingData;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Public endpoints are working correctly.');
  } else {
    console.log('\n🔴 Some tests failed. Please check the server and MongoDB connection.');
  }

  return allPassed;
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('🔴 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests, testDeliveryCharges, testTaxSettings, testPricingData }; 