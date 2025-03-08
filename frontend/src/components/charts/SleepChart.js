import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Box, 
  Typography, 
  FormControlLabel, 
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useTheme,
  IconButton,
  Fab,
  alpha,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
  Stack
} from '@mui/material';

// Icons
import BedtimeIcon from '@mui/icons-material/Bedtime';
import HotelIcon from '@mui/icons-material/Hotel';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WavesIcon from '@mui/icons-material/Waves';
import TuneIcon from '@mui/icons-material/Tune';
import StraightenIcon from '@mui/icons-material/Straighten';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LightModeIcon from '@mui/icons-material/LightMode';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';

// Common components
import { 
  AnimatedIcon, 
  DiagnosticsDialog
} from '../common';

// Chart components - direct imports to fix rendering
import AreaChart from '../common/charts/AreaChart';
import LineChart from '../common/charts/LineChart';
import BarChart from '../common/charts/BarChart';

// Sleep analysis
import SleepAnalysisPanel from './sleep/SleepAnalysisPanel';

// Helper function to get sleep quality level
const getSleepQualityLevel = (score) => {
  if (!score) return null;
  
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
  
  return SLEEP_QUALITY_LEVELS.find(level => score >= level.min && score <= level.max);
};

// Format duration as hours and minutes
const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Sleep Chart component
 * Displays and controls sleep visualization from different data sources
 * 
 * @param {Object} props
 * @param {Array} props.data - Main sleep data
 * @param {Array} props.fitbitData - Fitbit sleep data
 * @param {Array} props.googleFitData - Google Fit sleep data
 * @param {Array} props.appleHealthData - Apple Health sleep data
 * @param {string} props.dataSource - Current data source ('auto', 'fitbit', 'googleFit', etc.)
 * @param {string} props.period - Time period ('day', 'week', 'month', etc.)
 * @param {Array} props.tokenScopes - Available token scopes
 * @param {boolean} props.isAuthenticated - Whether user is authenticated
 * @param {Date} props.date - Current date
 * @param {Object} props.availableSources - Available data sources
 * @param {Function} props.onDataSourceChange - Handler for data source changes
 * @returns {JSX.Element}
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
  
  // State
  const [showRange, setShowRange] = useState(true);
  const [stagesView, setStagesView] = useState(false);
  const [resolution, setResolution] = useState('medium');
  const [chartType, setChartType] = useState('area');
  const [processedData, setProcessedData] = useState([]);
  const [sleepScore, setSleepScore] = useState(0);
  const [sleepDuration, setSleepDuration] = useState(0);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [dataQualityScores, setDataQualityScores] = useState({
    fitbit: 0,
    googleFit: 0,
    appleHealth: 0
  });
  
  // Process data when parameters change
  useEffect(() => {
    console.log("SleepChart data processing");
    console.log("- Main data length:", data?.length || 0);
    console.log("- Google Fit data length:", googleFitData?.length || 0);
    console.log("- Fitbit data length:", fitbitData?.length || 0);
    
    // Calculate data quality scores
    const qualityScores = {
      fitbit: calculateDataQualityScore(fitbitData),
      googleFit: calculateDataQualityScore(googleFitData),
      appleHealth: calculateDataQualityScore(appleHealthData)
    };
    setDataQualityScores(qualityScores);
    
    // If no data, early return
    if (!data || data.length === 0) {
      console.log("Main data is empty, checking alternatives");
      
      // Use Google Fit data as fallback if available
      if (googleFitData && googleFitData.length > 0) {
        console.log("Using Google Fit data as fallback because main data is empty");
        processSleepData(googleFitData, 'googleFit');
        return;
      }
      
      // Create empty placeholder if no data available
      console.log("No data available, creating placeholder");
      const placeholderData = [{
        date: format(new Date(), 'yyyy-MM-dd'),
        durationMinutes: 0,
        efficiency: 0,
        score: 0,
        deepSleepMinutes: 0,
        lightSleepMinutes: 0,
        remSleepMinutes: 0,
        awakeDuringNight: 0,
        source: "none"
      }];
      setProcessedData(placeholderData);
      setSleepScore(0);
      setSleepDuration(0);
      return;
    }
    
    // Process data based on source and mode
    if (compareMode) {
      // When comparing, combine data from all sources
      const combinedData = combineDataForComparison({
        fitbit: fitbitData,
        googleFit: googleFitData,
        appleHealth: appleHealthData
      });
      setProcessedData(combinedData);
      
      // Get average sleep score from the combined data
      const avgScore = Math.round(
        combinedData.reduce((sum, point) => sum + (point.score || 0), 0) / 
        combinedData.filter(point => point.score > 0).length || 1
      );
      setSleepScore(avgScore);
      
      // Get average sleep duration from the combined data
      const avgDuration = Math.round(
        combinedData.reduce((sum, point) => sum + (point.durationMinutes || 0), 0) / 
        combinedData.length || 1
      );
      setSleepDuration(avgDuration);
    } else {
      // Process based on selected data source
      let sourceData = data;
      let sourceName = 'auto';
      
      console.log("Processing with data source:", dataSource);
      
      // Use Google Fit data if available and selected
      if (dataSource === 'googleFit' && googleFitData && googleFitData.length > 0) {
        console.log("Using Google Fit data explicitly");
        sourceData = googleFitData;
        sourceName = 'googleFit';
      } 
      // Use Fitbit data if selected
      else if (dataSource === 'fitbit' && fitbitData && fitbitData.length > 0) {
        console.log("Using Fitbit data explicitly");
        sourceData = fitbitData;
        sourceName = 'fitbit';
      }
      // Use Apple Health data if selected
      else if (dataSource === 'appleHealth' && appleHealthData && appleHealthData.length > 0) {
        console.log("Using Apple Health data explicitly");
        sourceData = appleHealthData;
        sourceName = 'appleHealth';
      } 
      // Auto-select based on quality if in auto mode
      else if (dataSource === 'auto') {
        console.log("Auto mode, selecting best data source");
        // Priority to Google Fit data if available
        if (googleFitData && googleFitData.length > 0) {
          console.log("Auto mode selecting Google Fit data");
          sourceData = googleFitData;
          sourceName = 'googleFit';
        }
        // If no Google Fit data, use best available
        else {
          const bestSource = selectBestDataSource();
          console.log("Best source determined:", bestSource);
          if (bestSource === 'fitbit' && fitbitData && fitbitData.length > 0) {
            sourceData = fitbitData;
            sourceName = 'fitbit';
          } else if (bestSource === 'appleHealth' && appleHealthData && appleHealthData.length > 0) {
            sourceData = appleHealthData;
            sourceName = 'appleHealth';
          }
        }
      }
      
      // Check if sourceData has been properly assigned
      if (!sourceData || sourceData.length === 0) {
        console.log("sourceData is empty after selection, checking fallbacks");
        // Try to use any available data
        if (googleFitData && googleFitData.length > 0) {
          console.log("Falling back to Google Fit data");
          sourceData = googleFitData;
          sourceName = 'googleFit';
        } else if (fitbitData && fitbitData.length > 0) {
          console.log("Falling back to Fitbit data");
          sourceData = fitbitData;
          sourceName = 'fitbit';
        } else if (appleHealthData && appleHealthData.length > 0) {
          console.log("Falling back to Apple Health data");
          sourceData = appleHealthData;
          sourceName = 'appleHealth';
        }
      }
      
      console.log("Final source data selected:", sourceName, "with", sourceData?.length || 0, "data points");
      
      // Process the selected data
      if (sourceData && sourceData.length > 0) {
        processSleepData(sourceData, sourceName);
      } else {
        console.warn("No valid data source found for sleep chart");
        // Create placeholder data as fallback
        const placeholderData = [{
          date: format(new Date(), 'yyyy-MM-dd'),
          durationMinutes: 0,
          efficiency: 0,
          score: 0,
          deepSleepMinutes: 0,
          lightSleepMinutes: 0,
          remSleepMinutes: 0,
          awakeDuringNight: 0,
          source: "none"
        }];
        setProcessedData(placeholderData);
        setSleepScore(0);
        setSleepDuration(0);
      }
    }
  }, [data, googleFitData, fitbitData, appleHealthData, dataSource, resolution, compareMode, period]);
  
  // Process sleep data for display
  const processSleepData = (sourceData, sourceName) => {
    if (!sourceData || sourceData.length === 0) {
      console.warn("No source data to process");
      return;
    }
    
    // Check if we only have a placeholder data point
    const hasOnlyPlaceholder = sourceData.length === 1 && sourceData[0].placeholder === true;
    if (hasOnlyPlaceholder) {
      console.log("Only placeholder data available for today");
      setSleepScore(0);
      setSleepDuration(0);
      setProcessedData([sourceData[0]]);
      return;
    }
    
    console.log(`Processing ${sourceName} data with ${sourceData.length} points`);
    
    // Downsample and enhance data
    const downsampledData = downsampleData(sourceData, resolution === 'low' ? 20 : resolution === 'high' ? 100 : 50);
    console.log(`Downsampled to ${downsampledData.length} points`);
    
    const enhanced = enhanceSleepData(downsampledData, sourceName);
    console.log(`Enhanced data has ${enhanced.length} points`);
    
    setProcessedData(enhanced);
    
    // Calculate sleep score
    const scoresWithValues = enhanced.filter(item => item.score > 0);
    const avgScore = scoresWithValues.length > 0
      ? Math.round(scoresWithValues.reduce((sum, item) => sum + item.score, 0) / scoresWithValues.length)
      : 0;
    
    setSleepScore(avgScore);
    
    // Calculate average sleep duration
    const avgDuration = enhanced.length > 0
      ? Math.round(enhanced.reduce((sum, item) => sum + (item.durationMinutes || 0), 0) / enhanced.length)
      : 0;
    
    setSleepDuration(avgDuration);
  };
  
  // Select the best data source based on quality scores
  const selectBestDataSource = () => {
    // Filter for available sources only
    const scores = Object.entries(dataQualityScores)
      .filter(([source]) => availableSources[source])
      .sort((a, b) => b[1] - a[1]);
    
    // Return the highest scoring source, or 'googleFit' as fallback if available
    if (scores.length > 0) return scores[0][0];
    if (availableSources.googleFit) return 'googleFit';
    return 'fitbit';
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
  
  // Downsample data for performance
  const downsampleData = (sourceData, targetPoints) => {
    if (sourceData.length <= targetPoints) return sourceData;
    
    // Calculate the factor by which to reduce the data
    const factor = Math.max(1, Math.ceil(sourceData.length / targetPoints));
    
    const result = [];
    
    // Always include first and last point for proper time range
    if (sourceData.length > 1) {
      result.push({...sourceData[0]});
    }
    
    // Process middle points
    for (let i = 1; i < sourceData.length - 1; i += factor) {
      const chunk = sourceData.slice(i, Math.min(i + factor, sourceData.length - 1));
      
      // For high-fidelity detail, use first point in each chunk
      const pointObj = { ...chunk[0] };
      
      result.push(pointObj);
    }
    
    // Always include last point
    if (sourceData.length > 1) {
      result.push({...sourceData[sourceData.length - 1]});
    }
    
    return result;
  };
  
  // Enhance sleep data for visualization
  const enhanceSleepData = (data, source) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => {
      try {
        // Convert duration to hours for better visualization
        const durationHours = parseFloat(((item.durationMinutes || 0) / 60).toFixed(1));
        
        // Calculate sleep quality level
        const qualityLevel = getSleepQualityLevel(item.score);
        
        // Calculate sleep stage percentages if not provided
        const totalMinutes = item.durationMinutes || 480; // Default to 8 hours
        
        const deepPercent = item.deepSleepPercentage || 
                           (item.deepSleepMinutes ? Math.round((item.deepSleepMinutes / totalMinutes) * 100) : 20);
                           
        const remPercent = item.remSleepPercentage || 
                          (item.remSleepMinutes ? Math.round((item.remSleepMinutes / totalMinutes) * 100) : 25);
                          
        const lightPercent = item.lightSleepPercentage || 
                            (item.lightSleepMinutes ? Math.round((item.lightSleepMinutes / totalMinutes) * 100) : 55);
        
        // Calculate sleep efficiency if not provided
        const efficiency = item.efficiency || 90;
        
        // Create a formattedDate for consistent display
        const formattedDate = item.date || format(new Date(), 'yyyy-MM-dd');
        
        return {
          ...item,
          source,
          durationHours,
          deepPercent,
          remPercent,
          lightPercent,
          efficiency,
          formattedDate,
          qualityLevel: qualityLevel || { name: 'Unknown', color: '#9e9e9e' },
          sleepQualityColor: qualityLevel?.color || '#9e9e9e',
          // Ensure these fields exist
          deepSleepMinutes: item.deepSleepMinutes || Math.round(totalMinutes * (deepPercent / 100)),
          remSleepMinutes: item.remSleepMinutes || Math.round(totalMinutes * (remPercent / 100)),
          lightSleepMinutes: item.lightSleepMinutes || Math.round(totalMinutes * (lightPercent / 100)),
          awakeDuringNight: item.awakeDuringNight || 0,
          // For display
          sleepDurationFormatted: formatDuration(item.durationMinutes || 0)
        };
      } catch (e) {
        console.error('Error enhancing sleep data:', e, 'for item:', item);
        return {
          ...item,
          source,
          durationHours: 0,
          deepPercent: 0,
          remPercent: 0,
          lightPercent: 0,
          efficiency: 0,
          formattedDate: item.date || format(new Date(), 'yyyy-MM-dd'),
          qualityLevel: { name: 'Unknown', color: '#9e9e9e' },
          sleepQualityColor: '#9e9e9e',
          deepSleepMinutes: 0,
          remSleepMinutes: 0,
          lightSleepMinutes: 0,
          awakeDuringNight: 0,
          sleepDurationFormatted: '0h 0m',
          error: true
        };
      }
    });
  };
  
  // Combine data from multiple sources for comparison
  const combineDataForComparison = (dataSources) => {
    const combinedData = [];
    const dateMap = {};
    
    // Process each data source
    Object.entries(dataSources).forEach(([source, data]) => {
      if (!data || !Array.isArray(data) || data.length === 0) return;
      
      // Create a map of dates to data points
      data.forEach(item => {
        if (!item.date) return;
        
        if (!dateMap[item.date]) {
          dateMap[item.date] = {
            date: item.date,
            formattedDate: item.date
          };
        }
        
        // Add source-specific data
        dateMap[item.date][`${source}Score`] = item.score || 0;
        dateMap[item.date][`${source}Duration`] = item.durationMinutes || 0;
        dateMap[item.date][`${source}Efficiency`] = item.efficiency || 0;
        dateMap[item.date][`${source}DeepSleep`] = item.deepSleepMinutes || 0;
        dateMap[item.date][`${source}RemSleep`] = item.remSleepMinutes || 0;
        dateMap[item.date][`${source}LightSleep`] = item.lightSleepMinutes || 0;
      });
    });
    
    // Convert the map to an array and sort by date
    return Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Chart configuration
  const getChartConfig = () => {
    // Base configuration
    const baseConfig = {
      data: processedData,
      xAxisDataKey: "formattedDate",
      height: 400,
      showTooltip: true,
      minYValue: 0
    };
    
    if (stagesView) {
      // Sleep stages visualization (stacked bar chart)
      return {
        ...baseConfig,
        series: [
          {
            dataKey: "deepSleepMinutes",
            name: "Deep Sleep",
            color: "#3f51b5",
            stackId: "sleep",
            barSize: processedData.length > 30 ? 5 : 20
          },
          {
            dataKey: "remSleepMinutes",
            name: "REM Sleep",
            color: "#2196f3",
            stackId: "sleep",
            barSize: processedData.length > 30 ? 5 : 20
          },
          {
            dataKey: "lightSleepMinutes",
            name: "Light Sleep",
            color: "#9c27b0",
            stackId: "sleep",
            barSize: processedData.length > 30 ? 5 : 20
          },
          {
            dataKey: "awakeDuringNight",
            name: "Awake",
            color: "#ff9800",
            stackId: "sleep",
            barSize: processedData.length > 30 ? 5 : 20
          }
        ]
      };
    } else if (compareMode) {
      // Comparison mode - show data from different sources
      const series = [];
      
      if (availableSources.fitbit) {
        series.push({
          dataKey: 'fitbitDuration',
          name: 'Fitbit (minutes)',
          color: '#1976d2',
          strokeWidth: 2
        });
      }
      
      if (availableSources.googleFit) {
        series.push({
          dataKey: 'googleFitDuration',
          name: 'Google Fit (minutes)',
          color: '#4caf50',
          strokeWidth: 2
        });
      }
      
      if (availableSources.appleHealth) {
        series.push({
          dataKey: 'appleHealthDuration',
          name: 'Apple Health (minutes)',
          color: '#f44336',
          strokeWidth: 2
        });
      }
      
      return {
        ...baseConfig,
        series
      };
    } else {
      // Standard single source mode
      if (chartType === 'bar') {
        return {
          ...baseConfig,
          series: [
            {
              dataKey: "durationMinutes",
              name: "Sleep Duration (minutes)",
              color: theme.palette.primary.main,
              barSize: processedData.length > 30 ? 5 : 20,
              // Custom coloring based on quality
              getItemColor: (entry) => {
                if (!entry.score) return theme.palette.grey[300];
                return entry.sleepQualityColor;
              },
              itemColors: true
            }
          ],
          // Reference area for recommended sleep (7-9 hours)
          referenceAreas: [
            {
              y1: 420, // 7 hours
              y2: 540, // 9 hours
              fill: alpha(theme.palette.success.main, 0.1),
              label: { 
                value: 'Recommended', 
                position: 'insideLeft',
                fill: theme.palette.success.main 
              }
            }
          ]
        };
      } else if (chartType === 'line') {
        return {
          ...baseConfig,
          series: [
            // Sleep score
            {
              dataKey: "score",
              name: "Sleep Score",
              color: theme.palette.secondary.main,
              strokeWidth: 2,
              yAxisId: "right",
              dot: true
            },
            // Sleep efficiency
            {
              dataKey: "efficiency",
              name: "Sleep Efficiency (%)",
              color: theme.palette.info.main,
              strokeWidth: 2,
              yAxisId: "right",
              dot: true
            },
            // Sleep duration
            {
              dataKey: "durationMinutes",
              name: "Sleep Duration (minutes)",
              color: theme.palette.primary.main,
              strokeWidth: 2,
              yAxisId: "left",
              dot: true
            }
          ],
          secondYAxis: {
            dataKey: "score",
            label: "Score/Efficiency",
            domain: [0, 100],
            orientation: "right"
          }
        };
      } else {
        // Default area chart
        return {
          ...baseConfig,
          series: [
            {
              dataKey: "durationMinutes",
              name: "Sleep Duration (minutes)",
              color: theme.palette.primary.main,
              strokeWidth: 2,
              gradientId: 'sleepGradient',
              fillOpacity: { start: 0.8, end: 0.1 }
            }
          ],
          // Reference area for recommended sleep (7-9 hours)
          referenceAreas: [
            {
              y1: 420, // 7 hours
              y2: 540, // 9 hours
              fill: alpha(theme.palette.success.main, 0.1),
              label: { 
                value: 'Recommended', 
                position: 'insideLeft',
                fill: theme.palette.success.main 
              }
            }
          ]
        };
      }
    }
  };
  
  // Render the selected chart
  const renderChart = () => {
    try {
      const config = getChartConfig();
      
      if (!AreaChart || !LineChart || !BarChart) {
        console.error("Chart components not found. Make sure they're properly imported.");
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">Chart components not loaded</Typography>
          </Box>
        );
      }
      
      // Render based on chart type
      if (stagesView || chartType === 'bar') {
        return <BarChart {...config} />;
      } else if (chartType === 'line') {
        return <LineChart {...config} />;
      } else {
        return <AreaChart {...config} />;
      }
    } catch (error) {
      console.error("Error rendering sleep chart:", error);
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Chart rendering failed: {error.message}</Typography>
        </Box>
      );
    }
  };
  
  // Get quality level color
  const getQualityLevelColor = (score) => {
    const level = getSleepQualityLevel(score);
    return level?.color || '#9e9e9e';
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
          background: 'linear-gradient(90deg, #673ab7, #9c27b0, #e91e63)' 
        }} 
      />
      
      {/* Header with current sleep score */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: { xs: 2, md: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AnimatedIcon 
            icon={<BedtimeIcon />} 
            value={sleepScore} 
            unit="Score" 
            size="large" 
            color={getQualityLevelColor(sleepScore)} 
          />
          
          {/* Duration information */}
          <Box 
            sx={{ 
              ml: 2,
              display: { xs: 'none', md: 'block' },
              bgcolor: alpha(getQualityLevelColor(sleepScore) || theme.palette.primary.main, 0.1),
              p: 1,
              px: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(getQualityLevelColor(sleepScore) || theme.palette.primary.main, 0.2)}`
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <HotelIcon />
              {formatDuration(sleepDuration)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {sleepDuration >= 480 ? 'Optimal sleep duration' : 
               sleepDuration >= 420 ? 'Good sleep duration' : 
               sleepDuration >= 360 ? 'Fair sleep duration' : 
               'Below recommended sleep duration'}
            </Typography>
          </Box>
          
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
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
              <MenuItem value="bar" sx={{ display: 'flex', gap: 1 }}>
                <BarChartIcon fontSize="small" /> Bar Chart
              </MenuItem>
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
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
          
            <FormControlLabel
              control={
                <Switch
                  checked={stagesView}
                  onChange={(e) => setStagesView(e.target.checked)}
                  size="small"
                />
              }
              label="Stages"
              sx={{ m: 0 }}
            />
            
            {/* Compare mode switch with clear labeling */}
            <FormControlLabel
              control={
                <Switch
                  checked={compareMode}
                  onChange={(e) => setCompareMode(e.target.checked)}
                  size="small"
                />
              }
              label="Compare"
              sx={{ m: 0 }}
            />
          </Box>
        </Box>
      </Box>
      
      {/* Main chart container */}
      <Box sx={{ height: 400, width: '100%' }}>
        {renderChart()}
      </Box>
      
      {/* Data source indicator */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Data source: {dataSource === 'auto' ? 'Auto' : dataSource === 'googleFit' ? 'Google Fit' : dataSource === 'fitbit' ? 'Fitbit' : 'Apple Health'}
        </Typography>
        {processedData.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            • {processedData.length} data points
          </Typography>
        )}
      </Box>
      
      {/* Analysis section */}
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Fab
          color="primary"
          variant="extended"
          size="medium"
          onClick={() => setShowAnalysis(prev => !prev)}
          sx={{
            boxShadow: 3,
            textTransform: 'none'
          }}
        >
          <AnalyticsIcon sx={{ mr: 1 }} />
          {showAnalysis ? "Hide Analysis" : "Show Detailed Analysis"}
        </Fab>
      </Box>
      
      {/* Sleep analysis panel */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: showAnalysis ? 1 : 0,
          height: showAnalysis ? 'auto' : 0,
          marginTop: showAnalysis ? 24 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {showAnalysis && <SleepAnalysisPanel data={processedData} period={period} />}
      </motion.div>
      
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
        dataType="sleep"
        requiredScopes={['sleep']}
      />
    </Paper>
  );
};

export default SleepChart;