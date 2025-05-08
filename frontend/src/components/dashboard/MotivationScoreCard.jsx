import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component that displays seller motivation score from ML analysis in a card format
 */
const MotivationScoreCard = ({ motivationData, className = '', isLoading = false }) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex items-center justify-center mb-4">
            <div className="h-28 w-28 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
        </div>
      </div>
    );
  }

  // Handle empty data
  if (!motivationData) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Seller Motivation</h3>
        <p className="text-gray-600">No motivation score data available</p>
      </div>
    );
  }

  // Destructure the motivation data
  const { 
    score, 
    motivationFactors, 
    confidenceInterval,
    calculationDate
  } = motivationData;

  // Helper function to determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 65) return 'text-orange-500';
    if (score >= 50) return 'text-yellow-500';
    if (score >= 35) return 'text-green-500';
    return 'text-blue-600';
  };

  // Helper function to determine color for progress circle
  const getProgressColor = (score) => {
    if (score >= 80) return '#dc2626'; // red-600
    if (score >= 65) return '#f97316'; // orange-500
    if (score >= 50) return '#eab308'; // yellow-500
    if (score >= 35) return '#22c55e'; // green-500
    return '#2563eb'; // blue-600
  };

  // Format date
  const formattedDate = calculationDate ? new Date(calculationDate).toLocaleDateString() : 'N/A';

  // Helper function for radial progress
  const getRadialProgressStyle = (percentage) => {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return {
      strokeDasharray: `${circumference} ${circumference}`,
      strokeDashoffset: offset,
      stroke: getProgressColor(percentage),
    };
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-red-600 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Seller Motivation Score</h3>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Score Circle */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke={getProgressColor(score)}
                strokeWidth="12"
                style={getRadialProgressStyle(score)}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {Math.round(score)}
                </span>
                <span className="text-sm text-gray-500 block">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Interpretation */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-700">
            {score >= 80 && 'Very High Motivation - Likely to Sell Quickly'}
            {score >= 65 && score < 80 && 'High Motivation - Good Opportunity'}
            {score >= 50 && score < 65 && 'Moderate Motivation - Worth Pursuing'}
            {score >= 35 && score < 50 && 'Low Motivation - May Need Convincing'}
            {score < 35 && 'Very Low Motivation - Not Likely to Sell'}
          </p>
        </div>

        {/* Top Motivation Factors */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Motivation Factors</h4>
          {motivationFactors && motivationFactors.length > 0 ? (
            <div className="space-y-2">
              {motivationFactors.slice(0, 3).map((factor, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1/2">
                    <span className="text-xs text-gray-600">{factor.name}</span>
                  </div>
                  <div className="w-1/2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          factor.impact === 'positive' ? 'bg-green-500' : 
                          factor.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${factor.importance * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                      <span>{Math.round(factor.importance * 100)}%</span>
                      <span className={`
                        ${factor.impact === 'positive' ? 'text-green-600' : 
                          factor.impact === 'negative' ? 'text-red-600' : 'text-yellow-500'}
                      `}>
                        {factor.impact}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">No motivation factors available</p>
          )}
        </div>

        {/* Confidence Interval */}
        {confidenceInterval !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Model Confidence</span>
              <span className="text-sm font-medium">
                {Math.round(confidenceInterval * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="h-1.5 rounded-full bg-blue-600"
                style={{ width: `${confidenceInterval * 100}%` }}
              ></div>
            </div>
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

MotivationScoreCard.propTypes = {
  motivationData: PropTypes.shape({
    score: PropTypes.number.isRequired,
    motivationFactors: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        importance: PropTypes.number.isRequired,
        impact: PropTypes.oneOf(['positive', 'negative', 'neutral']).isRequired
      })
    ),
    confidenceInterval: PropTypes.number,
    calculationDate: PropTypes.string
  }),
  className: PropTypes.string,
  isLoading: PropTypes.bool
};

export default MotivationScoreCard; 