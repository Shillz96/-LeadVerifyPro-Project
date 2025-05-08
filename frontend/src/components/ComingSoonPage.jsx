import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiClock } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * ComingSoonPage - Displays a coming soon message for features that are planned but not yet implemented
 * Can be customized with different feature names and descriptions
 */
const ComingSoonPage = ({ 
  featureName = "This Feature", 
  description = "We're working hard to bring this feature to you. Please check back soon!",
  estimatedRelease = "Coming soon"
}) => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-lg w-full mx-auto p-6">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <FiClock className="text-6xl text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Coming Soon</h1>
          <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-primary">{featureName}</h2>
          <p className="mt-4 text-lg text-gray-600">
            {description}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <span className="font-medium">{estimatedRelease}</span>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={goBack}
              className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              <FiArrowLeft className="mr-2" />
              Go Back
            </button>
            <Link
              to="/dashboard"
              className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white border-primary hover:bg-gray-50"
            >
              <FiHome className="mr-2" />
              Dashboard
            </Link>
          </div>
        </div>
        
        <div className="mt-12">
          <h3 className="text-center text-lg font-medium text-gray-900">
            Explore available features
          </h3>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li>
              <Link
                to="/dashboard"
                className="block p-3 text-center bg-white rounded-lg border border-gray-200 hover:border-primary hover:text-primary"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/leads/verified"
                className="block p-3 text-center bg-white rounded-lg border border-gray-200 hover:border-primary hover:text-primary"
              >
                Verified Leads
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/verify"
                className="block p-3 text-center bg-white rounded-lg border border-gray-200 hover:border-primary hover:text-primary"
              >
                Verify Leads
              </Link>
            </li>
            <li>
              <Link
                to="/account"
                className="block p-3 text-center bg-white rounded-lg border border-gray-200 hover:border-primary hover:text-primary"
              >
                Account Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

ComingSoonPage.propTypes = {
  featureName: PropTypes.string,
  description: PropTypes.string,
  estimatedRelease: PropTypes.string
};

export default ComingSoonPage; 