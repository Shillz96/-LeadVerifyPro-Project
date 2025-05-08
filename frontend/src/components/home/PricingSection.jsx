import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals just getting started with lead verification.',
    price: {
      monthly: 29,
      annually: 290
    },
    features: [
      'Up to 20 lead verifications per month',
      'Basic property ownership verification',
      'Email support',
      'Access to basic reports',
      'Single user account'
    ],
    mostPopular: false,
    buttonText: 'Start Free Trial',
    buttonLink: '/signup?plan=starter'
  },
  {
    name: 'Professional',
    description: 'Ideal for active real estate wholesalers.',
    price: {
      monthly: 79,
      annually: 790
    },
    features: [
      'Up to 100 lead verifications per month',
      'Advanced property verification',
      'Motivated seller detection',
      'Priority email support',
      'Full detailed reports',
      'Up to 3 user accounts'
    ],
    mostPopular: true,
    buttonText: 'Start Free Trial',
    buttonLink: '/signup?plan=professional'
  },
  {
    name: 'Enterprise',
    description: 'For teams and businesses with high-volume needs.',
    price: {
      monthly: 199,
      annually: 1990
    },
    features: [
      'Unlimited lead verifications',
      'Complete property analysis',
      'Advanced seller motivation scoring',
      'Priority phone & email support',
      'Custom integration options',
      'Unlimited user accounts',
      'API access'
    ],
    mostPopular: false,
    buttonText: 'Contact Sales',
    buttonLink: '/contact'
  }
];

const featureComparison = [
  {
    feature: 'Lead Verifications per Month',
    starter: '20',
    professional: '100',
    enterprise: 'Unlimited'
  },
  {
    feature: 'Property Ownership Verification',
    starter: 'Basic',
    professional: 'Advanced',
    enterprise: 'Complete'
  },
  {
    feature: 'Seller Motivation Detection',
    starter: '✓',
    professional: 'Advanced',
    enterprise: 'Advanced + Scoring'
  },
  {
    feature: 'Customer Support',
    starter: 'Email',
    professional: 'Priority Email',
    enterprise: 'Priority Phone & Email'
  },
  {
    feature: 'User Accounts',
    starter: '1',
    professional: '3',
    enterprise: 'Unlimited'
  },
  {
    feature: 'API Access',
    starter: '✗',
    professional: '✗',
    enterprise: '✓'
  },
  {
    feature: 'Custom Integrations',
    starter: '✗',
    professional: '✗',
    enterprise: '✓'
  }
];

const PricingCard = ({ plan, billingCycle }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually;
  const discount = billingCycle === 'annually' ? Math.round((1 - (plan.price.annually / (plan.price.monthly * 12))) * 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex flex-col rounded-xl border bg-background p-6 shadow-sm transition-all duration-300",
        isHovered ? "shadow-lg transform -translate-y-1" : "",
        plan.mostPopular ? "border-accent" : "border-border/40"
      )}
    >
      {/* Popular tag */}
      {plan.mostPopular && (
        <div className="absolute -top-3 right-5">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase text-white">
            Most Popular
          </span>
        </div>
      )}
      
      {/* Plan details */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-dark">{plan.name}</h3>
        <p className="mt-2 text-sm text-text/70">{plan.description}</p>
      </div>
      
      {/* Price */}
      <div className="mb-6">
        <p className="flex items-baseline">
          <span className="text-4xl font-bold text-dark">${price}</span>
          <span className="ml-1 text-text/70">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
        </p>
        
        {discount > 0 && (
          <p className="mt-1 text-sm text-accent font-medium">
            Save {discount}% with annual billing
          </p>
        )}
      </div>
      
      {/* Features */}
      <ul className="mb-8 space-y-3 text-sm">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 h-5 w-5 flex-shrink-0 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      
      {/* Button */}
      <div className="mt-auto">
        <Link
          to={plan.buttonLink}
          className={cn(
            "inline-block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-all",
            plan.mostPopular
              ? "bg-accent text-white hover:bg-accent/90"
              : "bg-primary text-white hover:bg-primary/90"
          )}
        >
          {plan.buttonText}
        </Link>
      </div>
      
      {/* Gradient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 rounded-xl",
          isHovered ? "opacity-5" : "opacity-0"
        )}
        style={{
          background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
          "--tw-gradient-from": plan.mostPopular ? "rgb(var(--color-accent) / 0.2)" : "rgb(var(--color-primary) / 0.2)",
          "--tw-gradient-to": "rgb(var(--color-secondary) / 0.1)",
        }}
      />
    </motion.div>
  );
};

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showComparison, setShowComparison] = useState(false);
  
  return (
    <section id="pricing" className="relative py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl"></div>
      
      <div className="container-custom">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-dark md:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-text/80">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>
        
        {/* Billing cycle toggle */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex rounded-lg bg-background p-1 border border-border/40">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 text-sm rounded-md transition-all",
                billingCycle === 'monthly'
                  ? "bg-primary text-white font-medium"
                  : "text-text hover:text-dark"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={cn(
                "px-4 py-2 text-sm rounded-md transition-all",
                billingCycle === 'annually'
                  ? "bg-primary text-white font-medium"
                  : "text-text hover:text-dark"
              )}
            >
              Annually
            </button>
          </div>
          {billingCycle === 'annually' && (
            <span className="ml-2 inline-flex items-center rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
              Save up to 20%
            </span>
          )}
        </div>
        
        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <PricingCard 
              key={index} 
              plan={plan} 
              billingCycle={billingCycle} 
            />
          ))}
        </div>
        
        {/* Feature comparison toggle */}
        <div className="mt-16 text-center">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
          >
            {showComparison ? 'Hide' : 'Show'} feature comparison
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={cn(
                "ml-1 h-5 w-5 transition-transform",
                showComparison ? "rotate-180" : ""
              )}
            >
              <path
                fillRule="evenodd"
                d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        
        {/* Feature comparison table */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-8 overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-background/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-dark">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-dark">
                      Starter
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-dark">
                      Professional
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-dark">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((row, index) => (
                    <tr 
                      key={index} 
                      className={cn(
                        "border-b border-border/40",
                        index % 2 === 0 ? "bg-background" : "bg-background/50"
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-dark">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-text">
                        {row.starter}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-text">
                        {row.professional}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-text">
                        {row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        
        {/* Enterprise CTA */}
        <div className="mt-16 rounded-xl bg-dark p-8 text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Need a custom solution?</h3>
              <p className="mt-2 text-white/80">
                Contact our sales team to discuss your specific requirements.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-white font-semibold hover:bg-accent/90 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 