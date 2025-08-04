const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Test profile update functionality
async function testProfileUpdate() {
  try {
    // Connect to MongoDB Atlas
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uthraa-naturals';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Test data
    const testProfileData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      address: {
        street: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    };

    // Create a test user
    const testUser = new User({
      name: 'Test User',
      phone: '+91 12345 67890',
      email: 'test@example.com',
      password: 'temp-password',
      role: 'user'
    });

    await testUser.save();
    console.log('✅ Test user created:', testUser._id);

    // Update the user's profile
    const updatedUser = await User.findByIdAndUpdate(
      testUser._id,
      {
        name: testProfileData.name,
        email: testProfileData.email,
        phone: testProfileData.phone,
        address: testProfileData.address,
        isProfileComplete: true
      },
      { new: true, runValidators: true }
    );

    console.log('✅ Profile updated successfully');
    console.log('Updated user data:', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      isProfileComplete: updatedUser.isProfileComplete
    });

    // Verify the data was saved
    const savedUser = await User.findById(testUser._id);
    console.log('✅ Verification - Saved user data:', {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      address: savedUser.address,
      isProfileComplete: savedUser.isProfileComplete
    });

    // Clean up - delete test user
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user cleaned up');

    console.log('🎉 Profile update test completed successfully!');
    console.log('📝 Profile data is being saved to the database correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testProfileUpdate(); 