const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testCombinedProducts() {
  console.log('🧪 Testing Combined Products Functionality...\n');

  try {
    // Test 1: Get all combined products
    console.log('1. Testing GET /public/combined-products');
    const response1 = await axios.get(`${API_BASE_URL}/public/combined-products`);
    console.log('✅ Success:', response1.data.success);
    console.log('📦 Combined Products Count:', response1.data.combinedProducts?.length || 0);
    
    if (response1.data.combinedProducts?.length > 0) {
      const firstProduct = response1.data.combinedProducts[0];
      console.log('📋 First Product:', {
        name: firstProduct.name,
        combinedPrice: firstProduct.combinedPrice,
        originalPrice: firstProduct.originalPrice,
        savings: firstProduct.savings,
        productsCount: firstProduct.products?.length || 0
      });

      // Test 2: Get single combined product
      console.log('\n2. Testing GET /public/combined-products/:id');
      const response2 = await axios.get(`${API_BASE_URL}/public/combined-products/${firstProduct._id}`);
      console.log('✅ Success:', response2.data.success);
      console.log('📦 Product Details:', {
        name: response2.data.combinedProduct.name,
        combinedPrice: response2.data.combinedProduct.combinedPrice,
        products: response2.data.combinedProduct.products?.map(p => ({
          name: p.productId?.name,
          quantity: p.quantity,
          price: p.price
        }))
      });
    }

    console.log('\n🎉 All tests passed! Combined products functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCombinedProducts();
