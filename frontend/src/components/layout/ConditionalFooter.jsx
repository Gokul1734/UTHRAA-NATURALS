import { useLocation } from 'react-router-dom';
import Footer from './Footer';

const ConditionalFooter = () => {
  const location = useLocation();
  
  // Don't show footer on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
};

export default ConditionalFooter; 