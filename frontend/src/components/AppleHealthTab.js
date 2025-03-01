import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Button, Card, CardContent, Grid, Tabs, Tab, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import apiServices from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const AppleHealthTab = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [heartRateData, setHeartRateData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tabValue, setTabValue] = useState(0);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch heart rate data
  const fetchHeartRateData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiServices.appleFitness.getHeartRateData(selectedPeriod, selectedDate);
      setHeartRateData(response.heart_rate);
    } catch (err) {
      console.error('Error fetching heart rate data:', err);
      setError('Failed to load heart rate data. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedDate]);

  // Fetch activity data
  const fetchActivityData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiServices.appleFitness.getActivityData(selectedPeriod, selectedDate);
      setActivityData(response.activity);
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setError('Failed to load activity data. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedDate]);

  // Fetch workout data
  const fetchWorkoutData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiServices.appleFitness.getWorkoutData(selectedPeriod, selectedDate);
      setWorkoutData(response.workouts);
    } catch (err) {
      console.error('Error fetching workout data:', err);
      setError('Failed to load workout data. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedDate]);

  // Load data based on selected tab
  useEffect(() => {
    if (tabValue === 0) {
      fetchHeartRateData();
    } else if (tabValue === 1) {
      fetchActivityData();
    } else if (tabValue === 2) {
      fetchWorkoutData();
    }
  }, [tabValue, fetchHeartRateData, fetchActivityData, fetchWorkoutData]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Handle date change
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  // Prepare heart rate chart data
  const prepareHeartRateChartData = () => {
    if (!heartRateData) return null;

    // For daily view with hourly data points
    if (selectedPeriod === 'day') {
      return {
        labels: heartRateData.map(entry => entry.time),
        datasets: [
          {
            label: 'Average Heart Rate',
            data: heartRateData.map(entry => entry.avg),
            borderColor: theme.palette.primary.main,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Min Heart Rate',
            data: heartRateData.map(entry => entry.min),
            borderColor: theme.palette.success.main,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Max Heart Rate',
            data: heartRateData.map(entry => entry.max),
            borderColor: theme.palette.error.main,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            fill: false,
            tension: 0.1
          }
        ]
      };
    } 
    // For week/month view with daily data points
    else {
      return {
        labels: heartRateData.map(entry => formatDate(entry.date)),
        datasets: [
          {
            label: 'Resting Heart Rate',
            data: heartRateData.map(entry => entry.restingHeartRate),
            borderColor: theme.palette.primary.main,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Min Heart Rate',
            data: heartRateData.map(entry => entry.min),
            borderColor: theme.palette.success.main,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Max Heart Rate',
            data: heartRateData.map(entry => entry.max),
            borderColor: theme.palette.error.main,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            fill: false,
            tension: 0.1
          }
        ]
      };
    }
  };

  // Prepare activity chart data
  const prepareActivityChartData = () => {
    if (!activityData) return null;

    // For daily view with hourly data points
    if (selectedPeriod === 'day') {
      return {
        labels: activityData.map(entry => entry.time),
        datasets: [
          {
            label: 'Steps',
            data: activityData.map(entry => entry.steps),
            borderColor: theme.palette.primary.main,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            tension: 0.1,
            yAxisID: 'y'
          },
          {
            label: 'Calories',
            data: activityData.map(entry => entry.calories),
            borderColor: theme.palette.secondary.main,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            fill: false,
            tension: 0.1,
            yAxisID: 'y1'
          }
        ]
      };
    } 
    // For week/month view with daily data points
    else {
      return {
        labels: activityData.map(entry => formatDate(entry.dateTime)),
        datasets: [
          {
            label: 'Steps',
            data: activityData.map(entry => entry.steps),
            borderColor: theme.palette.primary.main,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            tension: 0.1,
            yAxisID: 'y'
          },
          {
            label: 'Active Minutes',
            data: activityData.map(entry => entry.activeMinutes),
            borderColor: theme.palette.success.main,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            fill: false,
            tension: 0.1,
            yAxisID: 'y1'
          }
        ]
      };
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: tabValue === 0 ? 'Heart Rate' : 'Activity',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: tabValue === 0 ? 'BPM' : 'Steps',
        },
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: tabValue === 0 ? '' : 'Calories/Minutes',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Render heart rate tab content
  const renderHeartRateContent = () => {
    if (loading) {
      return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (!heartRateData || heartRateData.length === 0) {
      return <Alert severity="info">No heart rate data available for the selected period.</Alert>;
    }

    const chartData = prepareHeartRateChartData();
    
    return (
      <Box>
        <Box height={300} mt={2}>
          {chartData && <Line data={chartData} options={chartOptions} />}
        </Box>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Heart Rate Summary</Typography>
          <Grid container spacing={2}>
            {selectedPeriod === 'day' ? (
              heartRateData.map((entry, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{entry.time}</Typography>
                      <Typography variant="h6" color="primary">{entry.avg} BPM</Typography>
                      <Typography variant="body2">Min: {entry.min} BPM</Typography>
                      <Typography variant="body2">Max: {entry.max} BPM</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              heartRateData.map((entry, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{formatDate(entry.date)}</Typography>
                      <Typography variant="h6" color="primary">Resting: {entry.restingHeartRate} BPM</Typography>
                      <Typography variant="body2">Range: {entry.min}-{entry.max} BPM</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Box>
    );
  };

  // Render activity tab content
  const renderActivityContent = () => {
    if (loading) {
      return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (!activityData || activityData.length === 0) {
      return <Alert severity="info">No activity data available for the selected period.</Alert>;
    }

    const chartData = prepareActivityChartData();
    
    return (
      <Box>
        <Box height={300} mt={2}>
          {chartData && <Line data={chartData} options={chartOptions} />}
        </Box>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Activity Summary</Typography>
          <Grid container spacing={2}>
            {selectedPeriod === 'day' ? (
              activityData.map((entry, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{entry.time}</Typography>
                      <Typography variant="h6" color="primary">{entry.steps} steps</Typography>
                      <Typography variant="body2">Calories: {entry.calories}</Typography>
                      <Typography variant="body2">Distance: {entry.distance} km</Typography>
                      {entry.floors > 0 && <Typography variant="body2">Floors: {entry.floors}</Typography>}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              activityData.map((entry, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{formatDate(entry.dateTime)}</Typography>
                      <Typography variant="h6" color="primary">{entry.steps} steps</Typography>
                      <Typography variant="body2">Active Minutes: {entry.activeMinutes}</Typography>
                      <Typography variant="body2">Distance: {entry.distance} km</Typography>
                      <Typography variant="body2">Calories: {entry.calories}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Box>
    );
  };

  // Render workouts tab content
  const renderWorkoutsContent = () => {
    if (loading) {
      return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (!workoutData || workoutData.length === 0) {
      return <Alert severity="info">No workout data available for the selected period.</Alert>;
    }
    
    return (
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>Workouts</Typography>
        <Grid container spacing={2}>
          {workoutData.map((workout, index) => (
            <Grid item xs={12} sm={6} md={4} key={workout.id || index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1">{workout.type}</Typography>
                  <Typography variant="subtitle2">{formatDate(workout.date)} - {workout.time}</Typography>
                  <Box mt={1}>
                    <Typography variant="body1">Duration: {workout.durationDisplay}</Typography>
                    <Typography variant="body1">Calories: {workout.calories}</Typography>
                    {workout.distance && (
                      <Typography variant="body1">
                        Distance: {workout.distance} {workout.distanceUnit}
                      </Typography>
                    )}
                    {workout.heartRate && (
                      <Typography variant="body1">
                        Heart Rate: {workout.heartRate.avg} BPM (max: {workout.heartRate.max} BPM)
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Apple Health Data</Typography>
      
      <Box mb={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="subtitle1">Period:</Typography>
          </Grid>
          <Grid item>
            <Button 
              variant={selectedPeriod === 'day' ? 'contained' : 'outlined'} 
              size="small"
              onClick={() => handlePeriodChange('day')}
              sx={{ mr: 1 }}
            >
              Day
            </Button>
            <Button 
              variant={selectedPeriod === 'week' ? 'contained' : 'outlined'} 
              size="small"
              onClick={() => handlePeriodChange('week')}
              sx={{ mr: 1 }}
            >
              Week
            </Button>
            <Button 
              variant={selectedPeriod === 'month' ? 'contained' : 'outlined'} 
              size="small"
              onClick={() => handlePeriodChange('month')}
            >
              Month
            </Button>
          </Grid>
          <Grid item ml="auto">
            <input 
              type="date" 
              value={selectedDate}
              onChange={handleDateChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="health data tabs">
          <Tab label="Heart Rate" />
          <Tab label="Activity" />
          <Tab label="Workouts" />
        </Tabs>
      </Box>
      
      <Box mt={2}>
        {tabValue === 0 && renderHeartRateContent()}
        {tabValue === 1 && renderActivityContent()}
        {tabValue === 2 && renderWorkoutsContent()}
      </Box>
    </Box>
  );
};

export default AppleHealthTab;