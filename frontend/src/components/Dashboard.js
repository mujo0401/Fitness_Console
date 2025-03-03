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
  Tabs,
  Tab,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SportsIcon from '@mui/icons-material/Sports';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ChatIcon from '@mui/icons-material/Chat';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoIcon from '@mui/icons-material/Info';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
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
  const { isAuthenticated, isLoading, login, checkConnection, checkAuthStatus, authError } = useAuth();
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
        <Box className="dashboard-header" sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' },
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            Health Console
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            View and analyze your personal health metrics
          </Typography>
          
          {showDebugTools && (
            <Button 
              variant="outlined" 
              size="small" 
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAuth}
              sx={{ mt: 2 }}
            >
              Refresh Auth Status
            </Button>
          )}
        </Box>
      </motion.div>

      {/* Always show tabs navigation, but control which tabs are accessible */}
      <Box sx={{ width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={8} 
            sx={{ 
              borderRadius: { xs: '16px', sm: '20px' }, 
              mb: { xs: 2, sm: 3, md: 4 }, 
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 245, 255, 0.9))',
              overflow: 'visible',
              boxShadow: '0 10px 30px rgba(33, 150, 243, 0.2), 0 -5px 15px rgba(63, 81, 181, 0.1)',
              border: '1px solid rgba(255,255,255,0.8)',
              position: 'sticky',
              top: { xs: 8, sm: 12, md: 16 },
              zIndex: 1100,
              backdropFilter: 'blur(10px)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%233f51b5\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                borderRadius: '20px'
              }
            }}
          >
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              variant="scrollable" // Always scrollable
              scrollButtons="auto"
              centered={false}
              allowScrollButtonsMobile={true}
              TabIndicatorProps={{
                sx: { display: 'none' }
              }}
              sx={{ 
                px: { xs: 1, sm: 2 },
                pt: 1.5,
                pb: 1,
                width: '100%',
                maxWidth: '100%',
                position: 'relative',
                '& .MuiTabs-flexContainer': {
                  gap: 1, // Consistent spacing
                },
                // Style for scroll buttons
                '& .MuiTabs-scrollButtons': {
                  opacity: 1,
                  color: '#5C6BC0',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  padding: '4px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  }
                },
                '& .MuiTab-root': {
                  color: '#5C6BC0', // Indigo color for tabs
                  px: { xs: 1.5, sm: 2 }, 
                  py: { xs: 1, sm: 1.2 },
                  minWidth: { xs: 100, sm: 110 }, // Fixed width for consistency
                  minHeight: 40,
                  margin: '0 2px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  fontWeight: 600,
                  border: '1px solid rgba(92, 107, 192, 0.1)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,249,255,0.8))',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  backdropFilter: 'blur(8px)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 3px 6px rgba(92, 107, 192, 0.15)'
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 0, // Hide default indicator
                }
              }}
            >
              {/* Heart Rate tab (moved Information tab to the end) */}
              <Tab 
                icon={<FavoriteIcon />}
                label="Heart Rate"
                disabled={!isAuthenticated}
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #F44336, #FF5252)',
                    border: '1px solid rgba(244, 67, 54, 0.8)',
                    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.3)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  }
                }}
              />
              <Tab 
                icon={<DirectionsRunIcon />}
                label="Activity"
                disabled={!isAuthenticated}
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 700,
                    backgroundColor: 'rgba(0, 150, 136, 0.6)',
                    border: '1px solid rgba(0, 150, 136, 0.8)',
                    boxShadow: '0 4px 20px rgba(0, 150, 136, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  }
                }}
              />
              <Tab 
                icon={<BedtimeIcon />}
                label="Sleep"
                disabled={!isAuthenticated}
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 700,
                    backgroundColor: 'rgba(103, 58, 183, 0.6)',
                    border: '1px solid rgba(103, 58, 183, 0.8)',
                    boxShadow: '0 4px 20px rgba(103, 58, 183, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  }
                }}
              />
              <Tab 
                icon={<PersonOutlineIcon />}
                label="ABM"
                disabled={!isAuthenticated}
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 700,
                    backgroundColor: 'rgba(156, 39, 176, 0.6)',
                    border: '1px solid rgba(156, 39, 176, 0.8)',
                    boxShadow: '0 4px 20px rgba(156, 39, 176, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  }
                }}
              />
              {/* Always accessible tabs */}
              <Tab 
                icon={<SportsIcon />}
                label="Fitness Plan"
                sx={{
                  minHeight: 60,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#4caf50',
                    fontWeight: 700,
                    backgroundColor: 'rgba(76, 175, 80, 0.05)',
                    boxShadow: '0 4px 10px rgba(76, 175, 80, 0.15)'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(76, 175, 80, 0.04)',
                    color: '#4caf50'
                  }
                }}
              />
              <Tab 
                icon={<HeadsetMicIcon />}
                label="Exercise Coach"
                sx={{
                  minHeight: 60,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#2196f3',
                    fontWeight: 700,
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    boxShadow: '0 4px 10px rgba(33, 150, 243, 0.15)'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                    color: '#2196f3'
                  }
                }}
              />
              <Tab 
                icon={<MusicNoteIcon />}
                label="Music"
                sx={{
                  minHeight: 60,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
                    border: '1px solid rgba(156, 39, 176, 0.7)',
                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3), inset 0 0 6px rgba(255, 255, 255, 0.3)'
                  },
                  '&:hover': {
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 6px 15px rgba(156, 39, 176, 0.2)'
                  }
                }}
              />
              <Tab 
                icon={<ShoppingCartIcon />}
                label="Grocery Shop"
                sx={{
                  minHeight: 60,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#43a047',
                    fontWeight: 700,
                    backgroundColor: 'rgba(67, 160, 71, 0.05)',
                    boxShadow: '0 4px 10px rgba(67, 160, 71, 0.15)'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(67, 160, 71, 0.04)',
                    color: '#43a047'
                  }
                }}
              />
              <Tab 
                icon={<AutoGraphIcon />}
                label="Trends"
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#ff9800',
                    fontWeight: 700,
                    backgroundColor: 'rgba(255, 152, 0, 0.05)',
                    boxShadow: '0 4px 10px rgba(255, 152, 0, 0.15)'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 152, 0, 0.04)',
                    color: '#ff9800'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  }
                }}
              />
              <Tab 
                icon={<ChatIcon />}
                label="Assistant"
                sx={{
                  minHeight: 60,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#2196f3',
                    fontWeight: 700,
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    boxShadow: '0 4px 10px rgba(33, 150, 243, 0.15)'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                    color: '#2196f3'
                  }
                }}
              />
              
              {/* Information tab - moved to the end */}
              <Tab 
                icon={<InfoIcon />}
                label="Information"
                sx={{
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #607D8B, #90A4AE)',
                    border: '1px solid rgba(96, 125, 139, 0.8)',
                    boxShadow: '0 4px 12px rgba(96, 125, 139, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.3)'
                  }
                }}
              />
            </Tabs>
            <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />
          </Paper>
        </motion.div>
        
        {/* Tab content */}
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ overflow: 'visible', paddingTop: '8px' }}
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
                  <ErrorBoundary fallback={<MinimalGroceryTab />}>
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
      </Box>
      
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
    </Container>
  );
};

export default Dashboard;
