import React from 'react';
import { Box, Typography, Paper, useTheme, alpha } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { format } from 'date-fns';
import { getHeartRateZone } from '../../../utils/heartRateUtils';

/**
 * A stylish custom tooltip component for charts
 */
const CustomTooltip = ({ active, payload, label, minValue, maxValue }) => {
  const theme = useTheme();
  
  // Handle invalid or empty data
  if (!active || !payload || !payload.length) {
    return null;
  }
  
  // Extra safety - if payload doesn't have any valid data, return null
  try {
    const hasValidValue = payload.some(item => 
      item && item.value !== undefined && 
      typeof item.value === 'number' && 
      !isNaN(item.value)
    );
    
    if (!hasValidValue) {
      console.warn("Tooltip received payload without valid values", payload);
      return null;
    }
  } catch (error) {
    console.error("Error checking tooltip payload:", error);
    return null;
  }
  
  // Get primary heart rate value (first series) with safety checks
  const value = payload[0]?.value;
  const heartRate = value !== undefined && !isNaN(value) ? value : 0;
  const hrZone = getHeartRateZone(heartRate);
  
  // Extract date information from the data point
  const dataPoint = payload[0]?.payload || {};
  const pointDate = dataPoint.date || format(new Date(), 'yyyy-MM-dd');
  const pointTime = dataPoint.time || dataPoint.formattedTime || format(new Date(), 'hh:mm:ss a');
  
  console.log("Tooltip received data point:", dataPoint);
  
  // Animation for the pulsing effect
  const pulseKeyframes = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
  `;
  
  return (
    <Paper
      elevation={8}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: 2,
        minWidth: 200,
        maxWidth: 300,
        borderRadius: 3,
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        border: `2px solid ${hrZone?.color || theme.palette.primary.main}`,
        boxShadow: `0 10px 20px ${alpha(hrZone?.color || theme.palette.primary.main, 0.3)}`,
      }}
    >
      <style>{pulseKeyframes}</style>
      
      {/* Animated heart indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: hrZone?.color || theme.palette.primary.main,
          animation: 'pulse 1.5s infinite ease-in-out',
        }}
      >
        <FavoriteIcon fontSize="large" />
      </Box>
      
      {/* Time and date information */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 0.5 }}>
          {pointTime}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
          {pointDate}
        </Typography>
      </Box>
      
      {/* Heart rate value with zone */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'baseline', 
        mt: 2, 
        gap: 1 
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 800, 
          color: hrZone?.color || theme.palette.primary.main 
        }}>
          {Math.round(heartRate)}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
          BPM
        </Typography>
      </Box>
      
      {/* Heart rate zone */}
      <Box sx={{ 
        mt: 1, 
        p: 1, 
        borderRadius: 2, 
        backgroundColor: alpha(hrZone?.color || theme.palette.primary.main, 0.1),
        border: `1px solid ${alpha(hrZone?.color || theme.palette.primary.main, 0.2)}`,
        display: 'inline-block'
      }}>
        <Typography variant="body2" sx={{ 
          fontWeight: 700, 
          color: hrZone?.color || theme.palette.primary.main 
        }}>
          {hrZone?.name || 'Unknown'} Zone
        </Typography>
      </Box>
      
      {/* Additional data points */}
      <Box sx={{ mt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`, pt: 1 }}>
        {payload.slice(1).map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" sx={{ color: entry.color || theme.palette.text.secondary }}>
              {entry.name}:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: entry.color || theme.palette.text.primary }}>
              {Math.round(entry.value)} BPM
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default CustomTooltip;