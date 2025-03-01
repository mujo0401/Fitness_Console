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
    setCurrentTab(newValue);
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

  // Login prompt component for tabs that require authentication
  const LoginPromptCard = ({ handleConnectClick }) => {
    return (
      <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #3f51b5, #2196f3)', height: 8 }} />
        <CardContent sx={{ py: 4, px: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <FitnessCenterIcon sx={{ fontSize: 50, color: theme.palette.primary.main, mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Connect to Fitbit
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
              This tab requires Fitbit authentication to access your personal health data.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleConnectClick}
              startIcon={<FitnessCenterIcon />}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 30,
                background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
                boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 10px 30px rgba(33, 150, 243, 0.4)',
                  background: 'linear-gradient(90deg, #3949ab, #1e88e5)'
                }
              }}
            >
              Connect Fitbit
            </Button>
          </Box>
        </CardContent>
      </Card>
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
            Health Dashboard
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
                px: { xs: 2, sm: 4 },
                pt: 2,
                pb: 0,
                '& .MuiTabs-flexContainer': {
                  gap: { xs: 1, sm: 2 }
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
                label="Heart Rate" 
                icon={<FavoriteIcon />} 
                iconPosition="start" 
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
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
                label="Activity" 
                icon={<DirectionsRunIcon />} 
                iconPosition="start" 
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
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
                label="Sleep" 
                icon={<BedtimeIcon />} 
                iconPosition="start" 
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
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
                label="ABM" 
                icon={<PersonOutlineIcon />} 
                iconPosition="start" 
                disabled={!isAuthenticated}
                sx={{
                  minHeight: 60,
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
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
                label="Fitness Plan" 
                icon={<SportsIcon />} 
                iconPosition="start" 
                sx={{
                  minHeight: 60,
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
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
                label="Grocery Shop" 
                icon={<ShoppingCartIcon />} 
                iconPosition="start" 
                sx={{
                  minHeight: 60,
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
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
                label="Trends" 
                icon={<AutoGraphIcon />} 
                iconPosition="start" 
                sx={{
                  minHeight: 60,
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#ff9800',
                    fontWeight: 700,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 152, 0, 0.04)',
                    color: '#ff9800'
                  }
                }}
              />
              <Tab 
                label="Assistant" 
                icon={<ChatIcon />} 
                iconPosition="start" 
                sx={{
                  minHeight: 60,
                  borderRadius: '10px 10px 0 0',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
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
        >
          {/* Heart rate tab content - needs auth */}
          {currentTab === 0 && (
            isAuthenticated ? (
              <HeartTab />
            ) : (
              <LoginPromptCard handleConnectClick={handleConnectClick} />
            )
          )}
          
          {/* Activity tab content - needs auth */}
          {currentTab === 1 && (
            isAuthenticated ? (
              <ActivityTab />
            ) : (
              <LoginPromptCard handleConnectClick={handleConnectClick} />
            )
          )}
          
          {/* Sleep tab content - needs auth */}
          {currentTab === 2 && (
            isAuthenticated ? (
              <SleepTab />
            ) : (
              <LoginPromptCard handleConnectClick={handleConnectClick} />
            )
          )}
          
          {/* ABM tab content - needs auth */}
          {currentTab === 3 && (
            isAuthenticated ? (
              <ABMTab />
            ) : (
              <LoginPromptCard handleConnectClick={handleConnectClick} />
            )
          )}
          
          {/* Fitness Plan tab - always accessible */}
          {currentTab === 4 && <FitnessTab />}
          
          {/* Grocery Shop tab - always accessible */}
          {currentTab === 5 && <GroceryTab />}
          
          {/* Trends tab - always accessible */}
          {currentTab === 6 && <TrendsTab />}
          
          {/* Assistant tab - always accessible */}
          {currentTab === 7 && <HealthAssistantTab />}
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
