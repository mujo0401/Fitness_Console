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
      const response = await authService.checkAuth();
      console.log('Auth check response:', response);
      
      // Store token scopes if available
      if (response.authenticated && response.token && response.token.scopes) {
        setTokenScopes(response.token.scopes);
        
        // Check for missing scopes
        const requiredScopes = ['heartrate', 'activity', 'sleep', 'profile'];
        const missingScopes = requiredScopes.filter(scope => !response.token.scopes.includes(scope));
        
        if (missingScopes.length > 0) {
          console.warn(`⚠️ Missing required scopes: ${missingScopes.join(', ')}`);
          console.warn('Some features may not work correctly due to missing permissions.');
        }
      }
      
      if (response.authenticated) {
        setIsAuthenticated(true);
        console.log('User is authenticated, fetching profiles...');
        
        try {
          // Try to get Fitbit profile
          const fitbitResponse = await fitbitService.checkStatus();
          if (fitbitResponse && fitbitResponse.connected) {
            setConnectedServices(prev => ({...prev, fitbit: true}));
            
            // Get user profile if not already set
            if (!user) {
              const profileResponse = await fitbitService.getProfile();
              console.log('Fitbit profile response:', profileResponse);
              if (profileResponse && profileResponse.user) {
                setUser(profileResponse.user);
              }
            }
          } else {
            setConnectedServices(prev => ({...prev, fitbit: false}));
          }
        } catch (fitbitError) {
          console.error('Error fetching Fitbit connection status:', fitbitError);
          setConnectedServices(prev => ({...prev, fitbit: false}));
        }
        
        try {
          // Try to get Apple Fitness status
          const appleResponse = await appleFitnessService.checkStatus();
          if (appleResponse && appleResponse.connected) {
            setConnectedServices(prev => ({...prev, appleFitness: true}));
            
            // Get Apple Fitness profile if user not set and Fitbit not connected
            if (!user && !connectedServices.fitbit) {
              const profileResponse = await appleFitnessService.getProfile();
              console.log('Apple Fitness profile response:', profileResponse);
              if (profileResponse && profileResponse.user) {
                setUser(profileResponse.user);
              }
            }
          } else {
            setConnectedServices(prev => ({...prev, appleFitness: false}));
          }
        } catch (appleError) {
          console.error('Error fetching Apple Fitness connection status:', appleError);
          setConnectedServices(prev => ({...prev, appleFitness: false}));
        }
        
        try {
          // Try to get Google Fit status
          const googleFitResponse = await googleFitService.checkStatus();
          if (googleFitResponse && googleFitResponse.connected) {
            setConnectedServices(prev => ({...prev, googleFit: true}));
            
            // Get Google Fit profile if user not set and neither Fitbit nor Apple Fitness are connected
            if (!user && !connectedServices.fitbit && !connectedServices.appleFitness) {
              const profileResponse = await googleFitService.getProfile();
              console.log('Google Fit profile response:', profileResponse);
              if (profileResponse && profileResponse.user) {
                setUser(profileResponse.user);
              }
            }
          } else {
            setConnectedServices(prev => ({...prev, googleFit: false}));
          }
        } catch (googleFitError) {
          console.error('Error fetching Google Fit connection status:', googleFitError);
          setConnectedServices(prev => ({...prev, googleFit: false}));
        }
        
        try {
          // Try to get YouTube Music status
          const youtubeMusicResponse = await axios.get('/api/youtube-music/status');
          if (youtubeMusicResponse.data && youtubeMusicResponse.data.connected) {
            setConnectedServices(prev => ({...prev, youtubeMusic: true}));
          } else {
            setConnectedServices(prev => ({...prev, youtubeMusic: false}));
          }
        } catch (youtubeMusicError) {
          console.error('Error fetching YouTube Music connection status:', youtubeMusicError);
          setConnectedServices(prev => ({...prev, youtubeMusic: false}));
        }
      } else {
        console.log('User is not authenticated');
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
  }, [user, connectedServices.fitbit]);

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

  // Legacy login function for backward compatibility
  const login = useCallback(() => {
    return loginFitbit();
  }, [loginFitbit]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setTokenScopes([]);
      setConnectedServices({
        fitbit: false,
        appleFitness: false
      });
    } catch (error) {
      console.error('Logout failed:', error);
      setAuthError(error.message || 'Logout failed');
    }
  }, []);

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