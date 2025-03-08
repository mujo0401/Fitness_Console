import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Divider,
  useTheme, 
  alpha,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WeekendIcon from '@mui/icons-material/Weekend';
import WorkIcon from '@mui/icons-material/Work';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import MoreTimeIcon from '@mui/icons-material/MoreTime';

/**
 * ActivityInsights component that provides AI-driven insights about activity patterns
 * 
 * @param {Object} props
 * @param {Array} props.data - Activity data array
 * @param {string} props.period - Current time period (day, week, month)
 * @param {Object} props.previousData - Previous period data for comparison
 */
const ActivityInsights = ({ 
  data = [], 
  period = 'day',
  previousData = []
}) => {
  const theme = useTheme();
  
  // Process data to extract patterns and insights
  const insights = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        trends: [],
        patterns: [],
        recommendations: []
      };
    }
    
    // Calculate average metrics
    const calculateAverage = (dataArray, metric) => {
      const validPoints = dataArray.filter(item => item[metric] !== undefined && item[metric] !== null);
      if (validPoints.length === 0) return 0;
      return validPoints.reduce((sum, item) => sum + item[metric], 0) / validPoints.length;
    };
    
    // Current period averages
    const avgSteps = calculateAverage(data, 'steps');
    const avgActiveMinutes = calculateAverage(data, 'activeMinutes');
    const avgCalories = calculateAverage(data, 'calories');
    const avgDistance = calculateAverage(data, 'distance');
    
    // Previous period averages (if available)
    const prevAvgSteps = calculateAverage(previousData, 'steps');
    const prevAvgActiveMinutes = calculateAverage(previousData, 'activeMinutes');
    const prevAvgCalories = calculateAverage(previousData, 'calories');
    const prevAvgDistance = calculateAverage(previousData, 'distance');
    
    // Calculate percent changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return 100; // If previous was 0, consider it 100% increase
      return ((current - previous) / previous) * 100;
    };
    
    const stepsChange = calculateChange(avgSteps, prevAvgSteps);
    const activeMinutesChange = calculateChange(avgActiveMinutes, prevAvgActiveMinutes);
    const caloriesChange = calculateChange(avgCalories, prevAvgCalories);
    const distanceChange = calculateChange(avgDistance, prevAvgDistance);
    
    // Determine activity level
    let activityLevel = 'Low';
    if (avgSteps >= 10000 || avgActiveMinutes >= 60) {
      activityLevel = 'High';
    } else if (avgSteps >= 7500 || avgActiveMinutes >= 30) {
      activityLevel = 'Moderate';
    }
    
    // Analyze time of day patterns (for day period)
    let timeOfDayPattern = '';
    if (period === 'day' && data.length > 0) {
      const morningSteps = data
        .filter(item => {
          const hour = parseInt(item.time?.split(':')[0]);
          const ampm = item.time?.split(' ')[1];
          return (hour >= 5 && hour <= 11 && ampm === 'AM');
        })
        .reduce((sum, item) => sum + (item.steps || 0), 0);
        
      const afternoonSteps = data
        .filter(item => {
          const hour = parseInt(item.time?.split(':')[0]);
          const ampm = item.time?.split(' ')[1];
          return (hour >= 12 && hour <= 4 && ampm === 'PM');
        })
        .reduce((sum, item) => sum + (item.steps || 0), 0);
        
      const eveningSteps = data
        .filter(item => {
          const hour = parseInt(item.time?.split(':')[0]);
          const ampm = item.time?.split(' ')[1];
          return (hour >= 5 && hour <= 11 && ampm === 'PM');
        })
        .reduce((sum, item) => sum + (item.steps || 0), 0);
      
      // Determine when most activity happens
      const maxSteps = Math.max(morningSteps, afternoonSteps, eveningSteps);
      if (maxSteps === morningSteps) {
        timeOfDayPattern = 'Morning Active';
      } else if (maxSteps === afternoonSteps) {
        timeOfDayPattern = 'Afternoon Active';
      } else {
        timeOfDayPattern = 'Evening Active';
      }
    }
    
    // Analyze weekday vs weekend patterns (for week/month period)
    let weekdayPattern = '';
    if ((period === 'week' || period === 'month') && data.length > 0) {
      const weekdayData = data.filter(item => {
        const date = new Date(item.dateTime);
        const day = date.getDay();
        return day >= 1 && day <= 5; // Monday-Friday
      });
      
      const weekendData = data.filter(item => {
        const date = new Date(item.dateTime);
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
      
      const avgWeekdaySteps = calculateAverage(weekdayData, 'steps');
      const avgWeekendSteps = calculateAverage(weekendData, 'steps');
      
      if (avgWeekendSteps > avgWeekdaySteps * 1.2) {
        weekdayPattern = 'Weekend Active';
      } else if (avgWeekdaySteps > avgWeekendSteps * 1.2) {
        weekdayPattern = 'Weekday Active';
      } else {
        weekdayPattern = 'Consistent Throughout Week';
      }
    }
    
    // Generate insights
    const trends = [
      {
        title: 'Steps',
        current: Math.round(avgSteps),
        previous: Math.round(prevAvgSteps),
        change: stepsChange,
        changeType: stepsChange > 5 ? 'increase' : stepsChange < -5 ? 'decrease' : 'stable',
        icon: <DirectionsRunIcon />
      },
      {
        title: 'Active Minutes',
        current: Math.round(avgActiveMinutes),
        previous: Math.round(prevAvgActiveMinutes),
        change: activeMinutesChange,
        changeType: activeMinutesChange > 5 ? 'increase' : activeMinutesChange < -5 ? 'decrease' : 'stable',
        icon: <AccessTimeIcon />
      },
      {
        title: 'Calories',
        current: Math.round(avgCalories),
        previous: Math.round(prevAvgCalories),
        change: caloriesChange,
        changeType: caloriesChange > 5 ? 'increase' : caloriesChange < -5 ? 'decrease' : 'stable',
        icon: <LocalFireDepartmentIcon />
      }
    ];
    
    // Generate patterns
    const patterns = [
      {
        title: 'Activity Level',
        value: activityLevel,
        color: activityLevel === 'High' 
          ? theme.palette.success.main 
          : activityLevel === 'Moderate' 
            ? theme.palette.info.main 
            : theme.palette.warning.main,
        icon: <FitnessCenterIcon />,
        description: activityLevel === 'High' 
          ? 'Excellent activity level! Keep up the good work.' 
          : activityLevel === 'Moderate' 
            ? 'Good activity level, but could aim higher.' 
            : 'Activity level is low, try to increase daily movement.'
      }
    ];
    
    // Add time of day pattern if available
    if (timeOfDayPattern) {
      patterns.push({
        title: 'Most Active Time',
        value: timeOfDayPattern,
        color: timeOfDayPattern === 'Morning Active' 
          ? theme.palette.info.main 
          : timeOfDayPattern === 'Afternoon Active' 
            ? theme.palette.warning.main 
            : theme.palette.primary.main,
        icon: timeOfDayPattern === 'Morning Active' 
          ? <WbSunnyIcon /> 
          : timeOfDayPattern === 'Afternoon Active' 
            ? <LocalFireDepartmentIcon /> 
            : <NightsStayIcon />,
        description: `Most of your activity happens during the ${timeOfDayPattern.split(' ')[0].toLowerCase()}.`
      });
    }
    
    // Add weekday pattern if available
    if (weekdayPattern) {
      patterns.push({
        title: 'Weekly Distribution',
        value: weekdayPattern,
        color: weekdayPattern === 'Weekend Active' 
          ? theme.palette.secondary.main 
          : weekdayPattern === 'Weekday Active' 
            ? theme.palette.info.main 
            : theme.palette.success.main,
        icon: weekdayPattern === 'Weekend Active' 
          ? <WeekendIcon /> 
          : weekdayPattern === 'Weekday Active' 
            ? <WorkIcon /> 
            : <AutoAwesomeIcon />,
        description: weekdayPattern === 'Consistent Throughout Week' 
          ? 'Your activity is well-balanced throughout the week.' 
          : `You're more active during ${weekdayPattern.split(' ')[0].toLowerCase()}s.`
      });
    }
    
    // Generate personalized recommendations
    const recommendations = [];
    
    // Activity level recommendations
    if (activityLevel === 'Low') {
      recommendations.push({
        title: 'Increase Daily Steps',
        description: 'Aim to add 2,000 more steps daily. Try parking farther away or taking the stairs.',
        icon: <DirectionsRunIcon />,
        priority: 'high'
      });
    }
    
    // Consistency recommendations
    if (weekdayPattern === 'Weekend Active') {
      recommendations.push({
        title: 'Balance Weekday Activity',
        description: 'Look for ways to be more active during weekdays, such as walking meetings or active commuting.',
        icon: <WorkIcon />,
        priority: 'medium'
      });
    } else if (weekdayPattern === 'Weekday Active') {
      recommendations.push({
        title: 'Stay Active on Weekends',
        description: 'Plan active weekend activities like hiking, cycling, or family walks.',
        icon: <WeekendIcon />,
        priority: 'medium'
      });
    }
    
    // Time of day recommendations
    if (timeOfDayPattern && period === 'day') {
      if (timeOfDayPattern === 'Morning Active') {
        recommendations.push({
          title: 'Add Evening Movement',
          description: 'Try an evening walk after dinner to distribute activity throughout the day.',
          icon: <NightsStayIcon />,
          priority: 'low'
        });
      } else if (timeOfDayPattern === 'Evening Active') {
        recommendations.push({
          title: 'Morning Activity Boost',
          description: 'Start your day with a quick morning stretch or walk to energize for the day.',
          icon: <WbSunnyIcon />,
          priority: 'low'
        });
      }
    }
    
    // Goal-based recommendations
    if (avgSteps < 10000) {
      recommendations.push({
        title: 'Step Goal Strategy',
        description: 'Break down your 10,000 step goal into manageable chunks throughout the day.',
        icon: <MoreTimeIcon />,
        priority: avgSteps < 5000 ? 'high' : 'medium'
      });
    }
    
    // Health-based recommendations
    if (avgActiveMinutes < 30) {
      recommendations.push({
        title: 'Active Minutes Focus',
        description: 'Aim for at least 30 minutes of moderate activity daily for heart health.',
        icon: <HealthAndSafetyIcon />,
        priority: 'high'
      });
    }
    
    // Hydration recommendation (generic but useful)
    recommendations.push({
      title: 'Stay Hydrated',
      description: 'Remember to drink water before, during, and after activity for optimal performance.',
      icon: <WaterDropIcon />,
      priority: 'medium'
    });
    
    // Sort recommendations by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return {
      trends,
      patterns,
      recommendations: recommendations.slice(0, 3) // Limit to top 3 recommendations
    };
  }, [data, previousData, period, theme]);
  
  if (!data || data.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="text.secondary" align="center">
          No activity data available for insights
        </Typography>
      </Paper>
    );
  }
  
  // Render insights
  return (
    <Box>
      {/* Trends Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #ffffff, #f9f9f9)'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          Activity Trends
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {insights.trends.map((trend, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  elevation={1} 
                  sx={{ 
                    borderRadius: 2,
                    height: '100%',
                    bgcolor: alpha(
                      trend.changeType === 'increase' 
                        ? theme.palette.success.light 
                        : trend.changeType === 'decrease' 
                          ? theme.palette.error.light 
                          : theme.palette.grey[100],
                      0.2
                    )
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {trend.icon}
                        {trend.title}
                      </Typography>
                      
                      <Chip 
                        size="small"
                        icon={
                          trend.changeType === 'increase' 
                            ? <TrendingUpIcon /> 
                            : trend.changeType === 'decrease' 
                              ? <TrendingDownIcon /> 
                              : <TrendingFlatIcon />
                        }
                        label={`${Math.abs(Math.round(trend.change))}%`}
                        color={
                          trend.changeType === 'increase' 
                            ? 'success' 
                            : trend.changeType === 'decrease' 
                              ? 'error' 
                              : 'default'
                        }
                      />
                    </Box>
                    
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {trend.current.toLocaleString()}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      vs {trend.previous.toLocaleString()} previously
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Patterns & Recommendations Sections */}
      <Grid container spacing={3}>
        {/* Patterns */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
                height: '100%'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Activity Patterns
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {insights.patterns.map((pattern, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 2, 
                    p: 1.5, 
                    borderRadius: 2,
                    bgcolor: alpha(pattern.color, 0.1),
                    border: `1px solid ${alpha(pattern.color, 0.3)}`
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ color: pattern.color }}>
                        {pattern.icon}
                      </Box>
                      {pattern.title}
                    </Typography>
                    
                    <Chip 
                      size="small"
                      label={pattern.value}
                      sx={{ 
                        bgcolor: pattern.color,
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {pattern.description}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #e8f5e9, #f1f8e9)',
                height: '100%'
              }}
            >
              <Typography variant="h6" gutterBottom color="#2e7d32">
                Personalized Recommendations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {insights.recommendations.map((recommendation, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      mb: 1, 
                      p: 1.5, 
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: recommendation.priority === 'high' 
                          ? theme.palette.error.main 
                          : recommendation.priority === 'medium' 
                            ? theme.palette.warning.main 
                            : theme.palette.success.main
                      }}
                    >
                      {recommendation.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {recommendation.title}
                          {recommendation.priority === 'high' && (
                            <Chip 
                              label="Priority" 
                              size="small" 
                              color="error" 
                              variant="outlined" 
                              sx={{ height: 20, fontSize: '0.6rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={recommendation.description}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontSize: '0.7rem', textAlign: 'center' }}>
                Recommendations based on your activity patterns and health guidelines
              </Typography>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivityInsights;