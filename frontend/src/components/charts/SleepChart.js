import React, { useState, useEffect, useCallback } from 'react';
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
  PieChart,
  Pie,
  Cell,
  Sector,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Scatter,
  ScatterChart,
  ZAxis,
  RadialBarChart,
  RadialBar,
  ReferenceLine,
  Label,
  Brush,
  AreaChart
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
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Fade,
  IconButton,
  Tooltip as MuiTooltip,
  ButtonGroup,
  Button,
  Zoom,
  Divider,
  LinearProgress
} from '@mui/material';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import RadarIcon from '@mui/icons-material/Radar';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { format, parseISO, subDays } from 'date-fns';

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
        {data.date}
      </Typography>
      
      {data.startTime && data.endTime && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {data.startTime} - {data.endTime}
        </Typography>
      )}
      
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Duration: {formatDuration(data.durationMinutes)}
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Sleep Score: {data.score || 'N/A'}
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        Efficiency: {data.efficiency}%
      </Typography>
      
      {data.deepSleepMinutes && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              bgcolor: '#3f51b5' 
            }}
          />
          <Typography variant="caption">
            Deep: {formatDuration(data.deepSleepMinutes)} ({data.deepSleepPercentage}%)
          </Typography>
        </Box>
      )}
      
      {data.remSleepMinutes && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              bgcolor: '#2196f3' 
            }}
          />
          <Typography variant="caption">
            REM: {formatDuration(data.remSleepMinutes)} ({data.remSleepPercentage}%)
          </Typography>
        </Box>
      )}
      
      {data.lightSleepMinutes && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              bgcolor: '#9c27b0' 
            }}
          />
          <Typography variant="caption">
            Light: {formatDuration(data.lightSleepMinutes)} ({data.lightSleepPercentage}%)
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Format duration as hours and minutes
const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Active shape component for interactive pie chart
const ActiveShapePie = props => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value, name } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>{name}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
        {`${value} min (${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

// Enhanced SleepChart component
const SleepChart = ({ data, period }) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState('duration');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState([]);
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Process data when it changes or view type changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Create copy to avoid modifying original data
    const processedData = [...data].map(item => ({
      ...item,
      // Convert duration to hours for better visualization
      durationHours: parseFloat((item.durationMinutes / 60).toFixed(1)),
      // Calculate sleep quality score as percentage for radar chart
      qualityScore: item.score || 0,
      efficiencyScore: item.efficiency || 0,
      deepSleepScore: (item.deepSleepPercentage || 0) * 1.2, // Weight deep sleep more
      remSleepScore: (item.remSleepPercentage || 0) * 1.1,   // Weight REM sleep slightly more
      durationScore: Math.min(100, (item.durationMinutes / 480) * 100), // 8 hours as 100%
      continuityScore: Math.max(0, 100 - ((item.awakeDuringNight || 0) / 5) * 10) // Lower awake time is better
    }));
    
    // Sort by date
    processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setChartData(processedData);
    
    // Set the latest day as selected for detailed view
    if (processedData.length > 0 && !selectedDay) {
      setSelectedDay(processedData[processedData.length - 1]);
    }
  }, [data, viewType, selectedDay]);
  
  const handlePieEnter = useCallback((_, index) => {
    setActivePieIndex(index);
  }, []);
  
  const handleChartTypeChange = (_, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };
  
  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };
  
  if (!data || data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2, mb: 3 }}>
        <Typography color="text.secondary">No sleep data available</Typography>
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
        background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        mb: 4 
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NightsStayIcon sx={{ color: theme.palette.primary.main }} />
          Sleep Analytics Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            aria-label="chart type"
            size="small"
          >
            <MuiTooltip title="Bar Chart">
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
            </MuiTooltip>
            <MuiTooltip title="Line Chart">
              <ToggleButton value="line" aria-label="line chart">
                <TimelineIcon />
              </ToggleButton>
            </MuiTooltip>
            <MuiTooltip title="Pie Chart">
              <ToggleButton value="pie" aria-label="pie chart">
                <PieChartIcon />
              </ToggleButton>
            </MuiTooltip>
            <MuiTooltip title="Radar Chart">
              <ToggleButton value="radar" aria-label="radar chart">
                <RadarIcon />
              </ToggleButton>
            </MuiTooltip>
          </ToggleButtonGroup>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={viewType}
              label="View"
              onChange={(e) => setViewType(e.target.value)}
              size="small"
            >
              <MenuItem value="duration">Sleep Duration</MenuItem>
              <MenuItem value="efficiency">Sleep Efficiency</MenuItem>
              <MenuItem value="score">Sleep Score</MenuItem>
              <MenuItem value="stages">Sleep Stages</MenuItem>
              <MenuItem value="cycles">Sleep Cycles</MenuItem>
              <MenuItem value="quality">Sleep Quality</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={chartType === 'pie' || chartType === 'radar' ? 8 : 12}>
          <Box sx={{ height: 400, width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              {viewType === 'duration' && chartType === 'bar' && (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    yAxisId="left"
                    dataKey="durationHours" 
                    name="Sleep Duration (hours)" 
                    fill={theme.palette.primary.main}
                    shape={(props) => {
                      // Customize the bar based on sleep quality
                      const sleepData = chartData[props.index];
                      let fill = theme.palette.primary.main;
                      
                      if (sleepData.score >= 90) fill = '#4caf50';
                      else if (sleepData.score >= 80) fill = '#3f51b5';
                      else if (sleepData.score >= 70) fill = '#2196f3';
                      else if (sleepData.score >= 50) fill = '#ff9800';
                      else if (sleepData.score > 0) fill = '#f44336';
                      
                      return <rect x={props.x} y={props.y} width={props.width} height={props.height} fill={fill} radius={[4, 4, 0, 0]} />;
                    }}
                  />
                  <ReferenceLine 
                    y={8} 
                    yAxisId="left" 
                    stroke="#4caf50" 
                    strokeDasharray="3 3"
                    label={{ value: 'Recommended (8h)', position: 'right', fill: '#4caf50' }} 
                  />
                  {chartData.length > 10 && (
                    <Brush 
                      dataKey="date" 
                      height={30} 
                      stroke={theme.palette.primary.main}
                      y={370}
                    />
                  )}
                </BarChart>
              )}

              {viewType === 'duration' && chartType === 'line' && (
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="durationHours" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorDuration)"
                    name="Sleep Duration (hours)"
                  />
                  <ReferenceLine 
                    y={8} 
                    stroke="#4caf50" 
                    strokeDasharray="3 3"
                    label={{ value: 'Recommended (8h)', position: 'right', fill: '#4caf50' }} 
                  />
                </AreaChart>
              )}

              {viewType === 'duration' && chartType === 'pie' && period === 'day' && selectedDay && (
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={ActiveShapePie}
                    data={[
                      { name: 'Deep Sleep', value: selectedDay.deepSleepMinutes || 0, fill: '#3f51b5' },
                      { name: 'REM Sleep', value: selectedDay.remSleepMinutes || 0, fill: '#2196f3' },
                      { name: 'Light Sleep', value: selectedDay.lightSleepMinutes || 0, fill: '#9c27b0' },
                      { name: 'Awake', value: selectedDay.awakeDuringNight || 0, fill: '#ff9800' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    dataKey="value"
                    onMouseEnter={handlePieEnter}
                  >
                    {[
                      { name: 'Deep Sleep', value: selectedDay.deepSleepMinutes || 0, fill: '#3f51b5' },
                      { name: 'REM Sleep', value: selectedDay.remSleepMinutes || 0, fill: '#2196f3' },
                      { name: 'Light Sleep', value: selectedDay.lightSleepMinutes || 0, fill: '#9c27b0' },
                      { name: 'Awake', value: selectedDay.awakeDuringNight || 0, fill: '#ff9800' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              )}

              {viewType === 'duration' && chartType === 'radar' && period === 'day' && selectedDay && (
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  {
                    subject: 'Duration',
                    A: selectedDay.durationScore,
                    fullMark: 100,
                  },
                  {
                    subject: 'Efficiency',
                    A: selectedDay.efficiencyScore,
                    fullMark: 100,
                  },
                  {
                    subject: 'Deep Sleep',
                    A: selectedDay.deepSleepScore,
                    fullMark: 100,
                  },
                  {
                    subject: 'REM Sleep',
                    A: selectedDay.remSleepScore,
                    fullMark: 100,
                  },
                  {
                    subject: 'Continuity',
                    A: selectedDay.continuityScore,
                    fullMark: 100,
                  },
                  {
                    subject: 'Overall Quality',
                    A: selectedDay.qualityScore,
                    fullMark: 100,
                  },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Sleep Quality" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              )}

              {viewType === 'efficiency' && chartType === 'bar' && (
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 100]}
                    orientation="left"
                    label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    yAxisId="left"
                    dataKey="efficiency" 
                    name="Sleep Efficiency (%)" 
                    fill={theme.palette.info.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="efficiency"
                    name="Trend"
                    stroke={theme.palette.secondary.main}
                    dot={false}
                    activeDot={false}
                  />
                  <ReferenceLine 
                    y={90} 
                    yAxisId="left" 
                    stroke="#4caf50" 
                    strokeDasharray="3 3"
                    label={{ value: 'Excellent (90%)', position: 'right', fill: '#4caf50' }} 
                  />
                  {chartData.length > 10 && (
                    <Brush 
                      dataKey="date" 
                      height={30} 
                      stroke={theme.palette.primary.main}
                      y={370}
                    />
                  )}
                </ComposedChart>
              )}

              {viewType === 'score' && (chartType === 'bar' || chartType === 'line') && (
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 100]}
                    orientation="left"
                    label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  {chartType === 'bar' && (
                    <Bar 
                      yAxisId="left"
                      dataKey="score" 
                      name="Sleep Score" 
                      shape={(props) => {
                        // Customize the bar based on sleep quality
                        const sleepData = chartData[props.index];
                        let fill = '#9e9e9e'; // default gray
                        
                        if (sleepData.score >= 90) fill = '#4caf50';
                        else if (sleepData.score >= 80) fill = '#3f51b5';
                        else if (sleepData.score >= 70) fill = '#2196f3';
                        else if (sleepData.score >= 50) fill = '#ff9800';
                        else if (sleepData.score > 0) fill = '#f44336';
                        
                        return <rect x={props.x} y={props.y} width={props.width} height={props.height} fill={fill} radius={[4, 4, 0, 0]} />;
                      }}
                    />
                  )}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="score"
                    name="Score Trend"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={chartType === 'line' ? 3 : 1}
                    dot={chartType === 'line'}
                    activeDot={chartType === 'line'}
                  />
                  <ReferenceLine 
                    y={90} 
                    yAxisId="left" 
                    stroke="#4caf50" 
                    strokeDasharray="3 3"
                    label={{ value: 'Excellent (90+)', position: 'right', fill: '#4caf50' }} 
                  />
                  <ReferenceLine 
                    y={70} 
                    yAxisId="left" 
                    stroke="#ff9800" 
                    strokeDasharray="3 3"
                    label={{ value: 'Fair (70+)', position: 'right', fill: '#ff9800' }} 
                  />
                  {chartData.length > 10 && (
                    <Brush 
                      dataKey="date" 
                      height={30} 
                      stroke={theme.palette.primary.main}
                      y={370}
                    />
                  )}
                </ComposedChart>
              )}

              {viewType === 'stages' && chartType === 'bar' && (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  barSize={40}
                  barGap={0}
                  barCategoryGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    yAxisId="left"
                    dataKey="deepSleepMinutes" 
                    name="Deep Sleep" 
                    stackId="sleep"
                    fill="#3f51b5"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="remSleepMinutes" 
                    name="REM Sleep" 
                    stackId="sleep"
                    fill="#2196f3"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="lightSleepMinutes" 
                    name="Light Sleep" 
                    stackId="sleep"
                    fill="#9c27b0"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="awakeDuringNight" 
                    name="Awake" 
                    stackId="sleep"
                    fill="#ff9800"
                  />
                  {chartData.length > 10 && (
                    <Brush 
                      dataKey="date" 
                      height={30} 
                      stroke={theme.palette.primary.main}
                      y={370}
                    />
                  )}
                </BarChart>
              )}

              {viewType === 'stages' && chartType === 'line' && (
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.2)} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Area 
                    type="monotone" 
                    yAxisId="left"
                    dataKey="deepSleepMinutes" 
                    name="Deep Sleep" 
                    stackId="1"
                    stroke="#3f51b5"
                    fill="#3f51b5"
                  />
                  <Area 
                    type="monotone" 
                    yAxisId="left"
                    dataKey="remSleepMinutes" 
                    name="REM Sleep" 
                    stackId="1"
                    stroke="#2196f3"
                    fill="#2196f3"
                  />
                  <Area 
                    type="monotone" 
                    yAxisId="left"
                    dataKey="lightSleepMinutes" 
                    name="Light Sleep" 
                    stackId="1"
                    stroke="#9c27b0"
                    fill="#9c27b0"
                  />
                  <Area 
                    type="monotone" 
                    yAxisId="left"
                    dataKey="awakeDuringNight" 
                    name="Awake" 
                    stackId="1"
                    stroke="#ff9800"
                    fill="#ff9800"
                  />
                </ComposedChart>
              )}

              {viewType === 'cycles' && period === 'day' && selectedDay && (
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="20%" 
                  outerRadius="80%" 
                  barSize={20} 
                  data={[
                    { name: 'Deep Sleep', value: selectedDay.deepSleepMinutes || 0, fill: '#3f51b5' },
                    { name: 'REM Sleep', value: selectedDay.remSleepMinutes || 0, fill: '#2196f3' },
                    { name: 'Light Sleep', value: selectedDay.lightSleepMinutes || 0, fill: '#9c27b0' },
                    { name: 'Total Sleep', value: selectedDay.durationMinutes || 0, fill: '#8884d8' }
                  ]}
                  startAngle={0}
                  endAngle={360}
                >
                  <RadialBar 
                    label={{ fill: '#666', position: 'insideStart' }} 
                    background 
                    dataKey="value" 
                  />
                  <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip />
                </RadialBarChart>
              )}
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        {(chartType === 'pie' || chartType === 'radar') && period === 'day' && (
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2, background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HourglassTopIcon color="primary" />
                Daily Sleep Breakdown
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              
              {chartData.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2">Date Selection:</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <ButtonGroup size="small" variant="outlined">
                      {chartData.slice(Math.max(0, chartData.length - 5), chartData.length).map((day) => (
                        <Button 
                          key={day.date}
                          onClick={() => handleDaySelect(day)}
                          variant={selectedDay && selectedDay.date === day.date ? 'contained' : 'outlined'}
                        >
                          {day.date.slice(-5)}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </Box>
                  
                  {selectedDay && (
                    <Fade in={true}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Sleep Quality Factors:</Typography>
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Deep Sleep %:</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {selectedDay.deepSleepPercentage}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={selectedDay.deepSleepPercentage} 
                            sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
                          />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">REM Sleep %:</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {selectedDay.remSleepPercentage}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={selectedDay.remSleepPercentage} 
                            color="secondary"
                            sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
                          />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Sleep Efficiency:</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {selectedDay.efficiency}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={selectedDay.efficiency} 
                            color="success"
                            sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
                          />
                        </Box>
                      </Box>
                    </Fade>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {viewType === 'duration' 
          ? 'Your sleep duration pattern over time. Recommended sleep for adults is 7-9 hours per night.'
          : viewType === 'efficiency'
            ? 'Sleep efficiency is the percentage of time in bed actually spent sleeping. Higher is better.'
            : viewType === 'score'
              ? 'Your Fitbit sleep score combines duration, quality, and other factors into a 0-100 scale.'
              : viewType === 'stages'
                ? 'Breakdown of sleep stages shows how much time you spend in each sleep phase.'
                : viewType === 'cycles'
                  ? 'Sleep cycles visualization showing the proportion of different sleep stages.'
                  : 'Comprehensive analysis of your sleep quality across different metrics.'}
      </Typography>
    </Paper>
  );
};

export default SleepChart;