import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component for visualizing neighborhood trends and market data
 */
const NeighborhoodTrendsChart = ({ data = {} }) => {
  const { 
    marketTrend = { direction: 'stable', score: 50 },
    valueChange = { oneYear: 0, threeYear: 0, fiveYear: 0 },
    forecast = 'stable',
    medianValue = 0
  } = data;
  
  // Helper for trend indicators
  const getTrendIndicator = (value) => {
    if (value > 0) return '↑'; 
    if (value < 0) return '↓';
    return '→';
  };
  
  // Helper for trend colors
  const getTrendColor = (value) => {
    if (value > 5) return 'text-green-600';
    if (value > 0) return 'text-green-500';
    if (value < -5) return 'text-red-600';
    if (value < 0) return 'text-red-500';
    return 'text-yellow-500';
  };
  
  // Helper for background colors
  const getTrendBgColor = (value) => {
    if (value > 5) return 'bg-green-100';
    if (value > 0) return 'bg-green-50';
    if (value < -5) return 'bg-red-100';
    if (value < 0) return 'bg-red-50';
    return 'bg-yellow-50';
  };
  
  // Prepare data for bar chart
  const chartData = [
    { label: '1yr', value: valueChange.oneYear || 0 },
    { label: '3yr', value: valueChange.threeYear || 0 },
    { label: '5yr', value: valueChange.fiveYear || 0 }
  ];
  
  // Scale for the chart (determine max value for scaling)
  const maxValue = Math.max(
    10, // Minimum scale
    Math.abs(valueChange.oneYear || 0),
    Math.abs(valueChange.threeYear || 0),
    Math.abs(valueChange.fiveYear || 0)
  ) * 1.2; // Add 20% for padding
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Neighborhood Trends</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          marketTrend.direction === 'increasing' ? 'bg-green-100 text-green-800' :
          marketTrend.direction === 'decreasing' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {marketTrend.direction.charAt(0).toUpperCase() + marketTrend.direction.slice(1)}
        </div>
      </div>

      {/* Median Property Value */}
      {medianValue > 0 && (
        <div className="mb-4">
          <span className="text-sm text-gray-600">Median Property Value</span>
          <div className="text-xl font-semibold">${medianValue.toLocaleString()}</div>
        </div>
      )}
      
      {/* Value Change Visualization */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Value Change</h4>
        <div className="flex flex-col space-y-1">
          {chartData.map((item) => (
            <div key={item.label} className="flex items-center h-8">
              <div className="w-10 text-sm text-gray-600 font-medium">{item.label}</div>
              <div className="flex-1 relative h-full flex items-center">
                {/* Zero line (center) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300"></div>
                
                {/* Bar */}
                <div 
                  className={`absolute h-5 ${item.value >= 0 ? 'left-1/2' : 'right-1/2'} ${
                    item.value > 0 ? 'bg-green-500' : 
                    item.value < 0 ? 'bg-red-500' : 
                    'bg-gray-300'
                  } rounded`}
                  style={{ 
                    width: `${Math.abs(item.value) / maxValue * 50}%`,
                    minWidth: '1px'
                  }}
                ></div>
                
                {/* Value label */}
                <div 
                  className={`absolute ${item.value >= 0 ? 'left-1/2 pl-1' : 'right-1/2 pr-1'} ${
                    getTrendColor(item.value)
                  } text-sm font-medium flex items-center`}
                  style={{ 
                    transform: `translateX(${item.value >= 0 ? Math.abs(item.value) / maxValue * 50 : -Math.abs(item.value) / maxValue * 50}%)` 
                  }}
                >
                  {item.value > 0 && '+'}{item.value.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Forecast and Other Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg ${
          forecast === 'increasing' ? 'bg-green-50' :
          forecast === 'decreasing' ? 'bg-red-50' :
          'bg-yellow-50'
        }`}>
          <div className="text-sm text-gray-600">Forecast</div>
          <div className="font-medium capitalize">
            {forecast || 'Stable'}
          </div>
        </div>
        
        {data.permits && (
          <div className="p-3 rounded-lg bg-blue-50">
            <div className="text-sm text-gray-600">Development</div>
            <div className="font-medium">
              {data.permits.residential + data.permits.commercial || 0} permits
            </div>
          </div>
        )}
        
        {data.crimeScore && (
          <div className={`p-3 rounded-lg ${
            data.crimeScore > 70 ? 'bg-green-50' :
            data.crimeScore < 30 ? 'bg-red-50' :
            'bg-yellow-50'
          }`}>
            <div className="text-sm text-gray-600">Safety</div>
            <div className="font-medium">
              {data.crimeScore}/100
            </div>
          </div>
        )}
        
        {data.investmentLevel && (
          <div className={`p-3 rounded-lg ${
            data.investmentLevel === 'increasing' ? 'bg-green-50' :
            data.investmentLevel === 'decreasing' ? 'bg-red-50' :
            'bg-blue-50'
          }`}>
            <div className="text-sm text-gray-600">Investment</div>
            <div className="font-medium capitalize">
              {data.investmentLevel}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

NeighborhoodTrendsChart.propTypes = {
  data: PropTypes.shape({
    marketTrend: PropTypes.shape({
      direction: PropTypes.string,
      score: PropTypes.number
    }),
    valueChange: PropTypes.shape({
      oneYear: PropTypes.number,
      threeYear: PropTypes.number,
      fiveYear: PropTypes.number
    }),
    medianValue: PropTypes.number,
    forecast: PropTypes.string,
    permits: PropTypes.shape({
      residential: PropTypes.number,
      commercial: PropTypes.number
    }),
    crimeScore: PropTypes.number,
    investmentLevel: PropTypes.string
  })
};

export default NeighborhoodTrendsChart; 