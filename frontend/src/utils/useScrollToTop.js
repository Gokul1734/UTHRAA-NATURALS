import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to automatically scroll to top when route changes
 * This ensures that users start at the top of the page when navigating to a new route
 */
const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Smooth scrolling for better UX
    });
  }, [pathname]);
};

export default useScrollToTop; 