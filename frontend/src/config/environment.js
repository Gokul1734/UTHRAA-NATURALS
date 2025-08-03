// Environment configuration for Vite
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5001/api',
    UPLOAD_URL: 'http://localhost:5001',
    FRONTEND_URL: 'http://localhost:3000'
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    UPLOAD_URL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001',
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://uthraa-naturals.vercel.app'
  }
};

const environment = import.meta.env.MODE || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.API_BASE_URL;
export const UPLOAD_URL = currentConfig.UPLOAD_URL;
export const FRONTEND_URL = currentConfig.FRONTEND_URL;

export default currentConfig; 