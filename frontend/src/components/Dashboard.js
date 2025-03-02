// frontend/src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../context/AuthContext';
import ApiTester from './ApiTester'; 
import HeartTab from '../pages/HeartTab'; 
import SleepTab from '../pages/SleepTab'; 
import ActivityTab from '../pages/ActivityTab'; 
import FitnessTab from '../pages/FitnessTab';
import TrendsTab from '../pages/TrendsTab';
import GroceryTab from '../pages/GroceryTab';
import HealthAssistantTab from '../pages/HealthAssistantTab';
import ABMTab from '../pages/ABMTab';
import ExerciseCoach from './ExerciseCoach';
import MusicTab from '../pages/MusicTab';

import '../styles/Dashboard.css';

const Dashboard = () => {
  const theme = useTheme();
  const { isAuthenticated, isLoading, login, checkConnection, checkAuthStatus, authError } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [showDebugTools, setShowDebugTools] = useState(true); // Set to false in production
  const [currentTab, setCurrentTab] = useState(0); // Add state for tracking current tab
  const [manualAuthCheck, setManualAuthCheck] = useState(false);
  
  // Auto-redirect to Fitness Plan tab if not authenticated and on a protected tab
  useEffect(() => {
    if (!isAuthenticated && [0, 1, 2, 3, 8].includes(currentTab)) {
      // Redirect to Fitness Plan tab (index 4) if user tries to access protected tabs
      setCurrentTab(4);
    }
  }, [isAuthenticated, currentTab]);

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
    // Only allow changing to protected tabs if authenticated
    if (!isAuthenticated && [0, 1, 2, 3, 8].includes(newValue)) {
      // If not authenticated and trying to access protected tab, redirect to Fitness Plan tab
      setCurrentTab(4);
    } else {
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
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box className="dashboard-header" sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            Health Console
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
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
            elevation={3} 
            sx={{ 
              borderRadius: 4, 
              mb: 4, 
              background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
          >
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              sx={{ 
                px: { xs: 1, sm: 2 },
                pt: 2,
                pb: 0,
                '& .MuiTabs-flexContainer': {
                  gap: { xs: 0, sm: 0 } // Reduced gap between tabs
                },
                '& .MuiTab-root': {
                  px: { xs: 1, sm: 1.5 }, // Reduce padding of individual tabs
                  minWidth: { xs: 'auto', sm: 'auto' } // Allow tabs to be narrower
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(90deg, #3f51b5, #2196f3)'
                }
              }}
            >
              {/* Health data tabs - disabled when not authenticated */}
              <Tab 
                icon={<FavoriteIcon />} 
                aria-label="Heart Rate"
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Heart Rate"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#f44336',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(244, 67, 54, 0.04)',
                    color: '#f44336'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  }
                }}
              />
              <Tab 
                icon={<DirectionsRunIcon />}
                aria-label="Activity"
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Activity"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#009688',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0, 150, 136, 0.04)',
                    color: '#009688'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  }
                }}
              />
              <Tab 
                icon={<BedtimeIcon />}
                aria-label="Sleep"
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Sleep"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#673ab7',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(103, 58, 183, 0.04)',
                    color: '#673ab7'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  }
                }}
              />
              <Tab 
                icon={<PersonOutlineIcon />}
                aria-label="ABM"
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"ABM"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#9c27b0',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(156, 39, 176, 0.04)',
                    color: '#9c27b0'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  }
                }}
              />
              {/* Always accessible tabs */}
              <Tab 
                icon={<SportsIcon />}
                aria-label="Fitness Plan"
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Fitness Plan"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#4caf50',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(76, 175, 80, 0.04)',
                    color: '#4caf50'
                  }
                }}
              />
              <Tab 
                icon={<HeadsetMicIcon />}
                aria-label="Exercise Coach"
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Exercise Coach"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#2196f3',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                    color: '#2196f3'
                  }
                }}
              />
              <Tab 
                icon={<MusicNoteIcon />}
                aria-label="Music"
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Music"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#9c27b0',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(156, 39, 176, 0.04)',
                    color: '#9c27b0'
                  }
                }}
              />
              <Tab 
                icon={<ShoppingCartIcon />}
                aria-label="Grocery Shop"
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Grocery Shop"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#43a047',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(67, 160, 71, 0.04)',
                    color: '#43a047'
                  }
                }}
              />
              <Tab 
                icon={<AutoGraphIcon />}
                aria-label="Trends"
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Trends"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#ff9800',
                    fontWeight: 700,
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
                aria-label="Assistant"
                sx={{
                  minHeight: 60,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&::after': {
                    content: '"Assistant"',
                    position: 'absolute',
                    top: '110%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    visibility: 'hidden',
                    transition: 'all 0.2s ease',
                    zIndex: 1000,
                  },
                  '&:hover::after': {
                    opacity: 1,
                    visibility: 'visible',
                  },
                  '&.Mui-selected': {
                    color: '#2196f3',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.04)',
                    color: '#2196f3'
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
          style={{ overflow: 'visible' }}
        >
          {/* Heart rate tab content - needs auth */}
          {currentTab === 0 && (
            isAuthenticated ? (
              <HeartTab />
            ) : (
              <EmptyAccessDeniedComponent />
            )
          )}
          
          {/* Activity tab content - needs auth */}
          {currentTab === 1 && (
            isAuthenticated ? (
              <ActivityTab />
            ) : (
              <EmptyAccessDeniedComponent />
            )
          )}
          
          {/* Sleep tab content - needs auth */}
          {currentTab === 2 && (
            isAuthenticated ? (
              <SleepTab />
            ) : (
              <EmptyAccessDeniedComponent />
            )
          )}
          
          {/* ABM tab content - needs auth */}
          {currentTab === 3 && (
            isAuthenticated ? (
              <ABMTab />
            ) : (
              <EmptyAccessDeniedComponent />
            )
          )}
          
          {/* Fitness Plan tab - always accessible */}
          {currentTab === 4 && <FitnessTab />}
          
          {/* Exercise Coach tab - always accessible but better with auth */}
          {currentTab === 5 && <ExerciseCoach />}
          
          {/* Music tab - always accessible */}
          {currentTab === 6 && <MusicTab />}
          
          {/* Grocery Shop tab - always accessible */}
          {currentTab === 7 && <GroceryTab />}
          
          {/* Trends tab - needs auth */}
          {currentTab === 8 && (
            isAuthenticated ? (
              <TrendsTab />
            ) : (
              <EmptyAccessDeniedComponent />
            )
          )}
          
          {/* Assistant tab - always accessible */}
          {currentTab === 9 && <HealthAssistantTab />}
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
