import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

/**
 * ErrorPage - Displays error messages and provides navigation back to safety
 * Used for both 404 Not Found and other error states
 */
const ErrorPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
          <p className="mt-3 text-lg text-gray-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={goBack}
              className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              <FiArrowLeft className="mr-2" />
              Go Back
            </button>
            <Link
              to="/"
              className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white border-primary hover:bg-gray-50"
            >
              <FiHome className="mr-2" />
              Home Page
            </Link>
          </div>
        </div>
        
        <div className="mt-12">
          <h3 className="text-center text-lg font-medium text-gray-900">
            Looking for something else?
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
                to="/account"
                className="block p-3 text-center bg-white rounded-lg border border-gray-200 hover:border-primary hover:text-primary"
              >
                Account Settings
              </Link>
            </li>
            <li>
              <Link
                to="/subscription"
                className="block p-3 text-center bg-white rounded-lg border border-gray-200 hover:border-primary hover:text-primary"
              >
                Subscription Plans
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage; 