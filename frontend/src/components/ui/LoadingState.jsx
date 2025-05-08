import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingState component for async operations
 * Shows a loading spinner, skeleton, or custom content based on props
 */
const LoadingState = ({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  skeletonCount = 3,
  spinnerSize = 'medium',
  variant = 'spinner',
  className = ''
}) => {
  if (!isLoading) {
    return children;
  }

  // Spinner sizes
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  // Spinner with text variant
  if (variant === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizes[spinnerSize]}`}></div>
        {loadingText && <p className="mt-2 text-sm text-gray-600">{loadingText}</p>}
      </div>
    );
  }

  // Skeleton loader variant
  if (variant === 'skeleton') {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(skeletonCount)].map((_, index) => (
          <div key={index} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <div className={`animate-pulse p-4 rounded-md ${className}`}>
        <div className="flex space-x-4 items-center">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to text if no valid variant
  return (
    <div className={`text-center p-4 ${className}`}>
      {loadingText}
    </div>
  );
};

LoadingState.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.node,
  loadingText: PropTypes.string,
  skeletonCount: PropTypes.number,
  spinnerSize: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['spinner', 'skeleton', 'pulse']),
  className: PropTypes.string
};

export default LoadingState; 