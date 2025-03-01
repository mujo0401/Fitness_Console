import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine,
  Brush,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ReferenceArea
} from 'recharts';
import { 
  Box, 
  Typography, 
  FormControlLabel, 
  Switch, 
  Skeleton, 
  Paper, 
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Stack,
  Divider,
  Button,
  Fade,
  useTheme
} from '@mui/material';
import { format, parseISO, subDays } from 'date-fns';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import SpeedIcon from '@mui/icons-material/Speed';

// Heart rate zones
const HR_ZONES = [
  { name: 'Rest', min: 0, max: 60, color: '#90caf9' },
  { name: 'Fat Burn', min: 60, max: 70, color: '#81c784' },
  { name: 'Cardio', min: 70, max: 85, color: '#ffb74d' },
  { name: 'Peak', min: 85, max: 100, color: '#f06292' },
  { name: 'Extreme', min: 100, max: 220, color: '#e57373' }
];

// Calculate the heart rate zone for a given value
const getHeartRateZone = (value) => {
  if (!value) return null;
  return HR_ZONES.find(zone => value >= zone.min && value < zone.max);
};

// Animation component for the heartbeat
const HeartbeatAnimation = ({ bpm = 70 }) => {
  const [scale, setScale] = useState(1);
  const animationRef = useRef(null);
  const secondsPerBeat = 60 / Math.max(40, Math.min(220, bpm));
  
  useEffect(() => {
    const animate = () => {
      const time = Date.now() / 1000;
      const pulse = Math.sin(time / secondsPerBeat * Math.PI * 2) * 0.2 + 0.8;
      setScale(pulse);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [secondsPerBeat]);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FavoriteIcon 
        color="error" 
        sx={{ 
          transform: `scale(${scale})`,
          transition: 'transform 50ms ease-in-out'
        }} 
      />
      <Typography variant="h6">{bpm} BPM</Typography>
    </Box>
  );
};

// Enhanced custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const hrZone = data.avg ? getHeartRateZone(data.avg) : null;
  
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
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FavoriteIcon fontSize="small" color="error" />
        {data.date ? `${data.date} ${data.time || ''}` : label}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      {data.avg && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Average
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              size="small" 
              label={`${Math.round(data.avg)} BPM`} 
              sx={{ 
                bgcolor: hrZone?.color || '#8884d8',
                color: 'white',
                fontWeight: 'bold',
              }} 
            />
            {hrZone && (
              <Typography variant="caption">
                {hrZone.name} Zone
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      {data.restingHeartRate > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Resting Heart Rate
          </Typography>
          <Chip 
            size="small" 
            label={`${data.restingHeartRate} BPM`} 
            sx={{ bgcolor: '#90caf9', color: 'white', fontWeight: 'bold' }} 
          />
        </Box>
      )}
      
      {data.min > 0 && data.max > 0 && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Range
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              size="small" 
              label={`${data.min} - ${data.max} BPM`} 
              sx={{ bgcolor: '#81c784', color: 'white', fontWeight: 'bold' }} 
            />
            <Typography variant="caption">
              Δ {data.max - data.min}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

// Downsampling function for performance with high-frequency data
const downsampleData = (data, targetPoints = 500) => {
  if (!data || data.length <= targetPoints) return data;
  
  const factor = Math.ceil(data.length / targetPoints);
  const result = [];
  
  for (let i = 0; i < data.length; i += factor) {
    const chunk = data.slice(i, i + factor);
    const avgObj = { ...chunk[0] };
    
    // Calculate averages for each numeric field
    Object.keys(avgObj).forEach(key => {
      if (typeof avgObj[key] === 'number') {
        const validValues = chunk
          .map(item => item[key])
          .filter(val => typeof val === 'number' && !isNaN(val));
          
        if (validValues.length > 0) {
          if (key === 'min') {
            avgObj[key] = Math.min(...validValues);
          } else if (key === 'max') {
            avgObj[key] = Math.max(...validValues);
          } else {
            avgObj[key] = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
          }
        }
      }
    });
    
    result.push(avgObj);
  }
  
  return result;
};

// Enhanced HeartRateChart component
const HeartRateChart = ({ data, period }) => {
  const theme = useTheme();
  const [showRange, setShowRange] = useState(true);
  const [viewType, setViewType] = useState('area');
  const [zoneView, setZoneView] = useState(false);
  const [resolution, setResolution] = useState('medium');
  const [processedData, setProcessedData] = useState([]);
  const [currentHeartRate, setCurrentHeartRate] = useState(70);
  
  // Process data on load and when settings change
  useEffect(() => {
    if (!data || data.length === 0) {
      // Set empty state with placeholder data for visualization
      const placeholderData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        date: "2025-03-01",
        avg: 0,
        min: 0,
        max: 0,
        zoneColor: "#8884d8",
        zoneName: "N/A"
      }));
      setProcessedData(placeholderData);
      setCurrentHeartRate(0);
      return;
    }
    
    // Get current heart rate from the latest data point
    const latestHR = data[data.length - 1]?.avg || data[data.length - 1]?.value;
    if (latestHR) {
      setCurrentHeartRate(Math.round(latestHR));
    }
    
    // Downsample based on resolution
    let pointTarget;
    switch (resolution) {
      case 'low': pointTarget = 100; break;
      case 'high': pointTarget = 1000; break;
      default: pointTarget = 300; break;
    }
    
    // Process and set the data
    const sampledData = downsampleData(data, pointTarget);
    
    // Enhance data with zone information
    const enhanced = sampledData.map(item => {
      const hrValue = item.avg || item.value || 0;
      const zone = getHeartRateZone(hrValue);
      return {
        ...item,
        zoneColor: zone?.color || '#8884d8',
        zoneName: zone?.name || 'Unknown',
        // For zone area chart
        rest: hrValue <= 60 ? hrValue : 0,
        fatBurn: hrValue > 60 && hrValue <= 70 ? hrValue : 0,
        cardio: hrValue > 70 && hrValue <= 85 ? hrValue : 0,
        peak: hrValue > 85 && hrValue <= 100 ? hrValue : 0,
        extreme: hrValue > 100 ? hrValue : 0,
      };
    });
    
    setProcessedData(enhanced);
  }, [data, resolution]);
  
  // Handle missing or empty data
  if (!data || data.length === 0) {
    return (
      <Skeleton variant="rectangular" width="100%" height={400} animation="wave" />
    );
  }
  
  // Find min/max values for Y axis
  let minValue = 40;
  let maxValue = 160;
  
  processedData.forEach(item => {
    if (item.min && item.min > 0 && item.min < minValue) minValue = item.min;
    if (item.max && item.max > maxValue) maxValue = item.max;
    if (item.avg && item.avg < minValue) minValue = item.avg;
    if (item.avg && item.avg > maxValue) maxValue = item.avg;
  });
  
  // Add padding to Y axis
  minValue = Math.max(30, Math.floor(minValue * 0.9));
  maxValue = Math.ceil(maxValue * 1.1);
  
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
      {/* Header with current heart rate */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <HeartbeatAnimation bpm={currentHeartRate} />
        
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={viewType}
              label="Chart Type"
              onChange={(e) => setViewType(e.target.value)}
              size="small"
            >
              <MenuItem value="area" sx={{ display: 'flex', gap: 1 }}>
                <ShowChartIcon fontSize="small" /> Area
              </MenuItem>
              <MenuItem value="radial" sx={{ display: 'flex', gap: 1 }}>
                <DonutLargeIcon fontSize="small" /> Radial
              </MenuItem>
              <MenuItem value="scatter" sx={{ display: 'flex', gap: 1 }}>
                <BubbleChartIcon fontSize="small" /> Scatter
              </MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Resolution</InputLabel>
            <Select
              value={resolution}
              label="Resolution"
              onChange={(e) => setResolution(e.target.value)}
              size="small"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={showRange}
                onChange={(e) => setShowRange(e.target.checked)}
                size="small"
              />
            }
            label="Range"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={zoneView}
                onChange={(e) => setZoneView(e.target.checked)}
                size="small"
              />
            }
            label="Zones"
          />
        </Stack>
      </Box>
      
      {/* Heart rate zones legend */}
      {zoneView && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {HR_ZONES.map((zone) => (
            <Chip
              key={zone.name}
              label={`${zone.name}: ${zone.min}-${zone.max} BPM`}
              size="small"
              sx={{ 
                bgcolor: zone.color, 
                color: 'white',
                fontWeight: 'bold',
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          ))}
        </Box>
      )}
    
      {/* Main chart container */}
      <Box sx={{ height: 400, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'area' ? (
            <ComposedChart
              data={processedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8042" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.3}/>
                </linearGradient>
                {/* Zone gradients */}
                <linearGradient id="colorRest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#90caf9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#90caf9" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorFatBurn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#81c784" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#81c784" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorCardio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffb74d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ffb74d" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f06292" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f06292" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorExtreme" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e57373" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e57373" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
              
              <XAxis 
                dataKey={period === 'day' ? "time" : "date"} 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }} 
                tickLine={{ stroke: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.text.secondary }}
                padding={{ left: 10, right: 10 }}
                interval="preserveStartEnd"
              />
              
              <YAxis 
                domain={[minValue, maxValue]} 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                tickLine={{ stroke: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.text.secondary }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              
              {/* Zone reference areas */}
              {zoneView && HR_ZONES.map((zone) => (
                <ReferenceArea 
                  key={zone.name}
                  y1={zone.min} 
                  y2={zone.max} 
                  fill={zone.color} 
                  fillOpacity={0.1} 
                  stroke="none"
                  label={{ 
                    value: zone.name, 
                    position: 'insideLeft',
                    fill: zone.color,
                    fontSize: 10 
                  }}
                />
              ))}
              
              {/* Zone stacked areas - show when zoneView is true */}
              {zoneView ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="rest"
                    stackId="1"
                    stroke="#90caf9"
                    fill="url(#colorRest)"
                    isAnimationActive={false}
                    name="Rest"
                  />
                  <Area
                    type="monotone"
                    dataKey="fatBurn"
                    stackId="1"
                    stroke="#81c784"
                    fill="url(#colorFatBurn)"
                    isAnimationActive={false}
                    name="Fat Burn"
                  />
                  <Area
                    type="monotone"
                    dataKey="cardio"
                    stackId="1"
                    stroke="#ffb74d"
                    fill="url(#colorCardio)"
                    isAnimationActive={false}
                    name="Cardio"
                  />
                  <Area
                    type="monotone"
                    dataKey="peak"
                    stackId="1"
                    stroke="#f06292"
                    fill="url(#colorPeak)"
                    isAnimationActive={false}
                    name="Peak"
                  />
                  <Area
                    type="monotone"
                    dataKey="extreme"
                    stackId="1"
                    stroke="#e57373"
                    fill="url(#colorExtreme)"
                    isAnimationActive={false}
                    name="Extreme"
                  />
                </>
              ) : (
                // Regular view with heart rate line/area
                <>
                  <Area
                    type="monotone"
                    dataKey="avg"
                    stroke="#8884d8"
                    strokeWidth={2}
                    fill="url(#colorAvg)"
                    isAnimationActive={false}
                    activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                    name="Heart Rate"
                  />
                  
                  {/* Show range when enabled */}
                  {showRange && (
                    <Area
                      type="monotone"
                      dataKey="min"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="none"
                      name="Min"
                      isAnimationActive={false}
                    />
                  )}
                  
                  {showRange && (
                    <Area
                      type="monotone"
                      dataKey="max"
                      stackId="2"
                      stroke="#ff8042"
                      fill="url(#colorRange)"
                      name="Max"
                      isAnimationActive={false}
                    />
                  )}
                </>
              )}
              
              <Brush 
                dataKey={period === 'day' ? "time" : "date"} 
                height={30} 
                stroke="#8884d8" 
                y={370}
                fill="#f5f5f5"
                travellerWidth={10}
                startIndex={Math.max(0, processedData.length - 60)}
              />
            </ComposedChart>
          ) : viewType === 'radial' ? (
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="90%" 
              barSize={10} 
              data={[
                { name: 'Resting', value: 60, fill: '#90caf9' },
                { name: 'Fat Burn', value: 70, fill: '#81c784' },
                { name: 'Cardio', value: 85, fill: '#ffb74d' },
                { name: 'Peak', value: 100, fill: '#f06292' },
                { name: 'Current', value: currentHeartRate, fill: '#8884d8' },
              ]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background
                dataKey="value"
                label={{ 
                  position: 'insideStart', 
                  fill: '#fff', 
                  fontSize: 14
                }}
              />
              <Legend 
                iconSize={10} 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
              />
              <Tooltip />
            </RadialBarChart>
          ) : (
            <ScatterChart
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <defs>
                <radialGradient id="colorHR" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#8884d8" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#8884d8" stopOpacity={0.1}/>
                </radialGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,200,200,0.2)" />
              <XAxis 
                dataKey={period === 'day' ? "time" : "date"} 
                type="category"
                name="Time" 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }} 
                tickLine={{ stroke: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.text.secondary }}
              />
              <YAxis 
                dataKey="avg" 
                name="Heart Rate" 
                domain={[minValue, maxValue]} 
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                tickLine={{ stroke: theme.palette.text.secondary }}
                axisLine={{ stroke: theme.palette.text.secondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Zone reference areas */}
              {HR_ZONES.map((zone) => (
                <ReferenceArea 
                  key={zone.name}
                  y1={zone.min} 
                  y2={zone.max} 
                  fill={zone.color} 
                  fillOpacity={0.1} 
                  stroke="none"
                />
              ))}
              
              <Scatter 
                name="Heart Rate" 
                data={processedData} 
                fill="url(#colorHR)"
                line={{ stroke: '#8884d8', strokeWidth: 1 }}
                lineType="fitting"
              />
              <Brush 
                height={30} 
                stroke="#8884d8"
                y={370}
                fill="#f5f5f5"
                travellerWidth={10}
                startIndex={Math.max(0, processedData.length - 60)}
              />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </Box>
      
      {/* Heart rate zone summary */}
      {zoneView && period === 'day' && (
        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {HR_ZONES.map(zone => {
            // Calculate time spent in each zone
            const pointsInZone = processedData.filter(point => {
              const hr = point.avg || point.value || 0;
              return hr >= zone.min && hr < zone.max;
            });
            
            const percentInZone = (pointsInZone.length / processedData.length) * 100;
            
            return (
              <Paper
                key={zone.name}
                elevation={1}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: `1px solid ${zone.color}`,
                  minWidth: 120,
                  textAlign: 'center'
                }}
              >
                <Typography variant="subtitle2" sx={{ color: zone.color, fontWeight: 'bold' }}>
                  {zone.name}
                </Typography>
                <Typography variant="h6" sx={{ my: 1 }}>
                  {Math.round(percentInZone)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {zone.min}-{zone.max} BPM
                </Typography>
              </Paper>
            );
          })}
        </Box>
      )}
    </Paper>
  );
};

export default HeartRateChart;