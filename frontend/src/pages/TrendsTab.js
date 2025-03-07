import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  LinearProgress,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Tab,
  Tabs,
  useTheme,
  alpha,
  Zoom,
  Fade,
  Avatar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SpaIcon from '@mui/icons-material/Spa';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MeditationIcon from '@mui/icons-material/SelfImprovement';
import BoltIcon from '@mui/icons-material/Bolt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAuth } from '../context/AuthContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip as ChartTooltip, 
  Legend, 
  Filler, 
  RadialLinearScale,
  ArcElement
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

// Register the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement
);

const TrendsTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [healthScore, setHealthScore] = useState(84);
  const [showTooltips, setShowTooltips] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Mock data for charts and visualizations
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create gradient for charts
  const createGradient = (ctx, color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const toggleTooltip = (key) => {
    setShowTooltips(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Chart data for health score trends
  const healthScoreData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Health Score',
        data: [68, 72, 75, 78, 82, 84],
        borderColor: theme.palette.success.main,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          return createGradient(
            ctx,
            alpha(theme.palette.success.main, 0.4),
            alpha(theme.palette.success.main, 0.1)
          );
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.palette.success.main,
        pointBorderWidth: 2,
        pointBorderColor: 'white',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
  
  // Chart data for sleep quality
  const sleepQualityData = {
    labels: weekDays,
    datasets: [
      {
        label: 'Deep Sleep (hours)',
        data: [1.5, 1.3, 1.2, 1.6, 1.7, 1.4, 1.5],
        backgroundColor: alpha(theme.palette.primary.dark, 0.6),
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'REM Sleep (hours)',
        data: [1.8, 1.9, 1.6, 2.0, 2.1, 1.8, 1.9],
        backgroundColor: alpha(theme.palette.primary.main, 0.6),
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Light Sleep (hours)',
        data: [3.5, 3.2, 3.1, 3.7, 3.8, 3.6, 3.8],
        backgroundColor: alpha(theme.palette.primary.light, 0.6),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };
  
  // Chart data for heart rate zones
  const heartRateZoneData = {
    labels: ['Resting', 'Light', 'Cardio', 'Peak'],
    datasets: [
      {
        label: 'Time spent (minutes/day)',
        data: [840, 520, 60, 20],
        backgroundColor: [
          alpha('#9e9e9e', 0.7),
          alpha('#4caf50', 0.7),
          alpha('#ff9800', 0.7),
          alpha('#f44336', 0.7),
        ],
        borderColor: [
          '#9e9e9e',
          '#4caf50',
          '#ff9800',
          '#f44336',
        ],
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };

  // Chart data for activity balance
  const activityBalanceData = {
    labels: ['Cardiovascular', 'Strength', 'Flexibility', 'Balance', 'Recovery', 'HIIT'],
    datasets: [
      {
        label: 'Current',
        data: [85, 70, 60, 55, 80, 65],
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        borderColor: theme.palette.primary.main,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.primary.main
      },
      {
        label: 'Optimal',
        data: [80, 75, 75, 70, 85, 70],
        backgroundColor: 'transparent',
        borderColor: alpha(theme.palette.success.main, 0.7),
        borderDash: [5, 5],
        pointBackgroundColor: theme.palette.success.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.success.main
      }
    ],
  };
  
  // Require authentication for trends tab
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
                boxShadow: '0 8px 16px rgba(255, 152, 0, 0.15)'
              }}>
                <AutoGraphIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="#ff9800" gutterBottom>
              Health Insights & Trends
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2, mb: 3, maxWidth: 600, mx: 'auto' }}>
              Connect to a fitness service to unlock powerful health analytics and personalized recommendations.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              color="warning"
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 8,
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 8px 20px rgba(255, 152, 0, 0.3)',
                fontWeight: 'bold',
                '&:hover': {
                  boxShadow: '0 12px 24px rgba(255, 152, 0, 0.4)'
                }
              }}
            >
              Connect Fitness Device
            </Button>
          </Paper>
        </Box>
      </motion.div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} sx={{ color: theme.palette.warning.main, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" align="center">
            Analyzing your health data...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Section Navigation Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'medium',
              minHeight: 48,
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.warning.main,
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.warning.main,
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab icon={<AutoGraphIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<FavoriteIcon />} iconPosition="start" label="Heart Health" />
          <Tab icon={<BedtimeIcon />} iconPosition="start" label="Sleep Insights" />
          <Tab icon={<DirectionsRunIcon />} iconPosition="start" label="Activity & Fitness" />
          <Tab icon={<PsychologyIcon />} iconPosition="start" label="Lifestyle Patterns" />
        </Tabs>
      </Box>
      
      {/* Main Content - Based on selected tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab Content */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Health Score Card */}
              <Grid item xs={12} md={7}>
                <Card 
                  elevation={2}
                  sx={{ 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    height: '100%',
                    background: 'linear-gradient(145deg, #ffffff, #f8f9ff)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2.5,
                      background: 'linear-gradient(90deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.03) 100%)',
                      borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), color: theme.palette.success.main }}>
                        <WhatshotIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Health Score Evolution</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Download Data">
                        <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
                        <CircularProgress
                          variant="determinate"
                          value={84}
                          size={110}
                          thickness={10}
                          sx={{ 
                            color: theme.palette.success.main,
                            boxShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.2)}`,
                            background: alpha(theme.palette.success.main, 0.1),
                            borderRadius: '50%',
                            p: 0.5
                          }}
                        />
                        <Box sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="h3" fontWeight="bold" color={theme.palette.success.main}>
                            {healthScore}
                          </Typography>
                          <Typography variant="caption" fontWeight="medium" color={theme.palette.text.secondary}>
                            / 100
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">Overall Health Score</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.8 }}>
                          Based on heart rate, sleep, activity, and recovery data
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            icon={<TrendingUpIcon fontSize="small" />}
                            label="+16 since January" 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(theme.palette.success.main, 0.1), 
                              color: theme.palette.success.main, 
                              fontWeight: 'medium',
                              borderRadius: 3,
                              py: 1.5
                            }} 
                          />
                          <Tooltip 
                            title="Your health score has improved 24% in the last 6 months"
                            placement="top"
                            arrow
                          >
                            <IconButton size="small" sx={{ p: 0.5 }}>
                              <InfoOutlinedIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ height: 260, position: 'relative' }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        6-Month Progression
                      </Typography>
                      <Line 
                        data={healthScoreData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              mode: 'index',
                              intersect: false,
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                              titleColor: theme.palette.text.primary,
                              bodyColor: theme.palette.text.secondary,
                              borderColor: theme.palette.divider,
                              borderWidth: 1,
                              padding: 12,
                              boxPadding: 6,
                              usePointStyle: true,
                              titleFont: {
                                weight: 'bold'
                              }
                            }
                          },
                          scales: {
                            x: {
                              grid: {
                                display: false
                              }
                            },
                            y: {
                              min: 0,
                              max: 100,
                              ticks: {
                                stepSize: 20
                              },
                              grid: {
                                color: alpha(theme.palette.divider, 0.1)
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Component Scores Card */}
              <Grid item xs={12} md={5}>
                <Card 
                  elevation={2}
                  sx={{ 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    height: '100%',
                    background: 'linear-gradient(145deg, #ffffff, #f8f9ff)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2.5,
                      background: 'linear-gradient(90deg, rgba(63,81,181,0.1) 0%, rgba(63,81,181,0.03) 100%)',
                      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2), color: theme.palette.primary.main }}>
                        <AutoGraphIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Health Components</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#673ab7', 0.1) }}>
                            <BedtimeIcon sx={{ fontSize: 16, color: '#673ab7' }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">Sleep Quality</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">88/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={88} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#673ab7', 0.2),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: '#673ab7',
                            backgroundImage: 'linear-gradient(90deg, #673ab7, #9c27b0)' 
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} /> 
                        Improved 6% this month
                      </Typography>
                    </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#673ab7', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BedtimeIcon /> Sleep Optimization Insights
                  </Typography>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                      Ideal Sleep Window Detected
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label="10:45 PM - 6:30 AM" 
                        sx={{ 
                          bgcolor: alpha('#673ab7', 0.1), 
                          color: '#673ab7', 
                          px: 2, 
                          fontWeight: 'medium' 
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        7.75 hours
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      When you sleep within this window, you average 22% more deep sleep and 14% more REM sleep. Your morning recovery scores are typically 15-20 points higher.
                    </Typography>
                    
                    <Typography variant="subtitle2" fontWeight="medium" sx={{ mt: 3, mb: 1 }}>
                      Sleep Quality Factors
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: '50%' }} />
                        <Typography variant="body2" fontWeight="medium">
                          Positive Impact:
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 3 }}>
                        Exercise before 7 PM, consistent sleep schedule, bedroom temperature below 70°F
                      </Typography>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#f44336', borderRadius: '50%' }} />
                        <Typography variant="body2" fontWeight="medium">
                          Negative Impact:
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 3 }}>
                        Screen time after 9 PM, caffeine after 2 PM, alcohol consumption
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <FavoriteIcon /> Heart Health Analysis
                  </Typography>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                      Resting Heart Rate Trend
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h4" color="#f44336" fontWeight="bold">
                        62
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        BPM (3-month average)
                      </Typography>
                      <Chip 
                        label="-3 BPM" 
                        size="small"
                        sx={{ 
                          ml: 2,
                          bgcolor: alpha('#4caf50', 0.1), 
                          color: '#4caf50',
                          fontWeight: 'medium' 
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" paragraph>
                      Your resting heart rate has decreased by 3 BPM over the past 3 months, indicating improved cardiovascular efficiency and fitness.
                    </Typography>
                    
                    <Typography variant="subtitle2" fontWeight="medium" sx={{ mt: 3, mb: 1 }}>
                      Heart Rate Variability (HRV)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" fontWeight="bold">
                        42
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ms (30-day average)
                      </Typography>
                      <Chip 
                        label="+5 ms" 
                        size="small"
                        sx={{ 
                          ml: 2,
                          bgcolor: alpha('#4caf50', 0.1), 
                          color: '#4caf50',
                          fontWeight: 'medium' 
                        }} 
                      />
                    </Box>
                    <Typography variant="body2">
                      Your increasing HRV suggests improved stress resilience and autonomic nervous system balance. This correlates with your improved recovery scores.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <DirectionsRunIcon /> Activity Pattern Optimization
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                          Peak Performance Times
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          <Chip 
                            label="Cardio: 6:30-8:00 AM" 
                            sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3' }} 
                          />
                          <Chip 
                            label="Strength: 4:00-6:00 PM" 
                            sx={{ bgcolor: alpha('#f44336', 0.1), color: '#f44336' }} 
                          />
                          <Chip 
                            label="Flexibility: 7:30-9:00 PM" 
                            sx={{ bgcolor: alpha('#673ab7', 0.1), color: '#673ab7' }} 
                          />
                        </Box>
                        <Typography variant="body2" paragraph>
                          Based on your heart rate variability, body temperature, and historical performance data, these time windows align with your body's natural rhythms for different types of exercise.
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                          Weekly Activity Balance
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Cardiovascular</Typography>
                            <Typography variant="body2" fontWeight="medium">135 mins/week</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={90} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha('#2196f3', 0.2),
                              '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Target: 150 mins/week
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Strength Training</Typography>
                            <Typography variant="body2" fontWeight="medium">80 mins/week</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={67} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha('#f44336', 0.2),
                              '& .MuiLinearProgress-bar': { bgcolor: '#f44336' }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Target: 120 mins/week
                          </Typography>
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Flexibility/Mobility</Typography>
                            <Typography variant="body2" fontWeight="medium">40 mins/week</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={53} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha('#673ab7', 0.2),
                              '& .MuiLinearProgress-bar': { bgcolor: '#673ab7' }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Target: 75 mins/week
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#ff9800', 0.05) }}>
                  <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 2 }}>
                    AI-Generated Health Insights
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Highest Impact Actions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#4caf50">
                            Increase Strength Training
                          </Typography>
                          <Typography variant="body2">
                            Adding one more strength session per week would optimize your muscle recovery pattern and improve metabolic health markers. Your recovery data suggests you can handle this increased load.
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: '#4caf50', fontWeight: 'medium' }}>
                            Estimated impact: +4.5 health score points
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#673ab7">
                            Standardize Sleep Schedule
                          </Typography>
                          <Typography variant="body2">
                            Your weekend sleep timing varies by over 2 hours from weekdays. Reducing this variation to under 1 hour would significantly improve your circadian rhythm and deep sleep quantity.
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: '#673ab7', fontWeight: 'medium' }}>
                            Estimated impact: +3.8 health score points
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#2196f3">
                            Reduce Sedentary Periods
                          </Typography>
                          <Typography variant="body2">
                            You currently have 3-4 hour blocks of continuous sitting. Breaking these up with 5-minute movement breaks every 50 minutes would significantly improve glucose regulation and circulation.
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: '#2196f3', fontWeight: 'medium' }}>
                            Estimated impact: +3.2 health score points
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Behavioral Pattern Recognition
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#ff9800">
                            Stress Impact Detection
                          </Typography>
                          <Typography variant="body2" paragraph>
                            We've detected a pattern where high-stress days (identified by elevated daytime heart rate and reduced HRV) are followed by disrupted sleep and reduced activity the next day.
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Recommendation:
                          </Typography>
                          <Typography variant="body2">
                            On high-stress days, prioritize a 15-minute relaxation routine before bed (breathing exercises or gentle stretching) to break this cycle.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="#ff9800">
                            Workout Recovery Optimization
                          </Typography>
                          <Typography variant="body2" paragraph>
                            Your high-intensity workouts (HR {'>'} 85% max) show optimal adaptations when followed by an active recovery day rather than complete rest or another high-intensity session.
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Recommendation:
                          </Typography>
                          <Typography variant="body2">
                            Implement a structured hard/easy training pattern with light activity (walking, yoga, swimming) on recovery days rather than complete inactivity.
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default TrendsTab;