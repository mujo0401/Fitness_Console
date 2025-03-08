import React from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
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
 * A simplified LineChart component to fix rendering issues
 */
const LineChart = ({ 
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
  console.log(`LineChart rendering with ${data?.length || 0} data points`);
  
  // Force direct dataKey references
  const processedSeries = series.map(s => ({
    ...s,
    dataKey: typeof s.dataKey === 'function' ? 'avg' : s.dataKey,
  }));
  
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsLineChart
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
              <Line
                key={`line-${index}`}
                type="monotone"
                dataKey={s.dataKey || 'avg'}
                name={s.name || s.dataKey || 'Value'}
                stroke={s.color || theme.palette.primary.main}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey="avg"
              name="Value"
              stroke={theme.palette.primary.main}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;