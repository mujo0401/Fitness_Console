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
import { sleepService } from '../services/api';
import SleepChart from '../components/charts/SleepChart';
import { useAuth } from '../context/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState(new Date());
  const [sleepData, setSleepData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSleepData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, period, date]);

  const fetchSleepData = async () => {
    if (!isValid(date) || !isAuthenticated) {
      setLoading(false);
      setError(isAuthenticated ? "Invalid date selected." : "Authentication required to view sleep data.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log(`🔍 Fetching sleep data for period: ${period}, date: ${formattedDate}`);
      
      // Make the API call
      const data = await sleepService.getSleepData(period, formattedDate);
      console.log('📊 API Response:', data);
      
      if (data && data.data && data.data.length > 0) {
        console.log(`✅ Received ${data.data.length} sleep data points`);
        console.log('📋 Sample data point:', data.data[0]);
        
        setSleepData(data.data);
      } else {
        console.warn('⚠️ Received empty sleep data');
        setError("No sleep data available for the selected period.");
        setSleepData([]);
      }
    } catch (err) {
      console.error("🔴 Error in fetchSleepData:", err);
      
      const errorMessage = err.response?.status === 401
        ? "Authentication required to view sleep data."
        : err.response?.status === 429
          ? "Rate limit exceeded. Please try again later."
          : "Failed to load sleep data. Please try again.";
      
      setError(errorMessage);
      setSleepData([]);
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
    fetchSleepData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 600); // Add a slight delay for visual feedback
    });
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
              Please connect your Fitbit account to view sleep data.
            </Typography>
          </Paper>
        </Box>
      </motion.div>
    );
  }
  
  const { avgDuration, avgDeepSleep, avgEfficiency, avgScore } = getStats();
  const qualityLevel = getSleepQualityLevel(avgScore);

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
            background: 'linear-gradient(135deg, #673ab7, #9c27b0)', 
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
              <BedtimeIcon sx={{ filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))' }} /> 
              Sleep Analytics
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
                  Loading sleep data...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error" variant="h6" gutterBottom>
                  {error}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleRefresh} 
                  startIcon={<RefreshIcon />}
                  sx={{ mt: 2 }}
                >
                  Try Again
                </Button>
              </Box>
            ) : !sleepData || sleepData.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No sleep data available for the selected period.
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
                
                <Box sx={{ mt: 2 }}>
                  <SleepChart data={sleepData} period={period} />
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

export default SleepTab;