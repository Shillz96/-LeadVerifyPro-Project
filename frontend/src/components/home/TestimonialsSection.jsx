import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '../../utils/cn';

const testimonials = [
  {
    quote: "LeadVerifyPro has completely transformed our lead verification process. We're now able to quickly identify which leads are worth pursuing, saving us countless hours of manual research.",
    author: "Michael Johnson",
    title: "Real Estate Investor, Chicago",
    stars: 5,
    imageSrc: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    quote: "The AI-powered verification gives me confidence that I'm only pursuing legitimate opportunities. Since using LeadVerifyPro, my deal conversion rate has increased by 30%.",
    author: "Sarah Williams",
    title: "Wholesaler, Atlanta",
    stars: 5,
    imageSrc: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    quote: "I was skeptical at first, but after seeing how quickly and accurately LeadVerifyPro validates property ownership and seller motivation, I'm a believer. It's worth every penny.",
    author: "Robert Chen",
    title: "Real Estate Entrepreneur, Austin",
    stars: 4,
    imageSrc: "https://randomuser.me/api/portraits/men/62.jpg"
  },
  {
    quote: "The detailed reports are amazing. I can see all the verification data in one place, which makes it easy to decide which leads to follow up on first.",
    author: "Jennifer Lopez",
    title: "Property Wholesaler, Miami",
    stars: 5,
    imageSrc: "https://randomuser.me/api/portraits/women/26.jpg"
  },
  {
    quote: "LeadVerifyPro integrates perfectly with our existing CRM. The workflow is seamless, and we've been able to scale our operations without adding more staff.",
    author: "David Thompson",
    title: "Real Estate Agency Owner, Phoenix",
    stars: 5,
    imageSrc: "https://randomuser.me/api/portraits/men/85.jpg"
  },
  {
    quote: "The time saved on verification allows me to focus on what I do best - negotiating deals and closing sales. It's been a game-changer for my business.",
    author: "Ashley Rodriguez",
    title: "Independent Wholesaler, Dallas",
    stars: 4,
    imageSrc: "https://randomuser.me/api/portraits/women/39.jpg"
  },
];

const TestimonialCard = ({ testimonial, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-xl bg-background p-6 shadow transition-all duration-300",
        isHovered ? "shadow-lg transform -translate-y-1" : "shadow",
        "border border-border/40"
      )}
    >
      {/* Quote icon */}
      <div className="absolute right-6 top-6 text-primary/10 z-0">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="h-16 w-16"
        >
          <path 
            fillRule="evenodd" 
            d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Stars */}
        <div className="mb-4 flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={i < testimonial.stars ? "currentColor" : "none"}
              stroke={i < testimonial.stars ? "none" : "currentColor"}
              className={cn(
                "h-5 w-5",
                i < testimonial.stars ? "text-notification" : "text-text/30"
              )}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
        
        {/* Quote */}
        <p className="mb-6 text-text/80">&quot;{testimonial.quote}&quot;</p>
        
        {/* Author */}
        <div className="flex items-center">
          <div className="mr-4 h-12 w-12 overflow-hidden rounded-full border-2 border-primary/20">
            <img
              src={testimonial.imageSrc}
              alt={testimonial.author}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-dark">{testimonial.author}</h3>
            <p className="text-sm text-text/70">{testimonial.title}</p>
          </div>
        </div>
      </div>
      
      {/* Gradient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
          isHovered ? "opacity-5" : "opacity-0"
        )}
        style={{
          background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
          "--tw-gradient-from": "rgb(var(--color-primary) / 0.3)",
          "--tw-gradient-to": "rgb(var(--color-secondary) / 0.1)",
        }}
      />
    </motion.div>
  );
};

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="relative py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-secondary/5 blur-3xl"></div>
      
      <div className="container-custom">
        {/* Section header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-dark md:text-4xl">
            What Our Customers Are Saying
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-text/80">
            Discover how LeadVerifyPro is helping real estate professionals across the country
            verify leads faster and close more deals.
          </p>
        </div>
        
        {/* Testimonials grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
        
        {/* Call to action */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-xl font-medium text-dark">
            Ready to transform your lead verification process?
          </p>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-white font-semibold transition-all hover:bg-primary/90 hover:scale-105"
          >
            Start Your Free Trial
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 