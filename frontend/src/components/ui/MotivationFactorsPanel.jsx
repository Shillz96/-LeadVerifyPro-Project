import React from 'react';
import PropTypes from 'prop-types';

/**
 * Displays seller motivation score and contributing factors
 */
const MotivationFactorsPanel = ({ factors, score = 0, confidenceInterval = 0 }) => {
  // Sort factors by importance (descending)
  const sortedFactors = factors ? 
    [...factors].sort((a, b) => b.importance - a.importance) : [];
  
  // Color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-blue-600';
  };
  
  const scoreColor = getScoreColor(score);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Seller Motivation Score</h3>
        <div className="flex flex-col items-end">
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {score ? score.toFixed(1) : 'N/A'}<span className="text-sm">/100</span>
          </div>
          {confidenceInterval > 0 && (
            <div className="text-xs text-gray-500">
              ±{(confidenceInterval * 100).toFixed(1)}% confidence
            </div>
          )}
        </div>
      </div>
      
      {/* Motivation Score Gauge */}
      <div className="relative h-4 w-full bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div 
          className={`h-4 rounded-full ${
            score >= 80 ? 'bg-red-500' :
            score >= 60 ? 'bg-orange-500' :
            score >= 40 ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${score}%` }}
        ></div>
        
        <div className="absolute top-0 left-0 w-full flex justify-between text-xs text-gray-600 px-1 pt-5">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>
      </div>
      
      {/* Motivation Level Description */}
      <div className="mb-6 text-sm">
        {score >= 80 && (
          <div className="p-2 bg-red-50 text-red-700 rounded">
            <strong>High motivation detected.</strong> The seller shows multiple strong indicators 
            of motivation to sell quickly and may be receptive to below-market offers.
          </div>
        )}
        {score >= 60 && score < 80 && (
          <div className="p-2 bg-orange-50 text-orange-700 rounded">
            <strong>Moderate-high motivation detected.</strong> The seller shows several indicators
            of motivation and may be open to reasonable offers.
          </div>
        )}
        {score >= 40 && score < 60 && (
          <div className="p-2 bg-yellow-50 text-yellow-700 rounded">
            <strong>Moderate motivation detected.</strong> The seller shows some motivation
            indicators but may not be in a rush to sell.
          </div>
        )}
        {score < 40 && (
          <div className="p-2 bg-blue-50 text-blue-700 rounded">
            <strong>Low motivation detected.</strong> Few indicators of motivation are present.
            The seller may not be receptive to below-market offers.
          </div>
        )}
      </div>
      
      {/* Motivation Factors */}
      {sortedFactors.length > 0 ? (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Key Motivation Factors</h4>
          <ul className="space-y-3">
            {sortedFactors.map((factor, index) => (
              <li key={index} className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{factor.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">
                      {(factor.importance * 100).toFixed(0)}%
                    </span>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      factor.impact === 'positive' ? 'bg-green-100 text-green-800' : 
                      factor.impact === 'negative' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      factor.impact === 'positive' ? 'bg-green-500' : 
                      factor.impact === 'negative' ? 'bg-red-500' : 
                      'bg-gray-500'
                    }`} 
                    style={{ width: `${factor.importance * 100}%` }}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 italic text-center py-4">No motivation factors detected</p>
      )}
    </div>
  );
};

MotivationFactorsPanel.propTypes = {
  factors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      importance: PropTypes.number.isRequired,
      impact: PropTypes.oneOf(['positive', 'negative', 'neutral'])
    })
  ),
  score: PropTypes.number,
  confidenceInterval: PropTypes.number
};

export default MotivationFactorsPanel; 