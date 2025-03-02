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
  ListItemText
} from '@mui/material';
import { motion } from 'framer-motion';
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
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const theme = useTheme();
  const { isAuthenticated, user, login, logout, loginFitbit, loginAppleFitness, connectedServices } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  const [servicesMenuEl, setServicesMenuEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState(78);
  
  // Check if all services are connected
  const allServicesConnected = connectedServices.fitbit && connectedServices.appleFitness;

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
    window.location.href = "/profile";
    handleMenuClose();
  };
  
  const navigateToSettings = () => {
    window.location.href = "/settings";
    handleMenuClose();
  };

  // Services menu content
  const servicesMenu = (
    <Menu
      anchorEl={servicesMenuEl}
      open={Boolean(servicesMenuEl)}
      onClose={handleServicesMenuClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 220,
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
      <MenuItem 
        onClick={() => {
          loginFitbit();
          handleServicesMenuClose();
        }}
        disabled={connectedServices.fitbit}
      >
        <ListItemIcon>
          {connectedServices.fitbit ? 
            <CheckCircleIcon color="success" /> : 
            <FitnessCenterIcon color="primary" />
          }
        </ListItemIcon>
        <ListItemText 
          primary="Connect Fitbit" 
          secondary={connectedServices.fitbit ? "Connected" : null}
        />
      </MenuItem>
      <MenuItem 
        onClick={() => {
          loginAppleFitness();
          handleServicesMenuClose();
        }}
        disabled={connectedServices.appleFitness}
      >
        <ListItemIcon>
          {connectedServices.appleFitness ? 
            <CheckCircleIcon color="success" /> : 
            <AppleIcon color="primary" />
          }
        </ListItemIcon>
        <ListItemText 
          primary="Connect Apple Fitness" 
          secondary={connectedServices.appleFitness ? "Connected" : null}
        />
      </MenuItem>
      <Divider />
      <MenuItem 
        onClick={handleServicesMenuClose}
        disabled={!connectedServices.fitbit && !connectedServices.appleFitness}
      >
        <ListItemIcon><SyncIcon /></ListItemIcon>
        <ListItemText primary="Sync Data" />
      </MenuItem>
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
                    px: 2,
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
                    src={user?.avatar || null}
                    alt={user?.fullName || "User"}
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: 'primary.dark',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {!user?.avatar && (user?.fullName?.charAt(0) || 'U')}
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
                    width: 220,
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
                <Box sx={{ py: 1.5, px: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user?.fullName || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || "user@example.com"}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={navigateToProfile}>
                  <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={navigateToSettings}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
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