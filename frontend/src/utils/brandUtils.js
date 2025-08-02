// Brand utilities for logo and brand name management

// Extract brand name from logo or use default
export const getBrandName = () => {
  // In a real application, you might extract this from the logo image
  // For now, we'll use the hardcoded brand name
  return 'Uthraa Naturals';
};

// Get short brand name
export const getShortBrandName = () => {
  return 'Uthraa';
};

// Get brand tagline
export const getBrandTagline = () => {
  return 'Discover the Power of Nature';
};

// Get brand description
export const getBrandDescription = () => {
  return 'Experience the pure essence of nature with our handcrafted organic products. From skincare to wellness, we bring you the finest natural ingredients.';
};

// Get brand colors
export const getBrandColors = () => {
  return {
    primary: '#16a34a', // green-600
    secondary: '#059669', // emerald-600
    accent: '#22c55e', // green-500
    light: '#dcfce7', // green-100
    dark: '#15803d' // green-700
  };
};

// Get logo path
export const getLogoPath = () => {
  return '/src/assets/LOGO.png';
};

// Get fallback logo path
export const getFallbackLogoPath = () => {
  return '/src/assets/Logo.jpg';
};

// Brand information object
export const brandInfo = {
  name: getBrandName(),
  shortName: getShortBrandName(),
  tagline: getBrandTagline(),
  description: getBrandDescription(),
  colors: getBrandColors(),
  logo: getLogoPath(),
  fallbackLogo: getFallbackLogoPath(),
  email: 'info@uthraanaturals.com',
  phone: '+91 98765 43210',
  address: {
    street: '123 Natural Way',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India'
  },
  social: {
    facebook: 'https://facebook.com/uthraanaturals',
    instagram: 'https://instagram.com/uthraanaturals',
    twitter: 'https://twitter.com/uthraanaturals',
    youtube: 'https://youtube.com/uthraanaturals'
  }
};

export default brandInfo; 