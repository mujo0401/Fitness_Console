import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getHeartRateZone } from '../../../utils/heartRateUtils';

/**
 * Animated heartbeat visualization based on BPM
 * 
 * @param {Object} props
 * @param {number} props.bpm - Beats per minute
 * @param {string} props.size - Size of the animation ('small', 'medium', 'large')
 * @returns {JSX.Element}
 */
const HeartbeatAnimation = ({ bpm = 70, size = 'medium' }) => {
  const [scale, setScale] = useState(1);
  const animationRef = useRef(null);
  const secondsPerBeat = 60 / Math.max(40, Math.min(220, bpm));
  const theme = useTheme();
  const zone = getHeartRateZone(bpm);
  
  useEffect(() => {
    const animate = () => {
      const time = Date.now() / 1000;
      const pulse = Math.sin(time / secondsPerBeat * Math.PI * 2) * 0.2 + 0.8;
      setScale(pulse);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [secondsPerBeat]);
  
  const iconSize = size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium';
  const textVariant = size === 'large' ? 'h4' : size === 'small' ? 'body2' : 'h6';
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FavoriteIcon 
        sx={{ 
          transform: `scale(${scale})`,
          transition: 'transform 50ms ease-in-out',
          color: zone?.color || theme.palette.error.main,
          fontSize: size === 'large' ? 40 : size === 'small' ? 16 : 24,
          filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.2))'
        }} 
      />
      <Typography variant={textVariant} fontWeight="bold">
        {bpm} 
        <Typography component="span" variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>BPM</Typography>
      </Typography>
    </Box>
  );
};

export default HeartbeatAnimation;