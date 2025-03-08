import React, { useMemo } from 'react';
import { Box, Typography, useTheme, Paper, Chip, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import TerrainIcon from '@mui/icons-material/Terrain';
import FlagIcon from '@mui/icons-material/Flag';

/**
 * StepMountainVisualization component
 * Creates a topographical representation of steps where elevation represents activity
 * 
 * @param {Object} props
 * @param {Array} props.data - Activity data with steps and date information
 * @param {number} props.height - Height of the visualization
 * @param {number} props.maxSteps - Maximum steps value for scaling
 * @param {Array} props.milestones - Milestone markers with value and label
 */
const StepMountainVisualization = ({
  data = [],
  height = 200,
  maxSteps = 15000,
  milestones = [
    { value: 10000, label: "Daily Goal" },
    { value: 15000, label: "Active" },
    { value: 20000, label: "Athletic" }
  ]
}) => {
  const theme = useTheme();
  
  // Process data to create the mountain shape
  const mountainData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.dateTime) - new Date(b.dateTime);
    });
    
    // Get step counts
    return sortedData.map(day => ({
      date: day.dateTime,
      steps: day.steps || 0,
      height: Math.min(100, ((day.steps || 0) / maxSteps) * 100)
    }));
  }, [data, maxSteps]);
  
  // No data handling
  if (!mountainData || mountainData.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No step data available to visualize
        </Typography>
      </Box>
    );
  }
  
  // Generate SVG path for the mountain
  const generateMountainPath = () => {
    const width = 100; // Percent-based width
    const pointWidth = width / mountainData.length;
    
    // Start at the bottom left
    let path = `M 0,${height} `;
    
    // Add points for each data point
    mountainData.forEach((point, index) => {
      const x = index * pointWidth;
      const y = height - (point.height * height / 100);
      path += `L ${x},${y} `;
    });
    
    // Complete the path to the bottom right and back to start
    path += `L ${width},${height} L 0,${height}`;
    
    return path;
  };
  
  // Generate milestone markers
  const generateMilestones = () => {
    return milestones.map((milestone, index) => {
      // Calculate Y position based on milestone value
      const milestoneHeight = Math.min(100, (milestone.value / maxSteps) * 100);
      const y = height - (milestoneHeight * height / 100);
      
      return (
        <Box 
          key={index}
          sx={{ 
            position: 'absolute',
            left: index % 2 === 0 ? '10px' : 'auto',
            right: index % 2 !== 0 ? '10px' : 'auto',
            top: y,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            zIndex: 2
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
          >
            <Chip 
              icon={<FlagIcon />}
              label={`${milestone.label}: ${milestone.value.toLocaleString()}`}
              size="small"
              color={index === 0 ? "primary" : index === 1 ? "success" : "warning"}
              variant="outlined"
              sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            />
          </motion.div>
          
          {/* Horizontal line across the chart */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.6 + (index * 0.1), duration: 0.8 }}
            style={{
              position: 'absolute',
              height: '1px',
              background: `${alpha(theme.palette.text.secondary, 0.2)}`,
              left: index % 2 === 0 ? '80px' : '0',
              right: index % 2 !== 0 ? '80px' : '0',
              zIndex: 1
            }}
          />
        </Box>
      );
    });
  };
  
  // Find highest step count in data
  const maxStepsInData = Math.max(...mountainData.map(day => day.steps));
  
  // Calculate achievement percentage 
  const achievementPercentage = Math.min(100, (maxStepsInData / maxSteps) * 100);
  
  return (
    <Box sx={{ 
      position: 'relative', 
      height,
      overflow: 'hidden',
      p: 2
    }}>
      {/* Title and highest point */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 1,
        position: 'relative',
        zIndex: 5
      }}>
        <Box>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerrainIcon color="primary" />
            Step Mountain
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Your activity landscape
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle2">
            Peak: {maxStepsInData.toLocaleString()} steps
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {achievementPercentage >= 100 
              ? "Reached the summit!" 
              : `${Math.round(achievementPercentage)}% to summit`}
          </Typography>
        </Box>
      </Box>
      
      {/* Mountain visualization */}
      <Box sx={{ position: 'relative', height: 'calc(100% - 40px)' }}>
        {/* Milestone markers */}
        {generateMilestones()}
        
        {/* Mountain SVG */}
        <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 100 ${height}`} 
            preserveAspectRatio="none"
          >
            {/* Background gradient */}
            <defs>
              <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={alpha(theme.palette.primary.main, 0.8)} />
                <stop offset="50%" stopColor={alpha(theme.palette.primary.light, 0.6)} />
                <stop offset="100%" stopColor={alpha(theme.palette.primary.light, 0.2)} />
              </linearGradient>
            </defs>
            
            {/* Animated mountain path */}
            <motion.path
              d={generateMountainPath()}
              fill="url(#mountainGradient)"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            
            {/* Mountain peaks - add small circles at high points */}
            {mountainData.map((point, index) => {
              // Only show circles for higher points
              if (point.steps < maxSteps * 0.7) return null;
              
              const x = (index / mountainData.length) * 100;
              const y = height - (point.height * height / 100);
              
              return (
                <motion.circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={2}
                  fill="white"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + (index * 0.05), duration: 0.3 }}
                />
              );
            })}
          </svg>
        </Box>
      </Box>
    </Box>
  );
};

export default StepMountainVisualization;