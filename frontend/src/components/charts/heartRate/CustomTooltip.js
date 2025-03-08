import React from 'react';
import { Box, Paper, Typography, Grid, alpha, useTheme } from '@mui/material';
import { format } from 'date-fns';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { getHeartRateZone } from '../../../utils/heartRateUtils';

/**
 * Enhanced tooltip component for heart rate charts
 * Provides detailed information about the heart rate data point
 * 
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether the tooltip is active
 * @param {Array} props.payload - The data payload
 * @param {string} props.label - The tooltip label
 * @returns {JSX.Element|null}
 */
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const hrZone = data.avg ? getHeartRateZone(data.avg) : null;
  
  // Calculate timestamp if available
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

export default CustomTooltip;