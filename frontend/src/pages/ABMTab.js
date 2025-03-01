import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button,
  Paper,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TimelineIcon from '@mui/icons-material/Timeline';
import Person3DIcon from '@mui/icons-material/PersonOutline'; // Substitute for Person3D
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import SpaIcon from '@mui/icons-material/Spa';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import RepeatIcon from '@mui/icons-material/Repeat';
import { Canvas, useThree, extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useAuth } from '../context/AuthContext';
import { BodyModel } from '../components/3d/BodyModel';
import { FoodDatabase } from '../data/FoodDatabase.mock';
import { ExerciseDatabase } from '../data/ExerciseDatabase.mock';

// Extend Three.js with our controls
extend({ OrbitControls: ThreeOrbitControls });

// Orbit Controls Component 
function Controls(props) {
  const { camera, gl } = useThree();
  const ref = useRef();
  
  useFrame(() => {
    if (ref.current) {
      ref.current.update();
    }
  });
  
  return (
    <orbitControls
      ref={ref}
      target={[0, 1, 0]}
      enableDamping
      dampingFactor={0.05}
      args={[camera, gl.domElement]}
      {...props}
    />
  );
}

// TabPanel component for tab content
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`abm-tabpanel-${index}`}
      aria-labelledby={`abm-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Stats component displaying current body metrics
const BodyStats = ({ stats, progress }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
    }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon color="primary" />
          Body Metrics
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(stats).map(([key, value]) => (
            <Grid item xs={6} md={4} key={key}>
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {typeof value === 'number' ? value.toFixed(1) : value}
                    {key.includes('Weight') ? ' kg' : key.includes('Percentage') ? '%' : ''}
                  </Typography>
                </Box>
                {key in progress && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <Slider
                        size="small"
                        value={value}
                        min={progress[key].min}
                        max={progress[key].max}
                        step={0.1}
                        disabled
                        sx={{ 
                          '& .MuiSlider-thumb': { display: 'none' },
                          '& .MuiSlider-track': { 
                            backgroundColor: progress[key].color || theme.palette.primary.main,
                            borderColor: progress[key].color || theme.palette.primary.main 
                          }
                        }}
                      />
                    </Box>
                    <Tooltip title={progress[key].trending > 0 ? "Improving" : progress[key].trending < 0 ? "Declining" : "Stable"}>
                      {progress[key].trending > 0 ? (
                        <ArrowUpwardIcon fontSize="small" color="success" />
                      ) : progress[key].trending < 0 ? (
                        <ArrowDownwardIcon fontSize="small" color="error" />
                      ) : (
                        <span>—</span>
                      )}
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Food log item component
const FoodLogItem = ({ food, onDelete }) => {
  const theme = useTheme();
  
  return (
    <Paper sx={{ p: 1.5, mb: 1, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalDiningIcon color={food.healthScore >= 70 ? "success" : food.healthScore >= 40 ? "warning" : "error"} />
          <Box>
            <Typography variant="subtitle2">{food.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {food.calories} kcal • Protein: {food.protein}g • Fat: {food.fat}g • Carbs: {food.carbs}g
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip 
            size="small" 
            label={`Score: ${food.healthScore}`} 
            sx={{ 
              mr: 1,
              bgcolor: food.healthScore >= 70 
                ? alpha(theme.palette.success.main, 0.1) 
                : food.healthScore >= 40 
                  ? alpha(theme.palette.warning.main, 0.1) 
                  : alpha(theme.palette.error.main, 0.1),
              color: food.healthScore >= 70 
                ? theme.palette.success.main 
                : food.healthScore >= 40 
                  ? theme.palette.warning.main 
                  : theme.palette.error.main,
            }} 
          />
          <IconButton size="small" onClick={() => onDelete(food.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

// Exercise log item component
const ExerciseLogItem = ({ exercise, onDelete }) => {
  return (
    <Paper sx={{ p: 1.5, mb: 1, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FitnessCenterIcon color="primary" />
          <Box>
            <Typography variant="subtitle2">{exercise.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Duration: {exercise.duration} min • Intensity: {exercise.intensity} • Calories: {exercise.caloriesBurned} kcal
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip 
            size="small" 
            label={exercise.targetMuscleGroups.join(', ')}
            color="primary"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <IconButton size="small" onClick={() => onDelete(exercise.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

// Food search and add component
const FoodAddSection = ({ onAddFood }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Search from food database
    const results = FoodDatabase.filter(food => 
      food.name.toLowerCase().includes(term)
    ).slice(0, 6);
    
    setSearchResults(results);
  };
  
  const handleAddFood = (food) => {
    onAddFood({
      ...food,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    setSearchTerm('');
    setSearchResults([]);
  };
  
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Add Food
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Search for food"
          value={searchTerm}
          onChange={handleSearch}
          variant="outlined"
          sx={{ mb: 1 }}
        />
        
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Paper elevation={3} sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
                <List disablePadding>
                  {searchResults.map((food) => (
                    <ListItem 
                      key={food.id} 
                      button 
                      dense
                      onClick={() => handleAddFood(food)}
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocalDiningIcon 
                          fontSize="small" 
                          color={food.healthScore >= 70 ? "success" : food.healthScore >= 40 ? "warning" : "error"} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={food.name} 
                        secondary={`${food.calories} kcal • Health Score: ${food.healthScore}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Popular Foods
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {FoodDatabase.slice(0, 6).map((food) => (
            <Chip
              key={food.id}
              label={food.name}
              onClick={() => handleAddFood(food)}
              color={food.healthScore >= 70 ? "success" : food.healthScore >= 40 ? "warning" : "error"}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Exercise add section
const ExerciseAddSection = ({ onAddExercise }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [muscleFilter, setMuscleFilter] = useState('all');
  
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.length < 2 && muscleFilter === 'all') {
      setSearchResults([]);
      return;
    }
    
    // Filter exercises based on search term and muscle filter
    let results = ExerciseDatabase;
    
    if (term.length >= 2) {
      results = results.filter(exercise => 
        exercise.name.toLowerCase().includes(term)
      );
    }
    
    if (muscleFilter !== 'all') {
      results = results.filter(exercise => 
        exercise.targetMuscleGroups.includes(muscleFilter)
      );
    }
    
    setSearchResults(results.slice(0, 6));
  };
  
  const handleAddExercise = (exercise) => {
    onAddExercise({
      ...exercise,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    setSearchTerm('');
    setSearchResults([]);
  };
  
  const handleMuscleFilterChange = (event) => {
    setMuscleFilter(event.target.value);
    handleSearch({ target: { value: searchTerm } });
  };
  
  const muscleGroups = [
    'all',
    'arms',
    'chest',
    'back',
    'shoulders',
    'legs',
    'core',
    'cardio'
  ];
  
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Add Exercise
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          label="Search for exercise"
          value={searchTerm}
          onChange={handleSearch}
          variant="outlined"
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Muscle Group</InputLabel>
          <Select
            value={muscleFilter}
            label="Muscle Group"
            onChange={handleMuscleFilterChange}
          >
            {muscleGroups.map(group => (
              <MenuItem key={group} value={group}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Paper elevation={3} sx={{ p: 1, maxHeight: 300, overflow: 'auto', mb: 2 }}>
              <List disablePadding>
                {searchResults.map((exercise) => (
                  <ListItem 
                    key={exercise.id} 
                    button 
                    dense
                    onClick={() => handleAddExercise(exercise)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FitnessCenterIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={exercise.name} 
                      secondary={`Targets: ${exercise.targetMuscleGroups.join(', ')}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Recommended Exercises
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {ExerciseDatabase.slice(0, 6).map((exercise) => (
            <Chip
              key={exercise.id}
              label={exercise.name}
              onClick={() => handleAddExercise(exercise)}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// Main ABM Tab component
const ABMTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [foodLog, setFoodLog] = useState([]);
  const [exerciseLog, setExerciseLog] = useState([]);
  const [stats, setStats] = useState({
    bodyWeight: 70.0,
    bodyFatPercentage: 20.0,
    muscleMass: 30.0,
    bmi: 23.5,
    metabolicRate: 1800,
    hydrationLevel: 65
  });
  const [progress, setProgress] = useState({
    bodyWeight: { min: 50, max: 100, trending: 0, color: theme.palette.info.main },
    bodyFatPercentage: { min: 5, max: 35, trending: -1, color: theme.palette.success.main },
    muscleMass: { min: 20, max: 45, trending: 1, color: theme.palette.primary.main },
    bmi: { min: 18.5, max: 30, trending: 0, color: theme.palette.info.main },
    metabolicRate: { min: 1200, max: 2500, trending: 1, color: theme.palette.primary.main },
    hydrationLevel: { min: 50, max: 100, trending: 0, color: theme.palette.info.main }
  });
  const [bodyModelState, setBodyModelState] = useState({
    weight: 0.5, // 0 to 1, where 0 is skinny, 0.5 is normal, 1 is overweight
    muscle: 0.5, // 0 to 1, where 0 is minimal muscle, 1 is maximum muscle
    shoulders: 0.5,
    chest: 0.5,
    arms: 0.5,
    back: 0.5,
    core: 0.5,
    legs: 0.5
  });
  const [showSkeleton, setShowSkeleton] = useState(false);
  const canvasRef = useRef();
  
  useEffect(() => {
    // Simulated loading time for 3D model
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Update body model state based on food and exercise logs
    if (foodLog.length > 0 || exerciseLog.length > 0) {
      updateBodyModel();
    }
  }, [foodLog, exerciseLog]);
  
  const updateBodyModel = () => {
    // Calculate effects of food and exercise on body model
    let weightChange = 0;
    let muscleChange = 0;
    const muscleGroupChanges = {
      shoulders: 0,
      chest: 0,
      arms: 0,
      back: 0,
      core: 0,
      legs: 0
    };
    
    // Process food effects
    foodLog.forEach(food => {
      // Higher health score means better food
      const healthFactor = (food.healthScore - 50) / 100; // -0.5 to 0.5
      
      // Bad food increases weight
      if (healthFactor < 0) {
        weightChange += Math.abs(healthFactor) * 0.02;
      }
      
      // Good food helps with muscle building
      if (healthFactor > 0 && food.protein > 20) {
        muscleChange += healthFactor * 0.01;
      }
      
      // Update body stats
      const newStats = { ...stats };
      newStats.bodyWeight += (food.calories / 7000); // Rough estimation: 7000 calories = 1kg
      newStats.metabolicRate += food.protein * 0.2; // Protein increases metabolic rate
      
      if (food.healthScore < 50) {
        newStats.bodyFatPercentage += 0.02;
      }
      
      if (food.healthScore > 70 && food.protein > 20) {
        newStats.muscleMass += 0.03;
      }
      
      newStats.bmi = newStats.bodyWeight / ((1.75 * 1.75)); // Assuming height of 1.75m
      newStats.hydrationLevel = Math.min(100, newStats.hydrationLevel + (food.healthScore > 70 ? 1 : -0.5));
      
      setStats(newStats);
      
      // Update progress trends
      const newProgress = { ...progress };
      newProgress.bodyWeight.trending = food.healthScore < 50 ? 1 : -1;
      newProgress.bodyFatPercentage.trending = food.healthScore < 50 ? 1 : -1;
      newProgress.muscleMass.trending = food.healthScore > 70 && food.protein > 20 ? 1 : 0;
      newProgress.metabolicRate.trending = food.protein > 20 ? 1 : 0;
      newProgress.hydrationLevel.trending = food.healthScore > 70 ? 1 : -1;
      
      setProgress(newProgress);
    });
    
    // Process exercise effects
    exerciseLog.forEach(exercise => {
      // Exercise decreases weight and increases muscle
      weightChange -= 0.01 * exercise.intensity;
      muscleChange += 0.015 * exercise.intensity;
      
      // Target specific muscle groups
      exercise.targetMuscleGroups.forEach(group => {
        if (muscleGroupChanges[group] !== undefined) {
          muscleGroupChanges[group] += 0.025 * exercise.intensity;
        }
      });
      
      // Update body stats
      const newStats = { ...stats };
      newStats.bodyWeight -= (exercise.caloriesBurned / 7000);
      newStats.bodyFatPercentage -= 0.03 * exercise.intensity;
      newStats.muscleMass += 0.04 * exercise.intensity;
      newStats.metabolicRate += 10 * exercise.intensity;
      newStats.bmi = newStats.bodyWeight / ((1.75 * 1.75)); // Assuming height of 1.75m
      
      setStats(newStats);
      
      // Update progress trends
      const newProgress = { ...progress };
      newProgress.bodyWeight.trending = -1;
      newProgress.bodyFatPercentage.trending = -1;
      newProgress.muscleMass.trending = 1;
      newProgress.metabolicRate.trending = 1;
      
      setProgress(newProgress);
    });
    
    // Update the body model state
    setBodyModelState(prev => {
      const newState = { ...prev };
      
      // Update overall body properties
      newState.weight = Math.max(0, Math.min(1, prev.weight + weightChange));
      newState.muscle = Math.max(0, Math.min(1, prev.muscle + muscleChange));
      
      // Update specific muscle groups
      Object.keys(muscleGroupChanges).forEach(group => {
        if (newState[group] !== undefined) {
          newState[group] = Math.max(0, Math.min(1, prev[group] + muscleGroupChanges[group]));
        }
      });
      
      return newState;
    });
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAddFood = (food) => {
    setFoodLog(prev => [food, ...prev]);
  };
  
  const handleDeleteFood = (id) => {
    setFoodLog(prev => prev.filter(food => food.id !== id));
  };
  
  const handleAddExercise = (exercise) => {
    setExerciseLog(prev => [exercise, ...prev]);
  };
  
  const handleDeleteExercise = (id) => {
    setExerciseLog(prev => prev.filter(exercise => exercise.id !== id));
  };
  
  const handleResetModel = () => {
    setBodyModelState({
      weight: 0.5,
      muscle: 0.5,
      shoulders: 0.5,
      chest: 0.5,
      arms: 0.5,
      back: 0.5,
      core: 0.5,
      legs: 0.5
    });
    
    setStats({
      bodyWeight: 70.0,
      bodyFatPercentage: 20.0,
      muscleMass: 30.0,
      bmi: 23.5,
      metabolicRate: 1800,
      hydrationLevel: 65
    });
    
    setProgress({
      bodyWeight: { min: 50, max: 100, trending: 0, color: theme.palette.info.main },
      bodyFatPercentage: { min: 5, max: 35, trending: 0, color: theme.palette.info.main },
      muscleMass: { min: 20, max: 45, trending: 0, color: theme.palette.info.main },
      bmi: { min: 18.5, max: 30, trending: 0, color: theme.palette.info.main },
      metabolicRate: { min: 1200, max: 2500, trending: 0, color: theme.palette.info.main },
      hydrationLevel: { min: 50, max: 100, trending: 0, color: theme.palette.info.main }
    });
  };
  
  const toggleSkeleton = () => {
    setShowSkeleton(prev => !prev);
  };
  
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
            <Typography variant="h5" color="primary" gutterBottom>
              <Person3DIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Adaptive Body Model
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Please connect your Fitbit account to use the Adaptive Body Model feature.
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
            background: 'linear-gradient(135deg, #5e35b1, #9c27b0)', 
            py: 2.5, 
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              <Person3DIcon sx={{ filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))' }} /> 
              Adaptive Body Model
            </Typography>
              
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                variant="contained" 
                startIcon={<RepeatIcon />}
                onClick={handleResetModel}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Reset Model
              </Button>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={showSkeleton} 
                    onChange={toggleSkeleton} 
                    sx={{ 
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#fff'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  />
                }
                label="Show Skeleton"
                sx={{ color: 'white' }}
              />
            </Box>
          </Box>
          
          <CardContent sx={{ p: 0 }}>
            <Grid container>
              <Grid item xs={12} md={6} sx={{ minHeight: 500 }}>
                {loading ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%', 
                    minHeight: 500,
                    flexDirection: 'column'
                  }}>
                    <CircularProgress size={60} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading 3D Model...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ height: 500 }} ref={canvasRef}>
                    <Canvas
                      camera={{ position: [0, 1.5, 4.5], fov: 50 }}
                      style={{ background: 'linear-gradient(to bottom, #f1f5f9, #e2e8f0)' }}
                    >
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 10]} intensity={1} />
                      <pointLight position={[-10, -10, -10]} intensity={0.5} />
                      
                      <BodyModel 
                        state={bodyModelState} 
                        showSkeleton={showSkeleton}
                      />
                      
                      <Controls 
                        enablePan={false} 
                        enableZoom={true} 
                        minDistance={2}
                        maxDistance={8}
                      />
                    </Canvas>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3 }}>
                  <BodyStats stats={stats} progress={progress} />
                  
                  <Box sx={{ mt: 3 }}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      variant="fullWidth"
                      textColor="primary"
                      indicatorColor="primary"
                      aria-label="abm tabs"
                    >
                      <Tab 
                        icon={<RestaurantIcon />} 
                        label="Nutrition" 
                        id="abm-tab-0"
                        aria-controls="abm-tabpanel-0"
                      />
                      <Tab 
                        icon={<FitnessCenterIcon />} 
                        label="Exercise" 
                        id="abm-tab-1"
                        aria-controls="abm-tabpanel-1"
                      />
                    </Tabs>
                  
                    <TabPanel value={tabValue} index={0}>
                      <FoodAddSection onAddFood={handleAddFood} />
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Food Log
                      </Typography>
                      
                      {foodLog.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.primary.light, 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Add food items to see how they affect your body model
                          </Typography>
                        </Paper>
                      ) : (
                        <Box sx={{ maxHeight: 200, overflow: 'auto', pr: 1 }}>
                          {foodLog.map(food => (
                            <FoodLogItem 
                              key={food.id} 
                              food={food} 
                              onDelete={handleDeleteFood}
                            />
                          ))}
                        </Box>
                      )}
                    </TabPanel>
                    
                    <TabPanel value={tabValue} index={1}>
                      <ExerciseAddSection onAddExercise={handleAddExercise} />
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Exercise Log
                      </Typography>
                      
                      {exerciseLog.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.primary.light, 0.1),
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Add exercises to see how they affect your body model
                          </Typography>
                        </Paper>
                      ) : (
                        <Box sx={{ maxHeight: 200, overflow: 'auto', pr: 1 }}>
                          {exerciseLog.map(exercise => (
                            <ExerciseLogItem 
                              key={exercise.id} 
                              exercise={exercise} 
                              onDelete={handleDeleteExercise}
                            />
                          ))}
                        </Box>
                      )}
                    </TabPanel>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            About Adaptive Body Model
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The Adaptive Body Model (ABM) visualizes how your diet and exercise habits affect your body composition over time. 
            Add food items and exercises to see real-time changes to your virtual body model.
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <RestaurantIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Nutrition Impact
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Healthy foods with high protein support muscle growth, while processed foods high in fat and sugar contribute to fat gain.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <FitnessCenterIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Targeted Exercise
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Different exercises target specific muscle groups, helping you visualize which areas of your body are developing.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Progress Tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track changes in body metrics like weight, body fat percentage, and muscle mass as you maintain your habits.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ABMTab;