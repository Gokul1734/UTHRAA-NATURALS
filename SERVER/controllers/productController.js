const Product = require('../models/Product');
const Category = require('../models/Category');

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

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);

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
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description')
      .populate('reviews.user', 'name');

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
      specifications,
      weight,
      unit,
      ingredients,
      benefits,
      usage,
      isOrganic,
      isVegan,
      isGlutenFree,
      isFeatured
    } = req.body;

    // Print received data to console
    console.log('🔍 Received product data:', {
      name,
      description,
      price,
      originalPrice,
      category,
      images,
      stock,
      tags,
      specifications,
      weight,
      unit,
      ingredients,
      benefits,
      usage,
      isOrganic,
      isVegan,
      isGlutenFree,
      isFeatured
    });

    // Validation
    if (!name || !description || !price || !category || !weight || !unit) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        message: 'Name, description, price, category, weight, and unit are required' 
      });
    }

    // Validate unit enum values
    const validUnits = ['g', 'kg', 'ml', 'l', 'pieces', 'packets'];
    if (!validUnits.includes(unit)) {
      console.log('❌ Validation failed: Invalid unit value');
      return res.status(400).json({ 
        message: `Unit must be one of: ${validUnits.join(', ')}` 
      });
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      images: images || [],
      stock: parseInt(stock) || 0,
      weight: parseFloat(weight),
      unit,
      tags: tags || [],
      specifications: specifications || {},
      ingredients: ingredients || [],
      benefits: benefits || [],
      usage: usage || '',
      isOrganic: isOrganic || false,
      isVegan: isVegan || false,
      isGlutenFree: isGlutenFree || false,
      isFeatured: isFeatured || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Print processed product data to console
    console.log('📦 Processed product data:', productData);

    console.log('💾 Attempting to save to MongoDB...');
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Product saved to MongoDB successfully:', product._id);
    
    // Populate category information
    const populatedProduct = await Product.findById(product._id).populate('category', 'name');
    console.log('📋 Product with populated category:', {
      _id: populatedProduct._id,
      name: populatedProduct.name,
      category: populatedProduct.category,
      weight: populatedProduct.weight,
      unit: populatedProduct.unit
    });

    console.log('🎉 Final product response:', {
      _id: populatedProduct._id,
      name: populatedProduct.name,
      price: populatedProduct.price,
      category: populatedProduct.category,
      weight: populatedProduct.weight,
      unit: populatedProduct.unit
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

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

    const product = await Product.findByIdAndDelete(id);

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

    const products = await Product.find({ category: categoryId, isActive: true })
      .populate('category', 'name')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments({ category: categoryId, isActive: true });

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

    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

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

    const products = await Product.find({
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

    const product = await Product.findById(id);
    
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

    const product = await Product.findById(id);
    
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

    const products = await Product.find({
      stock: { $lte: parseInt(threshold) },
      isActive: true
    })
      .populate('category', 'name')
      .sort({ stock: 1 });

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