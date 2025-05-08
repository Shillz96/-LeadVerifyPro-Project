import { useState } from 'react';
import { FiUpload, FiCheckCircle, FiAlertCircle, FiFile, FiTrash2 } from 'react-icons/fi';
import { leadsApi } from '../utils/api';

const VerifyPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setVerificationComplete(false);
      setVerificationResults(null);
      setUploadError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setVerificationComplete(false);
      setVerificationResults(null);
      setUploadError(null);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setVerificationComplete(false);
    setVerificationResults(null);
    setUploadError(null);
  };

  const verifyLeads = async () => {
    if (!uploadedFile) return;
    
    setIsVerifying(true);
    setUploadError(null);
    
    try {
      // First upload the file
      const uploadResult = await leadsApi.uploadLeads(uploadedFile);
      
      if (uploadResult && uploadResult.leadIds && uploadResult.leadIds.length > 0) {
        // Then verify the uploaded leads
        const verifyResult = await leadsApi.verifyLeads(uploadResult.leadIds);
        
        setVerificationResults(verifyResult);
        setVerificationComplete(true);
      } else {
        setUploadError('No leads were found in the uploaded file.');
      }
    } catch (error) {
      console.error('Lead verification error:', error);
      setUploadError(error.response?.data?.message || 'Failed to verify leads. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload File' },
    { id: 'paste', label: 'Paste Data' },
    { id: 'api', label: 'API Integration' }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Lead Verification</h1>
        <p className="text-text">
          Verify your lead data against our comprehensive database to ensure accuracy and validity.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-border">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-text hover:text-dark hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Show error message if any */}
      {uploadError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <span>{uploadError}</span>
          </div>
        </div>
      )}
      
      {activeTab === 'upload' && (
        <>
          {/* File Upload Section */}
          {!verificationComplete && (
            <div className="mb-8">
              <div 
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                />
                {!uploadedFile ? (
                  <div>
                    <FiUpload className="h-12 w-12 mx-auto text-text mb-4" />
                    <h3 className="text-lg font-medium text-dark mb-1">
                      Drag and drop your file here
                    </h3>
                    <p className="text-text mb-4">
                      or click to browse (CSV, Excel)
                    </p>
                    <button className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors">
                      Select File
                    </button>
                  </div>
                ) : (
                  <div>
                    <FiFile className="h-12 w-12 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-medium text-dark mb-1">
                      {uploadedFile.name}
                    </h3>
                    <p className="text-text mb-4">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <div className="flex justify-center space-x-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center"
                      >
                        <FiTrash2 className="mr-2" />
                        Remove
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          verifyLeads();
                        }}
                        disabled={isVerifying}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center disabled:opacity-70"
                      >
                        {isVerifying ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <FiCheckCircle className="mr-2" />
                            Verify Leads
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Options and settings for verification */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-medium text-dark mb-4">Verification Options</h3>
                  <div className="space-y-3">
                    {['Email verification', 'Phone number validation', 'Name formatting', 'Remove duplicates', 'Company data validation'].map((option, index) => (
                      <label key={index} className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded text-primary focus:ring-primary"
                          defaultChecked 
                        />
                        <span className="ml-2 text-text">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-medium text-dark mb-4">File Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">
                        First Row Contains Headers
                      </label>
                      <select className="w-full border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">
                        Output Format
                      </label>
                      <select className="w-full border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none">
                        <option value="csv">CSV</option>
                        <option value="xlsx">Excel (XLSX)</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Verification Results */}
          {verificationComplete && verificationResults && (
            <div className="space-y-8">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-border p-6">
                  <h3 className="text-lg font-medium text-dark mb-4">Total Leads</h3>
                  <p className="text-3xl font-bold text-dark">{verificationResults.totalLeads}</p>
                </div>
                <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                  <h3 className="text-lg font-medium text-green-800 mb-4">Valid Leads</h3>
                  <p className="text-3xl font-bold text-green-700">{verificationResults.validLeads}</p>
                  <p className="text-green-600 text-sm mt-1">
                    {Math.round((verificationResults.validLeads / verificationResults.totalLeads) * 100)}% of total
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                  <h3 className="text-lg font-medium text-red-800 mb-4">Invalid Leads</h3>
                  <p className="text-3xl font-bold text-red-700">{verificationResults.invalidLeads}</p>
                  <p className="text-red-600 text-sm mt-1">
                    {Math.round((verificationResults.invalidLeads / verificationResults.totalLeads) * 100)}% of total
                  </p>
                </div>
              </div>
              
              {/* Detailed breakdown */}
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="text-lg font-medium text-dark mb-6">Verification Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Valid Emails', value: verificationResults.categories.validEmail, color: 'bg-green-100 text-green-800' },
                    { label: 'Invalid Emails', value: verificationResults.categories.invalidEmail, color: 'bg-red-100 text-red-800' },
                    { label: 'Valid Phones', value: verificationResults.categories.validPhone, color: 'bg-green-100 text-green-800' },
                    { label: 'Invalid Phones', value: verificationResults.categories.invalidPhone, color: 'bg-red-100 text-red-800' },
                    { label: 'Duplicates', value: verificationResults.categories.duplicates, color: 'bg-yellow-100 text-yellow-800' }
                  ].map((item, index) => (
                    <div key={index} className={`${item.color} rounded-lg p-4 text-center`}>
                      <p className="text-2xl font-bold">{item.value}</p>
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Sample results table */}
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-dark mb-2">Sample Results</h3>
                  <p className="text-text mb-4">Showing 5 of {verificationResults.totalLeads} leads</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-background">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                          Phone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                      {verificationResults.sampleLeads.map((lead) => (
                        <tr key={lead.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">
                            {lead.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                            {lead.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                            {lead.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {lead.status === 'valid' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FiCheckCircle className="mr-1" />
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <FiAlertCircle className="mr-1" />
                                Invalid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Download Full Results
                </button>
                <button className="bg-white text-dark border border-border px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Save to Verified Leads
                </button>
                <button 
                  onClick={() => {
                    setVerificationComplete(false);
                    setVerificationResults(null);
                    setUploadedFile(null);
                  }}
                  className="bg-white text-dark border border-border px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Verify New File
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {activeTab === 'paste' && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-lg font-medium text-dark mb-4">Paste Lead Data</h3>
          <p className="text-text mb-6">
            Paste your lead data in CSV format or comma-separated values.
          </p>
          <textarea
            className="w-full h-64 border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none font-mono text-sm"
            placeholder="name,email,phone&#10;John Smith,john@example.com,(555) 123-4567&#10;Jane Doe,jane@example.com,(555) 987-6543"
          ></textarea>
          <div className="flex justify-end mt-4">
            <button className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Verify Data
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'api' && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-lg font-medium text-dark mb-4">API Integration</h3>
          <p className="text-text mb-6">
            Use our API to integrate lead verification directly into your applications.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6 font-mono text-sm overflow-x-auto">
            <pre>
              {`curl -X POST https://api.leadverifypro.com/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "leads": [
      {
        "email": "contact@example.com",
        "phone": "+15551234567",
        "name": "John Smith",
        "company": "Example Inc."
      }
    ]
  }'`}
            </pre>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-medium text-dark mb-2">Your API Key</h4>
              <div className="flex items-center">
                <input
                  type="password"
                  // TODO: Load Stripe publishable key from environment variables
                  // value={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY} 
                  className="flex-grow border border-border rounded-l-lg p-2 bg-gray-50"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-r-lg font-medium hover:bg-primary/90 transition-colors">
                  Show
                </button>
              </div>
              <p className="text-sm text-text mt-1">
                Keep your API key secure. You can regenerate it in your account settings.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-dark mb-2">API Documentation</h4>
              <a
                href="#"
                className="text-primary hover:text-primary/80 flex items-center"
              >
                <span>View Complete API Documentation</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyPage; 