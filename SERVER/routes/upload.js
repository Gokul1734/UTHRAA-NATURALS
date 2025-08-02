const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Image upload routes - no authentication required
router.post('/image', uploadController.uploadSingleImage);
router.post('/images', uploadController.uploadMultipleImages);
router.post('/product-images', uploadController.uploadProductImages);
router.post('/category-image', uploadController.uploadCategoryImage);
router.post('/avatar', uploadController.uploadUserAvatar);

// File management routes - no authentication required
router.get('/files', uploadController.listFiles);
router.get('/files/:filename', uploadController.getFileInfo);
router.delete('/files/:filename', uploadController.deleteFile);
router.get('/stats', uploadController.getUploadStats);

module.exports = router; 