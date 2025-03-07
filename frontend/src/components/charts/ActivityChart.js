import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';

// Import reusable chart components
import { AreaChart, LineChart, BarChart } from '../common/charts';
import DiagnosticsDialog from '../common/DiagnosticsDialog';

// Enhanced ActivityChart component using reusable components
const ActivityChart = ({ 
  data, 
  period,
  dataSource,
  fitbitData,
  googleFitData,
  appleHealthData,
  tokenScopes,
  isAuthenticated,
  date,
  availableSources,
  onDataSourceChange
}) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState('steps');
  const [chartData, setChartData] = useState([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Process data when it changes or view type changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Create copy to avoid modifying original data
    const processedData = [...data];
    
    // Sort by date/time
    if (period === 'day') {
      processedData.sort((a, b) => {
        if (a.time && b.time) {
          // Convert 12-hour time format to comparable value
          const getTimeValue = (timeStr) => {
            const [timePart, ampm] = timeStr.split(' ');
            let [hour, minute] = timePart.split(':').map(Number);
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            return hour * 60 + minute;
          };
          return getTimeValue(a.time) - getTimeValue(b.time);
        }
        return 0;
      });
    } else {
      processedData.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    }
    
    setChartData(processedData);
  }, [data, viewType, period]);
  
  // Calculate data quality scores for diagnostics
  const dataQualityScores = useMemo(() => {
    const calculateScore = (sourceData) => {
      if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) return 0;
      
      // Score based on quantity (30%)
      const quantityScore = Math.min(100, (sourceData.length / 50) * 100) * 0.3;
      
      // Score based on completeness (40%)
      let completenessScore = 0;
      const keysToCheck = ['steps', 'activeMinutes', 'calories', 'distance'];
      const completeItems = sourceData.filter(item => 
        keysToCheck.every(key => item[key] !== undefined && item[key] !== null)
      );
      completenessScore = (completeItems.length / sourceData.length) * 100 * 0.4;
      
      // Score based on consistency (30%)
      let consistencyScore = 0;
      if (sourceData.length > 1) {
        const hasConsistentTimes = sourceData.every(item => 
          (period === 'day' && item.time) || 
          (period !== 'day' && item.dateTime)
        );
        consistencyScore = hasConsistentTimes ? 30 : 15;
      }
      
      return Math.round(quantityScore + completenessScore + consistencyScore);
    };
    
    return {
      fitbit: calculateScore(fitbitData),
      googleFit: calculateScore(googleFitData),
      appleHealth: calculateScore(appleHealthData)
    };
  }, [fitbitData, googleFitData, appleHealthData, period]);
  
  // Common configs for all charts
  const getChartConfig = () => {
    // Base configuration that applies to all chart types
    const baseConfig = {
      data: chartData,
      xAxisDataKey: period === 'day' ? "time" : "dateTime",
      minYValue: 0,
      showBrush: chartData.length > 10,
      tooltipOptions: {
        type: 'activity',
      }
    };
    
    // Type-specific configurations
    switch (viewType) {
      case 'steps':
        return {
          ...baseConfig,
          maxYValue: Math.max(10000, ...chartData.map(item => item.steps || 0)) * 1.1,
          series: [
            {
              dataKey: "steps",
              name: "Steps",
              color: theme.palette.success.main,
              strokeWidth: 2,
              // Custom styling for bars
              barSize: chartData.length > 30 ? 4 : 10,
              radius: [4, 4, 0, 0],
              // Custom coloring based on step count
              getItemColor: (entry) => {
                if (!entry.steps) return theme.palette.grey[300];
                if (entry.steps >= 10000) return theme.palette.success.main;
                if (entry.steps >= 7500) return theme.palette.info.main;
                if (entry.steps >= 5000) return theme.palette.warning.main;
                return theme.palette.error.light;
              },
              itemColors: true
            },
            {
              dataKey: "steps",
              name: "Trend",
              color: alpha(theme.palette.success.dark, 0.7),
              strokeWidth: 2,
              type: "monotone",
              dot: false
            }
          ],
          referenceAreas: [
            {
              y1: 0,
              y2: 10000,
              x1: baseConfig.xAxisDataKey,
              x2: baseConfig.xAxisDataKey,
              fill: alpha(theme.palette.success.main, 0.05),
              label: { value: 'Goal: 10,000', position: 'insideTopRight', fill: theme.palette.success.main }
            }
          ]
        };
        
      case 'calories':
        return {
          ...baseConfig,
          maxYValue: Math.max(2000, ...chartData.map(item => item.calories || 0)) * 1.1,
          series: [
            {
              dataKey: "calories",
              name: "Calories",
              color: theme.palette.warning.main,
              strokeWidth: 2,
              // Configure gradient fill
              gradientId: 'caloriesGradient',
              fillOpacity: { start: 0.8, end: 0.1 }
            }
          ],
          referenceAreas: period !== 'day' ? [
            {
              y1: 0,
              y2: 2000,
              fill: alpha(theme.palette.warning.main, 0.05),
              label: { value: 'Target: 2,000', position: 'insideTopRight', fill: theme.palette.warning.main }
            }
          ] : []
        };
        
      case 'activeMinutes':
        return {
          ...baseConfig,
          maxYValue: Math.max(60, ...chartData.map(item => item.activeMinutes || 0)) * 1.1,
          series: [
            {
              dataKey: "activeMinutes",
              name: "Active Minutes",
              color: theme.palette.primary.main,
              // Custom styling for bars
              barSize: chartData.length > 30 ? 4 : 12,
              radius: [4, 4, 0, 0],
              // Custom coloring based on active minutes
              getItemColor: (entry) => {
                if (!entry.activeMinutes) return theme.palette.grey[300];
                if (entry.activeMinutes >= 30) return theme.palette.primary.main;
                if (entry.activeMinutes >= 20) return theme.palette.info.main;
                if (entry.activeMinutes >= 10) return theme.palette.warning.main;
                return theme.palette.error.light;
              },
              itemColors: true
            }
          ],
          referenceAreas: [
            {
              y1: 0,
              y2: 30,
              fill: alpha(theme.palette.primary.main, 0.05),
              label: { value: 'Goal: 30 min', position: 'insideTopRight', fill: theme.palette.primary.main }
            }
          ]
        };
        
      case 'distance':
        return {
          ...baseConfig,
          maxYValue: Math.max(5, ...chartData.map(item => item.distance || 0)) * 1.1,
          series: [
            {
              dataKey: "distance",
              name: "Distance (km)",
              color: theme.palette.info.main,
              strokeWidth: 2,
              // Add dots for distance line chart
              dot: { r: 4, fill: theme.palette.info.main, stroke: '#fff', strokeWidth: 1 }
            }
          ],
          referenceAreas: [
            {
              y1: 0,
              y2: 5,
              fill: alpha(theme.palette.info.main, 0.05),
              label: { value: 'Goal: 5 km', position: 'insideTopRight', fill: theme.palette.info.main }
            }
          ]
        };
        
      case 'hourly':
        // Special case for hourly breakdown (day view only)
        return {
          ...baseConfig,
          maxYValue: Math.max(5000, ...chartData.map(item => item.steps || 0)) * 1.1,
          series: [
            {
              dataKey: "steps",
              name: "Steps",
              color: theme.palette.success.main,
              // Styling for bars
              barSize: 10,
              radius: [4, 4, 0, 0]
            },
            {
              dataKey: "calories",
              name: "Calories",
              color: theme.palette.warning.main,
              strokeWidth: 2,
              type: "monotone"
            }
          ],
          referenceAreas: [
            {
              x1: "6:00 AM",
              x2: "12:00 PM",
              fill: alpha(theme.palette.grey[100], 0.4),
              fillOpacity: 0.2,
              label: { value: 'Morning', position: 'insideTop', fill: theme.palette.grey[600] }
            },
            {
              x1: "12:00 PM",
              x2: "6:00 PM",
              fill: alpha(theme.palette.grey[200], 0.4),
              fillOpacity: 0.2,
              label: { value: 'Afternoon', position: 'insideTop', fill: theme.palette.grey[600] }
            },
            {
              x1: "6:00 PM",
              x2: "11:59 PM",
              fill: alpha(theme.palette.grey[300], 0.4),
              fillOpacity: 0.2,
              label: { value: 'Evening', position: 'insideTop', fill: theme.palette.grey[600] }
            }
          ]
        };
        
      default:
        return baseConfig;
    }
  };
  
  // Determine which chart type to use based on view
  const renderChart = () => {
    const config = getChartConfig();
    
    switch (viewType) {
      case 'steps':
        return (
          <Box sx={{ height: 400, width: '100%' }}>
            <BarChart {...config} />
          </Box>
        );
        
      case 'calories':
        return (
          <Box sx={{ height: 400, width: '100%' }}>
            <AreaChart {...config} />
          </Box>
        );
        
      case 'activeMinutes':
        return (
          <Box sx={{ height: 400, width: '100%' }}>
            <BarChart {...config} />
          </Box>
        );
        
      case 'distance':
        return (
          <Box sx={{ height: 400, width: '100%' }}>
            <LineChart {...config} />
          </Box>
        );
        
      case 'hourly':
        // Special case for hourly breakdown using composite chart with bar and line
        return (
          <Box sx={{ height: 400, width: '100%' }}>
            <BarChart {...config} />
          </Box>
        );
        
      default:
        return (
          <Box sx={{ height: 400, width: '100%' }}>
            <BarChart {...config} />
          </Box>
        );
    }
  };
  
  if (!data || data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2, mb: 3 }}>
        <Typography color="text.secondary">No activity data available</Typography>
      </Paper>
    );
  }
  
  return (
    <>
      <Paper 
        elevation={3} 
        sx={{ 
          width: '100%', 
          p: 3, 
          borderRadius: 2,
          background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
          mb: 4,
          position: 'relative' 
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Activity Metrics
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {period === 'day' ? 'Daily activity breakdown' : period === 'week' ? '7-day activity metrics' : 'Monthly activity summary'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={viewType}
                label="View"
                onChange={(e) => setViewType(e.target.value)}
                size="small"
              >
                <MenuItem value="steps">Steps</MenuItem>
                <MenuItem value="calories">Calories</MenuItem>
                <MenuItem value="activeMinutes">Active Minutes</MenuItem>
                <MenuItem value="distance">Distance</MenuItem>
                {period === 'day' && <MenuItem value="hourly">Hourly Breakdown</MenuItem>}
              </Select>
            </FormControl>
            
            <Tooltip title="Show Diagnostics">
              <IconButton 
                size="small" 
                onClick={() => setShowDiagnostics(true)}
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {renderChart()}
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          {viewType === 'steps' 
            ? 'Steps tracked throughout the period. Goal is 10,000 steps per day.'
            : viewType === 'calories'
              ? 'Calories burned through activity and base metabolic rate.'
              : viewType === 'activeMinutes'
                ? 'Minutes spent in moderate to vigorous physical activity. Aim for at least 30 minutes daily.'
                : viewType === 'distance'
                  ? 'Total distance covered through walking, running, and other activities.'
                  : 'Hourly breakdown showing activity patterns throughout the day.'}
        </Typography>
        
        {viewType === 'steps' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 3, flexWrap: 'wrap' }}>
            <Chip 
              size="small" 
              label="< 5,000: Low Activity" 
              sx={{ bgcolor: alpha(theme.palette.error.light, 0.8), color: 'white' }}
            />
            <Chip 
              size="small" 
              label="5,000-7,499: Moderate" 
              sx={{ bgcolor: alpha(theme.palette.warning.main, 0.8), color: 'white' }}
            />
            <Chip 
              size="small" 
              label="7,500-9,999: Active" 
              sx={{ bgcolor: alpha(theme.palette.info.main, 0.8), color: 'white' }}
            />
            <Chip 
              size="small" 
              label="10,000+: Very Active" 
              sx={{ bgcolor: alpha(theme.palette.success.main, 0.8), color: 'white' }}
            />
          </Box>
        )}
      </Paper>
      
      {/* DiagnosticsDialog component */}
      <DiagnosticsDialog
        open={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        tokenScopes={tokenScopes}
        isAuthenticated={isAuthenticated}
        date={date}
        period={period}
        dataQualityScores={dataQualityScores}
        availableSources={availableSources}
        dataType="activity"
        requiredScopes={['activity']}
      />
    </>
  );
};

export default ActivityChart;