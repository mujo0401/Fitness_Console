import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Slider,
  useTheme,
  alpha,
} from '@mui/material';

// Icons
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BoltIcon from '@mui/icons-material/Bolt';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import NoFoodIcon from '@mui/icons-material/NoFood';
import EggAltIcon from '@mui/icons-material/EggAlt';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import GrassIcon from '@mui/icons-material/Grass';
import SpaIcon from '@mui/icons-material/Spa';
import NoMealsIcon from '@mui/icons-material/NoMeals';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const MealPlanQuestionnaire = ({ onComplete }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    healthGoal: '',
    dietaryRestrictions: [],
    foodPreferences: {
      protein: 3,
      carbs: 3,
      fruits: 3,
      vegetables: 3,
      dairy: 3,
      nuts: 3
    },
    flavorPreferences: [],
    mealsPerDay: 3,
    calorieTarget: 2000,
    allergies: []
  });
  
  const healthGoals = [
    { value: 'weight_loss', label: 'Weight Loss', icon: <FitnessCenterIcon />, description: 'Focus on calorie deficit with balanced nutrition' },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: <DirectionsRunIcon />, description: 'Higher protein intake with sufficient calories' },
    { value: 'endurance', label: 'Endurance', icon: <BoltIcon />, description: 'Complex carbs and proper nutrient timing' },
    { value: 'general_health', label: 'General Health', icon: <HealthAndSafetyIcon />, description: 'Balanced nutrition with diverse food groups' },
    { value: 'heart_health', label: 'Heart Health', icon: <MonitorHeartIcon />, description: 'Lower sodium, healthy fats, and fiber-rich foods' }
  ];
  
  const dietTypes = [
    { value: 'balanced', label: 'Balanced', icon: <RestaurantMenuIcon /> },
    { value: 'keto', label: 'Keto', icon: <NoFoodIcon /> },
    { value: 'paleo', label: 'Paleo', icon: <EggAltIcon /> },
    { value: 'mediterranean', label: 'Mediterranean', icon: <LocalDiningIcon /> },
    { value: 'vegan', label: 'Vegan', icon: <GrassIcon /> },
    { value: 'vegetarian', label: 'Vegetarian', icon: <SpaIcon /> },
    { value: 'gluten_free', label: 'Gluten-Free', icon: <NoMealsIcon /> }
  ];
  
  const flavorProfiles = [
    { value: 'sweet', label: 'Sweet' },
    { value: 'savory', label: 'Savory' },
    { value: 'spicy', label: 'Spicy' },
    { value: 'tangy', label: 'Tangy/Acidic' },
    { value: 'umami', label: 'Umami/Rich' },
    { value: 'bitter', label: 'Bitter' },
    { value: 'herbal', label: 'Herbal' }
  ];
  
  const commonAllergies = [
    { value: 'dairy', label: 'Dairy' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'peanuts', label: 'Peanuts' },
    { value: 'tree_nuts', label: 'Tree Nuts' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'soy', label: 'Soy' },
    { value: 'wheat', label: 'Wheat/Gluten' }
  ];
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    onComplete(formData);
  };
  
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleCheckboxChange = (field, item) => {
    const currentItems = formData[field] || [];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    
    setFormData({
      ...formData,
      [field]: newItems
    });
  };
  
  const handleFoodPreferenceChange = (food, value) => {
    setFormData({
      ...formData,
      foodPreferences: {
        ...formData.foodPreferences,
        [food]: value
      }
    });
  };
  
  // Steps for the questionnaire
  const steps = [
    {
      label: 'Health Goals',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            What is your primary health or fitness goal?
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {healthGoals.map((goal) => (
              <Grid item xs={12} sm={6} key={goal.value}>
                <Paper 
                  elevation={formData.healthGoal === goal.value ? 3 : 1}
                  sx={{
                    p: 2, 
                    cursor: 'pointer',
                    border: formData.healthGoal === goal.value 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : '2px solid transparent',
                    bgcolor: formData.healthGoal === goal.value 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : 'background.paper',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                  onClick={() => handleChange('healthGoal', goal.value)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                      mr: 2, 
                      color: formData.healthGoal === goal.value 
                        ? 'primary.main' 
                        : 'text.secondary' 
                    }}>
                      {goal.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {goal.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {goal.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    },
    {
      label: 'Dietary Restrictions',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Do you follow any specific diet or have dietary restrictions?
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {dietTypes.map((diet) => (
              <Grid item xs={6} sm={4} key={diet.value}>
                <Paper 
                  elevation={formData.dietaryRestrictions.includes(diet.value) ? 3 : 1}
                  sx={{
                    p: 2, 
                    cursor: 'pointer',
                    border: formData.dietaryRestrictions.includes(diet.value) 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : '2px solid transparent',
                    bgcolor: formData.dietaryRestrictions.includes(diet.value) 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : 'background.paper',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                  onClick={() => handleCheckboxChange('dietaryRestrictions', diet.value)}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ 
                      mb: 1, 
                      color: formData.dietaryRestrictions.includes(diet.value) 
                        ? 'primary.main' 
                        : 'text.secondary' 
                    }}>
                      {diet.icon}
                    </Box>
                    <Typography variant="subtitle2">
                      {diet.label}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    },
    {
      label: 'Food Preferences',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Rate how much you like these food groups (1-5):
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Protein Sources</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography id="protein-slider" gutterBottom>
                  Dislike
                </Typography>
                <Slider
                  value={formData.foodPreferences.protein}
                  onChange={(_, value) => handleFoodPreferenceChange('protein', value)}
                  aria-labelledby="protein-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={5}
                  sx={{ mx: 2 }}
                />
                <Typography gutterBottom>
                  Love
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Carbohydrates (Grains, Pasta)</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography id="carbs-slider" gutterBottom>
                  Dislike
                </Typography>
                <Slider
                  value={formData.foodPreferences.carbs}
                  onChange={(_, value) => handleFoodPreferenceChange('carbs', value)}
                  aria-labelledby="carbs-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={5}
                  sx={{ mx: 2 }}
                />
                <Typography gutterBottom>
                  Love
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Fruits</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography id="fruits-slider" gutterBottom>
                  Dislike
                </Typography>
                <Slider
                  value={formData.foodPreferences.fruits}
                  onChange={(_, value) => handleFoodPreferenceChange('fruits', value)}
                  aria-labelledby="fruits-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={5}
                  sx={{ mx: 2 }}
                />
                <Typography gutterBottom>
                  Love
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Vegetables</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography id="vegetables-slider" gutterBottom>
                  Dislike
                </Typography>
                <Slider
                  value={formData.foodPreferences.vegetables}
                  onChange={(_, value) => handleFoodPreferenceChange('vegetables', value)}
                  aria-labelledby="vegetables-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={5}
                  sx={{ mx: 2 }}
                />
                <Typography gutterBottom>
                  Love
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="body1" gutterBottom sx={{ mt: 3 }}>
            What flavor profiles do you enjoy most?
          </Typography>
          <Box sx={{ mt: 1 }}>
            <FormGroup row>
              {flavorProfiles.map((flavor) => (
                <FormControlLabel
                  key={flavor.value}
                  control={
                    <Checkbox
                      checked={formData.flavorPreferences.includes(flavor.value)}
                      onChange={() => handleCheckboxChange('flavorPreferences', flavor.value)}
                    />
                  }
                  label={flavor.label}
                  sx={{ minWidth: '120px' }}
                />
              ))}
            </FormGroup>
          </Box>
        </Box>
      )
    },
    {
      label: 'Meal Structure',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            How many meals do you prefer to eat per day?
          </Typography>
          <RadioGroup
            row
            value={formData.mealsPerDay}
            onChange={(e) => handleChange('mealsPerDay', parseInt(e.target.value))}
            sx={{ my: 2 }}
          >
            <FormControlLabel value={2} control={<Radio />} label="2 (Intermittent Fasting)" />
            <FormControlLabel value={3} control={<Radio />} label="3 (Standard)" />
            <FormControlLabel value={4} control={<Radio />} label="4" />
            <FormControlLabel value={5} control={<Radio />} label="5+" />
          </RadioGroup>
          
          <Typography variant="body1" gutterBottom>
            Daily calorie target (if known)
          </Typography>
          <Slider
            value={formData.calorieTarget}
            onChange={(_, value) => handleChange('calorieTarget', value)}
            aria-labelledby="calorie-slider"
            valueLabelDisplay="on"
            step={100}
            marks={[
              { value: 1200, label: '1200' },
              { value: 2000, label: '2000' },
              { value: 3000, label: '3000' }
            ]}
            min={1200}
            max={3500}
            sx={{ maxWidth: 500, mt: 2, mb: 4 }}
          />
        </Box>
      )
    },
    {
      label: 'Allergies',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Do you have any food allergies or ingredients to avoid?
          </Typography>
          <FormGroup sx={{ mt: 2 }}>
            {commonAllergies.map((allergy) => (
              <FormControlLabel
                key={allergy.value}
                control={
                  <Checkbox
                    checked={formData.allergies.includes(allergy.value)}
                    onChange={() => handleCheckboxChange('allergies', allergy.value)}
                  />
                }
                label={allergy.label}
              />
            ))}
          </FormGroup>
          
          <TextField
            label="Other allergies or ingredients to avoid"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.otherAllergies || ''}
            onChange={(e) => handleChange('otherAllergies', e.target.value)}
            placeholder="List any other allergies or foods to avoid"
          />
        </Box>
      )
    }
  ];
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, pb: 4 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="subtitle1">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              {step.content}
              <Box sx={{ mb: 2, mt: 3 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleComplete : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    endIcon={index === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
                  >
                    {index === steps.length - 1 ? 'Complete' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography variant="h6">All steps completed!</Typography>
          <Typography variant="body1" mt={1}>
            Based on your preferences, we'll create a personalized meal plan and shopping list.
          </Typography>
          <Button onClick={handleComplete} sx={{ mt: 1, mr: 1 }} variant="contained">
            Generate My Meal Plan
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default MealPlanQuestionnaire;