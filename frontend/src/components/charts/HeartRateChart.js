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
  Paper
} from '@mui/material';

// Icons
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import TuneIcon from '@mui/icons-material/Tune';
import StraightenIcon from '@mui/icons-material/Straighten';
import AnalyticsIcon from '@mui/icons-material/Analytics';

// Common components
import { 
  AnimatedIcon, 
  DiagnosticsDialog
} from '../common';

// Chart components - direct imports to fix rendering
import AreaChart from '../common/charts/AreaChart';
import LineChart from '../common/charts/LineChart';
import BarChart from '../common/charts/BarChart';

// Constants and utilities
import { HR_ZONES } from '../../constants/heartRateConstants';
import { 
  downsampleData,
  enhanceHeartRateData,
  calculateDataQualityScore
} from '../../utils/chart/processHealthData';
import { combineDataForComparison } from '../../utils/chart/combineDataForComparison';
import { getHeartRateZone } from '../../utils/heartRateUtils';

// Additional components from the refactored code
import HeartRateAnalysisPanel from './heartRate/HeartRateAnalysisPanel';

/**
 * Heart Rate Chart component
 * Displays and controls heart rate visualization from different data sources
 * 
 * @param {Object} props
 * @param {Array} props.data - Main heart rate data
 * @param {Array} props.fitbitData - Fitbit heart rate data
 * @param {Array} props.googleFitData - Google Fit heart rate data
 * @param {Array} props.appleHealthData - Apple Health heart rate data
 * @param {string} props.dataSource - Current data source ('auto', 'fitbit', 'googleFit', etc.)
 * @param {string} props.period - Time period ('day', 'week', 'month', etc.)
 * @param {Array} props.tokenScopes - Available token scopes
 * @param {boolean} props.isAuthenticated - Whether user is authenticated
 * @param {Date} props.date - Current date
 * @param {Object} props.availableSources - Available data sources
 * @param {Function} props.onDataSourceChange - Handler for data source changes
 * @returns {JSX.Element}
 */
const HeartRateChart = ({
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
  const [zoneView, setZoneView] = useState(false);
  const [resolution, setResolution] = useState('medium');
  const [chartType, setChartType] = useState('area');
  const [processedData, setProcessedData] = useState([]);
  const [currentHeartRate, setCurrentHeartRate] = useState(70);
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
    // Log data for debugging
    console.log("HeartRateChart data processing");
    console.log("- Main data length:", data?.length || 0);
    console.log("- Google Fit data length:", googleFitData?.length || 0);
    console.log("- Fitbit data length:", fitbitData?.length || 0);
    console.log("- Data source:", dataSource);
    console.log("- Current date:", date);
    console.log("- Current period:", period);
    
    // Calculate data quality scores
    const qualityScores = {
      fitbit: calculateDataQualityScore(fitbitData),
      googleFit: calculateDataQualityScore(googleFitData),
      appleHealth: calculateDataQualityScore(appleHealthData)
    };
    setDataQualityScores(qualityScores);
    
    // Explicitly log the lengths for debugging
    console.log("Data lengths check:");
    console.log("- Main data:", data?.length);
    console.log("- Google Fit data:", googleFitData?.length);
    console.log("- Fitbit data:", fitbitData?.length);
    console.log("- Apple Health data:", appleHealthData?.length);
    
    // If no data, early return
    if (!data || data.length === 0) {
      console.log("Main data is empty, checking alternatives");
      
      // MODIFIED: Use Google Fit data as fallback if available
      if (googleFitData && googleFitData.length > 0) {
        console.log("Using Google Fit data as fallback because main data is empty");
        processHeartRateData(googleFitData, 'googleFit');
        return;
      }
      
      // Create empty placeholder if no data available
      console.log("No data available, creating placeholder");
      const placeholderData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        date: format(new Date(), 'yyyy-MM-dd'),
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
    
    // Process data based on source and mode
    if (compareMode) {
      // When comparing, combine data from all sources
      const combinedData = combineDataForComparison({
        fitbit: fitbitData,
        googleFit: googleFitData,
        appleHealth: appleHealthData
      });
      setProcessedData(combinedData);
      
      // Get current heart rate from the latest data
      const latestPoint = combinedData[combinedData.length - 1];
      if (latestPoint) {
        const latestValue = latestPoint.googleFitAvg || latestPoint.fitbitAvg || latestPoint.appleHealthAvg || 0;
        setCurrentHeartRate(Math.round(latestValue));
      }
    } else {
      // MODIFIED: Process based on selected data source
      let sourceData = data;
      let sourceName = 'auto';
      
      console.log("Processing with data source:", dataSource);
      
      // Explicitly use Google Fit data if available and selected
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
        // MODIFIED: Priority to Google Fit data if available
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
      
      // CRITICAL FIX: Check if sourceData has been properly assigned
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
        processHeartRateData(sourceData, sourceName);
      } else {
        console.warn("No valid data source found for heart rate chart");
        // Create placeholder data as fallback
        const placeholderData = Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          date: format(new Date(), 'yyyy-MM-dd'),
          avg: 0,
          min: 0,
          max: 0,
          zoneColor: "#8884d8",
          zoneName: "N/A",
          source: "none"
        }));
        setProcessedData(placeholderData);
        setCurrentHeartRate(0);
      }
    }
  }, [data, googleFitData, fitbitData, appleHealthData, dataSource, resolution, compareMode, period]);
  
  // Process heart rate data for display
  const processHeartRateData = (sourceData, sourceName) => {
    if (!sourceData || sourceData.length === 0) {
      console.warn("No source data to process");
      return;
    }
    
    // Check if we only have a placeholder data point for today
    const hasOnlyPlaceholder = sourceData.length === 1 && sourceData[0].placeholder === true;
    if (hasOnlyPlaceholder) {
      console.log("Only placeholder data available for today");
      setCurrentHeartRate(0);
      setProcessedData([sourceData[0]]);
      return;
    }
    
    console.log(`Processing ${sourceName} data with ${sourceData.length} points`);
    console.log("Sample data point:", sourceData[0]);
    
    // Set target points based on resolution
    let targetPoints;
    switch (resolution) {
      case 'low': targetPoints = 500; break;
      case 'high': targetPoints = 5000; break;
      default: targetPoints = 2000; break;
    }
    
    // Downsample and enhance data
    const downsampledData = downsampleData(sourceData, targetPoints);
    console.log(`Downsampled to ${downsampledData.length} points`);
    
    // MODIFIED: Check first few data points to debug format issues
    if (downsampledData.length > 0) {
      console.log("First data point after downsampling:", downsampledData[0]);
      
      // Verify that the data has expected fields
      const hasValue = 'value' in downsampledData[0];
      const hasAvg = 'avg' in downsampledData[0];
      console.log(`Data has 'value' field: ${hasValue}, 'avg' field: ${hasAvg}`);
      
      // We now handle normalization completely in the enhanceHeartRateData function
      if (sourceName === 'googleFit' && hasValue && !hasAvg) {
        console.log("Google Fit data detected - will be normalized in enhance function");
      }
    }
    
    const enhanced = enhanceHeartRateData(downsampledData, sourceName);
    console.log(`Enhanced data has ${enhanced.length} points`);
    if (enhanced.length > 0) {
      console.log("First enhanced data point:", enhanced[0]);
    }
    
    setProcessedData(enhanced);
    
    // Get current heart rate from latest data point
    if (enhanced.length > 0) {
      // Find the most recent data point with a valid heart rate
      const validPoints = enhanced.filter(point => 
        (point.avg !== undefined && point.avg > 0) || 
        (point.value !== undefined && point.value > 0)
      );
      
      if (validPoints.length > 0) {
        const latestPoint = validPoints[validPoints.length - 1];
        const latestValue = latestPoint.avg || latestPoint.value || 0;
        console.log(`Setting current heart rate to ${latestValue} from latest data point`);
        setCurrentHeartRate(Math.round(latestValue));
      } else {
        console.warn("No valid heart rate found in enhanced data");
        setCurrentHeartRate(0);
      }
    } else {
      console.warn("No enhanced data points available");
      setCurrentHeartRate(0);
    }
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
  
  // Find min/max values for Y axis
  const { minValue, maxValue } = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return { minValue: 40, maxValue: 160 };
    }
    
    let min = 40;
    let max = 160;
    
    processedData.forEach(item => {
      // Check all potential heart rate values
      const values = [];
      
      // Regular data
      if (item.min && item.min > 0) values.push(item.min);
      if (item.max) values.push(item.max);
      if (item.avg) values.push(item.avg);
      if (item.value) values.push(item.value);
      
      // Source-specific fields for comparison mode
      if (item.fitbitAvg) values.push(item.fitbitAvg);
      if (item.googleFitAvg) values.push(item.googleFitAvg);
      if (item.appleHealthAvg) values.push(item.appleHealthAvg);
      
      // Update min/max
      min = Math.min(min, ...values.filter(v => v > 0));
      max = Math.max(max, ...values);
    });
    
    // Add padding to the range
    return {
      minValue: Math.max(30, Math.floor(min * 0.9)),
      maxValue: Math.ceil(max * 1.1)
    };
  }, [processedData]);
  
  // Create reference areas for heart rate zones
  const zoneReferenceAreas = useMemo(() => {
    if (!zoneView) return [];
    
    return HR_ZONES.map((zone) => ({
      y1: zone.min,
      y2: zone.max,
      fill: zone.color,
      fillOpacity: 0.1,
      stroke: 'none',
      label: { 
        value: zone.name, 
        position: 'insideLeft',
        fill: zone.color,
        fontSize: 10 
      }
    }));
  }, [zoneView]);
  
  // Create chart series based on mode and data source
  const chartSeries = useMemo(() => {
    if (compareMode) {
      // Comparison mode series
      const series = [];
      
      if (availableSources.fitbit) {
        series.push({
          dataKey: 'fitbitAvg',
          name: 'Fitbit',
          color: '#1976d2',
          strokeWidth: 2,
          gradientId: 'colorFitbit',
          fillOpacity: { start: 0.8, end: 0.1 }
        });
      }
      
      if (availableSources.googleFit) {
        series.push({
          dataKey: 'googleFitAvg',
          name: 'Google Fit',
          color: '#4caf50',
          strokeWidth: 2,
          gradientId: 'colorGoogleFit',
          fillOpacity: { start: 0.8, end: 0.1 }
        });
      }
      
      if (availableSources.appleHealth) {
        series.push({
          dataKey: 'appleHealthAvg',
          name: 'Apple Health',
          color: '#f44336',
          strokeWidth: 2,
          gradientId: 'colorAppleHealth',
          fillOpacity: { start: 0.8, end: 0.1 }
        });
      }
      
      return series;
    } else if (zoneView) {
      // Zone view series (stacked areas)
      return HR_ZONES.map(zone => ({
        dataKey: zone.name.toLowerCase().replace(' ', ''),
        name: zone.name,
        color: zone.color,
        strokeWidth: 1,
        stackId: 'zones',
        gradientId: `color${zone.name.replace(' ', '')}`,
        fillOpacity: { start: 0.8, end: 0.2 }
      }));
    } else {
      // Standard single series with enhanced data accessor
      const series = [
        {
          // CRITICAL FIX: Always use direct field reference 'avg'
          dataKey: 'avg',
          name: 'Heart Rate',
          color: '#3f51b5',
          strokeWidth: 2,
          gradientId: 'colorAvg',
          fillOpacity: { start: 0.8, end: 0.1 },
          activeDot: { 
            r: 6, 
            strokeWidth: 1, 
            stroke: '#fff',
            fill: props => {
              // CRITICAL FIX: Use consistent field reference
              const hr = props.payload.avg;
              if (!hr) return '#3f51b5';
              const zone = getHeartRateZone(hr);
              return zone?.color || '#3f51b5';
            }
          }
        }
      ];
      
      // Add min/max range if requested
      if (showRange) {
        series.push({
          dataKey: 'min',
          name: 'Min',
          color: '#4caf50',
          strokeWidth: 1,
          fillColor: 'none'
        });
        
        series.push({
          dataKey: 'max',
          name: 'Max',
          color: '#ff9800',
          strokeWidth: 1,
          gradientId: 'colorRange',
          fillOpacity: { start: 0.3, end: 0.3 },
          stackId: 'minmax'
        });
      }
      
      return series;
    }
  }, [compareMode, availableSources, zoneView, showRange, processedData]);
  
  // Series for bar chart with item colors based on heart rate zone
  const barChartSeries = useMemo(() => {
    if (compareMode) {
      // Similar to regular series for comparison mode
      return chartSeries;
    } else {
      return [
        {
          // CRITICAL FIX: Use direct field reference instead of function accessor
          // Now that our data is normalized, we can always use 'avg' directly
          dataKey: 'avg',
          name: 'Heart Rate',
          color: '#3f51b5',
          barSize: processedData.length > 50 ? 3 : 8,
          radius: 2,
          // Color each bar based on heart rate zone
          itemColors: true,
          getItemColor: (entry) => {
            // Use the normalized field
            const hrValue = entry.avg;
            if (!hrValue) return '#3f51b5';
            const zone = getHeartRateZone(hrValue);
            return zone?.color || '#3f51b5';
          }
        }
      ];
    }
  }, [compareMode, chartSeries, processedData.length, processedData]);
  
  // Helper to render the selected chart type
  const renderChart = () => {
    try {
      // CRITICAL FIX: Always use formattedTime for day view since we now normalize it for all data points
      const commonProps = {
        data: processedData,
        series: chartType === 'bar' ? barChartSeries : chartSeries,
        referenceAreas: zoneReferenceAreas,
        // CRITICAL FIX: Always use consistent time field formatting
        xAxisDataKey: period === 'day' ? "formattedTime" : "date",
        height: 400
      };
      
      // Extended debug logging
      console.log(`Rendering ${chartType} chart with ${processedData.length} data points`);
      console.log(`Chart Y-axis range: ${minValue} to ${maxValue}`);
      console.log(`Chart X-axis key: ${commonProps.xAxisDataKey}`);
      
      // Add detailed data inspection - log first 2 data points
      if (processedData && processedData.length > 0) {
        console.log("CHART DATA SAMPLE:");
        console.log(processedData.slice(0, 2));
        
        // Check for the presence of 'avg' field in data
        const samplePoint = processedData[0];
        console.log("First point fields:", Object.keys(samplePoint));
        console.log("Has 'avg' field:", 'avg' in samplePoint);
        console.log("Value of 'avg':", samplePoint.avg);
        
        // Log the series configuration
        console.log("Chart series config:", JSON.stringify(commonProps.series, null, 2));
      }
      
      // Check for potential time range issues
      if (processedData.length > 0) {
        console.log("First data point in chart:", processedData[0]);
        console.log("Last data point in chart:", processedData[processedData.length - 1]);
        
        // Count data points per hour to identify time gaps
        const pointsByHour = {};
        processedData.forEach(point => {
          const timestamp = point.timestamp || 
            (point.date ? new Date(point.date + (point.time ? ' ' + point.time : '')).getTime() / 1000 : 0);
          
          if (timestamp) {
            const hour = new Date(timestamp * 1000).getHours();
            pointsByHour[hour] = (pointsByHour[hour] || 0) + 1;
          }
        });
        
        console.log("Data points distribution by hour:", pointsByHour);
        
        // Check data distribution between AM and PM
        const amPoints = processedData.filter(point => {
          return point.formattedTime && point.formattedTime.includes('AM');
        });
        
        const pmPoints = processedData.filter(point => {
          return point.formattedTime && point.formattedTime.includes('PM');
        });
        
        console.log(`Data points by period: ${amPoints.length} AM points, ${pmPoints.length} PM points`);
        
        // Get the last time in the dataset
        if (processedData.length > 0) {
          const lastPoint = processedData[processedData.length - 1];
          console.log(`Last data point time: ${lastPoint.formattedTime || 'unknown'}`);
        }
        // Log sample points from PM for verification
        if (pmPoints.length > 0) {
          console.log("Sample PM data points:", pmPoints.slice(0, 3));
        }
      }
      
      // Check if the chart components are available
      if (!AreaChart || !LineChart || !BarChart) {
        console.error("Chart components not found. Make sure they're properly imported.");
        return (
          <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography color="error" variant="h6">Chart components not loaded</Typography>
            <Typography variant="body2" color="text.secondary">
              There was an issue loading the chart components. Please check the console for errors.
            </Typography>
          </Box>
        );
      }
      
      switch (chartType) {
        case 'line':
          return <LineChart {...commonProps} />;
          
        case 'bar':
          return <BarChart {...commonProps} />;
          
        case 'area':
        default:
          return <AreaChart {...commonProps} />;
      }
    } catch (error) {
      console.error("Error rendering chart:", error);
      return (
        <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 2 }}>
          <Typography color="error" variant="h6">Chart rendering failed</Typography>
          <Typography variant="body2" color="text.secondary">
            {error.message || "There was an error rendering the chart. Please try refreshing."}
          </Typography>
        </Box>
      );
    }
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
      
      {/* Header with current heart rate */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: { xs: 2, md: 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AnimatedIcon 
            icon={<FavoriteIcon />} 
            value={currentHeartRate} 
            unit="BPM" 
            size="large" 
            frequency={currentHeartRate / 60}
            color={getHeartRateZone(currentHeartRate)?.color} 
          />
          
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
                  checked={zoneView}
                  onChange={(e) => setZoneView(e.target.checked)}
                  size="small"
                />
              }
              label="Zones"
              sx={{ m: 0 }}
            />
            
            {/* Added compare mode switch with clear labeling */}
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
      
      {/* Heart rate zones legend */}
      {zoneView && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {HR_ZONES.map((zone) => (
            <Box 
              key={zone.name}
              component="span"
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                background: zone.gradient,
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {zone.icon} {zone.name}: {zone.min}-{zone.max} BPM
            </Box>
          ))}
        </Box>
      )}
    
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
      
      {/* Heart rate analysis panel */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: showAnalysis ? 1 : 0,
          height: showAnalysis ? 'auto' : 0,
          marginTop: showAnalysis ? 24 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {showAnalysis && <HeartRateAnalysisPanel data={processedData} period={period} />}
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
        dataType="heart-rate"
        requiredScopes={['heartrate']}
      />
    </Paper>
  );
};

export default HeartRateChart;