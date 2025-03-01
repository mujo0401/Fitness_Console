// frontend/src/components/RateLimitNotification.js
import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Typography, Box, LinearProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * A component that displays notifications for Fitbit API rate limit errors
 * Listens for 'fitbit-rate-limit' custom events dispatched from the API service
 */
const RateLimitNotification = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries, setMaxRetries] = useState(3);
  const [resetTime, setResetTime] = useState(null);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Event listener for rate limit events
    const handleRateLimitEvent = (event) => {
      const { detail } = event;
      
      setMessage(detail.message || 'Fitbit API rate limit reached. Please try again later.');
      setRetryCount(detail.retryCount || 0);
      setMaxRetries(detail.maxRetries || 3);
      setResetTime(detail.resetTime || null);
      
      if (detail.delay) {
        setRemainingTime(Math.round(detail.delay / 1000));
      }
      
      setOpen(true);
    };

    // Add event listener
    window.addEventListener('fitbit-rate-limit', handleRateLimitEvent);

    // Cleanup function
    return () => {
      window.removeEventListener('fitbit-rate-limit', handleRateLimitEvent);
    };
  }, []);

  useEffect(() => {
    let timer = null;
    
    // Start countdown timer if we have a remaining time
    if (open && remainingTime > 0) {
      // Reset progress
      setProgress(0);
      
      // Update progress bar every second
      timer = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
        
        setProgress(prevProgress => {
          const newProgress = prevProgress + (100 / (remainingTime || 1));
          return Math.min(newProgress, 100);
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [open, remainingTime]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  // Format remaining time in mm:ss format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      // Don't auto-hide if we're actively retrying
      autoHideDuration={retryCount >= maxRetries ? 6000 : null}
      onClose={handleClose}
    >
      <Alert
        severity="warning"
        variant="filled"
        icon={<WarningIcon />}
        sx={{
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        onClose={handleClose}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          {message}
        </Typography>
        
        {remainingTime > 0 && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                Retry {retryCount + 1} of {maxRetries}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                {formatTime(remainingTime)}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}
        
        {resetTime && !remainingTime && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
            Reset at approximately {resetTime.toLocaleTimeString()}
          </Typography>
        )}
      </Alert>
    </Snackbar>
  );
};

export default RateLimitNotification;