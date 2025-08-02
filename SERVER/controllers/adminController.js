const Product = require('../models/Product');
const Category = require('../models/Category');

// ==================== CATEGORY CONTROLLERS ====================

// Get all categories (Admin)
const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort = 'order', order = 'asc' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortQuery = { [sort]: sortOrder };

    const categories = await Category.find(query)
      .populate('parentCategory', 'name')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Category.countDocuments(query);

    res.json({
      categories,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID (Admin)
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new category (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory, order, isActive } = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const categoryData = {
      name,
      description,
      image,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    };

    // Handle empty string by setting to null
    if (parentCategory !== undefined) {
      categoryData.parentCategory = parentCategory === '' ? null : parentCategory;
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory, order, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name conflicts with existing category (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (parentCategory !== undefined) {
      // Handle empty string by setting to null
      updateData.parentCategory = parentCategory === '' ? null : parentCategory;
    }
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${productsCount} product(s) associated with it.` 
      });
    }

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parentCategory: req.params.id });
    if (subcategoriesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${subcategoriesCount} subcategory(ies) associated with it.` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== PRODUCT CONTROLLERS ====================

// Get all products (Admin)
const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sort = 'createdAt',
      order = 'desc',
      stockStatus
    } = req.query;

    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by stock status
    if (stockStatus) {
      switch (stockStatus) {
        case 'in_stock':
          query.stock = { $gt: 0 };
          break;
        case 'out_of_stock':
          query.stock = 0;
          break;
        case 'low_stock':
          query.stock = { $lt: 10, $gt: 0 };
          break;
      }
    }

    const sortOrder = order === 'asc' ? 1 : -1;
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
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID (Admin)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new product (Admin)
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
      weight,
      unit,
      ingredients,
      benefits,
      usage,
      isOrganic,
      isVegan,
      isGlutenFree,
      isFeatured,
      isActive,
      tags,
      seoTitle,
      seoDescription
    } = req.body;

    // Check if product name already exists
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const productData = {
      name,
      description,
      price,
      category,
      images,
      stock: stock || 0,
      weight,
      unit,
      ingredients: ingredients || [],
      benefits: benefits || [],
      usage,
      isOrganic: isOrganic || false,
      isVegan: isVegan || false,
      isGlutenFree: isGlutenFree || false,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true,
      tags: tags || [],
      seoTitle,
      seoDescription
    };

    if (originalPrice) {
      productData.originalPrice = originalPrice;
    }

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name');

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (Admin)
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      images,
      stock,
      weight,
      unit,
      ingredients,
      benefits,
      usage,
      isOrganic,
      isVegan,
      isGlutenFree,
      isFeatured,
      isActive,
      tags,
      seoTitle,
      seoDescription
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if new name conflicts with existing product (excluding current product)
    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this name already exists' });
      }
    }

    // Validate category exists if being updated
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (category !== undefined) updateData.category = category;
    if (images !== undefined) updateData.images = images;
    if (stock !== undefined) updateData.stock = stock;
    if (weight !== undefined) updateData.weight = weight;
    if (unit !== undefined) updateData.unit = unit;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (usage !== undefined) updateData.usage = usage;
    if (isOrganic !== undefined) updateData.isOrganic = isOrganic;
    if (isVegan !== undefined) updateData.isVegan = isVegan;
    if (isGlutenFree !== undefined) updateData.isGlutenFree = isGlutenFree;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (tags !== undefined) updateData.tags = tags;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get products by category (Admin)
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortQuery = { [sort]: sortOrder };

    const products = await Product.find({ category: categoryId })
      .populate('category', 'name')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments({ category: categoryId });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  // Category controllers
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Product controllers
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
}; 