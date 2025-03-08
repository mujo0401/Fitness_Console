import React from 'react';
import { motion } from 'framer-motion';
import { Box, useTheme } from '@mui/material';

/**
 * A component that renders an animated icon
 * 
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.icon - The icon to render
 * @param {Object} props.motionProps - Props to pass to the motion component
 * @param {Object} props.sx - Additional styles to apply to the container
 */
const AnimatedIcon = ({ 
  icon, 
  motionProps = {
    whileHover: { scale: 1.2 },
    whileTap: { scale: 0.9 },
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  },
  sx = {}
}) => {
  const theme = useTheme();
  
  return (
    <Box component={motion.div} {...motionProps} sx={sx}>
      {icon}
    </Box>
  );
};

export default AnimatedIcon;