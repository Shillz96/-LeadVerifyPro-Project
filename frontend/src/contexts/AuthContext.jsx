import { createContext, useState, useEffect, useContext } from 'react';
import { authApi, checkApiAvailability } from '../utils/api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if API is available
        const apiAvailable = await checkApiAvailability();
        setIsOfflineMode(!apiAvailable);
        
        // In a real app, you would check with your backend or token storage
        const token = localStorage.getItem('auth_token');
        const userJson = localStorage.getItem('user');
        
        if (token && userJson) {
          // Parse stored user data - add check to ensure userJson is not undefined or 'undefined'
          if (userJson && userJson !== 'undefined') {
            const userData = JSON.parse(userJson);
            setUser(userData);
            
            // If we're in offline mode and the stored user isn't the demo user, log them out
            if (!apiAvailable && userData.email !== 'demo@example.com') {
              console.warn('API is unavailable and user is not demo user. Logging out.');
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        setError('Failed to restore authentication state');
        setIsOfflineMode(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the auth API service for login
      const result = await authApi.login(email, password);
      
      if (result.success) {
        // Update offline mode state if this is an offline login
        if (result.isOffline) {
          setIsOfflineMode(true);
        }
        
        // Create a basic user object if one isn't returned from the API
        const userObj = result.user || {
          email: email,
          id: 'temp-id',
          role: 'user'
        };
        
        setUser(userObj);
        console.log('Login successful!');
        
        // Make sure the user is saved to localStorage
        if (userObj) {
          localStorage.setItem('user', JSON.stringify(userObj));
        }
        
        setLoading(false);
        return result;
      } else {
        // If we're in offline mode, show a special message
        if (result.isOffline) {
          setIsOfflineMode(true);
          setError('API is currently unavailable. Use demo@example.com / demo123 to access demo mode.');
        } else {
          setError(result.error);
        }
        
        setLoading(false);
        return result;
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Signup function
  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we're in offline mode
      if (isOfflineMode) {
        setError('Registration is not available in offline mode. Please try again later or use the demo account.');
        setLoading(false);
        return { 
          success: false, 
          error: 'Registration is not available in offline mode. Please try again later or use the demo account.',
          isOffline: true
        };
      }
      
      // Use the auth API service for registration
      const result = await authApi.register(userData);
      
      if (result.success) {
        setUser(result.user);
        setLoading(false);
        return result;
      } else {
        setError(result.error);
        setLoading(false);
        return result;
      }
    } catch (err) {
      console.error('Signup failed:', err);
      setError('Signup failed. Please try again.');
      setLoading(false);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage before setting user to null
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    authApi.logout();
    setUser(null);
    return { success: true };
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to your backend
      // For now, just update the local user data
      const updatedUser = { ...user, ...userData };
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setLoading(false);
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Profile update failed. Please try again.');
      setLoading(false);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated,
    isOfflineMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 