import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  IconButton,
  Divider,
  Chip,
  useTheme,
  alpha,
  Collapse,
  LinearProgress,
  Tooltip,
  Avatar,
  Container
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/system';
import InfoIcon from '@mui/icons-material/Info';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SportsIcon from '@mui/icons-material/Sports';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ChatIcon from '@mui/icons-material/Chat';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import DevicesIcon from '@mui/icons-material/Devices';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// Styled components for visual effects
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.25)',
    transform: 'translateY(-3px)'
  }
}));

const GradientBorder = styled(Box)(({ theme, color }) => ({
  position: 'relative',
  borderRadius: 16,
  padding: 2,
  background: `linear-gradient(145deg, ${color || theme.palette.primary.main}, ${alpha(color || theme.palette.primary.dark, 0.7)})`,
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 10px 25px ${alpha(color || theme.palette.primary.main, 0.2)}`
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, transparent 30%, ${alpha(color || theme.palette.primary.light, 0.3)} 45%, ${alpha(color || theme.palette.primary.light, 0.3)} 55%, transparent 70%)`,
    backgroundSize: '200% 200%',
    animation: 'shine 3s infinite ease-in-out',
    zIndex: 1
  },
  '@keyframes shine': {
    '0%': {
      backgroundPosition: '200% 0'
    },
    '100%': {
      backgroundPosition: '-200% 0'
    }
  }
}));

const FeatureCard = styled(Card)(({ theme, color }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 12,
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  boxShadow: `0 6px 12px ${alpha(color || theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 20px ${alpha(color || theme.palette.primary.main, 0.15)}`
  }
}));

const GradientText = styled(Typography)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(90deg, #3f51b5, #2196f3)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block'
}));

const AnimatedBox = styled(motion.div)({
  width: '100%'
});

const InfoTab = () => {
  const theme = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  
  // Toggle expanded section
  const toggleExpanded = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };
  
  // Tab info data
  const tabInfo = [
    {
      id: 'info',
      title: 'Information',
      icon: <InfoIcon fontSize="large" />,
      color: '#607D8B', // Blue-grey
      description: 'Welcome to Health Console. This tab provides an overview of the application features and how they integrate together.',
      details: 'The Information tab is your starting point for navigating the Health Console. It shows how all features connect together to provide a comprehensive health management system.'
    },
    {
      id: 'heart',
      title: 'Heart Rate',
      icon: <FavoriteIcon fontSize="large" />,
      color: '#F44336', // Red
      description: 'Monitor your heart rate data from Fitbit or Apple Health, including resting heart rate and heart rate zones.',
      details: 'The Heart Rate tab displays your current heart rate, resting heart rate, and heart rate history. It shows time spent in different heart rate zones and identifies trends in your cardiac health.'
    },
    {
      id: 'activity',
      title: 'Activity',
      icon: <DirectionsRunIcon fontSize="large" />,
      color: '#4CAF50', // Green
      description: 'Track your daily activity including steps, distance, calories burned, and active minutes.',
      details: 'The Activity tab visualizes your movement patterns throughout the day. It displays steps, calories, floors climbed, and active minutes with daily, weekly, and monthly trends.'
    },
    {
      id: 'sleep',
      title: 'Sleep',
      icon: <BedtimeIcon fontSize="large" />,
      color: '#673AB7', // Deep Purple
      description: 'Analyze your sleep patterns including duration, quality, and stages (deep, light, REM).',
      details: 'The Sleep tab offers insights into your sleep quality and duration. It breaks down sleep stages and provides a sleep score based on various metrics like consistency, duration, and interruptions.'
    },
    {
      id: 'abm',
      title: 'ABM',
      icon: <PersonOutlineIcon fontSize="large" />,
      color: '#9C27B0', // Purple
      description: 'Advanced Body Metrics shows detailed body composition metrics and trends over time.',
      details: 'ABM provides in-depth analysis of your body composition including muscle mass, body fat percentage, bone density, and hydration levels. It tracks changes over time and provides insights into how your body is responding to your fitness routines.'
    },
    {
      id: 'fitness',
      title: 'Fitness Plan',
      icon: <SportsIcon fontSize="large" />,
      color: '#4CAF50', // Green
      description: 'Create personalized workout plans based on your goals, fitness level, and preferences.',
      details: 'The Fitness Plan tab allows you to design custom workout routines tailored to your specific goals, whether that\'s weight loss, muscle gain, or improved cardiovascular health. You can schedule workouts, track progress, and adjust intensity.'
    },
    {
      id: 'coach',
      title: 'Exercise Coach',
      icon: <HeadsetMicIcon fontSize="large" />,
      color: '#2196F3', // Blue
      description: 'Get real-time guidance, form correction, and motivation during your workouts.',
      details: 'The Exercise Coach provides audio guidance during workouts, helps correct your form through camera feedback, and offers motivation to keep you engaged. It can adapt workouts in real-time based on your performance.'
    },
    {
      id: 'music',
      title: 'Music',
      icon: <MusicNoteIcon fontSize="large" />,
      color: '#9C27B0', // Purple
      description: 'Listen to workout-optimized music with tempo matching to your activity intensity.',
      details: 'The Music tab features tempo-matched playlists that synchronize with your workout intensity. It includes full albums from artists like Breaking Benjamin, Twenty One Pilots, and Linkin Park, and can automatically adjust music tempo based on your heart rate or workout phase.'
    },
    {
      id: 'grocery',
      title: 'Grocery Shop',
      icon: <ShoppingCartIcon fontSize="large" />,
      color: '#43A047', // Green
      description: 'Plan healthy meals and shop for ingredients with nutrition-focused recommendations.',
      details: 'The Grocery Shop helps you maintain a healthy diet by suggesting nutritious ingredients and meal plans. You can browse recipes, create shopping lists based on your dietary preferences, and even order groceries for delivery.'
    },
    {
      id: 'trends',
      title: 'Trends',
      icon: <AutoGraphIcon fontSize="large" />,
      color: '#FF9800', // Orange
      description: 'Visualize long-term health and fitness data to identify patterns and progress.',
      details: 'The Trends tab provides comprehensive analytics of your health data over time. It identifies correlations between different metrics, like how your sleep affects your workout performance, or how your diet impacts your recovery time.'
    },
    {
      id: 'assistant',
      title: 'Assistant',
      icon: <ChatIcon fontSize="large" />,
      color: '#2196F3', // Blue
      description: 'Get personalized health advice and answers to your fitness questions.',
      details: 'The Health Assistant utilizes AI to provide personalized guidance based on your data. You can ask questions about workouts, nutrition, recovery, and receive evidence-based answers tailored to your health profile.'
    }
  ];

  // Integration features data
  const integrationFeatures = [
    {
      id: 'fitness-music',
      title: 'Fitness & Music Integration',
      description: 'Workout tempo-matched music that adapts to your exercise intensity.',
      icon: <MusicNoteIcon />,
      details: 'The system automatically selects music with BPM (beats per minute) that matches your workout intensity. During HIIT sessions, faster-tempo songs play during high-intensity intervals, while recovery periods feature more moderate tempos. This creates an immersive experience where music enhances workout performance.',
      tabs: ['fitness', 'music', 'heart']
    },
    {
      id: 'sleep-fitness',
      title: 'Sleep & Recovery Optimization',
      description: 'Workout recommendations based on your sleep quality and recovery status.',
      icon: <BedtimeIcon />,
      details: 'The app analyzes your sleep patterns and recommends workout intensities based on your recovery status. After nights of poor sleep, it suggests lower-intensity workouts to prevent overtraining. This integration ensures optimal training adaptation while prioritizing recovery.',
      tabs: ['sleep', 'fitness', 'coach']
    },
    {
      id: 'nutrition-activity',
      title: 'Nutrition & Activity Balance',
      description: 'Grocery recommendations tailored to your activity levels and fitness goals.',
      icon: <ShoppingCartIcon />,
      details: 'Based on your tracked activities, the app provides nutritional recommendations to support your energy needs. It suggests higher protein foods during strength training phases and increased complex carbohydrates during endurance training periods, with grocery lists that adapt to your changing fitness routine.',
      tabs: ['activity', 'grocery', 'fitness']
    },
    {
      id: 'heart-analytics',
      title: 'Cardiac Health Trends',
      description: 'Long-term heart rate analysis for improved cardiovascular fitness.',
      icon: <FavoriteIcon />,
      details: 'The system tracks changes in your resting heart rate and heart rate recovery time to measure cardiovascular fitness improvements. Decreasing trends in these metrics indicate improved cardiac efficiency, providing objective feedback on training effectiveness.',
      tabs: ['heart', 'trends', 'fitness']
    },
    {
      id: 'coach-metrics',
      title: 'Personalized Coaching',
      description: 'AI coaching that adapts to your body metrics and progress.',
      icon: <HeadsetMicIcon />,
      details: 'The Exercise Coach uses your body composition data from the ABM tab to tailor exercise recommendations. For users with higher muscle mass, it may suggest higher weights; for those focusing on fat loss, it might emphasize metabolic conditioning with appropriate modifications.',
      tabs: ['coach', 'abm', 'trends']
    },
    {
      id: 'assistant-integration',
      title: 'Holistic Health Insights',
      description: 'AI assistant with access to all your health data for comprehensive advice.',
      icon: <ChatIcon />,
      details: 'The Health Assistant can see relationships across all your health metrics, providing insights you might miss. It can identify that poor sleep is affecting your recovery from workouts, or that certain foods consistently impact your next-day energy levels during activity.',
      tabs: ['assistant', 'trends', 'heart', 'sleep', 'activity']
    }
  ];

  // Technical features
  const technicalFeatures = [
    {
      id: 'design',
      title: 'Responsive Design',
      description: 'Optimized for all devices from mobile to desktop',
      icon: <DesignServicesIcon fontSize="large" />,
      color: '#2196F3' // Blue
    },
    {
      id: 'api',
      title: 'Advanced API Integration',
      description: 'Connects with Fitbit, Apple Health, YouTube, and more',
      icon: <IntegrationInstructionsIcon fontSize="large" />,
      color: '#FF9800' // Orange
    },
    {
      id: 'multidevice',
      title: 'Multi-device Synchronization',
      description: 'Seamless data sharing across all your devices',
      icon: <DevicesIcon fontSize="large" />,
      color: '#9C27B0' // Purple
    },
    {
      id: 'cloud',
      title: 'Cloud-based Infrastructure',
      description: 'Secure, reliable, and always up-to-date',
      icon: <CloudSyncIcon fontSize="large" />,
      color: '#03A9F4' // Light Blue
    },
    {
      id: 'privacy',
      title: 'Privacy-focused Design',
      description: 'Your health data remains secure and private',
      icon: <HealthAndSafetyIcon fontSize="large" />,
      color: '#4CAF50' // Green
    }
  ];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ p: { xs: 2, sm: 4 } }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <GlassPaper elevation={0} sx={{ mb: 5, p: 4, textAlign: 'center' }}>
            <Typography variant="h2" component="h1" sx={{ mb: 2, fontWeight: 800 }}>
              <GradientText gradient="linear-gradient(90deg, #3f51b5, #2196f3, #00bcd4)">
                Health Console
              </GradientText>
            </Typography>
            
            <Typography variant="h5" color="textSecondary" sx={{ mb: 4, maxWidth: '800px', mx: 'auto', lineHeight: 1.5 }}>
              Your comprehensive health management system, integrating fitness tracking, nutrition, sleep analysis, and personalized coaching in one unified platform.
            </Typography>
            
            <Box
              sx={{
                position: 'relative',
                height: 6,
                width: '80%',
                maxWidth: 600,
                mx: 'auto',
                mb: 4,
                background: 'linear-gradient(90deg, #3f51b5, #2196f3, #00bcd4)',
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <Box
                component={motion.div}
                animate={{
                  x: ['0%', '100%', '0%'],
                  opacity: [0.7, 0.9, 0.7]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                  filter: 'blur(4px)'
                }}
              />
            </Box>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#3f51b5', 0.1), color: '#3f51b5', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                    <DevicesIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>Unified Platform</Typography>
                  <Typography variant="body2" color="textSecondary">
                    All your health and fitness data in one place, accessible across all devices
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                    <IntegrationInstructionsIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>Smart Integration</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Features work together seamlessly to provide holistic health insights
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar sx={{ bgcolor: alpha('#00bcd4', 0.1), color: '#00bcd4', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                    <HealthAndSafetyIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>Science-backed</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Evidence-based approach to fitness, nutrition, and wellness
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </GlassPaper>
        </motion.div>
        
        {/* Main Features Section */}
        <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
          <GradientText>
            Console Features
          </GradientText>
        </Typography>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <Grid container spacing={3}>
            {tabInfo.map((tab) => (
              <Grid item xs={12} sm={6} md={4} key={tab.id} component={motion.div} variants={itemVariants}>
                <GradientBorder color={tab.color}>
                  <FeatureCard elevation={0} color={tab.color}>
                    <Box
                      sx={{
                        p: 2,
                        background: `linear-gradient(145deg, ${alpha(tab.color, 0.8)}, ${alpha(tab.color, 0.9)})`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 1 }}>
                          {tab.icon}
                        </Avatar>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                          {tab.title}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpanded(tab.id)}
                        sx={{ color: 'white' }}
                      >
                        {expandedSection === tab.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" paragraph>
                        {tab.description}
                      </Typography>
                      
                      <Collapse in={expandedSection === tab.id}>
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {tab.details}
                          </Typography>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              color: tab.color,
                              borderColor: alpha(tab.color, 0.5),
                              '&:hover': {
                                borderColor: tab.color,
                                bgcolor: alpha(tab.color, 0.05)
                              }
                            }}
                          >
                            Go to {tab.title}
                          </Button>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </FeatureCard>
                </GradientBorder>
              </Grid>
            ))}
          </Grid>
        </motion.div>
        
        {/* Integration Showcase */}
        <Typography variant="h4" component="h2" sx={{ mt: 6, mb: 4, fontWeight: 700 }}>
          <GradientText gradient="linear-gradient(90deg, #9c27b0, #673ab7)">
            Smart Integration System
          </GradientText>
        </Typography>
        
        <GlassPaper sx={{ mb: 5, p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" paragraph sx={{ fontWeight: 500 }}>
            Health Console's power comes from the seamless integration between features.
            Here's how everything works together:
          </Typography>
          
          <Grid container spacing={3}>
            {integrationFeatures.map((feature) => (
              <Grid item xs={12} md={6} key={feature.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    boxShadow: activeFeature === feature.id ? 
                      `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` : 
                      '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    transform: activeFeature === feature.id ? 'scale(1.02)' : 'scale(1)',
                    border: activeFeature === feature.id ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
                  }}
                  onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
                  raised={activeFeature === feature.id}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          mr: 2
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" component="h3">
                        {feature.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {feature.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {feature.tabs.map((tabId) => {
                        const tab = tabInfo.find(t => t.id === tabId);
                        return (
                          <Chip 
                            key={tabId}
                            label={tab.title}
                            size="small"
                            icon={React.cloneElement(tab.icon, { fontSize: 'small' })}
                            sx={{ 
                              bgcolor: alpha(tab.color, 0.1),
                              color: tab.color,
                              borderColor: alpha(tab.color, 0.3),
                              fontWeight: 500
                            }}
                            variant="outlined"
                          />
                        );
                      })}
                    </Box>
                    
                    <Collapse in={activeFeature === feature.id}>
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {feature.details}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LightbulbIcon sx={{ color: theme.palette.warning.main }} fontSize="small" />
                          <Typography variant="caption" color="textSecondary">
                            These features work together automatically without manual setup.
                          </Typography>
                        </Box>
                      </Box>
                    </Collapse>
                    
                    <Box sx={{ textAlign: 'right' }}>
                      <Button 
                        size="small"
                        endIcon={activeFeature === feature.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {activeFeature === feature.id ? 'Show Less' : 'Learn More'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </GlassPaper>
        
        {/* Technical Features */}
        <Typography variant="h4" component="h2" sx={{ mt: 6, mb: 4, fontWeight: 700 }}>
          <GradientText gradient="linear-gradient(90deg, #00bcd4, #03a9f4)">
            Technical Excellence
          </GradientText>
        </Typography>
        
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            {technicalFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={feature.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card 
                    sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                      boxShadow: `0 6px 12px ${alpha(feature.color, 0.15)}`,
                      '&:hover': {
                        boxShadow: `0 8px 24px ${alpha(feature.color, 0.25)}`,
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(feature.color, 0.1), 
                        color: feature.color,
                        width: 60,
                        height: 60,
                        mb: 2
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <GlassPaper sx={{ textAlign: 'center', p: 4, mb: 3 }}>
            <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
              <GradientText gradient="linear-gradient(90deg, #4caf50, #8bc34a)">
                Ready to Get Started?
              </GradientText>
            </Typography>
            
            <Typography variant="h6" color="textSecondary" paragraph>
              Begin your health journey by exploring the tabs above.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SportsIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
                  boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)'
                }}
              >
                Create Fitness Plan
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<FavoriteIcon />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Connect Your Devices
              </Button>
            </Box>
          </GlassPaper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default InfoTab;