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
import CustomTooltip from './CustomTooltip';

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
        <RechartsAreaChart
          data={data}
          margin={margin}
        >
          <defs>
            {/* Add gradients for each series */}
            {processedSeries.map((s, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={s.gradientId || `colorGradient${index}`}
                x1="0" y1="0" x2="0" y2="1"
              >
                <stop 
                  offset="5%" 
                  stopColor={s.color || theme.palette.primary.main} 
                  stopOpacity={s.fillOpacity?.start || 0.8} 
                />
                <stop 
                  offset="95%" 
                  stopColor={s.color || theme.palette.primary.main} 
                  stopOpacity={s.fillOpacity?.end || 0.1} 
                />
              </linearGradient>
            ))}
          </defs>
          
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
              <Area
                key={`area-${index}`}
                type="monotone"
                dataKey={'avg'}
                name={s.name || 'Heart Rate'}
                stroke={s.color || theme.palette.primary.main}
                fill={s.color || theme.palette.primary.main}
                fillOpacity={0.3}
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
                isAnimationActive={false}
              />
            ))
          ) : (
            <Area
              type="monotone"
              dataKey="avg"
              name="Heart Rate"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.3}
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
              isAnimationActive={false}
            />
          )}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AreaChart;