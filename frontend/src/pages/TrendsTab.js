import React from 'react';
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
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import { useAuth } from '../context/AuthContext';

const TrendsTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  // Require authentication for trends tab

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h5" color="#ff9800" gutterBottom>
              <AutoGraphIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Advanced Health Trends & Insights
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Please connect your Fitbit account to view advanced health trends and insights.
            </Typography>
          </Paper>
        </Box>
      </motion.div>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ 
          borderRadius: 4, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          mb: 3
        }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #ff9800, #ff5722)', 
            py: 2.5, 
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <AutoGraphIcon sx={{ color: 'white', fontSize: 28 }} />
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              Advanced Health Trends & Insights
            </Typography>
          </Box>
          
          <CardContent>
            <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AutoGraphIcon fontSize="small" /> Health Score Breakdown
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
                        <CircularProgress
                          variant="determinate"
                          value={78}
                          size={100}
                          thickness={6}
                          sx={{ color: '#4caf50', boxShadow: '0 0 20px rgba(76, 175, 80, 0.2)' }}
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
                        }}>
                          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                            78
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">Overall Health Score</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Based on sleep, activity, heart health & recovery metrics
                        </Typography>
                        <Chip 
                          label="Good" 
                          size="small" 
                          sx={{ mt: 1, bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', fontWeight: 'medium' }} 
                        />
                      </Box>
                    </Box>
                    <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                      3-Month Trend: <span style={{ color: '#4caf50' }}>↑ 6 points</span>
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Your health score has improved from 72 to 78 over the past 3 months, primarily due to improved sleep consistency and increased activity levels.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ p: 2, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                      Component Scores
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Sleep Quality</Typography>
                        <Typography variant="body2" fontWeight="medium">82/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={82} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#673ab7', 0.2),
                          '& .MuiLinearProgress-bar': { bgcolor: '#673ab7' }
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Activity Level</Typography>
                        <Typography variant="body2" fontWeight="medium">75/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={75} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#4caf50', 0.2),
                          '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' }
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Heart Health</Typography>
                        <Typography variant="body2" fontWeight="medium">70/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={70} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#f44336', 0.2),
                          '& .MuiLinearProgress-bar': { bgcolor: '#f44336' }
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Recovery Rate</Typography>
                        <Typography variant="body2" fontWeight="medium">85/100</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={85} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#2196f3', 0.2),
                          '& .MuiLinearProgress-bar': { bgcolor: '#2196f3' }
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

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
                            Your high-intensity workouts (HR >85% max) show optimal adaptations when followed by an active recovery day rather than complete rest or another high-intensity session.
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