import React from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import ZoneCard from './ZoneCard';

/**
 * ZoneDistribution component for displaying heart rate zone distribution
 * 
 * @param {Object} props
 * @param {Array} props.zoneDistribution - Array of zone distribution objects
 * @param {Function} props.onZoneClick - Handler for zone card clicks
 * @returns {JSX.Element} ZoneDistribution component
 */
const ZoneDistribution = ({ zoneDistribution, onZoneClick }) => {
  // Check if we have data
  const hasData = zoneDistribution && zoneDistribution.some(zone => zone.value > 0);
  
  // Animation settings for staggered child animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      {hasData ? (
        <Grid container spacing={3}>
          {zoneDistribution.map((zone, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={zone.name}>
              <motion.div variants={item}>
                <ZoneCard 
                  zone={zone} 
                  percentage={zone.value} 
                  count={zone.count}
                  onClick={() => onZoneClick && onZoneClick(zone)} 
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3,
            bgcolor: 'rgba(0,0,0,0.02)'
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Zone Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There isn't enough heart rate data to calculate zone distribution.
            Try selecting a different time period or refreshing the data.
          </Typography>
        </Paper>
      )}
    </motion.div>
  );
};

export default ZoneDistribution;