import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, alpha, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * RadialProgressChart component that displays progress as a circular meter
 * @param {Object} props
 * @param {number} props.value - Current value to display
 * @param {number} props.maxValue - Maximum value representing 100%
 * @param {string} props.title - Chart title
 * @param {string} props.unit - Unit to display after the value
 * @param {Array} props.milestones - Array of milestone objects with value and label
 * @param {Object} props.colors - Object containing start and end gradient colors
 * @param {string} props.icon - Icon element to display
 * @param {number} props.size - Size of the chart in pixels
 * @param {number} props.thickness - Thickness of the progress arc
 * @param {boolean} props.animate - Whether to animate the progress
 */
const RadialProgressChart = ({ 
  value = 0, 
  maxValue = 10000, 
  title = 'Steps', 
  unit = '', 
  milestones = [],
  colors = { start: '#4caf50', end: '#8bc34a' },
  icon = null,
  size = 240,
  thickness = 12,
  animate = true
}) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  
  // Create a normalized percentage regardless of value/maxValue
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  // Calculate arc parameters
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Center coordinates
  const center = size / 2;
  
  // Milestones with normalized positions
  const normalizedMilestones = milestones.map(milestone => ({
    ...milestone,
    percentage: (milestone.value / maxValue) * 100,
    angle: ((milestone.value / maxValue) * 100 * 360) / 100
  }));
  
  // Animation effect
  useEffect(() => {
    if (animate) {
      // Start from 0 and animate to actual percentage
      setProgress(0);
      const timer = setTimeout(() => {
        setProgress(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setProgress(percentage);
    }
  }, [percentage, animate]);
  
  // Generate gradient ID
  const gradientId = `radialGradient-${Math.random().toString(36).substr(2, 9)}`;
  
  // Get color for current progress
  const getColorForProgress = () => {
    if (percentage >= 100) return colors.end;
    if (percentage <= 25) return colors.start;
    
    // Mix colors based on progress
    return colors.mid || colors.start;
  };
  
  // Create milestone markers
  const renderMilestones = () => {
    return normalizedMilestones.map((milestone, index) => {
      // Skip if milestone is beyond max value
      if (milestone.percentage > 100) return null;
      
      // Calculate position on the circle
      const angle = (milestone.percentage * 3.6 - 90) * (Math.PI / 180);
      const x = center + (radius) * Math.cos(angle);
      const y = center + (radius) * Math.sin(angle);
      
      const isReached = value >= milestone.value;
      
      return (
        <g key={index}>
          {/* Milestone circle */}
          <motion.circle
            cx={x}
            cy={y}
            r={4}
            fill={isReached ? theme.palette.primary.main : theme.palette.grey[300]}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
          />
          
          {/* Label lines for bigger milestones */}
          {milestone.label && (
            <Tooltip title={`${milestone.label}: ${milestone.value.toLocaleString()}${unit}`}>
              <g>
                {/* Connecting line */}
                <motion.line
                  x1={x}
                  y1={y}
                  x2={x + (x > center ? 15 : -15)}
                  y2={y + (y > center ? 15 : -15)}
                  stroke={isReached ? theme.palette.primary.main : theme.palette.grey[400]}
                  strokeWidth={1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                />
                
                {/* Small label (optional) */}
                <motion.text
                  x={x + (x > center ? 20 : -20)}
                  y={y + (y > center ? 20 : -20)}
                  fill={isReached ? theme.palette.text.primary : theme.palette.text.secondary}
                  fontSize="8px"
                  textAnchor={x > center ? "start" : "end"}
                  dominantBaseline="middle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.7 + (index * 0.1), duration: 0.3 }}
                >
                  {milestone.label}
                </motion.text>
              </g>
            </Tooltip>
          )}
        </g>
      );
    });
  };
  
  return (
    <Box sx={{ position: 'relative', width: size, height: size, margin: 'auto' }}>
      <svg width={size} height={size}>
        {/* Define gradient */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={alpha(theme.palette.grey[300], 0.3)}
          strokeWidth={thickness}
        />
        
        {/* Progress arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Render milestone markers */}
        {renderMilestones()}
        
        {/* Add pulse effect for completed progress */}
        {percentage >= 100 && (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.end}
            strokeWidth={thickness}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
          />
        )}
      </svg>
      
      {/* Center content */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center'
        }}
      >
        {/* Icon */}
        {icon && (
          <Box sx={{ mb: 1, color: getColorForProgress() }}>
            {icon}
          </Box>
        )}
        
        {/* Value display */}
        <Typography 
          variant="h3" 
          component="div" 
          fontWeight="bold"
          sx={{ 
            lineHeight: 1.1,
            color: getColorForProgress()
          }}
        >
          {value.toLocaleString()}
        </Typography>
        
        {/* Unit */}
        {unit && (
          <Typography variant="subtitle1" color="text.secondary">
            {unit}
          </Typography>
        )}
        
        {/* Title */}
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          {title}
        </Typography>
        
        {/* Goal percentage */}
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 0.5,
            color: percentage >= 100 ? theme.palette.success.main : theme.palette.text.secondary,
            fontWeight: percentage >= 100 ? 'bold' : 'normal'
          }}
        >
          {percentage >= 100 ? 'Goal Completed!' : `${Math.round(percentage)}% of goal`}
        </Typography>
      </Box>
    </Box>
  );
};

export default RadialProgressChart;