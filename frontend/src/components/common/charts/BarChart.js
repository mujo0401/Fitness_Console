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
  
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart
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
            processedSeries.map((s, index) => {
              // Handle item-specific coloring
              const hasItemColors = s.getItemColor || s.itemColors;
              
              return (
                <Bar
                  key={`bar-${index}`}
                  dataKey={s.dataKey || 'avg'}
                  name={s.name || s.dataKey || 'Value'}
                  fill={s.color || theme.palette.primary.main}
                  barSize={s.barSize || 20}
                  radius={s.radius || [0, 0, 0, 0]}
                >
                  {hasItemColors && data.map((entry, i) => {
                    const fieldName = s.dataKey || 'avg';
                    const value = entry[fieldName];
                    let itemColor = s.color || theme.palette.primary.main;
                    
                    if (typeof s.getItemColor === 'function') {
                      itemColor = s.getItemColor(entry);
                    }
                    
                    return (
                      <Cell 
                        key={`cell-${i}`} 
                        fill={itemColor} 
                      />
                    );
                  })}
                </Bar>
              );
            })
          ) : (
            <Bar
              dataKey="avg"
              name="Value"
              fill={theme.palette.primary.main}
              barSize={20}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChart;