import axios from 'axios';

// Get API URL from environment or fallback to hosted API on Render.com
const API_URL = import.meta.env.VITE_API_URL || 'https://leadverifypro-api.onrender.com/api';

// Flag for API connectivity status
let isApiAvailable = true;

/**
 * Centralized API client with interceptors for authentication and error handling
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set a timeout for API requests
  timeout: 10000,
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Set API availability flag to false if connection error
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      console.warn('API is unavailable, switching to offline mode');
      isApiAvailable = false;
    }
    
    return Promise.reject(error);
  }
);

/**
 * Error handler for API requests
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if none is provided
 * @returns {Object} Standardized error response
 */
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error(defaultMessage, error);
  
  // Check if this is a network error and we should use offline mode
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
    return { 
      success: false, 
      error: 'API is currently unavailable. Please try again later.',
      isOffline: true
    };
  }
  
  return { 
    success: false, 
    error: error.response?.data?.message || defaultMessage
  };
};

// Function to check API availability
const checkApiAvailability = async () => {
  try {
    await axios.get(`${API_URL}`, { timeout: 5000 });
    isApiAvailable = true;
    return true;
  } catch (error) {
    isApiAvailable = false;
    return false;
  }
};

/**
 * Lead management API endpoints
 */
const leadsApi = {
  // Get all leads
  getAllLeads: async () => {
    try {
      const response = await api.get('/leads');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error fetching leads');
    }
  },

  // Get a single lead by ID
  getLeadById: async (id) => {
    try {
      const response = await api.get(`/leads/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Error fetching lead ${id}`);
    }
  },

  // Create a new lead
  createLead: async (leadData) => {
    try {
      const response = await api.post('/leads', leadData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error creating lead');
    }
  },

  // Update a lead
  updateLead: async (id, leadData) => {
    try {
      const response = await api.put(`/leads/${id}`, leadData);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Error updating lead ${id}`);
    }
  },

  // Delete a lead
  deleteLead: async (id) => {
    try {
      const response = await api.delete(`/leads/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Error deleting lead ${id}`);
    }
  },

  // Upload leads CSV
  uploadLeads: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/leads/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error uploading leads');
    }
  },

  // Verify leads
  verifyLeads: async (leadIds) => {
    try {
      const response = await api.post('/leads/verify', { leadIds });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error verifying leads');
    }
  },
};

/**
 * Authentication API endpoints
 */
const authApi = {
  // Login
  login: async (email, password) => {
    try {
      // First check if API is available
      if (!isApiAvailable) {
        await checkApiAvailability();
      }
      
      // If API is available, proceed with normal login
      if (isApiAvailable) {
        const response = await api.post('/auth/login', { email, password });
        const token = response.data.token;
        
        // Create a user object since the API doesn't return one
        const user = {
          email: email,
          id: response.data.userId || 'temp-id',
          role: response.data.role || 'user'
        };
        
        // Save token and user data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user };
      } else {
        // Fallback to offline/demo mode
        if (email === 'demo@example.com' && password === 'demo123') {
          const demoUser = {
            email: 'demo@example.com',
            id: 'demo-user',
            role: 'user',
            firstName: 'Demo',
            lastName: 'User'
          };
          
          localStorage.setItem('auth_token', 'demo-token');
          localStorage.setItem('user', JSON.stringify(demoUser));
          
          return { success: true, user: demoUser, isOffline: true };
        }
        
        return { 
          success: false, 
          error: 'Authentication failed. API is currently unavailable.',
          isOffline: true
        };
      }
    } catch (error) {
      return handleApiError(error, 'Login failed. Please try again.');
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const token = response.data.token;
      
      // Create user object from registration data
      const user = {
        email: userData.email,
        id: response.data.userId || 'temp-id',
        role: 'user',
        firstName: userData.firstName || userData.name,
        lastName: userData.lastName
      };
      
      // Save token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return handleApiError(error, 'Registration failed. Please try again.');
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return { success: true };
  },

  // Check auth status
  checkAuthStatus: () => {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('user');
    
    if (!token || !userJson) {
      return { isAuthenticated: false, user: null };
    }
    
    try {
      const user = JSON.parse(userJson);
      return { isAuthenticated: true, user };
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return { isAuthenticated: false, user: null };
    }
  },
};

/**
 * Subscription management API endpoints
 */
const subscriptionApi = {
  // Get current subscription
  getCurrentSubscription: async () => {
    try {
      const response = await api.get('/subscriptions');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error fetching subscription details');
    }
  },

  // Get available plans
  getPlans: async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error fetching subscription plans');
    }
  },

  // Change subscription plan
  changePlan: async (planId) => {
    try {
      const response = await api.post('/subscriptions/change-plan', { plan: planId });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error changing subscription plan');
    }
  },
};

/**
 * User account management API endpoints
 */
const userApi = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error fetching user profile');
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/me', profileData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error updating user profile');
    }
  },

  // Change password
  changePassword: async (passwords) => {
    try {
      const response = await api.put('/auth/me/password', passwords);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Error changing password');
    }
  },
};

// Export all API modules
export {
  api,
  leadsApi,
  authApi,
  subscriptionApi,
  userApi,
  API_URL,
  checkApiAvailability
}; 