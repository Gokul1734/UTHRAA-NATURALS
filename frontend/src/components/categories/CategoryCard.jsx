import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, index }) => {
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
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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