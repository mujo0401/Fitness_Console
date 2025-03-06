import React from 'react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Avatar, 
  Chip 
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

/**
 * MetricGaugeCard component for displaying health metrics with a gauge visualization
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {number} props.value - Current value
 * @param {number} props.maxValue - Maximum possible value (default: 100)
 * @param {number} props.minValue - Minimum possible value (default: 0)
 * @param {string} props.color - Card color theme or custom color
 * @param {JSX.Element} props.icon - Icon to display
 * @param {string} props.description - Description text
 * @param {string} props.status - Status label to display
 * @param {string} props.statusColor - Color for status chip
 * @param {Function} props.onClick - Optional click handler
 * @param {Array} props.thresholds - Array of threshold values where color changes
 * @param {Array} props.thresholdColors - Colors for each threshold zone
 * @returns {JSX.Element} MetricGaugeCard component
 */
const MetricGaugeCard = ({ 
  title, 
  value, 
  maxValue = 100, 
  minValue = 0, 
  color = 'primary', 
  icon, 
  description, 
  status, 
  statusColor,
  onClick,
  thresholds = [25, 50, 75], // Values where color changes
  thresholdColors = ['error', 'warning', 'info', 'success'] // Colors for each threshold zone
}) => {
  const theme = useTheme();
  const percentage = Math.min(Math.max(((value - minValue) / (maxValue - minValue)) * 100, 0), 100);
  
  const getColorForValue = () => {
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (percentage >= thresholds[i]) {
        return theme.palette[thresholdColors[i + 1]]?.main || thresholdColors[i + 1];
      }
    }
    return theme.palette[thresholdColors[0]]?.main || thresholdColors[0];
  };
  
  const gaugeColor = color === 'auto' ? getColorForValue() : theme.palette[color]?.main || color;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
      whileHover={{ y: -5 }}
    >
      <Card 
        elevation={2}
        sx={{ 
          height: '100%', 
          borderRadius: 4, 
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: onClick ? 'pointer' : 'default',
          border: `1px solid ${alpha(gaugeColor, 0.2)}`,
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(gaugeColor, 0.15)}`,
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 2.5 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(gaugeColor, 0.1), 
                  color: gaugeColor,
                  width: 36,
                  height: 36
                }}
              >
                {icon}
              </Avatar>
              <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
                {title}
              </Typography>
            </Box>
            
            {status && (
              <Chip 
                label={status} 
                size="small" 
                sx={{ 
                  bgcolor: alpha(statusColor || gaugeColor, 0.1), 
                  color: statusColor || gaugeColor,
                  fontWeight: 'medium',
                  fontSize: '0.75rem'
                }} 
              />
            )}
          </Box>
          
          {/* Gauge */}
          <Box sx={{ mt: 2, mb: 1, position: 'relative' }}>
            <Box sx={{ height: '12px', bgcolor: alpha(gaugeColor, 0.15), borderRadius: 2 }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  width: `${percentage}%`, 
                  bgcolor: gaugeColor,
                  borderRadius: 2,
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
              />
            </Box>
            
            {/* Threshold markers */}
            {thresholds.map((threshold, i) => (
              <Box 
                key={i}
                sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: `${threshold}%`,
                  height: '12px',
                  width: '2px',
                  bgcolor: 'rgba(255,255,255,0.7)',
                  zIndex: 1
                }} 
              />
            ))}
            
            {/* Min/Max labels */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {minValue}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {maxValue}
              </Typography>
            </Box>
          </Box>
          
          {/* Value display */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mt: 2 }}>
            <Typography variant="h3" component="div" fontWeight="bold" color={gaugeColor}>
              {value}
            </Typography>
            {maxValue !== 100 && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                /{maxValue}
              </Typography>
            )}
          </Box>
          
          {/* Description */}
          {description && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1.5 }}>
              {description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricGaugeCard;