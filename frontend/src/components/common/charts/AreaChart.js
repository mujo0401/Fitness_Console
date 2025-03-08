import React from 'react';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { useTheme, alpha, Box } from '@mui/material';

/**
 * A simplified AreaChart component to fix rendering issues
 */
const AreaChart = ({ 
  data = [],
  xAxisDataKey = 'time',
  series = [],
  height = 300,
  margin = { top: 10, right: 30, left: 10, bottom: 30 },
  referenceLines = [],
  referenceAreas = []
}) => {
  const theme = useTheme();
  
  // Simple debug logging
  console.log(`AreaChart rendering with ${data?.length || 0} data points`);
  
  // Force direct dataKey references
  const processedSeries = series.map(s => ({
    ...s,
    dataKey: typeof s.dataKey === 'function' ? 'avg' : s.dataKey,
  }));
  
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsAreaChart
          data={data}
          margin={margin}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
          
          <XAxis 
            dataKey={xAxisDataKey} 
            tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
          />
          
          <YAxis 
            tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
          />
          
          <Tooltip />
          
          <Legend />
          
          {/* Reference lines */}
          {referenceLines.map((line, index) => (
            <ReferenceLine
              key={`ref-line-${index}`}
              {...line}
            />
          ))}
          
          {/* Reference areas */}
          {referenceAreas.map((area, index) => (
            <ReferenceArea
              key={`ref-area-${index}`}
              {...area}
            />
          ))}
          
          {/* Render series */}
          {processedSeries.length > 0 ? (
            processedSeries.map((s, index) => (
              <Area
                key={`area-${index}`}
                type="monotone"
                dataKey={s.dataKey || 'avg'}
                name={s.name || s.dataKey || 'Value'}
                stroke={s.color || theme.palette.primary.main}
                fill={s.color || theme.palette.primary.main}
                fillOpacity={0.3}
              />
            ))
          ) : (
            <Area
              type="monotone"
              dataKey="avg"
              name="Value"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.3}
            />
          )}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AreaChart;