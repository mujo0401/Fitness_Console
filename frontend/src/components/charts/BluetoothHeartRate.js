import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Stack, 
  CircularProgress, 
  Chip,
  Switch,
  FormControlLabel,
  IconButton,
  Collapse,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import BluetoothDisabledIcon from '@mui/icons-material/BluetoothDisabled';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorIcon from '@mui/icons-material/Error';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HeartRateChart from './HeartRateChart';

const BluetoothHeartRate = ({ onHeartRateData }) => {
  const theme = useTheme();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [bluetoothData, setBluetoothData] = useState([]);
  const [showChart, setShowChart] = useState(true);
  const [currentHeartRate, setCurrentHeartRate] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

  // Function to connect to device via Bluetooth
  const connectBluetooth = async () => {
    setConnecting(true);
    setError('');
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/fitbit/bluetooth/connect`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.status === 'connecting' || data.status === 'already_running') {
        // Start polling for status
        const interval = setInterval(checkBluetoothStatus, 2000);
        setRefreshInterval(interval);
      } else {
        setError('Failed to start Bluetooth connection');
        setConnecting(false);
      }
    } catch (err) {
      setError(`Connection error: ${err.message}`);
      setConnecting(false);
    }
  };

  // Function to disconnect from Bluetooth
  const disconnectBluetooth = async () => {
    try {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      
      await fetch(`${apiBaseUrl}/api/fitbit/bluetooth/disconnect`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setConnected(false);
    } catch (err) {
      setError(`Disconnection error: ${err.message}`);
    }
  };
  
  // Function to check Bluetooth connection status
  const checkBluetoothStatus = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/fitbit/bluetooth/status`, {
        credentials: 'include'
      });
      
      const status = await response.json();
      
      if (status.connected) {
        setConnected(true);
        setConnecting(false);
        
        // If we have a latest reading, set the current heart rate
        if (status.latest_reading && status.latest_reading.value) {
          setCurrentHeartRate(status.latest_reading.value);
        }
        
        // Also fetch the heart rate data
        fetchBluetoothHeartRate();
      } else if (connecting) {
        // Still trying to connect
        setConnected(false);
      } else {
        // Not connected and not connecting
        setConnected(false);
        setConnecting(false);
        
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
      }
    } catch (err) {
      console.error('Error checking Bluetooth status:', err);
    }
  }, [apiBaseUrl, connecting, refreshInterval]);
  
  // Function to fetch heart rate data from Bluetooth
  const fetchBluetoothHeartRate = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/fitbit/bluetooth/heart-rate?period=minute`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBluetoothData(data.data || []);
        
        // Pass data to parent component if needed
        if (onHeartRateData) {
          onHeartRateData(data.data || []);
        }
        
        // Get the latest heart rate value
        if (data.data && data.data.length > 0) {
          const latest = data.data[data.data.length - 1];
          setCurrentHeartRate(latest.avg || latest.value || 0);
        }
      } else {
        const errorData = await response.json();
        console.warn('No Bluetooth heart rate data available:', errorData);
      }
    } catch (err) {
      console.error('Error fetching Bluetooth heart rate:', err);
    }
  }, [apiBaseUrl, onHeartRateData]);
  
  // Check status on component mount
  useEffect(() => {
    checkBluetoothStatus();
    
    // Set up regular status check
    const interval = setInterval(checkBluetoothStatus, 5000);
    
    return () => {
      clearInterval(interval);
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [checkBluetoothStatus, refreshInterval]);
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        background: connected 
          ? `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.light, 0.05)})`
          : 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
        mb: 3,
        position: 'relative',
        border: connected ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none'
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {connected ? (
              <BluetoothConnectedIcon color="primary" />
            ) : connecting ? (
              <CircularProgress size={24} thickness={5} />
            ) : (
              <BluetoothIcon color="action" />
            )}
            Bluetooth Heart Rate
          </Typography>
          
          <Box>
            <Button
              variant={connected ? "outlined" : "contained"}
              color={connected ? "error" : "primary"}
              onClick={connected ? disconnectBluetooth : connectBluetooth}
              startIcon={connected ? <BluetoothDisabledIcon /> : <BluetoothConnectedIcon />}
              disabled={connecting}
            >
              {connected ? "Disconnect" : connecting ? "Connecting..." : "Connect to Fitbit"}
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            variant="filled"
            onClose={() => setError('')}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
        
        {connected && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  label={`${currentHeartRate} BPM`}
                  color="primary"
                  icon={<FavoriteIcon />}
                  sx={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold',
                    height: 40,
                    '& .MuiChip-label': { px: 2 }
                  }}
                />
                
                <Typography variant="body2" color="text.secondary">
                  Live data from Fitbit Charge 6
                </Typography>
              </Box>
              
              <Box>
                <IconButton onClick={fetchBluetoothHeartRate} size="small" title="Refresh data">
                  <RefreshIcon />
                </IconButton>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={showChart}
                      onChange={(e) => setShowChart(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Chart"
                />
              </Box>
            </Box>
            
            <Collapse in={showChart} timeout={300}>
              {bluetoothData.length > 0 ? (
                <Box sx={{ height: 300, mt: 2 }}>
                  <HeartRateChart 
                    data={bluetoothData} 
                    period="minute"
                    date={new Date()}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Waiting for heart rate data...
                  </Typography>
                </Box>
              )}
            </Collapse>
          </>
        )}
        
        {!connected && !connecting && (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Connect to your Fitbit Charge 6 to receive real-time heart rate data via Bluetooth LE.
            </Typography>
            <Typography variant="caption">
              Make sure your Fitbit is nearby and Bluetooth is enabled on your device.
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default BluetoothHeartRate;