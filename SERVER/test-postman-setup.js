const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testPostmanSetup() {
  console.log('🧪 Testing Postman Setup for Uthraa Naturals API\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log('📊 Database:', healthResponse.data.database);
    console.log('');

    // Test 2: Public Routes
    console.log('2️⃣ Testing Public Routes...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint working');
    console.log('📖 Available endpoints:', rootResponse.data.documentation.endpoints.public.length, 'public routes');
    console.log('');

    // Test 3: Phone Login
    console.log('3️⃣ Testing Phone Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/phone-login`, {
      phone: '9876543210'
    });
    console.log('✅ Phone login successful');
    console.log('🔑 Token received:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('👤 User:', loginResponse.data.user.name);
    console.log('');

    // Test 4: Protected Route with Token
    console.log('4️⃣ Testing Protected Route...');
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected route working');
    console.log('👤 Profile retrieved successfully');
    console.log('');

    console.log('🎉 All tests passed! Your Postman setup should work correctly.');
    console.log('\n📋 Postman Collection Setup:');
    console.log('1. Create a new collection');
    console.log('2. Set base URL: http://localhost:5000');
    console.log('3. Add environment variable: token');
    console.log('4. Use {{token}} in Authorization header: Bearer {{token}}');
    console.log('5. Extract token from login response and set it as environment variable');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure server is running: npm run dev');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Try using dev-test-token in development mode');
    console.log('4. Verify the port (default: 5000)');
  }
}

// Run the test
testPostmanSetup(); 