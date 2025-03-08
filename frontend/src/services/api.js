import axios from 'axios';

// Debounce function implementation
const debounce = (func, wait) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    return new Promise(resolve => {
      timeout = setTimeout(() => {
        resolve(func.apply(context, args));
      }, wait);
    });
  };
};

// API base URL - pointing to the backend server
// In production, API requests go to the same domain (no need to specify a different domain)
// In development, we need to point to the separate backend server
// Fix for localhost - use window.location.origin instead of hardcoding the port
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, API is on the same domain
  : window.location.origin.includes('localhost:3000') 
    ? 'http://localhost:5000/api' // In development with React dev server
    : `${window.location.origin}/api`; // For other setups

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/session to work across domains
});

// Exponential backoff retry helper
const retryRequest = async (config, retryCount = 0, maxRetries = 3) => {
  try {
    console.log("Making request:", config.url);
    return await axios(config);
  } catch (error) {
    console.error("Request error:", error.message);
    // For debugging, log more details about the error
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      url: error.config?.url
    });
    
    // Check if error is rate limiting (429) or server error that might be temporary (5xx)
    const isRateLimitError = error.response?.status === 429;
    const isServerError = error.response?.status >= 500 && error.response?.status < 600;
    const isAuthError = error.response?.status === 401;
    
    // Don't retry auth errors - the user needs to login again
    if (isAuthError) {
      console.error("Authentication error - login required");
      throw error;
    }
    
    const shouldRetry = (isRateLimitError || isServerError) && retryCount < maxRetries;
    
    if (!shouldRetry) {
      throw error;
    }
    
    // Calculate delay with exponential backoff: 2^retryCount * 1000ms + random jitter
    const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
    console.log(`Rate limit or server error, retrying in ${Math.round(delay / 1000)}s (attempt ${retryCount + 1}/${maxRetries})`);
    
    // Display user message for rate limiting specifically
    if (isRateLimitError) {
      const rateLimitResetTime = error.response?.headers['x-ratelimit-reset'];
      const waitTime = rateLimitResetTime ? new Date(rateLimitResetTime * 1000) : new Date(Date.now() + delay);
      window.dispatchEvent(new CustomEvent('fitbit-rate-limit', { 
        detail: { 
          retryCount, 
          maxRetries, 
          delay,
          message: `Fitbit API rate limit reached. Retrying in ${Math.round(delay / 1000)} seconds...`,
          resetTime: waitTime
        } 
      }));
    }
    
    // Wait for the delay using Promise
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Recursive retry with incremented counter
    return retryRequest(config, retryCount + 1, maxRetries);
  }
};

// Remove the request interceptor for now (it was causing issues)
/*
apiClient.interceptors.request.use(config => {
  const originalRequest = config.method;
  
  // Create a new function that wraps the axios request with our retry logic
  config.method = async () => {
    return retryRequest(config);
  };
  
  return config;
});
*/

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  response => response, 
  error => {
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      const rateLimitResetTime = error.response?.headers['x-ratelimit-reset'];
      const waitTime = rateLimitResetTime ? new Date(rateLimitResetTime * 1000).toLocaleTimeString() : 'a few minutes';
      
      console.error(`Rate limit exceeded. Reset at approximately ${waitTime}`);
      
      // Dispatch an event that UI components can listen for
      window.dispatchEvent(new CustomEvent('fitbit-rate-limit', { 
        detail: { 
          message: `Fitbit API rate limit reached. Please try again after ${waitTime}.`,
          resetTime: rateLimitResetTime ? new Date(rateLimitResetTime * 1000) : null
        } 
      }));
    }
    
    console.error('API request failed:', { 
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Heart rate data API calls
export const heartRateService = {
  // Get heart rate data for a specific period (with debouncing)
  getHeartRateData: async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching heart rate data for ${period} on ${date}`);
      
      // Ensure date is in string format and handle timezone issues
      let formattedDate;
      if (typeof date === 'string') {
        // Already a string, just use it
        formattedDate = date;
      } else if (date instanceof Date) {
        // Format using date parts to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      } else {
        // Fallback
        formattedDate = new Date().toISOString().split('T')[0];
      }
      
      // Simplify the request as much as possible
      console.log(`Making simple request to: ${API_BASE_URL}/fitbit/heart-rate?period=${period}&date=${formattedDate}`);
      
      // Make a simple GET request with the parameters in the URL using the configured apiClient
      const response = await apiClient.get(`/fitbit/heart-rate`, {
        params: { period, date: formattedDate }
      });
      
      // Log success
      console.log('Heart rate API call successful:', response.status);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded when fetching heart rate data. Please try again later.');
      }
      console.error('Error fetching heart rate data:', error);
      console.error('Error details:', {
        status: error.response?.status, 
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
  
  // No mock data methods
};

// Auth API calls
export const authService = {
  // Check if user is authenticated
  checkAuth: async () => {
    try {
      console.log('Checking authentication status...');
      const response = await apiClient.get('/auth/token');
      console.log('Auth check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { authenticated: false };
    }
  },
  
  // Initiate login flow
  login: async () => {
    try {
      console.log('Initiating Fitbit login flow...');
      // Create the URL with consistent format
      const apiBase = process.env.NODE_ENV === 'production' 
        ? '/api' 
        : window.location.origin.includes('localhost:3000') 
          ? 'http://localhost:5000/api' 
          : `${window.location.origin}/api`;
        
      const response = await apiClient.get('/auth/login');
      console.log('Login response:', response.data);
      
      // For consistency with Google Fit flow
      if (response.data.authorization_url) {
        console.log('Redirecting to:', response.data.authorization_url);
        window.location.href = response.data.authorization_url;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error initiating login:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      console.log('Logging out user...');
      const response = await apiClient.post('/auth/logout');
      console.log('Logout response:', response.data);
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },
  
  // Debug session
  debugSession: async () => {
    try {
      console.log('Fetching session debug info...');
      const response = await apiClient.get('/auth/debug-session');
      console.log('Session debug info:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching session debug info:', error);
      throw error;
    }
  }
};

// Fitbit API calls
export const fitbitService = {
  // Get user profile
  getProfile: async () => {
    try {
      console.log('Fetching user profile...');
      const response = await apiClient.get('/fitbit/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // Check connection status (with debouncing to prevent frequent calls)
  checkStatus: debounce(async () => {
    try {
      console.log('Checking Fitbit connection status...');
      const response = await apiClient.get('/fitbit/status');
      console.log('Connection status:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking Fitbit status:', error);
      return { connected: false };
    }
  }, 1000), // 1 second debounce
};

// Sleep data API calls
export const sleepService = {
  // Get sleep data for a specific period (with debouncing)
  getSleepData: debounce(async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching sleep data for ${period} on ${date}`);
      const response = await apiClient.get(`/fitbit/sleep`, {
        params: { period, date }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded when fetching sleep data. Please try again later.');
      }
      console.error('Error fetching sleep data:', error);
      throw error;
    }
  }, 300), // 300ms debounce
};

// Activity data API calls
export const activityService = {
  // Get activity data for a specific period (with debouncing)
  getActivityData: debounce(async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching activity data for ${period} on ${date}`);
      const response = await apiClient.get(`/fitbit/activity`, {
        params: { period, date }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded when fetching activity data. Please try again later.');
      }
      console.error('Error fetching activity data:', error);
      throw error;
    }
  }, 300), // 300ms debounce
};

// Apple Fitness API calls
export const appleFitnessService = {
  // Check if user is authenticated with Apple Fitness
  checkAuth: async () => {
    try {
      console.log('Checking Apple Fitness authentication status...');
      const response = await apiClient.get('/apple-fitness/token');
      console.log('Apple Fitness auth check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking Apple Fitness auth status:', error);
      return { authenticated: false };
    }
  },
  
  // Initiate login flow for Apple Fitness
  login: async () => {
    try {
      console.log('Initiating Apple Fitness login flow...');
      // Set window.location directly to the auth endpoint for OAuth flow
      const apiBase = process.env.NODE_ENV === 'production' 
        ? '/api' 
        : window.location.origin.includes('localhost:3000') 
          ? 'http://localhost:5000/api' 
          : `${window.location.origin}/api`;
      
      const authUrl = `${apiBase}/apple-fitness/login`;
      console.log('Redirecting to Apple Fitness auth URL:', authUrl);
      
      // Get the URL first
      const response = await apiClient.get('/apple-fitness/login');
      console.log('Apple Fitness login response:', response.data);
      
      // Then redirect if there's an authorization URL
      if (response.data && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error initiating Apple Fitness login:', error);
      throw error;
    }
  },

  // Check connection status (with debouncing to prevent frequent calls)
  checkStatus: debounce(async () => {
    try {
      console.log('Checking Apple Fitness connection status...');
      const response = await apiClient.get('/apple-fitness/status');
      console.log('Apple Fitness connection status:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking Apple Fitness status:', error);
      return { connected: false };
    }
  }, 1000), // 1 second debounce

  // Get user profile from Apple Fitness
  getProfile: async () => {
    try {
      console.log('Fetching Apple Fitness user profile...');
      const response = await apiClient.get('/apple-fitness/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching Apple Fitness profile:', error);
      throw error;
    }
  },
  
  // Get heart rate data from Apple Health
  getHeartRateData: async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching Apple Health heart rate data for ${period} on ${date}`);
      const response = await apiClient.get('/apple-fitness/heart-rate', {
        params: { period, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Apple Health heart rate data:', error);
      throw error;
    }
  },
  
  // Get activity data from Apple Health
  getActivityData: async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching Apple Health activity data for ${period} on ${date}`);
      const response = await apiClient.get('/apple-fitness/activity', {
        params: { period, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Apple Health activity data:', error);
      throw error;
    }
  },
  
  // Get workout data from Apple Health
  getWorkoutData: async (period = 'week', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching Apple Health workout data for ${period} on ${date}`);
      const response = await apiClient.get('/apple-fitness/workouts', {
        params: { period, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Apple Health workout data:', error);
      throw error;
    }
  },
  
  // Logout from Apple Fitness
  logout: async () => {
    try {
      console.log('Logging out from Apple Fitness...');
      const response = await apiClient.post('/apple-fitness/logout');
      return response.data;
    } catch (error) {
      console.error('Error logging out from Apple Fitness:', error);
      throw error;
    }
  }
};

// Google Fit API calls
export const googleFitService = {
  // Check if user is authenticated with Google Fit
  checkAuth: async () => {
    try {
      console.log('Checking Google Fit authentication status...');
      const response = await apiClient.get('/google-fit/status');
      console.log('Google Fit auth check response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking Google Fit auth status:', error);
      return { connected: false };
    }
  },
  
  // Initiate login flow for Google Fit
  login: async () => {
    try {
      console.log('Initiating Google Fit login flow...');
      // Set window.location directly to the auth endpoint for OAuth flow
      const apiBase = process.env.NODE_ENV === 'production' 
        ? '/api' 
        : window.location.origin.includes('localhost:3000') 
          ? 'http://localhost:5000/api' 
          : `${window.location.origin}/api`;
      
      const authUrl = `${apiBase}/google-fit/auth`;
      console.log('Redirecting to Google Fit auth URL:', authUrl);
      
      // This will trigger a redirect to Google's OAuth page
      window.location.href = authUrl;
      return { success: true };
    } catch (error) {
      console.error('Error initiating Google Fit login:', error);
      throw error;
    }
  },

  // Check connection status (with debouncing to prevent frequent calls)
  checkStatus: debounce(async () => {
    try {
      console.log('Checking Google Fit connection status...');
      const response = await apiClient.get('/google-fit/status');
      console.log('Google Fit connection status response:', response);
      console.log('Google Fit connection data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking Google Fit status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return { connected: false };
    }
  }, 1000), // 1 second debounce

  // Get user profile from Google Fit
  getProfile: async () => {
    try {
      console.log('Fetching Google Fit user profile...');
      const response = await apiClient.get('/google-fit/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching Google Fit profile:', error);
      throw error;
    }
  },
  
  // Get heart rate data from Google Fit
  getHeartRateData: async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      // Add a timestamp to prevent caching
      const timestamp = Date.now();
      console.log(`Fetching Google Fit heart rate data for ${period} on ${date} with timestamp ${timestamp}`);
      
      const response = await apiClient.get('/google-fit/heart-rate', {
        params: { 
          period, 
          date,
          _ts: timestamp  // Add cache-busting timestamp
        }
      });
      
      console.log(`Google Fit heart rate data received: ${response.data.data_points_count} points`);
      if (response.data.date_counts) {
        console.log('Data points by date:', response.data.date_counts);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Google Fit heart rate data:', error);
      throw error;
    }
  },
  
  // Get activity data from Google Fit
  getActivityData: async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching Google Fit activity data for ${period} on ${date}`);
      const response = await apiClient.get('/google-fit/activity', {
        params: { period, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Google Fit activity data:', error);
      throw error;
    }
  },
  
  // Get sleep data from Google Fit
  getSleepData: async (period = 'day', date = new Date().toISOString().split('T')[0]) => {
    try {
      console.log(`Fetching Google Fit sleep data for ${period} on ${date}`);
      const response = await apiClient.get('/google-fit/sleep', {
        params: { period, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Google Fit sleep data:', error);
      throw error;
    }
  },
  
  // Logout from Google Fit
  logout: async () => {
    try {
      console.log('Logging out from Google Fit...');
      const response = await apiClient.get('/google-fit/disconnect');
      return response.data;
    } catch (error) {
      console.error('Error logging out from Google Fit:', error);
      throw error;
    }
  }
};

const apiServices = {
  heartRate: heartRateService,
  auth: authService,
  fitbit: fitbitService,
  sleep: sleepService,
  activity: activityService,
  appleFitness: appleFitnessService,
  googleFit: googleFitService
};

export default apiServices;
