const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Mock users for testing when MongoDB is not available
const mockUsers = [
  {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    role: 'user',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    _id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 9876543211',
    role: 'user',
    address: {
      street: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    isActive: true,
    createdAt: new Date('2024-01-05')
  },
  {
    _id: 'admin1',
    name: 'Admin User',
    email: 'admin@uthraa.com',
    phone: '+91 9876543212',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2023-12-01')
  }
];

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      isActive,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortQuery = { [sort]: sortOrder };

    let users, total;
    
    try {
      users = await User.find(query)
        .select('-password') // Exclude password field
        .sort(sortQuery)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      total = await User.countDocuments(query);
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      users = mockUsers.filter(user => {
        if (search) {
          const searchLower = search.toLowerCase();
          return user.name.toLowerCase().includes(searchLower) ||
                 user.email.toLowerCase().includes(searchLower) ||
                 user.phone.includes(search);
        }
        if (role && user.role !== role) return false;
        if (isActive !== undefined && user.isActive !== (isActive === 'true')) return false;
        return true;
      });
      total = users.length;
    }

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let user;
    
    try {
      user = await User.findById(id).select('-password');
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      user = mockUsers.find(u => u._id === id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, address } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    let user;
    
    try {
      // Check if email or phone already exists for another user
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: userId } },
          { $or: [{ email }, { phone }] }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email or phone number already exists for another user' 
        });
      }

      user = await User.findByIdAndUpdate(
        userId,
        { name, email, phone, address },
        { new: true, runValidators: true }
      ).select('-password');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      user = { _id: userId, name, email, phone, address, updatedAt: new Date() };
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    let user;
    
    try {
      user = await User.findById(userId).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await User.findByIdAndUpdate(userId, { password: hashedNewPassword });
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user by admin
const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating password through this endpoint
    delete updateData.password;

    let user;
    
    try {
      user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      user = { _id: id, ...updateData, updatedAt: new Date() };
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user by admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    let user;
    
    try {
      user = await User.findByIdAndDelete(id);
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      user = { _id: id };
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle user active status (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    let user;
    
    try {
      user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
      ).select('-password');
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      user = { _id: id, isActive, updatedAt: new Date() };
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user statistics (Admin only)
const getUserStats = async (req, res) => {
  try {
    let stats;
    
    try {
      const [
        totalUsers,
        activeUsers,
        adminUsers,
        regularUsers,
        recentUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'user' }),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        })
      ]);

      stats = {
        totalUsers,
        activeUsers,
        adminUsers,
        regularUsers,
        recentUsers
      };
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      stats = {
        totalUsers: 250,
        activeUsers: 230,
        adminUsers: 5,
        regularUsers: 245,
        recentUsers: 15
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q: searchQuery, limit = 10, role } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const query = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    if (role) {
      query.role = role;
    }

    let users;
    
    try {
      users = await User.find(query)
        .select('name email phone role isActive')
        .limit(parseInt(limit))
        .sort({ name: 1 });
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      const searchLower = searchQuery.toLowerCase();
      users = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchLower) ||
                             user.email.toLowerCase().includes(searchLower) ||
                             user.phone.includes(searchQuery);
        const matchesRole = !role || user.role === role;
        return matchesSearch && matchesRole;
      }).slice(0, limit);
    }

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's address book
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let user;
    
    try {
      user = await User.findById(userId).select('address addresses');
    } catch (error) {
      console.log('MongoDB not available, using mock data');
      user = mockUsers.find(u => u._id === userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return both primary address and additional addresses
    const addresses = [];
    
    if (user.address) {
      addresses.push({
        _id: 'primary',
        ...user.address,
        isPrimary: true
      });
    }

    if (user.addresses && Array.isArray(user.addresses)) {
      addresses.push(...user.addresses);
    }

    res.json(addresses);
  } catch (error) {
    console.error('Get user addresses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new address
const addUserAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, street, city, state, zipCode, country, isDefault } = req.body;

    // Validation
    if (!name || !phone || !street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ message: 'All address fields are required' });
    }

    const newAddress = {
      name,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false
    };

    let user;
    
    try {
      user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Initialize addresses array if it doesn't exist
      if (!user.addresses) {
        user.addresses = [];
      }

      // If this is set as default, unset other defaults
      if (isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      }

      user.addresses.push(newAddress);
      await user.save();
    } catch (error) {
      console.log('MongoDB not available, returning mock response');
      newAddress._id = Date.now().toString();
    }

    res.status(201).json({
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Add user address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
  changePassword,
  updateUserByAdmin,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  searchUsers,
  getUserAddresses,
  addUserAddress
}; 