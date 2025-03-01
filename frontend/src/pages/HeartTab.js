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
  const { isAuthenticated } = useAuth();
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
      try {
        data = await heartRateService.getHeartRateData(period, formattedDate);
        console.log('📊 API Response:', data);
      } catch (apiError) {
        console.error("🔴 API call failed:", apiError);
        setError(`Failed to fetch heart rate data: ${apiError.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      if (data && data.data && data.data.length > 0) {
        console.log(`✅ Received ${data.data.length} heart rate data points`);
        
        setHeartData(data.data);
        setAbnormalEvents(data.abnormal_events || []);
        
        // Calculate heart rate variability
        const hrvValue = calculateHRV(data.data);
        setHrv(hrvValue);
      } else {
        console.warn('⚠️ Received empty heart rate data');
        setError("No heart rate data available for the selected period.");
        setHeartData([]);
        setAbnormalEvents([]);
        setHrv(0);
      }
    } catch (err) {
      console.error("🔴 Error in fetchHeartData:", err);
      
      const errorMessage = err.response?.status === 401
        ? "Authentication required to view heart rate data."
        : err.response?.status === 429
          ? "Rate limit exceeded. Please try again later."
          : "Failed to load heart rate data. Please try again.";
      
      setError(errorMessage);
      setHeartData([]);
      setAbnormalEvents([]);
      setHrv(0);
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
                  <Button 
                    variant="outlined" 
                    onClick={handleRefresh} 
                    startIcon={<RefreshIcon />}
                    sx={{ mt: 2 }}
                  >
                    {error ? "Try Again" : "Refresh"}
                  </Button>
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
