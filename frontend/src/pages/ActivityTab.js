import React, { useState, useEffect, useMemo } from 'react';
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
  Stack,
  useMediaQuery,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isValid, subDays, addDays, subWeeks, addWeeks, subMonths, addMonths, startOfWeek, endOfWeek, isAfter } from 'date-fns';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
import DevicesIcon from '@mui/icons-material/Devices';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TerrainIcon from '@mui/icons-material/Terrain';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import TimelineIcon from '@mui/icons-material/Timeline';
import WavesIcon from '@mui/icons-material/Waves';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { activityService, fitbitService, googleFitService, appleFitnessService, authService } from '../services/api';
import ActivityChart from '../components/charts/ActivityChart';
import DiagnosticsPanel from '../components/DiagnosticsPanel';
import { GlassCard, AnimatedGradientText } from '../components/styled/CardComponents';
import { useAuth } from '../context/AuthContext';

// Enhanced Visualization Components
import RadialProgressChart from '../components/common/charts/RadialProgressChart';
import ActivityHeatmapCalendar from '../components/common/charts/ActivityHeatmapCalendar';
import StepMountainVisualization from '../components/common/charts/StepMountainVisualization';
import ActivityPulseWave from '../components/common/charts/ActivityPulseWave';
import ActivityInsights from '../components/activity/ActivityInsights';

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

// Time interval options
const TIME_INTERVALS = [
  { value: 'day', label: 'Day', icon: <CalendarTodayIcon fontSize="small" /> },
  { value: 'week', label: 'Week', icon: <TimelineIcon fontSize="small" /> },
  { value: 'month', label: 'Month', icon: <AssessmentIcon fontSize="small" /> },
  { value: '3month', label: '3 Months', icon: <HistoryIcon fontSize="small" /> }
];

// Date Navigator component for handling date navigation
const DateNavigator = ({ 
  date, 
  onDateChange, 
  period, 
  onPeriodChange, 
  showDatePicker,
  setShowDatePicker 
}) => {
  // Render date label based on period
  const renderDateLabel = () => {
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
      case '3month':
        const monthStart = date;
        const monthEnd = addMonths(date, 2);
        return `${format(monthStart, 'MMM')} - ${format(monthEnd, 'MMM yyyy')}`;
      default:
        return format(date, 'MMMM d, yyyy');
    }
  };

  // Handle date change with proper formatting
  const handleDateChange = (newDate) => {
    if (newDate && isValid(newDate)) {
      onDateChange(newDate);
      setShowDatePicker(false);
    }
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
      case '3month':
        newDate = direction === 'next' ? addMonths(date, 3) : subMonths(date, 3);
        break;
      default:
        newDate = direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    }
    onDateChange(newDate);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography variant="subtitle1" color="white" fontWeight="medium">
          {renderDateLabel()}
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
            onChange={onPeriodChange}
          >
            {TIME_INTERVALS.map(interval => (
              <MenuItem key={interval.value} value={interval.value} sx={{ display: 'flex', gap: 1 }}>
                {interval.icon} {interval.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Date Picker Popover */}
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
    </>
  );
};

// Data Source Dialog component
const DataSourceDialog = ({ 
  open, 
  onClose, 
  dataSourcesAvailable, 
  activeDataSource, 
  onDataSourceChange 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>Select Data Source</DialogTitle>
      <DialogContent>
        <List>
          <ListItem 
            button 
            selected={activeDataSource === 'auto'}
            onClick={() => {
              onDataSourceChange('auto');
              onClose();
            }}
          >
            <ListItemIcon>
              <AutoAwesomeIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Auto (Recommended)" 
              secondary="Automatically selects the best available data source"
            />
          </ListItem>
          
          <ListItem 
            button 
            selected={activeDataSource === 'fitbit'}
            disabled={!dataSourcesAvailable.fitbit}
            onClick={() => {
              if (dataSourcesAvailable.fitbit) {
                onDataSourceChange('fitbit');
                onClose();
              }
            }}
          >
            <ListItemIcon>
              <DevicesIcon color={dataSourcesAvailable.fitbit ? "info" : "disabled"} />
            </ListItemIcon>
            <ListItemText 
              primary="Fitbit" 
              secondary={dataSourcesAvailable.fitbit ? "Use Fitbit data" : "Not connected"}
            />
          </ListItem>
          
          <ListItem 
            button 
            selected={activeDataSource === 'googleFit'}
            disabled={!dataSourcesAvailable.googleFit}
            onClick={() => {
              if (dataSourcesAvailable.googleFit) {
                onDataSourceChange('googleFit');
                onClose();
              }
            }}
          >
            <ListItemIcon>
              <DevicesIcon color={dataSourcesAvailable.googleFit ? "success" : "disabled"} />
            </ListItemIcon>
            <ListItemText 
              primary="Google Fit" 
              secondary={dataSourcesAvailable.googleFit ? "Use Google Fit data" : "Not connected"}
            />
          </ListItem>
          
          <ListItem 
            button 
            selected={activeDataSource === 'appleHealth'}
            disabled={!dataSourcesAvailable.appleHealth}
            onClick={() => {
              if (dataSourcesAvailable.appleHealth) {
                onDataSourceChange('appleHealth');
                onClose();
              }
            }}
          >
            <ListItemIcon>
              <HealthAndSafetyIcon color={dataSourcesAvailable.appleHealth ? "error" : "disabled"} />
            </ListItemIcon>
            <ListItemText 
              primary="Apple Health" 
              secondary={dataSourcesAvailable.appleHealth ? "Use Apple Health data" : "Not connected"}
            />
          </ListItem>
          
          <ListItem 
            button 
            selected={activeDataSource === 'combined'}
            onClick={() => {
              onDataSourceChange('combined');
              onClose();
            }}
          >
            <ListItemIcon>
              <WavesIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Combined View" 
              secondary="Display data from all available sources"
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Core state
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  const [activeDataSource, setActiveDataSource] = useState('auto');
  const [dataSourcesAvailable, setDataSourcesAvailable] = useState({
    fitbit: false,
    googleFit: false,
    appleHealth: false
  });
  const [activityData, setActivityData] = useState(null);
  const [fitbitData, setFitbitData] = useState(null);
  const [googleFitData, setGoogleFitData] = useState(null);
  const [appleHealthData, setAppleHealthData] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDiagnosticsPanel, setShowDiagnosticsPanel] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  
  // Enhanced visualizations state
  const [activeView, setActiveView] = useState('standard');
  const [previousPeriodData, setPreviousPeriodData] = useState([]);
  
  // Debug mode for loading issues
  const [debugMode, setDebugMode] = useState(true);

  // Effect to fetch data when parameters change
  useEffect(() => {
    if (isAuthenticated) {
      if (debugMode) console.log('🔍 DEBUG: Starting activity data fetch with params:', { period, formattedDate, activeDataSource });
      fetchAllActivityData();
      
      // Also fetch previous period data for comparison
      fetchPreviousPeriodData();
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
    }
  };

  // Handle period change
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };
  
  // This function is already defined at line 497, so removing this duplicate declaration
  
  // Handle data source change
  const handleDataSourceChange = (source) => {
    setActiveDataSource(source);
    
    // Set appropriate data based on source selection
    switch (source) {
      case 'fitbit':
        if (fitbitData && fitbitData.length > 0) {
          setActivityData([...fitbitData]);
          setError('');
        } else {
          setError('Fitbit data is not available. Please select another data source.');
          setActivityData([]);
        }
        break;
        
      case 'googleFit':
        if (googleFitData && googleFitData.length > 0) {
          setActivityData([...googleFitData]);
          setError('');
        } else {
          setError('Google Fit data is not available. Please select another data source.');
          setActivityData([]);
        }
        break;
        
      case 'appleHealth':
        if (appleHealthData && appleHealthData.length > 0) {
          setActivityData([...appleHealthData]);
          setError('');
        } else {
          setError('Apple Health data is not available. Please select another data source.');
          setActivityData([]);
        }
        break;
        
      case 'combined':
        // Combine all available data
        const combinedData = [
          ...(fitbitData || []),
          ...(googleFitData || []),
          ...(appleHealthData || [])
        ];
        
        if (combinedData.length > 0) {
          setActivityData(combinedData);
          setError('');
        } else {
          setError('No activity data available from any source.');
          setActivityData([]);
        }
        break;
        
      case 'auto':
      default:
        // Auto-select data source based on availability
        if (googleFitData && googleFitData.length > 0) {
          setActivityData([...googleFitData]);
          setError('');
        } else if (fitbitData && fitbitData.length > 0) {
          setActivityData([...fitbitData]);
          setError('');
        } else if (appleHealthData && appleHealthData.length > 0) {
          setActivityData([...appleHealthData]);
          setError('');
        } else {
          setError('No activity data available from any source.');
          setActivityData([]);
        }
        break;
    }
  };
  
  // Handle data source dialog
  const handleOpenDataSourceDialog = () => {
    setShowDataSourceDialog(true);
  };
  
  const handleCloseDataSourceDialog = () => {
    setShowDataSourceDialog(false);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllActivityData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
    fetchPreviousPeriodData();
  };
  
  // Fetch data from previous period for comparison
  const fetchPreviousPeriodData = async () => {
    if (!isAuthenticated) return;
    
    try {
      // Calculate previous period date based on current period
      let previousDate = new Date(date);
      
      if (period === 'day') {
        previousDate = subDays(previousDate, 1);
      } else if (period === 'week') {
        previousDate = subWeeks(previousDate, 1);
      } else if (period === 'month') {
        previousDate = subMonths(previousDate, 1);
      }
      
      const formattedPrevDate = format(previousDate, 'yyyy-MM-dd');
      
      // Fetch data from the previous period using the same source as current
      let response;
      
      if (activeDataSource === 'fitbit' || activeDataSource === 'auto') {
        response = await activityService.getActivityData(period, formattedPrevDate);
      } else if (activeDataSource === 'googleFit') {
        response = await googleFitService.getActivityData(period, formattedPrevDate);
      } else if (activeDataSource === 'appleHealth') {
        response = await appleFitnessService.getActivityData(period, formattedPrevDate);
      }
      
      // Process response
      if (response && response.data) {
        setPreviousPeriodData(response.data);
      } else if (Array.isArray(response)) {
        setPreviousPeriodData(response);
      } else {
        // If no data available, generate mock data for comparison
        const mockPrevData = generateMockActivityData(period, previousDate).data;
        setPreviousPeriodData(mockPrevData);
      }
    } catch (error) {
      console.log('Error fetching previous period data:', error);
      // Generate mock data as fallback
      const mockPrevData = generateMockActivityData(period, new Date(date.getTime() - 86400000)).data;
      setPreviousPeriodData(mockPrevData);
    }
  };

  // We already have handleDataSourceChange at line 519, so removing this duplicate declaration

  // Handle diagnostics panel
  const handleOpenDiagnosticsPanel = () => {
    setShowDiagnosticsPanel(true);
  };
  
  const handleCloseDiagnosticsPanel = () => {
    setShowDiagnosticsPanel(false);
  };

  // Fetch data from all available sources
  const fetchAllActivityData = async () => {
    if (debugMode) console.log('🔍 DEBUG: fetchAllActivityData started');
    
    if (!isValid(date)) {
      if (debugMode) console.log('🔍 DEBUG: Invalid date, setting loading false');
      setLoading(false);
      setError("Invalid date selected.");
      return;
    }
    
    if (!isAuthenticated) {
      if (debugMode) console.log('🔍 DEBUG: Not authenticated, setting loading false');
      setLoading(false);
      setError("Authentication required to view activity data.");
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
      
      console.log('Available activity data sources:', availableSources);
      setDataSourcesAvailable(availableSources);
      
      // Helper function to fetch activity data from a specific source
      const fetchActivityData = async (source) => {
        try {
          if (debugMode) console.log(`🔍 DEBUG: fetchActivityData for source: ${source}`);
          console.log(`Fetching activity data from ${source} for ${period} on ${formattedDate}`);
          let response;
          
          switch (source) {
            case 'fitbit':
              response = await activityService.getActivityData(period, formattedDate);
              break;
            case 'googleFit':
              if (debugMode) console.log(`🔍 DEBUG: Calling googleFitService.getActivityData`);
              try {
                response = await googleFitService.getActivityData(period, formattedDate);
                if (debugMode) console.log(`🔍 DEBUG: Google Fit response:`, response);
              } catch (gfError) {
                if (debugMode) console.log(`🔍 DEBUG: Google Fit error:`, gfError);
                // If Google Fit API fails, return empty array instead of null
                return [];
              }
              break;
            case 'appleHealth':
              response = await appleFitnessService.getActivityData(period, formattedDate);
              break;
            default:
              throw new Error(`Unknown data source: ${source}`);
          }
          
          if (debugMode) console.log(`🔍 DEBUG: ${source} data fetch successful`);
          console.log(`Successfully fetched ${source} activity data:`, response);
          
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
              return response.map(item => ({
                ...item,
                dateTime: item.dateTime || format(new Date((item.timestamp || 0) * 1000), 'yyyy-MM-dd'),
                activityLevel: item.activityLevel || calculateActivityLevel(item.activeMinutes || 0, item.steps || 0)
              }));
            } else if (response.data && Array.isArray(response.data)) {
              if (debugMode) console.log(`🔍 DEBUG: Formatting Google Fit nested array of length ${response.data.length}`);
              return response.data.map(item => ({
                ...item,
                dateTime: item.dateTime || format(new Date((item.timestamp || 0) * 1000), 'yyyy-MM-dd'),
                activityLevel: item.activityLevel || calculateActivityLevel(item.activeMinutes || 0, item.steps || 0)
              }));
            } else {
              if (debugMode) console.log(`🔍 DEBUG: Google Fit returned unexpected format, returning empty array`);
              return [];
            }
          } else if (source === 'appleHealth') {
            // Apple Health handling
            if (Array.isArray(response)) {
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              return response.data;
            } else {
              return [];
            }
          }
          
          // For Fitbit, we expect a standard format with data property
          return response.data || [];
        } catch (error) {
          if (debugMode) console.log(`🔍 DEBUG: Error in fetchActivityData for ${source}:`, error);
          console.error(`Error fetching ${source} activity data:`, error);
          // Return empty array instead of null
          return [];
        }
      };
      
      // Fetch data from all connected sources in parallel
      let promises = [];
      let promiseLabels = [];
      
      if (availableSources.fitbit) {
        promises.push(fetchActivityData('fitbit'));
        promiseLabels.push('fitbit');
      }
      
      if (availableSources.googleFit) {
        promises.push(fetchActivityData('googleFit'));
        promiseLabels.push('googleFit');
      }
      
      if (availableSources.appleHealth) {
        promises.push(fetchActivityData('appleHealth'));
        promiseLabels.push('appleHealth');
      }
      
      // If no service is connected, use mock data
      if (promises.length === 0) {
        if (debugMode) console.log('🔍 DEBUG: No fitness services connected. Using mock data.');
        console.log('No fitness services connected. Using mock data.');
        const mockData = generateMockActivityData(period);
        setActivityData(mockData.data);
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
            hasData: result.value?.length > 0 ? "Yes" : "No",
            dataLength: result.value?.length || 0
          });
          
          // Store data based on source
          if (source === 'fitbit' && Array.isArray(result.value) && result.value.length > 0) {
            console.log(`Setting Fitbit activity data of length ${result.value.length}`);
            processedData.fitbit = result.value;
          } else if (source === 'googleFit' && Array.isArray(result.value) && result.value.length > 0) {
            console.log(`Setting Google Fit activity data of length ${result.value.length}`);
            processedData.googleFit = result.value;
          } else if (source === 'appleHealth' && Array.isArray(result.value) && result.value.length > 0) {
            console.log(`Setting Apple Health activity data of length ${result.value.length}`);
            processedData.appleHealth = result.value;
          } else {
            console.warn(`No data received from ${source}`);
          }
        } else {
          console.error(`Failed to fetch data from ${source}:`, result.reason || 'Unknown error');
        }
      });
      
      // Now update state with the processed data
      if (debugMode) console.log('🔍 DEBUG: Updating state with processed data');
      
      if (processedData.fitbit) {
        console.log("Setting Fitbit activity data state:", processedData.fitbit.length);
        setFitbitData(processedData.fitbit);
      }
      
      if (processedData.googleFit) {
        console.log("Setting Google Fit activity data state:", processedData.googleFit.length);
        setGoogleFitData(processedData.googleFit);
        
        // If we have Google Fit data, immediately use it (especially for debugging)
        if (activeDataSource === 'auto' || activeDataSource === 'googleFit') {
          console.log("Immediately using Google Fit activity data:", processedData.googleFit.length);
          setActivityData(processedData.googleFit);
        }
      }
      
      if (processedData.appleHealth) {
        console.log("Setting Apple Health activity data state:", processedData.appleHealth.length);
        setAppleHealthData(processedData.appleHealth);
      }
      
      // Important: Call determineActivityDataToUse directly here first as a safeguard
      if (debugMode) console.log('🔍 DEBUG: First determineActivityDataToUse call (immediately)');
      determineActivityDataToUse();
      
      // Wait for state to update with enough time
      setTimeout(() => {
        // Now determine which data to use based on activeDataSource setting (second call)
        if (debugMode) console.log('🔍 DEBUG: Second determineActivityDataToUse call (after delay)');
        determineActivityDataToUse();
        
        // Ensure loading is set to false here as well (safety)
        if (debugMode) console.log('🔍 DEBUG: Setting loading to false in setTimeout');
        setLoading(false);
      }, 500);
      
    } catch (error) {
      if (debugMode) console.log('🔍 DEBUG: Error in fetchAllActivityData catch block', error);
      console.error('Error fetching activity data:', error);
      setError('Failed to fetch activity data. Please try again.');
      
      // Use mock data as fallback
      if (debugMode) console.log('🔍 DEBUG: Generating mock data as fallback');
      const mockData = generateMockActivityData(period);
      setActivityData(mockData.data);
      setFitbitData(mockData.data);
    } finally {
      if (debugMode) console.log('🔍 DEBUG: In finally block, setting loading false');
      setLoading(false);
    }
  };
  
  // Generate mock activity data for demonstration
  const generateMockActivityData = (dataPeriod, mockDate = null) => {
    console.log(`🔄 Generating mock activity data for period: ${dataPeriod}`);
    const mockData = [];
    const targetDate = mockDate || date;
    
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
          dateTime: format(targetDate, 'yyyy-MM-dd'),
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
        const day = new Date(targetDate);
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
      start_date: format(targetDate, 'yyyy-MM-dd'),
      end_date: format(targetDate, 'yyyy-MM-dd')
    };
  };
  
  // Calculate activity level based on active minutes and steps
  const calculateActivityLevel = (activeMinutes, steps) => {
    if (activeMinutes >= 60 && steps >= 10000) return 'Very Active';
    if (activeMinutes >= 30 && steps >= 7500) return 'Active';
    if (activeMinutes >= 20 && steps >= 5000) return 'Lightly Active';
    return 'Sedentary';
  };
  
  // Determine which activity data to use based on settings and availability
  const determineActivityDataToUse = () => {
    if (debugMode) console.log('🔍 DEBUG: determineActivityDataToUse called');
    console.log("Determining activity data source:", {
      activeDataSource,
      googleFitDataLength: googleFitData ? googleFitData.length : 0,
      fitbitDataLength: fitbitData ? fitbitData.length : 0,
      appleHealthLength: appleHealthData ? appleHealthData.length : 0
    });
    
    switch (activeDataSource) {
      case 'fitbit':
        if (fitbitData && fitbitData.length > 0) {
          setActivityData(fitbitData);
          console.log('Using Fitbit activity data');
        } else {
          setError('Fitbit activity data is not available. Please select another data source.');
          setActivityData([]);
        }
        break;
        
      case 'googleFit':
        if (googleFitData && googleFitData.length > 0) {
          console.log('Setting activity data to Google Fit data');
          setActivityData([...googleFitData]);  // Create a new array copy to ensure state update
        } else {
          setError('Google Fit activity data is not available. Please select another data source.');
          setActivityData([]);
        }
        break;
        
      case 'appleHealth':
        if (appleHealthData && appleHealthData.length > 0) {
          setActivityData(appleHealthData);
          console.log('Using Apple Health activity data');
        } else {
          setError('Apple Health activity data is not available. Please select another data source.');
          setActivityData([]);
        }
        break;
        
      case 'combined':
        // Combine all available data and sort by timestamp
        const combinedData = [
          ...(fitbitData || []),
          ...(googleFitData || []),
          ...(appleHealthData || [])
        ].sort((a, b) => {
          const aTime = a.timestamp || new Date(a.dateTime).getTime();
          const bTime = b.timestamp || new Date(b.dateTime).getTime();
          return aTime - bTime;
        });
        
        if (combinedData.length > 0) {
          setActivityData(combinedData);
          console.log('Using combined activity data:', combinedData.length);
        } else {
          setError('No activity data available from any source.');
          setActivityData([]);
        }
        break;
        
      case 'auto':
      default:
        if (debugMode) console.log('🔍 DEBUG: Using auto data source selection logic');
        // Auto-select the best dataset based on data quality and completeness
        if (googleFitData && Array.isArray(googleFitData) && googleFitData.length > 0) {
          if (debugMode) console.log('🔍 DEBUG: Using Google Fit data (auto)');
          console.log('Auto-selected Google Fit activity data with length:', googleFitData.length);
          setActivityData([...googleFitData]); // Create a new array copy to ensure state update
        } else if (fitbitData && Array.isArray(fitbitData) && fitbitData.length > 0) {
          if (debugMode) console.log('🔍 DEBUG: Using Fitbit data (auto)');
          setActivityData([...fitbitData]);
          console.log('Auto-selected Fitbit activity data');
        } else if (appleHealthData && Array.isArray(appleHealthData) && appleHealthData.length > 0) {
          if (debugMode) console.log('🔍 DEBUG: Using Apple Health data (auto)');
          setActivityData([...appleHealthData]);
          console.log('Auto-selected Apple Health activity data');
        } else {
          // No data available from any source, use mock data
          if (debugMode) console.log('🔍 DEBUG: No data available, using mock data');
          console.log('No activity data available from any source, using mock data.');
          const mockData = generateMockActivityData(period);
          setActivityData(mockData.data);
        }
        
        // Safety check - make sure loading is set to false here
        if (debugMode) console.log('🔍 DEBUG: Setting loading to false (after auto source selection)');
        setLoading(false);
        break;
    }
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

  // Check if we're using mock data
  const isMockData = useMemo(() => {
    return activityData && activityData.length > 0 && (
      !fitbitData && !googleFitData && !appleHealthData ||
      activityData[0].time?.includes('AM') || 
      activityData[0].time?.includes('PM') ||
      activityData.some(item => item.activityLevel === 'Very Active' || item.activityLevel === 'Active')
    );
  }, [activityData, fitbitData, googleFitData, appleHealthData]);

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

  // Simple data source dialog component
  const DataSourceDialog = ({ open, onClose }) => {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Select Activity Data Source
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose which connected service to use for activity data. Available sources are detected automatically.
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

  const { totalSteps, totalCalories, totalActiveMinutes, totalDistance } = getStats();

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
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
              background: 'linear-gradient(135deg, #009688, #4caf50, #8bc34a)', 
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
                        background: 'linear-gradient(135deg, #00695c, #4caf50)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                      }}
                    >
                      <DirectionsRunIcon fontSize="large" />
                    </Avatar>
                    
                    <Box>
                      <Typography 
                        variant={isSmallScreen ? "h5" : "h4"} 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'white'
                        }}
                      >
                        Activity Analytics
                      </Typography>
                      
                      <DateNavigator
                        date={date}
                        onDateChange={handleDateChange}
                        period={period}
                        onPeriodChange={handlePeriodChange}
                        TIME_INTERVALS={TIME_INTERVALS}
                        showDatePicker={showDatePicker}
                        setShowDatePicker={setShowDatePicker}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    {/* Data source button */}
                    <Button
                      variant="contained"
                      startIcon={<DevicesIcon />}
                      onClick={handleOpenDataSourceDialog}
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
          
          {/* Data Source Dialog */}
          <DataSourceDialog
            open={showDataSourceDialog}
            onClose={handleCloseDataSourceDialog}
            dataSourcesAvailable={dataSourcesAvailable}
            activeDataSource={activeDataSource}
            onDataSourceChange={handleDataSourceChange}
          />
        </motion.div>
        
        {/* Main content card */}
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 8, flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="body2" color="text.secondary">
                  Loading activity data...
                </Typography>
              </Box>
            ) : error || !activityData || activityData.length === 0 ? (
              <Box>
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color={error ? "error" : "text.secondary"} variant="h6" gutterBottom>
                    {error || "No activity data available for the selected period."}
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
              </Box>
            ) : (
              <Box>
                {/* View mode selection tabs */}
                <Paper 
                  elevation={2} 
                  sx={{ 
                    mx: 3, 
                    mb: 2, 
                    borderRadius: 2, 
                    background: 'linear-gradient(145deg, #ffffff, #f9f9f9)' 
                  }}
                >
                  <Tabs
                    value={activeView}
                    onChange={(e, newValue) => setActiveView(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                  >
                    <Tab 
                      value="standard" 
                      label="Standard" 
                      icon={<AssessmentIcon />} 
                      iconPosition="start"
                    />
                    <Tab 
                      value="enhanced" 
                      label="Enhanced" 
                      icon={<AutoAwesomeIcon />} 
                      iconPosition="start"
                    />
                    <Tab 
                      value="insights" 
                      label="Insights" 
                      icon={<TimelineIcon />} 
                      iconPosition="start"
                    />
                  </Tabs>
                </Paper>
                
                {/* Stats display */}
                <Box sx={{ px: 3, py: 2 }}>
                  <Grid container spacing={3}>
                    {activeView === 'standard' ? (
                      // Standard view stat cards
                      <>
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
                      </>
                    ) : activeView === 'enhanced' ? (
                      // Enhanced view with radial progress and heatmap
                      <>
                        <Grid item xs={12} md={6}>
                          <Card elevation={3} sx={{ borderRadius: 3, p: 2, height: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                              Daily Steps Goal
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                              <RadialProgressChart 
                                value={totalSteps} 
                                maxValue={10000}
                                title="Daily Steps"
                                icon={<DirectionsRunIcon fontSize="large" />}
                                milestones={[
                                  { value: 5000, label: "5K" },
                                  { value: 7500, label: "7.5K" },
                                  { value: 10000, label: "Goal" }
                                ]}
                                colors={{ 
                                  start: theme.palette.success.light, 
                                  end: theme.palette.success.dark 
                                }}
                              />
                            </Box>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card elevation={3} sx={{ borderRadius: 3, p: 2, height: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                              Monthly Activity Heatmap
                            </Typography>
                            <ActivityHeatmapCalendar 
                              data={period === 'month' ? activityData : []} 
                              currentDate={date}
                              onDateClick={(date) => handleDateChange(date)}
                              valueKey="steps"
                              colorScale={{
                                0: alpha(theme.palette.grey[200], 0.5),
                                1: alpha(theme.palette.primary.light, 0.3),
                                2500: alpha(theme.palette.primary.light, 0.5),
                                5000: alpha(theme.palette.primary.main, 0.6),
                                7500: alpha(theme.palette.primary.main, 0.8),
                                10000: theme.palette.primary.dark
                              }}
                            />
                          </Card>
                        </Grid>
                      </>
                    ) : (
                      // Insights view with detailed analysis
                      <Grid item xs={12}>
                        <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Activity Analysis</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            AI-powered insights based on your activity patterns and goals.
                          </Typography>
                          <ActivityInsights 
                            data={activityData} 
                            period={period}
                            previousData={previousPeriodData}
                          />
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Box>
                
                {/* Main content area - different for each view */}
                {activeView === 'standard' ? (
                  // Standard view with regular charts
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <ActivityChart 
                      data={activityData} 
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
                ) : activeView === 'enhanced' ? (
                  // Enhanced view with mountain visualization and pulse wave
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                            Step Mountain Visualization
                          </Typography>
                          <StepMountainVisualization 
                            data={activityData} 
                            height={220}
                            maxSteps={15000}
                            milestones={[
                              { value: 10000, label: "Daily Goal" },
                              { value: 15000, label: "Active" }
                            ]}
                          />
                        </Card>
                      </Grid>
                    
                      {period === 'day' && (
                        <Grid item xs={12}>
                          <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                              Activity Pulse Wave
                            </Typography>
                            <ActivityPulseWave 
                              data={activityData} 
                              height={180}
                              showHeartRate={true}
                              colors={{
                                steps: theme.palette.primary.main,
                                heart: theme.palette.error.main,
                                background: alpha(theme.palette.primary.light, 0.05)
                              }}
                            />
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ) : (
                  // Insights view - empty here as the content is in the top section
                  <Box sx={{ mt: 2 }}>
                    {/* Additional insights content can go here */}
                  </Box>
                )}
                
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
      </Box>
      
      {/* DiagnosticsPanel component */}
      <DiagnosticsPanel
        isOpen={showDiagnosticsPanel}
        onClose={handleCloseDiagnosticsPanel}
        tokenScopes={tokenScopes}
        isAuthenticated={isAuthenticated}
        currentTab="activity"
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

export default ActivityTab;