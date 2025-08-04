const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = 'order', order = 'asc', active } = req.query;
    
    const query = {};
    
    // Filter by search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by active status
    if (active !== undefined) {
      query.isActive = active === 'true';
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
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCategories: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID
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

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug, isActive: true })
      .populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new category (Admin only)
const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      parentCategory,
      isActive = true,
      order = 0
    } = req.body;

    // Print received data to console
    console.log('🔍 Received category data:', {
      name,
      description,
      image,
      parentCategory,
      isActive,
      order
    });

    // Validation
    if (!name) {
      console.log('❌ Validation failed: Category name is required');
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    const categoryData = {
      name,
      description,
      image,
      parentCategory: parentCategory === '' ? null : (parentCategory || null),
      isActive,
      order,
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Print processed category data to console
    console.log('📦 Processed category data:', categoryData);

    console.log('💾 Attempting to save to MongoDB...');
    
    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      console.log('❌ Category with same name already exists:', existingCategory.name);
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category(categoryData);
    await category.save();
    
    console.log('✅ Category saved to MongoDB successfully:', category._id);
    
    // Populate parent category
    const populatedCategory = await Category.findById(category._id).populate('parentCategory', 'name');
    console.log('📋 Category with populated parent:', {
      _id: populatedCategory._id,
      name: populatedCategory.name,
      parentCategory: populatedCategory.parentCategory
    });

    console.log('🎉 Final category response:', {
      _id: populatedCategory._id,
      name: populatedCategory.name,
      slug: populatedCategory.slug,
      parentCategory: populatedCategory.parentCategory
    });

    res.status(201).json({
      message: 'Category created successfully',
      category: populatedCategory
    });
  } catch (error) {
    console.error('❌ Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update slug if name is being changed
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    // Handle empty string for parentCategory
    if (updateData.parentCategory === '') {
      updateData.parentCategory = null;
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: id });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${productsCount} products associated with it.` 
      });
    }

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parentCategory: id });
    
    if (subcategoriesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${subcategoriesCount} subcategories.` 
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active categories for frontend
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ order: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Get active categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category hierarchy (parent-child structure)
const getCategoryHierarchy = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ order: 1, name: 1 });

    // Build hierarchy
    const parentCategories = categories.filter(cat => !cat.parentCategory);
    const hierarchy = parentCategories.map(parent => ({
      ...parent.toObject(),
      subcategories: categories.filter(cat => 
        cat.parentCategory && cat.parentCategory._id.toString() === parent._id.toString()
      )
    }));

    res.json(hierarchy);
  } catch (error) {
    console.error('Get category hierarchy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get categories with product count
const getCategoriesWithProductCount = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    const result = await Promise.all(categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id, 
        isActive: true 
      });
      
      return {
        ...category.toObject(),
        productCount
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Get categories with product count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search categories
const searchCategories = async (req, res) => {
  try {
    const { q: searchQuery, limit = 10 } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const categories = await Category.find({
      isActive: true,
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .limit(parseInt(limit))
      .select('name description slug image')
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Search categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category order (Admin only)
const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body; // Array of {id, order}

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Categories must be an array' });
    }

    // Update each category's order
    const updatePromises = categories.map(({ id, order }) =>
      Category.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Category order updated successfully' });
  } catch (error) {
    console.error('Update category order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getActiveCategories,
  getCategoryHierarchy,
  getCategoriesWithProductCount,
  searchCategories,
  updateCategoryOrder
}; 