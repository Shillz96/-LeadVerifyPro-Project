import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component that displays property condition analysis results in a card format
 */
const PropertyConditionCard = ({ conditionData, className = '', isLoading = false }) => {
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
  if (!conditionData) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Property Condition</h3>
        <p className="text-gray-600">No property condition data available</p>
      </div>
    );
  }

  // Destructure the condition data
  const { 
    condition, 
    vacancyIndicators, 
    repairNeeds, 
    improvementPotential,
    analysisDate 
  } = conditionData;

  // Helper function to determine color based on condition score
  const getConditionColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-600';
  };

  // Helper function to determine color based on vacancy probability
  const getVacancyColor = (probability) => {
    switch (probability) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format date
  const formattedDate = analysisDate ? new Date(analysisDate).toLocaleDateString() : 'N/A';

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Property Condition Analysis</h3>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Condition Score */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Overall Condition</span>
            <span className={`font-semibold ${getConditionColor(condition.score)}`}>
              {condition.rating.charAt(0).toUpperCase() + condition.rating.slice(1).replace('_', ' ')}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${condition.score >= 80 ? 'bg-green-600' : 
                condition.score >= 60 ? 'bg-green-500' : 
                condition.score >= 40 ? 'bg-yellow-500' : 
                condition.score >= 20 ? 'bg-orange-500' : 'bg-red-600'}`}
              style={{ width: `${condition.score}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Vacancy Indicators */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Vacancy Probability</span>
            <span className={`font-semibold ${getVacancyColor(vacancyIndicators.probability)}`}>
              {vacancyIndicators.probability.charAt(0).toUpperCase() + vacancyIndicators.probability.slice(1)}
            </span>
          </div>
          {vacancyIndicators.indicators.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Indicators:</p>
              <ul className="text-xs text-gray-700 list-disc pl-4">
                {vacancyIndicators.indicators.map((indicator, index) => (
                  <li key={index} className="capitalize">{indicator}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Repair Needs */}
        {repairNeeds.items.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Repair Needs</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {repairNeeds.items.map((item, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded capitalize"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-600">
              <span>Estimated Cost: </span>
              <span className="font-medium">
                ${repairNeeds.estimatedCost.min.toLocaleString()} - ${repairNeeds.estimatedCost.max.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Improvement Potential */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Improvement Potential</h4>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="h-2.5 rounded-full bg-blue-600"
                style={{ width: `${improvementPotential.score}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-700">{improvementPotential.score}%</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            <span>Potential ROI: </span>
            <span className="font-medium">
              ${improvementPotential.roi.low.toLocaleString()} - ${improvementPotential.roi.high.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer with analysis date */}
        <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-200">
          Analysis Date: {formattedDate}
        </div>
      </div>
    </div>
  );
};

PropertyConditionCard.propTypes = {
  conditionData: PropTypes.shape({
    condition: PropTypes.shape({
      score: PropTypes.number.isRequired,
      rating: PropTypes.string.isRequired,
      confidence: PropTypes.number
    }).isRequired,
    vacancyIndicators: PropTypes.shape({
      probability: PropTypes.string.isRequired,
      confidence: PropTypes.number,
      indicators: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    repairNeeds: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.string),
      estimatedCost: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number,
        currency: PropTypes.string
      }),
      priorityLevel: PropTypes.string
    }).isRequired,
    improvementPotential: PropTypes.shape({
      score: PropTypes.number.isRequired,
      roi: PropTypes.shape({
        low: PropTypes.number,
        high: PropTypes.number
      })
    }).isRequired,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    analysisDate: PropTypes.string
  }),
  className: PropTypes.string,
  isLoading: PropTypes.bool
};

export default PropertyConditionCard; 