import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const ConditionalNavbar = () => {
  const location = useLocation();
  
  // Don't show navbar on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  return <Navbar />;
};

export default ConditionalNavbar; 