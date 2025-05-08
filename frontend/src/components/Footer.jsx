import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/40">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-2xl font-bold text-primary">
              LeadVerifyPro
            </Link>
            <p className="text-text/80 max-w-xs">
              AI-powered lead verification for real estate wholesalers. Save time and close deals faster.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com/leadverifypro" aria-label="Facebook" title="Facebook" className="text-text hover:text-accent transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://twitter.com/leadverifypro" aria-label="Twitter" title="Twitter" className="text-text hover:text-accent transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://instagram.com/leadverifypro" aria-label="Instagram" title="Instagram" className="text-text hover:text-accent transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://linkedin.com/company/leadverifypro" aria-label="LinkedIn" title="LinkedIn" className="text-text hover:text-accent transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Links Columns */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-dark">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-text hover:text-accent transition-colors duration-300">Features</Link></li>
              <li><Link to="/pricing" className="text-text hover:text-accent transition-colors duration-300">Pricing</Link></li>
              <li><Link to="/testimonials" className="text-text hover:text-accent transition-colors duration-300">Testimonials</Link></li>
              <li><Link to="/faq" className="text-text hover:text-accent transition-colors duration-300">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-dark">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-text hover:text-accent transition-colors duration-300">About</Link></li>
              <li><Link to="/team" className="text-text hover:text-accent transition-colors duration-300">Our Team</Link></li>
              <li><Link to="/careers" className="text-text hover:text-accent transition-colors duration-300">Careers</Link></li>
              <li><Link to="/contact" className="text-text hover:text-accent transition-colors duration-300">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-dark">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-text hover:text-accent transition-colors duration-300">Blog</Link></li>
              <li><Link to="/guides" className="text-text hover:text-accent transition-colors duration-300">Guides</Link></li>
              <li><Link to="/support" className="text-text hover:text-accent transition-colors duration-300">Support</Link></li>
              <li><Link to="/api" className="text-text hover:text-accent transition-colors duration-300">API Docs</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text/70 text-sm">
              © {new Date().getFullYear()} LeadVerifyPro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-text/70 text-sm hover:text-accent transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-text/70 text-sm hover:text-accent transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-text/70 text-sm hover:text-accent transition-colors duration-300">
                Cookies Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 