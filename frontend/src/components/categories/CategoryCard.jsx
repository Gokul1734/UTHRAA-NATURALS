import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, index }) => {
  // Helper function to get proper image URL
  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return '/placeholder-category.jpg';
    
    // If it's already a complete URL (starts with http), use as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it starts with /uploads, it's our uploaded file - prepend server URL
    if (imageUrl.startsWith('/uploads')) {
      return `http://localhost:5000${imageUrl}`;
    }
    
    // If it's just a filename, assume it's in the uploads folder
    if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
      return `http://localhost:5000/uploads/${imageUrl}`;
    }
    
    // For category images, try the categories subfolder
    if (!imageUrl.startsWith('/uploads/categories')) {
      return `http://localhost:5000/uploads/categories/${imageUrl}`;
    }
    
    // Otherwise assume it's a relative path and prepend server URL
    return `http://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/products?category=${category._id}`}>
        <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
          {/* Category Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={getImageSrc(category.image)}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/placeholder-category.jpg';
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
            
            {/* Category Name */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-white/90 max-w-xs mx-auto line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard; 