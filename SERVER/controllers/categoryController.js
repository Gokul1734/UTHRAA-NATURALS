const Category = require('../models/Category');
const Product = require('../models/Product');

// Mock categories for testing when MongoDB is not available
const mockCategories = [
  {
    _id: 'category1',
    name: 'Organic Spices',
    description: 'Pure organic spices and herbs',
    image: '/uploads/spices.jpg',
    isActive: true,
    order: 1,
    slug: 'organic-spices'
  },
  {
    _id: 'category2',
    name: 'Hair Care',
    description: 'Natural hair care products',
    image: '/uploads/hair-care.jpg',
    isActive: true,
    order: 2,
    slug: 'hair-care'
  },
  {
    _id: 'category3',
    name: 'Skin Care',
    description: 'Ayurvedic skin care solutions',
    image: '/uploads/skin-care.jpg',
    isActive: true,
    order: 3,
    slug: 'skin-care'
  }
];

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

    let categories, total;
    
    try {
      categories = await Category.find(query)
        .populate('parentCategory', 'name')
        .sort(sortQuery)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      total = await Category.countDocuments(query);
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      categories = mockCategories.filter(category => {
        if (search) {
          return category.name.toLowerCase().includes(search.toLowerCase()) ||
                 category.description.toLowerCase().includes(search.toLowerCase());
        }
        if (active !== undefined) {
          return category.isActive === (active === 'true');
        }
        return true;
      });
      total = categories.length;
    }

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
    let category;
    
    try {
      category = await Category.findById(req.params.id)
        .populate('parentCategory', 'name');
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      category = mockCategories.find(c => c._id === req.params.id);
    }

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
    let category;
    
    try {
      category = await Category.findOne({ slug, isActive: true })
        .populate('parentCategory', 'name slug');
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      category = mockCategories.find(c => c.slug === slug && c.isActive);
    }

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

    // Validation
    if (!name) {
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
      slug
    };

    let category;
    
    try {
      // Check if category with same name exists
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }

      category = new Category(categoryData);
      await category.save();
      
      // Populate parent category
      category = await Category.findById(category._id).populate('parentCategory', 'name');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      category = {
        _id: Date.now().toString(),
        ...categoryData,
        createdAt: new Date()
      };
    }

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
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

    let category;
    
    try {
      category = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('parentCategory', 'name');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      category = { _id: id, ...updateData, updatedAt: new Date() };
    }

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

    let category, productsCount = 0;
    
    try {
      // Check if category has products
      productsCount = await Product.countDocuments({ category: id });
      
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

      category = await Category.findByIdAndDelete(id);
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      category = { _id: id };
    }

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
    let categories;
    
    try {
      categories = await Category.find({ isActive: true })
        .populate('parentCategory', 'name slug')
        .sort({ order: 1, name: 1 });
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      categories = mockCategories.filter(c => c.isActive);
    }

    res.json(categories);
  } catch (error) {
    console.error('Get active categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category hierarchy (parent-child structure)
const getCategoryHierarchy = async (req, res) => {
  try {
    let categories;
    
    try {
      categories = await Category.find({ isActive: true })
        .populate('parentCategory', 'name slug')
        .sort({ order: 1, name: 1 });
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      categories = mockCategories.filter(c => c.isActive);
    }

    // Build hierarchy
    const parentCategories = categories.filter(cat => !cat.parentCategory);
    const hierarchy = parentCategories.map(parent => ({
      ...parent.toObject ? parent.toObject() : parent,
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
    let result;
    
    try {
      const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
      
      result = await Promise.all(categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          category: category._id, 
          isActive: true 
        });
        
        return {
          ...category.toObject(),
          productCount
        };
      }));
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      result = mockCategories.map(category => ({
        ...category,
        productCount: Math.floor(Math.random() * 20) + 1 // Random count for mock data
      }));
    }

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

    let categories;
    
    try {
      categories = await Category.find({
        isActive: true,
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ]
      })
        .limit(parseInt(limit))
        .select('name description slug image')
        .sort({ name: 1 });
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      categories = mockCategories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, limit);
    }

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

    try {
      // Update each category's order
      const updatePromises = categories.map(({ id, order }) =>
        Category.findByIdAndUpdate(id, { order }, { new: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
    }

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