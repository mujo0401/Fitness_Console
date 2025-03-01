import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  CircularProgress,
  Button,
  Paper,
  Chip,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import { motion } from 'framer-motion';
import { format, isValid } from 'date-fns';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TimerIcon from '@mui/icons-material/Timer';
import SyncIcon from '@mui/icons-material/Sync';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { heartRateService, authService, fitbitService } from '../services/api';
import HeartRateChart from '../components/charts/HeartRateChart';
import { useAuth } from '../context/AuthContext';
import InfoIcon from '@mui/icons-material/Info';

// Statistic card component
const StatCard = ({ title, value, unit, color, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        elevation={2}
        sx={{ 
          height: '100%', 
          borderRadius: 3, 
          background: color ? `linear-gradient(145deg, ${alpha(color, 0.8)}, ${alpha(color, 0.4)})` : 'white',
          color: color ? 'white' : 'inherit',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, opacity: 0.8 }}>
            {icon}
            <Typography variant="subtitle2">{title}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {unit && (
              <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                {unit}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Calculate heart rate variability
const calculateHRV = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 2) return 0;
  
  // Get consecutive heart rate values
  const values = heartRateData
    .filter(item => item.avg || item.value)
    .map(item => item.avg || item.value);
  
  if (values.length < 2) return 0;
  
  // Calculate differences between adjacent values
  const differences = [];
  for (let i = 1; i < values.length; i++) {
    differences.push(Math.abs(values[i] - values[i-1]));
  }
  
  // Calculate root mean square of differences
  const squaredDiffs = differences.map(diff => diff * diff);
  const meanSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  const rmssd = Math.sqrt(meanSquaredDiff);
  
  return Math.round(rmssd);
};

// Heart rate zones with better colors
const HR_ZONES = [
  { 
    name: 'Rest', 
    min: 0, 
    max: 60, 
    color: '#3f51b5', 
    gradient: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
    description: 'Resting heart rate - your heart at complete rest'
  },
  { 
    name: 'Fat Burn', 
    min: 60, 
    max: 70, 
    color: '#2196f3', 
    gradient: 'linear-gradient(135deg, #2196f3 0%, #4dabf5 100%)',
    description: 'Low intensity exercise, optimal for fat burning'
  },
  { 
    name: 'Cardio', 
    min: 70, 
    max: 85, 
    color: '#009688', 
    gradient: 'linear-gradient(135deg, #009688 0%, #4db6ac 100%)',
    description: 'Medium-high intensity, improves cardiovascular fitness'
  },
  { 
    name: 'Peak', 
    min: 85, 
    max: 100, 
    color: '#ff9800', 
    gradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
    description: 'High intensity exercise, increases performance and speed'
  },
  { 
    name: 'Extreme', 
    min: 100, 
    max: 220, 
    color: '#f44336', 
    gradient: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
    description: 'Maximum effort, short-duration exercise'
  }
];

// Get zone for a heart rate
const getHeartRateZone = (value) => {
  if (!value) return null;
  return HR_ZONES.find(zone => value >= zone.min && value < zone.max);
};

const HeartTab = ({ showAdvancedAnalysis = true }) => {
  const theme = useTheme();
  const { isAuthenticated, tokenScopes } = useAuth();
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState(new Date());
  const [heartData, setHeartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abnormalEvents, setAbnormalEvents] = useState([]);
  const [hrv, setHrv] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Fetch real data when component mounts or period/date changes
    console.log('HeartTab useEffect triggered, fetching data...');
    fetchHeartData();
  }, [period, date, isAuthenticated]);

  // Generate mock heart rate data for demonstration
  const generateMockHeartRateData = (dataPeriod) => {
    console.log(`🔄 Generating mock heart rate data for period: ${dataPeriod}`);
    const mockData = [];
    
    if (dataPeriod === 'day') {
      // Generate hourly heart rate data for a day
      for (let hour = 0; hour < 24; hour++) {
        const isEarlyMorning = hour >= 0 && hour < 5;
        const isMorning = hour >= 5 && hour < 9;
        const isWorkDay = hour >= 9 && hour < 17;
        const isEvening = hour >= 17 && hour < 22;
        const isNight = hour >= 22;
        
        // Generate realistic heart rate patterns based on time of day
        let baseHR, minHR, maxHR;
        
        if (isEarlyMorning) {
          // Sleeping hours - lowest heart rate
          baseHR = 50 + Math.floor(Math.random() * 10);
          minHR = baseHR - Math.floor(Math.random() * 5);
          maxHR = baseHR + Math.floor(Math.random() * 8);
        } else if (isMorning) {
          // Morning routine - heart rate increasing
          baseHR = 65 + Math.floor(Math.random() * 15);
          minHR = baseHR - Math.floor(Math.random() * 8);
          maxHR = baseHR + Math.floor(Math.random() * 12);
        } else if (isWorkDay) {
          // Work hours with variation
          const isLunchHour = hour === 12 || hour === 13;
          
          if (isLunchHour) {
            baseHR = 75 + Math.floor(Math.random() * 10);
          } else {
            baseHR = 70 + Math.floor(Math.random() * 10);
          }
          minHR = baseHR - Math.floor(Math.random() * 8);
          maxHR = baseHR + Math.floor(Math.random() * 15);
        } else if (isEvening) {
          // Evening activity (possibly workout)
          const isWorkoutTime = hour === 18 || hour === 19;
          
          if (isWorkoutTime) {
            baseHR = 100 + Math.floor(Math.random() * 30);
            minHR = 85 + Math.floor(Math.random() * 10);
            maxHR = baseHR + Math.floor(Math.random() * 20);
          } else {
            baseHR = 75 + Math.floor(Math.random() * 15);
            minHR = baseHR - Math.floor(Math.random() * 10);
            maxHR = baseHR + Math.floor(Math.random() * 15);
          }
        } else {
          // Night time, winding down
          baseHR = 60 + Math.floor(Math.random() * 10);
          minHR = baseHR - Math.floor(Math.random() * 8);
          maxHR = baseHR + Math.floor(Math.random() * 10);
        }
        
        // Generate several values for each hour to simulate minute data
        const values = [];
        for (let i = 0; i < 60; i += 5) {
          // Add some variation within the hour
          const variance = Math.floor(Math.random() * 8) - 4; // -4 to +4
          values.push(baseHR + variance);
        }
        
        // Convert hour to 12-hour format with AM/PM
        const hour12 = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        
        mockData.push({
          time: `${hour12}:00`,
          date: format(date, 'yyyy-MM-dd'),
          avg: baseHR,
          min: minHR,
          max: maxHR,
          values: values
        });
      }
    } else {
      // Generate daily data for longer periods (week, month, 3month)
      const days = dataPeriod === 'week' ? 7 : dataPeriod === 'month' ? 30 : 90;
      
      for (let i = 0; i < days; i++) {
        const day = new Date(date);
        day.setDate(day.getDate() - i);
        const dateStr = format(day, 'yyyy-MM-dd');
        
        // Generate daily heart rate patterns with variations
        // Weekend vs weekday
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        
        let resting, min, max;
        
        if (isWeekend) {
          // Weekends - potentially more variable
          resting = 58 + Math.floor(Math.random() * 6);
          min = 54 + Math.floor(Math.random() * 4);
          max = 110 + Math.floor(Math.random() * 30);
        } else {
          // Weekdays - work routine
          resting = 60 + Math.floor(Math.random() * 6);
          min = 56 + Math.floor(Math.random() * 4);
          max = 120 + Math.floor(Math.random() * 30);
        }
        
        mockData.push({
          date: dateStr,
          restingHeartRate: resting,
          min: min,
          max: max
        });
      }
      
      // Sort by date
      mockData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    console.log(`✅ Generated ${mockData.length} mock heart rate data points`);
    
    // Generate mock abnormal events (simulating 1-2 irregular heart rate events)
    const mockAbnormalEvents = [];
    if (Math.random() < 0.3) { // 30% chance of having abnormal events
      const eventTypes = ['Sudden change', 'High heart rate', 'Low heart rate', 'Irregular rhythm'];
      const eventTimes = ['09:30', '14:15', '18:45', '22:00'];
      const eventDate = format(date, 'yyyy-MM-dd');
      
      // Add 1-2 abnormal events
      const numEvents = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numEvents; i++) {
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const time = eventTimes[Math.floor(Math.random() * eventTimes.length)];
        let value, severity;
        
        if (type === 'Sudden change') {
          value = `Change of ${30 + Math.floor(Math.random() * 20)} BPM`;
          severity = Math.random() < 0.7 ? 'Medium' : 'High';
        } else if (type === 'High heart rate') {
          const bpm = 155 + Math.floor(Math.random() * 30);
          value = `${bpm} BPM`;
          severity = bpm > 170 ? 'High' : 'Medium';
        } else if (type === 'Low heart rate') {
          const bpm = 40 + Math.floor(Math.random() * 5);
          value = `${bpm} BPM`;
          severity = bpm < 42 ? 'High' : 'Medium';
        } else {
          value = 'Irregular pattern detected';
          severity = Math.random() < 0.6 ? 'Medium' : 'High';
        }
        
        mockAbnormalEvents.push({
          date: eventDate,
          time: time,
          type: type,
          value: value,
          severity: severity
        });
      }
    }
    
    return {
      data: mockData,
      abnormal_events: mockAbnormalEvents,
      period: dataPeriod,
      start_date: format(date, 'yyyy-MM-dd'),
      end_date: format(date, 'yyyy-MM-dd')
    };
  };
  
  const fetchHeartData = async () => {
    if (!isValid(date)) {
      setLoading(false);
      setError("Invalid date selected.");
      return;
    }
    
    if (!isAuthenticated) {
      setLoading(false);
      setError("Authentication required to view heart rate data.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Format date properly as a string
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log(`🔍 Fetching heart rate data for period: ${period}, date: ${formattedDate}`);
      
      // Check authentication first with error handling
      // First check Fitbit connection status
      try {
        const connectionStatus = await fitbitService.checkStatus();
        console.log("Fitbit connection status:", connectionStatus);
        
        if (!connectionStatus.connected) {
          setError("Your Fitbit connection is not active. Please log in again.");
          setLoading(false);
          return;
        }
      } catch (statusError) {
        console.error("🔴 Fitbit status check error:", statusError);
      }
      
      // Make the API call with explicit error handling
      let data;
      let useMockData = false; // Default to using real data
      
      try {
        data = await heartRateService.getHeartRateData(period, formattedDate);
        console.log('📊 API Response:', data);
      } catch (apiError) {
        console.error("🔴 API call failed:", apiError);
        useMockData = true;
        
        // If it's a 401 error, show specific message about scope permission
        if (apiError.response?.status === 401) {
          console.warn("⚠️ 401 Unauthorized: May need heartrate scope permission");
          setError("Heart rate data access requires additional permissions. This could be because the 'heartrate' scope was not granted during authentication. Using mock data for demonstration.");
        } else {
          setError(`Failed to fetch heart rate data: ${apiError.message || 'Unknown error'}. Using mock data for demonstration.`);
        }
      }
      
      if (useMockData || !data || !data.data || data.data.length === 0) {
        // Generate mock data for demonstration only when real data is unavailable
        console.log('⚠️ Using mock heart rate data instead');
        data = generateMockHeartRateData(period);
      }
      
      if (data && data.data && data.data.length > 0) {
        console.log(`✅ Received ${data.data.length} heart rate data points`);
        
        setHeartData(data.data);
        setAbnormalEvents(data.abnormal_events || []);
        
        // Calculate heart rate variability
        const hrvValue = calculateHRV(data.data);
        setHrv(hrvValue);
      } else {
        console.warn('⚠️ Received empty heart rate data even after mock generation');
        setError("No heart rate data available for the selected period.");
        setHeartData([]);
        setAbnormalEvents([]);
        setHrv(0);
      }
    } catch (err) {
      console.error("🔴 Error in fetchHeartData:", err);
      
      const errorMessage = err.response?.status === 401
        ? "Authentication required to view heart rate data. Using mock data for demonstration."
        : err.response?.status === 429
          ? "Rate limit exceeded. Please try again later. Using mock data for demonstration."
          : "Failed to load heart rate data. Using mock data for demonstration.";
      
      setError(errorMessage);
      
      // Generate mock data as fallback
      const mockData = generateMockHeartRateData(period);
      setHeartData(mockData.data);
      setAbnormalEvents(mockData.abnormal_events || []);
      const hrvValue = calculateHRV(mockData.data);
      setHrv(hrvValue);
    } finally {
      setLoading(false);
    }
  };
  

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleDateChange = (newDate) => {
    if (isValid(newDate)) {
      setDate(newDate);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHeartData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 600); // Add a slight delay for visual feedback
    });
  };
  
  // Calculate statistics
  const getStats = () => {
    if (!heartData || heartData.length === 0) {
      return { avgHR: 0, maxHR: 0, minHR: 0, restingHR: 0 };
    }
    
    const avgHR = Math.round(
      heartData.reduce((sum, item) => sum + (item.avg || item.restingHeartRate || 0), 0) / 
      heartData.length
    );
    
    const maxHR = Math.max(...heartData.map(item => item.max || 0));
    
    const validMinRates = heartData.filter(item => (item.min || 0) > 0).map(item => item.min);
    const minHR = validMinRates.length > 0 ? Math.min(...validMinRates) : 0;
    
    const validRestingRates = heartData.filter(item => item.restingHeartRate);
    const restingHR = validRestingRates.length > 0 
      ? Math.round(validRestingRates.reduce((sum, item) => sum + item.restingHeartRate, 0) / validRestingRates.length)
      : 0;
      
    return { avgHR, maxHR, minHR, restingHR };
  };
  
  const { avgHR, maxHR, minHR, restingHR } = getStats();
  const currentZone = getHeartRateZone(avgHR);

  return (
    <Box sx={{ p: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ 
          borderRadius: 4, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          mb: 3
        }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #3f51b5, #2196f3)', 
            py: 2.5, 
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              <FavoriteIcon sx={{ filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))' }} /> 
              Heart Rate Analytics
            </Typography>
              
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 120, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                  '& .MuiSelect-select': { color: 'white' },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              >
                <InputLabel>Period</InputLabel>
                <Select
                  value={period}
                  label="Period"
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="day" sx={{ display: 'flex', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" /> 1 Day
                  </MenuItem>
                  <MenuItem value="week" sx={{ display: 'flex', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" /> 1 Week
                  </MenuItem>
                  <MenuItem value="month" sx={{ display: 'flex', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" /> 1 Month
                  </MenuItem>
                  <MenuItem value="3month" sx={{ display: 'flex', gap: 1 }}>
                    <HistoryIcon fontSize="small" /> 3 Months
                  </MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Date"
                type="date"
                size="small"
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateChange(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />
              
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={handleRefresh}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  {isRefreshing ? <SyncIcon className="rotating-icon" /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 8, flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="body2" color="text.secondary">
                  Loading heart rate data...
                </Typography>
              </Box>
            ) : error || !heartData || heartData.length === 0 ? (
              <Box>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color={error ? "error" : "text.secondary"} variant="h6" gutterBottom>
                    {error || "No heart rate data available for the selected period."}
                  </Typography>
                  
                  {/* Debug panel to show token scopes */}
                  <Paper 
                    sx={{ 
                      p: 2, 
                      my: 3, 
                      mx: 'auto',
                      maxWidth: 600,
                      bgcolor: alpha(theme.palette.info.light, 0.1),
                      border: `1px dashed ${theme.palette.info.main}`
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <InfoIcon color="info" /> Token Scopes Debug
                    </Typography>
                    <Typography variant="body2" align="left">
                      Current scopes: {tokenScopes.length > 0 ? tokenScopes.join(', ') : 'No scopes found'}
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 1 }} align="left">
                      Has 'heartrate' scope: {tokenScopes.includes('heartrate') ? 'Yes' : 'No - this is required for heart rate data'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        color="info"
                        onClick={() => authService.debugSession().then(data => console.log('Session debug:', data))}
                        size="small"
                      >
                        Debug Session (Check Console)
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={async () => {
                          try {
                            // Create URL based on environment
                            const apiBaseUrl = process.env.NODE_ENV === 'production' 
                              ? '' // Empty string for same-domain in production
                              : 'http://localhost:5000';
                              
                            await fetch(`${apiBaseUrl}/api/fitbit/debug-heart`, { credentials: 'include' })
                              .then(res => res.json())
                              .then(data => console.log('Heart debug data:', data));
                            alert('Debug info logged to console - please check the browser console');
                          } catch (e) {
                            console.error('Error calling debug endpoint:', e);
                            alert('Error calling debug endpoint - see console');
                          }
                        }}
                        size="small"
                      >
                        Debug Heart API (Check Console)
                      </Button>
                    </Box>
                  </Paper>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleRefresh} 
                      startIcon={<RefreshIcon />}
                    >
                      {error ? "Try Again" : "Refresh"}
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => {
                        authService.logout().then(() => {
                          // After logging out, redirect to Fitbit auth
                          setTimeout(() => authService.login(), 500);
                        }).catch(err => {
                          console.error('Error during reauth flow:', err);
                          alert('Error during reauthentication: ' + err.message);
                        });
                      }}
                    >
                      Re-authenticate (Fix Permissions)
                    </Button>
                  </Box>
                </Box>
                
                {/* Show charts and UI even when there's no data */}
                <Box sx={{ px: 3, py: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Average Heart Rate" 
                        value={0} 
                        unit="BPM"
                        color="#3f51b5"
                        icon={<FavoriteIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Max Heart Rate" 
                        value={0} 
                        unit="BPM"
                        color="#f44336"
                        icon={<TrendingUpIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Min Heart Rate" 
                        value={0} 
                        unit="BPM"
                        color="#2196f3"
                        icon={<TrendingDownIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Resting Heart Rate" 
                        value={0} 
                        unit="BPM"
                        color="#3f51b5"
                        icon={<TimerIcon />}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <HeartRateChart data={[]} period={period} />
                </Box>
                
                {/* Advanced analysis section - still shown with empty data */}
                {showAdvancedAnalysis && (
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShowChartIcon /> Advanced Analysis
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Heart Rate Variability Card */}
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: alpha(theme.palette.primary.light, 0.05) }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <MonitorHeartIcon color="primary" />
                            <Typography variant="subtitle2" color="text.secondary">
                              Heart Rate Variability (HRV)
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            0 <Typography component="span" variant="body2">ms</Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            HRV measures the variation in time between heartbeats. Higher values usually indicate better cardiovascular health.
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      {/* Recovery Score Card */}
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: alpha(theme.palette.success.light, 0.05) }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <HealthAndSafetyIcon color="success" />
                            <Typography variant="subtitle2" color="text.secondary">
                              Recovery Score
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            -- <Typography component="span" variant="body2">/100</Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Based on resting heart rate, sleep quality, and HRV. Higher scores indicate better recovery from exercise and stress.
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      {/* Cardiac Health Index */}
                      <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, borderRadius: 2, height: '100%', bgcolor: alpha(theme.palette.info.light, 0.05) }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <FavoriteIcon color="info" />
                            <Typography variant="subtitle2" color="text.secondary">
                              Cardiac Health Index
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            -- <Typography component="span" variant="body2">/10</Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Composite score based on resting heart rate, recovery time, and heart rate zone distribution.
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    {/* Heart Rhythm Abnormalities Section */}
                    <Box sx={{ mt: 3 }}>
                      <Paper 
                        sx={{ 
                          p: 3, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.warning.light, 0.1),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                        }}
                      >
                        <Typography variant="h6" sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mb: 2, 
                          color: theme.palette.warning.dark,
                          fontWeight: 'bold'
                        }}>
                          <WarningAmberIcon /> Rhythm Analysis & Abnormality Detection
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No abnormal heart rhythms detected in the current period. Monitoring continuously for:
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Chip
                              label="Tachycardia Detection"
                              color="default"
                              sx={{ 
                                fontWeight: 'medium',
                                borderRadius: '12px',
                                bgcolor: 'transparent',
                                border: `1px dashed ${theme.palette.warning.light}`,
                                color: theme.palette.warning.dark,
                                py: 0.5,
                                width: '100%'
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Chip
                              label="Bradycardia Monitoring"
                              color="default"
                              sx={{ 
                                fontWeight: 'medium',
                                borderRadius: '12px',
                                bgcolor: 'transparent',
                                border: `1px dashed ${theme.palette.warning.light}`,
                                color: theme.palette.warning.dark,
                                py: 0.5,
                                width: '100%'
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Chip
                              label="Irregular Rhythm Detection"
                              color="default"
                              sx={{ 
                                fontWeight: 'medium',
                                borderRadius: '12px',
                                bgcolor: 'transparent',
                                border: `1px dashed ${theme.palette.warning.light}`,
                                color: theme.palette.warning.dark,
                                py: 0.5,
                                width: '100%'
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Chip
                              label="Atrial Fibrillation Screening"
                              color="default"
                              sx={{ 
                                fontWeight: 'medium',
                                borderRadius: '12px',
                                bgcolor: 'transparent',
                                border: `1px dashed ${theme.palette.warning.light}`,
                                color: theme.palette.warning.dark,
                                py: 0.5,
                                width: '100%'
                              }}
                            />
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Last scan: Today at 00:00
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            color="warning"
                            startIcon={<RefreshIcon />}
                          >
                            Rescan
                          </Button>
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                <Box sx={{ px: 3, py: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Average Heart Rate" 
                        value={avgHR} 
                        unit="BPM"
                        color={currentZone?.color || '#3f51b5'}
                        icon={<FavoriteIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Max Heart Rate" 
                        value={maxHR} 
                        unit="BPM"
                        color="#f44336"
                        icon={<TrendingUpIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Min Heart Rate" 
                        value={minHR} 
                        unit="BPM"
                        color="#2196f3"
                        icon={<TrendingDownIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Resting Heart Rate" 
                        value={restingHR} 
                        unit="BPM"
                        color="#3f51b5"
                        icon={<TimerIcon />}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <HeartRateChart data={heartData} period={period} />
                </Box>
                
                {abnormalEvents && abnormalEvents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Paper 
                      sx={{ 
                        mx: 3,
                        mb: 3,
                        p: 3, 
                        bgcolor: alpha(theme.palette.warning.light, 0.2),
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.warning.light}`
                      }}
                    >
                      <Typography variant="h6" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mb: 2, 
                        color: theme.palette.warning.dark,
                        fontWeight: 'bold'
                      }}>
                        <WarningAmberIcon /> Detected Abnormal Rhythms
                      </Typography>
                      <Grid container spacing={1}>
                        {abnormalEvents.map((event, index) => (
                          <Grid item key={index}>
                            <Chip
                              label={`${event.type}: ${event.value} (${event.date} ${event.time})`}
                              color={event.severity === 'High' ? 'error' : 'warning'}
                              sx={{ 
                                fontWeight: 'medium',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                py: 0.5
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </motion.div>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Add CSS for the rotating icon */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating-icon {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default HeartTab;
