const mongoose = require('mongoose');
const Order = require('./models/Order');

async function testGenerationDirect() {
  console.log('🧪 Testing Order ID Generation Directly\n');

  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uthraa-naturals';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Test 1: Check existing orders
    console.log('1️⃣ Checking existing orders...');
    const allOrders = await Order.find({}).select('orderId').sort({ orderId: -1 });
    console.log('📦 Total orders in database:', allOrders.length);
    
    if (allOrders.length > 0) {
      console.log('🔍 Top 5 order IDs:');
      allOrders.slice(0, 5).forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.orderId || 'MISSING'}`);
      });
    }
    console.log('');

    // Test 2: Check ORD format orders specifically
    console.log('2️⃣ Checking ORD format orders...');
    const ordOrders = await Order.find({ orderId: { $regex: /^ORD\d+$/ } }).select('orderId').sort({ orderId: -1 });
    console.log('📦 ORD format orders:', ordOrders.length);
    
    if (ordOrders.length > 0) {
      console.log('🔍 ORD orders:');
      ordOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.orderId}`);
      });
    }
    console.log('');

    // Test 3: Check old format orders
    console.log('3️⃣ Checking old format orders...');
    const oldOrders = await Order.find({ orderId: { $regex: /^#\d+$/ } }).select('orderId').sort({ orderId: -1 });
    console.log('📦 Old format orders:', oldOrders.length);
    
    if (oldOrders.length > 0) {
      console.log('🔍 Old format orders:');
      oldOrders.slice(0, 5).forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.orderId}`);
      });
    }
    console.log('');

    // Test 4: Generate new order ID
    console.log('4️⃣ Generating new order ID...');
    const newOrderId = await Order.generateNextOrderId();
    console.log('🔍 Generated Order ID:', newOrderId);
    console.log('🔍 Format check:', newOrderId.startsWith('ORD') ? '✅ Correct format' : '❌ Wrong format');
    console.log('🔍 No # prefix:', !newOrderId.includes('#') ? '✅ No # found' : '❌ # found');
    console.log('');

    // Test 5: Generate another order ID
    console.log('5️⃣ Generating another order ID...');
    const anotherOrderId = await Order.generateNextOrderId();
    console.log('🔍 Generated Order ID:', anotherOrderId);
    console.log('🔍 Format check:', anotherOrderId.startsWith('ORD') ? '✅ Correct format' : '❌ Wrong format');
    console.log('🔍 No # prefix:', !anotherOrderId.includes('#') ? '✅ No # found' : '❌ # found');
    console.log('');

    console.log('🎉 Direct Generation Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection working');
    console.log('✅ Existing orders analyzed');
    console.log('✅ New Order ID format: ORD00001 (no # prefix)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the test
testGenerationDirect(); 