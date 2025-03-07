// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { authService, fitbitService, appleFitnessService, googleFitService } from '../services/api';

// Configure axios for all requests
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [connectedServices, setConnectedServices] = useState({
    fitbit: false,
    appleFitness: false,
    googleFit: false,
    youtubeMusic: false
  });
  
  // Track token scopes for debugging
  const [tokenScopes, setTokenScopes] = useState([]);

  // Check if user is authenticated
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Checking authentication status...');
      
      // Initialize connected services object
      let updatedConnectedServices = {
        fitbit: false,
        appleFitness: false,
        googleFit: false,
        youtubeMusic: false
      };
      
      // Separate authentication check for each service
      // This is the main change - we now check each service independently
      
      // First check Fitbit
      try {
        const fitbitResponse = await fitbitService.checkStatus();
        if (fitbitResponse && fitbitResponse.connected) {
          updatedConnectedServices.fitbit = true;
          console.log('Fitbit is connected');
          
          // Get user profile if not already set
          if (!user) {
            try {
              const profileResponse = await fitbitService.getProfile();
              console.log('Fitbit profile response:', profileResponse);
              if (profileResponse && profileResponse.user) {
                setUser(profileResponse.user);
              }
            } catch (profileError) {
              console.error('Error fetching Fitbit profile:', profileError);
            }
          }
          
          // Check for fitbit token scopes
          try {
            const tokenInfo = await authService.checkAuth();
            if (tokenInfo.authenticated && tokenInfo.token && tokenInfo.token.scopes) {
              setTokenScopes(tokenInfo.token.scopes);
              
              // Check for missing scopes
              const requiredScopes = ['heartrate', 'activity', 'sleep', 'profile'];
              const missingScopes = requiredScopes.filter(scope => !tokenInfo.token.scopes.includes(scope));
              
              if (missingScopes.length > 0) {
                console.warn(`⚠️ Missing required scopes: ${missingScopes.join(', ')}`);
                console.warn('Some features may not work correctly due to missing permissions.');
              }
            }
          } catch (scopeError) {
            console.error('Error checking Fitbit token scopes:', scopeError);
          }
        } else {
          console.log('Fitbit is not connected');
        }
      } catch (fitbitError) {
        console.error('Error fetching Fitbit connection status:', fitbitError);
      }
      
      // Check Apple Fitness
      try {
        const appleResponse = await appleFitnessService.checkStatus();
        if (appleResponse && appleResponse.connected) {
          updatedConnectedServices.appleFitness = true;
          console.log('Apple Fitness is connected');
          
          // Get Apple Fitness profile if user not set and Fitbit not connected
          if (!user && !updatedConnectedServices.fitbit) {
            try {
              const profileResponse = await appleFitnessService.getProfile();
              console.log('Apple Fitness profile response:', profileResponse);
              if (profileResponse && profileResponse.user) {
                setUser(profileResponse.user);
              }
            } catch (profileError) {
              console.error('Error fetching Apple Fitness profile:', profileError);
            }
          }
        } else {
          console.log('Apple Fitness is not connected');
        }
      } catch (appleError) {
        console.error('Error fetching Apple Fitness connection status:', appleError);
      }
      
      // Check Google Fit
      try {
        const googleFitResponse = await googleFitService.checkStatus();
        if (googleFitResponse && googleFitResponse.connected) {
          updatedConnectedServices.googleFit = true;
          console.log('Google Fit is connected');
          
          // Get Google Fit profile if user not set and no other fitness service is connected
          if (!user && !updatedConnectedServices.fitbit && !updatedConnectedServices.appleFitness) {
            try {
              const profileResponse = await googleFitService.getProfile();
              console.log('Google Fit profile response:', profileResponse);
              if (profileResponse && profileResponse.user) {
                setUser(profileResponse.user);
              }
            } catch (profileError) {
              console.error('Error fetching Google Fit profile:', profileError);
            }
          }
        } else {
          console.log('Google Fit is not connected');
        }
      } catch (googleFitError) {
        console.error('Error fetching Google Fit connection status:', googleFitError);
      }
      
      // Check YouTube Music
      try {
        const youtubeMusicResponse = await axios.get('/api/youtube-music/status');
        if (youtubeMusicResponse.data && youtubeMusicResponse.data.connected) {
          updatedConnectedServices.youtubeMusic = true;
          console.log('YouTube Music is connected');
        } else {
          console.log('YouTube Music is not connected');
        }
      } catch (youtubeMusicError) {
        console.error('Error fetching YouTube Music connection status:', youtubeMusicError);
      }
      
      // Update the connected services state
      setConnectedServices(updatedConnectedServices);
      
      // Consider the user authenticated if ANY service is connected
      const isAnyServiceConnected = Object.values(updatedConnectedServices).some(connected => connected);
      
      if (isAnyServiceConnected) {
        setIsAuthenticated(true);
        console.log('User is authenticated with at least one service');
      } else {
        console.log('User is not authenticated with any service');
        setIsAuthenticated(false);
        setUser(null);
        setTokenScopes([]);
      }
      
      // Clear any previous auth errors on successful check
      setAuthError(null);
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setTokenScopes([]);
      setConnectedServices({
        fitbit: false,
        appleFitness: false,
        googleFit: false,
        youtubeMusic: false
      });
      setAuthError(error.message || 'Authentication check failed');
    } finally {
      // Always set loading to false, even if there are errors
      setIsLoading(false);
    }
  }, [user]);

  // Initialize auth check when component mounts
  useEffect(() => {
    console.log('AuthProvider mounted, checking auth status');
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Fitbit login function
  const loginFitbit = useCallback(async () => {
    try {
      console.log('Initiating Fitbit login...');
      // Let the service handle the URL and redirection
      await authService.login();
      // The API service will handle the redirect directly
    } catch (error) {
      console.error('Fitbit login failed:', error);
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAuthError(error.message || 'Fitbit login failed');
      alert(`Failed to connect to Fitbit: ${error.message || 'Authentication failed'}. Please try again.`);
    }
  }, []);

  // Apple Fitness login function
  const loginAppleFitness = useCallback(async () => {
    try {
      console.log('Initiating Apple Fitness login...');
      // Let the service handle the URL and redirection
      await appleFitnessService.login();
      // The service will handle redirection
    } catch (error) {
      console.error('Apple Fitness login failed:', error);
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAuthError(error.message || 'Apple Fitness login failed');
      alert(`Failed to connect to Apple Fitness: ${error.message || 'Authentication failed'}. Please try again.`);
    }
  }, []);
  
  // Google Fit login function - use the API service instead of direct URL
  const loginGoogleFit = useCallback(async () => {
    try {
      console.log('Initiating Google Fit login...');
      // Let the service handle the URL construction
      await googleFitService.login();
    } catch (error) {
      console.error('Google Fit login failed:', error);
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAuthError(error.message || 'Google Fit login failed');
      alert(`Failed to connect to Google Fit: ${error.message || 'Request failed with status code 404'}. Please try again.`);
    }
  }, []);
  
  // YouTube Music login function
  const loginYouTubeMusic = useCallback(async () => {
    try {
      console.log('Initiating YouTube Music login...');
      // Use API service we'll create
      const response = await axios.get('/api/youtube-music/auth');
      if (response.data && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('No authorization URL returned from server');
      }
    } catch (error) {
      console.error('YouTube Music login failed:', error);
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAuthError(error.message || 'YouTube Music login failed');
      alert(`Failed to connect to YouTube Music: ${error.message || 'Authentication failed'}. Please try again.`);
    }
  }, []);

  // Legacy login function for backward compatibility but now allows any service connection
  const login = useCallback((service = 'fitbit') => {
    // Allow caller to specify which service to connect to
    switch (service.toLowerCase()) {
      case 'fitbit':
        return loginFitbit();
      case 'apple':
      case 'applefitness':
        return loginAppleFitness();
      case 'google':
      case 'googlefit':
        return loginGoogleFit();
      case 'youtube':
      case 'youtubemusic':
        return loginYouTubeMusic();
      default:
        return loginFitbit(); // Default for backward compatibility
    }
  }, [loginFitbit, loginAppleFitness, loginGoogleFit, loginYouTubeMusic]);

  // Logout function that can target a specific service
  const logout = useCallback(async (service) => {
    try {
      // If no specific service is provided, logout from all services
      if (!service) {
        await authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        setTokenScopes([]);
        setConnectedServices({
          fitbit: false,
          appleFitness: false,
          googleFit: false,
          youtubeMusic: false
        });
        console.log('Logged out from all services');
        return;
      }
      
      // Create a local copy of the current service connection state
      // This ensures we check against the correct value when deciding whether to clear user info
      const currentConnections = {...connectedServices};
      
      // Handle disconnection of specific services
      console.log(`Disconnecting from ${service}`);
      
      switch (service.toLowerCase()) {
        case 'fitbit':
          await authService.logout('fitbit');
          setConnectedServices(prev => ({...prev, fitbit: false}));
          // Only clear user if only fitbit was connected
          if (!currentConnections.appleFitness && !currentConnections.googleFit && !currentConnections.youtubeMusic) {
            setUser(null);
          }
          break;
          
        case 'apple':
        case 'applefitness':
          await authService.logout('apple');
          setConnectedServices(prev => ({...prev, appleFitness: false}));
          // Only clear user if only apple was connected 
          if (!currentConnections.fitbit && !currentConnections.googleFit && !currentConnections.youtubeMusic) {
            setUser(null);
          }
          break;
          
        case 'google':
        case 'googlefit':
          try {
            // Use specific endpoint for Google Fit logout
            const response = await axios.get('/api/google-fit/disconnect');
            if (response.data && response.data.success) {
              console.log('Successfully disconnected from Google Fit API');
            }
          } catch (googleError) {
            console.error('Error calling Google Fit disconnect API:', googleError);
          }
          
          // Also call the auth service logout for google
          await authService.logout('google');
          setConnectedServices(prev => ({...prev, googleFit: false}));
          
          // Only clear user if only google was connected
          if (!currentConnections.fitbit && !currentConnections.appleFitness && !currentConnections.youtubeMusic) {
            setUser(null);
          }
          break;
          
        case 'youtube':
        case 'youtubemusic':
          try {
            // Specific endpoint for YouTube Music logout
            const response = await axios.get('/api/youtube-music/disconnect');
            if (response.data && response.data.success) {
              setConnectedServices(prev => ({...prev, youtubeMusic: false}));
              console.log('Disconnected from YouTube Music');
            }
          } catch (youtubeMusicError) {
            console.error('Error disconnecting from YouTube Music:', youtubeMusicError);
          }
          break;
          
        default:
          console.warn(`Unknown service: ${service}, logging out from all`);
          await authService.logout();
          setIsAuthenticated(false);
          setUser(null);
          setTokenScopes([]);
          setConnectedServices({
            fitbit: false,
            appleFitness: false,
            googleFit: false,
            youtubeMusic: false
          });
      }
      
      // Update the authentication status after updating the connection state
      // We need to use a callback to access the updated state
      setConnectedServices(updatedConnections => {
        const isAnyServiceConnected = Object.values(updatedConnections).some(connected => connected);
        setIsAuthenticated(isAnyServiceConnected);
        return updatedConnections;
      });
      
    } catch (error) {
      console.error(`Logout from ${service || 'all services'} failed:`, error);
      setAuthError(error.message || 'Logout failed');
    }
  }, [connectedServices]);

  // Check Fitbit connection status
  const checkFitbitConnection = useCallback(async () => {
    try {
      const status = await fitbitService.checkStatus();
      console.log('Fitbit connection status check result:', status);
      
      // Get token info to check scopes
      try {
        const tokenInfo = await authService.checkAuth();
        console.log('Token info with scopes:', tokenInfo);
        
        // Check if 'heartrate' scope is granted
        if (tokenInfo.authenticated && tokenInfo.token && tokenInfo.token.scopes) {
          setTokenScopes(tokenInfo.token.scopes);
          const hasHeartrateScope = tokenInfo.token.scopes.includes('heartrate');
          console.log(`Heartrate scope granted: ${hasHeartrateScope}`);
          
          if (!hasHeartrateScope) {
            console.warn('⚠️ Heartrate scope is missing from the token. Heart rate features will use mock data.');
          }
        }
      } catch (scopeError) {
        console.error('Failed to check token scopes:', scopeError);
      }
      
      setConnectedServices(prev => ({...prev, fitbit: status.connected}));
      return status.connected;
    } catch (error) {
      console.error('Fitbit connection check failed:', error);
      setConnectedServices(prev => ({...prev, fitbit: false}));
      return false;
    }
  }, []);

  // Check Apple Fitness connection status
  const checkAppleFitnessConnection = useCallback(async () => {
    try {
      const status = await appleFitnessService.checkStatus();
      console.log('Apple Fitness connection status check result:', status);
      setConnectedServices(prev => ({...prev, appleFitness: status.connected}));
      return status.connected;
    } catch (error) {
      console.error('Apple Fitness connection check failed:', error);
      setConnectedServices(prev => ({...prev, appleFitness: false}));
      return false;
    }
  }, []);
  
  // Check Google Fit connection status
  const checkGoogleFitConnection = useCallback(async () => {
    try {
      const status = await googleFitService.checkStatus();
      console.log('Google Fit connection status check result:', status);
      setConnectedServices(prev => ({...prev, googleFit: status.connected}));
      return status.connected;
    } catch (error) {
      console.error('Google Fit connection check failed:', error);
      setConnectedServices(prev => ({...prev, googleFit: false}));
      return false;
    }
  }, []);

  // Check all connections status
  // Check YouTube Music connection status
  const checkYouTubeMusicConnection = useCallback(async () => {
    try {
      const response = await axios.get('/api/youtube-music/status');
      console.log('YouTube Music connection status check result:', response.data);
      setConnectedServices(prev => ({...prev, youtubeMusic: response.data.connected}));
      return response.data.connected;
    } catch (error) {
      console.error('YouTube Music connection check failed:', error);
      setConnectedServices(prev => ({...prev, youtubeMusic: false}));
      return false;
    }
  }, []);

  const checkConnection = useCallback(async () => {
    const fitbitConnected = await checkFitbitConnection();
    const appleConnected = await checkAppleFitnessConnection();
    const googleFitConnected = await checkGoogleFitConnection();
    const youtubeMusicConnected = await checkYouTubeMusicConnection();
    return fitbitConnected || appleConnected || googleFitConnected || youtubeMusicConnected;
  }, [checkFitbitConnection, checkAppleFitnessConnection, checkGoogleFitConnection, checkYouTubeMusicConnection]);

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    setIsLoading,
    user,
    authError,
    tokenScopes, // Add scopes to context for component access
    login,
    loginFitbit,
    loginAppleFitness,
    loginGoogleFit,
    loginYouTubeMusic,
    logout,
    checkAuthStatus,
    checkConnection,
    checkFitbitConnection,
    checkAppleFitnessConnection,
    checkGoogleFitConnection,
    checkYouTubeMusicConnection,
    connectedServices
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};