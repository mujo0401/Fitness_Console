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
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WavesIcon from '@mui/icons-material/Waves';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MeditationIcon from '@mui/icons-material/SelfImprovement';
import BoltIcon from '@mui/icons-material/Bolt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import DevicesIcon from '@mui/icons-material/Devices';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#4caf50', 0.1) }}>
                            <DirectionsRunIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">Activity Level</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">76/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={76} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#4caf50', 0.2),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: '#4caf50',
                            backgroundImage: 'linear-gradient(90deg, #4caf50, #8bc34a)' 
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} /> 
                        Improved 12% this month
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#f44336', 0.1) }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: '#f44336' }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">Heart Health</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">83/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={83} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#f44336', 0.2),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: '#f44336',
                            backgroundImage: 'linear-gradient(90deg, #f44336, #ff9800)' 
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} /> 
                        Improved 8% this month
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#2196f3', 0.1) }}>
                            <BoltIcon sx={{ fontSize: 16, color: '#2196f3' }} />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">Recovery</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">90/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={90} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#2196f3', 0.2),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: '#2196f3',
                            backgroundImage: 'linear-gradient(90deg, #2196f3, #03a9f4)' 
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <TrendingUpIcon sx={{ fontSize: 14, color: theme.palette.success.main }} /> 
                        Improved 5% this month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {/* Heart Health Tab Navigation */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.error.main, 0.9),
                    borderRadius: 3,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mb: 2,
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteIcon />
                    <Typography variant="h6" fontWeight="bold">Heart Health Analysis</Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 0.5, md: 2 },
                      flexWrap: 'wrap'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" color="white" fontWeight="medium">
                        Monday, March 4, 2024
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        sx={{ color: 'white', opacity: 0.8, ml: 0.5 }}
                      >
                        <CalendarTodayIcon fontSize="small" />
                      </IconButton>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
                        >
                          <TrendingDownIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
                        >
                          <TrendingUpIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl 
                        size="small" 
                        sx={{ 
                          minWidth: 120, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                          '& .MuiSelect-select': { color: 'white' },
                          '& .MuiSvgIcon-root': { color: 'white' }
                        }}
                      >
                        <InputLabel>Period</InputLabel>
                        <Select
                          value="day"
                          label="Period"
                        >
                          <MenuItem value="day">Day</MenuItem>
                          <MenuItem value="week">Week</MenuItem>
                          <MenuItem value="month">Month</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Tooltip title="Refresh Data">
                        <IconButton size="small" sx={{ color: 'white' }}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Data Source Settings">
                        <IconButton size="small" sx={{ color: 'white' }}>
                          <DevicesIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              {/* Heart Rate Zones Card */}
              <Grid item xs={12} md={6}>
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
                      background: 'linear-gradient(90deg, rgba(244,67,54,0.1) 0%, rgba(244,67,54,0.03) 100%)',
                      borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.2), color: theme.palette.error.main }}>
                        <FavoriteIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Heart Rate Zones</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ height: 300, position: 'relative' }}>
                      <Doughnut 
                        data={heartRateZoneData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: '65%',
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 20,
                                usePointStyle: true,
                                boxWidth: 8
                              }
                            },
                            tooltip: {
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                              titleColor: theme.palette.text.primary,
                              bodyColor: theme.palette.text.secondary,
                              borderColor: theme.palette.divider,
                              borderWidth: 1,
                              padding: 12,
                              boxPadding: 6,
                              usePointStyle: true
                            }
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Time spent in different heart rate zones impacts cardiovascular health, 
                        calorie burn, and fitness improvements
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              borderRadius: 2
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold" color="error.main">72</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Resting Heart Rate
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 2, 
                              textAlign: 'center',
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              borderRadius: 2
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold" color="warning.main">149</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Max Heart Rate
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Heart Health Metrics Card */}
              <Grid item xs={12} md={6}>
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
                      background: 'linear-gradient(90deg, rgba(233,30,99,0.1) 0%, rgba(233,30,99,0.03) 100%)',
                      borderBottom: `1px solid ${alpha('#e91e63', 0.1)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha('#e91e63', 0.2), color: '#e91e63' }}>
                        <FavoriteIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Health Metrics</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        Heart Rate Variability
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={68}
                            size={60}
                            thickness={6}
                            sx={{ 
                              color: theme.palette.primary.main,
                              boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`,
                              borderRadius: '50%'
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
                            justifyContent: 'center'
                          }}>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                              68ms
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">HRV Score</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Good variability indicates better heart health and stress resilience
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        Cardiovascular Fitness
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">VO2 Max</Typography>
                            <Typography variant="body2" fontWeight="bold">42 ml/kg/min</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={75} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: theme.palette.primary.main
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Excellent for your age group (top 25%)
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Recovery Rate</Typography>
                            <Typography variant="body2" fontWeight="bold">32 BPM</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={65} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: theme.palette.primary.main
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Good - Your heart rate recovers efficiently after exercise
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        Weekly Heart Rate Trend
                      </Typography>
                      <Box sx={{ height: 120 }}>
                        <Line 
                          data={{
                            labels: weekDays,
                            datasets: [
                              {
                                label: 'Resting HR',
                                data: [68, 70, 72, 71, 69, 67, 65],
                                borderColor: theme.palette.error.main,
                                tension: 0.4
                              }
                            ]
                          }} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false
                              }
                            },
                            scales: {
                              y: {
                                min: 60,
                                max: 80,
                                ticks: {
                                  stepSize: 5
                                },
                                grid: {
                                  display: false
                                }
                              },
                              x: {
                                grid: {
                                  display: false
                                }
                              }
                            },
                            elements: {
                              point: {
                                radius: 3
                              }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Embedded HeartRateChart Component */}
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Detailed Heart Rate Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Full heart rate monitoring with detailed zones and patterns
                  </Typography>
                  {/* This would typically use imported HeartRateChart component with props */}
                  <Box sx={{ height: 450, bgcolor: 'background.paper', borderRadius: 4, p: 3, boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }}>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 15 }}>
                      Heart rate chart visualization would be displayed here using the HeartRateChart component
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 2 && (
            <Grid container spacing={3}>
              {/* Sleep Tab Navigation */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha('#673ab7', 0.9),
                    borderRadius: 3,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mb: 2,
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BedtimeIcon />
                    <Typography variant="h6" fontWeight="bold">Sleep Analysis</Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 0.5, md: 2 },
                      flexWrap: 'wrap'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" color="white" fontWeight="medium">
                        Monday, March 4, 2024
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        sx={{ color: 'white', opacity: 0.8, ml: 0.5 }}
                      >
                        <CalendarTodayIcon fontSize="small" />
                      </IconButton>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
                        >
                          <TrendingDownIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
                        >
                          <TrendingUpIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl 
                        size="small" 
                        sx={{ 
                          minWidth: 120, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                          '& .MuiSelect-select': { color: 'white' },
                          '& .MuiSvgIcon-root': { color: 'white' }
                        }}
                      >
                        <InputLabel>Period</InputLabel>
                        <Select
                          value="day"
                          label="Period"
                        >
                          <MenuItem value="day">Day</MenuItem>
                          <MenuItem value="week">Week</MenuItem>
                          <MenuItem value="month">Month</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Tooltip title="Refresh Data">
                        <IconButton size="small" sx={{ color: 'white' }}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Data Source Settings">
                        <IconButton size="small" sx={{ color: 'white' }}>
                          <DevicesIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              {/* Sleep Quality Card */}
              <Grid item xs={12} md={6}>
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
                      background: 'linear-gradient(90deg, rgba(103,58,183,0.1) 0%, rgba(103,58,183,0.03) 100%)',
                      borderBottom: `1px solid ${alpha('#673ab7', 0.1)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha('#673ab7', 0.2), color: '#673ab7' }}>
                        <BedtimeIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Sleep Quality Analysis</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ textAlign: 'center', width: '45%' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={88}
                            size={80}
                            thickness={8}
                            sx={{ 
                              color: '#673ab7',
                              boxShadow: `0 0 15px ${alpha('#673ab7', 0.2)}`,
                              borderRadius: '50%'
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
                            <Typography variant="h5" fontWeight="bold" color="#673ab7">
                              88
                            </Typography>
                            <Typography variant="caption" fontWeight="medium" color="text.secondary">
                              /100
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>
                          Sleep Quality Score
                        </Typography>
                      </Box>
                      
                      <Divider orientation="vertical" flexItem />
                      
                      <Box sx={{ textAlign: 'center', width: '45%' }}>
                        <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                          7.5h
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Nightly Sleep
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                          <Chip 
                            size="small" 
                            label="+0.5h Trend" 
                            sx={{ 
                              bgcolor: alpha(theme.palette.success.main, 0.1), 
                              color: theme.palette.success.main
                            }} 
                            icon={<TrendingUpIcon fontSize="small" />}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                      Sleep Stages Distribution
                    </Typography>
                    <Box sx={{ height: 220 }}>
                      <Bar 
                        data={sleepQualityData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: 'y',
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                usePointStyle: true,
                                boxWidth: 6
                              }
                            }
                          },
                          scales: {
                            x: {
                              stacked: true,
                              grid: {
                                display: false
                              }
                            },
                            y: {
                              stacked: true,
                              grid: {
                                display: false
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Sleep Patterns Card */}
              <Grid item xs={12} md={6}>
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
                      background: 'linear-gradient(90deg, rgba(156,39,176,0.1) 0%, rgba(156,39,176,0.03) 100%)',
                      borderBottom: `1px solid ${alpha('#9c27b0', 0.1)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha('#9c27b0', 0.2), color: '#9c27b0' }}>
                        <NightsStayIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Sleep Patterns</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            bgcolor: alpha('#9c27b0', 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold" color="#9c27b0">23:05</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Average Bedtime
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            bgcolor: alpha('#9c27b0', 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold" color="#9c27b0">06:35</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Average Wake Time
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                      Sleep Quality Factors
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WavesIcon sx={{ fontSize: 18, color: '#673ab7' }} />
                          <Typography variant="body2">Deep Sleep</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">1.7h</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={85} 
                        sx={{ 
                          height: 6, 
                          mt: 0.5,
                          borderRadius: 3,
                          bgcolor: alpha('#673ab7', 0.1),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: '#673ab7'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Excellent - 22% of total sleep time
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PsychologyIcon sx={{ fontSize: 18, color: '#9c27b0' }} />
                          <Typography variant="body2">REM Sleep</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">1.9h</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
                        sx={{ 
                          height: 6, 
                          mt: 0.5,
                          borderRadius: 3,
                          bgcolor: alpha('#9c27b0', 0.1),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: '#9c27b0'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Good - 25% of total sleep time
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HourglassTopIcon sx={{ fontSize: 18, color: '#3f51b5' }} />
                          <Typography variant="body2">Sleep Continuity</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">93%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={93} 
                        sx={{ 
                          height: 6, 
                          mt: 0.5,
                          borderRadius: 3,
                          bgcolor: alpha('#3f51b5', 0.1),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: '#3f51b5'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Excellent - Minimal disruptions during sleep
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                      Insights: Your sleep schedule has been consistent, with good amounts of REM and deep sleep.
                      Consider going to bed 15 minutes earlier to improve overall sleep duration.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Embedded SleepChart Component */}
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Detailed Sleep Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Comprehensive sleep monitoring with sleep cycles and patterns
                  </Typography>
                  {/* This would typically use imported SleepChart component with props */}
                  <Box sx={{ height: 450, bgcolor: 'background.paper', borderRadius: 4, p: 3, boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }}>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 15 }}>
                      Sleep chart visualization would be displayed here using the SleepChart component
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 3 && (
            <Grid container spacing={3}>
              {/* Activity Tab Navigation */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: alpha(theme.palette.success.main, 0.9),
                    borderRadius: 3,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mb: 2,
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsRunIcon />
                    <Typography variant="h6" fontWeight="bold">Activity Tracking</Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 0.5, md: 2 },
                      flexWrap: 'wrap'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" color="white" fontWeight="medium">
                        Monday, March 4, 2024
                      </Typography>
                      
                      <IconButton 
                        size="small" 
                        sx={{ color: 'white', opacity: 0.8, ml: 0.5 }}
                      >
                        <CalendarTodayIcon fontSize="small" />
                      </IconButton>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
                        >
                          <TrendingDownIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
                        >
                          <TrendingUpIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormControl 
                        size="small" 
                        sx={{ 
                          minWidth: 120, 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                          '& .MuiSelect-select': { color: 'white' },
                          '& .MuiSvgIcon-root': { color: 'white' }
                        }}
                      >
                        <InputLabel>Period</InputLabel>
                        <Select
                          value="day"
                          label="Period"
                        >
                          <MenuItem value="day">Day</MenuItem>
                          <MenuItem value="week">Week</MenuItem>
                          <MenuItem value="month">Month</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Tooltip title="Refresh Data">
                        <IconButton size="small" sx={{ color: 'white' }}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Data Source Settings">
                        <IconButton size="small" sx={{ color: 'white' }}>
                          <DevicesIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              {/* Activity Balance Card */}
              <Grid item xs={12} md={6}>
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
                        <DirectionsRunIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Activity Balance</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ height: 300, position: 'relative' }}>
                      <Radar 
                        data={activityBalanceData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            r: {
                              beginAtZero: true,
                              max: 100,
                              ticks: {
                                display: false
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 20,
                                usePointStyle: true,
                                boxWidth: 8
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Your activity balance shows good cardiovascular fitness and recovery,
                        with opportunities to improve flexibility and balance training
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        Activity Recommendations
                      </Typography>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          borderRadius: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                          <FitnessCenterIcon fontSize="small" color="success" />
                          <Typography variant="body2" fontWeight="medium">Focus Areas This Week</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            size="small" 
                            label="Flexibility" 
                            sx={{ bgcolor: alpha('#ff9800', 0.2), color: '#ff9800' }} 
                          />
                          <Chip 
                            size="small" 
                            label="Balance" 
                            sx={{ bgcolor: alpha('#ff9800', 0.2), color: '#ff9800' }} 
                          />
                          <Chip 
                            size="small" 
                            label="Cardiovascular" 
                            sx={{ bgcolor: alpha('#4caf50', 0.2), color: '#4caf50' }} 
                          />
                        </Box>
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Activity Metrics Card */}
              <Grid item xs={12} md={6}>
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
                      background: 'linear-gradient(90deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.03) 100%)',
                      borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), color: theme.palette.info.main }}>
                        <FitnessCenterIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Fitness Metrics</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold" color="success.main">8,742</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Daily Steps
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold" color="warning.main">2,450</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Calories
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold" color="info.main">52</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active Min
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                      Weekly Activity Trends
                    </Typography>
                    
                    <Box sx={{ height: 220 }}>
                      <Line 
                        data={{
                          labels: weekDays,
                          datasets: [
                            {
                              label: 'Steps',
                              data: [7582, 9433, 8156, 11045, 7125, 9876, 8742],
                              borderColor: theme.palette.success.main,
                              tension: 0.4,
                              yAxisID: 'y'
                            },
                            {
                              label: 'Active Minutes',
                              data: [38, 62, 45, 75, 36, 65, 52],
                              borderColor: theme.palette.info.main,
                              tension: 0.4,
                              yAxisID: 'y1'
                            }
                          ]
                        }} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                usePointStyle: true,
                                boxWidth: 6
                              }
                            }
                          },
                          scales: {
                            y: {
                              type: 'linear',
                              display: true,
                              position: 'left',
                              min: 0,
                              max: 15000,
                              title: {
                                display: true,
                                text: 'Steps'
                              },
                              grid: {
                                display: false
                              }
                            },
                            y1: {
                              type: 'linear',
                              display: true,
                              position: 'right',
                              min: 0,
                              max: 100,
                              title: {
                                display: true,
                                text: 'Minutes'
                              },
                              grid: {
                                display: false
                              }
                            },
                            x: {
                              grid: {
                                display: false
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        Progress to Weekly Goals
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Steps Goal (70,000)</Typography>
                        <Typography variant="body2" fontWeight="bold">61,959 / 70,000</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={88} 
                        sx={{ 
                          height: 6, 
                          mt: 0.5, 
                          mb: 1,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: theme.palette.success.main
                          }
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Active Minutes (300)</Typography>
                        <Typography variant="body2" fontWeight="bold">373 / 300</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        sx={{ 
                          height: 6, 
                          mt: 0.5,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: theme.palette.info.main
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Embedded ActivityChart Component */}
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Detailed Activity Tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Complete activity metrics with steps, calories, and active minutes
                  </Typography>
                  {/* This would typically use imported ActivityChart component with props */}
                  <Box sx={{ height: 450, bgcolor: 'background.paper', borderRadius: 4, p: 3, boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }}>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 15 }}>
                      Activity chart visualization would be displayed here using the ActivityChart component
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 4 && (
            <Grid container spacing={3}>
              {/* Lifestyle Patterns Card */}
              <Grid item xs={12}>
                <Card 
                  elevation={2}
                  sx={{ 
                    borderRadius: 4, 
                    overflow: 'hidden',
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
                        <PsychologyIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">Lifestyle Patterns</Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Sleep-Activity Correlation
                        </Typography>
                        <Box sx={{ height: 200, bgcolor: 'background.paper', borderRadius: 2, p: 2, mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 6 }}>
                            Correlation chart would be displayed here
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          There's a positive correlation between your sleep quality and next-day activity levels.
                          On days following 7+ hours of sleep, your step count increases by an average of 1,520 steps.
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Heart Rate vs. Stress
                        </Typography>
                        <Box sx={{ height: 200, bgcolor: 'background.paper', borderRadius: 2, p: 2, mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 6 }}>
                            Heart rate variability chart would be displayed here
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Your heart rate variability decreases on days with reported high stress levels.
                          Morning HRV is a good predictor of your stress resilience throughout the day.
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Recovery Needs
                        </Typography>
                        <Box sx={{ height: 200, bgcolor: 'background.paper', borderRadius: 2, p: 2, mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 6 }}>
                            Recovery visualization would be displayed here
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Your body shows optimal recovery when you maintain a 2:1 ratio of active to rest days.
                          Consider adding dedicated recovery days after intense training sessions.
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Weekly Pattern Analysis
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <BedtimeIcon sx={{ color: '#673ab7', mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">Sleep Regularity</Typography>
                        </Box>
                        <Paper
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: alpha('#673ab7', 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Your sleep schedule is most consistent Sunday through Thursday (±15 min),
                            with later bedtimes on Friday and Saturday (±1.5 hours).
                            This pattern is healthy as long as you maintain consistent wake times.
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <RestaurantIcon sx={{ color: '#e91e63', mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">Nutrition Impact</Typography>
                        </Box>
                        <Paper
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: alpha('#e91e63', 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Days with logged meals containing 25g+ protein show 22% better recovery metrics.
                            Late-night eating (after 8pm) correlates with lower sleep quality scores.
                            Consider earlier dinner times for improved sleep.
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <SpaIcon sx={{ color: '#4caf50', mr: 1 }} />
                          <Typography variant="body2" fontWeight="medium">Lifestyle Recommendations</Typography>
                        </Box>
                        <Paper
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: alpha('#4caf50', 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body2" gutterBottom>
                            Based on your patterns, here are personalized recommendations:
                          </Typography>
                          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                            <Typography component="li" variant="body2" color="text.secondary">
                              Maintain your consistent weekday sleep schedule
                            </Typography>
                            <Typography component="li" variant="body2" color="text.secondary">
                              Add 5-10 minute meditation before bed to improve deep sleep
                            </Typography>
                            <Typography component="li" variant="body2" color="text.secondary">
                              Schedule high-intensity workouts in the morning for better sleep
                            </Typography>
                            <Typography component="li" variant="body2" color="text.secondary">
                              Add one additional recovery day per week to improve overall fitness gains
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default TrendsTab;
