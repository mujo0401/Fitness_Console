import React from 'react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Avatar,
  Skeleton,
  Chip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * StatCard component for displaying heart rate statistics
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {number|string} props.value - Main statistic value
 * @param {string} props.unit - Unit of measurement (e.g., BPM)
 * @param {string} props.color - Card color theme
 * @param {JSX.Element} props.icon - Icon to display
 * @param {string} props.gradient - Custom gradient background
 * @param {string} props.trend - Trend direction ('up' or 'down')
 * @param {string|number} props.trendValue - Value for the trend indicator
 * @param {string} props.trendLabel - Label for the trend indicator
 * @param {Function} props.onClick - Optional click handler
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.description - Optional description text
 * @returns {JSX.Element} StatCard component
 */
const StatCard = ({ 
  title, 
  value, 
  unit, 
  color = 'primary', 
  icon, 
  gradient, 
  trend, 
  trendValue, 
  trendLabel,
  onClick,
  isLoading = false,
  description
}) => {
  const theme = useTheme();
  const colorMain = theme.palette[color]?.main || color;
  const gradientStyle = gradient || `linear-gradient(135deg, ${alpha(colorMain, 0.9)}, ${alpha(colorMain, 0.6)})`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
      whileHover={{ y: -5 }}
    >
      <Card 
        elevation={4}
        sx={{ 
          height: '100%', 
          borderRadius: 4, 
          overflow: 'hidden',
          background: gradientStyle,
          color: 'white',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: `0 8px 32px ${alpha(colorMain, 0.2)}`,
          '&:hover': {
            boxShadow: `0 12px 48px ${alpha(colorMain, 0.3)}`,
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ position: 'relative', p: 3 }}>
          {/* Decorative elements */}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: alpha('#fff', 0.1),
            transform: 'translate(50%, -50%)',
            pointerEvents: 'none'
          }} />
          
          <Box sx={{ 
            position: 'absolute', 
            bottom: -20, 
            left: -20, 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: alpha('#fff', 0.05),
            pointerEvents: 'none'
          }} />
          
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, position: 'relative', zIndex: 1 }}>
            <Avatar sx={{ 
              bgcolor: alpha('#fff', 0.2), 
              color: 'white',
              boxShadow: `0 4px 12px ${alpha('#000', 0.1)}`
            }}>
              {icon}
            </Avatar>
            <Typography variant="subtitle1" fontWeight="medium" fontSize="1rem">
              {title}
            </Typography>
          </Box>
          
          {/* Value */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {isLoading ? (
              <Skeleton variant="text" width="80%" height={60} animation="wave" sx={{ bgcolor: alpha('#fff', 0.2) }} />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h3" fontWeight="bold" letterSpacing="-0.02em">
                  {value}
                </Typography>
                {unit && (
                  <Typography component="span" variant="h6" sx={{ ml: 1, opacity: 0.9, fontWeight: 'normal' }}>
                    {unit}
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Trend indicator */}
            {trend && trendValue && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                mt: 1, 
                bgcolor: alpha('#fff', 0.1),
                p: 0.8,
                px: 1.2,
                borderRadius: 2,
                width: 'fit-content'
              }}>
                {trend === 'up' ? 
                  <TrendingUpIcon fontSize="small" /> :
                  <TrendingDownIcon fontSize="small" />
                }
                <Typography variant="body2" fontWeight="medium">
                  {trendValue} {trendLabel || ''}
                </Typography>
              </Box>
            )}
            
            {/* Description */}
            {description && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.9, fontWeight: 'medium' }}>
                {description}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;