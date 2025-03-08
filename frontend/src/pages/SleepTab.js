import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress,
  Button,
  Paper,
  useTheme,
  alpha,
  LinearProgress,
  Avatar,
  Snackbar,
  Alert,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { isValid, format, subDays, addDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, isAfter } from 'date-fns';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Icons
import BedtimeIcon from '@mui/icons-material/Bedtime';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import RefreshIcon from '@mui/icons-material/Refresh';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import HotelIcon from '@mui/icons-material/Hotel';
import TimerIcon from '@mui/icons-material/Timer';
import SyncIcon from '@mui/icons-material/Sync';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightlightIcon from '@mui/icons-material/Nightlight';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DevicesIcon from '@mui/icons-material/Devices';
import WavesIcon from '@mui/icons-material/Waves';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';

// Services 
import { sleepService, fitbitService, googleFitService, appleFitnessService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Components
import SleepChart from '../components/charts/SleepChart';
import DiagnosticsPanel from '../components/DiagnosticsPanel.js';
import { GlassCard, AnimatedGradientText } from '../components/styled/CardComponents';

// Sleep quality levels with colors
const SLEEP_QUALITY_LEVELS = [
  { 
    name: 'Excellent', 
    min: 90, 
    max: 100, 
    color: '#3f51b5', 
    gradient: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
    description: 'Optimal sleep quality and duration'
  },
  { 
    name: 'Good', 
    min: 80, 
    max: 89, 
    color: '#2196f3', 
    gradient: 'linear-gradient(135deg, #2196f3 0%, #4dabf5 100%)',
    description: 'Good sleep quality with proper sleep cycles'
  },
  { 
    name: 'Fair', 
    min: 70, 
    max: 79, 
    color: '#009688', 
    gradient: 'linear-gradient(135deg, #009688 0%, #4db6ac 100%)',
    description: 'Average sleep quality, may need improvement'
  },
  { 
    name: 'Poor', 
    min: 50, 
    max: 69, 
    color: '#ff9800', 
    gradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
    description: 'Below average sleep quality, needs attention'
  },
  { 
    name: 'Very Poor', 
    min: 0, 
    max: 49, 
    color: '#f44336', 
    gradient: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
    description: 'Insufficient or disrupted sleep, needs intervention'
  }
];

// Time interval options
const TIME_INTERVALS = [
  { value: 'day', label: 'Day', icon: <CalendarTodayIcon fontSize="small" /> },
  { value: 'week', label: 'Week', icon: <TimelineIcon fontSize="small" /> },
  { value: 'month', label: 'Month', icon: <HistoryIcon fontSize="small" /> }
];

// Get sleep quality level based on score
const getSleepQualityLevel = (score) => {
  if (!score) return null;
  return SLEEP_QUALITY_LEVELS.find(level => score >= level.min && score <= level.max);
};

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

// Main component
const SleepTab = () => {
  const theme = useTheme();
  const { isAuthenticated, tokenScopes } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Core state
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sleepData, setSleepData] = useState(null);
  const [fitbitData, setFitbitData] = useState(null);
  const [googleFitData, setGoogleFitData] = useState(null);
  const [appleHealthData, setAppleHealthData] = useState(null);
  const [activeDataSource, setActiveDataSource] = useState('auto');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataSourcesAvailable, setDataSourcesAvailable] = useState({
    fitbit: false,
    googleFit: false,
    appleHealth: false
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  const [showDiagnosticsPanel, setShowDiagnosticsPanel] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  
  // Debug mode for loading issues
  const [debugMode, setDebugMode] = useState(true);

  // Effect to fetch data when parameters change
  useEffect(() => {
    if (isAuthenticated) {
      if (debugMode) console.log('🔍 DEBUG: Starting data fetch with params:', { period, formattedDate, activeDataSource });
      fetchAllSleepData();
    } else {
      if (debugMode) console.log('🔍 DEBUG: Not authenticated, setting loading false');
      setLoading(false);
    }
  }, [isAuthenticated, period, formattedDate, activeDataSource]);

  // Handle date change with proper formatting
  const handleDateChange = (newDate) => {
    if (newDate && isValid(newDate)) {
      // Fix timezone issues by using the date parts directly
      setDate(newDate);
      setFormattedDate(format(newDate, 'yyyy-MM-dd'));
      setShowDatePicker(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };
  
  // Handle quick date navigation
  const handleQuickDateChange = (direction) => {
    let newDate;
    switch (period) {
      case 'day':
        newDate = direction === 'next' ? addDays(date, 1) : subDays(date, 1);
        break;
      case 'week':
        newDate = direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
        break;
      case 'month':
        newDate = direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
        break;
      default:
        newDate = direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    }
    handleDateChange(newDate);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllSleepData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  // Handle data source change
  const handleDataSourceChange = (source) => {
    console.log(`Changing data source to: ${source}`);
    setActiveDataSource(source);
    
    // After changing data source, refresh processed data
    determineSleepDataToUse();
  };

  // Handle diagnostics panel
  const handleOpenDiagnosticsPanel = () => {
    setShowDiagnosticsPanel(true);
  };
  
  const handleCloseDiagnosticsPanel = () => {
    setShowDiagnosticsPanel(false);
  };

  // Fetch data from all available sources
  const fetchAllSleepData = async () => {
    if (debugMode) console.log('🔍 DEBUG: fetchAllSleepData started');
    
    if (!isValid(date)) {
      if (debugMode) console.log('🔍 DEBUG: Invalid date, setting loading false');
      setLoading(false);
      setError("Invalid date selected.");
      return;
    }
    
    if (!isAuthenticated) {
      if (debugMode) console.log('🔍 DEBUG: Not authenticated, setting loading false');
      setLoading(false);
      setError("Authentication required to view sleep data.");
      return;
    }
    
    if (debugMode) console.log('🔍 DEBUG: Setting loading true, clearing error');
    setLoading(true);
    setError(null);
    
    try {
      // Check which services are connected
      const [fitbitStatus, googleFitStatus, appleHealthStatus] = await Promise.allSettled([
        fitbitService.checkStatus(),
        googleFitService.checkStatus(),
        appleFitnessService.checkStatus()
      ]);
      
      const availableSources = {
        fitbit: fitbitStatus.status === 'fulfilled' && fitbitStatus.value?.connected,
        googleFit: googleFitStatus.status === 'fulfilled' && googleFitStatus.value?.connected,
        appleHealth: appleHealthStatus.status === 'fulfilled' && appleHealthStatus.value?.connected
      };
      
      console.log('Available sleep data sources:', availableSources);
      setDataSourcesAvailable(availableSources);
      
      // Helper function to fetch sleep data from a specific source
      const fetchSleepData = async (source) => {
        try {
          if (debugMode) console.log(`🔍 DEBUG: fetchSleepData for source: ${source}`);
          console.log(`Fetching sleep data from ${source} for ${period} on ${formattedDate}`);
          let response;
          
          switch (source) {
            case 'fitbit':
              response = await sleepService.getSleepData(period, formattedDate);
              break;
            case 'googleFit':
              if (debugMode) console.log(`🔍 DEBUG: Calling googleFitService.getSleepData`);
              try {
                response = await googleFitService.getSleepData(period, formattedDate);
                if (debugMode) console.log(`🔍 DEBUG: Google Fit response:`, response);
              } catch (gfError) {
                if (debugMode) console.log(`🔍 DEBUG: Google Fit error:`, gfError);
                // If Google Fit API fails, return empty array instead of null
                return [];
              }
              break;
            case 'appleHealth':
              response = await appleFitnessService.getSleepData(period, formattedDate);
              break;
            default:
              throw new Error(`Unknown data source: ${source}`);
          }
          
          if (debugMode) console.log(`🔍 DEBUG: ${source} data fetch successful`);
          console.log(`Successfully fetched ${source} sleep data:`, response);
          
          // Handle null/undefined response
          if (!response) {
            if (debugMode) console.log(`🔍 DEBUG: ${source} returned null/undefined response`);
            return [];
          }
          
          // Format the data consistently
          if (source === 'googleFit') {
            // Google Fit handling with better error checks
            if (Array.isArray(response)) {
              if (debugMode) console.log(`🔍 DEBUG: Formatting Google Fit array of length ${response.length}`);
              // Google Fit returns an array directly - ensure the data is formatted correctly
              console.log(`Formatting Google Fit sleep data array of length ${response.length}`);
              return response.map(item => {
                // Convert Google Fit format to match our app's expected format
                return {
                  ...item,
                  // Add any missing fields Google Fit might not provide
                  date: item.date || format(new Date((item.timestamp || 0) * 1000), 'yyyy-MM-dd'),
                  // Add default fields if they don't exist
                  efficiency: item.efficiency || 85,
                  score: item.score || 75,
                  timestamp: item.timestamp || Date.now() / 1000
                };
              });
            } else if (response.data && Array.isArray(response.data)) {
              if (debugMode) console.log(`🔍 DEBUG: Formatting Google Fit nested array of length ${response.data.length}`);
              return response.data.map(item => ({
                ...item,
                date: item.date || format(new Date((item.timestamp || 0) * 1000), 'yyyy-MM-dd'),
                efficiency: item.efficiency || 85,
                score: item.score || 75,
                timestamp: item.timestamp || Date.now() / 1000
              }));
            } else {
              if (debugMode) console.log(`🔍 DEBUG: Google Fit returned unexpected format, returning empty array`);
              return [];
            }
          }
          
          return response;
        } catch (error) {
          if (debugMode) console.log(`🔍 DEBUG: Error in fetchSleepData for ${source}:`, error);
          console.error(`Error fetching ${source} sleep data:`, error);
          // Return empty array instead of null
          return [];
        }
      };
      
      // Fetch data from all connected sources in parallel
      let promises = [];
      let promiseLabels = [];
      
      if (availableSources.fitbit) {
        promises.push(fetchSleepData('fitbit'));
        promiseLabels.push('fitbit');
      }
      
      if (availableSources.googleFit) {
        promises.push(fetchSleepData('googleFit'));
        promiseLabels.push('googleFit');
      }
      
      if (availableSources.appleHealth) {
        promises.push(fetchSleepData('appleHealth'));
        promiseLabels.push('appleHealth');
      }
      
      // If no service is connected, use mock data
      if (promises.length === 0) {
        if (debugMode) console.log('🔍 DEBUG: No fitness services connected. Using mock data.');
        console.log('No fitness services connected. Using mock data.');
        const mockData = generateMockSleepData(period);
        setSleepData(mockData.data);
        setFitbitData(mockData.data);
        
        // Ensure loading is set to false 
        if (debugMode) console.log('🔍 DEBUG: Setting loading false (no services connected)');
        setLoading(false);
        return;
      }
      
      // Create object to store the processed data
      const processedData = {
        fitbit: null,
        googleFit: null,
        appleHealth: null
      };
      
      // Wait for all promises to settle
      const results = await Promise.allSettled(promises);
      
      if (debugMode) console.log('🔍 DEBUG: All promises settled, processing results');
      
      // Process results
      results.forEach((result, index) => {
        const source = promiseLabels[index];
        if (debugMode) console.log(`🔍 DEBUG: Processing ${source} result`, result);
        
        if (result.status === 'fulfilled') {
          console.log(`Processing ${source} result:`, {
            isArray: Array.isArray(result.value),
            length: Array.isArray(result.value) ? result.value.length : 'N/A',
            hasData: result.value?.data ? "Yes" : "No",
            dataLength: result.value?.data?.length || 0
          });
          
          // Handle Google Fit data which is now pre-formatted in fetchSleepData
          if (source === 'googleFit') {
            if (Array.isArray(result.value) && result.value.length > 0) {
              console.log(`Setting Google Fit data of length ${result.value.length}`);
              processedData.googleFit = result.value;
            } else if (result.value?.data?.length > 0) {
              console.log(`Setting Google Fit data from data field of length ${result.value.data.length}`);
              processedData.googleFit = result.value.data;
            } else {
              console.warn(`No data received from ${source}`);
            }
          }
          // Handle Fitbit and Apple Health
          else if (source === 'fitbit' || source === 'appleHealth') {
            if (result.value?.data?.length > 0) {
              console.log(`Successfully fetched ${source} data:`, result.value.data.length);
              if (source === 'fitbit') processedData.fitbit = result.value.data;
              if (source === 'appleHealth') processedData.appleHealth = result.value.data;
            } else if (Array.isArray(result.value) && result.value.length > 0) {
              console.log(`Successfully fetched ${source} data (array):`, result.value.length);
              if (source === 'fitbit') processedData.fitbit = result.value;
              if (source === 'appleHealth') processedData.appleHealth = result.value;
            } else {
              console.warn(`No data received from ${source}`);
            }
          }
        } else {
          console.error(`Failed to fetch data from ${source}:`, result.reason || 'Unknown error');
        }
      });
      
      // Now update state with the processed data
      if (debugMode) console.log('🔍 DEBUG: Updating state with processed data');
      
      if (processedData.fitbit) {
        console.log("Setting Fitbit sleep data state:", processedData.fitbit.length);
        setFitbitData(processedData.fitbit);
      }
      
      if (processedData.googleFit) {
        console.log("Setting Google Fit sleep data state:", processedData.googleFit.length);
        setGoogleFitData(processedData.googleFit);
        
        // If we have Google Fit data, immediately use it (especially for debugging)
        if (activeDataSource === 'auto' || activeDataSource === 'googleFit') {
          console.log("Immediately using Google Fit sleep data:", processedData.googleFit.length);
          setSleepData(processedData.googleFit);
        }
      }
      
      if (processedData.appleHealth) {
        console.log("Setting Apple Health sleep data state:", processedData.appleHealth.length);
        setAppleHealthData(processedData.appleHealth);
      }
      
      // Important: Call determineSleepDataToUse directly here first as a safeguard
      if (debugMode) console.log('🔍 DEBUG: First determineSleepDataToUse call (immediately)');
      determineSleepDataToUse();
      
      // Wait for state to update with enough time
      setTimeout(() => {
        // Now determine which data to use based on activeDataSource setting (second call)
        if (debugMode) console.log('🔍 DEBUG: Second determineSleepDataToUse call (after delay)');
        determineSleepDataToUse();
        
        // Ensure loading is set to false here as well (safety)
        if (debugMode) console.log('🔍 DEBUG: Setting loading to false in setTimeout');
        setLoading(false);
      }, 500);
      
    } catch (error) {
      if (debugMode) console.log('🔍 DEBUG: Error in fetchAllSleepData catch block', error);
      console.error('Error fetching sleep data:', error);
      setError('Failed to fetch sleep data. Please try again.');
      
      // Use mock data as fallback
      if (debugMode) console.log('🔍 DEBUG: Generating mock data as fallback');
      const mockData = generateMockSleepData(period);
      setSleepData(mockData.data);
      setFitbitData(mockData.data);
    } finally {
      if (debugMode) console.log('🔍 DEBUG: In finally block, setting loading false');
      setLoading(false);
    }
  };

  // Determine which sleep data to use based on settings and availability
  const determineSleepDataToUse = () => {
    if (debugMode) console.log('🔍 DEBUG: determineSleepDataToUse called');
    console.log("Determining sleep data source:", {
      activeDataSource,
      googleFitDataLength: googleFitData ? googleFitData.length : 0,
      fitbitDataLength: fitbitData ? fitbitData.length : 0,
      appleHealthLength: appleHealthData ? appleHealthData.length : 0
    });
    
    // Force checking googleFitData again to ensure it's up to date
    if (googleFitData && googleFitData.length > 0) {
      console.log('Found Google Fit sleep data in state:', googleFitData.length);
    }
    
    switch (activeDataSource) {
      case 'fitbit':
        if (fitbitData && fitbitData.length > 0) {
          setSleepData(fitbitData);
          console.log('Using Fitbit sleep data');
        } else {
          setError('Fitbit sleep data is not available. Please select another data source.');
          setSleepData([]);
        }
        break;
        
      case 'googleFit':
        if (googleFitData && googleFitData.length > 0) {
          console.log('Setting sleep data to Google Fit data');
          setSleepData([...googleFitData]);  // Create a new array copy to ensure state update
        } else {
          setError('Google Fit sleep data is not available. Please select another data source.');
          setSleepData([]);
        }
        break;
        
      case 'appleHealth':
        if (appleHealthData && appleHealthData.length > 0) {
          setSleepData(appleHealthData);
          console.log('Using Apple Health sleep data');
        } else {
          setError('Apple Health sleep data is not available. Please select another data source.');
          setSleepData([]);
        }
        break;
        
      case 'combined':
        // Combine all available data and sort by timestamp
        const combinedData = [
          ...(fitbitData || []),
          ...(googleFitData || []),
          ...(appleHealthData || [])
        ].sort((a, b) => {
          const aTime = a.timestamp || new Date(a.date + ' ' + (a.time || '00:00')).getTime();
          const bTime = b.timestamp || new Date(b.date + ' ' + (b.time || '00:00')).getTime();
          return aTime - bTime;
        });
        
        if (combinedData.length > 0) {
          setSleepData(combinedData);
          console.log('Using combined sleep data:', combinedData.length);
        } else {
          setError('No sleep data available from any source.');
          setSleepData([]);
        }
        break;
        
      case 'auto':
      default:
        if (debugMode) console.log('🔍 DEBUG: Using auto data source selection logic');
        // Auto-select the best dataset based on data quality and completeness
        if (googleFitData && Array.isArray(googleFitData) && googleFitData.length > 0) {
          if (debugMode) console.log('🔍 DEBUG: Using Google Fit data (auto)');
          console.log('Auto-selected Google Fit sleep data with length:', googleFitData.length);
          setSleepData([...googleFitData]); // Create a new array copy to ensure state update
        } else if (fitbitData && Array.isArray(fitbitData) && fitbitData.length > 0) {
          if (debugMode) console.log('🔍 DEBUG: Using Fitbit data (auto)');
          setSleepData([...fitbitData]);
          console.log('Auto-selected Fitbit sleep data');
        } else if (appleHealthData && Array.isArray(appleHealthData) && appleHealthData.length > 0) {
          if (debugMode) console.log('🔍 DEBUG: Using Apple Health data (auto)');
          setSleepData([...appleHealthData]);
          console.log('Auto-selected Apple Health sleep data');
        } else {
          // No data available from any source, use mock data
          if (debugMode) console.log('🔍 DEBUG: No data available, using mock data');
          console.log('No sleep data available from any source, using mock data.');
          const mockData = generateMockSleepData(period);
          setSleepData(mockData.data);
        }
        
        // Safety check - make sure loading is set to false here
        if (debugMode) console.log('🔍 DEBUG: Setting loading to false (after auto source selection)');
        setLoading(false);
        break;
    }
  };
  
  // Generate mock sleep data for demonstration
  const generateMockSleepData = (dataPeriod) => {
    console.log(`🔄 Generating mock sleep data for period: ${dataPeriod}`);
    const mockData = [];
    
    if (dataPeriod === 'day') {
      // Generate a single day's sleep data
      const sleepDate = format(date, 'yyyy-MM-dd');
      
      // Random sleep efficiency (85-98%)
      const efficiency = 85 + Math.floor(Math.random() * 13);
      
      // Random sleep duration (6-9 hours in minutes)
      const durationMinutes = 360 + Math.floor(Math.random() * 180);
      
      // Random sleep stages (percentages)
      const deepPercent = 15 + Math.floor(Math.random() * 10);
      const remPercent = 20 + Math.floor(Math.random() * 15);
      const lightPercent = 100 - deepPercent - remPercent;
      
      // Convert percentages to minutes
      const deepMinutes = Math.round((deepPercent / 100) * durationMinutes);
      const remMinutes = Math.round((remPercent / 100) * durationMinutes);
      const lightMinutes = Math.round((lightPercent / 100) * durationMinutes);
      
      // Random time awake during night (0-30 minutes)
      const awakeMinutes = Math.floor(Math.random() * 30);
      
      // Random sleep score (60-95)
      const score = 60 + Math.floor(Math.random() * 35);
      
      // Add timestamp (unix seconds)
      const timestamp = Math.floor(new Date(sleepDate).getTime() / 1000);
      
      mockData.push({
        date: sleepDate,
        startTime: '10:30 PM',
        endTime: '6:45 AM',
        durationMinutes: durationMinutes,
        efficiency: efficiency,
        deepSleepMinutes: deepMinutes,
        lightSleepMinutes: lightMinutes,
        remSleepMinutes: remMinutes,
        awakeDuringNight: awakeMinutes,
        deepSleepPercentage: deepPercent,
        lightSleepPercentage: lightPercent,
        remSleepPercentage: remPercent,
        score: score,
        timestamp: timestamp
      });
    } else {
      // Generate multiple days of sleep data
      const days = dataPeriod === 'week' ? 7 : 30;
      
      for (let i = 0; i < days; i++) {
        const day = new Date(date);
        day.setDate(day.getDate() - i);
        const sleepDate = format(day, 'yyyy-MM-dd');
        
        // Weekend vs. weekday variations
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        
        // Random sleep efficiency (85-98%)
        const efficiency = 85 + Math.floor(Math.random() * 13);
        
        // Random sleep duration (longer on weekends)
        const durationMinutes = isWeekend 
          ? 420 + Math.floor(Math.random() * 120) // 7-9 hours on weekends
          : 360 + Math.floor(Math.random() * 120); // 6-8 hours on weekdays
        
        // Random sleep stages (percentages)
        const deepPercent = 15 + Math.floor(Math.random() * 10);
        const remPercent = 20 + Math.floor(Math.random() * 15);
        const lightPercent = 100 - deepPercent - remPercent;
        
        // Convert percentages to minutes
        const deepMinutes = Math.round((deepPercent / 100) * durationMinutes);
        const remMinutes = Math.round((remPercent / 100) * durationMinutes);
        const lightMinutes = Math.round((lightPercent / 100) * durationMinutes);
        
        // Random time awake during night (0-30 minutes)
        const awakeMinutes = Math.floor(Math.random() * 30);
        
        // Random sleep score (60-95)
        const score = 60 + Math.floor(Math.random() * 35);
        
        // Add timestamp (unix seconds)
        const timestamp = Math.floor(day.getTime() / 1000);
        
        mockData.push({
          date: sleepDate,
          durationMinutes: durationMinutes,
          efficiency: efficiency,
          deepSleepMinutes: deepMinutes,
          lightSleepMinutes: lightMinutes,
          remSleepMinutes: remMinutes,
          awakeDuringNight: awakeMinutes,
          deepSleepPercentage: deepPercent,
          lightSleepPercentage: lightPercent,
          remSleepPercentage: remPercent,
          score: score,
          timestamp: timestamp
        });
      }
      
      // Sort by date
      mockData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    console.log(`✅ Generated ${mockData.length} mock sleep data points`);
    
    return {
      data: mockData,
      period: dataPeriod,
      start_date: format(date, 'yyyy-MM-dd'),
      end_date: format(date, 'yyyy-MM-dd')
    };
  };
  
  // Calculate statistics
  const getStats = () => {
    if (!sleepData || sleepData.length === 0) {
      return { 
        avgDuration: 0, 
        avgDeepSleep: 0, 
        avgEfficiency: 0, 
        avgScore: 0 
      };
    }
    
    const totalDuration = sleepData.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
    const avgDuration = Math.round(totalDuration / sleepData.length);
    
    const totalDeepSleep = sleepData.reduce((sum, item) => sum + (item.deepSleepMinutes || 0), 0);
    const avgDeepSleep = Math.round(totalDeepSleep / sleepData.length);
    
    const totalEfficiency = sleepData.reduce((sum, item) => sum + (item.efficiency || 0), 0);
    const avgEfficiency = Math.round(totalEfficiency / sleepData.length);
    
    const scoresWithValues = sleepData.filter(item => item.score > 0);
    const avgScore = scoresWithValues.length > 0
      ? Math.round(scoresWithValues.reduce((sum, item) => sum + item.score, 0) / scoresWithValues.length)
      : 0;
      
    return { 
      avgDuration, 
      avgDeepSleep, 
      avgEfficiency, 
      avgScore 
    };
  };

  // Format duration as hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Render date label based on period
  const dateLabel = useMemo(() => {
    if (!date) return '';
    
    switch (period) {
      case 'day':
        return format(date, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(date);
        const weekEnd = endOfWeek(date);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(date, 'MMMM yyyy');
      default:
        return format(date, 'MMMM d, yyyy');
    }
  }, [date, period]);

  // Data source display component
  const DataSourceIndicator = () => {
    let sourceLabel = 'No Data';
    let color = 'default';
    
    if (activeDataSource === 'fitbit') {
      sourceLabel = 'Fitbit';
      color = 'primary';
    } else if (activeDataSource === 'googleFit') {
      sourceLabel = 'Google Fit';
      color = 'info';
    } else if (activeDataSource === 'appleHealth') {
      sourceLabel = 'Apple Health';
      color = 'success';
    } else if (activeDataSource === 'combined') {
      sourceLabel = 'All Sources';
      color = 'secondary';
    } else if (activeDataSource === 'auto') {
      if (googleFitData && googleFitData.length > 0) {
        sourceLabel = 'Google Fit (Auto)';
        color = 'info';
      } else if (fitbitData && fitbitData.length > 0) {
        sourceLabel = 'Fitbit (Auto)';
        color = 'primary';
      } else if (appleHealthData && appleHealthData.length > 0) {
        sourceLabel = 'Apple Health (Auto)';
        color = 'success';
      } else {
        sourceLabel = 'Demo Data';
        color = 'default';
      }
    }
    
    return (
      <Chip
        size="small"
        icon={<DevicesIcon />}
        label={sourceLabel}
        color={color}
        variant="outlined"
        onClick={() => setShowDataSourceDialog(true)}
        sx={{ ml: 1, borderRadius: 2 }}
      />
    );
  };

  // Check if we're using mock data
  const isMockData = sleepData && sleepData.length > 0 && 
                     !fitbitData && !googleFitData && !appleHealthData;

  // Get basic statistics
  const { avgDuration, avgDeepSleep, avgEfficiency, avgScore } = getStats();
  const qualityLevel = getSleepQualityLevel(avgScore);

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
              <BedtimeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Sleep Analysis
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Please connect your fitness account to view sleep data.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => authService.login()}
              sx={{ mt: 2 }}
            >
              Connect Account
            </Button>
          </Paper>
        </Box>
      </motion.div>
    );
  }

  // Simple sleep data source dialog
  const DataSourceDialog = ({ open, onClose }) => {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Select Sleep Data Source
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose which connected service to use for sleep data. Available sources are detected automatically.
          </Typography>
          
          <List>
            <ListItem button 
              selected={activeDataSource === 'auto'} 
              onClick={() => { handleDataSourceChange('auto'); onClose(); }}
              disabled={!dataSourcesAvailable.fitbit && !dataSourcesAvailable.googleFit && !dataSourcesAvailable.appleHealth}
            >
              <ListItemIcon>
                <AutoAwesomeIcon color={activeDataSource === 'auto' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Automatic (Recommended)" 
                secondary="Select the best data source based on available data"
              />
            </ListItem>
            
            <ListItem button 
              selected={activeDataSource === 'fitbit'} 
              onClick={() => { handleDataSourceChange('fitbit'); onClose(); }}
              disabled={!dataSourcesAvailable.fitbit}
            >
              <ListItemIcon>
                <DevicesIcon color={activeDataSource === 'fitbit' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Fitbit" 
                secondary={dataSourcesAvailable.fitbit ? "Connected" : "Not connected"}
              />
            </ListItem>
            
            <ListItem button 
              selected={activeDataSource === 'googleFit'} 
              onClick={() => { handleDataSourceChange('googleFit'); onClose(); }}
              disabled={!dataSourcesAvailable.googleFit}
            >
              <ListItemIcon>
                <DevicesIcon color={activeDataSource === 'googleFit' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Google Fit" 
                secondary={dataSourcesAvailable.googleFit ? "Connected" : "Not connected"}
              />
            </ListItem>
            
            <ListItem button 
              selected={activeDataSource === 'appleHealth'} 
              onClick={() => { handleDataSourceChange('appleHealth'); onClose(); }}
              disabled={!dataSourcesAvailable.appleHealth}
            >
              <ListItemIcon>
                <DevicesIcon color={activeDataSource === 'appleHealth' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Apple Health" 
                secondary={dataSourcesAvailable.appleHealth ? "Connected" : "Not connected"}
              />
            </ListItem>
            
            <ListItem button 
              selected={activeDataSource === 'combined'} 
              onClick={() => { handleDataSourceChange('combined'); onClose(); }}
              disabled={(!dataSourcesAvailable.fitbit && !dataSourcesAvailable.googleFit && !dataSourcesAvailable.appleHealth) || 
                        (dataSourcesAvailable.fitbit && !dataSourcesAvailable.googleFit && !dataSourcesAvailable.appleHealth) ||
                        (!dataSourcesAvailable.fitbit && dataSourcesAvailable.googleFit && !dataSourcesAvailable.appleHealth) ||
                        (!dataSourcesAvailable.fitbit && !dataSourcesAvailable.googleFit && dataSourcesAvailable.appleHealth)}
            >
              <ListItemIcon>
                <DevicesIcon color={activeDataSource === 'combined' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText 
                primary="Combined Sources" 
                secondary="Merge data from all connected services"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Date Picker Dialog */}
      <Dialog
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              value={date}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} />}
              maxDate={new Date()}
            />
          </LocalizationProvider>
        </DialogContent>
      </Dialog>
      
      {/* Data Source Dialog */}
      <DataSourceDialog
        open={showDataSourceDialog}
        onClose={() => setShowDataSourceDialog(false)}
      />
      
      {/* Main content */}
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header section with title and controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard sx={{ 
            mb: 3,
            overflow: 'visible'
          }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #673ab7, #9c27b0, #e91e63)', 
              py: { xs: 2, md: 2.5 }, 
              px: { xs: 2, md: 3 },
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <Box sx={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                top: '-150px',
                right: '-100px',
                zIndex: 0
              }} />
              
              <Box sx={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
                bottom: '-100px',
                left: '10%',
                zIndex: 0
              }} />
            
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, position: 'relative', zIndex: 1 }}>
                    <Avatar
                      sx={{
                        width: { xs: 48, md: 56 },
                        height: { xs: 48, md: 56 },
                        background: 'linear-gradient(135deg, #4A148C, #7B1FA2)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                      }}
                    >
                      <BedtimeIcon fontSize="large" />
                    </Avatar>
                    
                    <Box>
                      <Typography 
                        variant={isSmallScreen ? "h5" : "h4"} 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'white'
                        }}
                      >
                        Sleep Analytics
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="subtitle1" color="white" fontWeight="medium">
                          {dateLabel}
                        </Typography>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => setShowDatePicker(prev => !prev)}
                          sx={{ color: 'white', opacity: 0.8, ml: 0.5 }}
                        >
                          <CalendarTodayIcon fontSize="small" />
                        </IconButton>
                        
                        <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuickDateChange('prev')}
                            sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
                          >
                            <TrendingDownIcon fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuickDateChange('next')}
                            sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
                            disabled={isAfter(date, new Date())}
                          >
                            <TrendingUpIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
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
                            {TIME_INTERVALS.map(interval => (
                              <MenuItem key={interval.value} value={interval.value} sx={{ display: 'flex', gap: 1 }}>
                                {interval.icon} {interval.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    {/* Data source button */}
                    <Button
                      variant="contained"
                      startIcon={<DevicesIcon />}
                      onClick={() => setShowDataSourceDialog(true)}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                      }}
                    >
                      {activeDataSource === 'auto' && 'Auto'}
                      {activeDataSource === 'fitbit' && 'Fitbit'}
                      {activeDataSource === 'googleFit' && 'Google Fit'}
                      {activeDataSource === 'appleHealth' && 'Apple Health'}
                      {activeDataSource === 'combined' && 'All Sources'}
                    </Button>
                    
                    {/* Refresh button */}
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
                    
                    {/* Diagnostic button */}
                    <Tooltip title="Debug Information">
                      <IconButton
                        onClick={handleOpenDiagnosticsPanel}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </GlassCard>
        </motion.div>
        
        {/* Main content card */}
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 8, flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="body2" color="text.secondary">
                  Loading sleep data...
                </Typography>
              </Box>
            ) : error || !sleepData || sleepData.length === 0 ? (
              <Box>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color={error ? "error" : "text.secondary"} variant="h6" gutterBottom>
                    {error || "No sleep data available for the selected period."}
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
                      Has 'sleep' scope: {tokenScopes.includes('sleep') ? 'Yes' : 'No - this is required for sleep data'}
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
              </Box>
            ) : (
              <Box>
                <Box sx={{ px: 3, py: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Sleep Duration" 
                        value={formatDuration(avgDuration)} 
                        color="#673ab7"
                        icon={<HotelIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Deep Sleep" 
                        value={formatDuration(avgDeepSleep)} 
                        color="#3f51b5"
                        icon={<NightsStayIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Sleep Efficiency" 
                        value={avgEfficiency} 
                        unit="%"
                        color="#2196f3"
                        icon={<TimerIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard 
                        title="Sleep Score" 
                        value={avgScore || 'N/A'} 
                        color={qualityLevel?.color || '#9c27b0'}
                        icon={<BedtimeIcon />}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <SleepChart 
                    data={sleepData} 
                    period={period} 
                    dataSource={activeDataSource} 
                    fitbitData={fitbitData}
                    googleFitData={googleFitData}
                    appleHealthData={appleHealthData}
                    tokenScopes={tokenScopes}
                    isAuthenticated={isAuthenticated}
                    date={date}
                    availableSources={dataSourcesAvailable}
                    onDataSourceChange={handleDataSourceChange}
                  />
                  {isMockData && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 8, 
                        right: 8, 
                        fontSize: '10px',
                        fontStyle: 'italic',
                        opacity: 0.3,
                        color: theme.palette.primary.main,
                        fontWeight: 'bold'
                      }}
                    >
                      Demo Data
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ px: 3, pb: 3, mt: 3 }}>
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
                              <NightsStayIcon color="primary" />
                              Sleep Stages
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            
                            {sleepData && sleepData.length > 0 && period === 'day' ? (
                              <Stack spacing={2}>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3f51b5' }} />
                                      <Typography variant="body2">
                                        Deep Sleep ({formatDuration(sleepData[0].deepSleepMinutes)})
                                      </Typography>
                                    </Box>
                                    <Chip 
                                      size="small" 
                                      label={`${sleepData[0].deepSleepPercentage}%`} 
                                      sx={{ bgcolor: '#3f51b5', color: 'white', fontWeight: 'medium' }}
                                    />
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={sleepData[0].deepSleepPercentage} 
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: alpha('#3f51b5', 0.2),
                                      '& .MuiLinearProgress-bar': { bgcolor: '#3f51b5' }
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Restorative sleep that helps memory consolidation and physical recovery
                                  </Typography>
                                </Box>
                                
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196f3' }} />
                                      <Typography variant="body2">
                                        REM Sleep ({formatDuration(sleepData[0].remSleepMinutes)})
                                      </Typography>
                                    </Box>
                                    <Chip 
                                      size="small" 
                                      label={`${sleepData[0].remSleepPercentage}%`} 
                                      sx={{ bgcolor: '#2196f3', color: 'white', fontWeight: 'medium' }}
                                    />
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={sleepData[0].remSleepPercentage} 
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: alpha('#2196f3', 0.2),
                                      '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Associated with dreaming, creativity, and emotional processing
                                  </Typography>
                                </Box>
                                
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#9c27b0' }} />
                                      <Typography variant="body2">
                                        Light Sleep ({formatDuration(sleepData[0].lightSleepMinutes)})
                                      </Typography>
                                    </Box>
                                    <Chip 
                                      size="small" 
                                      label={`${sleepData[0].lightSleepPercentage}%`} 
                                      sx={{ bgcolor: '#9c27b0', color: 'white', fontWeight: 'medium' }}
                                    />
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={sleepData[0].lightSleepPercentage} 
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: alpha('#9c27b0', 0.2),
                                      '& .MuiLinearProgress-bar': { bgcolor: '#9c27b0' }
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Lighter sleep where you're more easily awakened
                                  </Typography>
                                </Box>
                                
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                      <Typography variant="body2">
                                        Awake ({formatDuration(sleepData[0].awakeDuringNight)})
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(sleepData[0].awakeDuringNight / sleepData[0].durationMinutes) * 100} 
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: alpha('#ff9800', 0.2),
                                      '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' }
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Brief awakenings during the night
                                  </Typography>
                                </Box>
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Select a single day to view detailed sleep stages.
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
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'success.dark' }}>
                              Sleep Insights
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            
                            {sleepData && sleepData.length > 0 ? (
                              <Box>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  borderRadius: 2, 
                                  bgcolor: 'rgba(255,255,255,0.5)', 
                                  p: 2,
                                  mb: 2
                                }}>
                                  <Typography variant="body1" color="text.primary">
                                    {period === 'day' ? (
                                      <>You slept for <b>{formatDuration(sleepData[0].durationMinutes)}</b> with a sleep efficiency of <b>{sleepData[0].efficiency}%</b>.</>
                                    ) : (
                                      <>Your average sleep duration is <b>{formatDuration(avgDuration)}</b> over the selected period.</>
                                    )}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between',
                                  borderRadius: 2, 
                                  bgcolor: 'rgba(255,255,255,0.5)', 
                                  p: 2
                                }}>
                                  <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Sleep Quality
                                    </Typography>
                                    <Typography variant="h4" color="primary.dark">
                                      {avgScore} <Typography component="span" variant="body2">/ 100</Typography>
                                    </Typography>
                                  </Box>
                                  
                                  <Chip 
                                    label={qualityLevel?.name || 'N/A'} 
                                    color={
                                      avgScore >= 90 ? "success" : 
                                      avgScore >= 80 ? "primary" : 
                                      avgScore >= 70 ? "info" : 
                                      avgScore >= 50 ? "warning" : "error"
                                    }
                                  />
                                </Box>
                                
                                <LinearProgress 
                                  variant="determinate" 
                                  value={avgScore} 
                                  sx={{ 
                                    mt: 1,
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: 'rgba(0,0,0,0.1)'
                                  }}
                                />
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                  {avgScore >= 90 
                                    ? "Excellent sleep quality! You're getting optimal rest for your health and wellbeing."
                                    : avgScore >= 80 
                                      ? "Good sleep quality. Your sleep is supporting your health and recovery well."
                                      : avgScore >= 70
                                        ? "Fair sleep quality. Consider small improvements to your sleep routine."
                                        : avgScore >= 50
                                          ? "Your sleep quality needs attention. Try adjusting your bedtime routine."
                                          : "Poor sleep quality. Consider consulting a healthcare provider about your sleep patterns."}
                                </Typography>
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
      </Box>
      
      {/* DiagnosticsPanel component */}
      <DiagnosticsPanel
        isOpen={showDiagnosticsPanel}
        onClose={handleCloseDiagnosticsPanel}
        tokenScopes={tokenScopes}
        isAuthenticated={isAuthenticated}
        currentTab="sleep"
        period={period}
        date={date}
        useMockData={isMockData}
        dataSource={activeDataSource}
        connectedServices={dataSourcesAvailable}
        onRefresh={handleRefresh}
      />
      
      {/* Snackbar for alerts */}
      <Snackbar
        open={alertMessage !== null}
        autoHideDuration={6000}
        onClose={() => setAlertMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertMessage(null)} 
          severity={alertMessage?.type || 'info'} 
          sx={{ width: '100%' }}
        >
          {alertMessage?.text}
        </Alert>
      </Snackbar>
  
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

export default SleepTab;