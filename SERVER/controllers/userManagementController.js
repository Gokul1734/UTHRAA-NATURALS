const User = require('../models/User');
const Order = require('../models/Order');
// const emailService = require('../services/emailService'); // Commented out for temporary deployment
const catchAsync = require('../utils/catchAsync');

// Get all users with order statistics and categorization
const getAllUsersWithStats = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';

  // Build search query
  let searchQuery = {};
  if (search) {
    searchQuery = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    };
  }

  // Get users with pagination
  const users = await User.find(searchQuery)
    .select('-password -phoneVerificationOTP -phoneVerificationExpires')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Get order statistics for each user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const orders = await Order.find({ userId: user._id });
      
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      
      // Categorize user based on spending and order count
      let category = 'Bronze';
      if (totalSpent >= 10000 && totalOrders >= 10) {
        category = 'Diamond';
      } else if (totalSpent >= 5000 && totalOrders >= 5) {
        category = 'Gold';
      } else if (totalSpent >= 2000 && totalOrders >= 3) {
        category = 'Silver';
      }

      return {
        ...user.toObject(),
        stats: {
          totalOrders,
          totalSpent,
          averageOrderValue,
          category
        }
      };
    })
  );

  // Filter by category if specified
  let filteredUsers = usersWithStats;
  if (category) {
    filteredUsers = usersWithStats.filter(user => user.stats.category === category);
  }

  // Get total count for pagination
  const totalUsers = await User.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalUsers / limit);

  // Get category distribution
  const categoryStats = await getCategoryDistribution();

  res.status(200).json({
    success: true,
    data: {
      users: filteredUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      categoryStats
    }
  });
});

// Get user category distribution
const getCategoryDistribution = async () => {
  const users = await User.find();
  
  const categoryStats = {
    Bronze: 0,
    Silver: 0,
    Gold: 0,
    Diamond: 0
  };

  for (const user of users) {
    const orders = await Order.find({ userId: user._id });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    let category = 'Bronze';
    if (totalSpent >= 10000 && totalOrders >= 10) {
      category = 'Diamond';
    } else if (totalSpent >= 5000 && totalOrders >= 5) {
      category = 'Gold';
    } else if (totalSpent >= 2000 && totalOrders >= 3) {
      category = 'Silver';
    }

    categoryStats[category]++;
  }

  return categoryStats;
};

// Get user details with complete order history
const getUserDetails = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-password -phoneVerificationOTP -phoneVerificationExpires');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .populate('items.productId', 'name image');

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Categorize user
  let category = 'Bronze';
  if (totalSpent >= 10000 && totalOrders >= 10) {
    category = 'Diamond';
  } else if (totalSpent >= 5000 && totalOrders >= 5) {
    category = 'Gold';
  } else if (totalSpent >= 2000 && totalOrders >= 3) {
    category = 'Silver';
  }

  // Get recent activity
  const recentOrders = orders.slice(0, 5);
  const orderStatusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      user,
      stats: {
        totalOrders,
        totalSpent,
        averageOrderValue,
        category,
        orderStatusCounts
      },
      recentOrders,
      allOrders: orders
    }
  });
});

// Send bulk email to users
const sendBulkEmail = catchAsync(async (req, res) => {
  // Email service temporarily disabled for deployment
  return res.status(503).json({
    success: false,
    message: 'Email service temporarily unavailable for deployment'
  });

  /*
  const { 
    subject, 
    content, 
    emailType, 
    recipients, 
    category,
    minOrders,
    minSpent 
  } = req.body;

  if (!subject || !content) {
    return res.status(400).json({
      success: false,
      message: 'Subject and content are required'
    });
  }

  // Build recipient query
  let recipientQuery = { isActive: true };
  
  if (recipients === 'all') {
    // Send to all active users
  } else if (recipients === 'category' && category) {
    // Send to users in specific category
    const users = await User.find({ isActive: true });
    const categoryUsers = [];
    
    for (const user of users) {
      const orders = await Order.find({ userId: user._id });
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = orders.length;

      let userCategory = 'Bronze';
      if (totalSpent >= 10000 && totalOrders >= 10) {
        userCategory = 'Diamond';
      } else if (totalSpent >= 5000 && totalOrders >= 5) {
        userCategory = 'Gold';
      } else if (totalSpent >= 2000 && totalOrders >= 3) {
        userCategory = 'Silver';
      }

      if (userCategory === category) {
        categoryUsers.push(user);
      }
    }
    
    recipientQuery = { _id: { $in: categoryUsers.map(u => u._id) } };
  } else if (recipients === 'custom') {
    // Send to users meeting specific criteria
    const users = await User.find({ isActive: true });
    const customUsers = [];
    
    for (const user of users) {
      const orders = await Order.find({ userId: user._id });
      const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const totalOrders = orders.length;

      if (totalOrders >= (minOrders || 0) && totalSpent >= (minSpent || 0)) {
        customUsers.push(user);
      }
    }
    
    recipientQuery = { _id: { $in: customUsers.map(u => u._id) } };
  }

  // Get recipients
  const recipientUsers = await User.find(recipientQuery)
    .select('name email');

  if (recipientUsers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No recipients found matching the criteria'
    });
  }

  // Prepare email content based on type
  let emailContent = content;
  if (emailType === 'newsletter') {
    emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">${subject}</h2>
        <div>${content}</div>
        <p>Best regards,<br>The Uthraa Naturals Team</p>
      </div>
    `;
  } else if (emailType === 'promotional') {
    emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">${subject}</h2>
        <div>${content}</div>
        <p>Best regards,<br>The Uthraa Naturals Team</p>
      </div>
    `;
  }

  // Send bulk email
  const results = await emailService.sendBulkEmail(
    recipientUsers,
    subject,
    emailContent
  );

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  res.status(200).json({
    success: true,
    message: `Bulk email sent successfully`,
    data: {
      totalRecipients: recipientUsers.length,
      successCount,
      failureCount,
      results
    }
  });
  */
});

// Get email templates
const getEmailTemplates = catchAsync(async (req, res) => {
  const templates = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to Uthraa Naturals!',
      content: `
        <p>Dear {{name}},</p>
        <p>Thank you for joining Uthraa Naturals! We're excited to have you as part of our community.</p>
        <p>Discover our range of natural and organic products:</p>
        <ul>
          <li>🌿 Organic skincare products</li>
          <li>🌱 Natural supplements</li>
          <li>🍃 Herbal remedies</li>
          <li>🌺 Aromatherapy essentials</li>
        </ul>
        <p>Start your wellness journey with us today!</p>
      `
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      subject: 'Uthraa Naturals Newsletter',
      content: `
        <p>Dear {{name}},</p>
        <p>Here's what's new at Uthraa Naturals:</p>
        <ul>
          <li>New product launches</li>
          <li>Health tips and wellness advice</li>
          <li>Special offers and discounts</li>
          <li>Customer success stories</li>
        </ul>
        <p>Stay tuned for more updates!</p>
      `
    },
    {
      id: 'promotional',
      name: 'Promotional Offer',
      subject: 'Special Offer Just for You!',
      content: `
        <p>Dear {{name}},</p>
        <p>We have a special offer just for you!</p>
        <p>Get <strong>20% off</strong> on your next purchase.</p>
        <p>Use code: <strong>SPECIAL20</strong></p>
        <p>Offer valid until the end of this month.</p>
        <p>Don't miss out on this amazing deal!</p>
      `
    },
    {
      id: 'custom',
      name: 'Custom Email',
      subject: '',
      content: ''
    }
  ];

  res.status(200).json({
    success: true,
    data: templates
  });
});

// Update user status (activate/deactivate)
const updateUserStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password -phoneVerificationOTP -phoneVerificationExpires');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

// Get user analytics
const getUserAnalytics = catchAsync(async (req, res) => {
  const users = await User.find();
  
  // Basic user stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const verifiedUsers = users.filter(u => u.isPhoneVerified).length;

  // Registration trends (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const registrationTrends = [];
  for (let i = 0; i < 6; i++) {
    const startDate = new Date(sixMonthsAgo);
    startDate.setMonth(startDate.getMonth() + i);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    const count = await User.countDocuments({
      createdAt: { $gte: startDate, $lt: endDate }
    });
    
    registrationTrends.push({
      month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count
    });
  }

  // Category distribution
  const categoryStats = await getCategoryDistribution();

  // Top customers
  const topCustomers = [];
  for (const user of users) {
    const orders = await Order.find({ userId: user._id });
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    if (totalSpent > 0) {
      topCustomers.push({
        userId: user._id,
        name: user.name,
        email: user.email,
        totalSpent,
        orderCount: orders.length
      });
    }
  }

  topCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
  const top10Customers = topCustomers.slice(0, 10);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        inactiveUsers: totalUsers - activeUsers
      },
      registrationTrends,
      categoryStats,
      topCustomers: top10Customers
    }
  });
});

module.exports = {
  getAllUsersWithStats,
  getUserDetails,
  sendBulkEmail,
  getEmailTemplates,
  updateUserStatus,
  getUserAnalytics
}; 