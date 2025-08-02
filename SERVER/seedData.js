const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

// Load environment variables
dotenv.config();

// Sample categories
const sampleCategories = [
  {
    name: 'Organic Oils',
    description: 'Pure and natural organic oils for cooking and health',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    order: 1
  },
  {
    name: 'Herbal Supplements',
    description: 'Natural herbal supplements for wellness',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    order: 2
  },
  {
    name: 'Natural Skincare',
    description: 'Organic skincare products for healthy skin',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    order: 3
  },
  {
    name: 'Ayurvedic Products',
    description: 'Traditional Ayurvedic remedies and products',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
    order: 4
  },
  {
    name: 'Organic Spices',
    description: 'Pure organic spices for authentic taste',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    order: 5
  }
];

// Sample products
const sampleProducts = [
  {
    name: 'Organic Coconut Oil',
    description: 'Pure cold-pressed organic coconut oil for cooking and skincare',
    price: 299,
    originalPrice: 399,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
    stock: 50,
    weight: 500,
    unit: 'ml',
    ingredients: ['Organic Coconut Oil'],
    benefits: ['Natural moisturizer', 'Healthy cooking oil', 'Hair care'],
    usage: 'Use for cooking, skincare, or hair care',
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    isFeatured: true,
    tags: ['organic', 'coconut', 'oil', 'natural']
  },
  {
    name: 'Turmeric Powder',
    description: 'Pure organic turmeric powder with high curcumin content',
    price: 199,
    originalPrice: 249,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
    stock: 75,
    weight: 200,
    unit: 'g',
    ingredients: ['Organic Turmeric'],
    benefits: ['Anti-inflammatory', 'Antioxidant', 'Immune support'],
    usage: 'Add to food or make turmeric milk',
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    isFeatured: true,
    tags: ['turmeric', 'organic', 'spice', 'anti-inflammatory']
  },
  {
    name: 'Aloe Vera Gel',
    description: 'Pure aloe vera gel for skin and hair care',
    price: 399,
    originalPrice: 499,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
    stock: 30,
    weight: 250,
    unit: 'ml',
    ingredients: ['Aloe Vera Extract'],
    benefits: ['Skin hydration', 'Hair care', 'Sunburn relief'],
    usage: 'Apply directly to skin or hair',
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    tags: ['aloe', 'vera', 'skincare', 'natural']
  },
  {
    name: 'Ashwagandha Powder',
    description: 'Traditional Ayurvedic herb for stress relief and energy',
    price: 349,
    originalPrice: 449,
    images: ['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400'],
    stock: 25,
    weight: 100,
    unit: 'g',
    ingredients: ['Ashwagandha Root Powder'],
    benefits: ['Stress relief', 'Energy boost', 'Sleep support'],
    usage: 'Mix with warm milk or water',
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    tags: ['ashwagandha', 'ayurvedic', 'stress', 'energy']
  },
  {
    name: 'Organic Honey',
    description: 'Pure organic honey from wildflowers',
    price: 249,
    originalPrice: 299,
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400'],
    stock: 40,
    weight: 500,
    unit: 'g',
    ingredients: ['Organic Honey'],
    benefits: ['Natural sweetener', 'Antioxidant', 'Immune support'],
    usage: 'Use as natural sweetener or in tea',
    isOrganic: true,
    isVegan: false,
    isGlutenFree: true,
    tags: ['honey', 'organic', 'sweetener', 'natural']
  },
  {
    name: 'Neem Face Wash',
    description: 'Natural neem face wash for clear skin',
    price: 199,
    originalPrice: 249,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
    stock: 8, // Low stock item
    weight: 100,
    unit: 'ml',
    ingredients: ['Neem Extract', 'Aloe Vera', 'Natural Surfactants'],
    benefits: ['Acne control', 'Skin cleansing', 'Antibacterial'],
    usage: 'Use twice daily for clean skin',
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    tags: ['neem', 'facewash', 'skincare', 'acne']
  }
];

// Sample users
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+919876543210',
    role: 'user',
    address: {
      street: '123 Main St',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '+919876543211',
    role: 'user',
    address: {
      street: '456 Oak Ave',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    }
  },
  {
    name: 'Admin User',
    email: 'admin@uthraa.com',
    password: 'admin123',
    phone: '+919876543212',
    role: 'admin',
    address: {
      street: '789 Admin Rd',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    }
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uthraa-naturals';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for seeding data');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Seed data function
const seedData = async () => {
  try {
    console.log('Starting to seed data...');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    console.log('Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create products with category references
    const productsWithCategories = sampleProducts.map((product, index) => ({
      ...product,
      category: createdCategories[index % createdCategories.length]._id
    }));

    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`Created ${createdProducts.length} products`);

    // Create users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create sample orders
    const sampleOrders = [
      {
        user: createdUsers[0]._id,
        orderItems: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            quantity: 2,
            price: createdProducts[0].price,
            image: createdProducts[0].images[0]
          },
          {
            product: createdProducts[1]._id,
            name: createdProducts[1].name,
            quantity: 1,
            price: createdProducts[1].price,
            image: createdProducts[1].images[0]
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          phone: '+919876543210',
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        paymentMethod: 'cod',
        itemsPrice: createdProducts[0].price * 2 + createdProducts[1].price,
        taxPrice: 50,
        shippingPrice: 100,
        totalPrice: createdProducts[0].price * 2 + createdProducts[1].price + 150,
        isPaid: true,
        paidAt: new Date(),
        status: 'delivered',
        isDelivered: true,
        deliveredAt: new Date()
      },
      {
        user: createdUsers[1]._id,
        orderItems: [
          {
            product: createdProducts[2]._id,
            name: createdProducts[2].name,
            quantity: 1,
            price: createdProducts[2].price,
            image: createdProducts[2].images[0]
          }
        ],
        shippingAddress: {
          name: 'Jane Smith',
          phone: '+919876543211',
          street: '456 Oak Ave',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        paymentMethod: 'online',
        itemsPrice: createdProducts[2].price,
        taxPrice: 25,
        shippingPrice: 100,
        totalPrice: createdProducts[2].price + 125,
        isPaid: true,
        paidAt: new Date(),
        status: 'pending'
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`Created ${createdOrders.length} orders`);

    console.log('Data seeding completed successfully!');
    console.log('\nSample data created:');
    console.log(`- ${createdCategories.length} categories`);
    console.log(`- ${createdProducts.length} products`);
    console.log(`- ${createdUsers.length} users`);
    console.log(`- ${createdOrders.length} orders`);
    console.log('\nAdmin credentials:');
    console.log('Email: admin@uthraa.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding
if (require.main === module) {
  connectDB().then(() => {
    seedData();
  });
}

module.exports = { seedData }; 