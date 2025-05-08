import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const CtaSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };
  
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-dark/95 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 opacity-20 z-0"></div>
      
      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl z-0"></div>
      <div className="absolute top-1/3 right-10 h-60 w-60 rounded-full bg-accent/10 blur-3xl z-0"></div>
      <div className="absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-secondary/10 blur-3xl z-0"></div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
          {/* Left column: Text content */}
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-white md:text-4xl leading-tight"
            >
              Take the Guesswork Out of Lead Verification
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-lg text-white/80"
            >
              Join thousands of real estate professionals who are saving time and closing more deals with LeadVerifyPro.
            </motion.p>
            
            <motion.ul 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 space-y-4"
            >
              {[
                'Get started with no credit card required',
                'Free 14-day trial on all plans',
                'Cancel anytime, no questions asked',
                'Full access to all features during trial',
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={2} 
                      stroke="currentColor" 
                      className="h-4 w-4"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.5 12.75l6 6 9-13.5" 
                      />
                    </svg>
                  </span>
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </motion.ul>
          </div>
          
          {/* Right column: Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-background rounded-xl p-8 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-dark mb-6">Get Started Today</h3>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label 
                    htmlFor="full-name" 
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full-name"
                    className="w-full rounded-lg border border-border/40 bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="John Smith"
                    required
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-1",
                      error 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                        : "border-border/40 focus:border-primary focus:ring-primary"
                    )}
                    placeholder="your@email.com"
                    required
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                  )}
                </div>
                
                <div>
                  <label 
                    htmlFor="company" 
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full rounded-lg border border-border/40 bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Your Company"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="phone" 
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full rounded-lg border border-border/40 bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full rounded-lg bg-accent py-3 font-medium text-white transition-all",
                    isSubmitting 
                      ? "opacity-70 cursor-not-allowed" 
                      : "hover:bg-accent/90 hover:shadow-md"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg 
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        ></circle>
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Start Your Free Trial"}
                </button>
                
                <p className="text-xs text-center text-text/70 pt-2">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="h-6 w-6 text-green-600"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-dark">Thank You!</h4>
                <p className="mt-2 text-center text-text">
                  We've received your information. Someone from our team will be in touch shortly.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection; 