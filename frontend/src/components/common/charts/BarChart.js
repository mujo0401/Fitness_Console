import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell
} from 'recharts';
import { useTheme, alpha, Box } from '@mui/material';
import CustomTooltip from './CustomTooltip';

/**
 * A simplified BarChart component to fix rendering issues
 */
const BarChart = ({ 
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
  console.log(`BarChart rendering with ${data?.length || 0} data points`);
  
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
        <RechartsBarChart
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
            processedSeries.map((s, index) => {
              const hasItemColors = s.getItemColor || s.itemColors;
              
              return (
                <Bar
                  key={`bar-${index}`}
                  dataKey={'avg'}
                  name={s.name || 'Heart Rate'}
                  fill={s.color || theme.palette.primary.main}
                  barSize={data.length > 50 ? 5 : 15}
                  isAnimationActive={true}
                  radius={[2, 2, 0, 0]}
                >
                  {hasItemColors && data.map((entry, i) => {
                    if (!entry) return null;
                    
                    try {
                      let itemColor = s.color || theme.palette.primary.main;
                      
                      if (typeof s.getItemColor === 'function') {
                        try {
                          itemColor = s.getItemColor(entry) || itemColor;
                        } catch (error) {
                          console.error("Error getting item color:", error);
                        }
                      }
                      
                      return (
                        <Cell 
                          key={`cell-${i}`} 
                          fill={itemColor}
                        />
                      );
                    } catch (error) {
                      console.error("Error rendering bar cell:", error);
                      return null;
                    }
                  })}
                </Bar>
              );
            })
          ) : (
            <Bar
              dataKey="avg"
              name="Heart Rate"
              fill={theme.palette.primary.main}
              barSize={data.length > 50 ? 5 : 15}
              isAnimationActive={true}
              radius={[2, 2, 0, 0]}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChart;