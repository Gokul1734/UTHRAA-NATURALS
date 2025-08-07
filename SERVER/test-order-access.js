const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
require('dotenv').config();

async function testOrderAccess() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uthraa-naturals');
    console.log('Connected to MongoDB');

    // Find order #ORD00011
    const order = await Order.findOne({ orderId: '#ORD00011' });
    if (!order) {
      console.log('Order #ORD00011 not found');
      return;
    }

    console.log('Order #ORD00011 found, userId:', order.userId);

    // Find the user who owns this order
    const user = await User.findById(order.userId);
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log('Generated JWT token:', token);
    console.log('\nTest the API with:');
    console.log(`curl -X GET "https://uthraa-naturals.onrender.com/api/orders/%23ORD00011" -H "Authorization: Bearer ${token}"`);

    // Test the API call
    const https = require('https');
    const http = require('http');

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/%23ORD00011',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`\nAPI Response Status: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('API Response:', data);
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
    });

    req.end();

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testOrderAccess(); 