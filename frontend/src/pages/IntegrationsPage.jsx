import { useState } from 'react';
import { FiCheckCircle, FiPlusCircle, FiLink, FiExternalLink, FiSettings } from 'react-icons/fi';

const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState('available');
  
  // Mock data for integrations
  const availableIntegrations = [
    {
      id: 1,
      name: 'Salesforce',
      icon: '/salesforce-logo.png',
      description: 'Connect your Salesforce CRM to automatically verify and update lead information.',
      category: 'CRM',
      popular: true
    },
    {
      id: 2,
      name: 'HubSpot',
      icon: '/hubspot-logo.png',
      description: 'Sync lead verification status with your HubSpot contacts and automate workflows.',
      category: 'CRM',
      popular: true
    },
    {
      id: 3,
      name: 'Zapier',
      icon: '/zapier-logo.png',
      description: 'Build custom workflows with 3,000+ apps using our Zapier integration.',
      category: 'Automation',
      popular: true
    },
    {
      id: 4,
      name: 'Mailchimp',
      icon: '/mailchimp-logo.png',
      description: 'Clean and verify your Mailchimp contact lists before sending campaigns.',
      category: 'Email Marketing',
      popular: false
    },
    {
      id: 5,
      name: 'Marketo',
      icon: '/marketo-logo.png',
      description: 'Integrate with Marketo to ensure high-quality leads in your marketing automation.',
      category: 'Marketing Automation',
      popular: false
    },
    {
      id: 6,
      name: 'Google Sheets',
      icon: '/google-sheets-logo.png',
      description: 'Verify leads directly in your Google Sheets and create automated workflows.',
      category: 'Productivity',
      popular: true
    },
    {
      id: 7,
      name: 'Shopify',
      icon: '/shopify-logo.png',
      description: 'Verify customer information from your Shopify store automatically.',
      category: 'E-commerce',
      popular: false
    },
    {
      id: 8,
      name: 'Slack',
      icon: '/slack-logo.png',
      description: 'Get notifications in Slack about verification status and important updates.',
      category: 'Communication',
      popular: false
    }
  ];
  
  const connectedIntegrations = [
    {
      id: 101,
      name: 'HubSpot',
      icon: '/hubspot-logo.png',
      status: 'Active',
      lastSync: '2023-12-15T10:30:00',
      leadsProcessed: 1243
    },
    {
      id: 102,
      name: 'Zapier',
      icon: '/zapier-logo.png',
      status: 'Active',
      lastSync: '2023-12-14T16:45:00',
      leadsProcessed: 578
    },
    {
      id: 103,
      name: 'Google Sheets',
      icon: '/google-sheets-logo.png',
      status: 'Active',
      lastSync: '2023-12-12T09:15:00',
      leadsProcessed: 320
    }
  ];
  
  const IntegrationCard = ({ integration, connected = false }) => (
    <div className="bg-white rounded-xl border border-border p-6 flex flex-col h-full transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
            <img src={integration.icon} alt={integration.name} className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-dark">{integration.name}</h3>
            {!connected && (
              <span className="text-xs text-text">{integration.category}</span>
            )}
            {connected && (
              <div className="flex items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <FiCheckCircle className="mr-1" />
                  {integration.status}
                </span>
              </div>
            )}
          </div>
        </div>
        {integration.popular && !connected && (
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
            Popular
          </span>
        )}
      </div>
      
      {!connected && (
        <p className="text-text text-sm mb-6 flex-grow">{integration.description}</p>
      )}
      
      {connected && (
        <div className="text-sm text-text mb-6 flex-grow">
          <div className="flex justify-between mb-2">
            <span>Last synced:</span>
            <span className="text-dark">
              {new Date(integration.lastSync).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Leads processed:</span>
            <span className="text-dark">{integration.leadsProcessed.toLocaleString()}</span>
          </div>
        </div>
      )}
      
      <div className="mt-auto">
        {!connected ? (
          <button className="w-full py-2 px-4 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center">
            <FiPlusCircle className="mr-2" />
            Connect
          </button>
        ) : (
          <div className="flex space-x-2">
            <button className="flex-1 py-2 px-3 border border-border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-dark text-sm">
              <FiSettings className="mr-1" />
              Configure
            </button>
            <button className="flex-1 py-2 px-3 border border-border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-dark text-sm">
              <FiLink className="mr-1" />
              Sync Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Integrations</h1>
        <p className="text-text">
          Connect LeadVerifyPro with your favorite tools and services to streamline your workflow.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-border">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'available' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text hover:text-dark hover:border-border'
              }`}
            >
              Available Integrations
            </button>
            <button
              onClick={() => setActiveTab('connected')}
              className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'connected' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text hover:text-dark hover:border-border'
              }`}
            >
              Connected ({connectedIntegrations.length})
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'api' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text hover:text-dark hover:border-border'
              }`}
            >
              API & Webhooks
            </button>
          </div>
        </div>
      </div>
      
      {activeTab === 'available' && (
        <div>
          {/* Search and filters */}
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search integrations..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex space-x-3">
              <select className="border border-border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                <option value="">All Categories</option>
                <option value="crm">CRM</option>
                <option value="marketing">Marketing</option>
                <option value="automation">Automation</option>
                <option value="productivity">Productivity</option>
                <option value="ecommerce">E-commerce</option>
                <option value="communication">Communication</option>
              </select>
              
              <select className="border border-border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                <option value="">Sort By: Popular</option>
                <option value="name">Name (A-Z)</option>
                <option value="category">Category</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
          
          {/* Integration cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'connected' && (
        <div>
          {connectedIntegrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectedIntegrations.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} connected={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FiLink className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-dark mb-2">No Connected Integrations</h3>
              <p className="text-text max-w-md mx-auto mb-6">
                You haven't connected any integrations yet. Browse our available integrations to get started.
              </p>
              <button 
                onClick={() => setActiveTab('available')}
                className="py-2 px-6 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Integrations
              </button>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'api' && (
        <div className="space-y-8">
          {/* API Keys */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold text-dark mb-6">API Keys</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium text-dark">Production API Key</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="password"
                    value="lpv_live_pQnRsWlvIjKlMnOpqRsTuVwXyZ123456"
                    readOnly
                    className="flex-grow border border-border rounded-l-lg p-2 bg-gray-50"
                  />
                  <button className="bg-primary text-white px-4 py-2 rounded-r-lg font-medium hover:bg-primary/90 transition-colors">
                    Show
                  </button>
                </div>
                <p className="text-sm text-text mt-1">
                  Use this key in production. Keep it secure and don't share it publicly.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-medium text-dark">Test API Key</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Test Mode
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="password"
                    value="lpv_test_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456"
                    readOnly
                    className="flex-grow border border-border rounded-l-lg p-2 bg-gray-50"
                  />
                  <button className="bg-primary text-white px-4 py-2 rounded-r-lg font-medium hover:bg-primary/90 transition-colors">
                    Show
                  </button>
                </div>
                <p className="text-sm text-text mt-1">
                  Use this key for testing. No charges will be applied for verifications with this key.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button className="border border-border px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Generate New Key
                </button>
                <button className="border border-border px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Revoke All Keys
                </button>
              </div>
            </div>
          </div>
          
          {/* Webhooks */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold text-dark mb-6">Webhooks</h2>
            
            <p className="text-text mb-4">
              Webhooks allow you to receive real-time updates about verification events to your application.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-dark mb-2">Endpoint URL</h3>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="https://your-app.com/webhooks/lead-verify"
                    className="flex-grow border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>
                <p className="text-sm text-text mt-1">
                  We'll send POST requests to this URL when verification events occur.
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-dark mb-2">Events to Send</h3>
                <div className="space-y-2">
                  {['verification.completed', 'verification.failed', 'lead.updated', 'lead.deleted'].map((event, index) => (
                    <label key={index} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded text-primary focus:ring-primary"
                        defaultChecked={index < 2} 
                      />
                      <span className="ml-2 text-text">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                <button className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Save Webhook Configuration
                </button>
              </div>
            </div>
          </div>
          
          {/* API Documentation */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold text-dark mb-4">API Documentation</h2>
            
            <p className="text-text mb-6">
              Learn how to integrate LeadVerifyPro with your applications using our comprehensive API docs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Quick Start Guide',
                  description: 'Get up and running with the LeadVerifyPro API in minutes.',
                  link: '#'
                },
                {
                  title: 'API Reference',
                  description: 'Complete documentation of all API endpoints and parameters.',
                  link: '#'
                },
                {
                  title: 'Code Examples',
                  description: 'Sample code in various languages to help you integrate faster.',
                  link: '#'
                }
              ].map((resource, index) => (
                <a 
                  key={index} 
                  href={resource.link}
                  className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-medium text-dark mb-2">{resource.title}</h3>
                  <p className="text-text mb-3">{resource.description}</p>
                  <div className="text-primary font-medium flex items-center">
                    View Documentation
                    <FiExternalLink className="ml-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage; 