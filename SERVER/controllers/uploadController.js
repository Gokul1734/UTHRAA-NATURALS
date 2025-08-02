const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    
    // Determine upload path based on route
    if (req.route && req.route.path.includes('category')) {
      uploadPath = path.join(__dirname, '../uploads/categories');
    } else if (req.route && req.route.path.includes('product')) {
      uploadPath = path.join(__dirname, '../uploads/products');
    } else {
      uploadPath = path.join(__dirname, '../uploads');
    }
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  },
  fileFilter: fileFilter
});

// Upload single image
const uploadSingleImage = async (req, res) => {
  try {
    upload.single('image')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: 'Upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          url: fileUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    });
  } catch (error) {
    console.error('Upload single image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    upload.array('images', 10)(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'One or more files are too large. Maximum size is 5MB per file.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Too many files. Maximum is 10 files at once.' });
        }
        return res.status(400).json({ message: 'Upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({
        message: `${req.files.length} files uploaded successfully`,
        files: uploadedFiles
      });
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload product images
const uploadProductImages = async (req, res) => {
  try {
    upload.array('productImages', 5)(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'One or more files are too large. Maximum size is 5MB per file.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: 'Too many files. Maximum is 5 images per product.' });
        }
        return res.status(400).json({ message: 'Upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Validate that all files are images
      const nonImageFiles = req.files.filter(file => !file.mimetype.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        // Delete uploaded files if validation fails
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
        return res.status(400).json({ message: 'Only image files are allowed for product images' });
      }

      const uploadedImages = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/products/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({
        message: `${req.files.length} product images uploaded successfully`,
        images: uploadedImages
      });
    });
  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload category image
const uploadCategoryImage = async (req, res) => {
  try {
    upload.single('categoryImage')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: 'Upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Validate that file is an image
      if (!req.file.mimetype.startsWith('image/')) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Only image files are allowed for category images' });
      }

      const fileUrl = `/uploads/categories/${req.file.filename}`;
      
      res.json({
        message: 'Category image uploaded successfully',
        image: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          url: fileUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    });
  } catch (error) {
    console.error('Upload category image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload user avatar
const uploadUserAvatar = async (req, res) => {
  try {
    upload.single('avatar')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: 'Upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Validate that file is an image
      if (!req.file.mimetype.startsWith('image/')) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Only image files are allowed for avatars' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        message: 'Avatar uploaded successfully',
        avatar: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          url: fileUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    });
  } catch (error) {
    console.error('Upload user avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get file info
const getFileInfo = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required' });
    }

    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const extension = path.extname(filename);
    
    res.json({
      filename,
      url: `/uploads/${filename}`,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension,
      isImage: ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension.toLowerCase())
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// List uploaded files
const listFiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Read directory
    const files = fs.readdirSync(uploadsDir);
    
    // Filter files by type if specified
    let filteredFiles = files;
    if (type) {
      if (type === 'images') {
        filteredFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });
      } else if (type === 'documents') {
        filteredFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.pdf', '.doc', '.docx'].includes(ext);
        });
      }
    }

    // Get file information
    const fileInfos = filteredFiles.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      const extension = path.extname(filename);
      
      return {
        filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension,
        isImage: ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension.toLowerCase())
      };
    });

    // Sort by creation date (newest first)
    fileInfos.sort((a, b) => new Date(b.created) - new Date(a.created));

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFiles = fileInfos.slice(startIndex, endIndex);

    res.json({
      files: paginatedFiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(fileInfos.length / limit),
        totalFiles: fileInfos.length,
        hasNextPage: endIndex < fileInfos.length,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get upload statistics
const getUploadStats = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        totalFiles: 0,
        totalSize: 0,
        imageCount: 0,
        documentCount: 0,
        otherCount: 0
      });
    }

    const files = fs.readdirSync(uploadsDir);
    let totalSize = 0;
    let imageCount = 0;
    let documentCount = 0;
    let otherCount = 0;

    files.forEach(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      const extension = path.extname(filename).toLowerCase();
      
      totalSize += stats.size;
      
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
        imageCount++;
      } else if (['.pdf', '.doc', '.docx'].includes(extension)) {
        documentCount++;
      } else {
        otherCount++;
      }
    });

    res.json({
      totalFiles: files.length,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      imageCount,
      documentCount,
      otherCount
    });
  } catch (error) {
    console.error('Get upload stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadProductImages,
  uploadCategoryImage,
  uploadUserAvatar,
  deleteFile,
  getFileInfo,
  listFiles,
  getUploadStats
}; 