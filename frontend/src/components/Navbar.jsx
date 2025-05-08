import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import ErrorBoundary from './ui/ErrorBoundary';

// Define available routes to prevent dead links
const AVAILABLE_ROUTES = {
  home: '/',
  features: '/features',
  pricing: '/pricing',
  about: '/about',
  contact: '/contact',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
};

const NavLink = ({ to, children, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to}
      className={cn(
        "relative px-4 py-2 text-text hover:text-dark transition-colors duration-300 no-underline",
        "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent",
        "after:transition-all after:duration-300 hover:after:w-full",
        isActive && "text-dark after:w-full",
        className
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={AVAILABLE_ROUTES.home} className="flex items-center space-x-2 no-underline">
              <span className="text-2xl font-bold text-primary">LeadVerifyPro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4" aria-label="Main navigation">
              <NavLink to={AVAILABLE_ROUTES.home}>Home</NavLink>
              <NavLink to={AVAILABLE_ROUTES.features}>Features</NavLink>
              <NavLink to={AVAILABLE_ROUTES.pricing}>Pricing</NavLink>
              <NavLink to={AVAILABLE_ROUTES.about}>About</NavLink>
              <NavLink to={AVAILABLE_ROUTES.contact}>Contact</NavLink>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to={AVAILABLE_ROUTES.login} 
                className="text-text hover:text-dark transition-colors duration-300 no-underline"
              >
                Log in
              </Link>
              <Link 
                to={AVAILABLE_ROUTES.signup} 
                className="btn-primary"
              >
                Sign up
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="flex md:hidden items-center p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="h-6 w-6 text-text"
                aria-hidden="true"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div id="mobile-menu" className="md:hidden py-4">
              <nav className="flex flex-col space-y-4" aria-label="Mobile navigation">
                <NavLink to={AVAILABLE_ROUTES.home} className="w-full">Home</NavLink>
                <NavLink to={AVAILABLE_ROUTES.features} className="w-full">Features</NavLink>
                <NavLink to={AVAILABLE_ROUTES.pricing} className="w-full">Pricing</NavLink>
                <NavLink to={AVAILABLE_ROUTES.about} className="w-full">About</NavLink>
                <NavLink to={AVAILABLE_ROUTES.contact} className="w-full">Contact</NavLink>
                <div className="flex flex-col space-y-2 pt-4 border-t border-border/40">
                  <Link 
                    to={AVAILABLE_ROUTES.login} 
                    className="w-full text-center py-2 text-text hover:text-dark transition-colors duration-300"
                  >
                    Log in
                  </Link>
                  <Link 
                    to={AVAILABLE_ROUTES.signup} 
                    className="w-full text-center btn-primary"
                  >
                    Sign up
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </ErrorBoundary>
  );
};

export default Navbar; 