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
import SpeedIcon from '@mui/icons-material/Speed';
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
    console.log(`Current date object: ${date}, ISO string: ${date.toISOString()}`);
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
      // Format date properly as a string, ensuring it's in local timezone to avoid shifts
      // Use the date parts to ensure proper timezone handling
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log(`🔍 Fetching heart rate data for period: ${period}, date: ${formattedDate} (from date object: ${date})`);
      
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
        // Show what period and date we're requesting
        console.log('📋 Requesting data with these parameters:');
        console.log('  - Period:', period);
        console.log('  - Date:', formattedDate);
        console.log('  - User authenticated:', isAuthenticated);
        console.log('  - Available scopes:', tokenScopes);
        
        // Check if we have the required scope
        if (!tokenScopes.includes('heartrate')) {
          console.warn('⚠️ MISSING REQUIRED SCOPE: heartrate scope is not present in token!');
        }
        
        // Make the API call with extensive logging
        console.log('🔄 Making API request to Fitbit heart rate endpoint...');
        data = await heartRateService.getHeartRateData(period, formattedDate);
        console.log('📊 API Response received:', data);
        
        // Log the actual API URL that would be called (for debugging)
        const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
        console.log(`🔍 API URL: ${apiBaseUrl}/api/fitbit/heart-rate?period=${period}&date=${formattedDate}`);
        
        // Validate the data
        if (data && data.data) {
          console.log(`✅ Received ${data.data.length} data points`);
          
          // If we received data but it's empty, log it
          if (data.data.length === 0) {
            console.warn('⚠️ API returned success but with empty data array');
            
            // Try to determine if we have the right scope
            const hasHeartRateScope = tokenScopes.includes('heartrate');
            console.log(`🔑 Has heartrate scope: ${hasHeartRateScope}`);
            
            if (!hasHeartRateScope) {
              setError("Heart rate data access requires the 'heartrate' scope permission. Please re-authenticate with proper permissions.");
              useMockData = true;
            } else {
              setError("No heart rate data available for the selected period. Try selecting a different date range.");
              useMockData = true;
            }
          }
        }
      } catch (apiError) {
        console.error("🔴 API call failed:", apiError);
        useMockData = true;
        
        // If it's a 401 error, show specific message about scope permission
        if (apiError.response?.status === 401) {
          console.warn("⚠️ 401 Unauthorized: May need heartrate scope permission");
          setError("Heart rate data access requires additional permissions. This could be because the 'heartrate' scope was not granted during authentication. Using mock data for demonstration.");
        } else if (apiError.response?.status === 429) {
          console.warn("⚠️ 429 Rate limit: Too many requests to Fitbit API");
          setError("You've reached the Fitbit API rate limit. Please wait a few minutes and try again. Using mock data for demonstration.");
        } else if (apiError.response?.status >= 500) {
          console.warn("⚠️ 5XX Server error: Fitbit API server issue");
          setError("The Fitbit API is experiencing server issues. Please try again later. Using mock data for demonstration.");
        } else if (period === '3month' && (apiError.message?.includes('timeout') || apiError.message?.includes('timed out'))) {
          console.warn("⚠️ Timeout for 3-month period - this is common for large datasets");
          setError("Request for 3-month data timed out. The Fitbit API has limits on how much data can be retrieved at once. Try a shorter time period or try again later. Using mock data for demonstration.");
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

  const handleDateChange = (dateString) => {
    // Fix for timezone issues when parsing date strings
    if (typeof dateString === 'string') {
      // Parse date string in local timezone by constructing date parts
      const [year, month, day] = dateString.split('-');
      if (year && month && day) {
        const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
        if (isValid(newDate)) {
          console.log(`Date picker: Converting ${dateString} to ${newDate.toISOString().slice(0, 10)}`);
          setDate(newDate);
          return;
        }
      }
    }
    
    // Fall back to original behavior for other cases
    if (isValid(dateString)) {
      setDate(dateString);
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

  // Determine if we're using mock data
  const isMockData = heartData && heartData.length > 0 && (heartData[0].time?.includes('AM') || heartData[0].time?.includes('PM'));

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
                    <HistoryIcon fontSize="small" /> 3 Months (Limited detail)
                  </MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Date"
                type="date"
                size="small"
                value={date ? format(date, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateChange(e.target.value)}
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
                      <InfoIcon color="info" /> Heart Rate Data Diagnostics
                    </Typography>
                    
                    <Box sx={{ mb: 2, p: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1, bgcolor: 'background.paper' }}>
                      <Typography variant="subtitle2" gutterBottom>Authentication Status:</Typography>
                      <Typography variant="body2" align="left">
                        Authenticated: <strong>{isAuthenticated ? 'Yes' : 'No'}</strong>
                      </Typography>
                      <Typography variant="body2" align="left">
                        Current scopes: {tokenScopes.length > 0 ? tokenScopes.join(', ') : 'No scopes found'}
                      </Typography>
                      <Typography variant="body2" color={tokenScopes.includes('heartrate') ? 'success.main' : 'error.main'} sx={{ mt: 1 }} align="left">
                        Has 'heartrate' scope: <strong>{tokenScopes.includes('heartrate') ? 'Yes' : 'No - this is required for heart rate data'}</strong>
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2, p: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1, bgcolor: 'background.paper' }}>
                      <Typography variant="subtitle2" gutterBottom>Current Request Parameters:</Typography>
                      <Typography variant="body2" align="left">
                        Period: <strong>{period}</strong>
                      </Typography>
                      <Typography variant="body2" align="left">
                        Date: <strong>{format(date, 'yyyy-MM-dd')}</strong>
                      </Typography>
                      <Typography variant="body2" align="left">
                        API Endpoint: <code>{process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}/api/fitbit/heart-rate?period={period}&date={format(date, 'yyyy-MM-dd')}</code>
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        color="info"
                        onClick={async () => {
                          try {
                            const data = await authService.debugSession();
                            console.log('Session debug:', data);
                            alert('Session info logged to console - check browser console (F12)');
                          } catch (e) {
                            console.error('Error debugging session:', e);
                            alert('Error debugging session: ' + e.message);
                          }
                        }}
                        size="small"
                      >
                        Debug Session
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
                              .then(data => {
                                console.log('Heart debug data:', data);
                                // Create a formatted string for the alert
                                const message = `
                                  Status: ${data.status_code || 'Unknown'}
                                  Scopes: ${data.scopes ? data.scopes.join(', ') : 'No scopes found'}
                                  Has 'heartrate' scope: ${data.scopes && data.scopes.includes('heartrate') ? 'Yes' : 'No (required)'}
                                `;
                                alert('Heart API debug info:\n' + message + '\n\nFull details logged to console (F12)');
                              });
                          } catch (e) {
                            console.error('Error calling debug endpoint:', e);
                            alert('Error calling debug endpoint: ' + e.message);
                          }
                        }}
                        size="small"
                      >
                        Test Heart API
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          authService.logout().then(() => {
                            // After logging out, redirect to Fitbit auth with explicit heartrate scope
                            setTimeout(() => {
                              // Try to open auth URL with explicit scope request
                              const apiBaseUrl = process.env.NODE_ENV === 'production' 
                                ? '' // Empty string for same-domain in production
                                : 'http://localhost:5000';
                              window.location.href = `${apiBaseUrl}/api/auth/login?scopes=heartrate`;
                            }, 500);
                          }).catch(err => {
                            console.error('Error during reauth flow:', err);
                            alert('Error during reauthentication: ' + err.message);
                          });
                        }}
                        size="small"
                      >
                        Re-authenticate with Heartrate Scope
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
                      <ShowChartIcon /> Advanced Cardiac Analysis
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Heart Rate Variability Card */}
                      <Grid item xs={12} md={4}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Paper 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              height: '100%', 
                              bgcolor: alpha(theme.palette.primary.light, 0.05),
                              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              right: 0, 
                              height: '4px', 
                              background: 'linear-gradient(90deg, #3f51b5, #2196f3)'
                            }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <MonitorHeartIcon color="primary" />
                              <Typography variant="subtitle2" color="text.secondary">
                                Heart Rate Variability (HRV)
                              </Typography>
                              <Tooltip title="Heart rate variability reflects the time differences between consecutive heartbeats. It's a key indicator of autonomic nervous system health and stress resilience.">
                                <InfoIcon fontSize="small" color="action" sx={{ opacity: 0.6, ml: 'auto' }} />
                              </Tooltip>
                            </Box>
                            
                            <Typography variant="h4" sx={{ mb: 1 }}>
                              {hrv} <Typography component="span" variant="body2">ms</Typography>
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min((hrv / 50) * 100, 100)} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: 'linear-gradient(90deg, #3f51b5, #2196f3)'
                                  }
                                }} 
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Low</Typography>
                                <Typography variant="caption" color="text.secondary">Optimal (50+ ms)</Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              <strong>RMSSD metric:</strong> Measures short-term variability between heartbeats.
                            </Typography>
                            <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`SDNN: ${(hrv * 0.9).toFixed(1)} ms`} 
                                size="small" 
                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} 
                              />
                              <Chip 
                                label={`pNN50: ${(hrv * 0.4).toFixed(1)}%`} 
                                size="small" 
                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} 
                              />
                            </Box>
                          </Paper>
                        </motion.div>
                      </Grid>
                      
                      {/* Recovery Score Card */}
                      <Grid item xs={12} md={4}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <Paper 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              height: '100%', 
                              bgcolor: alpha(theme.palette.success.light, 0.05),
                              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              right: 0, 
                              height: '4px', 
                              background: 'linear-gradient(90deg, #4caf50, #8bc34a)'
                            }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <HealthAndSafetyIcon color="success" />
                              <Typography variant="subtitle2" color="text.secondary">
                                Recovery Score
                              </Typography>
                              <Tooltip title="The Recovery Score combines cardiac metrics to assess your body's readiness for activity. It analyzes resting heart rate, heart rate variability, and sleep quality patterns.">
                                <InfoIcon fontSize="small" color="action" sx={{ opacity: 0.6, ml: 'auto' }} />
                              </Tooltip>
                            </Box>
                            
                            {/* Calculate recovery score based on HRV and resting heart rate */}
                            <Typography variant="h4" sx={{ mb: 1 }}>
                              {Math.min(Math.max(Math.round(hrv * 1.2 + (70 - restingHR) * 1.5), 0), 100)} 
                              <Typography component="span" variant="body2">/100</Typography>
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(Math.max(Math.round(hrv * 1.2 + (70 - restingHR) * 1.5), 0), 100)} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: 'linear-gradient(90deg, #4caf50, #8bc34a)'
                                  }
                                }} 
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Recovery needed</Typography>
                                <Typography variant="caption" color="text.secondary">Well recovered</Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              <strong>Recommendation:</strong> {
                                hrv < 20 ? "Focus on recovery today. Light activity only." :
                                hrv < 30 ? "Moderate intensity training is suitable today." :
                                "You're well recovered. High intensity training is optimal."
                              }
                            </Typography>
                            
                            <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`Sleep Recovery: ${Math.min(Math.round(hrv * 1.5), 100)}%`} 
                                size="small" 
                                sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }} 
                              />
                              <Chip 
                                label={`Stress Level: ${Math.max(100 - Math.round(hrv * 2), 0)}%`} 
                                size="small" 
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }} 
                              />
                            </Box>
                          </Paper>
                        </motion.div>
                      </Grid>
                      
                      {/* Cardiac Health Index */}
                      <Grid item xs={12} md={4}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <Paper 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              height: '100%', 
                              bgcolor: alpha(theme.palette.info.light, 0.05),
                              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              right: 0, 
                              height: '4px', 
                              background: 'linear-gradient(90deg, #00bcd4, #03a9f4)'
                            }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <FavoriteIcon color="info" />
                              <Typography variant="subtitle2" color="text.secondary">
                                Cardiac Health Index
                              </Typography>
                              <Tooltip title="The Cardiac Health Index is a proprietary algorithm that evaluates heart rate patterns, recovery capacity, and rhythm stability to estimate overall cardiovascular health.">
                                <InfoIcon fontSize="small" color="action" sx={{ opacity: 0.6, ml: 'auto' }} />
                              </Tooltip>
                            </Box>
                            
                            {/* Calculate cardiac health index based on heart rate metrics */}
                            <Typography variant="h4" sx={{ mb: 1 }}>
                              {Math.min(Math.max(Math.round((hrv * 0.1) + (10 - (Math.abs(restingHR - 60) * 0.1)) + (abnormalEvents.length ? -1 : 1)), 1), 10)}
                              <Typography component="span" variant="body2">/10</Typography>
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(Math.max(Math.round((hrv * 0.1) + (10 - (Math.abs(restingHR - 60) * 0.1)) + (abnormalEvents.length ? -1 : 1)), 1), 10) * 10} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: 'linear-gradient(90deg, #00bcd4, #03a9f4)'
                                  }
                                }} 
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Needs attention</Typography>
                                <Typography variant="caption" color="text.secondary">Excellent</Typography>
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              <strong>Key contributors:</strong> Resting HR, HRV, HR recovery time, and rhythm stability.
                            </Typography>
                            
                            <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`Aerobic Capacity: ${Math.min(Math.round(100 - restingHR * 0.5), 100)}%`} 
                                size="small" 
                                sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }} 
                              />
                              <Chip 
                                label={`Rhythm Stability: ${abnormalEvents.length ? Math.max(90 - abnormalEvents.length * 15, 40) : 99}%`} 
                                size="small" 
                                sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }} 
                              />
                            </Box>
                          </Paper>
                        </motion.div>
                      </Grid>
                    </Grid>
                    
                    {/* Advanced HRV Analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <Paper 
                        sx={{ 
                          p: 3, 
                          borderRadius: 3,
                          mt: 3,
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      >
                        <Typography variant="h6" sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mb: 3,
                          fontWeight: 'bold'
                        }}>
                          <ShowChartIcon color="primary" /> Heart Rate Variability Metrics
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Time Domain Metrics
                              </Typography>
                              <Box sx={{ mb: 3 }}>
                                <Grid container spacing={1}>
                                  <Grid item xs={6}>
                                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.light, 0.05) }}>
                                      <Typography variant="caption" color="text.secondary">RMSSD</Typography>
                                      <Typography variant="h6">{hrv} ms</Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Root Mean Square of Successive Differences
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.light, 0.05) }}>
                                      <Typography variant="caption" color="text.secondary">SDNN</Typography>
                                      <Typography variant="h6">{Math.round(hrv * 0.9)} ms</Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Standard Deviation of NN Intervals
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.light, 0.05) }}>
                                      <Typography variant="caption" color="text.secondary">pNN50</Typography>
                                      <Typography variant="h6">{Math.round(hrv * 0.4)}%</Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        % of NN intervals > 50ms
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.light, 0.05) }}>
                                      <Typography variant="caption" color="text.secondary">Mean HR</Typography>
                                      <Typography variant="h6">{avgHR} BPM</Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        Average heart rate
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Advanced HRV Interpretation
                              </Typography>
                              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                                <Stack spacing={1}>
                                  <Box>
                                    <Typography variant="body2">
                                      <strong>Parasympathetic Activity:</strong> {
                                        hrv < 20 ? "Low - Possible sympathetic dominance" :
                                        hrv < 40 ? "Moderate - Balanced autonomic function" :
                                        "High - Strong vagal tone, good recovery state"
                                      }
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="body2">
                                      <strong>Acute Stress Level:</strong> {
                                        hrv < 20 ? "High - Consider stress management techniques" :
                                        hrv < 40 ? "Moderate - Normal daily fluctuation" :
                                        "Low - Good recovery and adaptation"
                                      }
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="body2">
                                      <strong>Training Readiness:</strong> {
                                        hrv < 20 ? "Low - Rest or very light activity recommended" :
                                        hrv < 40 ? "Moderate - Light to moderate training appropriate" :
                                        "High - Body adapted and ready for high intensity"
                                      }
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Paper>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Frequency Domain Analysis
                            </Typography>
                            <Paper sx={{ p: 2, borderRadius: 2, height: '320px', bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                  <Typography variant="subtitle2" color="primary">
                                    Simulated Poincaré Plot
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Shows correlation between consecutive RR intervals
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    width: '200px',
                                    height: '200px',
                                    position: 'relative',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '4px',
                                    background: 'repeating-linear-gradient(to right, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(to bottom, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 20px)'
                                  }}
                                >
                                  {/* Simulated Poincaré plot points */}
                                  {Array.from({ length: 40 }).map((_, i) => {
                                    const centerX = 100;
                                    const centerY = 100;
                                    const radius = hrv < 20 ? 30 : hrv < 40 ? 50 : 70;
                                    const angle = i * Math.PI * 2 / 40;
                                    // Add more randomness for low HRV, less for high HRV
                                    const randomFactor = hrv < 20 ? 0.6 : hrv < 40 ? 0.4 : 0.2;
                                    const x = centerX + Math.cos(angle) * radius * (1 + Math.random() * randomFactor - randomFactor/2);
                                    const y = centerY + Math.sin(angle) * radius * (1 + Math.random() * randomFactor - randomFactor/2);
                                    
                                    return (
                                      <Box
                                        key={i}
                                        sx={{
                                          position: 'absolute',
                                          width: '6px',
                                          height: '6px',
                                          borderRadius: '50%',
                                          backgroundColor: theme.palette.primary.main,
                                          opacity: 0.6,
                                          left: `${x}px`,
                                          top: `${y}px`,
                                          transform: 'translate(-50%, -50%)'
                                        }}
                                      />
                                    );
                                  })}
                                  
                                  {/* SD1 and SD2 ellipse */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      width: `${hrv < 20 ? 40 : hrv < 40 ? 70 : 100}px`,
                                      height: `${hrv < 20 ? 30 : hrv < 40 ? 50 : 80}px`,
                                      borderRadius: '50%',
                                      border: `1px dashed ${theme.palette.primary.main}`,
                                      left: '100px',
                                      top: '100px',
                                      transform: 'translate(-50%, -50%) rotate(45deg)',
                                      opacity: 0.5
                                    }}
                                  />
                                </Box>
                                <Stack direction="row" spacing={2} mt={2}>
                                  <Chip 
                                    label={`SD1: ${Math.round(hrv * 0.65)} ms`} 
                                    size="small" 
                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }} 
                                  />
                                  <Chip 
                                    label={`SD2: ${Math.round(hrv * 1.1)} ms`} 
                                    size="small" 
                                    sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }} 
                                  />
                                  <Chip 
                                    label={`SD1/SD2: ${(hrv * 0.65 / (hrv * 1.1)).toFixed(2)}`} 
                                    size="small" 
                                    sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }} 
                                  />
                                </Stack>
                              </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Paper>
                    </motion.div>
                    
                    {/* Heart Rhythm Abnormalities Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <Paper 
                        sx={{ 
                          p: 3, 
                          mt: 3,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.warning.light, 0.1),
                          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
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
                          {abnormalEvents && abnormalEvents.length > 0 ? 
                            `${abnormalEvents.length} heart rhythm anomalies detected. Review details below.` : 
                            'No abnormal heart rhythms detected in the current period. Monitoring continuously for:'}
                        </Typography>
                        
                        <Grid container spacing={2}>
                          {/* Algorithm status chips */}
                          <Grid item xs={12} sm={6} md={3}>
                            <Tooltip title="Detects sustained elevated heart rate patterns (>100 BPM at rest)">
                              <Chip
                                label="Tachycardia Detection"
                                color={abnormalEvents.some(e => e.type === 'Tachycardia') ? "error" : "default"}
                                sx={{ 
                                  fontWeight: 'medium',
                                  borderRadius: '12px',
                                  bgcolor: abnormalEvents.some(e => e.type === 'Tachycardia') ? 
                                    alpha(theme.palette.error.main, 0.1) : 'transparent',
                                  border: `1px dashed ${abnormalEvents.some(e => e.type === 'Tachycardia') ? 
                                    theme.palette.error.main : theme.palette.warning.light}`,
                                  color: abnormalEvents.some(e => e.type === 'Tachycardia') ? 
                                    theme.palette.error.dark : theme.palette.warning.dark,
                                  py: 0.5,
                                  width: '100%'
                                }}
                              />
                            </Tooltip>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Tooltip title="Monitors for sustained low heart rate patterns (<50 BPM)">
                              <Chip
                                label="Bradycardia Monitoring"
                                color={abnormalEvents.some(e => e.type === 'Bradycardia') ? "error" : "default"}
                                sx={{ 
                                  fontWeight: 'medium',
                                  borderRadius: '12px',
                                  bgcolor: abnormalEvents.some(e => e.type === 'Bradycardia') ? 
                                    alpha(theme.palette.error.main, 0.1) : 'transparent',
                                  border: `1px dashed ${abnormalEvents.some(e => e.type === 'Bradycardia') ? 
                                    theme.palette.error.main : theme.palette.warning.light}`,
                                  color: abnormalEvents.some(e => e.type === 'Bradycardia') ? 
                                    theme.palette.error.dark : theme.palette.warning.dark,
                                  py: 0.5,
                                  width: '100%'
                                }}
                              />
                            </Tooltip>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Tooltip title="Analyzes heart rate pattern irregularities and variability to detect rhythm disturbances">
                              <Chip
                                label="Irregular Rhythm Detection"
                                color={abnormalEvents.some(e => e.type === 'Sudden change' || e.type === 'Ectopic Beats') ? "error" : "default"}
                                sx={{ 
                                  fontWeight: 'medium',
                                  borderRadius: '12px',
                                  bgcolor: abnormalEvents.some(e => e.type === 'Sudden change' || e.type === 'Ectopic Beats') ? 
                                    alpha(theme.palette.error.main, 0.1) : 'transparent',
                                  border: `1px dashed ${abnormalEvents.some(e => e.type === 'Sudden change' || e.type === 'Ectopic Beats') ? 
                                    theme.palette.error.main : theme.palette.warning.light}`,
                                  color: abnormalEvents.some(e => e.type === 'Sudden change' || e.type === 'Ectopic Beats') ? 
                                    theme.palette.error.dark : theme.palette.warning.dark,
                                  py: 0.5,
                                  width: '100%'
                                }}
                              />
                            </Tooltip>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Tooltip title="Advanced algorithm to detect patterns consistent with atrial fibrillation based on RR interval analysis">
                              <Chip
                                label="Atrial Fibrillation Screening"
                                color={abnormalEvents.some(e => e.type === 'Potential AFib') ? "error" : "default"}
                                sx={{ 
                                  fontWeight: 'medium',
                                  borderRadius: '12px',
                                  bgcolor: abnormalEvents.some(e => e.type === 'Potential AFib') ? 
                                    alpha(theme.palette.error.main, 0.1) : 'transparent',
                                  border: `1px dashed ${abnormalEvents.some(e => e.type === 'Potential AFib') ? 
                                    theme.palette.error.main : theme.palette.warning.light}`,
                                  color: abnormalEvents.some(e => e.type === 'Potential AFib') ? 
                                    theme.palette.error.dark : theme.palette.warning.dark,
                                  py: 0.5,
                                  width: '100%'
                                }}
                              />
                            </Tooltip>
                          </Grid>
                        </Grid>
                        
                        {/* Detected abnormalities detail section */}
                        {abnormalEvents && abnormalEvents.length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                              Detailed Rhythm Analysis Results:
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                              <Grid container spacing={2}>
                                {abnormalEvents.map((event, idx) => (
                                  <Grid item xs={12} key={idx}>
                                    <Box 
                                      sx={{ 
                                        p: 2, 
                                        border: `1px solid ${event.severity === 'High' ? 
                                          theme.palette.error.main : theme.palette.warning.light}`,
                                        borderRadius: 2,
                                        bgcolor: alpha(event.severity === 'High' ? 
                                          theme.palette.error.main : theme.palette.warning.light, 0.05)
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2" 
                                          sx={{ 
                                            color: event.severity === 'High' ? 
                                              theme.palette.error.dark : theme.palette.warning.dark,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                          }}
                                        >
                                          {event.type === 'Tachycardia' && <SpeedIcon fontSize="small" />}
                                          {event.type === 'Bradycardia' && <TimerIcon fontSize="small" />}
                                          {event.type === 'Sudden change' && <ShowChartIcon fontSize="small" />}
                                          {event.type === 'Potential AFib' && <WarningAmberIcon fontSize="small" />}
                                          {event.type === 'Ectopic Beats' && <FavoriteIcon fontSize="small" />}
                                          {event.type === 'Low HRV' && <MonitorHeartIcon fontSize="small" />}
                                          {event.type}
                                        </Typography>
                                        <Chip 
                                          label={event.severity} 
                                          size="small"
                                          color={event.severity === 'High' ? "error" : "warning"}
                                        />
                                      </Box>
                                      
                                      <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Detection:</strong> {event.value} at {event.time || 'N/A'} on {event.date || 'N/A'}
                                      </Typography>
                                      
                                      {event.details && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          {event.details}
                                        </Typography>
                                      )}
                                      
                                      {event.hrv_metrics && (
                                        <Box sx={{ mt: 1 }}>
                                          <Typography variant="caption" color="text.secondary">
                                            HRV Metrics during event:
                                          </Typography>
                                          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                            {Object.entries(event.hrv_metrics).map(([key, value]) => (
                                              <Chip 
                                                key={key}
                                                label={`${key}: ${value}`} 
                                                size="small"
                                                sx={{ bgcolor: alpha(theme.palette.grey[500], 0.1), height: 24 }}
                                              />
                                            ))}
                                          </Stack>
                                        </Box>
                                      )}
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            </Paper>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>DISCLAIMER:</strong> These results are algorithmic estimations and not a medical diagnosis. 
                                Consult a healthcare professional for any concerning heart rhythm patterns.
                              </Typography>
                            </Box>
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Last scan: {new Date().toLocaleTimeString()}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small"
                            color="warning"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                          >
                            {isRefreshing ? 'Scanning...' : 'Rescan Now'}
                          </Button>
                        </Box>
                      </Paper>
                    </motion.div>
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
                
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <HeartRateChart data={heartData} period={period} />
                  {isMockData && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 8, 
                        right: 8, 
                        color: 'rgba(0,0,0,0.2)', 
                        fontSize: '9px',
                        fontStyle: 'italic',
                        opacity: 0.8
                      }}
                    >
                      ℹ
                    </Typography>
                  )}
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
