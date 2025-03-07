import React from 'react';
import { Box, Paper, Typography, Grid, alpha, useTheme } from '@mui/material';
import { format } from 'date-fns';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { getHeartRateZone } from '../../utils/heartRateUtils';

/**
 * Enhanced tooltip component for charts
 * Provides detailed information about data points
 * 
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether the tooltip is active
 * @param {Array} props.payload - The data payload
 * @param {string} props.label - The tooltip label
 * @param {Object} props.options - Custom options for the tooltip
 * @returns {JSX.Element|null}
 */
const ChartTooltip = ({ active, payload, label, options = {} }) => {
  const theme = useTheme();
  const { type = 'heart-rate' } = options;
  
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  // Process timestamp if available
  let timestamp;
  if (data.timestamp) {
    const date = new Date(data.timestamp * 1000);
    timestamp = format(date, 'yyyy-MM-dd HH:mm:ss');
  } else if (data.date) {
    timestamp = data.time ? `${data.date} at ${data.time}` : data.date;
  } else if (data.formattedTime) {
    timestamp = data.formattedTime;
  } else if (typeof label === 'string') {
    timestamp = label;
  } else {
    timestamp = 'Unknown time';
  }
  
  if (type === 'heart-rate') {
    const hrZone = data.avg ? getHeartRateZone(data.avg) : null;
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
  }
  
  // Activity chart tooltip
  if (type === 'activity') {
    const data = payload[0].payload;
    
    return (
      <Paper
        elevation={4}
        sx={{
          p: 0,
          borderRadius: 2,
          maxWidth: 280,
          backdropFilter: 'blur(8px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(200, 200, 200, 0.5)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 1.5, 
          background: 'linear-gradient(90deg, #4caf50, #8bc34a)', 
          color: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {data.dateTime || label} {data.time && `- ${data.time}`}
          </Typography>
          {data.activityLevel && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Activity Level: {data.activityLevel}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ p: 2 }}>
          {/* Primary metrics grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 1.5 }}>
            {data.steps !== undefined && (
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
                  Steps
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                  {data.steps.toLocaleString()}
                </Typography>
              </Paper>
            )}
            
            {data.calories !== undefined && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Calories
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                  {data.calories.toLocaleString()}
                </Typography>
              </Paper>
            )}
            
            {data.activeMinutes !== undefined && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Active Minutes
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {data.activeMinutes}
                </Typography>
              </Paper>
            )}
            
            {data.distance !== undefined && (
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
                  Distance
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                  {data.distance} <Typography component="span" variant="caption">km</Typography>
                </Typography>
              </Paper>
            )}
            
            {data.floors !== undefined && data.floors > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[700], 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Floors Climbed
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.grey[700] }}>
                  {data.floors}
                </Typography>
              </Paper>
            )}
          </Box>
          
          {/* Activity breakdown if available */}
          {data.lightActiveMinutes !== undefined && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Activity Breakdown
              </Typography>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.success.light, 0.05), 
                  borderRadius: 1,
                  border: `1px dashed ${alpha(theme.palette.success.light, 0.3)}`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Sedentary: <strong>{data.sedentaryMinutes} min</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Light: <strong>{data.lightActiveMinutes} min</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Moderate: <strong>{data.moderateActiveMinutes} min</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vigorous: <strong>{data.vigorousActiveMinutes} min</strong>
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>
    );
  }
  
  // Sleep chart tooltip
  if (type === 'sleep') {
    const data = payload[0].payload;
    
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
          description: 'Optimal sleep quality'
        },
        { 
          name: 'Good', 
          min: 80, 
          max: 89, 
          color: '#2196f3', 
          gradient: 'linear-gradient(135deg, #2196f3 0%, #4dabf5 100%)',
          description: 'Good sleep with proper cycles'
        },
        { 
          name: 'Fair', 
          min: 70, 
          max: 79, 
          color: '#009688', 
          gradient: 'linear-gradient(135deg, #009688 0%, #4db6ac 100%)',
          description: 'Average, could improve'
        },
        { 
          name: 'Poor', 
          min: 50, 
          max: 69, 
          color: '#ff9800', 
          gradient: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
          description: 'Below average quality'
        },
        { 
          name: 'Very Poor', 
          min: 0, 
          max: 49, 
          color: '#f44336', 
          gradient: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
          description: 'Insufficient or disrupted'
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
    
    const qualityLevel = getSleepQualityLevel(data.score);
    
    return (
      <Paper
        elevation={4}
        sx={{
          p: 0,
          borderRadius: 2,
          maxWidth: 280,
          backdropFilter: 'blur(8px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(200, 200, 200, 0.5)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 1.5, 
          background: qualityLevel?.gradient || 'linear-gradient(90deg, #9c27b0, #673ab7)', 
          color: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {data.date || label}
          </Typography>
          {qualityLevel && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {qualityLevel.name} Quality {data.score ? `(${data.score}/100)` : ''}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ p: 2 }}>
          {/* Primary metrics grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 1.5 }}>
            {data.durationMinutes !== undefined && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Duration
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {formatDuration(data.durationMinutes)}
                </Typography>
              </Paper>
            )}
            
            {data.efficiency !== undefined && (
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
                  Efficiency
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                  {data.efficiency}%
                </Typography>
              </Paper>
            )}
            
            {data.durationHours !== undefined && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Hours
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {data.durationHours.toFixed(1)}
                </Typography>
              </Paper>
            )}
            
            {data.score > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1, 
                  textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  bgcolor: alpha(qualityLevel?.color || theme.palette.secondary.main, 0.08)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Score
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: qualityLevel?.color || theme.palette.secondary.main }}>
                  {data.score}/100
                </Typography>
              </Paper>
            )}
          </Box>
          
          {/* Sleep stages breakdown if available */}
          {data.deepSleepMinutes !== undefined && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Sleep Stages
              </Typography>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.background.default, 0.5), 
                  borderRadius: 1,
                  border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#3f51b5', fontWeight: 'medium' }}>
                    Deep: {formatDuration(data.deepSleepMinutes)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 'medium' }}>
                    Light: {formatDuration(data.lightSleepMinutes)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#2196f3', fontWeight: 'medium' }}>
                    REM: {formatDuration(data.remSleepMinutes)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 'medium' }}>
                    Awake: {formatDuration(data.awakeDuringNight || 0)}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>
    );
  }
  
  // General purpose tooltip for other chart types
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        maxWidth: 250,
        backdropFilter: 'blur(8px)',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(200, 200, 200, 0.5)',
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {timestamp}
      </Typography>
      
      {payload.map((entry, index) => (
        <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: entry.color || '#8884d8'
            }} 
          />
          <Typography variant="body2">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

export default ChartTooltip;