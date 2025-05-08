import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, isOfflineMode } = useAuth();
  const location = useLocation();

  // Show loading state if auth is still being checked
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the child routes
  return (
    <>
      {isOfflineMode && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 sticky top-0 z-50">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Demo Mode Active</p>
              <p className="text-sm">
                You are using a demo account with limited functionality. The backend API is currently unavailable.
              </p>
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
};

export default ProtectedRoute; 