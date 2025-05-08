import { FiCheckCircle } from 'react-icons/fi';

const features = [
  {
    title: 'Advanced Lead Verification',
    description: 'Verify email addresses, phone numbers, and company information with high accuracy.',
    icon: <FiCheckCircle className="h-8 w-8 text-primary" />
  },
  {
    title: 'Real-time Validation',
    description: 'Get instant results with our powerful validation engine that processes leads in real-time.',
    icon: <FiCheckCircle className="h-8 w-8 text-primary" />
  },
  {
    title: 'Data Enrichment',
    description: 'Enhance your leads with additional data points to create more comprehensive profiles.',
    icon: <FiCheckCircle className="h-8 w-8 text-primary" />
  },
  {
    title: 'Bulk Processing',
    description: 'Upload and process thousands of leads at once with our efficient batch verification system.',
    icon: <FiCheckCircle className="h-8 w-8 text-primary" />
  },
  {
    title: 'Integration Ready',
    description: 'Connect with your favorite CRM and marketing tools through our comprehensive API.',
    icon: <FiCheckCircle className="h-8 w-8 text-primary" />
  },
  {
    title: 'Detailed Analytics',
    description: 'Track verification performance and lead quality with our intuitive dashboard.',
    icon: <FiCheckCircle className="h-8 w-8 text-primary" />
  }
];

const FeaturesPage = () => {
  return (
    <div className="container-custom py-16">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-dark">Powerful Features for Lead Verification</h1>
        <p className="text-xl text-text">
          LeadVerifyPro offers a comprehensive suite of tools to ensure your leads are valid,
          accurate, and ready for your sales team.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-lg shadow-md border border-border/40 hover:border-primary/40 transition-colors duration-300"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-dark">{feature.title}</h3>
            <p className="text-text">{feature.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-20 bg-primary/5 rounded-2xl p-8 border border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-dark">Enterprise-Grade Verification</h2>
            <p className="text-lg mb-6 text-text">
              Our advanced algorithms and data sources ensure the highest verification accuracy in the industry.
              Trust LeadVerifyPro to deliver reliable results for your most important campaigns.
            </p>
            <ul className="space-y-3">
              {['99.5% Email Verification Accuracy', 'GDPR & CCPA Compliant', '24/7 Technical Support', 'Custom Validation Rules'].map((item, i) => (
                <li key={i} className="flex items-start">
                  <FiCheckCircle className="h-5 w-5 text-primary mt-1 mr-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-border/40">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-primary">Verification Score</h3>
              <span className="text-3xl font-bold text-primary">98%</span>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Email Validity', score: '99%' },
                { label: 'Phone Number Verification', score: '97%' },
                { label: 'Company Data Accuracy', score: '96%' },
                { label: 'Contact Information', score: '98%' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-text">{item.label}</span>
                    <span className="text-sm font-medium">{item.score}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: item.score }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage; 