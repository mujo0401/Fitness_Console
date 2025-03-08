import React, { useEffect, useRef, useMemo } from 'react';
import { Box, Typography, useTheme, alpha, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * ActivityPulseWave component
 * Visualizes step pattern throughout the day as a beautiful wave form
 * 
 * @param {Object} props
 * @param {Array} props.data - Hourly activity data array
 * @param {number} props.height - Height of the visualization in pixels
 * @param {boolean} props.showHeartRate - Whether to show heart rate correlation
 * @param {Object} props.colors - Color configuration for waves
 */
const ActivityPulseWave = ({ 
  data = [], 
  height = 180,
  showHeartRate = true,
  colors = {
    steps: '#4caf50',
    heart: '#f44336',
    background: '#f1f8e9'
  }
}) => {
  const theme = useTheme();
  const canvasRef = useRef(null);
  
  // Process data for visualization
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return {
      hourlyData: [],
      maxSteps: 0,
      maxHeartRate: 0,
      peakTimes: []
    };
    
    // Filter and sort hourly data
    const hourlyData = [...data]
      .filter(item => item.time && item.steps !== undefined)
      .sort((a, b) => {
        // Sort by hour
        const getTimeValue = (timeStr) => {
          if (!timeStr) return 0;
          const [timePart, ampm] = timeStr.split(' ');
          let [hour, minute] = timePart.split(':').map(Number);
          if (ampm === 'PM' && hour < 12) hour += 12;
          if (ampm === 'AM' && hour === 12) hour = 0;
          return hour * 60 + (minute || 0);
        };
        return getTimeValue(a.time) - getTimeValue(b.time);
      });
      
    // Calculate max values for scaling
    const maxSteps = Math.max(...hourlyData.map(hour => hour.steps || 0), 1000);
    const maxHeartRate = Math.max(...hourlyData.map(hour => hour.heartRate || 0), 80);
    
    // Find peak activity times (top 20% of steps)
    const threshold = maxSteps * 0.7;
    const peakTimes = hourlyData.filter(hour => (hour.steps || 0) >= threshold);
    
    return {
      hourlyData,
      maxSteps,
      maxHeartRate,
      peakTimes
    };
  }, [data]);
  
  // Draw wave visualization using Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || processedData.hourlyData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const { hourlyData, maxSteps, maxHeartRate } = processedData;
    
    // Set canvas dimensions with higher resolution for sharper rendering
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = colors.background || alpha(theme.palette.primary.light, 0.05);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Config
    const pointWidth = canvas.offsetWidth / 24; // 24 hours
    const baseY = height * 0.9; // Bottom baseline
    
    // Draw time markers (hours)
    ctx.strokeStyle = alpha(theme.palette.text.secondary, 0.1);
    ctx.fillStyle = alpha(theme.palette.text.secondary, 0.4);
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let hour = 0; hour < 24; hour += 3) {
      const x = (hour / 24) * canvas.offsetWidth;
      
      // Draw vertical line
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Draw hour label
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? 'AM' : 'PM';
      ctx.fillText(`${displayHour}${ampm}`, x, height - 5);
    }
    
    // Draw steps wave
    ctx.strokeStyle = colors.steps || theme.palette.primary.main;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    // Start at the left edge at the bottom
    ctx.moveTo(0, baseY);
    
    // Draw a point for each hour (0-23)
    for (let hour = 0; hour < 24; hour++) {
      // Find data for this hour
      const hourData = hourlyData.find(item => {
        if (!item.time) return false;
        const timeComponents = item.time.split(':')[0];
        const hourNum = parseInt(timeComponents);
        const ampm = item.time.split(' ')[1];
        
        let adjustedHour = hourNum;
        if (ampm === 'PM' && hourNum < 12) adjustedHour += 12;
        if (ampm === 'AM' && hourNum === 12) adjustedHour = 0;
        
        return adjustedHour === hour;
      });
      
      // Calculate x position
      const x = (hour / 24) * canvas.offsetWidth;
      
      // Calculate y position based on steps (inverted, higher steps = lower y value)
      let y = baseY;
      if (hourData && hourData.steps) {
        const normalizedSteps = hourData.steps / maxSteps;
        y = baseY - (normalizedSteps * height * 0.8); // Scale to 80% of height
      }
      
      // Add point to path
      ctx.lineTo(x, y);
    }
    
    // Complete the path back to the bottom-right
    ctx.lineTo(canvas.offsetWidth, baseY);
    
    // Fill with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, alpha(colors.steps || theme.palette.primary.main, 0.5));
    gradient.addColorStop(1, alpha(colors.steps || theme.palette.primary.main, 0.05));
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Stroke the path
    ctx.stroke();
    
    // Add heart rate line if enabled
    if (showHeartRate) {
      ctx.strokeStyle = colors.heart || theme.palette.error.main;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]); // Dashed line
      ctx.beginPath();
      
      // Draw a point for each hour with heart rate data
      let firstPoint = true;
      for (let hour = 0; hour < 24; hour++) {
        // Find data for this hour
        const hourData = hourlyData.find(item => {
          if (!item.time) return false;
          const timeComponents = item.time.split(':')[0];
          const hourNum = parseInt(timeComponents);
          const ampm = item.time.split(' ')[1];
          
          let adjustedHour = hourNum;
          if (ampm === 'PM' && hourNum < 12) adjustedHour += 12;
          if (ampm === 'AM' && hourNum === 12) adjustedHour = 0;
          
          return adjustedHour === hour;
        });
        
        // Skip if no heart rate data
        if (!hourData || !hourData.heartRate) continue;
        
        // Calculate x position
        const x = (hour / 24) * canvas.offsetWidth;
        
        // Calculate y position based on heart rate
        const normalizedHeartRate = hourData.heartRate / maxHeartRate;
        const y = height - (normalizedHeartRate * height * 0.8); // Scale to 80% of height
        
        // Add point to path
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // Stroke the heart rate path
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash pattern
    }
    
    // Highlight peak activity times
    processedData.peakTimes.forEach(peak => {
      // Convert time to hour
      if (!peak.time) return;
      const timeComponents = peak.time.split(':')[0];
      const hourNum = parseInt(timeComponents);
      const ampm = peak.time.split(' ')[1];
      
      let hour = hourNum;
      if (ampm === 'PM' && hourNum < 12) hour += 12;
      if (ampm === 'AM' && hourNum === 12) hour = 0;
      
      // Calculate position
      const x = (hour / 24) * canvas.offsetWidth;
      const normalizedSteps = peak.steps / maxSteps;
      const y = baseY - (normalizedSteps * height * 0.8);
      
      // Draw highlight circle
      ctx.fillStyle = alpha(colors.steps || theme.palette.primary.main, 0.7);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw pulsing effect (will be handled by CSS animation)
    });
    
  }, [processedData, height, theme, colors, showHeartRate]);
  
  // Find peak activity periods for display
  const peakActivityPeriods = useMemo(() => {
    if (processedData.peakTimes.length === 0) return [];
    
    // Convert to readable format
    return processedData.peakTimes.map(peak => {
      // Format time for display
      const timeStr = peak.time || '';
      
      // Format steps
      const steps = peak.steps?.toLocaleString() || 0;
      
      return { time: timeStr, steps };
    });
  }, [processedData.peakTimes]);
  
  // If no data, show placeholder
  if (!data || data.length === 0 || processedData.hourlyData.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No hourly activity data available
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ position: 'relative', height, width: '100%' }}>
      {/* Canvas for wave visualization */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute',
          width: '100%',
          height,
          display: 'block',
          borderRadius: theme.shape.borderRadius
        }}
      />
      
      {/* Overlay for labels and information */}
      <Box sx={{ position: 'absolute', top: 8, left: 12 }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            component="span" 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: colors.steps || theme.palette.primary.main,
              display: 'inline-block'
            }}
          />
          Steps
        </Typography>
        
        {showHeartRate && (
          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              component="span" 
              sx={{ 
                width: 12, 
                height: 4, 
                bgcolor: colors.heart || theme.palette.error.main,
                display: 'inline-block',
                borderRadius: 1
              }}
            />
            Heart Rate
          </Typography>
        )}
      </Box>
      
      {/* Overlay for peak activity indicators */}
      {peakActivityPeriods.map((peak, index) => {
        // Skip if missing time
        if (!peak.time) return null;
        
        // Convert time string to position
        const timeComponents = peak.time.split(':')[0];
        const hourNum = parseInt(timeComponents);
        const ampm = peak.time.split(' ')[1];
        
        let hour = hourNum;
        if (ampm === 'PM' && hourNum < 12) hour += 12;
        if (ampm === 'AM' && hourNum === 12) hour = 0;
        
        // Calculate x position
        const x = (hour / 24) * 100; // As percentage
        
        return (
          <Tooltip 
            key={index}
            title={`Peak activity: ${peak.steps} steps at ${peak.time}`}
            placement="top"
          >
            <Box
              component={motion.div}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                delay: index * 0.5 
              }}
              sx={{
                position: 'absolute',
                left: `${x}%`,
                top: '30%', // Approximate based on activity level
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: alpha(colors.steps || theme.palette.primary.main, 0.6),
                boxShadow: `0 0 8px ${alpha(colors.steps || theme.palette.primary.main, 0.8)}`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer'
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ActivityPulseWave;