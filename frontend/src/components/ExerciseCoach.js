import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid, Card, CardContent, Avatar, Chip, Tabs, Tab, Alert } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ExerciseModelScene from './3d/ExerciseModelScene';
import FormAnalyzer from './3d/FormAnalyzer';

// Helper function to get exercise tips
const getExerciseTips = (exercise) => {
  switch(exercise) {
    case 'squat':
      return 'Keep weight in your heels and chest up. Go as low as you can while maintaining form. Track knees over toes.';
    case 'pushup':
      return 'Maintain a straight line from head to heels. Lower until chest nearly touches ground. Keep elbows at 45° angle.';
    case 'plank':
      return "Engage your core and glutes. Keep body in straight line. Don't let hips sag or pike up. Focus on breathing.";
    case 'lunge':
      return 'Step forward with knee tracking over ankle. Keep chest up and core engaged. Push through heel to return.';
    case 'burpee':
      return 'Start in standing position, drop to squat, kick back to plank, do a push-up, jump feet forward, then explode up.';
    default:
      return 'Select an exercise to see proper form instructions.';
  }
};

const ExerciseCoach = () => {
  const [activeExercise, setActiveExercise] = useState('squat');
  const [activeTab, setActiveTab] = useState(0);
  const [showModelError, setShowModelError] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [workoutActive, setWorkoutActive] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [exerciseMetrics, setExerciseMetrics] = useState({
    formScore: 85,
    intensity: 'Medium',
    duration: 0,
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'core']
  });

  // Start workout timer
  const [elapsedTime, setElapsedTime] = useState(0);
  
  React.useEffect(() => {
    let timer;
    if (workoutActive) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        // Simulate calorie burn (approximately 8-10 calories per minute for moderate exercise)
        if (elapsedTime % 6 === 0) { // Update every 6 seconds
          setCaloriesBurned(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [workoutActive, elapsedTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExerciseClick = (exercise) => {
    setActiveExercise(exercise);
    
    // Update metrics based on exercise type
    const exerciseData = {
      squat: {
        muscleGroups: ['quads', 'glutes', 'hamstrings', 'core'],
        intensity: 'Medium',
        caloriesPerRep: 0.5
      },
      pushup: {
        muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
        intensity: 'Medium-High',
        caloriesPerRep: 0.6
      },
      plank: {
        muscleGroups: ['core', 'shoulders', 'back'],
        intensity: 'Medium',
        caloriesPerRep: 0.3
      },
      lunge: {
        muscleGroups: ['quads', 'glutes', 'hamstrings'],
        intensity: 'Medium',
        caloriesPerRep: 0.5
      },
      burpee: {
        muscleGroups: ['full body', 'cardio'],
        intensity: 'High',
        caloriesPerRep: 0.8
      }
    };
    
    setExerciseMetrics({
      ...exerciseMetrics,
      muscleGroups: exerciseData[exercise].muscleGroups,
      intensity: exerciseData[exercise].intensity
    });
    
    // Reset rep counter when changing exercises
    setRepCount(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStartWorkout = () => {
    setWorkoutActive(true);
    setCurrentWorkout('HIIT Cardio Challenge');
    setElapsedTime(0);
    setCaloriesBurned(0);
  };

  const handleStopWorkout = () => {
    setWorkoutActive(false);
    // Simulate workout summary
    alert(`Workout complete!\nTotal time: ${formatTime(elapsedTime)}\nCalories burned: ${caloriesBurned}\nGreat job!`);
  };

  const handleViewWorkouts = (trainerName) => {
    // Simulate trainer workout selection
    setCurrentWorkout(`${trainerName}'s Signature Workout`);
    setWorkoutActive(true);
    setElapsedTime(0);
    setCaloriesBurned(0);
  };

  const handleCategoryClick = (category) => {
    // Set exercise based on category
    switch(category) {
      case 'HIIT':
        setActiveExercise('burpee');
        break;
      case 'Strength':
        setActiveExercise('pushup');
        break;
      case 'Cardio':
        setActiveExercise('lunge');
        break;
      case 'Flexibility':
        setActiveExercise('squat');
        break;
      default:
        setActiveExercise('squat');
    }
    
    // Simulate category exploration
    setCurrentWorkout(`${category} Training Session`);
    setWorkoutActive(true);
    setElapsedTime(0);
    setCaloriesBurned(0);
  };
  
  // Handle 3D model animation events
  const handleModelAnimationComplete = () => {
    // Increment rep counter
    setRepCount(prev => prev + 1);
    
    // Simulate calorie burn based on exercise type
    const caloriesPerRep = {
      squat: 0.5,
      pushup: 0.6,
      plank: 0.3,
      lunge: 0.5,
      burpee: 0.8
    };
    
    setCaloriesBurned(prev => 
      prev + (caloriesPerRep[activeExercise] || 0.5)
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
        Exercise Coach
      </Typography>
      
      {/* Workout status panel - shows when a workout is active */}
      {workoutActive && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f44336, #ff9800)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="overline" fontWeight="bold">
              WORKOUT IN PROGRESS
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {currentWorkout}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold">
                  {formatTime(elapsedTime)}
                </Typography>
                <Typography variant="body2">Elapsed Time</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold">
                  {repCount}
                </Typography>
                <Typography variant="body2">Total Reps</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold">
                  {caloriesBurned}
                </Typography>
                <Typography variant="body2">Calories Burned</Typography>
              </Box>
            </Box>
            
            <Button 
              variant="contained" 
              size="large"
              color="secondary"
              onClick={handleStopWorkout}
              sx={{ 
                bgcolor: 'rgba(0,0,0,0.3)', 
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.5)'
                }
              }}
            >
              End Workout
            </Button>
          </Box>
        </Paper>
      )}

      {/* Featured workout section */}
      {!workoutActive && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2, #64b5f6)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="overline" fontWeight="bold">
              Today's Recommended Workout
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              HIIT Cardio Challenge
            </Typography>
            <Typography variant="body1" paragraph>
              An intense 30-minute workout designed to boost your cardiovascular fitness and burn calories efficiently.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip icon={<AccessTimeIcon />} label="30 min" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <Chip icon={<LocalFireDepartmentIcon />} label="350 cal" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <Chip label="Intermediate" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </Box>
            
            <Button 
              variant="contained" 
              size="large"
              startIcon={<DirectionsRunIcon />}
              onClick={handleStartWorkout}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                backdropFilter: 'blur(4px)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Start Workout
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Enhanced Exercise Coach Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Exercise Form Trainer
        </Typography>
        
        {showModelError && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setShowModelError(false)}>
            There was an issue loading the 3D model. Using simplified visualization instead.
          </Alert>
        )}
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="3D Visualization" />
          <Tab label="Form Analysis" />
        </Tabs>
        
        {activeTab === 0 ? (
          <>
            <ExerciseModelScene 
              exerciseType={activeExercise} 
              height={400}
              showControls={true}
              paused={!workoutActive}
              onLoadComplete={() => console.log("Model loaded")}
              onRepComplete={handleModelAnimationComplete}
            />
            
            {/* Exercise metrics panel */}
            {workoutActive && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: 'rgba(0,0,0,0.05)', 
                borderRadius: 2,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box sx={{ flex: '1 1 200px', mb: { xs: 2, md: 0 } }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Active Muscles
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {exerciseMetrics.muscleGroups.map(muscle => (
                      <Chip 
                        key={muscle} 
                        label={muscle} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'white',
                          textTransform: 'capitalize' 
                        }} 
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  flex: '1 1 300px',
                  justifyContent: { xs: 'flex-start', md: 'flex-end' } 
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {exerciseMetrics.formScore}%
                    </Typography>
                    <Typography variant="caption">Form Score</Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {exerciseMetrics.intensity}
                    </Typography>
                    <Typography variant="caption">Intensity</Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {repCount}
                    </Typography>
                    <Typography variant="caption">Reps</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <>
            <FormAnalyzer 
              exerciseType={activeExercise} 
              height={400}
              showCamera={true}
              onFormAnalysis={(analysis) => {
                console.log("Form analysis:", analysis);
                
                // Update metrics based on analysis
                if (analysis && analysis.score) {
                  setExerciseMetrics(prev => ({
                    ...prev,
                    formScore: analysis.score
                  }));
                }
                
                // If we get a rep count from the form analyzer
                if (analysis && analysis.repCount > repCount) {
                  setRepCount(analysis.repCount);
                  
                  // Add calories for the new rep
                  const caloriesPerRep = {
                    squat: 0.5,
                    pushup: 0.6,
                    plank: 0.3,
                    lunge: 0.5,
                    burpee: 0.8
                  };
                  
                  setCaloriesBurned(prev => 
                    prev + (caloriesPerRep[activeExercise] || 0.5)
                  );
                }
              }}
            />
            
            {/* Exercise tip panel */}
            {workoutActive && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Coach Tips:
                </Typography>
                <Typography variant="body2">
                  {getExerciseTips(activeExercise)}
                </Typography>
              </Box>
            )}
          </>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto', pb: 1, justifyContent: 'center' }}>
          {['squat', 'pushup', 'plank', 'lunge', 'burpee'].map((exercise) => (
            <Button 
              key={exercise}
              variant="outlined"
              color={activeExercise === exercise ? "primary" : "inherit"}
              onClick={() => handleExerciseClick(exercise)}
            >
              {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
            </Button>
          ))}
        </Box>
      </Paper>
      
      {/* Workout categories */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Workout Categories
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { name: 'HIIT', icon: <DirectionsRunIcon />, description: 'High intensity interval training', color: '#f44336' },
          { name: 'Strength', icon: <FitnessCenterIcon />, description: 'Build muscle and strength', color: '#ff9800' },
          { name: 'Cardio', icon: <DirectionsRunIcon />, description: 'Elevate your heart rate', color: '#2196f3' },
          { name: 'Flexibility', icon: <FitnessCenterIcon />, description: 'Improve range of motion', color: '#4caf50' }
        ].map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                borderRadius: 2, 
                transition: 'transform 0.3s', 
                '&:hover': { transform: 'translateY(-5px)' },
                cursor: 'pointer'
              }}
              onClick={() => handleCategoryClick(category.name)}
            >
              <CardContent>
                <Avatar sx={{ bgcolor: category.color, mb: 2 }}>
                  {category.icon}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Featured trainers */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Featured Trainers
      </Typography>
      
      <Grid container spacing={3}>
        {[
          { name: 'Alex Thompson', specialty: 'HIIT & Strength', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
          { name: 'Sarah Johnson', specialty: 'Yoga & Flexibility', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
          { name: 'Michael Lee', specialty: 'Cardio & Endurance', avatar: 'https://randomuser.me/api/portraits/men/64.jpg' },
          { name: 'Emma Roberts', specialty: 'Strength & Core', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' }
        ].map((trainer, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar src={trainer.avatar} sx={{ width: 80, height: 80, mb: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  {trainer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trainer.specialty}
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  startIcon={<FitnessCenterIcon />}
                  onClick={() => handleViewWorkouts(trainer.name)}
                >
                  View Workouts
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ExerciseCoach;