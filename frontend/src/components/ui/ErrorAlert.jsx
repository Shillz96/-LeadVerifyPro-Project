import React from 'react';
import PropTypes from 'prop-types';

/**
 * Displays error messages with an alert style
 */
const ErrorAlert = ({ message, children, className = '' }) => {
  return (
    <div className={`bg-red-50 text-red-700 p-3 rounded-md ${className}`} role="alert">
      {typeof message === 'string' ? (
        <p>{message}</p>
      ) : (
        message
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};

ErrorAlert.propTypes = {
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  children: PropTypes.node,
  className: PropTypes.string
};

export default ErrorAlert; 