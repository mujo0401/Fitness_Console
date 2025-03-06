import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Brush,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ReferenceArea,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap
} from 'recharts';
import { 
  Box, 
  Typography, 
  FormControlLabel, 
  Switch, 
  Skeleton, 
  Paper, 
  Chip as MuiChip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider as MuiSlider,
  Stack,
  Divider,
  Button,
  Fade,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  LinearProgress,
  Avatar,
  Badge,
  Container,
  Tooltip as MuiTooltip,
  CircularProgress,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  ListItemButton,
  Chip,
  Slider,
  Fab,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  Alert,
  Popover,
  styled
} from '@mui/material';
import { format, parseISO, subDays, differenceInHours, isSameDay } from 'date-fns';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import SpeedIcon from '@mui/icons-material/Speed';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ScienceIcon from '@mui/icons-material/Science';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CompareIcon from '@mui/icons-material/Compare';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import HorizontalSplitIcon from '@mui/icons-material/HorizontalSplit';
import RadarIcon from '@mui/icons-material/Radar';
import GridOnIcon from '@mui/icons-material/GridOn';
import StraightenIcon from '@mui/icons-material/Straighten';
import MenuIcon from '@mui/icons-material/Menu';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Psychology from '@mui/icons-material/Psychology';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import DevicesIcon from '@mui/icons-material/Devices';
import RefreshIcon from '@mui/icons-material/Refresh';

// Enhanced heart rate zones with detailed descriptions and training benefits
const HR_ZONES = [
  { 
    name: 'Rest',
    min: 0, 
    max: 60, 
    color: '#3f51b5',
    gradient: 'linear-gradient(120deg, #3f51b5, #5c6bc0)',
    description: 'Resting heart rate - your heart at complete rest',
    benefits: 'Recovery, low stress on cardiovascular system',
    icon: <NightsStayIcon fontSize="small" />,
    intensity: 'Very Low'
  },
  { 
    name: 'Fat Burn', 
    min: 60, 
    max: 70, 
    color: '#2196f3',
    gradient: 'linear-gradient(120deg, #2196f3, #64b5f6)',
    description: 'Low intensity exercise, optimal for fat burning',
    benefits: 'Improved fat metabolism, endurance building',
    icon: <LocalFireDepartmentIcon fontSize="small" />,
    intensity: 'Low'
  },
  { 
    name: 'Cardio', 
    min: 70, 
    max: 85, 
    color: '#009688',
    gradient: 'linear-gradient(120deg, #009688, #4db6ac)',
    description: 'Medium-high intensity, improves cardiovascular fitness',
    benefits: 'Increased cardiovascular capacity, improved stamina',
    icon: <FavoriteIcon fontSize="small" />,
    intensity: 'Moderate'
  },
  { 
    name: 'Peak', 
    min: 85, 
    max: 100, 
    color: '#ff9800',
    gradient: 'linear-gradient(120deg, #ff9800, #ffb74d)',
    description: 'High intensity exercise, increases performance and speed',
    benefits: 'Improved VO2 max, anaerobic capacity, speed',
    icon: <DirectionsRunIcon fontSize="small" />,
    intensity: 'High'
  },
  { 
    name: 'Extreme', 
    min: 100, 
    max: 220, 
    color: '#f44336',
    gradient: 'linear-gradient(120deg, #f44336, #ef5350)',
    description: 'Maximum effort, short-duration exercise',
    benefits: 'Maximal performance, anaerobic power, sprint capacity',
    icon: <SpeedIcon fontSize="small" />,
    intensity: 'Maximum'
  }
];

// Calculate the heart rate zone for a given value
const getHeartRateZone = (value) => {
  if (!value) return null;
  return HR_ZONES.find(zone => value >= zone.min && value < zone.max);
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

// Calculate heart rate recovery rate
const calculateHRRecovery = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 10) return 0;
  
  // Find peak heart rate and the following min
  const values = heartRateData.map(item => item.avg || item.value || 0);
  
  let maxHR = Math.max(...values);
  let maxIndex = values.indexOf(maxHR);
  
  // Need to have data after the peak
  if (maxIndex >= values.length - 5) {
    maxIndex = Math.floor(values.length / 2);
    maxHR = values[maxIndex];
  }
  
  // Look at 5 minutes after peak
  const recoveryWindow = Math.min(5, values.length - maxIndex - 1);
  const recoveryValue = maxHR - values[maxIndex + recoveryWindow];
  
  return Math.max(0, recoveryValue);
};

// Detect abnormal heart rate patterns
const detectAbnormalPatterns = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 10) return [];
  
  const abnormalities = [];
  const values = heartRateData.map(item => item.avg || item.value || 0);
  
  // Detect sudden changes (more than 20 BPM in consecutive readings)
  for (let i = 1; i < values.length; i++) {
    const change = Math.abs(values[i] - values[i-1]);
    if (change > 20) {
      abnormalities.push({
        type: 'Sudden change',
        value: `Change of ${Math.round(change)} BPM`,
        index: i,
        severity: change > 35 ? 'High' : 'Medium',
        time: heartRateData[i].time || ''
      });
    }
  }
  
  // Detect sustained high heart rate (>100 BPM for multiple readings)
  let highHRCount = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > 100) {
      highHRCount++;
      if (highHRCount === 5) {
        abnormalities.push({
          type: 'High heart rate',
          value: `${Math.round(values[i])} BPM sustained`,
          index: i,
          severity: values[i] > 120 ? 'High' : 'Medium',
          time: heartRateData[i].time || ''
        });
        highHRCount = 0;
      }
    } else {
      highHRCount = 0;
    }
  }
  
  // Limit to 3 abnormalities
  return abnormalities.slice(0, 3);
};

// Enhanced Animation component for the heartbeat
const HeartbeatAnimation = ({ bpm = 70, size = 'medium' }) => {
  const [scale, setScale] = useState(1);
  const animationRef = useRef(null);
  const secondsPerBeat = 60 / Math.max(40, Math.min(220, bpm));
  const theme = useTheme();
  const zone = getHeartRateZone(bpm);
  
  useEffect(() => {
    const animate = () => {
      const time = Date.now() / 1000;
      const pulse = Math.sin(time / secondsPerBeat * Math.PI * 2) * 0.2 + 0.8;
      setScale(pulse);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [secondsPerBeat]);
  
  const iconSize = size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium';
  const textVariant = size === 'large' ? 'h4' : size === 'small' ? 'body2' : 'h6';
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FavoriteIcon 
        sx={{ 
          transform: `scale(${scale})`,
          transition: 'transform 50ms ease-in-out',
          color: zone?.color || theme.palette.error.main,
          fontSize: size === 'large' ? 40 : size === 'small' ? 16 : 24,
          filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.2))'
        }} 
      />
      <Typography variant={textVariant} fontWeight="bold">
        {bpm} 
        <Typography component="span" variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>BPM</Typography>
      </Typography>
    </Box>
  );
};

// Enhanced custom tooltip component with advanced metrics
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const hrZone = data.avg ? getHeartRateZone(data.avg) : null;
  
  // Calculate timestamp if available
  const timestamp = data.date ? 
    (data.time ? `${data.date} at ${data.time}` : data.date) : 
    (typeof label === 'string' ? label : '');
  
  // Calculate estimated calories if we have heart rate
  const estimatedCalories = data.avg ? Math.round((data.avg * 0.045) * 2) : null;
  
  return (
    <Paper
      elevation={4}
      sx={{
        p: 0,
        borderRadius: 2,
        maxWidth: 300,
        backdropFilter: 'blur(8px)',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(200, 200, 200, 0.5)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}
    >
      {/* Header with zone color */}
      <Box sx={{ 
        p: 1.5, 
        background: hrZone?.gradient || 'linear-gradient(90deg, #8884d8, #8884d8)', 
        color: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hrZone?.icon || <FavoriteIcon fontSize="small" />}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {timestamp}
          </Typography>
        </Box>
        {hrZone && (
          <Typography variant="caption" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <DirectionsRunIcon fontSize="inherit" /> 
            {hrZone.name} Zone ({hrZone.intensity} Intensity)
          </Typography>
        )}
      </Box>
      
      <Box sx={{ p: 2 }}>
        {/* Primary metrics */}
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          {data.avg && (
            <Grid item xs={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(hrZone?.color || theme.palette.primary.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Heart Rate
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: hrZone?.color || theme.palette.primary.main }}>
                  {Math.round(data.avg)} <Typography component="span" variant="caption">BPM</Typography>
                </Typography>
              </Paper>
            </Grid>
          )}
          
          {/* Min-Max Range */}
          {data.min > 0 && data.max > 0 && (
            <Grid item xs={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.info.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Range
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                  {data.max - data.min} <Typography component="span" variant="caption">Δ</Typography>
                </Typography>
              </Paper>
            </Grid>
          )}
          
          {/* Resting Heart Rate */}
          {data.restingHeartRate > 0 && (
            <Grid item xs={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.info.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Resting HR
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                  {data.restingHeartRate} <Typography component="span" variant="caption">BPM</Typography>
                </Typography>
              </Paper>
            </Grid>
          )}
          
          {/* Estimated calories if heart rate available */}
          {estimatedCalories && (
            <Grid item xs={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Est. Burn Rate
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                  {estimatedCalories} <Typography component="span" variant="caption">cal/hr</Typography>
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
        
        {/* HR Zone Analysis - show only when we have avg HR */}
        {data.avg && hrZone && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Training Effect
            </Typography>
            <Paper 
              elevation={0}
              sx={{ 
                p: 1.5, 
                bgcolor: alpha(hrZone.color, 0.05), 
                borderRadius: 1,
                border: `1px dashed ${alpha(hrZone.color, 0.3)}`
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                <strong>{hrZone.description}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                {hrZone.benefits}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Heart rate analysis component
const HeartRateAnalysisPanel = ({ data, period }) => {
  const theme = useTheme();
  
  // Calculate metrics
  const hrvValue = useMemo(() => calculateHRV(data), [data]);
  const hrRecovery = useMemo(() => calculateHRRecovery(data), [data]);
  const abnormalPatterns = useMemo(() => detectAbnormalPatterns(data), [data]);
  
  // Calculate average, min, max heart rates
  const avgHR = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.avg || 0) > 0)
      .map(item => item.avg);
    if (validValues.length === 0) return 0;
    return Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length);
  }, [data]);
  
  const maxHR = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.max || item.avg || 0) > 0)
      .map(item => item.max || item.avg);
    if (validValues.length === 0) return 0;
    return Math.max(...validValues);
  }, [data]);
  
  const minHR = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.min || item.avg || 0) > 0)
      .map(item => item.min || item.avg);
    if (validValues.length === 0) return 0;
    return Math.min(...validValues);
  }, [data]);
  
  const restingHR = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.restingHeartRate || 0) > 0)
      .map(item => item.restingHeartRate);
    if (validValues.length === 0) return 0;
    return Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length);
  }, [data]);
  
  // Calculate time in each zone
  const zoneDistribution = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Create zone counters
    const zoneCounts = HR_ZONES.reduce((acc, zone) => {
      acc[zone.name] = 0;
      return acc;
    }, {});
    
    // Count data points in each zone
    data.forEach(item => {
      const hr = item.avg || item.value || 0;
      if (hr > 0) {
        const zone = getHeartRateZone(hr);
        if (zone) {
          zoneCounts[zone.name]++;
        }
      }
    });
    
    // Calculate percentages
    const totalPoints = data.length;
    
    return HR_ZONES.map(zone => ({
      name: zone.name,
      value: Math.round((zoneCounts[zone.name] / totalPoints) * 100),
      color: zone.color,
      intensity: zone.intensity,
      icon: zone.icon
    }));
  }, [data]);
  
  // Calculate score based on heart rate metrics (0-100)
  const cardioFitnessScore = useMemo(() => {
    // Start with base score of 70
    let score = 70;
    
    // Adjust for resting heart rate (lower is better)
    if (restingHR > 0) {
      if (restingHR < 50) score += 15;
      else if (restingHR < 60) score += 10;
      else if (restingHR < 70) score += 5;
      else if (restingHR > 80) score -= 5;
      else if (restingHR > 90) score -= 10;
    }
    
    // Adjust for HRV (higher is better)
    if (hrvValue > 0) {
      if (hrvValue > 50) score += 15;
      else if (hrvValue > 30) score += 10;
      else if (hrvValue > 20) score += 5;
      else if (hrvValue < 10) score -= 5;
    }
    
    // Adjust for recovery rate (higher is better)
    if (hrRecovery > 0) {
      if (hrRecovery > 30) score += 10;
      else if (hrRecovery > 20) score += 5;
    }
    
    // Penalize for abnormal patterns
    score -= abnormalPatterns.length * 5;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }, [restingHR, hrvValue, hrRecovery, abnormalPatterns]);
  
  // Get recovery status based on HRV and abnormal patterns
  const recoveryStatus = useMemo(() => {
    if (hrvValue < 10 || abnormalPatterns.length > 1) return "Needs Recovery";
    if (hrvValue < 20 || abnormalPatterns.length > 0) return "Moderate";
    if (hrvValue >= 30) return "Well Recovered";
    return "Good";
  }, [hrvValue, abnormalPatterns]);
  
  // Personalized recommendations based on data analysis
  const getRecommendations = () => {
    const recommendations = [];
    
    // Base on HRV
    if (hrvValue < 10) {
      recommendations.push({
        title: "Prioritize Recovery",
        description: "Your heart rate variability is low. Focus on rest, sleep, and gentle movement today.",
        icon: <NightsStayIcon fontSize="small" color="primary" />
      });
    } else if (hrvValue < 20) {
      recommendations.push({
        title: "Light to Moderate Activity",
        description: "Your HRV indicates moderate recovery. Keep intensity lower today.",
        icon: <DirectionsRunIcon fontSize="small" color="info" />
      });
    } else if (hrvValue >= 30) {
      recommendations.push({
        title: "Ready for Intensity",
        description: "Your HRV indicates good recovery. High intensity training would be well tolerated today.",
        icon: <LocalFireDepartmentIcon fontSize="small" color="success" />
      });
    }
    
    // Based on abnormal patterns
    if (abnormalPatterns.length > 0) {
      recommendations.push({
        title: "Monitor Heart Rhythm",
        description: `${abnormalPatterns.length} abnormal heart rate pattern${abnormalPatterns.length > 1 ? 's' : ''} detected. Consider monitoring more closely.`,
        icon: <WarningIcon fontSize="small" color="warning" />
      });
    }
    
    // Based on zone distribution
    const peakZoneTime = zoneDistribution.find(z => z.name === 'Peak')?.value || 0;
    if (peakZoneTime > 20) {
      recommendations.push({
        title: "High Intensity Recovery",
        description: "You spent significant time in peak zones. Include active recovery in your routine.",
        icon: <BatteryChargingFullIcon fontSize="small" color="info" />
      });
    }
    
    // If no specific recommendations, add a general one
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Maintain Consistency",
        description: "Your heart metrics look good. Continue your current training routine.",
        icon: <HealthAndSafetyIcon fontSize="small" color="success" />
      });
    }
    
    return recommendations;
  };
  
  const recommendations = getRecommendations();
  
  return (
    <Box sx={{ mt: 3 }}>
      {/* Main analysis panels */}
      <Grid container spacing={3}>
        {/* Fitness Score */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
              <HealthAndSafetyIcon color="primary" /> Cardio Fitness Score
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1, position: 'relative' }}>
              <Box sx={{ position: 'relative', width: 150, height: 150 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={150}
                  thickness={5}
                  sx={{ color: alpha(theme.palette.grey[200], 0.5), position: 'absolute' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={cardioFitnessScore}
                  size={150}
                  thickness={5}
                  sx={{ 
                    color: cardioFitnessScore > 80 ? theme.palette.success.main : 
                           cardioFitnessScore > 60 ? theme.palette.info.main : 
                           cardioFitnessScore > 40 ? theme.palette.warning.main : 
                           theme.palette.error.main,
                    position: 'absolute'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h3" component="div" color="text.primary" fontWeight="bold">
                    {cardioFitnessScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    out of 100
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Based on your heart rate metrics, recovery patterns, and variability analysis.
              </Typography>
              
              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip 
                  label={`Recovery: ${recoveryStatus}`} 
                  size="small" 
                  color={
                    recoveryStatus === "Well Recovered" ? "success" : 
                    recoveryStatus === "Good" ? "info" : 
                    recoveryStatus === "Moderate" ? "warning" : "error"
                  }
                  sx={{ fontWeight: 'medium' }}
                />
                <Chip 
                  label={`HRV: ${hrvValue} ms`} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Zone Distribution */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
              <LocalFireDepartmentIcon color="primary" /> Heart Rate Zones
            </Typography>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {zoneDistribution.map((zone) => (
                <Box key={zone.name} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {zone.icon} {zone.name}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({zone.intensity})
                      </Typography>
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {zone.value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={zone.value} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(zone.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: zone.color,
                        borderRadius: 4
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Time spent in each heart rate zone during the recorded period.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Key Metrics */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff, #f9f9f9)'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
              <MonitorHeartIcon color="primary" /> Cardiac Metrics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Resting HR</Typography>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {restingHR || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">BPM</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Variability</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {hrvValue || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">ms</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Max HR</Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    {maxHR || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">BPM</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Recovery</Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {hrRecovery || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">BPM</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Abnormal Patterns */}
            {abnormalPatterns.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <WarningIcon fontSize="small" /> Abnormal Patterns Detected
                </Typography>
                
                <Stack spacing={1}>
                  {abnormalPatterns.map((pattern, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: alpha(theme.palette.warning.light, 0.1),
                        border: `1px dashed ${theme.palette.warning.light}`,
                        fontSize: '0.8rem'
                      }}
                    >
                      {pattern.type}: {pattern.value} {pattern.time && `(at ${pattern.time})`}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* AI Recommendations */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mt: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f5f9ff, #f0f4fa)'
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
          <ScienceIcon color="primary" /> AI-Powered Recommendations
        </Typography>
        
        <Grid container spacing={2}>
          {recommendations.map((rec, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {rec.icon}
                  <Typography variant="subtitle2" fontWeight="bold">
                    {rec.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {rec.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          Recommendations based on heart rate metrics, patterns, and recovery analysis.
          This is not medical advice. Consult with a healthcare professional for personalized guidance.
        </Typography>
      </Paper>
    </Box>
  );
};

// Diagnostics Dialog component
const DiagnosticsDialog = ({ open, onClose, tokenScopes, isAuthenticated, date, period, dataQualityScores, availableSources }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon color="primary" />
          <Typography variant="h6">Data Diagnostics & Status</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Basic Info" />
        <Tab label="Data Sources" />
        <Tab label="Debug Tools" />
      </Tabs>
      
      <DialogContent sx={{ py: 3 }}>
        {activeTab === 0 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.light, 0.1), border: `1px dashed ${theme.palette.info.main}` }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InfoIcon color="info" /> Authentication Status
              </Typography>
              
              <Box sx={{ p: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1, bgcolor: 'background.paper' }}>
                <Typography variant="body2" align="left">
                  Authenticated: <strong>{isAuthenticated ? 'Yes' : 'No'}</strong>
                </Typography>
                <Typography variant="body2" align="left">
                  Current scopes: {tokenScopes.length > 0 ? tokenScopes.join(', ') : 'No scopes found'}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={tokenScopes.includes('heartrate') ? 'success.main' : 'error.main'} 
                  sx={{ mt: 1 }} 
                  align="left"
                >
                  Has 'heartrate' scope: <strong>{tokenScopes.includes('heartrate') ? 'Yes' : 'No - this is required for heart rate data'}</strong>
                </Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.light, 0.1), border: `1px dashed ${theme.palette.primary.main}` }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InfoIcon color="primary" /> Current Request Parameters
              </Typography>
              
              <Box sx={{ p: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1, bgcolor: 'background.paper' }}>
                <Typography variant="body2" align="left">
                  Period: <strong>{period}</strong>
                </Typography>
                <Typography variant="body2" align="left">
                  Date: <strong>{format(date, 'yyyy-MM-dd')}</strong>
                </Typography>
                <Typography variant="body2" align="left">
                  API Endpoint: <code>{process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}/api/[source]/heart-rate?period={period}&date={format(date, 'yyyy-MM-dd')}</code>
                </Typography>
              </Box>
            </Paper>
          </Stack>
        )}
        
        {activeTab === 1 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.light, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CompareIcon color="primary" /> Data Source Comparison
              </Typography>
              
              <Grid container spacing={2}>
                {/* Fitbit Data Source */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      bgcolor: availableSources.fitbit ? 'white' : alpha(theme.palette.grey[500], 0.05),
                      border: `1px solid ${availableSources.fitbit ? alpha('#1976d2', 0.2) : alpha(theme.palette.grey[500], 0.2)}`,
                      borderRadius: 2,
                      opacity: availableSources.fitbit ? 1 : 0.6
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <FitnessCenterIcon sx={{ color: availableSources.fitbit ? '#1976d2' : 'grey.500' }} />
                      <Typography variant="subtitle2" color={availableSources.fitbit ? 'textPrimary' : 'textSecondary'}>
                        Fitbit
                      </Typography>
                      {availableSources.fitbit && (
                        <Chip
                          label="Connected"
                          size="small"
                          color="primary"
                          sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Data Quality Score:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={dataQualityScores.fitbit}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            flexGrow: 1,
                            bgcolor: alpha('#1976d2', 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#1976d2'
                            }
                          }} 
                        />
                        <Typography variant="body2" fontWeight="medium" color={availableSources.fitbit ? 'primary' : 'textSecondary'}>
                          {dataQualityScores.fitbit}/100
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                      {availableSources.fitbit 
                        ? `${dataQualityScores.fitbit > 70 
                            ? 'High quality data available' 
                            : dataQualityScores.fitbit > 40 
                              ? 'Moderate quality data available' 
                              : 'Limited data available'}`
                        : 'Not connected - no data available'}
                    </Typography>
                  </Paper>
                </Grid>
                
                {/* Google Fit Data Source */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      bgcolor: availableSources.googleFit ? 'white' : alpha(theme.palette.grey[500], 0.05),
                      border: `1px solid ${availableSources.googleFit ? alpha('#4caf50', 0.2) : alpha(theme.palette.grey[500], 0.2)}`,
                      borderRadius: 2,
                      opacity: availableSources.googleFit ? 1 : 0.6
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <GoogleIcon sx={{ color: availableSources.googleFit ? '#4caf50' : 'grey.500' }} />
                      <Typography variant="subtitle2" color={availableSources.googleFit ? 'textPrimary' : 'textSecondary'}>
                        Google Fit
                      </Typography>
                      {availableSources.googleFit && (
                        <Chip
                          label="Connected"
                          size="small"
                          color="success"
                          sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Data Quality Score:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={dataQualityScores.googleFit}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            flexGrow: 1,
                            bgcolor: alpha('#4caf50', 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#4caf50'
                            }
                          }} 
                        />
                        <Typography variant="body2" fontWeight="medium" color={availableSources.googleFit ? 'success' : 'textSecondary'}>
                          {dataQualityScores.googleFit}/100
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                      {availableSources.googleFit 
                        ? `${dataQualityScores.googleFit > 70 
                            ? 'High quality data available' 
                            : dataQualityScores.googleFit > 40 
                              ? 'Moderate quality data available' 
                              : 'Limited data available'}`
                        : 'Not connected - no data available'}
                    </Typography>
                  </Paper>
                </Grid>
                
                {/* Apple Health Data Source */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      bgcolor: availableSources.appleHealth ? 'white' : alpha(theme.palette.grey[500], 0.05),
                      border: `1px solid ${availableSources.appleHealth ? alpha('#f44336', 0.2) : alpha(theme.palette.grey[500], 0.2)}`,
                      borderRadius: 2,
                      opacity: availableSources.appleHealth ? 1 : 0.6
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AppleIcon sx={{ color: availableSources.appleHealth ? '#f44336' : 'grey.500' }} />
                      <Typography variant="subtitle2" color={availableSources.appleHealth ? 'textPrimary' : 'textSecondary'}>
                        Apple Health
                      </Typography>
                      {availableSources.appleHealth && (
                        <Chip
                          label="Connected"
                          size="small"
                          color="error"
                          sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Data Quality Score:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={dataQualityScores.appleHealth}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            flexGrow: 1,
                            bgcolor: alpha('#f44336', 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: '#f44336'
                            }
                          }} 
                        />
                        <Typography variant="body2" fontWeight="medium" color={availableSources.appleHealth ? 'error' : 'textSecondary'}>
                          {dataQualityScores.appleHealth}/100
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                      {availableSources.appleHealth 
                        ? `${dataQualityScores.appleHealth > 70 
                            ? 'High quality data available' 
                            : dataQualityScores.appleHealth > 40 
                              ? 'Moderate quality data available' 
                              : 'Limited data available'}`
                        : 'Not connected - no data available'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Auto-Select Algorithm
                </Typography>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.light, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    When "Auto" data source is selected, the system chooses the best data source based on:
                  </Typography>
                  <Box component="ul" sx={{ ml: 2, pl: 1, mt: 0 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Data Quantity</strong> - Number of data points available (40%)
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Data Completeness</strong> - Presence of min/max/avg values (30%)
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Data Recency</strong> - How recent the latest data point is (30%)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="body2" fontWeight="medium">
                      Current Recommendation: 
                      {(() => {
                        // Determine highest quality available source
                        const scores = Object.entries(dataQualityScores)
                          .filter(([source]) => availableSources[source])
                          .sort((a, b) => b[1] - a[1]);
                        
                        if (scores.length === 0) return " None (No data sources available)";
                        
                        const bestSource = scores[0][0];
                        let sourceName, sourceColor;
                        
                        if (bestSource === 'fitbit') {
                          sourceName = "Fitbit";
                          sourceColor = '#1976d2';
                        } else if (bestSource === 'googleFit') {
                          sourceName = "Google Fit";
                          sourceColor = '#4caf50';
                        } else {
                          sourceName = "Apple Health";
                          sourceColor = '#f44336';
                        }
                        
                        return (
                          <Box component="span" sx={{ color: sourceColor, fontWeight: 'bold', ml: 1 }}>
                            {sourceName}
                          </Box>
                        );
                      })()}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Paper>
          </Stack>
        )}
        
        {activeTab === 2 && (
          <Stack spacing={3}>
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.light, 0.1), border: `1px dashed ${theme.palette.warning.main}` }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InfoIcon color="warning" /> Advanced Debugging Tools
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                  <Typography variant="subtitle2" gutterBottom>Fitbit API</Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button 
                      variant="outlined" 
                      color="primary"
                      size="small"
                      startIcon={<FitnessCenterIcon />}
                      onClick={async () => {
                        try {
                          const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
                          const response = await fetch(`${apiBaseUrl}/api/fitbit/debug-heart`, { credentials: 'include' });
                          const data = await response.json();
                          console.log('Fitbit debug data:', data);
                          const message = `
                            Status: ${data.status_code || 'Unknown'}
                            Scopes: ${data.scopes ? data.scopes.join(', ') : 'No scopes found'}
                            Has 'heartrate' scope: ${data.scopes && data.scopes.includes('heartrate') ? 'Yes' : 'No (required)'}
                          `;
                          alert('Fitbit API debug info:\n' + message + '\n\nFull details logged to console (F12)');
                        } catch (e) {
                          console.error('Error calling debug endpoint:', e);
                          alert('Error calling debug endpoint: ' + e.message);
                        }
                      }}
                    >
                      Test Fitbit API
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="primary"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={async () => {
                        try {
                          const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
                          const response = await fetch(`${apiBaseUrl}/api/fitbit/refresh-token`, { 
                            method: 'POST',
                            credentials: 'include' 
                          });
                          const data = await response.json();
                          console.log('Fitbit token refresh:', data);
                          alert('Fitbit token refresh attempt completed. Check console for details.');
                        } catch (e) {
                          console.error('Error refreshing token:', e);
                          alert('Error refreshing token: ' + e.message);
                        }
                      }}
                    >
                      Refresh Fitbit Token
                    </Button>
                  </Stack>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                  <Typography variant="subtitle2" gutterBottom>Google Fit API</Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button 
                      variant="outlined" 
                      color="success"
                      size="small"
                      startIcon={<GoogleIcon />}
                      onClick={async () => {
                        try {
                          const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
                          const response = await fetch(`${apiBaseUrl}/api/google-fit/debug`, { credentials: 'include' });
                          const data = await response.json();
                          console.log('Google Fit debug data:', data);
                          alert('Google Fit API debug info logged to console (F12)');
                        } catch (e) {
                          console.error('Error calling debug endpoint:', e);
                          alert('Error calling debug endpoint: ' + e.message);
                        }
                      }}
                    >
                      Test Google Fit API
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="success"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={async () => {
                        try {
                          const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
                          const response = await fetch(`${apiBaseUrl}/api/google-fit/refresh-token`, { 
                            method: 'POST',
                            credentials: 'include' 
                          });
                          const data = await response.json();
                          console.log('Google Fit token refresh:', data);
                          alert('Google Fit token refresh attempt completed. Check console for details.');
                        } catch (e) {
                          console.error('Error refreshing token:', e);
                          alert('Error refreshing token: ' + e.message);
                        }
                      }}
                    >
                      Refresh Google Fit Token
                    </Button>
                  </Stack>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                  <Typography variant="subtitle2" gutterBottom>Apple Health API</Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button 
                      variant="outlined" 
                      color="error"
                      size="small"
                      startIcon={<AppleIcon />}
                      onClick={async () => {
                        try {
                          const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
                          const response = await fetch(`${apiBaseUrl}/api/apple-fitness/debug`, { credentials: 'include' });
                          const data = await response.json();
                          console.log('Apple Health debug data:', data);
                          alert('Apple Health API debug info logged to console (F12)');
                        } catch (e) {
                          console.error('Error calling debug endpoint:', e);
                          alert('Error calling debug endpoint: ' + e.message);
                        }
                      }}
                    >
                      Test Apple Health API
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="error"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={async () => {
                        try {
                          const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
                          const response = await fetch(`${apiBaseUrl}/api/apple-fitness/refresh-token`, { 
                            method: 'POST',
                            credentials: 'include' 
                          });
                          const data = await response.json();
                          console.log('Apple Health token refresh:', data);
                          alert('Apple Health token refresh attempt completed. Check console for details.');
                        } catch (e) {
                          console.error('Error refreshing token:', e);
                          alert('Error refreshing token: ' + e.message);
                        }
                      }}
                    >
                      Refresh Apple Health Token
                    </Button>
                  </Stack>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                  <Typography variant="subtitle2" gutterBottom>Session Diagnostics</Typography>
                  <Button 
                    variant="outlined" 
                    color="info"
                    size="small"
                    startIcon={<InfoIcon />}
                    onClick={async () => {
                      try {
                        const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
                        const response = await fetch(`${apiBaseUrl}/api/auth/debug-session`, { credentials: 'include' });
                        const data = await response.json();
                        console.log('Session debug:', data);
                        alert('Session info logged to console - check browser console (F12)');
                      } catch (e) {
                        console.error('Error debugging session:', e);
                        alert('Error debugging session: ' + e.message);
                      }
                    }}
                  >
                    Debug Session
                  </Button>
                </Paper>
              </Stack>
            </Paper>
          </Stack>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Downsampling function for performance with high-frequency data
const downsampleData = (data, targetPoints = 500) => {
  if (!data || data.length <= targetPoints) return data;
  
  const factor = Math.ceil(data.length / targetPoints);
  const result = [];
  
  for (let i = 0; i < data.length; i += factor) {
    const chunk = data.slice(i, i + factor);
    const avgObj = { ...chunk[0] };
    
    // Calculate averages for each numeric field
    Object.keys(avgObj).forEach(key => {
      if (typeof avgObj[key] === 'number') {
        const validValues = chunk
          .map(item => item[key])
          .filter(val => typeof val === 'number' && !isNaN(val));
          
        if (validValues.length > 0) {
          if (key === 'min') {
            avgObj[key] = Math.min(...validValues);
          } else if (key === 'max') {
            avgObj[key] = Math.max(...validValues);
          } else {
            avgObj[key] = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
          }
        }
      }
    });
    
    result.push(avgObj);
  }
  
  return result;
};

// Enhanced HeartRateChart component
const HeartRateChart = ({ 
  data,
  fitbitData,
  googleFitData,
  appleHealthData,
  dataSource = 'auto',
  period,
  tokenScopes = [],
  isAuthenticated = false,
  date = new Date(),
  availableSources = { fitbit: false, googleFit: false, appleHealth: false },
  onDataSourceChange
}) => {
  const theme = useTheme();
  const [showRange, setShowRange] = useState(true);
  const [viewType, setViewType] = useState('area');
  const [zoneView, setZoneView] = useState(false);
  const [resolution, setResolution] = useState('medium');
  const [chartType, setChartType] = useState('area');
  const [processedData, setProcessedData] = useState([]);
  const [allSourcesData, setAllSourcesData] = useState({
    fitbit: [],
    googleFit: [], 
    appleHealth: []
  });
  const [currentHeartRate, setCurrentHeartRate] = useState(70);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [dataInsights, setDataInsights] = useState(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [dataQualityScores, setDataQualityScores] = useState({
    fitbit: 0,
    googleFit: 0,
    appleHealth: 0
  });
  
  // Store all available data sources in state for comparison features
  useEffect(() => {
    const sourceData = {
      fitbit: fitbitData || [],
      googleFit: googleFitData || [],
      appleHealth: appleHealthData || []
    };
    setAllSourcesData(sourceData);
    
    // Calculate data quality scores for each source
    const qualityScores = {
      fitbit: calculateDataQualityScore(fitbitData || []),
      googleFit: calculateDataQualityScore(googleFitData || []),
      appleHealth: calculateDataQualityScore(appleHealthData || [])
    };
    setDataQualityScores(qualityScores);
  }, [fitbitData, googleFitData, appleHealthData]);

  // Process data on load and when settings change
  useEffect(() => {
    if (!data || data.length === 0) {
      // Set empty state with placeholder data for visualization
      const placeholderData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        date: "2025-03-01",
        avg: 0,
        min: 0,
        max: 0,
        zoneColor: "#8884d8",
        zoneName: "N/A",
        source: "none"
      }));
      setProcessedData(placeholderData);
      setCurrentHeartRate(0);
      return;
    }
    
    // Get current heart rate from the latest data point
    const latestHR = data[data.length - 1]?.avg || data[data.length - 1]?.value;
    if (latestHR) {
      setCurrentHeartRate(Math.round(latestHR));
    }
    
    // Downsample based on resolution
    let pointTarget;
    switch (resolution) {
      case 'low': pointTarget = 100; break;
      case 'high': pointTarget = 1000; break;
      default: pointTarget = 300; break;
    }
    
    // Process and set the data
    let processedData;
    
    if (compareMode && dataSource === 'combined') {
      // In comparison mode, create separate series for each data source
      const processedSources = {};
      
      if (fitbitData && fitbitData.length > 0) {
        processedSources.fitbit = enhanceHeartRateData(downsampleData(fitbitData, pointTarget), 'fitbit');
      }
      
      if (googleFitData && googleFitData.length > 0) {
        processedSources.googleFit = enhanceHeartRateData(downsampleData(googleFitData, pointTarget), 'googleFit');
      }
      
      if (appleHealthData && appleHealthData.length > 0) {
        processedSources.appleHealth = enhanceHeartRateData(downsampleData(appleHealthData, pointTarget), 'appleHealth');
      }
      
      // Combine with timestamps as keys to align the data
      const combinedData = [];
      const timestamps = {};
      
      // Collect all unique timestamps
      Object.keys(processedSources).forEach(source => {
        processedSources[source].forEach(item => {
          const key = item.timestamp || `${item.date}T${item.time || '00:00'}`;
          timestamps[key] = true;
        });
      });
      
      // Create combined entries for each timestamp
      Object.keys(timestamps).sort().forEach(timestamp => {
        const entry = { timestamp };
        
        // Find matching entries from each source
        Object.keys(processedSources).forEach(source => {
          const sourceData = processedSources[source].find(item => {
            const itemTimestamp = item.timestamp || `${item.date}T${item.time || '00:00'}`;
            return itemTimestamp === timestamp;
          });
          
          if (sourceData) {
            entry[`${source}Avg`] = sourceData.avg || sourceData.value || 0;
            entry[`${source}Min`] = sourceData.min || 0;
            entry[`${source}Max`] = sourceData.max || 0;
          }
        });
        
        // Add time and date for display
        const timestampDate = new Date(timestamp);
        entry.date = format(timestampDate, 'yyyy-MM-dd');
        entry.time = format(timestampDate, 'HH:mm');
        
        combinedData.push(entry);
      });
      
      processedData = combinedData;
    } else if (dataSource === 'auto') {
      // Smart data source selection based on quality metrics
      const bestSource = selectBestDataSource();
      const sourcesMap = {
        fitbit: fitbitData,
        googleFit: googleFitData,
        appleHealth: appleHealthData
      };
      
      const bestData = sourcesMap[bestSource] || data;
      const sampledData = downsampleData(bestData, pointTarget);
      processedData = enhanceHeartRateData(sampledData, bestSource);
    } else {
      // Regular mode - just process the active data source
      const sampledData = downsampleData(data, pointTarget);
      processedData = enhanceHeartRateData(sampledData, dataSource);
    }
    
    setProcessedData(processedData);
    
    // Generate AI insights if in analysis tab
    if (activeTab === 1 && data.length > 10) {
      generateDataInsights(data);
    }
  }, [data, resolution, compareMode, dataSource, activeTab, fitbitData, googleFitData, appleHealthData]);
  
  // Calculate data quality score for a given dataset
  const calculateDataQualityScore = (data) => {
    if (!data || data.length === 0) return 0;
    
    // Calculate score based on:
    // 1. Data points (quantity) - max 40 points
    const dataPointsScore = Math.min(40, data.length / 10);
    
    // 2. Completeness (has min/max/avg values) - max 30 points
    let completenessCount = 0;
    data.forEach(item => {
      if (item.avg || item.value) completenessCount += 2;
      if (item.min) completenessCount += 1;
      if (item.max) completenessCount += 1;
      if (item.restingHeartRate) completenessCount += 1;
    });
    const completenessScore = Math.min(30, (completenessCount / (data.length * 5)) * 30);
    
    // 3. Recency (how recent the data is) - max 30 points
    let recencyScore = 30;
    if (data.length > 0) {
      const mostRecentItem = data[data.length - 1];
      // Support for both date strings and timestamps
      const itemTime = mostRecentItem.timestamp 
        ? new Date(mostRecentItem.timestamp * 1000) 
        : mostRecentItem.date 
          ? new Date(mostRecentItem.date + (mostRecentItem.time ? ' ' + mostRecentItem.time : '')) 
          : null;
      
      if (itemTime) {
        const daysDiff = Math.abs(differenceInHours(new Date(), itemTime) / 24);
        recencyScore = Math.max(0, 30 - daysDiff * 5); // Lose 5 points per day old
      }
    }
    
    return Math.round(dataPointsScore + completenessScore + recencyScore);
  };
  
  // Select the best data source based on quality scores
  const selectBestDataSource = () => {
    // Filter for available sources only
    const scores = Object.entries(dataQualityScores)
      .filter(([source]) => availableSources[source])
      .sort((a, b) => b[1] - a[1]);
    
    // Return the highest scoring source, or 'fitbit' as fallback
    return scores.length > 0 ? scores[0][0] : 'fitbit';
  };
  
  // Helper function to enhance heart rate data with zone information and source
  const enhanceHeartRateData = (data, source) => {
    return data.map(item => {
      // Support both value and avg fields (Google Fit uses value, Fitbit uses avg)
      const hrValue = item.avg || item.value || 0;
      const zone = getHeartRateZone(hrValue);
      
      // Create consistent timestamp format for all data sources
      let timestamp;
      if (item.timestamp) {
        // Google Fit data already has timestamp in seconds since epoch
        timestamp = item.timestamp;
      } else if (item.date) {
        // Fitbit data has date and possibly time
        timestamp = new Date(item.date + (item.time ? ' ' + item.time : '')).getTime() / 1000;
      } else {
        // Fallback in case no time information is available
        timestamp = Date.now() / 1000;
      }
      
      return {
        ...item,
        source: source,
        timestamp: timestamp,
        value: hrValue, // Ensure all data has a value field
        zoneColor: zone?.color || '#8884d8',
        zoneName: zone?.name || 'Unknown',
        // For zone area chart
        rest: hrValue <= 60 ? hrValue : 0,
        fatBurn: hrValue > 60 && hrValue <= 70 ? hrValue : 0,
        cardio: hrValue > 70 && hrValue <= 85 ? hrValue : 0,
        peak: hrValue > 85 && hrValue <= 100 ? hrValue : 0,
        extreme: hrValue > 100 ? hrValue : 0,
      };
    });
  };
  
  // Generate AI insights based on heart rate data 
  const generateDataInsights = (data) => {
    setAiAnalysisLoading(true);
    
    // Simulate AI analysis with a delay for UX
    setTimeout(() => {
      // Extract basic metrics
      const avgHr = data.reduce((sum, item) => sum + (item.avg || item.value || 0), 0) / data.length;
      const restingHr = Math.min(...data.filter(item => item.min > 0).map(item => item.min));
      const maxHr = Math.max(...data.map(item => item.max || item.avg || 0));
      const hrvValue = calculateHRV(data);
      
      // Calculate time in each zone
      const zoneDistribution = HR_ZONES.map(zone => {
        const pointsInZone = data.filter(item => {
          const hr = item.avg || item.value || 0;
          return hr >= zone.min && hr < zone.max;
        }).length;
        return {
          name: zone.name,
          percentage: Math.round((pointsInZone / data.length) * 100)
        };
      });
      
      // Calculate recovery score
      const recoveryScore = Math.min(100, Math.max(0, 
        70 + // Base score
        (restingHr < 60 ? 15 : restingHr < 70 ? 5 : -5) + // Resting HR bonus
        (hrvValue > 40 ? 15 : hrvValue > 20 ? 5 : -5) // HRV bonus
      ));
      
      // Generate personalized insights
      const insights = [];
      
      // Resting HR insights
      if (restingHr < 50) {
        insights.push({
          type: 'excellent', 
          title: 'Athletic Resting Heart Rate',
          detail: `Your resting heart rate of ${Math.round(restingHr)} BPM indicates excellent cardiovascular fitness, comparable to trained athletes.`,
          icon: <SentimentVerySatisfiedIcon />
        });
      } else if (restingHr < 60) {
        insights.push({
          type: 'good',
          title: 'Good Resting Heart Rate',
          detail: `Your resting heart rate of ${Math.round(restingHr)} BPM is in the healthy range, indicating good cardiovascular health.`,
          icon: <SentimentSatisfiedIcon />
        });
      } else if (restingHr > 80) {
        insights.push({
          type: 'warning',
          title: 'Elevated Resting Heart Rate',
          detail: `Your resting heart rate of ${Math.round(restingHr)} BPM is slightly elevated. This could be due to stress, dehydration, or lack of sleep.`,
          icon: <SentimentDissatisfiedIcon />
        });
      }
      
      // Zone distribution insights
      const cardioZonePercentage = zoneDistribution.find(z => z.name === 'Cardio')?.percentage || 0;
      const peakZonePercentage = zoneDistribution.find(z => z.name === 'Peak')?.percentage || 0;
      
      if (cardioZonePercentage + peakZonePercentage > 30) {
        insights.push({
          type: 'excellent',
          title: 'Effective Cardio Training',
          detail: `You spent ${cardioZonePercentage + peakZonePercentage}% of your time in cardio-building zones, which is excellent for improving cardiovascular fitness.`,
          icon: <LocalFireDepartmentIcon />
        });
      } else if (cardioZonePercentage + peakZonePercentage < 5) {
        insights.push({
          type: 'neutral',
          title: 'Low Intensity Activity',
          detail: 'Your heart rate mostly stayed in lower intensity zones. Consider including some moderate to high intensity intervals for cardiovascular benefits.',
          icon: <DirectionsRunIcon />
        });
      }
      
      // HRV insights
      if (hrvValue > 40) {
        insights.push({
          type: 'excellent',
          title: 'Excellent Heart Rate Variability',
          detail: `Your HRV of ${hrvValue}ms indicates excellent autonomic nervous system balance and stress resilience.`,
          icon: <BatteryChargingFullIcon />
        });
      } else if (hrvValue < 20) {
        insights.push({
          type: 'warning',
          title: 'Low Heart Rate Variability',
          detail: `Your HRV of ${hrvValue}ms is lower than optimal, which may indicate stress, fatigue, or incomplete recovery.`,
          icon: <WarningIcon />
        });
      }
      
      // Recovery recommendation based on HRV and training load
      const highIntensityTime = peakZonePercentage;
      let recoveryRecommendation = {
        title: '',
        detail: '',
        type: 'neutral',
        icon: null
      };
      
      if (hrvValue < 15 && highIntensityTime > 10) {
        recoveryRecommendation = {
          title: 'Recovery Day Recommended',
          detail: 'Your heart rate variability is low following high intensity exercise. Focus on rest and recovery today.',
          type: 'warning',
          icon: <NightsStayIcon />
        };
      } else if (hrvValue < 25) {
        recoveryRecommendation = {
          title: 'Light to Moderate Activity',
          detail: 'Your recovery markers suggest moderate fatigue. Stick to light or moderate intensity training today.',
          type: 'neutral',
          icon: <DirectionsRunIcon />
        };
      } else {
        recoveryRecommendation = {
          title: 'Ready for High Intensity',
          detail: 'Your heart rate metrics indicate good recovery. Your body is ready for high intensity training today.',
          type: 'excellent',
          icon: <LocalFireDepartmentIcon />
        };
      }
      
      insights.push(recoveryRecommendation);
      
      // Set the complete insights data
      setDataInsights({
        summary: {
          avgHr: Math.round(avgHr),
          restingHr: Math.round(restingHr),
          maxHr: Math.round(maxHr),
          hrvValue: hrvValue,
          recoveryScore: recoveryScore
        },
        zoneDistribution: zoneDistribution,
        insights: insights
      });
      
      setAiAnalysisLoading(false);
    }, 1500);
  };
  
  // Handle missing or empty data
  if (!data || data.length === 0) {
    console.warn("HeartRateChart received empty data:", data);
    return (
      <Box sx={{ width: "100%", height: 400, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={300} animation="wave" />
        <Typography variant="caption" color="text.secondary">
          No heart rate data available for the selected period
        </Typography>
      </Box>
    );
  }
  
  // Find min/max values for Y axis
  let minValue = 40;
  let maxValue = 160;
  
  processedData.forEach(item => {
    if (item.min && item.min > 0 && item.min < minValue) minValue = item.min;
    if (item.max && item.max > maxValue) maxValue = item.max;
    if (item.avg && item.avg < minValue) minValue = item.avg;
    if (item.avg && item.avg > maxValue) maxValue = item.avg;
  });
  
  // Add padding to Y axis
  minValue = Math.max(30, Math.floor(minValue * 0.9));
  maxValue = Math.ceil(maxValue * 1.1);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%', 
        p: { xs: 2, md: 3 }, 
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)',
        mb: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Visual enhancement - decorative gradient accent at top */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '6px', 
          background: 'linear-gradient(90deg, #3f51b5, #2196f3, #00bcd4)' 
        }} 
      />
      
      {/* Chart/Analysis modes tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ 
          mb: 3, 
          '& .MuiTabs-indicator': { 
            height: 3, 
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(90deg, #3f51b5, #2196f3)'
          },
          mt: 1
        }}
      >
        <Tab 
          icon={<ShowChartIcon />} 
          label="HEART RATE CHART" 
          sx={{ fontWeight: 'bold' }}
          iconPosition="start"
        />
        <Tab 
          icon={<AnalyticsIcon />} 
          label="SMART ANALYSIS" 
          sx={{ fontWeight: 'bold' }}
          iconPosition="start"
        />
        <Tab 
          icon={<CompareIcon />} 
          label="COMPARE SOURCES" 
          sx={{ fontWeight: 'bold', display: Object.values(availableSources).filter(Boolean).length > 1 ? 'flex' : 'none' }}
          iconPosition="start"
          onClick={() => setCompareMode(true)}
        />
        <Tab 
          icon={<DevicesIcon />} 
          label="DATA SOURCES" 
          sx={{ fontWeight: 'bold' }}
          iconPosition="start"
          onClick={() => setDiagnosticsOpen(true)}
        />
      </Tabs>
      
      {/* Source comparison badges - only show when multiple sources are available */}
      {Object.values(availableSources).filter(Boolean).length > 1 && (
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mb: 2, 
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography variant="caption" color="text.secondary" fontWeight="medium">
            Available Data Sources:
          </Typography>
          
          {availableSources.fitbit && (
            <Chip
              icon={<FitnessCenterIcon fontSize="small" />}
              label="Fitbit"
              size="small"
              color={dataSource === 'fitbit' ? 'primary' : 'default'}
              variant={dataSource === 'fitbit' ? 'filled' : 'outlined'}
              onClick={() => onDataSourceChange('fitbit')}
              sx={{ borderRadius: '16px' }}
            />
          )}
          
          {availableSources.googleFit && (
            <Chip
              icon={<GoogleIcon fontSize="small" />}
              label="Google Fit"
              size="small"
              color={dataSource === 'googleFit' ? 'primary' : 'default'}
              variant={dataSource === 'googleFit' ? 'filled' : 'outlined'}
              onClick={() => onDataSourceChange('googleFit')}
              sx={{ borderRadius: '16px' }}
            />
          )}
          
          {availableSources.appleHealth && (
            <Chip
              icon={<AppleIcon fontSize="small" />}
              label="Apple Health"
              size="small"
              color={dataSource === 'appleHealth' ? 'primary' : 'default'}
              variant={dataSource === 'appleHealth' ? 'filled' : 'outlined'}
              onClick={() => onDataSourceChange('appleHealth')}
              sx={{ borderRadius: '16px' }}
            />
          )}
          
          <Chip
            icon={<Psychology fontSize="small" />}
            label="Auto-Select Best"
            size="small"
            color={dataSource === 'auto' ? 'primary' : 'default'}
            variant={dataSource === 'auto' ? 'filled' : 'outlined'}
            onClick={() => onDataSourceChange('auto')}
            sx={{ borderRadius: '16px' }}
          />
          
          <Chip
            icon={<MergeTypeIcon fontSize="small" />}
            label="Combined Data"
            size="small"
            color={dataSource === 'combined' ? 'primary' : 'default'}
            variant={dataSource === 'combined' ? 'filled' : 'outlined'}
            onClick={() => onDataSourceChange('combined')}
            sx={{ borderRadius: '16px' }}
          />
          
          <Tooltip title="Compare data from different sources">
            <FormControlLabel
              control={
                <Switch
                  checked={compareMode}
                  onChange={(e) => setCompareMode(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="caption">Compare</Typography>}
              sx={{ ml: 1 }}
            />
          </Tooltip>
        </Box>
      )}
      
      {/* Chart View Tab */}
      {activeTab === 0 && (
        <>
          {/* Header with current heart rate */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: { xs: 2, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HeartbeatAnimation bpm={currentHeartRate} size="large" />
              
              {/* Zone information */}
              {currentHeartRate > 0 && (
                <Box 
                  sx={{ 
                    ml: 2,
                    display: { xs: 'none', md: 'block' },
                    bgcolor: alpha(getHeartRateZone(currentHeartRate)?.color || theme.palette.primary.main, 0.1),
                    p: 1,
                    px: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(getHeartRateZone(currentHeartRate)?.color || theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getHeartRateZone(currentHeartRate)?.icon}
                    {getHeartRateZone(currentHeartRate)?.name} Zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getHeartRateZone(currentHeartRate)?.description}
                  </Typography>
                </Box>
              )}
              
              {/* Diagnostic button - subtle and discreet */}
              <IconButton 
                size="small" 
                onClick={() => setDiagnosticsOpen(true)}
                sx={{ 
                  ml: 2, 
                  opacity: 0.4, 
                  '&:hover': { opacity: 1 },
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
                title="Open diagnostics console"
              >
                <TuneIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mt: { xs: 2, md: 0 } }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  label="Chart Type"
                  onChange={(e) => setChartType(e.target.value)}
                  size="small"
                >
                  <MenuItem value="area" sx={{ display: 'flex', gap: 1 }}>
                    <ShowChartIcon fontSize="small" /> Area Chart
                  </MenuItem>
                  <MenuItem value="line" sx={{ display: 'flex', gap: 1 }}>
                    <TimelineIcon fontSize="small" /> Line Chart
                  </MenuItem>
                  <MenuItem value="radial" sx={{ display: 'flex', gap: 1 }}>
                    <DonutLargeIcon fontSize="small" /> Radial Chart
                  </MenuItem>
                  <MenuItem value="scatter" sx={{ display: 'flex', gap: 1 }}>
                    <BubbleChartIcon fontSize="small" /> Scatter Plot
                  </MenuItem>
                  <MenuItem value="bar" sx={{ display: 'flex', gap: 1 }}>
                    <BarChartIcon fontSize="small" /> Bar Chart
                  </MenuItem>
                  <MenuItem value="heatmap" sx={{ display: 'flex', gap: 1 }}>
                    <GridOnIcon fontSize="small" /> Heat Map
                  </MenuItem>
                  {Object.values(availableSources).filter(Boolean).length > 1 && (
                    <MenuItem value="radar" sx={{ display: 'flex', gap: 1 }}>
                      <RadarIcon fontSize="small" /> Radar Chart
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel>Resolution</InputLabel>
                <Select
                  value={resolution}
                  label="Resolution"
                  onChange={(e) => setResolution(e.target.value)}
                  size="small"
                >
                  <MenuItem value="low" sx={{ display: 'flex', gap: 1 }}>
                    <StraightenIcon fontSize="small" /> Low
                  </MenuItem>
                  <MenuItem value="medium" sx={{ display: 'flex', gap: 1 }}>
                    <StraightenIcon fontSize="small" /> Medium
                  </MenuItem>
                  <MenuItem value="high" sx={{ display: 'flex', gap: 1 }}>
                    <StraightenIcon fontSize="small" /> High
                  </MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Show min/max range">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showRange}
                        onChange={(e) => setShowRange(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Range"
                    sx={{ m: 0 }}
                  />
                </Tooltip>
              
                <Tooltip title="Show heart rate zones">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={zoneView}
                        onChange={(e) => setZoneView(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Zones"
                    sx={{ m: 0 }}
                  />
                </Tooltip>
              </Box>
              
              {compareMode && (
                <Chip 
                  label="Comparison Mode" 
                  color="secondary" 
                  size="small"
                  onDelete={() => setCompareMode(false)}
                  sx={{ fontWeight: 'medium' }}
                />
              )}
            </Stack>
          </Box>
          
          {/* Heart rate zones legend */}
          {zoneView && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {HR_ZONES.map((zone) => (
                <Chip
                  key={zone.name}
                  icon={zone.icon}
                  label={`${zone.name}: ${zone.min}-${zone.max} BPM`}
                  size="small"
                  sx={{ 
                    background: zone.gradient,
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-label': { px: 1.5 }
                  }}
                />
              ))}
            </Box>
          )}
        
          {/* Main chart container */}
          <Box sx={{ height: 400, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                // Common chart gradient definitions
                const chartDefs = (
                  <defs>
                    {/* Base gradients */}
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3f51b5" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9800" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.3}/>
                    </linearGradient>
                    
                    {/* Zone-specific gradients */}
                    <linearGradient id="colorRest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3f51b5" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorFatBurn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196f3" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorCardio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009688" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#009688" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff9800" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorExtreme" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f44336" stopOpacity={0.2}/>
                    </linearGradient>
                    
                    {/* Data source specific gradients */}
                    <linearGradient id="colorFitbit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorGoogleFit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAppleHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f44336" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                );
                
                // Common reference areas for heart rate zones
                const renderZoneAreas = () => zoneView && HR_ZONES.map((zone) => (
                  <ReferenceArea 
                    key={zone.name}
                    y1={zone.min} 
                    y2={zone.max} 
                    fill={zone.color} 
                    fillOpacity={0.1} 
                    stroke="none"
                    label={{ 
                      value: zone.name, 
                      position: 'insideLeft',
                      fill: zone.color,
                      fontSize: 10 
                    }}
                  />
                ));
                
                // Common brush component
                const renderBrush = () => (
                  <Brush 
                    dataKey={period === 'day' ? "time" : "date"} 
                    height={30} 
                    stroke="#3f51b5" 
                    y={370}
                    fill="#f5f5f5"
                    travellerWidth={10}
                    startIndex={Math.max(0, processedData.length - 60)}
                  />
                );
                
                // Heart rate areas for zone view
                const renderZoneAreas2 = () => (
                  <>
                    <Area
                      type="monotone"
                      dataKey="rest"
                      stackId="1"
                      stroke={HR_ZONES[0].color}
                      fill="url(#colorRest)"
                      isAnimationActive={false}
                      name="Rest"
                    />
                    <Area
                      type="monotone"
                      dataKey="fatBurn"
                      stackId="1"
                      stroke={HR_ZONES[1].color}
                      fill="url(#colorFatBurn)"
                      isAnimationActive={false}
                      name="Fat Burn"
                    />
                    <Area
                      type="monotone"
                      dataKey="cardio"
                      stackId="1"
                      stroke={HR_ZONES[2].color}
                      fill="url(#colorCardio)"
                      isAnimationActive={false}
                      name="Cardio"
                    />
                    <Area
                      type="monotone"
                      dataKey="peak"
                      stackId="1"
                      stroke={HR_ZONES[3].color}
                      fill="url(#colorPeak)"
                      isAnimationActive={false}
                      name="Peak"
                    />
                    <Area
                      type="monotone"
                      dataKey="extreme"
                      stackId="1"
                      stroke={HR_ZONES[4].color}
                      fill="url(#colorExtreme)"
                      isAnimationActive={false}
                      name="Extreme"
                    />
                  </>
                );
                
                // Common components for comparison mode
                const renderComparisonSeries = () => {
                  const components = [];
                  
                  if (availableSources.fitbit) {
                    components.push(
                      <Line
                        key="fitbit"
                        type="monotone"
                        dataKey="fitbitAvg"
                        stroke="#1976d2"
                        strokeWidth={2}
                        dot={{ r: 2, strokeWidth: 1, stroke: '#1976d2' }}
                        activeDot={{ r: 5, strokeWidth: 1, stroke: '#fff' }}
                        name="Fitbit"
                        isAnimationActive={false}
                      />
                    );
                    
                    if (showRange) {
                      components.push(
                        <Area
                          key="fitbitRange"
                          type="monotone"
                          dataKey="fitbitMin"
                          stroke="none"
                          fill="none"
                          name=""
                          isAnimationActive={false}
                        />
                      );
                      components.push(
                        <Area
                          key="fitbitMax"
                          type="monotone"
                          dataKey="fitbitMax"
                          stackId="fitbit"
                          stroke="none"
                          fill="#1976d2"
                          fillOpacity={0.1}
                          name=""
                          isAnimationActive={false}
                        />
                      );
                    }
                  }
                  
                  if (availableSources.googleFit) {
                    components.push(
                      <Line
                        key="googleFit"
                        type="monotone"
                        dataKey="googleFitAvg"
                        stroke="#4caf50"
                        strokeWidth={2}
                        dot={{ r: 2, strokeWidth: 1, stroke: '#4caf50' }}
                        activeDot={{ r: 5, strokeWidth: 1, stroke: '#fff' }}
                        name="Google Fit"
                        isAnimationActive={false}
                      />
                    );
                    
                    if (showRange) {
                      components.push(
                        <Area
                          key="googleFitRange"
                          type="monotone"
                          dataKey="googleFitMin"
                          stroke="none"
                          fill="none"
                          name=""
                          isAnimationActive={false}
                        />
                      );
                      components.push(
                        <Area
                          key="googleFitMax"
                          type="monotone"
                          dataKey="googleFitMax"
                          stackId="googleFit"
                          stroke="none"
                          fill="#4caf50"
                          fillOpacity={0.1}
                          name=""
                          isAnimationActive={false}
                        />
                      );
                    }
                  }
                  
                  if (availableSources.appleHealth) {
                    components.push(
                      <Line
                        key="appleHealth"
                        type="monotone"
                        dataKey="appleHealthAvg"
                        stroke="#f44336"
                        strokeWidth={2}
                        dot={{ r: 2, strokeWidth: 1, stroke: '#f44336' }}
                        activeDot={{ r: 5, strokeWidth: 1, stroke: '#fff' }}
                        name="Apple Health"
                        isAnimationActive={false}
                      />
                    );
                    
                    if (showRange) {
                      components.push(
                        <Area
                          key="appleHealthRange"
                          type="monotone"
                          dataKey="appleHealthMin"
                          stroke="none"
                          fill="none"
                          name=""
                          isAnimationActive={false}
                        />
                      );
                      components.push(
                        <Area
                          key="appleHealthMax"
                          type="monotone"
                          dataKey="appleHealthMax"
                          stackId="appleHealth"
                          stroke="none"
                          fill="#f44336"
                          fillOpacity={0.1}
                          name=""
                          isAnimationActive={false}
                        />
                      );
                    }
                  }
                  
                  return components;
                };
                
                // Render specific chart type
                switch (chartType) {
                  case 'area':
                    return (
                      <ComposedChart
                        data={processedData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                      >
                        {chartDefs}
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
                        
                        <XAxis 
                          dataKey={period === 'day' ? "time" : "date"} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }} 
                          tickLine={{ stroke: theme.palette.text.secondary }}
                          axisLine={{ stroke: theme.palette.text.secondary }}
                          padding={{ left: 10, right: 10 }}
                          interval="preserveStartEnd"
                        />
                        
                        <YAxis 
                          domain={[minValue, maxValue]} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.text.secondary }}
                          axisLine={{ stroke: theme.palette.text.secondary }}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />
                        
                        {renderZoneAreas()}
                        
                        {compareMode ? (
                          renderComparisonSeries()
                        ) : zoneView ? (
                          renderZoneAreas2()
                        ) : (
                          <>
                            <Area
                              type="monotone"
                              dataKey="avg"
                              stroke="#3f51b5"
                              strokeWidth={2}
                              fill="url(#colorAvg)"
                              isAnimationActive={false}
                              activeDot={{ 
                                r: 6, 
                                strokeWidth: 1, 
                                stroke: '#fff',
                                fill: props => getHeartRateZone(props.payload.avg)?.color || '#3f51b5'
                              }}
                              name="Heart Rate"
                            />
                            
                            {showRange && (
                              <>
                                <Area
                                  type="monotone"
                                  dataKey="min"
                                  stackId="2"
                                  stroke="#4caf50"
                                  fill="none"
                                  name="Min"
                                  isAnimationActive={false}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="max"
                                  stackId="2"
                                  stroke="#ff9800"
                                  fill="url(#colorRange)"
                                  name="Max"
                                  isAnimationActive={false}
                                />
                              </>
                            )}
                          </>
                        )}
                        
                        {renderBrush()}
                      </ComposedChart>
                    );
                    
                  case 'line':
                    return (
                      <LineChart
                        data={processedData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                      >
                        {chartDefs}
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
                        
                        <XAxis 
                          dataKey={period === 'day' ? "time" : "date"} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }} 
                          tickLine={{ stroke: theme.palette.text.secondary }}
                          axisLine={{ stroke: theme.palette.text.secondary }}
                          padding={{ left: 10, right: 10 }}
                          interval="preserveStartEnd"
                        />
                        
                        <YAxis 
                          domain={[minValue, maxValue]} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.text.secondary }}
                          axisLine={{ stroke: theme.palette.text.secondary }}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" height={36} />
                        
                        {renderZoneAreas()}
                        
                        {compareMode ? (
                          renderComparisonSeries()
                        ) : (
                          <Line
                            type="monotone"
                            dataKey="avg"
                            stroke="#3f51b5"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                            isAnimationActive={false}
                            name="Heart Rate"
                          />
                        )}
                        
                        {renderBrush()}
                      </LineChart>
                    );
                    
                  case 'radial':
                    return (
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="20%" 
                        outerRadius="90%" 
                        barSize={10} 
                        data={[
                          { name: 'Resting', value: 60, fill: HR_ZONES[0].color },
                          { name: 'Fat Burn', value: 70, fill: HR_ZONES[1].color },
                          { name: 'Cardio', value: 85, fill: HR_ZONES[2].color },
                          { name: 'Peak', value: 100, fill: HR_ZONES[3].color },
                          { name: 'Current', value: currentHeartRate, fill: '#3f51b5' },
                          ...Object.entries(availableSources)
                            .filter(([_, isAvailable]) => isAvailable)
                            .map(([source, _], index) => ({
                              name: source === 'fitbit' ? 'Fitbit' : source === 'googleFit' ? 'Google Fit' : 'Apple Health',
                              value: Math.max(currentHeartRate - 5 + index * 3, 40),
                              fill: source === 'fitbit' ? '#1976d2' : source === 'googleFit' ? '#4caf50' : '#f44336'
                            }))
                        ]}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          label={{ 
                            position: 'insideStart', 
                            fill: '#fff', 
                            fontSize: 14
                          }}
                        />
                        <Legend 
                          iconSize={10} 
                          layout="vertical" 
                          verticalAlign="middle" 
                          align="right"
                        />
                        <Tooltip content={<CustomTooltip />} />
                      </RadialBarChart>
                    );
                    
                  case 'scatter':
                    return (
                      <ScatterChart
                        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                      >
                        {chartDefs}
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
                        <XAxis 
                          dataKey={period === 'day' ? "time" : "date"} 
                          type="category"
                          name="Time" 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }} 
                          tickLine={{ stroke: theme.palette.text.secondary }}
                          axisLine={{ stroke: theme.palette.text.secondary }}
                        />
                        <YAxis 
                          dataKey="avg" 
                          name="Heart Rate" 
                          domain={[minValue, maxValue]} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.text.secondary }}
                          axisLine={{ stroke: theme.palette.text.secondary }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {renderZoneAreas()}
                        
                        {compareMode ? (
                          <>
                            {availableSources.fitbit && (
                              <Scatter 
                                name="Fitbit" 
                                data={allSourcesData.fitbit} 
                                fill="#1976d2"
                                line={{ stroke: '#1976d2', strokeWidth: 1 }}
                                lineType="fitting"
                              />
                            )}
                            
                            {availableSources.googleFit && (
                              <Scatter 
                                name="Google Fit" 
                                data={allSourcesData.googleFit} 
                                fill="#4caf50"
                                line={{ stroke: '#4caf50', strokeWidth: 1 }}
                                lineType="fitting"
                              />
                            )}
                            
                            {availableSources.appleHealth && (
                              <Scatter 
                                name="Apple Health" 
                                data={allSourcesData.appleHealth} 
                                fill="#f44336"
                                line={{ stroke: '#f44336', strokeWidth: 1 }}
                                lineType="fitting"
                              />
                            )}
                          </>
                        ) : (
                          <Scatter 
                            name="Heart Rate" 
                            data={processedData} 
                            fill="#3f51b5"
                            line={{ stroke: '#3f51b5', strokeWidth: 1 }}
                            lineType="fitting"
                            shape={(props) => {
                              const { cx, cy } = props;
                              const hr = props.payload.avg || 0;
                              const zone = getHeartRateZone(hr);
                              return (
                                <circle 
                                  cx={cx} 
                                  cy={cy} 
                                  r={4} 
                                  fill={zone?.color || '#3f51b5'} 
                                  stroke="#fff"
                                  strokeWidth={1}
                                />
                              );
                            }}
                          />
                        )}
                        
                        {renderBrush()}
                      </ScatterChart>
                    );
                    
                  case 'bar':
                    return (
                      <BarChart
                        data={processedData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                      >
                        {chartDefs}
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
                        <XAxis 
                          dataKey={period === 'day' ? "time" : "date"}
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                          interval={Math.max(1, Math.ceil(processedData.length / 30))}
                        />
                        <YAxis 
                          domain={[minValue, maxValue]}
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {renderZoneAreas()}
                        
                        {compareMode ? (
                          <>
                            {availableSources.fitbit && (
                              <Bar 
                                dataKey="fitbitAvg" 
                                name="Fitbit" 
                                fill="#1976d2" 
                                barSize={5}
                              />
                            )}
                            
                            {availableSources.googleFit && (
                              <Bar 
                                dataKey="googleFitAvg" 
                                name="Google Fit" 
                                fill="#4caf50" 
                                barSize={5}
                              />
                            )}
                            
                            {availableSources.appleHealth && (
                              <Bar 
                                dataKey="appleHealthAvg" 
                                name="Apple Health" 
                                fill="#f44336" 
                                barSize={5}
                              />
                            )}
                          </>
                        ) : (
                          <Bar 
                            dataKey="avg" 
                            name="Heart Rate" 
                            fill="#3f51b5" 
                            fillOpacity={0.8}
                            barSize={processedData.length > 50 ? 3 : 8}
                          >
                            {processedData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={getHeartRateZone(entry.avg || 0)?.color || '#3f51b5'}
                              />
                            ))}
                          </Bar>
                        )}
                        
                        {renderBrush()}
                      </BarChart>
                    );
                    
                  case 'radar':
                    // Data preparation for radar chart
                    const radarData = HR_ZONES.map(zone => {
                      const item = {
                        zone: zone.name
                      };
                      
                      if (availableSources.fitbit) {
                        const fitbitCount = allSourcesData.fitbit.filter(d => {
                          const hr = d.avg || d.value || 0;
                          return hr >= zone.min && hr < zone.max;
                        }).length;
                        item.fitbit = fitbitCount > 0 ? fitbitCount : 0;
                      }
                      
                      if (availableSources.googleFit) {
                        const googleFitCount = allSourcesData.googleFit.filter(d => {
                          const hr = d.avg || d.value || 0;
                          return hr >= zone.min && hr < zone.max;
                        }).length;
                        item.googleFit = googleFitCount > 0 ? googleFitCount : 0;
                      }
                      
                      if (availableSources.appleHealth) {
                        const appleHealthCount = allSourcesData.appleHealth.filter(d => {
                          const hr = d.avg || d.value || 0;
                          return hr >= zone.min && hr < zone.max;
                        }).length;
                        item.appleHealth = appleHealthCount > 0 ? appleHealthCount : 0;
                      }
                      
                      return item;
                    });
                    
                    return (
                      <RadarChart 
                        cx="50%" 
                        cy="50%" 
                        outerRadius="70%" 
                        width={500} 
                        height={400} 
                        data={radarData}
                      >
                        <PolarGrid stroke="rgba(200,200,200,0.4)" />
                        <PolarAngleAxis dataKey="zone" tick={{ fill: theme.palette.text.secondary }} />
                        <PolarRadiusAxis tick={{ fill: theme.palette.text.secondary }} />
                        
                        {availableSources.fitbit && (
                          <Radar 
                            name="Fitbit" 
                            dataKey="fitbit" 
                            stroke="#1976d2" 
                            fill="#1976d2" 
                            fillOpacity={0.5} 
                          />
                        )}
                        
                        {availableSources.googleFit && (
                          <Radar 
                            name="Google Fit" 
                            dataKey="googleFit" 
                            stroke="#4caf50" 
                            fill="#4caf50" 
                            fillOpacity={0.5} 
                          />
                        )}
                        
                        {availableSources.appleHealth && (
                          <Radar 
                            name="Apple Health" 
                            dataKey="appleHealth" 
                            stroke="#f44336" 
                            fill="#f44336" 
                            fillOpacity={0.5} 
                          />
                        )}
                        
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    );
                    
                  case 'heatmap':
                    // Transform data for heatmap
                    const heatMapData = {};
                    let maxHourValue = 0;
                    
                    // Create a grid of hours x days
                    if (period !== 'day') {
                      processedData.forEach(item => {
                        const date = item.date;
                        const hour = item.time ? parseInt(item.time.split(':')[0]) : 12;
                        const hr = item.avg || item.value || 0;
                        
                        if (!heatMapData[date]) {
                          heatMapData[date] = {};
                        }
                        
                        if (!heatMapData[date][hour]) {
                          heatMapData[date][hour] = hr;
                          maxHourValue = Math.max(maxHourValue, hr);
                        }
                      });
                    }
                    
                    // Convert to Treemap format
                    const heatmapTreeData = {
                      name: 'Heart Rate',
                      children: Object.keys(heatMapData).map(date => ({
                        name: date,
                        children: Object.keys(heatMapData[date]).map(hour => ({
                          name: `${date} ${hour}:00`,
                          size: heatMapData[date][hour],
                          hour: parseInt(hour)
                        }))
                      }))
                    };
                    
                    return (
                      <Treemap
                        data={heatmapTreeData}
                        dataKey="size"
                        aspectRatio={4/3}
                        stroke="#fff"
                        content={({ root, depth, x, y, width, height, index, payload, rank, name }) => {
                          if (depth === 1) return null; // Skip the date level
                          const hr = payload.size;
                          const hour = payload.hour;
                          const zone = getHeartRateZone(hr);
                          
                          return (
                            <g>
                              <rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                style={{
                                  fill: zone?.color || '#3f51b5',
                                  stroke: '#fff',
                                  strokeWidth: 2,
                                  strokeOpacity: 1,
                                  fillOpacity: 0.3 + (hr / maxHourValue) * 0.7
                                }}
                              />
                              {width > 30 && height > 30 && (
                                <>
                                  <text
                                    x={x + width / 2}
                                    y={y + height / 2 - 8}
                                    textAnchor="middle"
                                    fill="#000"
                                    fontSize={14}
                                    fontWeight="bold"
                                  >
                                    {hr.toFixed(0)}
                                  </text>
                                  <text
                                    x={x + width / 2}
                                    y={y + height / 2 + 8}
                                    textAnchor="middle"
                                    fill="#000"
                                    fontSize={10}
                                  >
                                    {`${hour}:00`}
                                  </text>
                                </>
                              )}
                            </g>
                          );
                        }}
                      />
                    );
                    
                  default:
                    // Default to area chart
                    return (
                      <ComposedChart
                        data={processedData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                      >
                        {chartDefs}
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
                        <XAxis 
                          dataKey={period === 'day' ? "time" : "date"} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        />
                        <YAxis 
                          domain={[minValue, maxValue]} 
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        {renderZoneAreas()}
                        
                        <Area
                          type="monotone"
                          dataKey="avg"
                          stroke="#3f51b5"
                          strokeWidth={2}
                          fill="url(#colorAvg)"
                          isAnimationActive={false}
                          activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                          name="Heart Rate"
                        />
                        
                        {renderBrush()}
                      </ComposedChart>
                    );
                }
              })()}
            </ResponsiveContainer>
          </Box>
          
          {/* Heart rate zone summary */}
          {zoneView && period === 'day' && (
            <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {HR_ZONES.map(zone => {
                // Calculate time spent in each zone
                const pointsInZone = processedData.filter(point => {
                  const hr = point.avg || point.value || 0;
                  return hr >= zone.min && hr < zone.max;
                });
                
                const percentInZone = (pointsInZone.length / processedData.length) * 100;
                
                return (
                  <Paper
                    key={zone.name}
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(zone.color, 0.05),
                      border: `1px solid ${zone.color}`,
                      minWidth: 120,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ 
                      color: zone.color, 
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5
                    }}>
                      {zone.icon} {zone.name}
                    </Typography>
                    <Typography variant="h6" sx={{ my: 1 }}>
                      {Math.round(percentInZone)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {zone.min}-{zone.max} BPM
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          )}
        </>
      )}
      
      {/* Analysis Tab - AI-powered insights */}
      {activeTab === 1 && (
        <HeartRateAnalysisPanel data={data} period={period} />
      )}
      
      {/* Diagnostics Dialog */}
      <DiagnosticsDialog 
        open={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        tokenScopes={tokenScopes}
        isAuthenticated={isAuthenticated}
        date={date}
        period={period}
        dataQualityScores={dataQualityScores}
        availableSources={availableSources}
      />
    </Paper>
  );
};

export default HeartRateChart;