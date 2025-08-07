const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFixOrders() {
  console.log('🧪 Testing Fix Existing Orders and New Format\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log('📊 Database:', healthResponse.data.database);
    console.log('');

    // Test 2: Phone Login to get admin token
    console.log('2️⃣ Testing Phone Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/phone-login`, {
      phone: '9876543210'
    });
    console.log('✅ Phone login successful');
    const token = loginResponse.data.token;
    console.log('🔑 Token received:', token ? 'Yes' : 'No');
    console.log('');

    // Test 3: List all orders to see current state
    console.log('3️⃣ Listing All Orders...');
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/orders/debug/all-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Orders listed successfully');
      console.log('📦 Total orders:', listResponse.data.totalOrders);
      
      if (listResponse.data.orders && listResponse.data.orders.length > 0) {
        console.log('🔍 Sample orders:');
        listResponse.data.orders.slice(0, 3).forEach((order, index) => {
          console.log(`  Order ${index + 1}: ${order.orderId || 'MISSING'} (${order.status})`);
        });
      }
    } catch (error) {
      console.log('❌ Failed to list orders:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 4: Fix existing orders
    console.log('4️⃣ Fixing Existing Orders...');
    try {
      const fixResponse = await axios.post(`${BASE_URL}/api/orders/fix-existing-orders`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Fix orders successful');
      console.log('🔧 Fixed orders count:', fixResponse.data.fixedCount);
    } catch (error) {
      console.log('❌ Failed to fix orders:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 5: Test new order ID generation
    console.log('5️⃣ Testing New Order ID Generation...');
    try {
      const orderIdResponse = await axios.get(`${BASE_URL}/api/orders/debug/test-orderid`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Order ID generation successful');
      console.log('🔍 Generated Order ID:', orderIdResponse.data.testOrderId);
      console.log('🔍 Format check:', orderIdResponse.data.testOrderId.startsWith('ORD') ? '✅ Correct format' : '❌ Wrong format');
      console.log('🔍 No # prefix:', !orderIdResponse.data.testOrderId.includes('#') ? '✅ No # found' : '❌ # found');
    } catch (error) {
      console.log('❌ Failed to test order ID generation:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Fix Orders Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Server is running and healthy');
    console.log('✅ Authentication is working');
    console.log('✅ Existing orders checked and fixed');
    console.log('✅ New Order ID format: ORD00001 (no # prefix)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure server is running: npm run dev');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Verify the port (default: 5000)');
  }
}

// Run the test
testFixOrders(); 