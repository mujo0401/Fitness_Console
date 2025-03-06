import React from 'react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Avatar, 
  LinearProgress 
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

/**
 * ZoneCard component for displaying heart rate zone information
 * 
 * @param {Object} props
 * @param {Object} props.zone - Zone information (name, color, gradient, icon, min, max, intensity, description)
 * @param {number} props.percentage - Percentage of time spent in this zone
 * @param {number} props.count - Number of data points in this zone
 * @param {Function} props.onClick - Optional click handler for the card
 * @returns {JSX.Element} ZoneCard component
 */
const ZoneCard = ({ zone, percentage, count, onClick }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        elevation={2}
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          border: `1px solid ${alpha(zone.color, 0.3)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: onClick ? 'pointer' : 'default',
          height: '100%',
          '&:hover': {
            boxShadow: `0 8px 24px ${alpha(zone.color, 0.2)}`,
          }
        }}
        onClick={onClick}
      >
        <Box sx={{ 
          height: '8px', 
          background: zone.gradient || zone.color
        }} />
        
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Avatar 
              sx={{ 
                width: 32,
                height: 32,
                bgcolor: alpha(zone.color, 0.1),
                color: zone.color
              }}
            >
              {zone.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {zone.name} Zone
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {zone.intensity} ({zone.min}-{zone.max} BPM)
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="h3" fontWeight="bold" sx={{ color: zone.color }}>
              {percentage}%
            </Typography>
            
            {count !== undefined && count > 0 && (
              <Typography variant="caption" color="text.secondary">
                {count} data points
              </Typography>
            )}
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: alpha(zone.color, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: zone.gradient || zone.color
                }
              }} 
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.75rem' }}>
            {zone.description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ZoneCard;