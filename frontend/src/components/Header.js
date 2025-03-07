import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider,
  ListItemIcon,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  Paper,
  ListItemText,
  Stack,
  Switch,
  styled
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AppleIcon from '@mui/icons-material/Apple';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import GoogleIcon from '@mui/icons-material/Google';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    user, 
    login, 
    logout, 
    loginFitbit, 
    loginAppleFitness, 
    loginGoogleFit, 
    loginYouTubeMusic, 
    connectedServices,
    checkFitbitConnection,
    checkAppleFitnessConnection,
    checkGoogleFitConnection,
    checkYouTubeMusicConnection
  } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  const [servicesMenuEl, setServicesMenuEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState(78);
  
  // Check if all services are connected
  const allServicesConnected = connectedServices.fitbit && connectedServices.appleFitness && connectedServices.googleFit && connectedServices.youtubeMusic;

  // Update heart rate with animation
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setInterval(() => {
        setCurrentHeartRate(prev => {
          const change = Math.floor(Math.random() * 5) - 2;
          return Math.max(60, Math.min(90, prev + change));
        });
      }, 3000);
      
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);
  
  // Detect scroll position to change header style
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationOpen = (event) => {
    setNotificationEl(event.currentTarget);
  };
  
  const handleNotificationClose = () => {
    setNotificationEl(null);
  };

  const handleServicesMenuOpen = (event) => {
    setServicesMenuEl(event.currentTarget);
  };

  const handleServicesMenuClose = () => {
    setServicesMenuEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };
  
  const navigateToProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };
  
  const navigateToSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  // Styled switch component with fancy animation
  const ConnectSwitch = styled(Switch)(({ theme, color }) => ({
    width: 56,
    height: 28,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 3,
      '&.Mui-checked': {
        transform: 'translateX(28px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: color === 'youtube' 
            ? '#FF0000' 
            : color === 'google' 
              ? '#4285F4' 
              : color === 'apple' 
                ? '#A2AAAD' 
                : '#00B0B9',
          backgroundImage: `linear-gradient(45deg, 
            ${color === 'youtube' 
              ? '#FF0000, #CC0000' 
              : color === 'google' 
                ? '#4285F4, #34A853' 
                : color === 'apple' 
                  ? '#A2AAAD, #5F5F5F' 
                  : '#00B0B9, #14D8E6'})`,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      width: 22,
      height: 22,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s',
    },
    '& .MuiSwitch-track': {
      borderRadius: 14,
      opacity: 1,
      backgroundColor: alpha(theme.palette.grey[500], 0.3),
      boxSizing: 'border-box',
      transition: 'all 0.3s',
    },
  }));
  
  // Handle disconnect services
  const handleDisconnectFitbit = async () => {
    try {
      await logout('fitbit');
      await checkFitbitConnection();
    } catch (error) {
      console.error("Failed to disconnect Fitbit:", error);
    }
  };
  
  const handleDisconnectApple = async () => {
    try {
      await logout('apple');
      await checkAppleFitnessConnection();
    } catch (error) {
      console.error("Failed to disconnect Apple Fitness:", error);
    }
  };
  
  const handleDisconnectGoogle = async () => {
    try {
      await logout('google');
      await checkGoogleFitConnection();
    } catch (error) {
      console.error("Failed to disconnect Google Fit:", error);
    }
  };
  
  const handleDisconnectYouTube = async () => {
    try {
      await logout('youtube');
      await checkYouTubeMusicConnection();
    } catch (error) {
      console.error("Failed to disconnect YouTube Music:", error);
    }
  };

  // Services menu content with enhanced styling
  const servicesMenu = (
    <Menu
      anchorEl={servicesMenuEl}
      open={Boolean(servicesMenuEl)}
      onClose={handleServicesMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 320,
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(240,240,255,0.95))',
          backdropFilter: 'blur(20px)',
          overflow: 'visible',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          }
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Typography variant="h6" sx={{ 
        px: 3, 
        pt: 2, 
        pb: 1, 
        fontWeight: 'bold',
        background: 'linear-gradient(45deg, #673ab7, #3f51b5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <LinkIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
        Connect Services
      </Typography>
      
      <Box sx={{ px: 1, pt: 2, pb: 1 }}>
        {/* Fitbit Connection */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`fitbit-${connectedServices.fitbit}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{ 
                mb: 2, 
                p: 1.5,
                borderRadius: 2,
                background: connectedServices.fitbit 
                  ? 'linear-gradient(to right, rgba(0,176,185,0.1), rgba(20,216,230,0.05))' 
                  : 'rgba(0,0,0,0.03)',
                border: connectedServices.fitbit 
                  ? '1px solid rgba(0,176,185,0.2)' 
                  : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{ 
                    background: connectedServices.fitbit 
                      ? 'linear-gradient(45deg, #00B0B9, #14D8E6)'
                      : alpha(theme.palette.grey[500], 0.1),
                    color: connectedServices.fitbit ? 'white' : theme.palette.text.secondary,
                    boxShadow: connectedServices.fitbit 
                      ? '0 4px 10px rgba(0,176,185,0.3)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FitnessCenterIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                    Fitbit
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color={connectedServices.fitbit ? "primary" : "text.secondary"}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    {connectedServices.fitbit 
                      ? <><CheckCircleIcon fontSize="inherit" /> Connected</> 
                      : "Not connected"}
                  </Typography>
                </Box>
              </Box>
              
              {connectedServices.fitbit ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  startIcon={<LinkOffIcon />}
                  onClick={handleDisconnectFitbit}
                  sx={{ 
                    borderRadius: 20,
                    textTransform: 'none'
                  }}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  startIcon={<LinkIcon />}
                  onClick={() => {
                    loginFitbit();
                    handleServicesMenuClose();
                  }}
                  sx={{ 
                    borderRadius: 20,
                    background: 'linear-gradient(45deg, #00B0B9, #14D8E6)',
                    textTransform: 'none'
                  }}
                >
                  Connect
                </Button>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>
        
        {/* Apple Fitness Connection */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`apple-${connectedServices.appleFitness}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <Paper
              elevation={0}
              sx={{ 
                mb: 2, 
                p: 1.5,
                borderRadius: 2,
                background: connectedServices.appleFitness 
                  ? 'linear-gradient(to right, rgba(162,170,173,0.1), rgba(95,95,95,0.05))' 
                  : 'rgba(0,0,0,0.03)',
                border: connectedServices.appleFitness 
                  ? '1px solid rgba(162,170,173,0.2)' 
                  : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{ 
                    background: connectedServices.appleFitness 
                      ? 'linear-gradient(45deg, #A2AAAD, #5F5F5F)'
                      : alpha(theme.palette.grey[500], 0.1),
                    color: connectedServices.appleFitness ? 'white' : theme.palette.text.secondary,
                    boxShadow: connectedServices.appleFitness 
                      ? '0 4px 10px rgba(95,95,95,0.3)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <AppleIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                    Apple Fitness
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color={connectedServices.appleFitness ? "text.secondary" : "text.secondary"}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    {connectedServices.appleFitness 
                      ? <><CheckCircleIcon fontSize="inherit" sx={{ color: '#5F5F5F' }} /> Connected</> 
                      : "Not connected"}
                  </Typography>
                </Box>
              </Box>
              
              {connectedServices.appleFitness ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  startIcon={<LinkOffIcon />}
                  onClick={handleDisconnectApple}
                  sx={{ 
                    borderRadius: 20,
                    textTransform: 'none'
                  }}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<LinkIcon />}
                  onClick={() => {
                    loginAppleFitness();
                    handleServicesMenuClose();
                  }}
                  sx={{ 
                    borderRadius: 20,
                    background: 'linear-gradient(45deg, #A2AAAD, #5F5F5F)',
                    color: 'white',
                    textTransform: 'none'
                  }}
                >
                  Connect
                </Button>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>
        
        {/* Google Fit Connection */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`google-${connectedServices.googleFit}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{ 
                mb: 2, 
                p: 1.5,
                borderRadius: 2,
                background: connectedServices.googleFit 
                  ? 'linear-gradient(to right, rgba(66,133,244,0.1), rgba(52,168,83,0.05))' 
                  : 'rgba(0,0,0,0.03)',
                border: connectedServices.googleFit 
                  ? '1px solid rgba(66,133,244,0.2)' 
                  : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{ 
                    background: connectedServices.googleFit 
                      ? 'linear-gradient(45deg, #4285F4, #34A853)'
                      : alpha(theme.palette.grey[500], 0.1),
                    color: connectedServices.googleFit ? 'white' : theme.palette.text.secondary,
                    boxShadow: connectedServices.googleFit 
                      ? '0 4px 10px rgba(66,133,244,0.3)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <GoogleIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                    Google Fit
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      color: connectedServices.googleFit ? '#4285F4' : theme.palette.text.secondary
                    }}
                  >
                    {connectedServices.googleFit 
                      ? <><CheckCircleIcon fontSize="inherit" sx={{ color: '#4285F4' }} /> Connected</> 
                      : "Not connected"}
                  </Typography>
                </Box>
              </Box>
              
              {connectedServices.googleFit ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  startIcon={<LinkOffIcon />}
                  onClick={handleDisconnectGoogle}
                  sx={{ 
                    borderRadius: 20,
                    textTransform: 'none'
                  }}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<LinkIcon />}
                  onClick={() => {
                    loginGoogleFit();
                    handleServicesMenuClose();
                  }}
                  sx={{ 
                    borderRadius: 20,
                    background: 'linear-gradient(45deg, #4285F4, #34A853)',
                    color: 'white',
                    textTransform: 'none'
                  }}
                >
                  Connect
                </Button>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>
        
        {/* YouTube Music Connection */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`youtube-${connectedServices.youtubeMusic}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <Paper
              elevation={0}
              sx={{ 
                mb: 2, 
                p: 1.5,
                borderRadius: 2,
                background: connectedServices.youtubeMusic 
                  ? 'linear-gradient(to right, rgba(255,0,0,0.1), rgba(204,0,0,0.05))' 
                  : 'rgba(0,0,0,0.03)',
                border: connectedServices.youtubeMusic 
                  ? '1px solid rgba(255,0,0,0.2)' 
                  : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{ 
                    background: connectedServices.youtubeMusic 
                      ? 'linear-gradient(45deg, #FF0000, #CC0000)'
                      : alpha(theme.palette.grey[500], 0.1),
                    color: connectedServices.youtubeMusic ? 'white' : theme.palette.text.secondary,
                    boxShadow: connectedServices.youtubeMusic 
                      ? '0 4px 10px rgba(255,0,0,0.3)'
                      : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <YouTubeIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'medium', lineHeight: 1.2 }}>
                    YouTube Music
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      color: connectedServices.youtubeMusic ? '#FF0000' : theme.palette.text.secondary
                    }}
                  >
                    {connectedServices.youtubeMusic 
                      ? <><CheckCircleIcon fontSize="inherit" sx={{ color: '#FF0000' }} /> Connected</> 
                      : "Not connected"}
                  </Typography>
                </Box>
              </Box>
              
              {connectedServices.youtubeMusic ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  startIcon={<LinkOffIcon />}
                  onClick={handleDisconnectYouTube}
                  sx={{ 
                    borderRadius: 20,
                    textTransform: 'none'
                  }}
                >
                  Disconnect
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<LinkIcon />}
                  onClick={() => {
                    loginYouTubeMusic();
                    handleServicesMenuClose();
                  }}
                  sx={{ 
                    borderRadius: 20,
                    background: 'linear-gradient(45deg, #FF0000, #CC0000)',
                    color: 'white',
                    textTransform: 'none'
                  }}
                >
                  Connect
                </Button>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Box>
      
      <Divider sx={{ mx: 2 }} />
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Button 
          fullWidth
          variant="contained"
          startIcon={<SyncIcon />}
          onClick={handleServicesMenuClose}
          disabled={!connectedServices.fitbit && !connectedServices.appleFitness && !connectedServices.googleFit}
          sx={{ 
            borderRadius: 30,
            background: 'linear-gradient(45deg, #673ab7 0%, #9c27b0 100%)',
            textTransform: 'none',
            py: 1
          }}
        >
          Sync Data Now
        </Button>
      </Box>
    </Menu>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 0}
        sx={{ 
          background: scrolled 
            ? 'linear-gradient(90deg, rgba(33,150,243,0.95) 0%, rgba(63,81,181,0.95) 100%)'
            : 'linear-gradient(90deg, rgba(33,150,243,0.6) 0%, rgba(63,81,181,0.6) 100%)',
          backdropFilter: scrolled ? 'blur(10px)' : 'blur(5px)',
          transition: 'all 0.3s ease',
          borderBottom: scrolled ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Toolbar sx={{ py: scrolled ? 0.5 : 1 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessCenterIcon sx={{ 
                fontSize: scrolled ? 28 : 32, 
                color: 'white',
                filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))'
              }} />
              <Typography 
                variant={scrolled ? "h6" : "h5"} 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #ffffff, #e0e0e0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease'
                }}
              >
                Health Hustle
              </Typography>
            </Box>
          </motion.div>
          
          <Box sx={{ flexGrow: 1 }} />

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Connect Services button - only shown when authenticated and not all services are connected */}
              {!allServicesConnected && (
                <Button 
                  variant="contained" 
                  onClick={handleServicesMenuOpen}
                  color="secondary"
                  endIcon={<ArrowDropDownIcon />}
                  size="small"
                  sx={{ 
                    borderRadius: 30,
                    px: 2.5,
                    minWidth: 160,
                    textTransform: 'none',
                    fontWeight: 'medium',
                    background: 'linear-gradient(45deg, #673ab7 0%, #9c27b0 100%)',
                    boxShadow: '0 5px 15px rgba(156, 39, 176, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5e35b1 0%, #8e24aa 100%)',
                      boxShadow: '0 3px 10px rgba(156, 39, 176, 0.3)',
                    }
                  }}
                >
                  Connect Services
                </Button>
              )}
              
              {/* Live heart rate indicator */}
              <Paper 
                elevation={0}
                sx={{ 
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 30,
                  background: alpha('#f44336', 0.2),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(244, 67, 54, 0.3)'
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.8, 
                    ease: "easeInOut" 
                  }}
                >
                  <FavoriteIcon color="error" />
                </motion.div>
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'white' }}>
                  {currentHeartRate} BPM
                </Typography>
              </Paper>
              
              {/* Steps counter */}
              <Paper 
                elevation={0}
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 30,
                  background: alpha('#2196f3', 0.2),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }}
              >
                <DirectionsRunIcon sx={{ color: '#2196f3' }} />
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'white' }}>
                  8,475 Steps
                </Typography>
              </Paper>
              
              {/* Calories */}
              <Paper 
                elevation={0}
                sx={{ 
                  display: { xs: 'none', lg: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 30,
                  background: alpha('#ff9800', 0.2),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 152, 0, 0.3)'
                }}
              >
                <LocalFireDepartmentIcon sx={{ color: '#ff9800' }} />
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'white' }}>
                  1,283 Cal
                </Typography>
              </Paper>
              
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton 
                  color="inherit"
                  onClick={handleNotificationOpen}
                  sx={{ 
                    bgcolor: alpha(theme.palette.background.paper, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.2),
                    }
                  }}
                >
                  <Badge badgeContent={2} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={notificationEl}
                open={Boolean(notificationEl)}
                onClose={handleNotificationClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    width: 320,
                    maxHeight: 400,
                    borderRadius: 3,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)'
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Typography sx={{ p: 2, fontWeight: 'bold' }}>
                  Notifications
                </Typography>
                <Divider />
                <MenuItem sx={{ 
                  py: 2, 
                  borderLeft: '4px solid #f44336',
                  '&:hover': { bgcolor: alpha('#f44336', 0.05) }
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      Abnormal Heart Rate Detected
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Peak of 155 BPM detected at rest - 10 minutes ago
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem sx={{ 
                  py: 2, 
                  borderLeft: '4px solid #4caf50',
                  '&:hover': { bgcolor: alpha('#4caf50', 0.05) }
                }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      Daily Goal Achieved
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      You've reached your step goal of 8,000 steps!
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                  <Button size="small" endIcon={<ChevronRightIcon />}>
                    View All
                  </Button>
                </Box>
              </Menu>
              
              {/* User menu */}
              <Tooltip title="Account">
                <IconButton 
                  onClick={handleMenuOpen}
                  sx={{ 
                    p: 0.5,
                    border: '2px solid rgba(255,255,255,0.5)',
                    '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.1) }
                  }}
                >
                  <Avatar
                    src={user?.picture || user?.avatar || null}
                    alt={user?.displayName || user?.fullName || "User"}
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: 'primary.dark',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {!user?.picture && !user?.avatar && ((user?.displayName || user?.fullName)?.charAt(0) || 'U')}
                  </Avatar>
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    width: 300,
                    borderRadius: 3,
                    boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,245,255,0.98))',
                    backdropFilter: 'blur(20px)',
                    overflow: 'visible',
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  background: 'linear-gradient(145deg, #4285F4, #34A853)',
                  color: 'white',
                  borderRadius: '12px 12px 0 0',
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  <Avatar
                    src={user?.picture || user?.avatar || null}
                    alt={user?.displayName || user?.fullName || "User"}
                    sx={{ 
                      width: 70, 
                      height: 70,
                      bgcolor: 'white',
                      color: theme.palette.primary.main,
                      border: '4px solid white',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {!user?.picture && !user?.avatar && ((user?.displayName || user?.fullName)?.charAt(0) || 'U')}
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {user?.displayName || user?.fullName || "User"}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 0.5,
                    opacity: 0.9
                  }}>
                    <GoogleIcon fontSize="small" />
                    <Typography variant="body2">
                      {user?.email || "user@gmail.com"}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 4, px: 2 }}>
                  <MenuItem onClick={navigateToProfile} sx={{ 
                    borderRadius: 2, 
                    py: 1.5, 
                    my: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateX(5px)'
                    }
                  }}>
                    <ListItemIcon><AccountCircleIcon fontSize="small" sx={{ color: '#4285F4' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Profile" 
                      secondary="View and edit your profile"
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </MenuItem>
                  
                  <MenuItem onClick={navigateToSettings} sx={{ 
                    borderRadius: 2, 
                    py: 1.5, 
                    my: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateX(5px)'
                    }
                  }}>
                    <ListItemIcon><SettingsIcon fontSize="small" sx={{ color: '#34A853' }} /></ListItemIcon>
                    <ListItemText 
                      primary="Settings" 
                      secondary="Manage your preferences"
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </MenuItem>
                </Box>
                
                <Divider sx={{ my: 1.5, mx: 2 }} />
                
                <Box sx={{ px: 2, pb: 2 }}>
                  <MenuItem onClick={handleLogout} sx={{ 
                    borderRadius: 2, 
                    py: 1.5,
                    transition: 'all 0.2s',
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.error.main, 0.15),
                    }
                  }}>
                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} /></ListItemIcon>
                    <Typography fontWeight="medium">Sign Out</Typography>
                  </MenuItem>
                </Box>
              </Menu>
              
              {/* Services menu must be rendered conditionally to be triggered from the button */}
              {servicesMenu}
            </Box>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                variant="contained" 
                onClick={handleServicesMenuOpen}
                color="secondary"
                endIcon={<ArrowDropDownIcon />}
                sx={{ 
                  borderRadius: 30,
                  px: 3,
                  py: 1,
                  minWidth: 160,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #673ab7 0%, #9c27b0 100%)',
                  boxShadow: '0 10px 20px rgba(156, 39, 176, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5e35b1 0%, #8e24aa 100%)',
                    boxShadow: '0 6px 15px rgba(156, 39, 176, 0.4)',
                  }
                }}
              >
                Connect Services
              </Button>
              {/* Services menu for non-authenticated state */}
              {servicesMenu}
            </motion.div>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar sx={{ mb: 1 }} />
    </>
  );
};

export default Header;