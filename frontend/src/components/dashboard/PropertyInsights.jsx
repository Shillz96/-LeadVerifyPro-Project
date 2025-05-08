import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { propertyAnalysisApi, leadsApi } from '../../utils/api';
import PropertyConditionCard from './PropertyConditionCard';
import MotivationFactorsPanel from '../ui/MotivationFactorsPanel';
import NeighborhoodTrendsChart from '../ui/NeighborhoodTrendsChart';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

/**
 * Component that displays comprehensive AI-powered property insights
 */
const PropertyInsights = ({ leadId, address, className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('condition');
  const [refreshKey, setRefreshKey] = useState(0);

  // Tabs configuration
  const tabs = [
    { id: 'condition', label: 'Condition' },
    { id: 'motivation', label: 'Motivation' },
    { id: 'neighborhood', label: 'Location' },
    { id: 'investment', label: 'Investment' },
  ];

  // Fetch AI insights
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!leadId) {
          throw new Error('Lead ID is required');
        }
        
        // Fetch comprehensive property insights
        const response = await leadsApi.getPropertyInsights(leadId);
        
        if (response.success) {
          setInsights(response.data);
        } else {
          // If no existing insights, we'll need to generate them
          await generateInsights();
        }
      } catch (err) {
        console.error('Error fetching property insights:', err);
        setError('Unable to load property insights. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [leadId, refreshKey]);

  // Function to generate all insights
  const generateInsights = async () => {
    try {
      setLoading(true);
      
      // Step 1: Generate property condition insights
      const conditionResponse = await propertyAnalysisApi.assessPropertyCondition({
        leadId,
        propertyAddress: address,
        forceRefresh: true
      });

      // Step 2: Generate motivation score
      const motivationResponse = await leadsApi.getMotivationScore(leadId);
      
      // Step 3: Get neighborhood trends
      const neighborhoodResponse = await leadsApi.getNeighborhoodTrends(leadId);
      
      // Step 4: Calculate investment potential
      const investmentResponse = await leadsApi.getInvestmentScore(leadId);
      
      // Combine all insights
      setInsights({
        propertyCondition: conditionResponse.data.analysis.condition,
        vacancyIndicators: conditionResponse.data.analysis.vacancyIndicators,
        repairNeeds: conditionResponse.data.analysis.repairNeeds,
        score: motivationResponse.data.score,
        confidenceInterval: motivationResponse.data.confidenceInterval,
        motivationFactors: motivationResponse.data.motivationFactors,
        neighborhoodTrends: neighborhoodResponse.data.trends,
        investmentMetrics: investmentResponse.data.investmentMetrics,
        opportunityScore: investmentResponse.data.opportunityScore,
        neighborhoodFactors: investmentResponse.data.neighborhoodFactors
      });
      
    } catch (err) {
      console.error('Error generating insights:', err);
      setError('Failed to generate property insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for refresh button
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`${className} flex flex-col items-center justify-center p-8`}>
        <LoadingSpinner size="large" />
        <p className="text-gray-500 mt-4">Generating property insights...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={className}>
        <ErrorAlert message={error}>
          <button 
            onClick={handleRefresh}
            className="ml-2 text-blue-600 underline"
          >
            Try Again
          </button>
        </ErrorAlert>
      </div>
    );
  }

  // Render insights
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Property Insights</h2>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="text-sm px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
        >
          Refresh Analysis
        </button>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8" aria-label="Property insights tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="mt-4">
        {/* Condition Tab */}
        {activeTab === 'condition' && insights?.propertyCondition && (
          <div className="space-y-6">
            <PropertyConditionCard
              condition={insights.propertyCondition}
              vacancyIndicators={insights.vacancyIndicators}
              repairNeeds={insights.repairNeeds}
            />
            
            {/* Visual Evidence Section */}
            {insights.propertyImages && insights.propertyImages.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Visual Evidence</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {insights.propertyImages.slice(0, 6).map((image, index) => (
                    <div key={index} className="aspect-video relative rounded overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={`Property evidence ${index + 1}`} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Motivation Tab */}
        {activeTab === 'motivation' && insights?.motivationFactors && (
          <div className="space-y-6">
            <MotivationFactorsPanel
              factors={insights.motivationFactors}
              score={insights.score}
              confidenceInterval={insights.confidenceInterval}
            />
            
            {/* Legal Status Section - if available */}
            {insights.legalStatus && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Legal Status</h3>
                <div className="space-y-2">
                  {Object.entries(insights.legalStatus).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                      <span className={`font-medium ${
                        value.detected ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {value.detected ? 'Detected' : 'Not Detected'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Neighborhood Tab */}
        {activeTab === 'neighborhood' && (
          <div className="space-y-6">
            <NeighborhoodTrendsChart 
              data={insights.neighborhoodTrends} 
            />
            
            {/* Amenity Scores */}
            {insights.neighborhoodFactors?.amenities && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Proximity Score</h3>
                <div className="flex items-center mb-3">
                  <div className="text-2xl font-bold">
                    {insights.neighborhoodFactors.amenities.overallScore}
                    <span className="text-sm">/100</span>
                  </div>
                  <div className="ml-2 text-sm text-gray-600">
                    Walk Score: {insights.neighborhoodFactors.amenities.walkscore}
                  </div>
                </div>
                
                {/* Amenity breakdown */}
                <div className="space-y-3 mt-4">
                  {insights.neighborhoodFactors.amenities.amenities && 
                   Object.entries(insights.neighborhoodFactors.amenities.amenities).map(([type, data]) => (
                    <div key={type} className="flex items-center">
                      <span className="w-32 text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${data.score}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-3 text-sm font-medium w-8 text-right">{data.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* School Ratings */}
            {insights.neighborhoodFactors?.schools && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">School Ratings</h3>
                <div className="text-2xl font-bold mb-3">
                  {insights.neighborhoodFactors.schools.averageRating}
                  <span className="text-sm">/10</span>
                </div>
                
                <div className="space-y-2">
                  {insights.neighborhoodFactors.schools.nearestSchools &&
                   insights.neighborhoodFactors.schools.nearestSchools.map((school, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{school.name}</div>
                        <div className="text-sm text-gray-600">{(school.distance / 1000).toFixed(1)} km away</div>
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">
                        {school.rating}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Investment Tab */}
        {activeTab === 'investment' && insights?.investmentMetrics && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Investment Potential</h3>
                <div className="text-2xl font-bold text-blue-600">
                  {insights.opportunityScore}
                  <span className="text-sm">/100</span>
                </div>
              </div>
              
              {/* Key investment metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-600">Potential Equity</div>
                  <div className="text-lg font-semibold">
                    ${insights.investmentMetrics.potentialEquity.toLocaleString()}
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-600">ROI</div>
                  <div className="text-lg font-semibold">
                    {insights.investmentMetrics.roi.toFixed(1)}%
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-600">Cash on Cash Return</div>
                  <div className="text-lg font-semibold">
                    {insights.investmentMetrics.cashOnCashReturn.toFixed(1)}%
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-600">Cap Rate</div>
                  <div className="text-lg font-semibold">
                    {insights.investmentMetrics.capRate.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* Neighborhood trend */}
              <div className="mt-6">
                <div className="flex items-center">
                  <div className="text-sm text-gray-600">Neighborhood Trend</div>
                  <div className={`ml-2 px-2 py-1 text-sm font-medium rounded ${
                    insights.investmentMetrics.neighborhood.direction === "increasing" ? "bg-green-100 text-green-800" :
                    insights.investmentMetrics.neighborhood.direction === "decreasing" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {insights.investmentMetrics.neighborhood.direction.charAt(0).toUpperCase() + 
                      insights.investmentMetrics.neighborhood.direction.slice(1)}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`${
                      insights.investmentMetrics.neighborhood.direction === "increasing" ? "bg-green-500" :
                      insights.investmentMetrics.neighborhood.direction === "decreasing" ? "bg-red-500" :
                      "bg-yellow-500"
                    } h-2 rounded-full`}
                    style={{ width: `${insights.investmentMetrics.neighborhood.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PropertyInsights.propTypes = {
  leadId: PropTypes.string.isRequired,
  address: PropTypes.string,
  className: PropTypes.string
};

export default PropertyInsights; 