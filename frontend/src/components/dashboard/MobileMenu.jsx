import { useEffect } from 'react';
import { cn } from '../../utils/cn';

const MobileMenu = ({ sidebarOpen, toggleSidebar }) => {
  // Prevent body scrolling when the mobile menu is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);
  
  return (
    <>
      {/* Backdrop with fade-in animation */}
      <div
        className={cn(
          "fixed inset-0 z-20 bg-dark/50 transition-opacity md:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
    </>
  );
};

export default MobileMenu; 