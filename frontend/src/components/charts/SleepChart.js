import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, addHours, isSameDay, subDays, differenceInMinutes } from 'date-fns';
import { 
  Box, 
  Typography, 
  Button,
  IconButton,
  useTheme,
  alpha,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Fade,
  CircularProgress,
  Zoom,
  Badge
} from '@mui/material';

// Icons
import BedtimeIcon from '@mui/icons-material/Bedtime';
import HotelIcon from '@mui/icons-material/Hotel';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WavesIcon from '@mui/icons-material/Waves';
import TuneIcon from '@mui/icons-material/Tune';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TimerIcon from '@mui/icons-material/Timer';
import DoneIcon from '@mui/icons-material/Done';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import Battery90Icon from '@mui/icons-material/Battery90';
import Battery60Icon from '@mui/icons-material/Battery60';
import Battery30Icon from '@mui/icons-material/Battery30';
import SpeedIcon from '@mui/icons-material/Speed';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Common components
import { AnimatedIcon, DiagnosticsDialog } from '../common';
import SleepAnalysisPanel from './sleep/SleepAnalysisPanel';

// Sleep quality levels with colors
const SLEEP_QUALITY_LEVELS = [
  { 
    name: 'Excellent', 
    min: 90, 
    max: 100, 
    color: '#3f51b5', 
    gradient: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
    description: 'Optimal sleep quality and duration',
    icon: <Battery90Icon />
  },
  { 
    name: 'Good', 
    min: 80, 
    max: 89, 
    color: '#2196f3', 
    gradient: 'linear-gradient(135deg, #2196f3 0%, #4dabf5 100%)',
    description: 'Good sleep quality with proper sleep cycles',
    icon: <Battery90Icon />
  },
  { 
    name: 'Fair', 
    min: 70, 
    max: 79, 
    color: '#009688', 
    gradient: 'linear-gradient(135deg, #009688 0%, #4db6ac 100%)',
    description: 'Average sleep quality, may need improvement',
    icon: <Battery60Icon />
  },
  { 
    name: 'Poor', 
    min: 50, 
    max: 69, 
    color: '#ff9800', 
    gradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
    description: 'Below average sleep quality, needs attention',
    icon: <Battery30Icon />
  },
  { 
    name: 'Very Poor', 
    min: 0, 
    max: 49, 
    color: '#f44336', 
    gradient: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
    description: 'Insufficient or disrupted sleep, needs intervention',
    icon: <Battery30Icon />
  }
];

// Helper function to get sleep quality level
const getSleepQualityLevel = (score) => {
  if (!score) return null;
  return SLEEP_QUALITY_LEVELS.find(level => score >= level.min && score <= level.max);
};

// Format duration as hours and minutes
const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format time as AM/PM
const formatTime = (timeString) => {
  if (!timeString) return '';
  if (timeString.includes(':')) return timeString;
  
  // Handle hour-only format
  const hour = parseInt(timeString);
  if (isNaN(hour)) return '';
  
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

// Calculate sleep stage colors
const getSleepStageColors = (theme) => {
  return {
    deep: {
      main: '#3f51b5',
      light: alpha('#3f51b5', 0.3),
      dark: '#303f9f',
      contrastText: '#ffffff'
    },
    rem: {
      main: '#03a9f4',
      light: alpha('#03a9f4', 0.3),
      dark: '#0288d1',
      contrastText: '#ffffff'
    },
    light: {
      main: '#9c27b0',
      light: alpha('#9c27b0', 0.3),
      dark: '#7b1fa2',
      contrastText: '#ffffff'
    },
    awake: {
      main: '#ff9800',
      light: alpha('#ff9800', 0.3),
      dark: '#f57c00',
      contrastText: '#ffffff'
    },
    asleep: {
      main: '#4a148c',
      light: alpha('#4a148c', 0.3),
      dark: '#311b92',
      contrastText: '#ffffff'
    }
  };
};

/**
 * SleepChart Component - Elegant modern visualization of sleep data
 */
const SleepChart = ({
  data,
  fitbitData,
  googleFitData,
  appleHealthData,
  dataSource = 'auto',
  period = 'day',
  tokenScopes = [],
  isAuthenticated = false,
  date = new Date(),
  availableSources = { fitbit: false, googleFit: false, appleHealth: false },
  onDataSourceChange
}) => {
  const theme = useTheme();
  const sleepStageColors = useMemo(() => getSleepStageColors(theme), [theme]);
  const canvasRef = useRef(null);
  
  // State
  const [viewMode, setViewMode] = useState('stages'); // 'stages', 'timeline', 'cycles', 'insights'
  const [animation, setAnimation] = useState(false);
  const [processedData, setProcessedData] = useState([]);
  const [sleepScore, setSleepScore] = useState(0);
  const [sleepMetrics, setSleepMetrics] = useState({
    duration: 0,
    efficiency: 0,
    deepSleepMinutes: 0,
    remSleepMinutes: 0,
    lightSleepMinutes: 0,
    deepSleepPercentage: 0,
    remSleepPercentage: 0,
    lightSleepPercentage: 0,
    awakeDuringNight: 0,
    startTime: '',
    endTime: '',
    bedtimeConsistency: 0
  });
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sleepQualityLevel, setSleepQualityLevel] = useState(null);
  const [dataQualityScores, setDataQualityScores] = useState({
    fitbit: 0,
    googleFit: 0,
    appleHealth: 0
  });

  // Process data when parameters change
  useEffect(() => {
    console.log("Processing sleep data for new visualization...");
    setIsLoading(true);
    
    // Calculate data quality scores
    const qualityScores = {
      fitbit: calculateDataQualityScore(fitbitData),
      googleFit: calculateDataQualityScore(googleFitData),
      appleHealth: calculateDataQualityScore(appleHealthData)
    };
    setDataQualityScores(qualityScores);
    
    // Select the appropriate data source
    let sourceData = selectDataSource();
    
    // Process the data
    if (sourceData && sourceData.length > 0) {
      // Process and transform data
      const enhancedData = enhanceSleepData(sourceData);
      setProcessedData(enhancedData);
      
      // Calculate metrics
      const metrics = calculateSleepMetrics(enhancedData);
      setSleepMetrics(metrics);
      setSleepScore(metrics.sleepScore);
      
      // Determine sleep quality level
      const qualityLevel = getSleepQualityLevel(metrics.sleepScore);
      setSleepQualityLevel(qualityLevel);
      
      // Trigger animation after data is loaded
      setTimeout(() => {
        setAnimation(true);
        setIsLoading(false);
      }, 300);
      
      // Draw sleep graph if in timeline mode
      if (viewMode === 'timeline' && enhancedData.length > 0) {
        setTimeout(() => {
          drawSleepTimeline(enhancedData);
        }, 500);
      }
    } else {
      // Handle empty data case
      setProcessedData([]);
      setSleepMetrics({
        duration: 0,
        efficiency: 0,
        deepSleepMinutes: 0,
        remSleepMinutes: 0,
        lightSleepMinutes: 0,
        deepSleepPercentage: 0,
        remSleepPercentage: 0,
        lightSleepPercentage: 0,
        awakeDuringNight: 0,
        startTime: '',
        endTime: '',
        bedtimeConsistency: 0,
        sleepScore: 0
      });
      setSleepScore(0);
      setSleepQualityLevel(null);
      setIsLoading(false);
    }
    
  }, [data, googleFitData, fitbitData, appleHealthData, dataSource, period, date, viewMode]);
  
  // Redraw sleep timeline when canvas size changes
  useEffect(() => {
    if (viewMode === 'timeline' && processedData.length > 0 && canvasRef.current) {
      const handleResize = () => {
        drawSleepTimeline(processedData);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [viewMode, processedData, canvasRef.current]);
  
  // Select the appropriate data source based on availability and quality
  const selectDataSource = () => {
    // If no data at all, return empty array
    if (!data || data.length === 0) {
      if (!fitbitData && !googleFitData && !appleHealthData) {
        console.log("No sleep data available from any source");
        return [];
      }
    }
    
    // Use the explicitly requested data source if available
    if (dataSource === 'fitbit' && fitbitData && fitbitData.length > 0) {
      console.log("Using Fitbit data as requested");
      return fitbitData;
    } else if (dataSource === 'googleFit' && googleFitData && googleFitData.length > 0) {
      console.log("Using Google Fit data as requested");
      return googleFitData;
    } else if (dataSource === 'appleHealth' && appleHealthData && appleHealthData.length > 0) {
      console.log("Using Apple Health data as requested");
      return appleHealthData;
    } 
    
    // Auto mode - select the best source
    if (dataSource === 'auto' || !dataSource) {
      // If we already have data in main data prop, use it
      if (data && data.length > 0) {
        console.log("Using main data array");
        return data;
      }
      
      // Prioritize Google Fit data if available
      if (googleFitData && googleFitData.length > 0) {
        console.log("Auto-selecting Google Fit data");
        return googleFitData;
      }
      
      // If not, use Fitbit data if available
      if (fitbitData && fitbitData.length > 0) {
        console.log("Auto-selecting Fitbit data");
        return fitbitData;
      }
      
      // Finally, try Apple Health data
      if (appleHealthData && appleHealthData.length > 0) {
        console.log("Auto-selecting Apple Health data");
        return appleHealthData;
      }
    }
    
    // Fallback to the main data prop if nothing else worked
    return data || [];
  };
  
  // Calculate data quality score
  const calculateDataQualityScore = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    
    // Score based on quantity (30%)
    const quantityScore = Math.min(100, (data.length / 10) * 100) * 0.3;
    
    // Score based on completeness (40%)
    let completenessScore = 0;
    const keysToCheck = ['deepSleepMinutes', 'remSleepMinutes', 'lightSleepMinutes', 'durationMinutes', 'efficiency'];
    const completeItems = data.filter(item => 
      keysToCheck.every(key => item[key] !== undefined && item[key] !== null)
    );
    completenessScore = (completeItems.length / data.length) * 100 * 0.4;
    
    // Score based on consistency (30%)
    let consistencyScore = 0;
    if (data.length > 1) {
      const hasConsistentDates = data.every(item => item.date);
      consistencyScore = hasConsistentDates ? 30 : 15;
    }
    
    return Math.round(quantityScore + completenessScore + consistencyScore);
  };
  
  // Process and enhance sleep data for visualization
  const enhanceSleepData = (sourceData) => {
    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
      return [];
    }
    
    // Filter data based on selected period if necessary
    let filteredData = sourceData;
    
    // Processing for different period types
    if (period === 'day' && sourceData.length > 1) {
      // For day view, find the data point that matches the selected date
      const dateStr = format(date, 'yyyy-MM-dd');
      filteredData = sourceData.filter(item => {
        const itemDate = item.date || 
                         (item.timestamp ? format(new Date(item.timestamp * 1000), 'yyyy-MM-dd') : null);
        return itemDate === dateStr;
      });
      
      // If no exact match found, use the most recent data point
      if (filteredData.length === 0) {
        console.log("No exact date match found, using most recent data");
        filteredData = [sourceData[sourceData.length - 1]];
      }
    }
    
    // Map and enhance each data point
    return filteredData.map(item => {
      try {
        // Use existing fields or calculate them if missing
        const totalMinutes = item.durationMinutes || 0;
        
        // Calculate sleep stage percentages
        const deepPercent = item.deepSleepPercentage || 
                          (item.deepSleepMinutes && totalMinutes ? 
                           Math.round((item.deepSleepMinutes / totalMinutes) * 100) : 20);
                          
        const remPercent = item.remSleepPercentage || 
                          (item.remSleepMinutes && totalMinutes ? 
                           Math.round((item.remSleepMinutes / totalMinutes) * 100) : 25);
                           
        const lightPercent = item.lightSleepPercentage || 
                            (item.lightSleepMinutes && totalMinutes ? 
                             Math.round((item.lightSleepMinutes / totalMinutes) * 100) : 55);
        
        // Ensure all required fields exist
        return {
          ...item,
          date: item.date || format(new Date(), 'yyyy-MM-dd'),
          formattedDate: format(parseISO(item.date) || new Date(), 'EEE, MMM d'),
          startTime: item.startTime || '22:00',
          endTime: item.endTime || '06:00',
          durationMinutes: totalMinutes,
          durationHours: parseFloat((totalMinutes / 60).toFixed(1)),
          efficiency: item.efficiency || 85,
          score: item.score || 75,
          deepSleepMinutes: item.deepSleepMinutes || Math.round(totalMinutes * (deepPercent / 100)),
          remSleepMinutes: item.remSleepMinutes || Math.round(totalMinutes * (remPercent / 100)),
          lightSleepMinutes: item.lightSleepMinutes || Math.round(totalMinutes * (lightPercent / 100)),
          awakeDuringNight: item.awakeDuringNight || 0,
          deepSleepPercentage: deepPercent,
          remSleepPercentage: remPercent,
          lightSleepPercentage: lightPercent,
          sleepCycles: item.sleepCycles || Math.floor(totalMinutes / 90),
          // For display
          sleepDurationFormatted: formatDuration(totalMinutes)
        };
      } catch (error) {
        console.error('Error enhancing sleep data:', error);
        return item;
      }
    });
  };
  
  // Calculate sleep metrics from processed data
  const calculateSleepMetrics = (data) => {
    if (!data || data.length === 0) {
      return {
        duration: 0,
        efficiency: 0,
        deepSleepMinutes: 0,
        remSleepMinutes: 0,
        lightSleepMinutes: 0,
        deepSleepPercentage: 0,
        remSleepPercentage: 0,
        lightSleepPercentage: 0,
        awakeDuringNight: 0,
        startTime: '',
        endTime: '',
        bedtimeConsistency: 0,
        sleepScore: 0
      };
    }
    
    // For day view, use the single day's data
    if (period === 'day' || data.length === 1) {
      const dayData = data[0];
      
      // If we have a sleep score, use it
      const sleepScore = dayData.score || 
                         calculateSleepScoreFromMetrics(
                           dayData.durationMinutes, 
                           dayData.efficiency, 
                           dayData.deepSleepPercentage
                         );
                         
      return {
        duration: dayData.durationMinutes || 0,
        efficiency: dayData.efficiency || 0,
        deepSleepMinutes: dayData.deepSleepMinutes || 0,
        remSleepMinutes: dayData.remSleepMinutes || 0,
        lightSleepMinutes: dayData.lightSleepMinutes || 0,
        deepSleepPercentage: dayData.deepSleepPercentage || 0,
        remSleepPercentage: dayData.remSleepPercentage || 0,
        lightSleepPercentage: dayData.lightSleepPercentage || 0,
        awakeDuringNight: dayData.awakeDuringNight || 0,
        startTime: dayData.startTime || '',
        endTime: dayData.endTime || '',
        bedtimeConsistency: calculateBedtimeConsistency([dayData]),
        sleepScore: sleepScore
      };
    }
    
    // For week/month view, calculate averages
    const validItems = data.filter(item => item.durationMinutes > 0);
    const count = validItems.length || 1;
    
    // Calculate averages
    const avgDuration = Math.round(
      validItems.reduce((sum, item) => sum + (item.durationMinutes || 0), 0) / count
    );
    
    const avgEfficiency = Math.round(
      validItems.reduce((sum, item) => sum + (item.efficiency || 0), 0) / count
    );
    
    const avgDeepSleep = Math.round(
      validItems.reduce((sum, item) => sum + (item.deepSleepMinutes || 0), 0) / count
    );
    
    const avgRemSleep = Math.round(
      validItems.reduce((sum, item) => sum + (item.remSleepMinutes || 0), 0) / count
    );
    
    const avgLightSleep = Math.round(
      validItems.reduce((sum, item) => sum + (item.lightSleepMinutes || 0), 0) / count
    );
    
    const avgDeepPercentage = Math.round(
      validItems.reduce((sum, item) => sum + (item.deepSleepPercentage || 0), 0) / count
    );
    
    const avgRemPercentage = Math.round(
      validItems.reduce((sum, item) => sum + (item.remSleepPercentage || 0), 0) / count
    );
    
    const avgLightPercentage = Math.round(
      validItems.reduce((sum, item) => sum + (item.lightSleepPercentage || 0), 0) / count
    );
    
    const avgAwake = Math.round(
      validItems.reduce((sum, item) => sum + (item.awakeDuringNight || 0), 0) / count
    );
    
    // Calculate sleep score if not available
    const avgScoreFromItems = validItems.filter(item => item.score > 0).length > 0 ?
      Math.round(
        validItems.reduce((sum, item) => sum + (item.score || 0), 0) / 
        validItems.filter(item => item.score > 0).length
      ) : 0;
    
    const calculatedScore = avgScoreFromItems || 
                           calculateSleepScoreFromMetrics(
                             avgDuration, 
                             avgEfficiency, 
                             avgDeepPercentage
                           );
    
    // Calculate bedtime consistency
    const bedtimeConsistency = calculateBedtimeConsistency(validItems);
    
    return {
      duration: avgDuration,
      efficiency: avgEfficiency,
      deepSleepMinutes: avgDeepSleep,
      remSleepMinutes: avgRemSleep,
      lightSleepMinutes: avgLightSleep,
      deepSleepPercentage: avgDeepPercentage,
      remSleepPercentage: avgRemPercentage,
      lightSleepPercentage: avgLightPercentage,
      awakeDuringNight: avgAwake,
      startTime: validItems.length > 0 ? validItems[0].startTime : '',
      endTime: validItems.length > 0 ? validItems[0].endTime : '',
      bedtimeConsistency: bedtimeConsistency,
      sleepScore: calculatedScore
    };
  };
  
  // Calculate a sleep score from metrics if not provided
  const calculateSleepScoreFromMetrics = (duration, efficiency, deepSleepPercent) => {
    // Weight factors
    const durationWeight = 0.4;
    const efficiencyWeight = 0.3;
    const deepSleepWeight = 0.3;
    
    // Calculate duration score (0-100)
    // Optimal sleep: 7-9 hours (420-540 minutes)
    let durationScore = 0;
    if (duration >= 420 && duration <= 540) {
      durationScore = 100; // Optimal range
    } else if (duration >= 360 && duration < 420) {
      durationScore = 80; // Slightly below optimal
    } else if (duration > 540 && duration <= 600) {
      durationScore = 80; // Slightly above optimal
    } else if (duration >= 300 && duration < 360) {
      durationScore = 60; // Below recommended
    } else if (duration > 600) {
      durationScore = 60; // Too much sleep
    } else if (duration < 300) {
      durationScore = 40; // Significantly below recommended
    }
    
    // Calculate efficiency score
    // Efficiency is already 0-100
    const efficiencyScore = efficiency;
    
    // Calculate deep sleep score
    // Ideal deep sleep: 20-25% of total sleep
    let deepSleepScore = 0;
    if (deepSleepPercent >= 20 && deepSleepPercent <= 25) {
      deepSleepScore = 100; // Optimal range
    } else if (deepSleepPercent >= 15 && deepSleepPercent < 20) {
      deepSleepScore = 80; // Slightly below optimal
    } else if (deepSleepPercent > 25 && deepSleepPercent <= 30) {
      deepSleepScore = 80; // Slightly above optimal
    } else if (deepSleepPercent >= 10 && deepSleepPercent < 15) {
      deepSleepScore = 60; // Below recommended
    } else if (deepSleepPercent > 30) {
      deepSleepScore = 60; // Too much deep sleep
    } else if (deepSleepPercent < 10) {
      deepSleepScore = 40; // Significantly below recommended
    }
    
    // Calculate weighted score
    const weightedScore = (durationScore * durationWeight) + 
                         (efficiencyScore * efficiencyWeight) + 
                         (deepSleepScore * deepSleepWeight);
    
    return Math.round(weightedScore);
  };
  
  // Calculate bedtime consistency (0-100)
  const calculateBedtimeConsistency = (data) => {
    if (!data || data.length < 2) return 80; // Default consistency if not enough data
    
    // Extract bedtimes
    const bedtimes = data
      .filter(item => item.startTime)
      .map(item => {
        // Parse the bedtime
        let hours, minutes;
        if (item.startTime.includes(':')) {
          [hours, minutes] = item.startTime.split(':').map(Number);
        } else {
          hours = parseInt(item.startTime);
          minutes = 0;
        }
        
        // Handle bedtimes that are actually in the early hours of the next day
        if (hours < 12) hours += 24;
        
        return hours * 60 + minutes;
      });
    
    if (bedtimes.length < 2) return 80;
    
    // Calculate standard deviation
    const average = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
    const squareDiffs = bedtimes.map(time => Math.pow(time - average, 2));
    const variance = squareDiffs.reduce((sum, diff) => sum + diff, 0) / bedtimes.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to a 0-100 score (lower deviation = higher consistency)
    // A standard deviation of 0 minutes would be perfect (100)
    // A standard deviation of 60 minutes or more would be poor (0)
    const consistencyScore = Math.max(0, 100 - (stdDev / 0.6));
    
    return Math.round(consistencyScore);
  };
  
  // Draw sleep timeline on canvas
  const drawSleepTimeline = (data) => {
    if (!canvasRef.current || !data || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get canvas dimensions based on parent container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If no stage data, return
    if (!data[0].deepSleepMinutes && !data[0].lightSleepMinutes && !data[0].remSleepMinutes) {
      ctx.font = '16px Arial';
      ctx.fillStyle = theme.palette.text.secondary;
      ctx.fillText('No detailed sleep stage data available', canvas.width / 2 - 150, canvas.height / 2);
      return;
    }
    
    // Set up timeline parameters
    const dayData = data[0];
    const marginX = 50;
    const marginY = 30;
    const timelineWidth = canvas.width - (marginX * 2);
    const timelineHeight = canvas.height - (marginY * 2);
    
    // Parse start and end times
    let startHour = 22; // Default to 10 PM
    let endHour = 8;    // Default to 8 AM
    
    if (dayData.startTime) {
      try {
        const startTimeParts = dayData.startTime.split(':');
        startHour = parseInt(startTimeParts[0]);
      } catch (e) {
        console.error('Error parsing start time:', e);
      }
    }
    
    if (dayData.endTime) {
      try {
        const endTimeParts = dayData.endTime.split(':');
        endHour = parseInt(endTimeParts[0]);
      } catch (e) {
        console.error('Error parsing end time:', e);
      }
    }
    
    // Adjust for 24-hour format and ensure end is after start
    if (startHour > 12) startHour -= 24;
    if (endHour < startHour) endHour += 24;
    
    const hoursTotal = endHour - startHour;
    const pixelsPerHour = timelineWidth / hoursTotal;
    
    // Draw timeline axis
    ctx.beginPath();
    ctx.moveTo(marginX, canvas.height - marginY);
    ctx.lineTo(marginX + timelineWidth, canvas.height - marginY);
    ctx.strokeStyle = theme.palette.divider;
    ctx.stroke();
    
    // Draw hour markers
    ctx.font = '12px Arial';
    ctx.fillStyle = theme.palette.text.secondary;
    ctx.textAlign = 'center';
    
    for (let hour = 0; hour <= hoursTotal; hour++) {
      const x = marginX + (hour * pixelsPerHour);
      
      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - marginY);
      ctx.lineTo(x, canvas.height - marginY + 5);
      ctx.stroke();
      
      // Draw hour label
      let displayHour = (startHour + hour) % 24;
      if (displayHour < 0) displayHour += 24;
      const ampm = displayHour >= 12 ? 'PM' : 'AM';
      displayHour = displayHour % 12;
      if (displayHour === 0) displayHour = 12;
      
      ctx.fillText(`${displayHour}${ampm}`, x, canvas.height - marginY + 20);
    }
    
    // Calculate proportions of sleep stages
    const totalSleepMinutes = dayData.durationMinutes;
    const sleepStages = [
      { 
        name: 'Deep Sleep', 
        minutes: dayData.deepSleepMinutes, 
        color: sleepStageColors.deep.main,
        offset: 0
      },
      { 
        name: 'REM Sleep', 
        minutes: dayData.remSleepMinutes, 
        color: sleepStageColors.rem.main,
        offset: dayData.deepSleepMinutes
      },
      { 
        name: 'Light Sleep', 
        minutes: dayData.lightSleepMinutes, 
        color: sleepStageColors.light.main,
        offset: dayData.deepSleepMinutes + dayData.remSleepMinutes
      },
      { 
        name: 'Awake', 
        minutes: dayData.awakeDuringNight, 
        color: sleepStageColors.awake.main,
        offset: dayData.deepSleepMinutes + dayData.remSleepMinutes + dayData.lightSleepMinutes
      }
    ];
    
    // Draw sleep cycles as a wave-like pattern
    const waveHeight = timelineHeight * 0.6;
    const waveTop = marginY + (timelineHeight - waveHeight) / 2;
    
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // First draw a baseline sleep area
    ctx.beginPath();
    ctx.moveTo(marginX, canvas.height - marginY);
    ctx.lineTo(marginX, waveTop + waveHeight);
    
    // Create a smooth wave pattern
    const hourOffset = 0.5;
    const minutesPerHour = 60;
    const cycles = Math.max(1, Math.floor(totalSleepMinutes / 90));
    const cycleWidth = (totalSleepMinutes / minutesPerHour) * pixelsPerHour / cycles;
    
    // Adjustable parameters
    const smoothness = 20;
    const cycles_amplitude = [0.5, 1.0, 0.65, 0.9, 0.7, 0.8, 0.6];  // variations for natural look
    
    for (let minute = 0; minute <= totalSleepMinutes; minute += smoothness) {
      const hourPosition = minute / minutesPerHour;
      const x = marginX + ((hourOffset + hourPosition) * pixelsPerHour);
      
      // Calculate current sleep stage
      const currentStage = sleepStages.find(stage => 
        minute >= stage.offset && minute < (stage.offset + stage.minutes)
      ) || sleepStages[2]; // Default to light sleep
      
      // Calculate cycle phase (0 to 2π)
      const cycleProgress = (minute % 90) / 90;
      const cyclePhase = cycleProgress * Math.PI * 2;
      
      // Calculate cycle number for amplitude variation
      const cycleNumber = Math.floor(minute / 90) % cycles_amplitude.length;
      
      // Calculate y position based on sleep stage and cycle
      const baseDepth = getStageDepth(currentStage.name);
      const wave = Math.sin(cyclePhase) * cycles_amplitude[cycleNumber];
      const y = waveTop + waveHeight - (waveHeight * baseDepth) - (wave * waveHeight * 0.15);
      
      // Draw line to this point
      ctx.lineTo(x, y);
    }
    
    // Complete the area path
    ctx.lineTo(marginX + timelineWidth, canvas.height - marginY);
    ctx.closePath();
    
    // Fill with gradient
    const gradient = ctx.createLinearGradient(
      marginX, waveTop, 
      marginX, waveTop + waveHeight
    );
    gradient.addColorStop(0, alpha(sleepStageColors.deep.main, 0.7));
    gradient.addColorStop(0.3, alpha(sleepStageColors.rem.main, 0.6));
    gradient.addColorStop(0.7, alpha(sleepStageColors.light.main, 0.5));
    gradient.addColorStop(1, alpha(theme.palette.background.paper, 0.1));
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw stroke outline
    ctx.strokeStyle = alpha(theme.palette.primary.main, 0.3);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw sleep stage indicators
    const legendY = marginY + 20;
    let legendX = marginX;
    
    sleepStages.forEach(stage => {
      if (stage.minutes <= 0) return;
      
      ctx.fillStyle = stage.color;
      ctx.fillRect(legendX, legendY, 15, 15);
      
      ctx.fillStyle = theme.palette.text.primary;
      ctx.textAlign = 'left';
      ctx.fillText(`${stage.name} (${formatDuration(stage.minutes)})`, legendX + 20, legendY + 12);
      
      legendX += 180;
    });
    
    ctx.restore();
  };
  
  // Helper function to get the relative depth of a sleep stage
  const getStageDepth = (stageName) => {
    switch (stageName) {
      case 'Deep Sleep': return 0.85;
      case 'REM Sleep': return 0.6;
      case 'Light Sleep': return 0.4;
      case 'Awake': return 0.1;
      default: return 0.5;
    }
  };
  
  // Render sleep stage circular graph
  const renderSleepStagesGraph = () => {
    const { deepSleepMinutes, remSleepMinutes, lightSleepMinutes, awakeDuringNight } = sleepMetrics;
    const totalMinutes = deepSleepMinutes + remSleepMinutes + lightSleepMinutes + awakeDuringNight;
    
    if (totalMinutes === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 300 }}>
          <Typography variant="body2" color="text.secondary">
            No sleep stage data available
          </Typography>
        </Box>
      );
    }
    
    // Calculate percentage and angle for each segment
    const stages = [
      {
        name: 'Deep Sleep',
        minutes: deepSleepMinutes,
        percentage: Math.round((deepSleepMinutes / totalMinutes) * 100),
        color: sleepStageColors.deep.main,
        icon: <NightsStayIcon />,
        description: 'Physical recovery, immune function, memory consolidation'
      },
      {
        name: 'REM Sleep',
        minutes: remSleepMinutes,
        percentage: Math.round((remSleepMinutes / totalMinutes) * 100),
        color: sleepStageColors.rem.main,
        icon: <PsychologyIcon />,
        description: 'Dreaming, creativity, emotional processing, learning'
      },
      {
        name: 'Light Sleep',
        minutes: lightSleepMinutes,
        percentage: Math.round((lightSleepMinutes / totalMinutes) * 100),
        color: sleepStageColors.light.main,
        icon: <WavesIcon />,
        description: 'Transition stage, maintaining sleep, basic recovery'
      },
      {
        name: 'Awake',
        minutes: awakeDuringNight,
        percentage: Math.round((awakeDuringNight / totalMinutes) * 100),
        color: sleepStageColors.awake.main,
        icon: <LightModeIcon />,
        description: 'Brief awakenings are normal during the night'
      }
    ];
    
    // Filter out stages with 0 minutes
    const activeStages = stages.filter(stage => stage.minutes > 0);
    
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Sleep stage graph */}
        <Grid item xs={12} md={5}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            height: '100%',
            minHeight: 250
          }}>
            <Box
              component={motion.div}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{
                width: 220,
                height: 220,
                borderRadius: '50%',
                position: 'relative',
                background: `conic-gradient(
                  ${sleepStageColors.deep.main} 0deg,
                  ${sleepStageColors.deep.main} ${stages[0].percentage * 3.6}deg,
                  ${sleepStageColors.rem.main} ${stages[0].percentage * 3.6}deg,
                  ${sleepStageColors.rem.main} ${(stages[0].percentage + stages[1].percentage) * 3.6}deg,
                  ${sleepStageColors.light.main} ${(stages[0].percentage + stages[1].percentage) * 3.6}deg,
                  ${sleepStageColors.light.main} ${(stages[0].percentage + stages[1].percentage + stages[2].percentage) * 3.6}deg,
                  ${sleepStageColors.awake.main} ${(stages[0].percentage + stages[1].percentage + stages[2].percentage) * 3.6}deg,
                  ${sleepStageColors.awake.main} 360deg
                )`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: theme.palette.background.paper,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                <Typography variant="h4" color="text.primary" fontWeight="bold">
                  {formatDuration(totalMinutes)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Sleep
                </Typography>
              </Box>
            </Box>
            
            {/* Animated indicators for each sleep stage */}
            {activeStages.map((stage, index) => {
              // Calculate position on the circle
              const angleInRadians = (
                (stages
                  .slice(0, stages.findIndex(s => s.name === stage.name))
                  .reduce((sum, s) => sum + s.percentage, 0) 
                  + stage.percentage / 2
                ) * 3.6 * Math.PI / 180
              );
              
              const radius = 135;
              const x = Math.cos(angleInRadians) * radius;
              const y = Math.sin(angleInRadians) * radius;
              
              return (
                <Box
                  component={motion.div}
                  key={stage.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  sx={{
                    position: 'absolute',
                    left: 'calc(50% + ' + x + 'px)',
                    top: 'calc(50% + ' + y + 'px)',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: stage.color,
                      color: '#fff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                  >
                    {stage.percentage}%
                  </Avatar>
                </Box>
              );
            })}
          </Box>
        </Grid>
        
        {/* Sleep stage details */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            {activeStages.map((stage, index) => (
              <Box 
                component={motion.div}
                key={stage.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: stage.color
                      }}
                    >
                      {stage.icon}
                    </Avatar>
                    <Typography variant="subtitle1">
                      {stage.name} ({formatDuration(stage.minutes)})
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={`${stage.percentage}%`} 
                    sx={{ bgcolor: stage.color, color: 'white', fontWeight: 'medium' }}
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stage.percentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    mb: 0.5,
                    bgcolor: alpha(stage.color, 0.2),
                    '& .MuiLinearProgress-bar': { bgcolor: stage.color }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {stage.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    );
  };
  
  // Render sleep metrics
  const renderSleepMetrics = () => {
    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            borderRadius: 4, 
            bgcolor: 'background.paper', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" />
              Sleep Timing
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={6}>
                <Box 
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.dark, 0.05)
                  }}
                >
                  <Avatar
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.dark, 0.8),
                      mb: 1.5
                    }}
                  >
                    <DarkModeIcon />
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Bedtime
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatTime(sleepMetrics.startTime) || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={6}>
                <Box 
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.warning.light, 0.05)
                  }}
                >
                  <Avatar
                    sx={{ 
                      bgcolor: alpha(theme.palette.warning.light, 0.8),
                      mb: 1.5
                    }}
                  >
                    <LightModeIcon />
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Wake Up
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatTime(sleepMetrics.endTime) || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Bedtime Consistency
                </Typography>
                <Chip 
                  size="small" 
                  label={`${sleepMetrics.bedtimeConsistency}%`} 
                  color={
                    sleepMetrics.bedtimeConsistency >= 80 ? "success" :
                    sleepMetrics.bedtimeConsistency >= 60 ? "info" :
                    sleepMetrics.bedtimeConsistency >= 40 ? "warning" : "error"
                  }
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={sleepMetrics.bedtimeConsistency || 0} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {sleepMetrics.bedtimeConsistency >= 80 
                  ? 'Excellent consistency in your sleep schedule' 
                  : sleepMetrics.bedtimeConsistency >= 60
                    ? 'Good consistency - your body appreciates the routine'
                    : sleepMetrics.bedtimeConsistency >= 40
                      ? 'Moderate consistency - try to maintain a more regular schedule'
                      : 'Irregular sleep schedule - aim for more consistent bedtimes'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 3, 
            borderRadius: 4, 
            bgcolor: 'background.paper', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon color="primary" />
              Sleep Quality
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={6}>
                <Box 
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.success.light, 0.05)
                  }}
                >
                  <Avatar
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.light, 0.8),
                      mb: 1.5
                    }}
                  >
                    <ShowChartIcon />
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Efficiency
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {sleepMetrics.efficiency || 0}%
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} sm={6}>
                <Box 
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.info.light, 0.05)
                  }}
                >
                  <Avatar
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.light, 0.8),
                      mb: 1.5
                    }}
                  >
                    <TimerIcon />
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Sleep Cycles
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {Math.floor(sleepMetrics.duration / 90) || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Sleep Score
                    <Tooltip title="A comprehensive score based on duration, efficiency, and quality of your sleep">
                      <ScienceIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                    </Tooltip>
                  </Typography>
                </Box>
                <Chip 
                  size="small" 
                  label={sleepQualityLevel?.name || 'Unknown'} 
                  sx={{ 
                    bgcolor: sleepQualityLevel?.color || theme.palette.grey[500], 
                    color: 'white' 
                  }}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={sleepScore} 
                sx={{ 
                  height: 8, 
                  borderRadius: 3,
                  mb: 0.5,
                  bgcolor: alpha(sleepQualityLevel?.color || theme.palette.grey[500], 0.2),
                  '& .MuiLinearProgress-bar': { 
                    bgcolor: sleepQualityLevel?.color || theme.palette.grey[500],
                    backgroundImage: sleepQualityLevel?.gradient
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {sleepQualityLevel?.description || 'No quality data available'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  };
  
  // Render sleep insights
  const renderSleepInsights = () => {
    if (!sleepMetrics || sleepMetrics.duration === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No sleep data available for insights
          </Typography>
        </Box>
      );
    }
    
    // Generate insights based on sleep data
    const insights = [];
    
    // Duration insights
    if (sleepMetrics.duration >= 420 && sleepMetrics.duration <= 540) {
      insights.push({
        type: 'positive',
        icon: <DoneIcon />,
        title: 'Optimal Sleep Duration',
        description: 'Your sleep duration falls within the recommended 7-9 hours for adults.'
      });
    } else if (sleepMetrics.duration < 420) {
      insights.push({
        type: 'negative',
        icon: <TrendingDownIcon />,
        title: 'Insufficient Sleep',
        description: `You're getting ${formatDuration(sleepMetrics.duration)}, which is below the recommended 7-9 hours for adults.`
      });
    } else if (sleepMetrics.duration > 540) {
      insights.push({
        type: 'neutral',
        icon: <TrendingUpIcon />,
        title: 'Extended Sleep',
        description: `You're getting ${formatDuration(sleepMetrics.duration)}, which is above the typical recommendation. This might indicate recovery from sleep debt or other factors.`
      });
    }
    
    // Deep sleep insights
    const idealDeepSleepPercentage = 20;
    if (Math.abs(sleepMetrics.deepSleepPercentage - idealDeepSleepPercentage) <= 5) {
      insights.push({
        type: 'positive',
        icon: <NightsStayIcon />,
        title: 'Ideal Deep Sleep',
        description: `Your deep sleep percentage (${sleepMetrics.deepSleepPercentage}%) is optimal for physical recovery and memory consolidation.`
      });
    } else if (sleepMetrics.deepSleepPercentage < idealDeepSleepPercentage - 5) {
      insights.push({
        type: 'negative',
        icon: <NightsStayIcon />,
        title: 'Low Deep Sleep',
        description: `Your deep sleep percentage (${sleepMetrics.deepSleepPercentage}%) is lower than ideal. Deep sleep is crucial for physical recovery and memory consolidation.`
      });
    }
    
    // Sleep efficiency insights
    if (sleepMetrics.efficiency >= 90) {
      insights.push({
        type: 'positive',
        icon: <SpeedIcon />,
        title: 'Excellent Sleep Efficiency',
        description: `Your sleep efficiency of ${sleepMetrics.efficiency}% indicates high-quality, continuous sleep.`
      });
    } else if (sleepMetrics.efficiency < 80) {
      insights.push({
        type: 'negative',
        icon: <SpeedIcon />,
        title: 'Low Sleep Efficiency',
        description: `Your sleep efficiency of ${sleepMetrics.efficiency}% suggests frequent disturbances or difficulty staying asleep.`
      });
    }
    
    // Sleep cycle insights
    const cycles = Math.floor(sleepMetrics.duration / 90);
    if (cycles >= 5) {
      insights.push({
        type: 'positive',
        icon: <TimerIcon />,
        title: 'Complete Sleep Cycles',
        description: `You completed approximately ${cycles} sleep cycles, which is ideal for feeling refreshed upon waking.`
      });
    } else if (cycles < 4) {
      insights.push({
        type: 'negative',
        icon: <TimerIcon />,
        title: 'Incomplete Sleep Cycles',
        description: `You completed approximately ${cycles} sleep cycles, which is fewer than the recommended 4-5 cycles per night.`
      });
    }
    
    // Bedtime consistency insights
    if (sleepMetrics.bedtimeConsistency >= 80) {
      insights.push({
        type: 'positive',
        icon: <AccessTimeIcon />,
        title: 'Consistent Sleep Schedule',
        description: 'Your consistent bedtime helps maintain your circadian rhythm and improves sleep quality.'
      });
    } else if (sleepMetrics.bedtimeConsistency < 60) {
      insights.push({
        type: 'negative',
        icon: <AccessTimeIcon />,
        title: 'Irregular Sleep Schedule',
        description: 'Your bedtime varies significantly. A more consistent sleep schedule can improve sleep quality and daytime energy.'
      });
    }
    
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {insights.map((insight, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                elevation={1}
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: '100%',
                  borderLeft: `4px solid ${
                    insight.type === 'positive' ? theme.palette.success.main :
                    insight.type === 'negative' ? theme.palette.error.main :
                    theme.palette.warning.main
                  }`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: insight.type === 'positive' ? theme.palette.success.main :
                                insight.type === 'negative' ? theme.palette.error.main :
                                theme.palette.warning.main
                      }}
                    >
                      {insight.icon}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {insight.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {insight.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // Render the sleep data visualizations based on current view mode
  const renderSleepData = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      );
    }
    
    if (!processedData || processedData.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No sleep data available for this period
          </Typography>
        </Box>
      );
    }
    
    switch (viewMode) {
      case 'stages':
        return renderSleepStagesGraph();
      case 'timeline':
        return (
          <Box
            sx={{
              width: '100%',
              height: 300,
              position: 'relative',
              mt: 2
            }}
          >
            <canvas 
              ref={canvasRef} 
              style={{ width: '100%', height: '100%' }} 
              aria-label="Sleep timeline visualization"
            />
          </Box>
        );
      case 'insights':
        return renderSleepInsights();
      default:
        return renderSleepStagesGraph();
    }
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%',
        p: 0,
        borderRadius: 4,
        background: 'linear-gradient(170deg, #fafafa, #ffffff)',
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}
    >
      {/* Background decorative elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(sleepQualityLevel?.color || '#5e35b1', 0.03)} 0%, transparent 70%)`,
          zIndex: 0
        }}
      />
      
      <Box 
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(sleepQualityLevel?.color || '#5e35b1', 0.02)} 0%, transparent 70%)`,
          zIndex: 0
        }}
      />
      
      {/* Header section */}
      <Box 
        sx={{ 
          position: 'relative',
          p: { xs: 2, md: 3 },
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          background: sleepQualityLevel ? sleepQualityLevel.gradient : 'linear-gradient(135deg, #5e35b1 0%, #673ab7 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          color: 'white',
          zIndex: 1
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={sleepScore || 'loading'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Zoom in={Boolean(sleepQualityLevel)}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: 'white',
                            color: sleepQualityLevel?.color || theme.palette.primary.main
                          }}
                        >
                          {sleepQualityLevel?.icon || <BedtimeIcon fontSize="small" />}
                        </Avatar>
                      </Zoom>
                    }
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      {sleepScore || '—'}
                    </Avatar>
                  </Badge>
                </motion.div>
              </AnimatePresence>
              
              <Box sx={{ ml: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Sleep Score
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {sleepQualityLevel ? sleepQualityLevel.description : 'Analyzing your sleep data...'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Chip
                icon={<HotelIcon />}
                label={formatDuration(sleepMetrics.duration)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(4px)',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
              
              <Chip
                icon={<AccessTimeIcon />}
                label={`${formatTime(sleepMetrics.startTime)} - ${formatTime(sleepMetrics.endTime)}`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(4px)',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
              
              <Chip
                icon={<SpeedIcon />}
                label={`${sleepMetrics.efficiency || 0}% Efficiency`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(4px)',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
              
              <IconButton
                size="small"
                onClick={() => setDiagnosticsOpen(true)}
                sx={{
                  color: 'white',
                  opacity: 0.7,
                  '&:hover': { opacity: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
                title="Debug"
              >
                <TuneIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Main content area */}
      <Box sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        {/* View mode tabs */}
        <Tabs
          value={viewMode}
          onChange={(_, newValue) => setViewMode(newValue)}
          centered
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: sleepQualityLevel?.color || theme.palette.primary.main
            }
          }}
        >
          <Tab 
            value="stages" 
            label="Sleep Stages" 
            icon={<NightsStayIcon />}
            iconPosition="start"
            sx={{
              minHeight: 'unset',
              py: 1,
              '&.Mui-selected': {
                color: sleepQualityLevel?.color || theme.palette.primary.main
              }
            }}
          />
          <Tab 
            value="timeline" 
            label="Sleep Timeline" 
            icon={<WavesIcon />}
            iconPosition="start"
            sx={{
              minHeight: 'unset',
              py: 1,
              '&.Mui-selected': {
                color: sleepQualityLevel?.color || theme.palette.primary.main
              }
            }}
          />
          <Tab 
            value="insights" 
            label="Sleep Insights" 
            icon={<AnalyticsIcon />}
            iconPosition="start"
            sx={{
              minHeight: 'unset',
              py: 1,
              '&.Mui-selected': {
                color: sleepQualityLevel?.color || theme.palette.primary.main
              }
            }}
          />
        </Tabs>
        
        {/* Render the active view */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderSleepData()}
          </motion.div>
        </AnimatePresence>
        
        {/* Sleep metrics section */}
        <Fade in={true}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }}>
              <Chip 
                label="Sleep Metrics" 
                icon={<FitnessCenterIcon />}
                sx={{ 
                  fontWeight: 'medium',
                  bgcolor: alpha(sleepQualityLevel?.color || theme.palette.primary.main, 0.1),
                  color: sleepQualityLevel?.color || theme.palette.primary.main,
                  '& .MuiChip-icon': { color: sleepQualityLevel?.color || theme.palette.primary.main }
                }}
              />
            </Divider>
            
            {renderSleepMetrics()}
          </Box>
        </Fade>
      </Box>
      
      {/* Diagnostics dialog */}
      <DiagnosticsDialog 
        open={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        tokenScopes={tokenScopes}
        isAuthenticated={isAuthenticated}
        date={date}
        period={period}
        dataQualityScores={dataQualityScores}
        availableSources={availableSources}
        dataType="sleep"
        requiredScopes={['sleep']}
      />
    </Paper>
  );
};

export default SleepChart;