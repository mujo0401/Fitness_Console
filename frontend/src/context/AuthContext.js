// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { authService, fitbitService, appleFitnessService } from '../services/api';

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
    appleFitness: false
  });

  // Check if user is authenticated
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Checking authentication status...');
      const response = await authService.checkAuth();
      console.log('Auth check response:', response);
      
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
      } else {
        console.log('User is not authenticated');
        setIsAuthenticated(false);
        setUser(null);
        setConnectedServices({
          fitbit: false,
          appleFitness: false
        });
      }
      
      // Clear any previous auth errors on successful check
      setAuthError(null);
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setConnectedServices({
        fitbit: false,
        appleFitness: false
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
      const response = await authService.login();
      
      console.log('Full login response:', JSON.stringify(response, null, 2));
      
      if (response && response.authorization_url) {
        console.log('Redirecting to:', response.authorization_url);
        // Redirect to Fitbit authorization page
        window.location.href = response.authorization_url;
      } else {
        console.error('Invalid response from login endpoint:', response);
        setAuthError('Failed to connect to Fitbit. No authorization URL provided.');
        alert('Failed to connect to Fitbit. Please try again.');
      }
    } catch (error) {
      console.error('Fitbit login failed:', error);
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAuthError(error.message || 'Fitbit login failed');
      alert(`Failed to connect to Fitbit: ${error.message}. Please try again.`);
    }
  }, []);

  // Apple Fitness login function
  const loginAppleFitness = useCallback(async () => {
    try {
      console.log('Initiating Apple Fitness login...');
      const response = await appleFitnessService.login();
      
      console.log('Full Apple Fitness login response:', JSON.stringify(response, null, 2));
      
      if (response && response.authorization_url) {
        console.log('Redirecting to:', response.authorization_url);
        // Redirect to Apple Fitness authorization page
        window.location.href = response.authorization_url;
      } else {
        console.error('Invalid response from Apple Fitness login endpoint:', response);
        setAuthError('Failed to connect to Apple Fitness. No authorization URL provided.');
        alert('Failed to connect to Apple Fitness. Please try again.');
      }
    } catch (error) {
      console.error('Apple Fitness login failed:', error);
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAuthError(error.message || 'Apple Fitness login failed');
      alert(`Failed to connect to Apple Fitness: ${error.message}. Please try again.`);
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

  // Check all connections status
  const checkConnection = useCallback(async () => {
    const fitbitConnected = await checkFitbitConnection();
    const appleConnected = await checkAppleFitnessConnection();
    return fitbitConnected || appleConnected;
  }, [checkFitbitConnection, checkAppleFitnessConnection]);

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    authError,
    login,
    loginFitbit,
    loginAppleFitness,
    logout,
    checkAuthStatus,
    checkConnection,
    checkFitbitConnection,
    checkAppleFitnessConnection,
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