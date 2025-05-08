import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from './ErrorBoundary';
import LoadingState from './LoadingState';

/**
 * AsyncContentWrapper
 * A higher-order component that wraps async data fetching components
 * with loading state and error handling
 */
const AsyncContentWrapper = ({
  isLoading,
  isError,
  error,
  children,
  loadingVariant = 'spinner',
  loadingText = 'Loading content...',
  errorFallback,
  retry,
  showRetry = true,
  className = ''
}) => {
  // Custom error fallback component
  const ErrorFallback = () => (
    <div className="p-6 bg-red-50 border border-red-100 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-red-700 mb-2">
        {error?.message || 'An error occurred while loading the content'}
      </h3>
      <p className="text-sm text-red-600 mb-4">
        {error?.details || 'Please try again later or contact support if the problem persists.'}
      </p>
      {showRetry && retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <LoadingState
        isLoading={true}
        variant={loadingVariant}
        loadingText={loadingText}
        className={className}
      />
    );
  }

  // Show error state
  if (isError) {
    return errorFallback || <ErrorFallback />;
  }

  // Render children wrapped in ErrorBoundary for runtime errors
  return (
    <ErrorBoundary>
      <div className={className}>
        {children}
      </div>
    </ErrorBoundary>
  );
};

AsyncContentWrapper.propTypes = {
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string,
    details: PropTypes.string,
  }),
  children: PropTypes.node,
  loadingVariant: PropTypes.oneOf(['spinner', 'skeleton', 'pulse']),
  loadingText: PropTypes.string,
  errorFallback: PropTypes.node,
  retry: PropTypes.func,
  showRetry: PropTypes.bool,
  className: PropTypes.string
};

AsyncContentWrapper.defaultProps = {
  isLoading: false,
  isError: false,
  error: null,
  showRetry: true
};

export default AsyncContentWrapper; 