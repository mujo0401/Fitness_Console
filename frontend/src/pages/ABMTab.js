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
  FormControlLabel,
  Radio,
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  Drawer,
  Stack
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TimelineIcon from '@mui/icons-material/Timeline';
import Person3DIcon from '@mui/icons-material/PersonOutline'; // Substitute for Person3D
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import SpaIcon from '@mui/icons-material/Spa';
import SettingsIcon from '@mui/icons-material/Settings';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import RepeatIcon from '@mui/icons-material/Repeat';
import WomanIcon from '@mui/icons-material/Woman';
import ManIcon from '@mui/icons-material/Man';
import View3dIcon from '@mui/icons-material/ViewInAr';
import ViewSideIcon from '@mui/icons-material/ViewSidebar';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Canvas, useThree, extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useAuth } from '../context/AuthContext';
import { BodyModel } from '../components/3d/BodyModel';
import { BodySVG } from '../components/2d/BodySVG';
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

// Advanced body metrics display component
const AdvancedBodyStats = ({ stats, progress, onCustomize }) => {
  const theme = useTheme();
  const [expandedMetric, setExpandedMetric] = useState(null);
  
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedMetric(isExpanded ? panel : null);
  };
  
  // Additional metrics with more detailed information
  const detailedMetrics = {
    bodyWeight: {
      description: "Your total body weight includes muscle, fat, bones, and water.",
      recommendations: [
        "Healthy weight loss should target 0.5-1kg per week",
        "Focus on body composition rather than just weight"
      ],
      normalRange: "BMI between 18.5-24.9 is considered healthy",
      unit: "kg"
    },
    bodyFatPercentage: {
      description: "The percentage of your total body weight that is fat.",
      recommendations: [
        "Men: 10-20% is athletic/fit",
        "Women: 18-28% is athletic/fit"
      ],
      normalRange: "Essential fat: 3-5% for men, 10-13% for women",
      unit: "%"
    },
    muscleMass: {
      description: "The amount of skeletal muscle in your body.",
      recommendations: [
        "Increase protein intake to support muscle growth",
        "Progressive resistance training is key to building muscle"
      ],
      normalRange: "Average muscle mass: 30-40% for men, 25-35% for women",
      unit: "kg"
    },
    bmi: {
      description: "Body Mass Index is a measure of body fat based on height and weight.",
      recommendations: [
        "BMI has limitations and doesn't account for muscle mass",
        "Use in conjunction with other metrics for better assessment"
      ],
      normalRange: "18.5-24.9 is considered normal range",
      unit: ""
    },
    metabolicRate: {
      description: "The number of calories your body burns at rest to maintain vital functions.",
      recommendations: [
        "Building muscle increases metabolic rate",
        "Avoid extreme calorie restriction which can lower metabolic rate"
      ],
      normalRange: "1400-2000 for women, 1600-2400 for men (varies widely)",
      unit: "kcal/day"
    },
    hydrationLevel: {
      description: "The amount of water in your body tissues.",
      recommendations: [
        "Aim for 8 glasses (2 liters) of water daily",
        "Monitor urine color as an indicator of hydration"
      ],
      normalRange: "60-65% of total body weight",
      unit: "%"
    }
  };
  
  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon color="primary" />
            Body Metrics
          </Typography>
          
          <Button 
            startIcon={<SettingsIcon />} 
            size="small" 
            variant="outlined"
            onClick={onCustomize}
          >
            Customize
          </Button>
        </Box>
        
        {Object.entries(stats).map(([key, value]) => (
          <Accordion 
            key={key} 
            expanded={expandedMetric === key}
            onChange={handleAccordionChange(key)}
            disableGutters
            elevation={0}
            sx={{ 
              mb: 1, 
              backgroundColor: 'transparent',
              '&:before': { display: 'none' },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              '&.Mui-expanded': {
                margin: 0,
                mb: 1,
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                px: 2, 
                py: 0.5,
                minHeight: 48,
                backgroundColor: alpha(theme.palette.primary.light, 0.05) 
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
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
            </AccordionSummary>
            {detailedMetrics[key] && (
              <AccordionDetails sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1 }}>
                  {detailedMetrics[key].description}
                </Typography>
                
                <Typography variant="caption" fontWeight="bold" display="block" color="text.secondary">
                  Recommendations:
                </Typography>
                <List dense disablePadding sx={{ mb: 1 }}>
                  {detailedMetrics[key].recommendations.map((rec, i) => (
                    <ListItem key={i} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <ArrowRightIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={rec} primaryTypographyProps={{ variant: 'caption' }} />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="caption" color="text.secondary">
                  <strong>Normal range:</strong> {detailedMetrics[key].normalRange}
                </Typography>
              </AccordionDetails>
            )}
          </Accordion>
        ))}
      </CardContent>
    </Card>
  );
};

// Enhanced body model customizer component
const BodyModelCustomizer = ({ modelState, onUpdateModelState }) => {
  const theme = useTheme();
  
  const handleSliderChange = (key) => (event, newValue) => {
    onUpdateModelState({ ...modelState, [key]: newValue });
  };
  
  const muscleGroups = [
    { key: 'muscle', label: 'Overall Muscle', icon: <FitnessCenterIcon /> },
    { key: 'weight', label: 'Body Fat', icon: <FastfoodIcon /> },
    { key: 'shoulders', label: 'Shoulders', icon: null },
    { key: 'chest', label: 'Chest', icon: null },
    { key: 'arms', label: 'Arms', icon: null },
    { key: 'back', label: 'Back', icon: null },
    { key: 'core', label: 'Core', icon: null },
    { key: 'legs', label: 'Legs', icon: null },
  ];
  
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Body Model Customizer
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          {muscleGroups.map((group) => (
            <Box key={group.key} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography id={`${group.key}-slider-label`} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {group.icon && <Box component="span" sx={{ display: 'inline-flex', mr: 0.5 }}>{group.icon}</Box>}
                  {group.label}
                </Typography>
                <Typography variant="body2">
                  {(modelState[group.key] * 100).toFixed(0)}%
                </Typography>
              </Box>
              <Slider
                value={modelState[group.key]}
                onChange={handleSliderChange(group.key)}
                aria-labelledby={`${group.key}-slider-label`}
                step={0.01}
                min={0}
                max={1}
                sx={{
                  color: group.key === 'weight' 
                    ? theme.palette.warning.main 
                    : theme.palette.primary.main
                }}
              />
            </Box>
          ))}
        </Box>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<RepeatIcon />}
          onClick={() => onUpdateModelState({
            weight: 0.5,
            muscle: 0.5,
            shoulders: 0.5,
            chest: 0.5,
            arms: 0.5,
            back: 0.5,
            core: 0.5,
            legs: 0.5
          })}
        >
          Reset to Default
        </Button>
      </CardContent>
    </Card>
  );
};

// Main ABM Tab component
const ABMTab = () => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [foodLog, setFoodLog] = useState([]);
  const [exerciseLog, setExerciseLog] = useState([]);
  const [modelGender, setModelGender] = useState('male'); // Default to male
  const [modelType, setModelType] = useState('2d'); // '2d' or '3d'
  const [showFrontView, setShowFrontView] = useState(true); // Front or back view for 2D model
  const [showMuscleHighlight, setShowMuscleHighlight] = useState(false); // Highlight active muscles
  const [customizeDrawerOpen, setCustomizeDrawerOpen] = useState(false);
  const [activeMuscleGroups, setActiveMuscleGroups] = useState([]);
  const [bodyPresetOptions] = useState([
    { id: 'default', name: 'Default' },
    { id: 'athletic', name: 'Athletic' },
    { id: 'lean', name: 'Lean' },
    { id: 'endurance', name: 'Endurance' },
    { id: 'bodybuilder', name: 'Bodybuilder' },
    { id: 'powerlifter', name: 'Powerlifter' }
  ]);
  const [selectedPreset, setSelectedPreset] = useState('default');
  
  // Enhanced body metrics
  const [stats, setStats] = useState({
    bodyWeight: 70.0,
    bodyFatPercentage: 20.0,
    muscleMass: 30.0,
    bmi: 23.5,
    metabolicRate: 1800,
    hydrationLevel: 65,
    boneDensity: 1.2,
    viscFat: 6.5,
    protein: 150,
    restingHeartRate: 68
  });
  
  const [progress, setProgress] = useState({
    bodyWeight: { min: 50, max: 100, trending: 0, color: theme.palette.info.main },
    bodyFatPercentage: { min: 5, max: 35, trending: -1, color: theme.palette.success.main },
    muscleMass: { min: 20, max: 45, trending: 1, color: theme.palette.primary.main },
    bmi: { min: 18.5, max: 30, trending: 0, color: theme.palette.info.main },
    metabolicRate: { min: 1200, max: 2500, trending: 1, color: theme.palette.primary.main },
    hydrationLevel: { min: 50, max: 100, trending: 0, color: theme.palette.info.main },
    boneDensity: { min: 0.8, max: 1.5, trending: 1, color: theme.palette.primary.main }, 
    viscFat: { min: 1, max: 15, trending: -1, color: theme.palette.success.main },
    protein: { min: 50, max: 250, trending: 1, color: theme.palette.primary.main },
    restingHeartRate: { min: 40, max: 100, trending: -1, color: theme.palette.success.main }
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
  
  // Set gender and apply model preset if one is selected
  const applyBodyPreset = (presetId) => {
    switch(presetId) {
      case 'athletic':
        setBodyModelState({
          weight: 0.3,
          muscle: 0.7,
          shoulders: 0.65,
          chest: 0.6,
          arms: 0.65,
          back: 0.7,
          core: 0.8,
          legs: 0.7
        });
        setStats(prev => ({
          ...prev,
          bodyFatPercentage: modelGender === 'male' ? 12.0 : 18.0,
          muscleMass: modelGender === 'male' ? 40.0 : 32.0,
          metabolicRate: modelGender === 'male' ? 2100 : 1800
        }));
        break;
      case 'lean':
        setBodyModelState({
          weight: 0.2,
          muscle: 0.5,
          shoulders: 0.45,
          chest: 0.4,
          arms: 0.45,
          back: 0.45,
          core: 0.6,
          legs: 0.45
        });
        setStats(prev => ({
          ...prev,
          bodyFatPercentage: modelGender === 'male' ? 8.0 : 15.0,
          muscleMass: modelGender === 'male' ? 35.0 : 28.0,
          metabolicRate: modelGender === 'male' ? 1900 : 1650
        }));
        break;
      case 'endurance':
        setBodyModelState({
          weight: 0.25,
          muscle: 0.55,
          shoulders: 0.5,
          chest: 0.45,
          arms: 0.4,
          back: 0.55,
          core: 0.7,
          legs: 0.8
        });
        setStats(prev => ({
          ...prev,
          bodyFatPercentage: modelGender === 'male' ? 10.0 : 17.0,
          muscleMass: modelGender === 'male' ? 36.0 : 29.0,
          metabolicRate: modelGender === 'male' ? 2000 : 1750
        }));
        break;
      case 'bodybuilder':
        setBodyModelState({
          weight: 0.35,
          muscle: 0.9,
          shoulders: 0.85,
          chest: 0.9,
          arms: 0.85,
          back: 0.85,
          core: 0.75,
          legs: 0.75
        });
        setStats(prev => ({
          ...prev,
          bodyFatPercentage: modelGender === 'male' ? 8.0 : 14.0,
          muscleMass: modelGender === 'male' ? 45.0 : 35.0,
          metabolicRate: modelGender === 'male' ? 2200 : 1900
        }));
        break;
      case 'powerlifter':
        setBodyModelState({
          weight: 0.6,
          muscle: 0.85,
          shoulders: 0.8,
          chest: 0.85,
          arms: 0.75,
          back: 0.9,
          core: 0.8,
          legs: 0.9
        });
        setStats(prev => ({
          ...prev,
          bodyFatPercentage: modelGender === 'male' ? 16.0 : 22.0,
          muscleMass: modelGender === 'male' ? 42.0 : 34.0,
          metabolicRate: modelGender === 'male' ? 2300 : 1950
        }));
        break;
      default: // default
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
        setStats(prev => ({
          ...prev,
          bodyFatPercentage: modelGender === 'male' ? 20.0 : 25.0,
          muscleMass: modelGender === 'male' ? 30.0 : 25.0,
          metabolicRate: modelGender === 'male' ? 1800 : 1600
        }));
        break;
    }
  };
  
  // Set gender based on user profile if available
  useEffect(() => {
    if (user && user.gender) {
      // Fitbit gender field is usually 'MALE' or 'FEMALE'
      const gender = user.gender.toLowerCase();
      if (gender === 'female') {
        setModelGender('female');
        // Adjust default stats for female
        setStats(prev => ({
          ...prev,
          bodyWeight: 60.0,
          bodyFatPercentage: 25.0,
          muscleMass: 25.0,
          metabolicRate: 1600,
          boneDensity: 1.1,
          viscFat: 5.0,
          protein: 120,
          restingHeartRate: 72
        }));
      } else {
        setModelGender('male');
      }
      console.log(`Set model gender to: ${gender} based on user profile`);
    } else {
      console.log('No gender in profile, using default male model');
    }
  }, [user]);
  
  // Loading simulation and exercise tracking
  useEffect(() => {
    // Simulated loading time for model
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update active muscle groups based on exercise log
  useEffect(() => {
    if (exerciseLog.length > 0) {
      // Extract all unique muscle groups targeted by exercises
      const targetedGroups = [...new Set(
        exerciseLog.flatMap(exercise => exercise.targetMuscleGroups)
      )];
      
      setActiveMuscleGroups(targetedGroups);
      
      // If muscle highlighting is not already on, turn it on
      if (!showMuscleHighlight && targetedGroups.length > 0) {
        setShowMuscleHighlight(true);
      }
    } else {
      setActiveMuscleGroups([]);
      setShowMuscleHighlight(false);
    }
  }, [exerciseLog]);
  
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
        newStats.viscFat += 0.05;
      } else {
        // Healthy food improves protein intake
        newStats.protein += food.protein * 0.1;
      }
      
      if (food.healthScore > 70 && food.protein > 20) {
        newStats.muscleMass += 0.03;
        // Bone health improves with protein
        newStats.boneDensity += 0.001;
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
      newProgress.viscFat.trending = food.healthScore < 50 ? 1 : -1;
      newProgress.protein.trending = food.protein > 15 ? 1 : -1;
      
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
      newStats.restingHeartRate -= 0.1 * exercise.intensity; // Cardio improves heart efficiency
      newStats.boneDensity += 0.002 * exercise.intensity; // Weight-bearing exercise improves bone density
      
      setStats(newStats);
      
      // Update progress trends
      const newProgress = { ...progress };
      newProgress.bodyWeight.trending = -1;
      newProgress.bodyFatPercentage.trending = -1;
      newProgress.muscleMass.trending = 1;
      newProgress.metabolicRate.trending = 1;
      newProgress.restingHeartRate.trending = -1;
      newProgress.boneDensity.trending = 1;
      
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
    applyBodyPreset('default');
  };
  
  const handleToggleView = () => {
    setShowFrontView(prev => !prev);
  };
  
  const toggleSkeleton = () => {
    setShowSkeleton(prev => !prev);
  };
  
  const toggleModelType = () => {
    setModelType(prev => (prev === '3d' ? '2d' : '3d'));
  };
  
  const handleToggleMuscleHighlight = () => {
    setShowMuscleHighlight(prev => !prev);
  };
  
  const openCustomizeDrawer = () => {
    setCustomizeDrawerOpen(true);
  };
  
  const closeCustomizeDrawer = () => {
    setCustomizeDrawerOpen(false);
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
              {/* Body Type Preset Selector */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedPreset}
                  onChange={(e) => {
                    setSelectedPreset(e.target.value);
                    applyBodyPreset(e.target.value);
                  }}
                  displayEmpty
                  variant="outlined"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.3)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255,255,255,0.5)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }}
                >
                  {bodyPresetOptions.map(option => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Gender Selector */}
              <ToggleButtonGroup
                value={modelGender}
                exclusive
                onChange={(e, value) => value && setModelGender(value)}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiToggleButton-root': {
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'white'
                    }
                  }
                }}
              >
                <ToggleButton value="male">
                  <ManIcon />
                </ToggleButton>
                <ToggleButton value="female">
                  <WomanIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              
              {/* View Controls */}
              <ToggleButtonGroup
                value={modelType}
                exclusive
                onChange={(e, value) => value && toggleModelType()}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiToggleButton-root': {
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: 'white'
                    }
                  }
                }}
              >
                <ToggleButton value="2d" title="2D View">
                  <ViewSideIcon />
                </ToggleButton>
                <ToggleButton value="3d" title="3D View">
                  <View3dIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              
              {/* Additional Controls for 2D View */}
              {modelType === '2d' && (
                <React.Fragment>
                  <IconButton
                    onClick={handleToggleView}
                    size="small"
                    title={showFrontView ? "Show Back View" : "Show Front View"}
                    sx={{ 
                      color: 'white', 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    {showFrontView ? <RotateLeftIcon /> : <RotateRightIcon />}
                  </IconButton>
                  
                  <IconButton
                    onClick={handleToggleMuscleHighlight}
                    size="small"
                    title={showMuscleHighlight ? "Hide Muscle Highlight" : "Show Muscle Highlight"}
                    sx={{ 
                      color: 'white', 
                      bgcolor: showMuscleHighlight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    <FitnessCenterIcon />
                  </IconButton>
                </React.Fragment>
              )}
              
              {/* Skeleton Toggle */}
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
                label="Skeleton"
                sx={{ color: 'white' }}
              />
              
              {/* Reset Button */}
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
                Reset
              </Button>
            </Box>
          </Box>
          
          <CardContent sx={{ p: 0 }}>
            <Grid container>
              {/* Body Model Visualization */}
              <Grid item xs={12} md={6} sx={{ minHeight: 500, position: 'relative' }}>
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
                      Loading {modelType === '3d' ? '3D' : '2D'} Model...
                    </Typography>
                  </Box>
                ) : modelType === '3d' ? (
                  // 3D Model View
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
                        gender={modelGender}
                      />
                      
                      <Controls 
                        enablePan={false} 
                        enableZoom={true} 
                        minDistance={2}
                        maxDistance={8}
                      />
                    </Canvas>
                  </Box>
                ) : (
                  // 2D SVG Model View
                  <Box sx={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <BodySVG
                      state={bodyModelState}
                      showSkeleton={showSkeleton}
                      gender={modelGender}
                      height={480}
                      showMuscleHighlight={showMuscleHighlight}
                      activeGroups={activeMuscleGroups}
                      frontView={showFrontView}
                    />
                  </Box>
                )}
                
                {/* Floating muscle info button */}
                {modelType === '2d' && showMuscleHighlight && activeMuscleGroups.length > 0 && (
                  <Tooltip
                    title={
                      <Typography variant="body2">
                        Currently training: {activeMuscleGroups.map(group => 
                          group.charAt(0).toUpperCase() + group.slice(1)
                        ).join(', ')}
                      </Typography>
                    }
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        bgcolor: alpha(theme.palette.primary.main, 0.9),
                        color: 'white',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        cursor: 'help'
                      }}
                    >
                      <InfoIcon />
                    </Box>
                  </Tooltip>
                )}
              </Grid>
              
              {/* Body Stats and Input Controls */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3 }}>
                  <AdvancedBodyStats 
                    stats={stats} 
                    progress={progress} 
                    onCustomize={openCustomizeDrawer}
                  />
                  
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
                      <Tab 
                        icon={<LocalGroceryStoreIcon />} 
                        label="Shop" 
                        id="abm-tab-2"
                        aria-controls="abm-tabpanel-2"
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
                    
                    {/* New Shopping Tab for food integration */}
                    <TabPanel value={tabValue} index={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        Health-Optimized Shopping Recommendations
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Based on your current body metrics and goals, we recommend the following food items:
                      </Typography>
                      
                      <List>
                        {stats.bodyFatPercentage > 25 ? (
                          <ListItem>
                            <ListItemIcon>
                              <LocalDiningIcon color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Lean Protein Options"
                              secondary="Chicken breast, fish, tofu, low-fat yogurt"
                            />
                            <Button size="small" variant="outlined" startIcon={<LocalGroceryStoreIcon />}>
                              Shop
                            </Button>
                          </ListItem>
                        ) : null}
                        
                        {stats.muscleMass < 30 ? (
                          <ListItem>
                            <ListItemIcon>
                              <FitnessCenterIcon color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Muscle Building Foods"
                              secondary="Protein powder, eggs, salmon, quinoa"
                            />
                            <Button size="small" variant="outlined" startIcon={<LocalGroceryStoreIcon />}>
                              Shop
                            </Button>
                          </ListItem>
                        ) : null}
                        
                        {stats.hydrationLevel < 60 ? (
                          <ListItem>
                            <ListItemIcon>
                              <SpaIcon color="info" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Hydration Boosters"
                              secondary="Coconut water, watermelon, cucumber, electrolyte drinks"
                            />
                            <Button size="small" variant="outlined" startIcon={<LocalGroceryStoreIcon />}>
                              Shop
                            </Button>
                          </ListItem>
                        ) : null}
                        
                        <ListItem>
                          <ListItemIcon>
                            <BarChartIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="General Health Optimizers"
                            secondary="Leafy greens, berries, nuts, seeds, olive oil"
                          />
                          <Button size="small" variant="outlined" startIcon={<LocalGroceryStoreIcon />}>
                            Shop
                          </Button>
                        </ListItem>
                      </List>
                      
                      <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.08), borderRadius: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Integration with grocery delivery:
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<LocalGroceryStoreIcon />}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          DoorDash
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="primary"
                          startIcon={<LocalGroceryStoreIcon />}
                          sx={{ mr: 1, mb: 1 }}
                        >
                          Instacart
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="primary"
                          startIcon={<LocalGroceryStoreIcon />}
                          sx={{ mb: 1 }}
                        >
                          Amazon Fresh
                        </Button>
                      </Box>
                    </TabPanel>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Body model customizer side drawer */}
        <Drawer
          anchor="right"
          open={customizeDrawerOpen}
          onClose={closeCustomizeDrawer}
          sx={{
            '& .MuiDrawer-paper': {
              width: {
                xs: '100%',
                sm: 400
              },
              p: 2
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Customize Your Model
            </Typography>
            <IconButton onClick={closeCustomizeDrawer}>
              <DeleteIcon />
            </IconButton>
          </Box>
          
          <BodyModelCustomizer
            modelState={bodyModelState}
            onUpdateModelState={setBodyModelState}
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Presets
            </Typography>
            
            <Grid container spacing={1}>
              {bodyPresetOptions.map(preset => (
                <Grid item xs={6} key={preset.id}>
                  <Button
                    fullWidth
                    variant={selectedPreset === preset.id ? "contained" : "outlined"}
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      applyBodyPreset(preset.id);
                    }}
                    sx={{ mb: 1 }}
                  >
                    {preset.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Drawer>
        
        {/* About section */}
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
                <LocalGroceryStoreIcon color="primary" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Smart Shopping
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Get personalized food recommendations based on your fitness goals and easily order through grocery delivery services.
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