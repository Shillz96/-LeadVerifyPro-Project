import { useState } from 'react';
import { FiCheck, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: 'month',
    description: 'Perfect for small businesses and entrepreneurs',
    features: [
      '500 lead verifications per month',
      'Basic email validation',
      'CSV exports',
      'Email support',
    ],
    popular: false,
    buttonText: 'Start with Starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    period: 'month',
    description: 'For growing teams with advanced needs',
    features: [
      '2,500 lead verifications per month',
      'Advanced validation algorithms',
      'Phone number verification',
      'API access',
      'Priority support',
      'Team collaboration (up to 3 users)',
    ],
    popular: true,
    buttonText: 'Go Professional',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    period: 'month',
    description: 'For large businesses with custom requirements',
    features: [
      '10,000 lead verifications per month',
      'Custom validation rules',
      'Dedicated account manager',
      'Advanced analytics',
      'Custom integrations',
      'Team collaboration (unlimited users)',
      'SLA guarantees',
    ],
    popular: false,
    buttonText: 'Contact Sales',
  },
];

const SubscriptionPage = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [currentPlan, setCurrentPlan] = useState('professional');

  // Get discount factor based on billing period
  const getDiscountFactor = () => {
    return billingPeriod === 'yearly' ? 0.8 : 1; // 20% discount for yearly
  };

  // Calculate price with discount
  const getPrice = (basePrice) => {
    return Math.round(basePrice * getDiscountFactor());
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. Upgrade or downgrade anytime.
        </p>

        <div className="mt-8 inline-flex items-center p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md ${
              billingPeriod === 'monthly'
                ? 'bg-white shadow-md text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md flex items-center ${
              billingPeriod === 'yearly'
                ? 'bg-white shadow-md text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Annual Billing
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg overflow-hidden ${
              plan.popular
                ? 'border-2 border-primary shadow-xl transform md:-translate-y-4'
                : 'border border-gray-200 shadow-lg'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-white py-1 px-4 text-sm">
                Most Popular
              </div>
            )}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-gray-600">{plan.description}</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">
                  ${getPrice(plan.price)}
                </span>
                <span className="ml-1 text-xl font-medium text-gray-500">
                  /{billingPeriod === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {billingPeriod === 'yearly' && (
                <p className="mt-1 text-sm text-green-600">
                  Billed annually (${getPrice(plan.price) * 12})
                </p>
              )}
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <FiCheck className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">{feature}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.id === 'enterprise' ? (
                  <Link
                    to="/contact"
                    className={`block w-full py-3 px-4 rounded-md text-center font-medium ${
                      plan.popular
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                ) : (
                  <Link
                    to="/checkout"
                    className={`block w-full py-3 px-4 rounded-md text-center font-medium ${
                      plan.popular
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gray-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <FiInfo className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-xl font-medium text-gray-900">Need a custom plan?</h3>
            <p className="mt-2 text-gray-600">
              If you need more verifications or have specific requirements, our team can create a
              custom plan tailored to your business needs.
            </p>
            <div className="mt-4">
              <Link
                to="/contact"
                className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                Contact our sales team
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Can I change plans later?</h3>
            <p className="mt-2 text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new
              pricing will be prorated for the remainder of your billing cycle.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">
              What happens if I exceed my monthly limit?
            </h3>
            <p className="mt-2 text-gray-600">
              If you reach your monthly verification limit, you can purchase additional verifications
              or upgrade to a higher tier plan that includes more verifications.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Do you offer refunds?</h3>
            <p className="mt-2 text-gray-600">
              We offer a 14-day money-back guarantee if you're not satisfied with our service. After
              that period, refunds are reviewed on a case-by-case basis.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">
              How accurate is the lead verification?
            </h3>
            <p className="mt-2 text-gray-600">
              Our verification algorithms achieve 97%+ accuracy across email, phone, and company
              validation. We continuously improve our techniques to maintain high accuracy rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage; 