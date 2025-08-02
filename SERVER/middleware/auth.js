const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock admin users for fallback
const mockAdminUser = {
  _id: 'admin123',
  name: 'Admin User',
  email: 'admin@uthraa.com',
  role: 'admin',
  phone: '+91 98765 43210'
};

const testAdminUser = {
  _id: 'testadmin123',
  name: 'Test Admin',
  email: 'test@admin.com',
  role: 'admin',
  phone: '+1 555-123-4567'
};

// Protect routes - verify JWT token and attach user to request
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookies (fallback)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        error: 'TOKEN_MISSING'
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Check token issuer and audience for additional security
      if (decoded.iss !== 'uthraa-naturals' || decoded.aud !== 'uthraa-users') {
        return res.status(401).json({ 
          message: 'Invalid token issuer or audience.',
          error: 'TOKEN_INVALID'
        });
      }

      // Find user in database
      let user;
      try {
        user = await User.findById(decoded.userId);
      } catch (error) {
        console.log('MongoDB not available, checking mock users');
        // Fallback to mock users
        if (decoded.userId === mockAdminUser._id) {
          user = mockAdminUser;
        } else if (decoded.userId === testAdminUser._id) {
          user = testAdminUser;
        }
      }

      if (!user) {
        return res.status(401).json({ 
          message: 'User not found.',
          error: 'USER_NOT_FOUND'
        });
      }

      // Check if user is active
      if (user.isActive === false) {
        return res.status(401).json({ 
          message: 'User account is deactivated.',
          error: 'USER_INACTIVE'
        });
      }

      // Attach user to request object
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loginTime: decoded.loginTime
      };

      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired.',
          error: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token.',
          error: 'TOKEN_INVALID'
        });
      } else {
        return res.status(401).json({ 
          message: 'Token verification failed.',
          error: 'TOKEN_VERIFICATION_FAILED'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error.',
      error: 'AUTH_ERROR'
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not authenticated.',
        error: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this resource.`,
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookies (fallback)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        
        // Find user in database
        let user;
        try {
          user = await User.findById(decoded.userId);
        } catch (error) {
          console.log('MongoDB not available, checking mock users');
          // Fallback to mock users
          if (decoded.userId === mockAdminUser._id) {
            user = mockAdminUser;
          } else if (decoded.userId === testAdminUser._id) {
            user = testAdminUser;
          }
        }

        if (user && user.isActive !== false) {
          // Attach user to request object
          req.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            loginTime: decoded.loginTime
          };
        }
      } catch (jwtError) {
        // Token is invalid, but don't fail the request
        console.log('Optional auth: Invalid token provided');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue without authentication
  }
};

// Verify token without database lookup (for performance)
const verifyToken = (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Get token from cookies (fallback)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        error: 'TOKEN_MISSING'
      });
    }

    try {
      // Verify JWT token without database lookup
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Check token issuer and audience
      if (decoded.iss !== 'uthraa-naturals' || decoded.aud !== 'uthraa-users') {
        return res.status(401).json({ 
          message: 'Invalid token issuer or audience.',
          error: 'TOKEN_INVALID'
        });
      }

      // Attach decoded token to request
      req.token = decoded;
      next();
    } catch (jwtError) {
      console.error('Token verification error:', jwtError);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired.',
          error: 'TOKEN_EXPIRED'
        });
      } else {
        return res.status(401).json({ 
          message: 'Invalid token.',
          error: 'TOKEN_INVALID'
        });
      }
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      message: 'Token verification error.',
      error: 'TOKEN_VERIFICATION_ERROR'
    });
  }
};

// Admin middleware - ensure user has admin role
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Access denied. Please login first.',
      error: 'NO_USER'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      error: 'NOT_ADMIN'
    });
  }

  next();
};

module.exports = { 
  protect, 
  authorize, 
  optionalAuth, 
  verifyToken,
  admin
}; 