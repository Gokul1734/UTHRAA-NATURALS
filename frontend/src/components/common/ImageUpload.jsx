import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { UPLOAD_URL } from '../../config/environment';

const ImageUpload = ({ 
  onImageUploaded, 
  onImageRemoved,
  existingImages = [], 
  multiple = false, 
  maxFiles = 5,
  uploadType = 'category' // 'category' or 'product'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const uploadImage = async (files) => {
    try {
      setUploading(true);

      console.log('Upload type:', uploadType);
      console.log('Multiple files:', multiple);

      if (multiple) {
        // Upload multiple files
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('productImages', file);
        });

        console.log('Uploading to product-images endpoint');
        const response = await fetch(`${UPLOAD_URL}/api/upload/product-images`, {
          method: 'POST',
          body: formData,
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload error response:', errorData);
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();
        console.log('Upload success:', result);
        
        // For multiple images, pass the array of URLs
        const imageUrls = result.images.map(image => image.url);
        onImageUploaded(imageUrls);
      } else {
        // Upload single file
        const formData = new FormData();
        formData.append('image', files[0]);

        const endpoint = uploadType === 'category' 
          ? `${UPLOAD_URL}/api/upload/category-image`
          : `${UPLOAD_URL}/api/upload/image`;

        // Use different field name for category images
        if (uploadType === 'category') {
          formData.delete('image');
          formData.append('categoryImage', files[0]);
        }

        console.log('Uploading to endpoint:', endpoint);
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload error response:', errorData);
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();
        console.log('Upload success:', result);
        const imageUrl = uploadType === 'category' ? result.image.url : result.file.url;
        onImageUploaded(imageUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (multiple && files.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }
      uploadImage(files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      // Filter only image files
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (imageFiles.length === 0) {
        alert('Please select only image files');
        return;
      }

      if (multiple && imageFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      uploadImage(imageFiles);
    }
  };

  const removeImage = (indexToRemove) => {
    if (onImageRemoved) {
      // Use the dedicated remove handler if provided
      onImageRemoved(indexToRemove);
    } else {
      // Fallback to the old method - pass updated array
      if (multiple) {
        const updatedImages = existingImages.filter((_, index) => index !== indexToRemove);
        onImageUploaded(updatedImages);
      } else {
        onImageUploaded('');
      }
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return getRandomPlaceholderImage();
    
    // If it's already a complete URL (starts with http), use as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it starts with /uploads, it's our uploaded file - prepend server URL
    if (imageUrl.startsWith('/uploads')) {
      return `${UPLOAD_URL}${imageUrl}`;
    }
    
    // If it's just a filename, assume it's in the uploads folder
    if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
      return `${UPLOAD_URL}/uploads/${imageUrl}`;
    }
    
    // For category images, try the categories subfolder
    if (uploadType === 'category' && !imageUrl.startsWith('/uploads/categories')) {
      return `${UPLOAD_URL}/uploads/categories/${imageUrl}`;
    }
    
    // For product images, try the products subfolder
    if (uploadType === 'product' && !imageUrl.startsWith('/uploads/products')) {
      return `${UPLOAD_URL}/uploads/products/${imageUrl}`;
    }
    
    // Otherwise assume it's a relative path and prepend server URL
    return `${UPLOAD_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const getRandomPlaceholderImage = () => {
    const colors = ['f0f9ff', 'fef3c7', 'f3e8ff', 'ecfdf5', 'fef2f2', 'f0fdf4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const width = multiple ? 400 : 200;
    const height = multiple ? 300 : 200;
    return `https://via.placeholder.com/${width}x${height}/${randomColor}/6b7280?text=Upload+Image`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">
              {multiple 
                ? `Click to upload or drag and drop images (max ${maxFiles})`
                : 'Click to upload or drag and drop an image'
              }
            </p>
            <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {multiple ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Show existing images */}
          {existingImages && existingImages.length > 0 && existingImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={getImageSrc(imageUrl)}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.src = getRandomPlaceholderImage();
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {/* Show placeholder if no images */}
          {(!existingImages || existingImages.length === 0) && (
            <div className="relative group">
              <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No images uploaded</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative inline-block">
          {existingImages && existingImages.length > 0 ? (
            <img
              src={getImageSrc(existingImages)}
              alt="Category image"
              className="w-32 h-32 object-cover rounded-lg border"
              onError={(e) => {
                e.target.src = getRandomPlaceholderImage();
              }}
            />
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">No image</p>
              </div>
            </div>
          )}
          {existingImages && existingImages.length > 0 && (
            <button
              type="button"
              onClick={() => removeImage(0)}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 