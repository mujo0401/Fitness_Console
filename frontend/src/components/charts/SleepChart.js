import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  AreaChart,
  Treemap,
  Rectangle,
  SankeyChart,
  Sankey,
  SankeyLink,
  SankeyNode
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
  LinearProgress,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Modal,
  Slider
} from '@mui/material';
import { motion } from 'framer-motion';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import RadarIcon from '@mui/icons-material/Radar';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import WaterIcon from '@mui/icons-material/Water';
import WavesIcon from '@mui/icons-material/Waves';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import RestoreIcon from '@mui/icons-material/Restore';
import TimerIcon from '@mui/icons-material/Timer';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { format, parseISO, subDays, addHours, addMinutes, differenceInMinutes, set } from 'date-fns';

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

// Generate sleep cycles visualization - approximates how a person might have cycled through sleep stages
const generateSleepCycles = (sleepData) => {
  if (!sleepData) return [];
  
  // Default start and end times if not provided
  const startTime = sleepData.startTime || '11:00 PM';
  const endTime = sleepData.endTime || '7:00 AM';
  
  // Convert to Date objects for manipulation
  const startDate = new Date();
  const [startHour, startMinute] = startTime.split(':');
  let startHourNum = parseInt(startHour);
  if (startTime.includes('PM') && startHourNum !== 12) startHourNum += 12;
  if (startTime.includes('AM') && startHourNum === 12) startHourNum = 0;
  startDate.setHours(startHourNum);
  startDate.setMinutes(parseInt(startMinute.split(' ')[0]));
  
  const endDate = new Date();
  const [endHour, endMinute] = endTime.split(':');
  let endHourNum = parseInt(endHour);
  if (endTime.includes('PM') && endHourNum !== 12) endHourNum += 12;
  if (endTime.includes('AM') && endHourNum === 12) endHourNum = 0;
  endDate.setHours(endHourNum);
  endDate.setMinutes(parseInt(endMinute.split(' ')[0]));
  
  // Handle the case where sleep spans midnight
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  const durationMinutes = sleepData.durationMinutes || 
    ((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  
  // Sleep cycles are typically 90-110 minutes each
  const typicalCycleLength = 95; // minutes
  const estimatedCycles = Math.floor(durationMinutes / typicalCycleLength);
  
  // Stage percentages from sleepData or default approximations
  const deepPercent = sleepData.deepSleepPercentage || 20;
  const remPercent = sleepData.remSleepPercentage || 25;
  const lightPercent = sleepData.lightSleepPercentage || 55;
  
  // Create cycles data for visualization
  const cycles = [];
  let currentTime = new Date(startDate);
  
  // Add initial falling asleep period (always light sleep)
  cycles.push({
    stage: 'light',
    startTime: format(currentTime, 'HH:mm'),
    durationMinutes: 20,
    label: 'Falling Asleep'
  });
  
  currentTime = addMinutes(currentTime, 20);
  
  for (let i = 0; i < estimatedCycles; i++) {
    // Each cycle follows a pattern: Light → Deep → Light → REM
    // But we'll adjust based on the actual percentages
    
    // Cycle stage durations - adjusted based on the sleep stage percentages
    const cycleDeepMinutes = Math.round((deepPercent / 100) * typicalCycleLength * 1.2); // Weight deep sleep more early in night
    const cycleRemMinutes = Math.round((remPercent / 100) * typicalCycleLength * (i/estimatedCycles + 0.5)); // REM increases in later cycles
    const cycleLightMinutes = typicalCycleLength - cycleDeepMinutes - cycleRemMinutes;
    
    // First light sleep phase
    const lightDuration1 = Math.round(cycleLightMinutes * 0.4);
    cycles.push({
      stage: 'light',
      startTime: format(currentTime, 'HH:mm'),
      durationMinutes: lightDuration1,
      cycleNumber: i + 1
    });
    currentTime = addMinutes(currentTime, lightDuration1);
    
    // Deep sleep phase - longer in early cycles, shorter in later ones
    const adjustedDeepMinutes = i < 2 
      ? cycleDeepMinutes 
      : Math.round(cycleDeepMinutes * (1 - i / estimatedCycles * 0.7));
    
    cycles.push({
      stage: 'deep',
      startTime: format(currentTime, 'HH:mm'),
      durationMinutes: adjustedDeepMinutes,
      cycleNumber: i + 1
    });
    currentTime = addMinutes(currentTime, adjustedDeepMinutes);
    
    // Second light sleep phase
    const lightDuration2 = Math.round(cycleLightMinutes * 0.6);
    cycles.push({
      stage: 'light',
      startTime: format(currentTime, 'HH:mm'),
      durationMinutes: lightDuration2,
      cycleNumber: i + 1
    });
    currentTime = addMinutes(currentTime, lightDuration2);
    
    // REM sleep phase - increases with each cycle
    const adjustedRemMinutes = Math.round(cycleRemMinutes * (1 + i / estimatedCycles * 0.8));
    
    cycles.push({
      stage: 'rem',
      startTime: format(currentTime, 'HH:mm'),
      durationMinutes: adjustedRemMinutes,
      cycleNumber: i + 1
    });
    currentTime = addMinutes(currentTime, adjustedRemMinutes);
    
    // Add brief awakening (50% chance in later cycles)
    if (i > 1 && Math.random() > 0.5) {
      cycles.push({
        stage: 'awake',
        startTime: format(currentTime, 'HH:mm'),
        durationMinutes: Math.round(2 + Math.random() * 5),
        label: 'Brief Awakening'
      });
      currentTime = addMinutes(currentTime, 5);
    }
  }
  
  // Add waking up phase
  cycles.push({
    stage: 'awake',
    startTime: format(currentTime, 'HH:mm'),
    durationMinutes: 10,
    label: 'Waking Up'
  });
  
  return cycles;
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
  const [viewType, setViewType] = useState('sleepTimeline');
  const [chartType, setChartType] = useState('timeline');
  const [chartData, setChartData] = useState([]);
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [sleepCycles, setSleepCycles] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  
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
      continuityScore: Math.max(0, 100 - ((item.awakeDuringNight || 0) / 5) * 10), // Lower awake time is better
      
      // Sleep wellness index - proprietary score that weighs different factors
      wellnessIndex: calculateSleepWellnessIndex(item),
      
      // Sleep recovery score - emphasizes restorative sleep quality
      recoveryScore: calculateRecoveryScore(item)
    }));
    
    // Sort by date
    processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setChartData(processedData);
    
    // Set the latest day as selected for detailed view
    if (processedData.length > 0 && !selectedDay) {
      setSelectedDay(processedData[processedData.length - 1]);
    }
    
    // Generate AI analysis for selected day
    if (selectedDay) {
      // Generate estimated sleep cycles
      const cycles = generateSleepCycles(selectedDay);
      setSleepCycles(cycles);
      
      // Generate AI insights 
      generateAIInsights(selectedDay);
    }
  }, [data, viewType, selectedDay]);
  
  // Calculate proprietary sleep wellness index
  const calculateSleepWellnessIndex = (sleepData) => {
    if (!sleepData) return 0;
    
    // Base factors
    const durationFactor = Math.min(100, (sleepData.durationMinutes / 480) * 100); // 8 hours is optimal
    const efficiencyFactor = sleepData.efficiency || 85;
    const deepSleepFactor = ((sleepData.deepSleepPercentage || 20) / 25) * 100; // 25% deep sleep is ideal
    const remSleepFactor = ((sleepData.remSleepPercentage || 22) / 25) * 100; // 25% REM sleep is ideal
    const continuityFactor = 100 - Math.min(100, ((sleepData.awakeDuringNight || 10) / 20) * 100); // Lower awake time is better
    
    // Weighted formula
    const wellnessIndex = Math.round(
      (durationFactor * 0.25) +
      (efficiencyFactor * 0.2) +
      (deepSleepFactor * 0.25) +
      (remSleepFactor * 0.2) +
      (continuityFactor * 0.1)
    );
    
    return Math.max(0, Math.min(100, wellnessIndex));
  };
  
  // Calculate recovery score - focused on physical recovery aspects
  const calculateRecoveryScore = (sleepData) => {
    if (!sleepData) return 0;
    
    // Recovery factors - deep sleep is weighted heavily for physical recovery
    const deepSleepFactor = ((sleepData.deepSleepPercentage || 15) / 25) * 100;
    const sleepDurationFactor = Math.min(100, (sleepData.durationMinutes / 480) * 100);
    const efficiencyFactor = sleepData.efficiency || 85;
    
    // Calculate recovery score with higher emphasis on deep sleep
    const recoveryScore = Math.round(
      (deepSleepFactor * 0.5) +
      (sleepDurationFactor * 0.3) +
      (efficiencyFactor * 0.2)
    );
    
    return Math.max(0, Math.min(100, recoveryScore));
  };
  
  // Generate advanced AI insights based on sleep data
  const generateAIInsights = (sleepData) => {
    if (!sleepData) return;
    
    // Deeper analysis of sleep patterns
    const insights = {
      // Sleep quality assessment
      quality: {
        score: sleepData.score || 75,
        assessment: getQualityAssessment(sleepData.score || 75),
        factors: []
      },
      
      // Physical recovery assessment
      recovery: {
        score: calculateRecoveryScore(sleepData),
        assessment: ''
      },
      
      // Sleep hygiene recommendations
      recommendations: [],
      
      // Sleep schedule analysis
      scheduleAnalysis: {},
      
      // Brain health impact
      brainHealth: {}
    };
    
    // Add quality factors based on sleep data
    if ((sleepData.deepSleepPercentage || 0) < 15) {
      insights.quality.factors.push({
        type: 'concern',
        message: 'Low deep sleep percentage may impact physical recovery',
        icon: 'warning'
      });
    } else if ((sleepData.deepSleepPercentage || 0) > 25) {
      insights.quality.factors.push({
        type: 'positive',
        message: 'Excellent deep sleep percentage supports physical recovery',
        icon: 'check'
      });
    }
    
    if ((sleepData.remSleepPercentage || 0) < 15) {
      insights.quality.factors.push({
        type: 'concern',
        message: 'Low REM sleep may impact memory consolidation and emotional processing',
        icon: 'warning'
      });
    } else if ((sleepData.remSleepPercentage || 0) > 25) {
      insights.quality.factors.push({
        type: 'positive',
        message: 'Optimal REM sleep supporting cognitive function and emotional well-being',
        icon: 'check'
      });
    }
    
    // Recovery assessment text
    const recoveryScore = calculateRecoveryScore(sleepData);
    if (recoveryScore >= 85) {
      insights.recovery.assessment = 'Excellent recovery. Your body received optimal restorative sleep.';
    } else if (recoveryScore >= 70) {
      insights.recovery.assessment = 'Good recovery. Your sleep provided substantial physical restoration.';
    } else if (recoveryScore >= 50) {
      insights.recovery.assessment = 'Moderate recovery. Your body received some restorative benefits.';
    } else {
      insights.recovery.assessment = 'Limited recovery. Consider prioritizing sleep quality to improve physical restoration.';
    }
    
    // Generate personalized recommendations
    if (sleepData.durationMinutes < 420) { // Less than 7 hours
      insights.recommendations.push({
        type: 'duration',
        message: 'Consider extending your sleep time to 7-9 hours for optimal health',
        priority: 'high'
      });
    }
    
    if ((sleepData.efficiency || 0) < 85) {
      insights.recommendations.push({
        type: 'efficiency',
        message: 'Improve sleep efficiency by maintaining a consistent sleep schedule',
        priority: 'medium'
      });
    }
    
    if ((sleepData.deepSleepPercentage || 0) < 15) {
      insights.recommendations.push({
        type: 'deepSleep',
        message: 'To improve deep sleep: avoid alcohol before bed, exercise regularly, and maintain cool bedroom temperature',
        priority: 'high'
      });
    }
    
    // Brain health impact analysis
    insights.brainHealth = {
      cognitiveFunction: (sleepData.remSleepPercentage || 0) >= 20 ? 'Optimal' : 'Suboptimal',
      emotionalRegulation: (sleepData.remSleepPercentage || 0) >= 20 ? 'Well-supported' : 'May be impacted',
      memoryConsolidation: (sleepData.deepSleepPercentage || 0) >= 20 ? 'Strong' : 'May be reduced'
    };
    
    // Schedule analysis
    insights.scheduleAnalysis = {
      optimalSleepTime: '10:30 PM - 6:30 AM',
      circadianAlignment: sleepData.startTime?.includes('PM') ? 'Good' : 'May need adjustment',
      consistencyScore: 85
    };
    
    setAiInsights(insights);
  };
  
  // Helper function for quality assessment text
  const getQualityAssessment = (score) => {
    if (score >= 90) return 'Excellent sleep quality supporting optimal cognitive and physical functioning';
    if (score >= 80) return 'Very good sleep quality supporting healthy brain and body recovery';
    if (score >= 70) return 'Good sleep quality providing adequate recovery';
    if (score >= 60) return 'Fair sleep quality with room for improvement';
    return 'Sleep quality needs attention to better support health and recovery';
  };
  
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
  
  // Sleep Timeline visualization component
  const SleepTimelineView = () => {
    if (!selectedDay || !sleepCycles || sleepCycles.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <CircularProgress size={30} />
          <Typography sx={{ mt: 2 }}>Generating sleep cycle data...</Typography>
        </Box>
      );
    }
    
    // Calculate total width for the timeline
    const totalDuration = sleepCycles.reduce((sum, cycle) => sum + cycle.durationMinutes, 0);
    
    // Get start and end times
    const startTime = selectedDay.startTime || sleepCycles[0].startTime;
    const endTime = selectedDay.endTime || sleepCycles[sleepCycles.length - 1].startTime;
    
    // Color mapping for sleep stages
    const stageColors = {
      deep: '#3f51b5',
      rem: '#2196f3',
      light: '#9c27b0',
      awake: '#ff9800'
    };
    
    const stageIcons = {
      deep: <WavesIcon fontSize="small" sx={{ color: stageColors.deep, verticalAlign: 'middle' }} />,
      rem: <PsychologyIcon fontSize="small" sx={{ color: stageColors.rem, verticalAlign: 'middle' }} />,
      light: <NightsStayIcon fontSize="small" sx={{ color: stageColors.light, verticalAlign: 'middle' }} />,
      awake: <LightModeIcon fontSize="small" sx={{ color: stageColors.awake, verticalAlign: 'middle' }} />
    };
    
    return (
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BedtimeIcon color="primary" />
          Sleep Cycle Timeline
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {startTime || '10:30 PM'} - {endTime || '6:45 AM'}
          </Typography>
        </Typography>
        
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', bgcolor: alpha(theme.palette.background.paper, 0.6), mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This visualization shows your estimated sleep cycles throughout the night, showcasing how your sleep transitioned between different stages.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 1, px: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {startTime || '10:30 PM'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {endTime || '6:45 AM'}
            </Typography>
          </Box>
          
          {/* Timeline visualization */}
          <Box sx={{ 
            width: '100%', 
            height: 100, 
            position: 'relative', 
            bgcolor: 'rgba(0,0,0,0.03)', 
            borderRadius: 2, 
            overflow: 'hidden' 
          }}>
            {sleepCycles.map((cycle, index) => {
              // Calculate width based on proportion of total duration
              const width = `${(cycle.durationMinutes / totalDuration) * 100}%`;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  style={{
                    position: 'absolute',
                    left: `${sleepCycles.slice(0, index).reduce((sum, c) => sum + (c.durationMinutes / totalDuration) * 100, 0)}%`,
                    width: width,
                    height: '100%',
                    backgroundColor: stageColors[cycle.stage],
                    opacity: cycle.stage === 'awake' ? 0.5 : 0.8
                  }}
                >
                  <MuiTooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2">{cycle.stage.charAt(0).toUpperCase() + cycle.stage.slice(1)} Sleep</Typography>
                        <Typography variant="body2">Time: {cycle.startTime}</Typography>
                        <Typography variant="body2">Duration: {formatDuration(cycle.durationMinutes)}</Typography>
                        {cycle.label && <Typography variant="body2">{cycle.label}</Typography>}
                        {cycle.cycleNumber && <Typography variant="body2">Cycle: {cycle.cycleNumber}</Typography>}
                      </Box>
                    }
                  >
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      userSelect: 'none'
                    }}>
                      {width.replace('%', '') > 5 && (
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>
                          {cycle.stage.toUpperCase()}
                        </Typography>
                      )}
                    </Box>
                  </MuiTooltip>
                </motion.div>
              );
            })}
          </Box>
          
          {/* Legend */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
            {Object.entries(stageColors).map(([stage, color]) => (
              <Box key={stage} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
                <Typography variant="caption" fontWeight="medium">
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
        
        {/* Cycle Summary */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HourglassTopIcon color="primary" fontSize="small" />
                  Sleep Cycles
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your sleep had approximately {Math.floor(totalDuration / 90)} complete sleep cycles. A typical cycle progresses through light, deep, and REM sleep stages.
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    {stageIcons.deep} Deep Sleep: Physically restorative, crucial for recovery
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    {stageIcons.rem} REM Sleep: Mentally restorative, important for memory and learning
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    {stageIcons.light} Light Sleep: Transitional, still beneficial for overall rest
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', bgcolor: 'rgba(0,0,0,0.02)' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon color="primary" fontSize="small" />
                  Optimal Sleep Pattern
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, position: 'relative' }}>
                  {/* Time arrow */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: 0, 
                    right: 0, 
                    height: 2, 
                    bgcolor: 'rgba(0,0,0,0.1)', 
                    zIndex: 0 
                  }} />
                  
                  {/* Cycle nodes */}
                  {[...Array(5)].map((_, i) => (
                    <Box key={i} sx={{ 
                      position: 'relative', 
                      width: `${100/5}%`, 
                      textAlign: 'center', 
                      zIndex: 1 
                    }}>
                      <Box sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.primary.main, 
                        margin: '0 auto',
                        border: '2px solid white'
                      }} />
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        Cycle {i+1}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                
                <Stack spacing={1} sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    Ideal sleep follows a 90-minute cycle pattern with 4-6 complete cycles per night. The amount of REM sleep increases in later cycles while deep sleep dominates early cycles.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2, mb: 3 }}>
        <Typography color="text.secondary">No sleep data available</Typography>
      </Paper>
    );
  }
  
  // AI Analysis component
  const SleepAIAnalysisView = () => {
    if (!selectedDay || !aiInsights) {
      return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <CircularProgress size={30} />
          <Typography sx={{ mt: 2 }}>Generating AI analysis...</Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ 
          borderRadius: 3, 
          p: 2, 
          mb: 3,
          background: 'linear-gradient(145deg, #f3e5f5, #f8effa)',
          boxShadow: '0 4px 20px rgba(156, 39, 176, 0.1)',
          border: '1px solid rgba(156, 39, 176, 0.1)'
        }}>
          <Typography variant="h6" color="#9c27b0" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon /> 
            Sleep Intelligence™ AI Analysis
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            Advanced neural analysis of your sleep patterns to optimize recovery and cognitive performance
          </Typography>
          
          <Grid container spacing={3}>
            {/* Quality Assessment */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HealthAndSafetyIcon fontSize="small" color="primary" />
                  Sleep Quality
                </Typography>
                
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={100}
                    thickness={4}
                    sx={{ color: alpha(theme.palette.grey[200], 0.8), position: 'absolute' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={aiInsights.quality.score}
                    size={100}
                    thickness={4}
                    sx={{ 
                      color: aiInsights.quality.score > 80 ? theme.palette.success.main : 
                              aiInsights.quality.score > 60 ? theme.palette.primary.main : 
                              aiInsights.quality.score > 40 ? theme.palette.warning.main : theme.palette.error.main
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {aiInsights.quality.score}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" textAlign="center" gutterBottom>
                  {aiInsights.quality.assessment}
                </Typography>
                
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {aiInsights.quality.factors.map((factor, idx) => (
                    <Box key={idx} sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: factor.type === 'positive' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                      border: `1px dashed ${factor.type === 'positive' ? theme.palette.success.main : theme.palette.warning.main}`
                    }}>
                      <Typography variant="body2" fontSize="0.8rem">
                        {factor.message}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
            
            {/* Recovery Assessment */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DeviceThermostatIcon fontSize="small" color="primary" />
                  Recovery Analysis
                </Typography>
                
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={100}
                    thickness={4}
                    sx={{ color: alpha(theme.palette.grey[200], 0.8), position: 'absolute' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={aiInsights.recovery.score}
                    size={100}
                    thickness={4}
                    sx={{ 
                      color: aiInsights.recovery.score > 80 ? theme.palette.success.main : 
                              aiInsights.recovery.score > 60 ? theme.palette.primary.main : 
                              aiInsights.recovery.score > 40 ? theme.palette.warning.main : theme.palette.error.main
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {aiInsights.recovery.score}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" textAlign="center" gutterBottom>
                  {aiInsights.recovery.assessment}
                </Typography>
                
                <Box sx={{ mt: 3, p: 1.5, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <Typography variant="subtitle2" gutterBottom>Brain Function Impact:</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Cognitive Function
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {aiInsights.brainHealth.cognitiveFunction}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Memory Consolidation
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {aiInsights.brainHealth.memoryConsolidation}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
            
            {/* Recommendations */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TipsAndUpdatesIcon fontSize="small" color="primary" />
                  AI Recommendations
                </Typography>
                
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {aiInsights.recommendations.map((recommendation, idx) => (
                    <Paper 
                      key={idx} 
                      elevation={0}
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 2,
                        bgcolor: recommendation.priority === 'high' 
                          ? alpha(theme.palette.error.light, 0.1)
                          : alpha(theme.palette.info.light, 0.1),
                        border: `1px solid ${recommendation.priority === 'high' 
                          ? alpha(theme.palette.error.light, 0.3)
                          : alpha(theme.palette.info.light, 0.3)}`
                      }}
                    >
                      <Typography variant="body2" fontSize="0.85rem">
                        {recommendation.message}
                      </Typography>
                    </Paper>
                  ))}
                  
                  {aiInsights.recommendations.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No specific recommendations needed. Your sleep patterns are optimized.
                      </Typography>
                    </Box>
                  )}
                </Stack>
                
                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
                    Sleep schedule analysis suggests your optimal sleep window is {aiInsights.scheduleAnalysis.optimalSleepTime}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

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
          <Tabs
            value={viewType}
            onChange={(e, newValue) => setViewType(newValue)}
            aria-label="sleep analysis tabs"
            sx={{ minHeight: 0 }}
          >
            <Tab 
              value="sleepTimeline" 
              label="Sleep Timeline" 
              icon={<BedtimeIcon fontSize="small" />} 
              iconPosition="start"
              sx={{ minHeight: 0, py: 1 }}
            />
            <Tab 
              value="sleepCycles" 
              label="Cycles" 
              icon={<HourglassTopIcon fontSize="small" />} 
              iconPosition="start"
              sx={{ minHeight: 0, py: 1 }}
            />
            <Tab 
              value="aiAnalysis" 
              label="AI Analysis" 
              icon={<AutoAwesomeIcon fontSize="small" />} 
              iconPosition="start"
              sx={{ minHeight: 0, py: 1 }}
            />
            <Tab 
              value="traditional" 
              label="Charts" 
              icon={<BarChartIcon fontSize="small" />} 
              iconPosition="start"
              sx={{ minHeight: 0, py: 1 }}
            />
          </Tabs>
          
          {viewType === 'traditional' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                  value={chartType === 'timeline' ? 'sleep' : 'duration'}
                  label="View"
                  onChange={(e) => setChartType(e.target.value === 'sleep' ? 'timeline' : e.target.value)}
                  size="small"
                >
                  <MenuItem value="duration">Sleep Duration</MenuItem>
                  <MenuItem value="efficiency">Sleep Efficiency</MenuItem>
                  <MenuItem value="score">Sleep Score</MenuItem>
                  <MenuItem value="stages">Sleep Stages</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Display different view types based on selection */}
      {viewType === 'sleepTimeline' && (
        <SleepTimelineView />
      )}
      
      {viewType === 'aiAnalysis' && (
        <SleepAIAnalysisView />
      )}
      
      {viewType === 'traditional' && (
        <>
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
          {chartType === 'duration' 
            ? 'Your sleep duration pattern over time. Recommended sleep for adults is 7-9 hours per night.'
            : chartType === 'efficiency'
              ? 'Sleep efficiency is the percentage of time in bed actually spent sleeping. Higher is better.'
              : chartType === 'score'
                ? 'Your sleep score combines duration, quality, and other factors into a 0-100 scale.'
                : chartType === 'stages'
                  ? 'Breakdown of sleep stages shows how much time you spend in each sleep phase.'
                  : chartType === 'pie'
                    ? 'Sleep stages visualization showing the proportion of different sleep phases.'
                    : 'Comprehensive analysis of your sleep quality across different metrics.'}
        </Typography>
        </>
      )}
      
      {viewType === 'sleepCycles' && selectedDay && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
            bgcolor: 'rgba(250,250,250,0.5)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Based on your sleep data, we've identified approximately {Math.floor(selectedDay.durationMinutes / 90)} complete sleep cycles.
              Each cycle typically lasts around 90-110 minutes and includes phases of light, deep, and REM sleep.
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Learn more about how your sleep cycles affect your mental and physical recovery by exploring the
                <Button
                  color="primary"
                  onClick={() => setViewType('aiAnalysis')}
                  sx={{ mx: 1 }}
                >
                  AI Analysis
                </Button>
                or view your detailed 
                <Button
                  color="primary"
                  onClick={() => setViewType('sleepTimeline')}
                  sx={{ mx: 1 }}
                >
                  Sleep Timeline
                </Button>
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default SleepChart;