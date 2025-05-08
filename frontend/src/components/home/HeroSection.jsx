import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BorderBeam } from '../ui/BorderBeam';

const HeroSection = () => {
  const textRef = useRef(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Text animation
  useEffect(() => {
    const words = ['Accurate', 'Efficient', 'AI-Powered'];
    let currentIndex = 0;
    let currentWord = '';
    let isDeleting = false;
    let typingSpeed = 100;

    const type = () => {
      const word = words[currentIndex];
      
      if (isDeleting) {
        currentWord = word.substring(0, currentWord.length - 1);
      } else {
        currentWord = word.substring(0, currentWord.length + 1);
      }
      
      if (textRef.current) {
        textRef.current.textContent = currentWord;
      }
      
      // Typing speed
      if (isDeleting) {
        typingSpeed = 50;
      } else {
        typingSpeed = 100;
      }
      
      // If word is complete, start deleting
      if (!isDeleting && currentWord === word) {
        typingSpeed = 1500; // Pause at the end of word
        isDeleting = true;
      } else if (isDeleting && currentWord === '') {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % words.length;
      }
      
      const timerId = setTimeout(type, typingSpeed);
      return () => clearTimeout(timerId);
    };
    
    // Start the animation
    const timerId = setTimeout(type, 1000);
    
    // Set animation complete after delay
    const completeTimer = setTimeout(() => {
      setAnimationComplete(true);
    }, 3000);
    
    return () => {
      clearTimeout(timerId);
      clearTimeout(completeTimer);
    };
  }, []);
  
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left side - Text content */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-dark leading-tight mb-4">
              <span className="block">
                <span ref={textRef} className="text-accent"></span>
                <span className="ml-1 inline-block h-8 w-1 bg-accent animate-pulse"></span>
              </span>
              <span className="block mt-2">Lead Verification</span>
              <span className="block mt-2">for Real Estate Wholesalers</span>
            </h1>
            
            <p className="text-lg text-text/80 mb-8 max-w-xl mx-auto md:mx-0">
              LeadVerifyPro harnesses the power of AI to quickly verify leads, 
              saving you time and helping you close deals faster than ever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                to="/signup" 
                className="relative overflow-hidden btn-primary flex items-center justify-center gap-2"
              >
                Get Started Free
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
                <BorderBeam duration={3} size={50} />
              </Link>
              
              {/* <Link 
                to="/demo" 
                className="btn-secondary flex items-center justify-center gap-2"
              >
                Watch Demo
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </Link> */}
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 text-text/70">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-background"
                    style={{
                      backgroundColor: `hsl(${i * 60}, 70%, 85%)`,
                      zIndex: 4-i
                    }}
                  />
                ))}
              </div>
              <p className="text-sm">
                <span className="font-semibold text-accent">500+</span> real estate professionals trust LeadVerifyPro
              </p>
            </div>
          </div>
          
          {/* Right side - Visual element */}
          <div className="flex-1 relative">
            <div className="relative bg-background rounded-xl border border-border/40 overflow-hidden shadow-xl p-4 md:p-6 w-full max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-semibold text-dark">Lead Verification</div>
                  <span className="text-sm bg-notification/20 text-notification px-2 py-1 rounded-full font-medium">
                    AI Processing
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* Lead details */}
                  <div className="bg-background rounded-lg border border-border/60 p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-text/70">Lead Name</span>
                      <span className="text-sm font-medium">John Smith</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-text/70">Property</span>
                      <span className="text-sm font-medium">123 Main St</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text/70">Contact</span>
                      <span className="text-sm font-medium">(555) 123-4567</span>
                    </div>
                  </div>
                  
                  {/* Verification results */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-5 h-5 text-green-500"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-sm">Property Ownership Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-5 h-5 text-green-500"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-sm">Contact Details Validated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-5 h-5 text-green-500"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-sm">Motivated Seller Indicators Found</span>
                    </div>
                  </div>
                  
                  {/* Status bar */}
                  <div className="pt-2">
                    <div className="w-full bg-background rounded-full h-2.5 border border-border/60">
                      <div className="bg-accent h-2.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-text/70">Analysis Progress</span>
                      <span className="text-xs font-medium">85%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-2 right-2 w-16 h-16 bg-notification/5 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-accent/10 rounded-full blur-md"></div>
            <div className="absolute top-1/2 -left-8 w-16 h-16 bg-primary/10 rounded-full blur-md"></div>
            <div className="absolute -bottom-4 right-1/3 w-20 h-20 bg-secondary/10 rounded-full blur-md"></div>
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection; 