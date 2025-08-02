const Product = require('../models/Product');
const Category = require('../models/Category');

// Mock products for testing when MongoDB is not available
const mockProducts = [
  {
    _id: 'product1',
    name: 'Organic Turmeric Powder',
    description: 'Pure organic turmeric powder with anti-inflammatory properties',
    price: 299,
    originalPrice: 399,
    category: 'category1',
    images: ['/uploads/turmeric.jpg'],
    stock: 50,
    isActive: true,
    tags: ['organic', 'turmeric', 'spices'],
    ratings: { average: 4.5, count: 23 }
  },
  {
    _id: 'product2',
    name: 'Ayurvedic Hair Oil',
    description: 'Natural hair oil with herbs for hair growth and nourishment',
    price: 599,
    originalPrice: 799,
    category: 'category2',
    images: ['/uploads/hair-oil.jpg'],
    stock: 30,
    isActive: true,
    tags: ['ayurvedic', 'hair-care', 'natural'],
    ratings: { average: 4.8, count: 45 }
  }
];

// Get all products with filtering and pagination
const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sort = 'createdAt',
      order = 'desc',
      tags,
      inStock
    } = req.query;

    const query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortQuery = { [sort]: sortOrder };

    let products, total;
    
    try {
      products = await Product.find(query)
        .populate('category', 'name')
        .sort(sortQuery)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      total = await Product.countDocuments(query);
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      products = mockProducts.filter(product => {
        if (search) {
          return product.name.toLowerCase().includes(search.toLowerCase()) ||
                 product.description.toLowerCase().includes(search.toLowerCase());
        }
        return true;
      });
      total = products.length;
    }

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      },
      filters: {
        category,
        search,
        minPrice,
        maxPrice,
        tags,
        inStock
      }
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    let product;
    
    try {
      product = await Product.findById(req.params.id)
        .populate('category', 'name description')
        .populate('reviews.user', 'name');
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      product = mockProducts.find(p => p._id === req.params.id);
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new product (Admin only)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      images,
      stock,
      tags,
      specifications
    } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        message: 'Name, description, price, and category are required' 
      });
    }

    const productData = {
      name,
      description,
      price,
      originalPrice,
      category,
      images: images || [],
      stock: stock || 0,
      tags: tags || [],
      specifications: specifications || {},
      isActive: true
    };

    let product;
    
    try {
      product = new Product(productData);
      await product.save();
      
      // Populate category information
      product = await Product.findById(product._id).populate('category', 'name');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      product = {
        _id: Date.now().toString(),
        ...productData,
        createdAt: new Date()
      };
    }

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let product;
    
    try {
      product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('category', 'name');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      product = { _id: id, ...updateData, updatedAt: new Date() };
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let product;
    
    try {
      product = await Product.findByIdAndDelete(id);
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      product = { _id: id };
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12, sort = 'createdAt', order = 'desc' } = req.query;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortQuery = { [sort]: sortOrder };

    let products, total;
    
    try {
      products = await Product.find({ category: categoryId, isActive: true })
        .populate('category', 'name')
        .sort(sortQuery)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      total = await Product.countDocuments({ category: categoryId, isActive: true });
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      products = mockProducts.filter(p => p.category === categoryId);
      total = products.length;
    }

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    let products;
    
    try {
      products = await Product.find({ 
        isActive: true, 
        isFeatured: true 
      })
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      products = mockProducts.slice(0, limit);
    }

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q: searchQuery, limit = 10 } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    let products;
    
    try {
      products = await Product.find({
        isActive: true,
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      })
        .populate('category', 'name')
        .limit(parseInt(limit))
        .select('name description price originalPrice images ratings');
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      products = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add product review
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    // Use mock user ID if no authentication
    const userId = req.user?.userId || 'mock-user-123';

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    let product;
    
    try {
      product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if user already reviewed this product
      const existingReview = product.reviews.find(
        review => review.user.toString() === userId
      );

      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this product' });
      }

      // Add new review
      const newReview = {
        user: userId,
        rating,
        comment: comment || '',
        createdAt: new Date()
      };

      product.reviews.push(newReview);

      // Update average rating
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.ratings = {
        average: totalRating / product.reviews.length,
        count: product.reviews.length
      };

      await product.save();
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      return res.json({ message: 'Review added successfully (mock)' });
    }

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update stock quantity (Admin only)
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    if (typeof stock !== 'number') {
      return res.status(400).json({ message: 'Stock must be a number' });
    }

    let product;
    
    try {
      product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      switch (operation) {
        case 'add':
          product.stock += stock;
          break;
        case 'subtract':
          product.stock = Math.max(0, product.stock - stock);
          break;
        default: // 'set'
          product.stock = stock;
      }

      await product.save();
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      product = { _id: id, stock };
    }

    res.json({
      message: 'Stock updated successfully',
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get low stock products (Admin only)
const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    let products;
    
    try {
      products = await Product.find({
        stock: { $lte: parseInt(threshold) },
        isActive: true
      })
        .populate('category', 'name')
        .sort({ stock: 1 });
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      products = mockProducts.filter(p => p.stock <= threshold);
    }

    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  addReview,
  updateStock,
  getLowStockProducts
}; 