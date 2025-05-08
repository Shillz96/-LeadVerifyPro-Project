import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';

const PricingPage = () => {
  const [annual, setAnnual] = useState(true);
  
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses and individual professionals.',
      price: annual ? 29 : 39,
      features: [
        '1,000 lead verifications per month',
        'Email verification',
        'Phone number validation',
        'Basic data enrichment',
        'API access',
        'Email support'
      ]
    },
    {
      name: 'Professional',
      description: 'Ideal for growing teams and businesses.',
      popular: true,
      price: annual ? 89 : 99,
      features: [
        '10,000 lead verifications per month',
        'Advanced email verification',
        'Advanced phone verification',
        'Company data validation',
        'Full data enrichment',
        'Webhook integrations',
        'API access',
        'Priority email support',
        'Basic analytics'
      ]
    },
    {
      name: 'Enterprise',
      description: 'For organizations with high-volume verification needs.',
      price: annual ? 249 : 299,
      features: [
        '50,000 lead verifications per month',
        'Enterprise-grade verification',
        'Advanced fraud detection',
        'Custom validation rules',
        'Full API access',
        'Custom integrations',
        'Advanced analytics & reporting',
        'Dedicated account manager',
        '24/7 priority support',
        'SLA guarantees'
      ]
    }
  ];
  
  return (
    <div className="container-custom py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-dark">Simple, Transparent Pricing</h1>
        <p className="text-xl text-text">
          Choose the plan that&apos;s right for your business. All plans include our core verification technology.
        </p>
        
        {/* Billing toggle */}
        <div className="mt-8 flex justify-center items-center">
          <span className={`mr-4 text-sm ${annual ? 'font-semibold text-dark' : 'text-text'}`}>
            Annual Billing
            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              Save 20%
            </span>
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none 
              ${annual ? 'bg-gray-300' : 'bg-primary'}`}
          >
            <span
              className={`absolute w-5 h-5 rounded-full bg-white transition-transform duration-300 
                ${annual ? 'left-1' : 'left-8'} top-1`}
            />
          </button>
          <span className={`ml-4 text-sm ${!annual ? 'font-semibold text-dark' : 'text-text'}`}>
            Monthly Billing
          </span>
        </div>
      </div>
      
      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative flex flex-col h-full rounded-2xl p-8 transition-all duration-300
              ${plan.popular
                ? 'border-2 border-primary shadow-xl'
                : 'border border-border/40 shadow-md hover:shadow-lg hover:border-primary/40'
              }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-dark mb-2">{plan.name}</h3>
              <p className="text-sm text-text">{plan.description}</p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-end">
                <span className="text-5xl font-bold text-dark">${plan.price}</span>
                <span className="text-text ml-2 mb-1">/month</span>
              </div>
              <p className="text-sm text-text mt-1">
                {annual ? 'Billed annually' : 'Billed monthly'}
              </p>
            </div>
            
            <ul className="mb-10 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <FiCheck className="h-5 w-5 text-primary mt-1 mr-2" />
                  <span className="text-sm text-text">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-auto">
              <Link
                to="/signup"
                className={`w-full py-3 px-6 rounded-lg text-center font-medium transition-colors duration-300
                  ${plan.popular
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
              >
                Get Started
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* FAQ section */}
      <div className="mt-24 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-dark">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              question: 'Can I upgrade or downgrade my plan later?',
              answer: 'Yes, you can change your plan at any time. If you upgrade, you\'ll be prorated for the remainder of your billing cycle. If you downgrade, the new plan will take effect at the start of your next billing cycle.'
            },
            {
              question: 'What happens if I exceed my monthly verification limit?',
              answer: 'If you reach your verification limit, you\'ll have the option to purchase additional verifications or upgrade to a higher plan. We\'ll notify you when you\'re approaching your limit.'
            },
            {
              question: 'Is there a free trial available?',
              answer: 'Yes, we offer a 7-day free trial for all plans. No credit card required until you decide to continue with a paid plan.'
            },
            {
              question: 'Do you offer custom enterprise plans?',
              answer: 'Absolutely! For larger organizations with specific needs, we offer custom enterprise solutions. Contact our sales team to discuss your requirements.'
            }
          ].map((item, i) => (
            <div key={i} className="border-b border-border/40 pb-6">
              <h3 className="text-xl font-semibold mb-2 text-dark">{item.question}</h3>
              <p className="text-text">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 