import React from 'react';
import { Box } from '@mui/material';
import { ResponsiveContainer } from 'recharts';

/**
 * Base chart component that wraps a responsive container
 * and provides common layout/styling
 */
const BaseChart = ({
  children,
  height = 300,
  width = "100%",
  minHeight,
  aspectRatio,
  sx = {}
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: aspectRatio ? 'auto' : height,
        minHeight,
        ...sx
      }}
    >
      <ResponsiveContainer width={width} height={aspectRatio ? aspectRatio : "100%"}>
        {children}
      </ResponsiveContainer>
    </Box>
  );
};

export default BaseChart;