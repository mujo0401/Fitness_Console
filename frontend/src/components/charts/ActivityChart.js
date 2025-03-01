import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ComposedChart,
  Line,
  Area,
  ReferenceLine,
  Label,
  Brush
} from 'recharts';
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import { format, parseISO } from 'date-fns';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        maxWidth: 250,
        backdropFilter: 'blur(8px)',
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(200, 200, 200, 0.5)',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {data.dateTime || label} {data.time && `- ${data.time}`}
      </Typography>
      
      {data.steps !== undefined && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Steps: {data.steps.toLocaleString()}
        </Typography>
      )}
      
      {data.distance !== undefined && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Distance: {data.distance} km
        </Typography>
      )}
      
      {data.activeMinutes !== undefined && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Active Minutes: {data.activeMinutes}
        </Typography>
      )}
      
      {data.calories !== undefined && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Calories: {data.calories.toLocaleString()}
        </Typography>
      )}
      
      {data.floors !== undefined && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Floors: {data.floors}
        </Typography>
      )}
      
      {data.heartRate !== undefined && (
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Heart Rate: {data.heartRate} BPM
        </Typography>
      )}
      
      {data.activityLevel && (
        <Chip 
          size="small" 
          label={data.activityLevel} 
          color={
            data.activityLevel === 'Very Active' ? 'success' :
            data.activityLevel === 'Active' ? 'primary' :
            data.activityLevel === 'Lightly Active' ? 'info' : 'default'
          }
          sx={{ mt: 1 }}
        />
      )}
    </Paper>
  );
};

// Enhanced ActivityChart component
const ActivityChart = ({ data, period }) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState('steps');
  const [chartData, setChartData] = useState([]);
  
  // Process data when it changes or view type changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Create copy to avoid modifying original data
    const processedData = [...data];
    
    // Sort by date/time
    if (period === 'day') {
      processedData.sort((a, b) => {
        if (a.time && b.time) {
          // Convert 12-hour time format to comparable value
          const getTimeValue = (timeStr) => {
            const [timePart, ampm] = timeStr.split(' ');
            let [hour, minute] = timePart.split(':').map(Number);
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            return hour * 60 + minute;
          };
          return getTimeValue(a.time) - getTimeValue(b.time);
        }
        return 0;
      });
    } else {
      processedData.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    }
    
    setChartData(processedData);
  }, [data, viewType, period]);
  
  if (!data || data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2, mb: 3 }}>
        <Typography color="text.secondary">No activity data available</Typography>
      </Paper>
    );
  }
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%', 
        p: 3, 
        borderRadius: 2,
        background: 'linear-gradient(to bottom, #ffffff, #f5f5f5)',
        mb: 4 
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Activity Metrics
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {period === 'day' ? 'Daily activity breakdown' : period === 'week' ? '7-day activity metrics' : 'Monthly activity summary'}
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel>View</InputLabel>
          <Select
            value={viewType}
            label="View"
            onChange={(e) => setViewType(e.target.value)}
            size="small"
          >
            <MenuItem value="steps">Steps</MenuItem>
            <MenuItem value="calories">Calories</MenuItem>
            <MenuItem value="activeMinutes">Active Minutes</MenuItem>
            <MenuItem value="distance">Distance</MenuItem>
            {period === 'day' && <MenuItem value="hourly">Hourly Breakdown</MenuItem>}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ height: 400, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'steps' ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
              <XAxis 
                dataKey={period === 'day' ? "time" : "dateTime"} 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                angle={period === 'day' ? 0 : -45}
                textAnchor={period === 'day' ? "middle" : "end"}
                height={60}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                label={{ value: 'Steps', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                yAxisId="left"
                dataKey="steps" 
                name="Steps" 
                fill="#4caf50"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="steps"
                name="Trend"
                stroke="#009688"
                dot={false}
                activeDot={false}
              />
              <ReferenceLine 
                y={10000} 
                yAxisId="left" 
                stroke="#4caf50" 
                strokeDasharray="3 3"
                label={{ value: 'Goal: 10,000', position: 'right', fill: '#4caf50' }} 
              />
              {chartData.length > 10 && (
                <Brush 
                  dataKey={period === 'day' ? "time" : "dateTime"} 
                  height={30} 
                  stroke={theme.palette.primary.main}
                  y={370}
                />
              )}
            </ComposedChart>
          ) : viewType === 'calories' ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
              <XAxis 
                dataKey={period === 'day' ? "time" : "dateTime"} 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                angle={period === 'day' ? 0 : -45}
                textAnchor={period === 'day' ? "middle" : "end"}
                height={60}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                label={{ value: 'Calories', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="calories"
                name="Calories"
                fill={alpha('#ff9800', 0.6)}
                stroke="#ff9800"
                strokeWidth={2}
              />
              {period !== 'day' && (
                <ReferenceLine 
                  y={2000} 
                  yAxisId="left" 
                  stroke="#ff9800" 
                  strokeDasharray="3 3"
                  label={{ value: 'Target: 2,000', position: 'right', fill: '#ff9800' }} 
                />
              )}
              {chartData.length > 10 && (
                <Brush 
                  dataKey={period === 'day' ? "time" : "dateTime"} 
                  height={30} 
                  stroke={theme.palette.primary.main}
                  y={370}
                />
              )}
            </ComposedChart>
          ) : viewType === 'activeMinutes' ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
              <XAxis 
                dataKey={period === 'day' ? "time" : "dateTime"} 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                angle={period === 'day' ? 0 : -45}
                textAnchor={period === 'day' ? "middle" : "end"}
                height={60}
              />
              <YAxis 
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                dataKey="activeMinutes" 
                name="Active Minutes" 
                fill="#009688"
                radius={[4, 4, 0, 0]}
              />
              <ReferenceLine 
                y={30} 
                stroke="#009688" 
                strokeDasharray="3 3"
                label={{ value: 'Goal: 30 min', position: 'right', fill: '#009688' }} 
              />
              {chartData.length > 10 && (
                <Brush 
                  dataKey={period === 'day' ? "time" : "dateTime"} 
                  height={30} 
                  stroke={theme.palette.primary.main}
                  y={370}
                />
              )}
            </BarChart>
          ) : viewType === 'distance' ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
              <XAxis 
                dataKey={period === 'day' ? "time" : "dateTime"} 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                angle={period === 'day' ? 0 : -45}
                textAnchor={period === 'day' ? "middle" : "end"}
                height={60}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="distance"
                name="Distance (km)"
                stroke="#2196f3"
                strokeWidth={2}
                dot={{ r: 4, fill: '#2196f3', stroke: '#fff', strokeWidth: 1 }}
              />
              <ReferenceLine 
                y={5} 
                yAxisId="left" 
                stroke="#2196f3" 
                strokeDasharray="3 3"
                label={{ value: 'Goal: 5 km', position: 'right', fill: '#2196f3' }} 
              />
              {chartData.length > 10 && (
                <Brush 
                  dataKey={period === 'day' ? "time" : "dateTime"} 
                  height={30} 
                  stroke={theme.palette.primary.main}
                  y={370}
                />
              )}
            </ComposedChart>
          ) : (
            // Hourly breakdown for day view
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                label={{ value: 'Steps', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                label={{ value: 'Calories', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                yAxisId="left"
                dataKey="steps" 
                name="Steps" 
                fill="#4caf50"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="calories"
                name="Calories"
                stroke="#ff9800"
                strokeWidth={2}
              />
              <ReferenceLine 
                x="6:00 AM" 
                stroke="#9e9e9e" 
                label={{ value: 'Morning', position: 'top', fill: '#9e9e9e' }} 
              />
              <ReferenceLine 
                x="12:00 PM" 
                stroke="#9e9e9e" 
                label={{ value: 'Noon', position: 'top', fill: '#9e9e9e' }} 
              />
              <ReferenceLine 
                x="6:00 PM" 
                stroke="#9e9e9e" 
                label={{ value: 'Evening', position: 'top', fill: '#9e9e9e' }} 
              />
              {chartData.length > 10 && (
                <Brush 
                  dataKey="time" 
                  height={30} 
                  stroke={theme.palette.primary.main}
                  y={370}
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {viewType === 'steps' 
          ? 'Steps tracked throughout the period. Goal is 10,000 steps per day.'
          : viewType === 'calories'
            ? 'Calories burned through activity and base metabolic rate.'
            : viewType === 'activeMinutes'
              ? 'Minutes spent in moderate to vigorous physical activity. Aim for at least 30 minutes daily.'
              : viewType === 'distance'
                ? 'Total distance covered through walking, running, and other activities.'
                : 'Hourly breakdown showing activity patterns throughout the day.'}
      </Typography>
      
      {viewType === 'steps' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 3 }}>
          <Chip 
            size="small" 
            label="< 5,000: Low Activity" 
            sx={{ bgcolor: alpha('#f44336', 0.8), color: 'white' }}
          />
          <Chip 
            size="small" 
            label="5,000-7,499: Moderate" 
            sx={{ bgcolor: alpha('#ff9800', 0.8), color: 'white' }}
          />
          <Chip 
            size="small" 
            label="7,500-9,999: Active" 
            sx={{ bgcolor: alpha('#2196f3', 0.8), color: 'white' }}
          />
          <Chip 
            size="small" 
            label="10,000+: Very Active" 
            sx={{ bgcolor: alpha('#4caf50', 0.8), color: 'white' }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default ActivityChart;