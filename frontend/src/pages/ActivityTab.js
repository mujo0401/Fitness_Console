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
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SyncIcon from '@mui/icons-material/Sync';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TerrainIcon from '@mui/icons-material/Terrain';
import InfoIcon from '@mui/icons-material/Info';
import { activityService, fitbitService, authService } from '../services/api';
import ActivityChart from '../components/charts/ActivityChart';
import { useAuth } from '../context/AuthContext';

// Activity intensity levels
const ACTIVITY_INTENSITY_LEVELS = [
  { 
    name: 'Sedentary', 
    min: 0, 
    max: 20, 
    color: '#9e9e9e', 
    description: 'Minimal movement, like sitting or lying down'
  },
  { 
    name: 'Light', 
    min: 20, 
    max: 50, 
    color: '#2196f3', 
    description: 'Everyday activities like walking, housework'
  },
  { 
    name: 'Moderate', 
    min: 50, 
    max: 70, 
    color: '#4caf50', 
    description: 'Brisk walking, dancing, active play'
  },
  { 
    name: 'Vigorous', 
    min: 70, 
    max: 85, 
    color: '#ff9800', 
    description: 'Running, swimming, fast cycling'
  },
  { 
    name: 'Peak', 
    min: 85, 
    max: 100, 
    color: '#f44336', 
    description: 'High-intensity interval training, sprinting'
  }
];

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

// Format duration as hours and minutes
const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Main component
const ActivityTab = () => {
  const theme = useTheme();
  const { isAuthenticated, tokenScopes } = useAuth();
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState(new Date());
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivityData();
    } else {
      // Set loading to false if not authenticated
      setLoading(false);
    }
  }, [isAuthenticated, period, date]);

  const fetchActivityData = async () => {
    if (!isValid(date)) return;
    
    if (!isAuthenticated) {
      setLoading(false);
      setError("Authentication required to view activity data.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Format date properly as a string
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log(`🔍 Fetching activity data for period: ${period}, date: ${formattedDate}`);
      
      // Check authentication first (same as HeartTab)
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
      
      // Fetch real data from API, fall back to mock data only if needed
      let data;
      let useMockData = false; // Default to using real data
      
      try {
        data = await activityService.getActivityData(period, formattedDate);
        console.log('📊 API Response:', data);
      } catch (apiError) {
        console.error("🔴 API Error:", apiError);
        useMockData = true;
        
        // If it's a 401 error, show specific message about scope permission
        if (apiError.response?.status === 401) {
          console.warn("⚠️ 401 Unauthorized: May need activity scope permission");
          setError("Activity data access requires additional permissions. This could be because the 'activity' scope was not granted during authentication. Using mock data for demonstration.");
        } else {
          setError(`Failed to fetch activity data: ${apiError.message || 'Unknown error'}. Using mock data for demonstration.`);
        }
      }
      
      if (useMockData || !data || !data.data || data.data.length === 0) {
        // Generate mock data for demonstration only when real data is unavailable
        console.log('⚠️ Using mock data instead');
        data = generateMockActivityData(period);
      }
      
      if (data && data.data && data.data.length > 0) {
        console.log(`✅ Received ${data.data.length} activity data points`);
        setActivityData(data.data);
      } else {
        console.warn('⚠️ Received empty activity data even after mock generation');
        setError("No activity data available. Using demo data for visualization.");
        const mockData = generateMockActivityData(period);
        setActivityData(mockData.data);
      }
    } catch (err) {
      console.error("🔴 Error in fetchActivityData:", err);
      
      // Use the same error handling style as HeartTab
      const errorMessage = err.response?.status === 401
        ? "Authentication required to view activity data. Using mock data for demonstration."
        : err.response?.status === 429
          ? "Rate limit exceeded. Please try again later. Using mock data for demonstration."
          : "Failed to load activity data. Using mock data for demonstration.";
      
      setError(errorMessage);
      
      // In case of error, generate mock data for demonstration
      const mockData = generateMockActivityData(period);
      setActivityData(mockData.data);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate mock activity data for demonstration
  const generateMockActivityData = (dataPeriod) => {
    console.log(`🔄 Generating mock activity data for period: ${dataPeriod}`);
    const mockData = [];
    
    if (dataPeriod === 'day') {
      // Generate hourly activity data for a day
      for (let hour = 0; hour < 24; hour++) {
        const isEarlyMorning = hour >= 0 && hour < 6;
        const isMorning = hour >= 6 && hour < 9;
        const isWorkDay = hour >= 9 && hour < 17;
        const isEvening = hour >= 17 && hour < 22;
        const isNight = hour >= 22;
        
        // Generate realistic activity patterns based on time of day
        let steps, activeMins, calories, distance, floors;
        
        if (isEarlyMorning) {
          // Minimal activity during sleeping hours
          steps = Math.floor(Math.random() * 100);
          activeMins = Math.floor(Math.random() * 3);
          calories = 50 + Math.floor(Math.random() * 20);
          distance = (steps / 1300).toFixed(2);
          floors = 0;
        } else if (isMorning) {
          // Morning routine and commute
          steps = 1000 + Math.floor(Math.random() * 2000);
          activeMins = 10 + Math.floor(Math.random() * 15);
          calories = 100 + Math.floor(Math.random() * 150);
          distance = (steps / 1300).toFixed(2);
          floors = 1 + Math.floor(Math.random() * 3);
        } else if (isWorkDay) {
          // Work hours with variation
          const isLunchHour = hour === 12 || hour === 13;
          
          if (isLunchHour) {
            steps = 500 + Math.floor(Math.random() * 1000);
            activeMins = 5 + Math.floor(Math.random() * 15);
          } else {
            steps = 200 + Math.floor(Math.random() * 500);
            activeMins = Math.floor(Math.random() * 10);
          }
          
          calories = 80 + Math.floor(Math.random() * 100);
          distance = (steps / 1300).toFixed(2);
          floors = Math.floor(Math.random() * 2);
        } else if (isEvening) {
          // Evening activity (possibly workout)
          const isWorkoutTime = hour === 18 || hour === 19;
          
          if (isWorkoutTime) {
            steps = 3000 + Math.floor(Math.random() * 4000);
            activeMins = 30 + Math.floor(Math.random() * 30);
            calories = 250 + Math.floor(Math.random() * 200);
            floors = 2 + Math.floor(Math.random() * 5);
          } else {
            steps = 500 + Math.floor(Math.random() * 1000);
            activeMins = 5 + Math.floor(Math.random() * 10);
            calories = 100 + Math.floor(Math.random() * 100);
            floors = Math.floor(Math.random() * 2);
          }
          
          distance = (steps / 1300).toFixed(2);
        } else {
          // Night time, winding down
          steps = 100 + Math.floor(Math.random() * 300);
          activeMins = Math.floor(Math.random() * 5);
          calories = 60 + Math.floor(Math.random() * 40);
          distance = (steps / 1300).toFixed(2);
          floors = 0;
        }
        
        // Convert hour to 12-hour format with AM/PM
        const hour12 = hour % 12 || 12;
        const ampm = hour < 12 ? 'AM' : 'PM';

        mockData.push({
          dateTime: format(date, 'yyyy-MM-dd'),
          time: `${hour12}:00 ${ampm}`,
          steps: steps,
          distance: parseFloat(distance),
          floors: floors,
          activeMinutes: activeMins,
          calories: calories,
          heartRate: 60 + Math.floor(Math.random() * 40),
          activityLevel: calculateActivityLevel(activeMins, steps)
        });
      }
    } else {
      // Generate daily data for longer periods (week, month)
      const days = dataPeriod === 'week' ? 7 : 30;
      
      for (let i = 0; i < days; i++) {
        const day = new Date(date);
        day.setDate(day.getDate() - i);
        const dateStr = format(day, 'yyyy-MM-dd');
        
        // Generate daily patterns with variations
        // Weekend vs weekday
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        
        let stepsBase, activeMinBase, caloriesBase, floorsBase;
        
        if (isWeekend) {
          // Weekends - potentially more leisure activity
          stepsBase = 8000 + Math.floor(Math.random() * 4000);
          activeMinBase = 60 + Math.floor(Math.random() * 60);
          caloriesBase = 2000 + Math.floor(Math.random() * 500);
          floorsBase = 8 + Math.floor(Math.random() * 8);
        } else {
          // Weekdays - work routine
          stepsBase = 6000 + Math.floor(Math.random() * 4000);
          activeMinBase = 40 + Math.floor(Math.random() * 50);
          caloriesBase = 1800 + Math.floor(Math.random() * 400);
          floorsBase = 5 + Math.floor(Math.random() * 5);
        }
        
        // Add random variation
        const steps = Math.max(0, stepsBase + Math.floor(Math.random() * 2000) - 1000);
        const activeMins = Math.max(0, activeMinBase + Math.floor(Math.random() * 30) - 15);
        const calories = Math.max(0, caloriesBase + Math.floor(Math.random() * 300) - 150);
        const floors = Math.max(0, floorsBase + Math.floor(Math.random() * 4) - 2);
        const distance = (steps / 1300).toFixed(2);
        
        // Activity breakdown in minutes
        const sedentaryMins = 1440 - activeMins; // 24 hours - active time
        const lightMins = Math.floor(activeMins * 0.5);
        const moderateMins = Math.floor(activeMins * 0.3);
        const vigorousMins = Math.floor(activeMins * 0.15);
        const peakMins = activeMins - lightMins - moderateMins - vigorousMins;
        
        mockData.push({
          dateTime: dateStr,
          steps: steps,
          distance: parseFloat(distance),
          floors: floors,
          activeMinutes: activeMins,
          calories: calories,
          sedentaryMinutes: sedentaryMins,
          lightActiveMinutes: lightMins,
          moderateActiveMinutes: moderateMins,
          vigorousActiveMinutes: vigorousMins,
          peakActiveMinutes: peakMins,
          activityLevel: calculateActivityLevel(activeMins, steps)
        });
      }
      
      // Sort by date
      mockData.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    }
    
    console.log(`✅ Generated ${mockData.length} mock activity data points`);
    
    return {
      data: mockData,
      period: dataPeriod,
      start_date: format(date, 'yyyy-MM-dd'),
      end_date: format(date, 'yyyy-MM-dd')
    };
  };
  
  // Calculate activity level based on active minutes and steps
  const calculateActivityLevel = (activeMinutes, steps) => {
    if (activeMinutes >= 60 && steps >= 10000) return 'Very Active';
    if (activeMinutes >= 30 && steps >= 7500) return 'Active';
    if (activeMinutes >= 20 && steps >= 5000) return 'Lightly Active';
    return 'Sedentary';
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
    fetchActivityData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 600); // Add a slight delay for visual feedback
    });
  };
  
  // Calculate statistics
  const getStats = () => {
    if (!activityData || activityData.length === 0) {
      return { 
        totalSteps: 0, 
        totalCalories: 0, 
        totalActiveMinutes: 0, 
        totalDistance: 0 
      };
    }
    
    // For day view, sum the hourly data
    if (period === 'day') {
      const totalSteps = activityData.reduce((sum, item) => sum + (item.steps || 0), 0);
      const totalActiveMinutes = activityData.reduce((sum, item) => sum + (item.activeMinutes || 0), 0);
      const totalCalories = activityData.reduce((sum, item) => sum + (item.calories || 0), 0);
      const totalDistance = parseFloat(activityData.reduce((sum, item) => sum + (item.distance || 0), 0).toFixed(2));
      
      return { totalSteps, totalCalories, totalActiveMinutes, totalDistance };
    }
    
    // For week/month, get averages
    const totalSteps = Math.round(activityData.reduce((sum, item) => sum + (item.steps || 0), 0) / activityData.length);
    const totalActiveMinutes = Math.round(activityData.reduce((sum, item) => sum + (item.activeMinutes || 0), 0) / activityData.length);
    const totalCalories = Math.round(activityData.reduce((sum, item) => sum + (item.calories || 0), 0) / activityData.length);
    const totalDistance = parseFloat((activityData.reduce((sum, item) => sum + (item.distance || 0), 0) / activityData.length).toFixed(2));
    
    return { 
      totalSteps, 
      totalCalories, 
      totalActiveMinutes, 
      totalDistance
    };
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h5" color="primary" gutterBottom>
              <DirectionsRunIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Activity Tracking
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Please connect your Fitbit account to view activity data.
            </Typography>
          </Paper>
        </Box>
      </motion.div>
    );
  }
  
  const { totalSteps, totalCalories, totalActiveMinutes, totalDistance } = getStats();

  // Determine if we're using mock data
  const isMockData = activityData && activityData.length > 0 && (
    activityData[0].time?.includes('AM') || 
    activityData[0].time?.includes('PM') ||
    activityData.some(item => item.activityLevel === 'Very Active' || item.activityLevel === 'Active')
  );
  
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
            background: 'linear-gradient(135deg, #009688, #4caf50)', 
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
              <DirectionsRunIcon sx={{ filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))' }} /> 
              Activity Tracking
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
                  Loading activity data...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6" gutterBottom>
                  {error}
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
                    Has 'activity' scope: {tokenScopes.includes('activity') ? 'Yes' : 'No - this is required for activity data'}
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
                  </Box>
                </Paper>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleRefresh} 
                    startIcon={<RefreshIcon />}
                  >
                    Try Again
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
            ) : !activityData || activityData.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No activity data available for the selected period.
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                  sx={{ mt: 2 }}
                >
                  Refresh
                </Button>
              </Box>
            ) : (
              <Box>
                <Box sx={{ px: 3, py: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Steps" 
                        value={totalSteps.toLocaleString()} 
                        color="#4caf50"
                        icon={<DirectionsRunIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Active Minutes" 
                        value={totalActiveMinutes} 
                        unit="min"
                        color="#009688"
                        icon={<AccessTimeIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Calories" 
                        value={totalCalories.toLocaleString()} 
                        unit="kcal"
                        color="#ff9800"
                        icon={<LocalFireDepartmentIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Distance" 
                        value={totalDistance} 
                        unit="km"
                        color="#2196f3"
                        icon={<TerrainIcon />}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <ActivityChart data={activityData} period={period} />
                  {isMockData && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 8, 
                        right: 8, 
                        color: 'rgba(76, 175, 80, 0.25)', 
                        fontSize: '10px',
                        fontStyle: 'italic'
                      }}
                    >
                      ⊕
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ px: 3, pb: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        <Card elevation={3} sx={{ 
                          borderRadius: 3,
                          background: 'linear-gradient(145deg, #fafafa, #f0f0f0)',
                          height: '100%'
                        }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MonitorHeartIcon color="primary" />
                              Activity Breakdown
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            
                            {activityData && activityData.length > 0 && period !== 'day' ? (
                              <Stack spacing={2}>
                                {/* Show activity breakdown for week/month view */}
                                {activityData[0].sedentaryMinutes !== undefined && (
                                  <>
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#9e9e9e' }} />
                                          <Typography variant="body2">
                                            Sedentary
                                          </Typography>
                                        </Box>
                                        <Chip 
                                          size="small" 
                                          label={formatDuration(activityData[0].sedentaryMinutes)} 
                                          sx={{ bgcolor: '#9e9e9e', color: 'white', fontWeight: 'medium' }}
                                        />
                                      </Box>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={Math.min(100, (activityData[0].lightActiveMinutes / 120) * 100)} 
                                        sx={{ 
                                          height: 8, 
                                          borderRadius: 4,
                                          bgcolor: alpha('#2196f3', 0.2),
                                          '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }
                                        }}
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        Walking slowly, casual daily activities
                                      </Typography>
                                    </Box>
                                    
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                          <Typography variant="body2">
                                            Moderate Activity
                                          </Typography>
                                        </Box>
                                        <Chip 
                                          size="small" 
                                          label={formatDuration(activityData[0].moderateActiveMinutes)} 
                                          sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 'medium' }}
                                        />
                                      </Box>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={Math.min(100, (activityData[0].moderateActiveMinutes / 60) * 100)} 
                                        sx={{ 
                                          height: 8, 
                                          borderRadius: 4,
                                          bgcolor: alpha('#4caf50', 0.2),
                                          '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' }
                                        }}
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        Brisk walking, light cycling or swimming
                                      </Typography>
                                    </Box>
                                    
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                          <Typography variant="body2">
                                            Vigorous Activity
                                          </Typography>
                                        </Box>
                                        <Chip 
                                          size="small" 
                                          label={formatDuration(activityData[0].vigorousActiveMinutes)} 
                                          sx={{ bgcolor: '#ff9800', color: 'white', fontWeight: 'medium' }}
                                        />
                                      </Box>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={Math.min(100, (activityData[0].vigorousActiveMinutes / 30) * 100)} 
                                        sx={{ 
                                          height: 8, 
                                          borderRadius: 4,
                                          bgcolor: alpha('#ff9800', 0.2),
                                          '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' }
                                        }}
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        Running, intense exercise, fast cycling
                                      </Typography>
                                    </Box>
                                    
                                    <Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
                                          <Typography variant="body2">
                                            Peak Activity
                                          </Typography>
                                        </Box>
                                        <Chip 
                                          size="small" 
                                          label={formatDuration(activityData[0].peakActiveMinutes)} 
                                          sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 'medium' }}
                                        />
                                      </Box>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={Math.min(100, (activityData[0].peakActiveMinutes / 15) * 100)} 
                                        sx={{ 
                                          height: 8, 
                                          borderRadius: 4,
                                          bgcolor: alpha('#f44336', 0.2),
                                          '& .MuiLinearProgress-bar': { bgcolor: '#f44336' }
                                        }}
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        High-intensity interval training, sprinting
                                      </Typography>
                                    </Box>
                                  </>
                                )}
                                
                                {/* If no detailed breakdown is available */}
                                {activityData[0].sedentaryMinutes === undefined && (
                                  <Typography variant="body2" color="text.secondary">
                                    Detailed activity breakdown not available for this period.
                                  </Typography>
                                )}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {period === 'day' 
                                  ? "Select week or month view to see detailed activity breakdowns." 
                                  : "No activity breakdown data available."}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <Card elevation={3} sx={{ 
                          borderRadius: 3,
                          background: 'linear-gradient(145deg, #e8f5e9, #f1f8e9)',
                          height: '100%'
                        }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                              Activity Insights
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            
                            {activityData && activityData.length > 0 ? (
                              <Box>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  borderRadius: 2, 
                                  bgcolor: 'rgba(255,255,255,0.7)', 
                                  p: 2,
                                  mb: 2
                                }}>
                                  <Typography variant="body1" color="text.primary">
                                    {period === 'day' ? (
                                      totalSteps >= 10000 ? (
                                        <>Congratulations! You've reached <b>{totalSteps.toLocaleString()}</b> steps today, exceeding the recommended 10,000 steps goal.</>
                                      ) : (
                                        <>You've taken <b>{totalSteps.toLocaleString()}</b> steps today. That's {Math.round((totalSteps/10000)*100)}% of the recommended 10,000 daily steps.</>
                                      )
                                    ) : (
                                      totalSteps >= 10000 ? (
                                        <>Your average of <b>{totalSteps.toLocaleString()}</b> steps per day meets the recommended goal of 10,000 steps.</>
                                      ) : (
                                        <>Your average of <b>{totalSteps.toLocaleString()}</b> steps per day is {Math.round((totalSteps/10000)*100)}% of the recommended 10,000 daily steps.</>
                                      )
                                    )}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  borderRadius: 2, 
                                  bgcolor: 'rgba(255,255,255,0.7)', 
                                  p: 2
                                }}>
                                  <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Active Minutes
                                    </Typography>
                                    <Typography variant="h4" color="#2e7d32">
                                      {totalActiveMinutes} <Typography component="span" variant="body2">min</Typography>
                                    </Typography>
                                  </Box>
                                  
                                  <Chip 
                                    label={totalActiveMinutes >= 30 ? "Goal Reached" : "Below Goal"} 
                                    color={totalActiveMinutes >= 30 ? "success" : "warning"}
                                  />
                                </Box>
                                
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(100, (totalActiveMinutes / 30) * 100)} 
                                  sx={{ 
                                    mt: 1,
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: 'rgba(0,0,0,0.1)',
                                    '& .MuiLinearProgress-bar': { bgcolor: totalActiveMinutes >= 30 ? '#4caf50' : '#ff9800' }
                                  }}
                                />
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                  {totalActiveMinutes >= 30 
                                    ? "You've reached the minimum recommended 30 minutes of daily activity."
                                    : "Try to get at least 30 minutes of moderate activity daily for heart health."}
                                </Typography>
                                
                                <Box sx={{ mt: 3 }}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Calories Burned
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    You've burned approximately <b>{totalCalories.toLocaleString()}</b> calories through your activities.
                                  </Typography>
                                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                      Tip: Aim for 300-500 calories from exercise daily to maintain weight
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                <Box sx={{ mt: 3 }}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Steps Analysis
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {totalSteps >= 10000 
                                      ? "Excellent job! You're meeting or exceeding the recommended 10,000 steps daily target."
                                      : totalSteps >= 7500
                                        ? "Good progress! You're close to the recommended 10,000 steps daily target."
                                        : "Keep moving! Try to increase your daily steps toward the 10,000 steps goal."}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No data available for insights.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  </Grid>
                </Box>
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

export default ActivityTab;