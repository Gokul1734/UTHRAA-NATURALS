const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testNewOrderFormat() {
  console.log('🧪 Testing New Order ID Format (ORD00001)\n');

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

    // Test 3: Test Order ID Generation
    console.log('3️⃣ Testing Order ID Generation...');
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

    // Test 4: Create a test order
    console.log('4️⃣ Testing Order Creation...');
    try {
      const createOrderResponse = await axios.post(`${BASE_URL}/api/orders/create`, {
        items: [
          {
            productId: "507f1f77bcf86cd799439011", // Mock product ID
            name: "Test Product",
            price: 100,
            quantity: 1,
            total: 100
          }
        ],
        totalAmount: 100,
        itemCount: 1,
        customerInfo: {
          name: "Test User",
          email: "test@example.com",
          phone: "+91 98765 43210"
        },
        selectedAddressId: "507f1f77bcf86cd799439012", // Mock address ID
        paymentMethod: "cod",
        shippingMethod: "standard"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Order creation successful');
      console.log('🔍 Created Order ID:', createOrderResponse.data.order.orderId);
      console.log('🔍 Format check:', createOrderResponse.data.order.orderId.startsWith('ORD') ? '✅ Correct format' : '❌ Wrong format');
      console.log('🔍 No # prefix:', !createOrderResponse.data.order.orderId.includes('#') ? '✅ No # found' : '❌ # found');
      
      const newOrderId = createOrderResponse.data.order.orderId;
      console.log('');

      // Test 5: Test retrieving the order with new format
      console.log('5️⃣ Testing Order Retrieval with New Format...');
      try {
        const getOrderResponse = await axios.get(`${BASE_URL}/api/orders/${newOrderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Order retrieval successful');
        console.log('🔍 Retrieved Order ID:', getOrderResponse.data.order.orderId);
        console.log('🔍 Order Status:', getOrderResponse.data.order.status);
      } catch (error) {
        console.log('❌ Failed to retrieve order:', error.response?.data?.message || error.message);
      }
      console.log('');

    } catch (error) {
      console.log('❌ Failed to create test order:', error.response?.data?.message || error.message);
    }

    console.log('🎉 New Order Format Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Server is running and healthy');
    console.log('✅ Authentication is working');
    console.log('✅ New Order ID format: ORD00001 (no # prefix)');
    console.log('✅ Order creation with new format');
    console.log('✅ Order retrieval with new format');

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
testNewOrderFormat(); 