import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Chip, 
  Link, 
  Grid, 
  Divider, 
  IconButton,
  Button,
  useTheme,
  alpha 
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SpeedIcon from '@mui/icons-material/Speed';
import AppleIcon from '@mui/icons-material/Apple';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const theme = useTheme();
  const { isAuthenticated, checkFitbitConnection, checkAppleFitnessConnection, connectedServices } = useAuth();
  const [syncing, setSyncing] = useState({
    fitbit: false,
    appleFitness: false
  });
  const [connectionAttempts, setConnectionAttempts] = useState({
    fitbit: 0,
    appleFitness: 0
  });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Check connection status periodically
    const checkStatus = async () => {
      if (isAuthenticated) {
        // Check Fitbit connection
        const fitbitStatus = await checkFitbitConnection();
        if (!fitbitStatus) {
          setConnectionAttempts(prev => ({...prev, fitbit: prev.fitbit + 1}));
        } else {
          setConnectionAttempts(prev => ({...prev, fitbit: 0}));
        }
        
        // Check Apple Fitness connection
        const appleStatus = await checkAppleFitnessConnection();
        if (!appleStatus) {
          setConnectionAttempts(prev => ({...prev, appleFitness: prev.appleFitness + 1}));
        } else {
          setConnectionAttempts(prev => ({...prev, appleFitness: 0}));
        }
      } else {
        setConnectionAttempts({
          fitbit: 0,
          appleFitness: 0
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, checkFitbitConnection, checkAppleFitnessConnection]);
  
  const handleSyncFitbit = () => {
    setSyncing(prev => ({...prev, fitbit: true}));
    
    // Simulate syncing
    setTimeout(() => {
      setSyncing(prev => ({...prev, fitbit: false}));
      // Force update connection status
      checkFitbitConnection();
    }, 2000);
  };

  const handleSyncAppleFitness = () => {
    setSyncing(prev => ({...prev, appleFitness: true}));
    
    // Simulate syncing
    setTimeout(() => {
      setSyncing(prev => ({...prev, appleFitness: false}));
      // Force update connection status
      checkAppleFitnessConnection();
    }, 2000);
  };

  return (
    <Box component="footer" sx={{ mt: 'auto', position: 'relative' }}>
      {/* Decorative wave background */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -100, 
          left: 0, 
          right: 0,
          height: 100,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%233f51b5' fill-opacity='0.05' d='M0,224L48,202.7C96,181,192,139,288,138.7C384,139,480,181,576,186.7C672,192,768,160,864,154.7C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          zIndex: -1
        }}
      />  
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ py: 4 }}>
     

      

          {/* Data Summary */}
          <Grid item xs={12} md={12} lg={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Service Health
            </Typography>
            
            {isAuthenticated ? (
              <Box sx={{ mt: 1 }}>
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    background: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FitnessCenterIcon color={connectedServices.fitbit ? "primary" : "disabled"} />
                        <Typography>Fitbit</Typography>
                      </Box>
                      <Chip 
                        size="small" 
                        label={connectedServices.fitbit ? "Connected" : "Disconnected"} 
                        color={connectedServices.fitbit ? "success" : "default"}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AppleIcon color={connectedServices.appleFitness ? "primary" : "disabled"} />
                        <Typography>Apple Fitness</Typography>
                      </Box>
                      <Chip 
                        size="small" 
                        label={connectedServices.appleFitness ? "Connected" : "Disconnected"} 
                        color={connectedServices.appleFitness ? "success" : "default"}
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Last updated: {new Date().toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit', hour12: true})}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Connect to a fitness service to see data source information.
              </Typography>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, opacity: 0.6 }} />
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
            flexWrap: 'wrap'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Fitness Analytics Dashboard. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" variant="body2" color="text.secondary" underline="hover">
              Privacy
            </Link>
            <Link href="#" variant="body2" color="text.secondary" underline="hover">
              Terms
            </Link>
            <Link href="#" variant="body2" color="text.secondary" underline="hover">
              Help
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;