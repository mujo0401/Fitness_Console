import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  useTheme,
  alpha,
  Stack,
  Alert,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SportsIcon from '@mui/icons-material/Sports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NoteIcon from '@mui/icons-material/Note';
import { useAuth } from '../context/AuthContext';
import { useWorkoutPlan } from '../context/WorkoutPlanContext';
import axios from 'axios';

// Define the questionnaire steps
const steps = [
  'Basic Information',
  'Fitness Level',
  'Goals & Preferences',
  'Limitations & Obstacles',
  'Dietary Information',
  'Additional Notes'
];

const FitnessTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { saveCustomPlan, selectPredefinedPlan, predefinedPlans } = useWorkoutPlan();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    age: '',
    gender: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    activityLevel: 'moderate',
    
    // Fitness Level
    fitnessLevel: 'beginner',
    exerciseFrequency: '1-2',
    exerciseExperience: '',
    
    // Goals & Preferences
    primaryGoal: 'weight_loss',
    secondaryGoal: 'muscle_tone',
    preferredExercises: '',
    workoutDuration: '30-45',
    workoutDaysPerWeek: 3,
    
    // Limitations & Obstacles
    injuries: '',
    medicalConditions: '',
    timeConstraints: '',
    equipmentAccess: 'limited',
    
    // Dietary Information
    dietaryRestrictions: '',
    mealPreferences: '',
    currentDiet: '',
    preferredDiet: 'balanced',
    mealsPerDay: 3,
    
    // Additional Notes
    additionalNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSliderChange = (name) => (e, newValue) => {
    setFormData({
      ...formData,
      [name]: newValue
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be a backend API endpoint
      // For demonstration, we'll simulate the API call
      console.log('Submitting form data:', formData);
      
      // Simulate API call to OpenAI with a timeout
      setTimeout(() => {
        const generatedPlan = generateMockPlan(formData);
        setPlan(generatedPlan);
        setLoading(false);
      }, 3000);
      
      /* 
      // Real implementation would be something like:
      const response = await axios.post('/api/fitness/generate-plan', formData);
      setPlan(response.data);
      */
    } catch (err) {
      console.error('Error generating fitness plan:', err);
      setError('Failed to generate your fitness plan. Please try again.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setPlan(null);
  };

  // Render form steps based on activeStep
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HealthAndSafetyIcon color="primary" /> Basic Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This information helps create a plan tailored to your specific needs.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  helperText="Your current age"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="non_binary">Non-binary</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Height (ft)"
                    name="heightFeet"
                    type="number"
                    value={formData.heightFeet}
                    onChange={handleInputChange}
                    variant="outlined"
                    required
                    inputProps={{ min: 0, max: 8 }}
                    helperText="Feet"
                  />
                  <TextField
                    fullWidth
                    label="Height (in)"
                    name="heightInches"
                    type="number"
                    value={formData.heightInches}
                    onChange={handleInputChange}
                    variant="outlined"
                    required
                    inputProps={{ min: 0, max: 11 }}
                    helperText="Inches"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (lbs)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  helperText="Your current weight in pounds"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Current Activity Level</FormLabel>
                  <RadioGroup
                    row
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="sedentary" control={<Radio />} label="Sedentary" />
                    <FormControlLabel value="light" control={<Radio />} label="Light" />
                    <FormControlLabel value="moderate" control={<Radio />} label="Moderate" />
                    <FormControlLabel value="active" control={<Radio />} label="Active" />
                    <FormControlLabel value="very_active" control={<Radio />} label="Very Active" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsRunIcon color="primary" /> Fitness Level
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Tell us about your current fitness level and exercise routine.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Current Fitness Level</FormLabel>
                  <RadioGroup
                    row
                    name="fitnessLevel"
                    value={formData.fitnessLevel}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="beginner" control={<Radio />} label="Beginner" />
                    <FormControlLabel value="intermediate" control={<Radio />} label="Intermediate" />
                    <FormControlLabel value="advanced" control={<Radio />} label="Advanced" />
                    <FormControlLabel value="athlete" control={<Radio />} label="Athlete" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Exercise Frequency</FormLabel>
                  <RadioGroup
                    row
                    name="exerciseFrequency"
                    value={formData.exerciseFrequency}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="rarely" control={<Radio />} label="Rarely" />
                    <FormControlLabel value="1-2" control={<Radio />} label="1-2 times/week" />
                    <FormControlLabel value="3-4" control={<Radio />} label="3-4 times/week" />
                    <FormControlLabel value="5+" control={<Radio />} label="5+ times/week" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Exercise Experience"
                  name="exerciseExperience"
                  value={formData.exerciseExperience}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  variant="outlined"
                  helperText="Describe your exercise background and experience"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsIcon color="primary" /> Goals & Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Let us know what you're aiming to achieve with your fitness plan.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Primary Goal</InputLabel>
                  <Select
                    name="primaryGoal"
                    value={formData.primaryGoal}
                    onChange={handleInputChange}
                    label="Primary Goal"
                  >
                    <MenuItem value="weight_loss">Weight Loss</MenuItem>
                    <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                    <MenuItem value="strength">Strength Improvement</MenuItem>
                    <MenuItem value="endurance">Endurance Building</MenuItem>
                    <MenuItem value="flexibility">Flexibility & Mobility</MenuItem>
                    <MenuItem value="overall_health">Overall Health</MenuItem>
                    <MenuItem value="athletic_performance">Athletic Performance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Secondary Goal</InputLabel>
                  <Select
                    name="secondaryGoal"
                    value={formData.secondaryGoal}
                    onChange={handleInputChange}
                    label="Secondary Goal"
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="weight_loss">Weight Loss</MenuItem>
                    <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                    <MenuItem value="muscle_tone">Muscle Toning</MenuItem>
                    <MenuItem value="strength">Strength Improvement</MenuItem>
                    <MenuItem value="endurance">Endurance Building</MenuItem>
                    <MenuItem value="flexibility">Flexibility & Mobility</MenuItem>
                    <MenuItem value="stress_reduction">Stress Reduction</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preferred Exercise Types"
                  name="preferredExercises"
                  value={formData.preferredExercises}
                  onChange={handleInputChange}
                  variant="outlined"
                  helperText="E.g., running, weightlifting, yoga, swimming, etc."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Workout Duration</InputLabel>
                  <Select
                    name="workoutDuration"
                    value={formData.workoutDuration}
                    onChange={handleInputChange}
                    label="Workout Duration"
                  >
                    <MenuItem value="15-30">15-30 minutes</MenuItem>
                    <MenuItem value="30-45">30-45 minutes</MenuItem>
                    <MenuItem value="45-60">45-60 minutes</MenuItem>
                    <MenuItem value="60+">60+ minutes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ width: '100%' }}>
                  <Typography gutterBottom>Preferred Workout Days Per Week</Typography>
                  <Slider
                    value={formData.workoutDaysPerWeek}
                    onChange={handleSliderChange('workoutDaysPerWeek')}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={7}
                    sx={{ color: theme.palette.primary.main }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsIcon color="primary" /> Limitations & Obstacles
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Help us understand any challenges or limitations you may face.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Injuries or Physical Limitations"
                  name="injuries"
                  value={formData.injuries}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  helperText="Any injuries or physical conditions we should be aware of"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical Conditions"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  helperText="Any medical conditions that may affect your fitness plan"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Time Constraints"
                  name="timeConstraints"
                  value={formData.timeConstraints}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  helperText="Describe any limitations on your available time for exercise"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Equipment Access</InputLabel>
                  <Select
                    name="equipmentAccess"
                    value={formData.equipmentAccess}
                    onChange={handleInputChange}
                    label="Equipment Access"
                  >
                    <MenuItem value="none">No equipment (bodyweight only)</MenuItem>
                    <MenuItem value="limited">Limited home equipment</MenuItem>
                    <MenuItem value="home_gym">Home gym</MenuItem>
                    <MenuItem value="gym_membership">Full gym membership</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestaurantIcon color="primary" /> Dietary Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Tell us about your dietary preferences and habits for a personalized meal plan.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dietary Restrictions"
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  helperText="E.g., vegetarian, vegan, gluten-free, allergies, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meal Preferences"
                  name="mealPreferences"
                  value={formData.mealPreferences}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  helperText="Foods you particularly enjoy or dislike"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Diet Description"
                  name="currentDiet"
                  value={formData.currentDiet}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                  helperText="Briefly describe your current eating habits"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Diet Type</InputLabel>
                  <Select
                    name="preferredDiet"
                    value={formData.preferredDiet}
                    onChange={handleInputChange}
                    label="Preferred Diet Type"
                  >
                    <MenuItem value="balanced">Balanced</MenuItem>
                    <MenuItem value="low_carb">Low Carb</MenuItem>
                    <MenuItem value="high_protein">High Protein</MenuItem>
                    <MenuItem value="keto">Ketogenic</MenuItem>
                    <MenuItem value="paleo">Paleo</MenuItem>
                    <MenuItem value="mediterranean">Mediterranean</MenuItem>
                    <MenuItem value="vegetarian">Vegetarian</MenuItem>
                    <MenuItem value="vegan">Vegan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ width: '100%' }}>
                  <Typography gutterBottom>Meals Per Day</Typography>
                  <Slider
                    value={formData.mealsPerDay}
                    onChange={handleSliderChange('mealsPerDay')}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={2}
                    max={6}
                    sx={{ color: theme.palette.primary.main }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      case 5:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NoteIcon color="primary" /> Additional Notes
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Any other information that might be helpful for creating your personalized plan.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Information"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  multiline
                  rows={5}
                  variant="outlined"
                  helperText="Any other details you'd like to share to help tailor your plan"
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  // For demo purposes - generates a mock fitness and meal plan
  const generateMockPlan = (data) => {
    const { age, gender, heightFeet, heightInches, weight, primaryGoal, fitnessLevel, preferredDiet } = data;
    const heightDisplay = heightFeet && heightInches ? `${heightFeet}'${heightInches}"` : '';
    
    return {
      fitnessProfile: {
        summary: `Based on your profile as a ${age}-year-old ${gender} at ${heightDisplay} and ${weight} lbs with a ${fitnessLevel} fitness level, we've created a personalized plan focused on ${primaryGoal.replace('_', ' ')} using a ${preferredDiet} diet approach.`,
        calorieGoal: gender === 'male' ? '2200-2400' : '1800-2000',
        macroBreakdown: {
          protein: primaryGoal === 'muscle_gain' ? '30-35%' : '25-30%',
          carbs: preferredDiet === 'low_carb' ? '20-25%' : '40-45%',
          fats: '25-30%'
        }
      },
      workoutPlan: {
        weekly: [
          {
            day: "Monday",
            focus: "Lower Body Strength",
            exercises: [
              "Squats: 3 sets of 10-12 reps",
              "Lunges: 3 sets of 10 reps per leg",
              "Deadlifts: 3 sets of 8-10 reps",
              "Calf Raises: 3 sets of 15 reps",
              "Plank: 3 sets of 30-45 seconds"
            ],
            cardio: "15 minutes moderate-intensity cycling",
            duration: "45-60 minutes"
          },
          {
            day: "Tuesday",
            focus: "Upper Body Push",
            exercises: [
              "Pushups: 3 sets of 10-12 reps",
              "Dumbbell Shoulder Press: 3 sets of 10 reps",
              "Chest Flies: 3 sets of 12 reps",
              "Tricep Dips: 3 sets of 10 reps",
              "Plank to Pushup: 3 sets of 8 reps"
            ],
            cardio: "20 minutes interval training (30s high intensity, 90s recovery)",
            duration: "45-60 minutes"
          },
          {
            day: "Wednesday",
            focus: "Active Recovery",
            exercises: [
              "Light walking: 20-30 minutes",
              "Dynamic stretching: 15 minutes",
              "Foam rolling: 10 minutes"
            ],
            cardio: "Optional light swimming or cycling (20 minutes)",
            duration: "30-45 minutes"
          },
          {
            day: "Thursday",
            focus: "Upper Body Pull",
            exercises: [
              "Dumbbell Rows: 3 sets of 10 reps per arm",
              "Lat Pulldowns: 3 sets of 12 reps",
              "Face Pulls: 3 sets of 15 reps",
              "Bicep Curls: 3 sets of 12 reps",
              "Superman holds: 3 sets of 30 seconds"
            ],
            cardio: "15 minutes steady-state cardio",
            duration: "45-60 minutes"
          },
          {
            day: "Friday",
            focus: "Full Body Circuit",
            exercises: [
              "Circuit 1 (3 rounds): Bodyweight squats, pushups, mountain climbers",
              "Circuit 2 (3 rounds): Lunges, dumbbell rows, jumping jacks",
              "Circuit 3 (2 rounds): Glute bridges, plank, burpees"
            ],
            cardio: "Integrated into circuit",
            duration: "40-50 minutes"
          },
          {
            day: "Saturday",
            focus: "Mobility & Flexibility",
            exercises: [
              "Full-body yoga flow: 30 minutes",
              "Focused stretching: 15 minutes",
              "Meditation/breathing: 10 minutes"
            ],
            cardio: "Optional light hiking or walking (30+ minutes)",
            duration: "45-60 minutes"
          },
          {
            day: "Sunday",
            focus: "Rest Day",
            exercises: [
              "Complete rest or very light activity",
              "Focus on sleep quality and recovery"
            ],
            cardio: "None (recovery)",
            duration: "Rest day"
          }
        ]
      },
      mealPlan: {
        daily: [
          {
            mealTime: "Breakfast",
            options: [
              "Option 1: Greek yogurt with berries, honey, and granola",
              "Option 2: Vegetable omelet with whole grain toast",
              "Option 3: Overnight oats with almond milk, chia seeds, and fruit"
            ],
            nutritionInfo: "~400 calories, 25g protein, 45g carbs, 12g fat"
          },
          {
            mealTime: "Mid-Morning Snack",
            options: [
              "Option 1: Apple with 1 tbsp almond butter",
              "Option 2: Protein shake with a small banana",
              "Option 3: Small handful of nuts and a piece of fruit"
            ],
            nutritionInfo: "~200 calories, 10g protein, 15g carbs, 10g fat"
          },
          {
            mealTime: "Lunch",
            options: [
              "Option 1: Grilled chicken salad with olive oil dressing",
              "Option 2: Quinoa bowl with roasted vegetables and tofu",
              "Option 3: Turkey and avocado wrap with mixed greens"
            ],
            nutritionInfo: "~500 calories, 30g protein, 40g carbs, 20g fat"
          },
          {
            mealTime: "Afternoon Snack",
            options: [
              "Option 1: Greek yogurt with honey",
              "Option 2: Protein bar (check label for macros)",
              "Option 3: Hummus with carrot and cucumber sticks"
            ],
            nutritionInfo: "~200 calories, 15g protein, 20g carbs, 8g fat"
          },
          {
            mealTime: "Dinner",
            options: [
              "Option 1: Baked salmon with roasted sweet potatoes and asparagus",
              "Option 2: Lean beef stir-fry with mixed vegetables and brown rice",
              "Option 3: Chickpea and vegetable curry with a small portion of basmati rice"
            ],
            nutritionInfo: "~600 calories, 35g protein, 50g carbs, 25g fat"
          },
          {
            mealTime: "Evening Snack (optional)",
            options: [
              "Option 1: Casein protein shake",
              "Option 2: Cottage cheese with a small handful of berries",
              "Option 3: Herbal tea with a small square of dark chocolate"
            ],
            nutritionInfo: "~150 calories, 15g protein, 10g carbs, 5g fat"
          }
        ],
        nutritionSummary: {
          dailyCalories: preferredDiet === 'low_carb' ? "1800-2000" : "2000-2200",
          macronutrients: {
            protein: `${preferredDiet === 'high_protein' ? "30-35%" : "20-25%"} (${preferredDiet === 'high_protein' ? "150-175g" : "100-125g"})`,
            carbohydrates: `${preferredDiet === 'low_carb' ? "20-30%" : "45-55%"} (${preferredDiet === 'low_carb' ? "100-150g" : "225-275g"})`,
            fats: "25-30% (55-65g)"
          },
          keyNotes: [
            "Aim to drink at least 8-10 glasses of water daily",
            "Prioritize whole foods over processed options",
            "Adjust portion sizes based on hunger and activity levels",
            `Time protein intake around your workouts for optimal ${primaryGoal === 'muscle_gain' ? 'muscle growth' : 'recovery'}`
          ]
        }
      },
      recommendations: [
        "Track your progress with measurements and photos every 2-4 weeks",
        "Ensure adequate sleep (7-9 hours) for recovery and hormone regulation",
        "Consider adjusting calories slightly if not seeing desired results after 3-4 weeks",
        "Stay consistent with your workouts, but listen to your body and rest when needed"
      ]
    };
  };

  // Allow access even if not authenticated
  if (false) {
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
              <FitnessCenterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Fitness Planning
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Please connect your Fitbit account to access the fitness planning feature.
            </Typography>
          </Paper>
        </Box>
      </motion.div>
    );
  }

  // This is a UI-only component since Grid isn't imported
  const Grid = ({ container, item, xs, sm, md, lg, children, spacing, ...props }) => {
    if (container) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            margin: spacing ? `-${spacing * 4}px` : 0,
            ...props.sx
          }}
          {...props}
        >
          {children}
        </Box>
      );
    }
    
    if (item) {
      const getWidth = (size) => {
        if (!size) return 'auto';
        return `${(size / 12) * 100}%`;
      };
      
      return (
        <Box 
          sx={{ 
            flexGrow: 0,
            maxWidth: {
              xs: getWidth(xs),
              sm: sm ? getWidth(sm) : getWidth(xs),
              md: md ? getWidth(md) : (sm ? getWidth(sm) : getWidth(xs)),
              lg: lg ? getWidth(lg) : (md ? getWidth(md) : (sm ? getWidth(sm) : getWidth(xs))),
            },
            flexBasis: {
              xs: getWidth(xs),
              sm: sm ? getWidth(sm) : getWidth(xs),
              md: md ? getWidth(md) : (sm ? getWidth(sm) : getWidth(xs)),
              lg: lg ? getWidth(lg) : (md ? getWidth(md) : (sm ? getWidth(sm) : getWidth(xs))),
            },
            padding: spacing ? `${spacing * 4}px` : 0,
            ...props.sx
          }}
          {...props}
        >
          {children}
        </Box>
      );
    }
    
    return <Box {...props}>{children}</Box>;
  };

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
            background: 'linear-gradient(135deg, #4caf50, #8bc34a)', 
            py: 2.5, 
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <FitnessCenterIcon sx={{ color: 'white', fontSize: 28 }} />
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              Personalized Fitness Planner
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 0 }}>
            {plan ? (
              <Box sx={{ p: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                      Your Personalized Fitness & Nutrition Plan
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => {
                          // Convert the current plan to a format compatible with Exercise Coach
                          const workouts = plan.workoutPlan.weekly.map(day => ({
                            day: day.day,
                            name: day.focus !== 'Rest Day' ? `${day.focus}` : 'Rest Day',
                            type: day.focus.toLowerCase().includes('strength') ? 'strength' : 
                                  day.focus.toLowerCase().includes('cardio') ? 'cardio' :
                                  day.focus.toLowerCase().includes('hiit') ? 'hiit' :
                                  day.focus.toLowerCase().includes('recovery') ? 'recovery' : 
                                  'cardio',
                            exercises: day.exercises.map(ex => {
                              // Parse exercise strings into structured data
                              const exercise = { name: ex };
                              
                              // Try to extract sets and reps with regex
                              const setsRepsMatch = ex.match(/(\d+)\s*sets?\s*of\s*(\d+)(?:-(\d+))?\s*reps?/i);
                              if (setsRepsMatch) {
                                exercise.name = ex.split(':')[0].trim();
                                exercise.sets = parseInt(setsRepsMatch[1]);
                                exercise.reps = parseInt(setsRepsMatch[2]);
                              }
                              
                              // Try to extract duration with regex
                              const durationMatch = ex.match(/(\d+)(?:-(\d+))?\s*(?:min|minute|seconds|sec)/i);
                              if (durationMatch && !setsRepsMatch) {
                                exercise.name = ex.split(':')[0].trim();
                                exercise.duration = durationMatch[0];
                              }
                              
                              return exercise;
                            }),
                            heartRateTarget: day.focus.toLowerCase().includes('cardio') ? 75 :
                                           day.focus.toLowerCase().includes('hiit') ? 85 :
                                           day.focus.toLowerCase().includes('strength') ? 70 :
                                           day.focus.toLowerCase().includes('recovery') ? 50 : 65,
                            // Add structured format for workout phases
                            structured: {
                              warmup: { duration: 5, zone: 'Fat Burn' },
                              main: { duration: day.duration === 'Rest day' ? 0 : 
                                    day.duration.includes('30-45') ? 30 :
                                    day.duration.includes('45-60') ? 45 : 30, 
                                    zone: day.focus.toLowerCase().includes('cardio') ? 'Cardio' : 'Fat Burn' },
                              cooldown: { duration: 5, zone: 'Fat Burn' }
                            },
                            tips: [
                              "Maintain proper form throughout",
                              "Stay hydrated during your workout",
                              "Focus on controlled movements rather than speed",
                              "Listen to your body and adjust intensity as needed"
                            ]
                          }));
                          
                          // Create the exercise plan
                          const exercisePlan = {
                            name: "Custom Fitness Plan",
                            description: plan.fitnessProfile.summary,
                            workouts: workouts
                          };
                          
                          // Save to workout plan context
                          saveCustomPlan(exercisePlan);
                          
                          // Show notification
                          setNotification({
                            open: true,
                            message: "Plan saved to Exercise Coach! Visit the Exercise Coach tab to start your workout.",
                            severity: "success"
                          });
                        }}
                      >
                        Save to Exercise Coach
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={handleReset} 
                        startIcon={<AssignmentIcon />}
                      >
                        Create New Plan
                      </Button>
                    </Box>
                  </Box>
                  
                  <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                      Profile Summary
                    </Typography>
                    <Typography paragraph>
                      {plan.fitnessProfile.summary}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2, background: 'white', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Daily Calorie Target
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            {plan.fitnessProfile.calorieGoal} calories
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Box sx={{ p: 2, background: 'white', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Recommended Macro Breakdown
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                              <Chip label={`Protein: ${plan.fitnessProfile.macroBreakdown.protein}`} 
                                    sx={{ width: '100%', bgcolor: alpha('#f44336', 0.1), color: '#d32f2f' }} />
                            </Grid>
                            <Grid item xs={4}>
                              <Chip label={`Carbs: ${plan.fitnessProfile.macroBreakdown.carbs}`} 
                                    sx={{ width: '100%', bgcolor: alpha('#2196f3', 0.1), color: '#1976d2' }} />
                            </Grid>
                            <Grid item xs={4}>
                              <Chip label={`Fats: ${plan.fitnessProfile.macroBreakdown.fats}`} 
                                    sx={{ width: '100%', bgcolor: alpha('#ff9800', 0.1), color: '#ed6c02' }} />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Typography variant="h5" gutterBottom sx={{ mt: 4, color: theme.palette.primary.main, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsRunIcon /> Weekly Workout Plan
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {plan.workoutPlan.weekly.map((day, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Paper elevation={2} sx={{ 
                          p: 2, 
                          height: '100%', 
                          borderRadius: 2,
                          border: day.focus === 'Rest Day' ? `1px solid ${alpha('#9e9e9e', 0.3)}` : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          background: day.focus === 'Rest Day' ? alpha('#9e9e9e', 0.05) : 'white'
                        }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: day.focus === 'Rest Day' ? '#9e9e9e' : theme.palette.primary.main }}>
                              {day.day}
                            </Typography>
                            <Chip 
                              label={day.focus} 
                              size="small"
                              sx={{ 
                                bgcolor: day.focus === 'Rest Day' ? alpha('#9e9e9e', 0.2) : alpha(theme.palette.primary.main, 0.1),
                                color: day.focus === 'Rest Day' ? '#757575' : theme.palette.primary.main,
                                fontWeight: 'medium'
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" /> Duration: {day.duration}
                          </Typography>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
                            Exercises:
                          </Typography>
                          <ul style={{ paddingLeft: '20px', marginTop: '4px', marginBottom: '8px' }}>
                            {day.exercises.map((exercise, i) => (
                              <li key={i}><Typography variant="body2">{exercise}</Typography></li>
                            ))}
                          </ul>
                          
                          {day.cardio && (
                            <>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
                                Cardio:
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {day.cardio}
                              </Typography>
                            </>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Typography variant="h5" gutterBottom sx={{ mt: 4, color: theme.palette.primary.main, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon /> Nutrition Plan
                  </Typography>
                  
                  <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                      Daily Nutrition Summary
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Daily Calories
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            {plan.mealPlan.nutritionSummary.dailyCalories} calories
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Macronutrient Targets
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  Protein:
                                </Typography>
                                <Typography variant="body2">
                                  {plan.mealPlan.nutritionSummary.macronutrients.protein}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  Carbohydrates:
                                </Typography>
                                <Typography variant="body2">
                                  {plan.mealPlan.nutritionSummary.macronutrients.carbohydrates}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  Fats:
                                </Typography>
                                <Typography variant="body2">
                                  {plan.mealPlan.nutritionSummary.macronutrients.fats}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Key Nutrition Notes:
                      </Typography>
                      <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                        {plan.mealPlan.nutritionSummary.keyNotes.map((note, i) => (
                          <li key={i}><Typography variant="body2">{note}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  </Paper>
                  
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                    Sample Daily Meal Plan
                  </Typography>
                  
                  {plan.mealPlan.daily.map((meal, index) => (
                    <Paper key={index} elevation={2} sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2,
                      borderLeft: `4px solid ${
                        meal.mealTime.includes('Breakfast') ? '#8bc34a' : 
                        meal.mealTime.includes('Lunch') ? '#2196f3' : 
                        meal.mealTime.includes('Dinner') ? '#ff9800' : 
                        '#9e9e9e'
                      }`
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {meal.mealTime}
                        </Typography>
                        <Chip 
                          label={meal.nutritionInfo} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 'medium'
                          }} 
                        />
                      </Box>
                      
                      <ul style={{ paddingLeft: '20px', marginTop: '4px', marginBottom: '4px' }}>
                        {meal.options.map((option, i) => (
                          <li key={i}><Typography variant="body2">{option}</Typography></li>
                        ))}
                      </ul>
                    </Paper>
                  ))}
                  
                  <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                      Additional Recommendations
                    </Typography>
                    <ul style={{ paddingLeft: '20px' }}>
                      {plan.recommendations.map((rec, i) => (
                        <li key={i}><Typography variant="body2" paragraph={false}>{rec}</Typography></li>
                      ))}
                    </ul>
                  </Paper>
                </motion.div>
              </Box>
            ) : (
              <Box sx={{ p: 3 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, textAlign: 'center' }}>
                    <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Creating Your Personalized Plan
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Our AI is analyzing your information to create a customized fitness and nutrition plan.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="subtitle1" paragraph>
                      Complete the questionnaire below to receive a personalized fitness and nutrition plan tailored to your goals and preferences.
                    </Typography>
                    
                    {error && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                      </Alert>
                    )}
                    
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    
                    {getStepContent(activeStep)}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        variant="outlined"
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                      >
                        {activeStep === steps.length - 1 ? 'Generate Plan' : 'Next'}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 90, sm: 30 } }} // Ensure it's visible above the footer and other elements
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FitnessTab;