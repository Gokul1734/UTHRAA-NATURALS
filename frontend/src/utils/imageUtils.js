import { UPLOAD_URL } from '../config/environment';

/**
 * Get the proper image URL for a product
 * @param {string} imagePath - The image path from the database
 * @param {string} fallback - Fallback image URL (optional)
 * @returns {string} The complete image URL
 */
export const getImageUrl = (imagePath, fallback = null) => {
  if (!imagePath) {
    return fallback || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCAxMDAgMTUwIDEwMCAxNTAgMTAwWiIgZmlsbD0iI0QxRDU5QSIvPgo8L3N2Zz4K';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the upload URL
  if (imagePath.startsWith('/')) {
    return `${UPLOAD_URL}${imagePath}`;
  }
  
  // If it's just a filename, prepend the upload URL with uploads path
  return `${UPLOAD_URL}/uploads/products/${imagePath}`;
};

/**
 * Get the first image from an array of images
 * @param {Array} images - Array of image paths
 * @param {string} fallback - Fallback image URL (optional)
 * @returns {string} The complete image URL
 */
export const getFirstImageUrl = (images, fallback = null) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return fallback || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCAxMDAgMTUwIDEwMCAxNTAgMTAwWiIgZmlsbD0iI0QxRDU5QSIvPgo8L3N2Zz4K';
  }
  
  return getImageUrl(images[0], fallback);
};

/**
 * Get image URL with error handling
 * @param {string} imagePath - The image path
 * @param {string} fallback - Fallback image URL (optional)
 * @returns {string} The complete image URL
 */
export const getImageUrlWithFallback = (imagePath, fallback = null) => {
  const defaultFallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE1MCAxMDAgMTUwIDEwMCAxNTAgMTAwWiIgZmlsbD0iI0QxRDU5QSIvPgo8L3N2Zz4K';
  
  return getImageUrl(imagePath, fallback || defaultFallback);
}; 