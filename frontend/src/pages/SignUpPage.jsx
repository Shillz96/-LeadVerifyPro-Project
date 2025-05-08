import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract plan from URL parameter if present
  const queryParams = new URLSearchParams(location.search);
  const selectedPlan = queryParams.get('plan') || 'starter';
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    plan: selectedPlan,
    agreeToTerms: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Mock API call for registration
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
      
      // In a real app, this would call an API and handle the response
      // try {
      //   const response = await registerUser(formData);
      //   if (response.success) {
      //     navigate('/dashboard');
      //   } else {
      //     setErrors({ general: response.message || 'Registration failed' });
      //   }
      // } catch (err) {
      //   setErrors({ general: 'An error occurred. Please try again.' });
      //   console.error(err);
      // } finally {
      //   setIsLoading(false);
      // }
    }, 1500);
  };
  
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29/mo',
      features: ['20 verifications/month', 'Basic reporting', 'Email support'],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$79/mo',
      features: ['100 verifications/month', 'Full reporting', 'Priority support', '3 users'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199/mo',
      features: ['Unlimited verifications', 'Custom integrations', 'API access', 'Unlimited users'],
    },
  ];
  
  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-dark"
        >
          Create Your Account
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 text-text/70"
        >
          Try LeadVerifyPro free for 14 days, no credit card required
        </motion.p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-background rounded-xl shadow-lg border border-border/40 p-8"
      >
        {errors.general && (
          <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
            <p>{errors.general}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-text mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Smith"
                className={`w-full rounded-lg border ${
                  errors.fullName ? 'border-red-500' : 'border-border/40'
                } bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-border/40'
                } bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-border/40'
                } bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full rounded-lg border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-border/40'
                } bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-text mb-1">
                Company Name (Optional)
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your Company"
                className="w-full rounded-lg border border-border/40 bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Plan selection */}
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Select Your Plan
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border ${
                    formData.plan === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border/40 bg-background'
                  } p-4 cursor-pointer transition-colors hover:border-primary/70`}
                  onClick={() => setFormData((prev) => ({ ...prev, plan: plan.id }))}
                >
                  <input
                    type="radio"
                    name="plan"
                    id={`plan-${plan.id}`}
                    value={plan.id}
                    checked={formData.plan === plan.id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <span className="text-dark font-semibold">{plan.name}</span>
                    <span className="text-primary font-bold">{plan.price}</span>
                    <ul className="mt-2 space-y-1 text-xs text-text/70">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="mr-1.5 h-3 w-3 text-primary"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {formData.plan === plan.id && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3 w-3"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Terms agreement */}
          <div>
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`h-4 w-4 rounded border-border/40 text-primary focus:ring-primary ${
                    errors.agreeToTerms ? 'border-red-500' : ''
                  }`}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-text">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                )}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary py-3 text-white font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 text-center text-sm text-text/70"
      >
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in here
        </Link>
      </motion.p>
    </div>
  );
};

export default SignUpPage; 