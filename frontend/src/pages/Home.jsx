import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Star, 
  Shield, 
  Truck, 
  Leaf, 
  Heart,
  ShoppingBag,
  Search,
  ChevronDown,
  Sparkles,
  Award,
  Users,
  Package,
  Zap,
  Globe,
  CheckCircle
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import ProductCard from '../components/products/ProductCard';
import CategoryCard from '../components/categories/CategoryCard';
import { getCategories } from '../store/slices/categorySlice';
import Logo from '../assets/LOGO.png';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useSelector((state) => state.categories);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { scrollY } = useScroll();
  
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Featured products (first 6 products)
  const featuredProducts = products.slice(0, 6);

  // Hero section data
  const heroSlides = [
    {
      title: "Natural Wellness",
      subtitle: "Discover the power of nature with our premium organic products",
      description: "From farm to your doorstep, we bring you the finest natural ingredients for your health and wellness journey.",
      image: "/images/hero-1.jpg",
      cta: "Shop Now",
      color: "from-green-400 to-green-600"
    },
    {
      title: "Pure & Organic",
      subtitle: "100% natural ingredients for a healthier lifestyle",
      description: "Every product is carefully crafted with organic ingredients, ensuring purity and effectiveness for your daily needs.",
      image: "/images/hero-2.jpg",
      cta: "Explore Products",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      title: "Sustainable Living",
      subtitle: "Eco-friendly products for a better tomorrow",
      description: "Join us in making the world a better place with our sustainable and environmentally conscious product range.",
      image: "/images/hero-3.jpg",
      cta: "Learn More",
      color: "from-teal-400 to-teal-600"
    }
  ];

  useEffect(() => {
    // Check if categories are already loaded
    if (categories && categories.length > 0) {
      setPageLoading(false);
    } else {
      // If categories are not loaded, wait for them to load
      const checkCategories = () => {
        if (categories && categories.length > 0) {
          setPageLoading(false);
        } else if (!categoriesLoading) {
          // If categories failed to load or are empty, still show the page
          setPageLoading(false);
        }
      };
      
      checkCategories();
      
      // Set a timeout to show the page even if categories don't load
      const timeout = setTimeout(() => {
        setPageLoading(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [categories, categoriesLoading]);

  // Fetch categories when component mounts
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!pageLoading) {
      setIsVisible(true);
      
      // Auto-slide hero section
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [pageLoading]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Show loading state while categories are being loaded
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-light-green flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-green">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden pt-16 sm:pt-20 lg:pt-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-light-green to-green-100">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%2398b702&quot; fill-opacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 w-16 h-16 bg-green-300 rounded-full opacity-30"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-32 h-32 border-2 border-green-200 rounded-full opacity-20"
        />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center lg:text-left"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6"
                >
                  Discover the Power of{' '}
                  <span className="text-primary bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    Natural Wellness
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0"
                >
                  Experience the finest organic products crafted with care for your health and wellness. 
                  From farm to your doorstep, we bring nature's best to you.
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-2xl mx-auto lg:mx-0"
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary mb-1">10K+</div>
                    <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary mb-1">500+</div>
                    <div className="text-xs sm:text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary mb-1">100%</div>
                    <div className="text-xs sm:text-sm text-gray-600">Organic</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative order-first lg:order-last"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 blur-3xl"
                  />
                  <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                    <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <img src={Logo} alt="Hero Image" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Shop by Category
            </span>
            <h2 className="heading-2 text-gray-900 mb-6">
              All Our Natural Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our complete range of organic and natural product categories, 
              each carefully curated to enhance your wellness journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories && categories.length > 0 ? (
              categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No categories available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Why Choose Us
            </span>
            <h2 className="heading-2 text-gray-900 mb-6">
              The Natural Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to bringing you the highest quality natural products 
              with exceptional service and care.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Leaf className="w-8 h-8" />,
                title: "100% Organic",
                description: "All our products are certified organic and free from harmful chemicals."
              },
              {
                icon: <Truck className="w-8 h-8" />,
                title: "Fast Delivery",
                description: "Quick and reliable delivery to your doorstep within 24-48 hours."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Quality Assured",
                description: "Every product undergoes rigorous quality checks before reaching you."
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Customer First",
                description: "Your satisfaction is our priority with 24/7 customer support."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8 text-center hover-lift"
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="heading-3 text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Featured Products
            </span>
            <h2 className="heading-2 text-gray-900 mb-6">
              Our Most Popular Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our best-selling natural products that customers love and trust.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => navigate('/products')}
              className="btn-primary group"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Customer Reviews
            </span>
            <h2 className="heading-2 text-gray-900 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our valued customers have to say about their experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Wellness Enthusiast",
                content: "The quality of these organic products is exceptional. I've never felt better since switching to natural alternatives.",
                rating: 5,
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Health Coach",
                content: "As a health coach, I recommend Uthraa Naturals to all my clients. The products are pure and effective.",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "Emma Davis",
                role: "Yoga Instructor",
                content: "The natural ingredients and sustainable packaging make this my go-to choice for wellness products.",
                rating: 5,
                avatar: "ED"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="heading-2 text-white mb-6">
              Ready to Start Your Natural Wellness Journey?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of customers who have already discovered the power of natural products. 
              Start your journey to better health today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors group flex items-center justify-center"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 