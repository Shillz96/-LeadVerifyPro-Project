import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component that displays document analysis results from NLP in a card format
 */
const DocumentAnalysisCard = ({ documentData, className = '', isLoading = false }) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
          <div className="h-40 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Handle empty data
  if (!documentData) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Document Analysis</h3>
        <p className="text-gray-600">No document analysis data available</p>
      </div>
    );
  }

  // Destructure the document data
  const { 
    legalStatus, 
    financialIndicators, 
    motivationTerms, 
    sentiment,
    legalIssuesProbability,
    documentCount,
    analysisDate 
  } = documentData;
  
  // Helper function to determine sentiment color
  const getSentimentColor = (sentimentValue) => {
    if (sentimentValue >= 0.5) return 'text-green-600';
    if (sentimentValue >= 0) return 'text-green-500';
    if (sentimentValue >= -0.5) return 'text-yellow-500';
    return 'text-red-600';
  };
  
  // Helper function to get text for sentiment
  const getSentimentText = (sentimentValue) => {
    if (sentimentValue >= 0.5) return 'Very Positive';
    if (sentimentValue >= 0) return 'Positive';
    if (sentimentValue >= -0.5) return 'Neutral';
    if (sentimentValue >= -0.8) return 'Negative';
    return 'Very Negative';
  };

  // Format date
  const formattedDate = analysisDate ? new Date(analysisDate).toLocaleDateString() : 'N/A';

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-purple-600 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Document Analysis</h3>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Legal Status */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Legal Status</h4>
          {legalStatus && legalStatus.length > 0 ? (
            <ul className="space-y-1">
              {legalStatus.map((status, index) => (
                <li 
                  key={index} 
                  className="text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-800"
                >
                  {status}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600 italic">No legal issues detected</p>
          )}
        </div>

        {/* Legal Issues Probability */}
        {legalIssuesProbability !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Legal Issues Probability</span>
              <span className={`font-semibold ${legalIssuesProbability > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                {Math.round(legalIssuesProbability * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${legalIssuesProbability > 0.7 ? 'bg-red-600' : 
                  legalIssuesProbability > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${legalIssuesProbability * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Financial Indicators */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Indicators</h4>
          {financialIndicators && financialIndicators.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {financialIndicators.map((indicator, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md"
                >
                  {indicator}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">No financial indicators detected</p>
          )}
        </div>

        {/* Motivation Terms */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Motivation Keywords</h4>
          {motivationTerms && motivationTerms.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {motivationTerms.map((term, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md"
                >
                  {term}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">No motivation keywords detected</p>
          )}
        </div>

        {/* Document Sentiment */}
        {sentiment !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Document Sentiment</span>
              <span className={`font-semibold ${getSentimentColor(sentiment)}`}>
                {getSentimentText(sentiment)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className={`h-2.5 rounded-full ${
                  sentiment >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.abs(sentiment * 100) + 50)}%`,
                  marginLeft: sentiment < 0 ? 0 : '50%',
                  marginRight: sentiment >= 0 ? 0 : '50%',
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
          </div>
        )}

        {/* Document Count */}
        {documentCount !== undefined && (
          <div className="text-sm text-gray-600 mb-2">
            Analysis based on {documentCount} document{documentCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Footer with analysis date */}
        <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-200">
          Analysis Date: {formattedDate}
        </div>
      </div>
    </div>
  );
};

DocumentAnalysisCard.propTypes = {
  documentData: PropTypes.shape({
    legalStatus: PropTypes.arrayOf(PropTypes.string),
    financialIndicators: PropTypes.arrayOf(PropTypes.string),
    motivationTerms: PropTypes.arrayOf(PropTypes.string),
    sentiment: PropTypes.number,
    legalIssuesProbability: PropTypes.number,
    documentCount: PropTypes.number,
    analysisDate: PropTypes.string
  }),
  className: PropTypes.string,
  isLoading: PropTypes.bool
};

export default DocumentAnalysisCard; 