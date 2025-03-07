// frontend/src/components/Dashboard.js

import React, { useState, useEffect, Suspense, useRef, Component } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Snackbar, 
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
// Import the TabContainer component
import TabContainer from './layout/TabContainer';
import { useAuth } from '../context/AuthContext';
import ApiTester from './ApiTester'; 
import HeartTab from '../pages/HeartTab'; 
import SleepTab from '../pages/SleepTab'; 
import ActivityTab from '../pages/ActivityTab'; 
import FitnessTab from '../pages/FitnessTab';
import TrendsTab from '../pages/TrendsTab';
// Import the fixed GroceryTab 
import GroceryTab from '../pages/GroceryTab';
import HealthAssistantTab from '../pages/HealthAssistantTab';
import ABMTab from '../pages/ABMTab';
import ExerciseCoach from './ExerciseCoach';
import MusicTab from '../pages/MusicTab';
import InfoTab from '../pages/InfoTab';

import '../styles/Dashboard.css';

// Error boundary component for handling rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return this.props.fallback || (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">
            Something went wrong. Please refresh the page.
          </Typography>
        </Box>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

const Dashboard = () => {
  const theme = useTheme();
  const { isAuthenticated, isLoading, setIsLoading, login, checkConnection, checkAuthStatus, authError } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [showDebugTools, setShowDebugTools] = useState(true); // Set to false in production
  const [currentTab, setCurrentTab] = useState(10); // Use 10 for Info tab (now the last tab)
  const [manualAuthCheck, setManualAuthCheck] = useState(false);
  
  // Simplified tab mapping with Information tab at the end (index 10)
  // Recipe Planner has been integrated into Grocery Shop tab
  const tabComponentsMap = {
    '0': HeartTab,           // Heart Rate (index 0)
    '1': ActivityTab,        // Activity (index 1)
    '2': SleepTab,           // Sleep (index 2)
    '3': ABMTab,             // ABM (index 3)
    '4': FitnessTab,         // Fitness Plan (index 4)
    '5': ExerciseCoach,      // Exercise Coach (index 5)
    '6': MusicTab,           // Music (index 6)
    '7': GroceryTab,         // Grocery Shop (index 7) - with Recipe Planner integrated
    '8': TrendsTab,          // Trends (index 8)
    '9': HealthAssistantTab, // Assistant (index 9)
    '10': InfoTab            // Information (index 10) - now last tab
  };
  
  // Auto-redirect to Fitness Plan tab if not authenticated and on a protected tab
  useEffect(() => {
    if (!isAuthenticated && [0, 1, 2, 3, 8].includes(currentTab)) {
      // Redirect to Fitness Plan tab (index 4) if user tries to access protected tabs
      setCurrentTab(4);
    }
  }, [isAuthenticated, currentTab]);

  // Set default tab to Info when app loads
  useEffect(() => {
    if (currentTab === 10) {
      // Default to Info tab as landing page
      console.log('Setting default tab to Info tab (index 10)');
    }
    
    // Simple debug log
    console.log(`Current tab index: ${currentTab}`);
  }, [currentTab]);

  useEffect(() => {
    // Check authentication status when component mounts
    console.log('Dashboard mounting, checking auth status');
    checkAuthStatus();
    setIsLoading(false); // Force loading to complete
    
    // Check for auth parameter in URL (from callback)
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    
    if (authStatus === 'success') {
      setAlertMessage('Successfully connected to Fitbit!');
      setAlertSeverity('success');
      setAlertOpen(true);
      
      // Remove the query parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Refresh auth status
      checkAuthStatus();
    } else if (authStatus === 'error') {
      setAlertMessage('Failed to connect to Fitbit. Please try again.');
      setAlertSeverity('error');
      setAlertOpen(true);
      
      // Remove the query parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkAuthStatus]);

  useEffect(() => {
    // Display auth errors as alerts
    if (authError) {
      setAlertMessage(`Authentication error: ${authError}`);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }, [authError]);

  useEffect(() => {
    // Check connection status when dashboard loads or authentication changes
    const checkConnectionStatus = async () => {
      if (isAuthenticated) {
        setConnectionLoading(true);
        try {
          const status = await checkConnection();
          setIsConnected(status);
        } catch (error) {
          console.error("Connection check failed:", error);
          setIsConnected(false);
        } finally {
          setConnectionLoading(false);
        }
      } else {
        setIsConnected(false);
        setConnectionLoading(false);
      }
    };

    checkConnectionStatus();
  }, [isAuthenticated, checkConnection, manualAuthCheck]);

  const handleConnectClick = () => {
    try {
      console.log('Connect button clicked, initiating login...');
      login();
    } catch (error) {
      console.error('Failed to initiate Fitbit connection:', error);
      setAlertMessage(`Failed to connect to Fitbit: ${error.message}`);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleRefreshAuth = () => {
    setManualAuthCheck(prev => !prev);
    checkAuthStatus();
    setAlertMessage('Manually refreshed authentication status');
    setAlertSeverity('info');
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    // Simple logging
    console.log(`Tab clicked: Index ${newValue}`);
    
    // Only allow changing to protected tabs if authenticated
    if (!isAuthenticated && [0, 1, 2, 3, 8].includes(newValue)) {
      // If not authenticated and trying to access protected tab, redirect to Fitness Plan tab
      console.log('Protected tab requested, redirecting to Fitness Plan (4)');
      setCurrentTab(4);
    } else {
      console.log(`Setting current tab to index ${newValue}`);
      setCurrentTab(newValue);
    }
  };

  // Show enhanced loading state with debug info
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main, mb: 4 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>Loading your dashboard...</Typography>
        
        {showDebugTools && (
          <Box sx={{ mt: 2, p: 3, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2, maxWidth: '80%' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Debug Info:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              isAuthenticated: {String(isAuthenticated)}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              isLoading: {String(isLoading)}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              authError: {authError || 'none'}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 2 }}
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAuth}
            >
              Refresh Auth Status
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // Empty component to replace the login prompt - we'll automatically redirect instead
  const EmptyAccessDeniedComponent = () => {
    return (
      <Box sx={{ height: 0, overflow: 'hidden' }} />
    );
  };

  return (
    <>
      <Container 
        maxWidth="xl" 
        sx={{ 
          pt: { xs: 2, sm: 3, md: 4 }, 
          pb: { xs: 2, sm: 3, md: 4 }, 
          px: { xs: 1, sm: 2, md: 3 },
          position: 'relative' 
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box className="dashboard-header" sx={{ mb: { xs: 1, sm: 2, md: 3 } }}>
            {/* Header content removed */}
          </Box>
        </motion.div>

        {/* Use the TabContainer component with fixed height */}
        <TabContainer 
          currentTab={currentTab} 
          handleTabChange={handleTabChange} 
          isAuthenticated={isAuthenticated} 
        />
          
          {/* Tab content - no top padding needed now that TabContainer has fixed height and margin */}
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ overflow: 'visible' }}
          >
            {/* SIMPLIFIED APPROACH: Direct rendering with simplified logic */}
            {(() => {
              const requiresAuth = [0, 1, 2, 3, 8].includes(currentTab);
              
              // Show auth warning if needed
              if (requiresAuth && !isAuthenticated) {
                return <EmptyAccessDeniedComponent />;
              }
              
              // Get the component from our map
              const TabComponent = tabComponentsMap[currentTab.toString()];
              
              // Basic logging and fallback
              if (!TabComponent) {
                console.error(`No component found for tab index ${currentTab}`);
                return <Typography color="error">Tab content not found</Typography>;
              }
              
              // Handle the case where GroceryTab might be broken
              if (currentTab === 7) { // GroceryTab index
                return (
                  <Suspense fallback={<CircularProgress />}>
                    <ErrorBoundary fallback={<Typography variant="h6" sx={{ p: 3 }}>Unable to load Grocery Shop</Typography>}>
                      <TabComponent />
                    </ErrorBoundary>
                  </Suspense>
                );
              }
              
              // Render other components normally
              return (
                <Suspense fallback={<CircularProgress />}>
                  <TabComponent />
                </Suspense>
              );
            })()}
          </motion.div>
        </Container>
        
        <Snackbar 
          open={alertOpen} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity={alertSeverity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
    </>
  );
};

export default Dashboard;
