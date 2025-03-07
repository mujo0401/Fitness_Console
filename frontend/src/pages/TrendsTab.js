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
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default TrendsTab;
