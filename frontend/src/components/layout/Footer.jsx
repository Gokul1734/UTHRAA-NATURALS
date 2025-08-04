import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart, Leaf, Shield, Truck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-left lg:col-span-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-lg">U</span>
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold">Uthraa Naturals</span>
                <div className="flex items-center justify-center sm:justify-start mt-1">
                  <Leaf className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">100% Natural</span>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto sm:mx-0">
              Discover the power of nature with our premium organic products. 
              Handcrafted with love and care for your well-being and a sustainable future.
            </p>
            <div className="flex items-center justify-center sm:justify-start space-x-4 sm:space-x-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors p-2 hover:bg-gray-800 rounded-lg touch-manipulation"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors p-2 hover:bg-gray-800 rounded-lg touch-manipulation"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors p-2 hover:bg-gray-800 rounded-lg touch-manipulation"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Quick Links</h3>
            <nav className="flex flex-col space-y-2 sm:space-y-3">
              <Link to="/" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Home
              </Link>
              <Link to="/products" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Products
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                About Us
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Contact
              </Link>
              <Link to="/blog" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Blog
              </Link>
              <Link to="/faq" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                FAQ
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          {/* <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Customer Service</h3>
            <nav className="flex flex-col space-y-2 sm:space-y-3">
              <Link to="/shipping" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Shipping Info
              </Link>
              <Link to="/returns" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Returns & Exchanges
              </Link>
              <Link to="/track-order" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Track Your Order
              </Link>
              <Link to="/size-guide" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Size Guide
              </Link>
              <Link to="/support" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Customer Support
              </Link>
              <Link to="/wholesale" className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base py-1 hover:underline touch-manipulation">
                Wholesale
              </Link>
            </nav>
          </div> */}

          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Get in Touch</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  123 Nature Street, Green Valley, Earth 12345
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                <a 
                  href="tel:+1234567890" 
                  className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  +1 (234) 567-8900
                </a>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                <a 
                  href="mailto:hello@uthraanaturals.com" 
                  className="text-gray-300 hover:text-green-400 transition-colors text-sm sm:text-base touch-manipulation"
                >
                  hello@uthraanaturals.com
                </a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-base sm:text-lg font-medium text-white mb-3">Stay Updated</h4>
              <form className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap touch-manipulation"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Get the latest updates on new products and exclusive offers.
              </p>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                icon: <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />,
                title: '100% Organic',
                description: 'Certified natural products'
              },
              {
                icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />,
                title: 'Quality Assured',
                description: 'Premium quality guarantee'
              },
              {
                icon: <Truck className="h-5 w-5 sm:h-6 sm:w-6" />,
                title: 'Free Shipping',
                description: 'On orders above ₹500'
              },
              {
                icon: <Heart className="h-5 w-5 sm:h-6 sm:w-6" />,
                title: 'Made with Love',
                description: 'Handcrafted with care'
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center sm:justify-start space-x-3 p-3 sm:p-4 bg-gray-800 rounded-xl">
                <div className="text-green-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-white font-medium text-sm sm:text-base">{feature.title}</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <p className="text-gray-400 text-xs sm:text-sm">
                © 2024 Uthraa Naturals. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 sm:space-x-6">
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-green-400 transition-colors text-xs sm:text-sm hover:underline touch-manipulation"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-green-400 transition-colors text-xs sm:text-sm hover:underline touch-manipulation"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/cookies"
                  className="text-gray-400 hover:text-green-400 transition-colors text-xs sm:text-sm hover:underline touch-manipulation"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-xs sm:text-sm">Made with love for nature</span>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium text-sm sm:text-base shadow-lg hover:shadow-xl touch-manipulation"
          >
            <span>Back to Top</span>
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 