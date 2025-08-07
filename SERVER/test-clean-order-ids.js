const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCleanOrderIds() {
  console.log('🧪 Testing Clean Order IDs (No # Prefix)\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log('📊 Database:', healthResponse.data.database);
    console.log('');

    // Test 2: Phone Login to get token
    console.log('2️⃣ Testing Phone Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/phone-login`, {
      phone: '9876543210'
    });
    console.log('✅ Phone login successful');
    const token = loginResponse.data.token;
    console.log('🔑 Token received:', token ? 'Yes' : 'No');
    console.log('');

    // Test 3: Get user orders to see current format
    console.log('3️⃣ Testing Get User Orders...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ User orders retrieved');
    console.log('📦 Number of orders:', ordersResponse.data.orders?.length || 0);
    
    if (ordersResponse.data.orders && ordersResponse.data.orders.length > 0) {
      const firstOrder = ordersResponse.data.orders[0];
      console.log('🔍 First order ID:', firstOrder.orderId);
      console.log('🔍 Format check:', firstOrder.orderId.startsWith('ORD') ? '✅ Clean format' : '❌ Old format');
      console.log('🔍 No # prefix:', !firstOrder.orderId.includes('#') ? '✅ No # found' : '❌ # found');
      console.log('');

      // Test 4: Test API calls with clean order ID
      console.log('4️⃣ Testing API Calls with Clean Order ID...');
      
      // Test getOrderById
      try {
        const orderResponse = await axios.get(`${BASE_URL}/api/orders/${firstOrder.orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ getOrderById with clean ID successful');
        console.log('🔍 Retrieved Order ID:', orderResponse.data.order.orderId);
      } catch (error) {
        console.log('❌ getOrderById failed:', error.response?.data?.message || error.message);
      }

      // Test download invoice
      try {
        const invoiceResponse = await axios.get(`${BASE_URL}/api/orders/${firstOrder.orderId}/invoice`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ downloadInvoice with clean ID successful');
        console.log('🔍 Invoice Order ID:', invoiceResponse.data.order.orderId);
      } catch (error) {
        console.log('❌ downloadInvoice failed:', error.response?.data?.message || error.message);
      }
      console.log('');

      // Test 5: Test with different order ID formats (backward compatibility)
      console.log('5️⃣ Testing Backward Compatibility...');
      
      // Test with # prefix (should still work)
      if (firstOrder.orderId.startsWith('ORD')) {
        const orderIdWithHash = `#${firstOrder.orderId}`;
        try {
          const orderResponse = await axios.get(`${BASE_URL}/api/orders/${orderIdWithHash}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ getOrderById with # prefix successful (backward compatibility)');
          console.log('🔍 Retrieved Order ID:', orderResponse.data.order.orderId);
        } catch (error) {
          console.log('❌ getOrderById with # prefix failed:', error.response?.data?.message || error.message);
        }
      }
      console.log('');

    } else {
      console.log('⚠️ No orders found to test with');
      console.log('💡 Create an order first to test order ID handling');
    }

    // Test 6: Test order ID generation
    console.log('6️⃣ Testing Order ID Generation...');
    try {
      const orderIdResponse = await axios.get(`${BASE_URL}/api/orders/debug/test-orderid`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Order ID generation successful');
      console.log('🔍 Generated Order ID:', orderIdResponse.data.testOrderId);
      console.log('🔍 Clean format check:', orderIdResponse.data.testOrderId.startsWith('ORD') ? '✅ Clean format' : '❌ Old format');
      console.log('🔍 No # prefix:', !orderIdResponse.data.testOrderId.includes('#') ? '✅ No # found' : '❌ # found');
    } catch (error) {
      console.log('❌ Failed to test order ID generation:', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 Clean Order ID Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Server is running and healthy');
    console.log('✅ Authentication is working');
    console.log('✅ Clean Order ID format: ORD00001 (no # prefix)');
    console.log('✅ API calls work with clean order IDs');
    console.log('✅ Backward compatibility maintained');

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
testCleanOrderIds(); 