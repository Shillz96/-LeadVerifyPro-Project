import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * API Documentation component for displaying API endpoints and usage
 */
const ApiDocumentation = ({ endpoints, title, description }) => {
  const [activeEndpoint, setActiveEndpoint] = useState(endpoints[0]?.id || '');

  // Find the currently active endpoint
  const currentEndpoint = endpoints.find(endpoint => endpoint.id === activeEndpoint) || endpoints[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header section */}
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">{title || 'API Documentation'}</h2>
        {description && <p className="mt-2 text-gray-600">{description}</p>}
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar with endpoint list */}
        <div className="w-full md:w-1/4 border-r border-gray-200 bg-gray-50">
          <nav className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Endpoints
            </h3>
            <ul className="space-y-1">
              {endpoints.map(endpoint => (
                <li key={endpoint.id}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeEndpoint === endpoint.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveEndpoint(endpoint.id)}
                    aria-current={activeEndpoint === endpoint.id ? 'page' : undefined}
                  >
                    <span className={`mr-2 font-mono ${methodColors[endpoint.method] || 'text-gray-600'}`}>
                      {endpoint.method}
                    </span>
                    <span className="truncate">{endpoint.path}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main content area with endpoint details */}
        <div className="w-full md:w-3/4 p-6">
          {currentEndpoint && (
            <div>
              <div className="flex items-center mb-6">
                <span 
                  className={`inline-block px-2 py-1 rounded text-xs font-bold mr-3 ${
                    methodColors[currentEndpoint.method] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {currentEndpoint.method}
                </span>
                <h3 className="text-lg font-mono text-gray-800">{currentEndpoint.path}</h3>
              </div>

              {currentEndpoint.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600">{currentEndpoint.description}</p>
                </div>
              )}

              {/* Authentication */}
              {currentEndpoint.authentication && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Authentication</h4>
                  <p className="text-gray-600">{currentEndpoint.authentication}</p>
                </div>
              )}

              {/* Request Parameters */}
              {currentEndpoint.parameters && currentEndpoint.parameters.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Required
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentEndpoint.parameters.map((param, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm font-mono text-gray-900">{param.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{param.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {param.required ? 'Yes' : 'No'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Request Body */}
              {currentEndpoint.requestBody && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Body</h4>
                  <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <code className="text-sm text-gray-800">
                      {JSON.stringify(currentEndpoint.requestBody, null, 2)}
                    </code>
                  </pre>
                </div>
              )}

              {/* Response */}
              {currentEndpoint.response && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Response</h4>
                  <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <code className="text-sm text-gray-800">
                      {JSON.stringify(currentEndpoint.response, null, 2)}
                    </code>
                  </pre>
                </div>
              )}

              {/* Status Codes */}
              {currentEndpoint.statusCodes && currentEndpoint.statusCodes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Status Codes</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentEndpoint.statusCodes.map((status, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm font-mono text-gray-900">{status.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{status.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Example */}
              {currentEndpoint.example && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Example</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="overflow-x-auto">
                      <code className="text-sm text-gray-800">
                        {currentEndpoint.example}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Colors for different HTTP methods
const methodColors = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  PATCH: 'bg-orange-100 text-orange-800',
  DELETE: 'bg-red-100 text-red-800'
};

ApiDocumentation.propTypes = {
  endpoints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      method: PropTypes.oneOf(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).isRequired,
      path: PropTypes.string.isRequired,
      description: PropTypes.string,
      authentication: PropTypes.string,
      parameters: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          required: PropTypes.bool.isRequired,
          description: PropTypes.string
        })
      ),
      requestBody: PropTypes.object,
      response: PropTypes.object,
      statusCodes: PropTypes.arrayOf(
        PropTypes.shape({
          code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          description: PropTypes.string.isRequired
        })
      ),
      example: PropTypes.string
    })
  ).isRequired,
  title: PropTypes.string,
  description: PropTypes.string
};

export default ApiDocumentation; 