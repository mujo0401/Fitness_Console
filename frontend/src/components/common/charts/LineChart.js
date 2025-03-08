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
import CustomTooltip from './CustomTooltip';

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
  
  // Get min/max values for Y axis - with safety checks
  let minValue = 30;
  let maxValue = 160;
  
  try {
    if (data && data.length > 0) {
      const allValues = data.flatMap(item => (
        Object.values(item).filter(val => typeof val === 'number' && !isNaN(val))
      ));
      
      if (allValues.length > 0) {
        const filteredValues = allValues.filter(v => v > 0);
        if (filteredValues.length > 0) {
          minValue = Math.max(30, Math.min(...filteredValues) * 0.9);
          maxValue = Math.max(160, Math.max(...allValues) * 1.1);
        }
      }
    }
    console.log(`Chart Y-axis range: ${minValue} to ${maxValue}`);
  } catch (error) {
    console.error("Error calculating min/max values:", error);
    // Use defaults
    minValue = 30;
    maxValue = 160;
  }
  
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsLineChart
          data={data}
          margin={margin}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={alpha(theme.palette.text.secondary, 0.1)}
            vertical={false}
          />
          
          <XAxis 
            dataKey={xAxisDataKey} 
            tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
            tickLine={{ stroke: alpha(theme.palette.text.secondary, 0.2) }}
            axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.3) }}
          />
          
          <YAxis 
            tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
            tickLine={{ stroke: alpha(theme.palette.text.secondary, 0.2) }}
            axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.3) }}
            domain={[30, 200]}
            tickCount={8}
            tickFormatter={(value) => Math.round(value)}
          />
          
          <Tooltip content={<CustomTooltip minValue={minValue} maxValue={maxValue} />} />
          
          <Legend 
            wrapperStyle={{ 
              paddingTop: 10, 
              fontSize: 12,
              fontWeight: 500
            }} 
          />
          
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
                dataKey={'avg'}
                name={s.name || 'Heart Rate'}
                stroke={s.color || theme.palette.primary.main}
                strokeWidth={2}
                dot={{ 
                  r: 3,
                  fill: s.color || theme.palette.primary.main,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 1
                }}
                activeDot={{ 
                  r: 5,
                  fill: s.color || theme.palette.primary.main,
                  stroke: theme.palette.background.paper,
                  strokeWidth: 2
                }}
                connectNulls={true}
                isAnimationActive={true}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey="avg"
              name="Heart Rate"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ 
                r: 3,
                fill: theme.palette.primary.main,
                stroke: theme.palette.background.paper,
                strokeWidth: 1
              }}
              activeDot={{ 
                r: 5,
                fill: theme.palette.primary.main,
                stroke: theme.palette.background.paper,
                strokeWidth: 2
              }}
              connectNulls={true}
              isAnimationActive={true}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;