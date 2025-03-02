import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tab,
  Tabs,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import MealPlanQuestionnaire from './MealPlanQuestionnaire';
import MealPlanDisplay from './MealPlanDisplay';
import { useWorkoutPlan } from '../context/WorkoutPlanContext';

// TabPanel component to manage tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`meal-planning-tabpanel-${index}`}
      aria-labelledby={`meal-planning-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MealPlanningSection = ({ onAddToCart, mockMealPlans }) => {
  const theme = useTheme();
  const { saveFitnessProfile, dietTypes } = useWorkoutPlan();
  const [tabIndex, setTabIndex] = useState(0);
  const [mealPlannerStep, setMealPlannerStep] = useState('questionnaire'); // 'questionnaire', 'results'
  const [mealPlanFormData, setMealPlanFormData] = useState(null);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Handle questionnaire completion
  const handleQuestionnaireComplete = (formData) => {
    setMealPlanFormData(formData);
    setMealPlannerStep('results');
    
    // Create a profile object to save to the workout plan context
    const fitnessProfile = {
      primaryGoal: formData.healthGoal,
      preferredDiet: formData.dietaryRestrictions[0] || 'balanced',
      dietaryRestrictions: formData.dietaryRestrictions.join(','),
      mealsPerDay: formData.mealsPerDay,
      calorieTarget: formData.calorieTarget,
      foodPreferences: formData.foodPreferences,
      allergies: formData.allergies
    };
    
    // Save to context
    saveFitnessProfile(fitnessProfile);
    
    // Find a matching meal plan from mock data for demonstration
    const matchingDietType = formData.dietaryRestrictions[0] || 'balanced';
    const matchedPlan = mockMealPlans.find(plan => 
      plan.dietType.toLowerCase() === matchingDietType.toLowerCase()
    ) || mockMealPlans[0];
    
    setSelectedMealPlan(matchedPlan);
  };

  // Handle adding all items from meal plan to cart
  const handleAddMealPlanToCart = (items) => {
    onAddToCart(items);
  };

  // Start over with questionnaire
  const handleStartOver = () => {
    setMealPlannerStep('questionnaire');
    setMealPlanFormData(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          aria-label="Meal planning tabs"
          variant="fullWidth"
        >
          <Tab 
            icon={<QuestionAnswerIcon />} 
            label="Questionnaire" 
            id="meal-planning-tab-0"
            aria-controls="meal-planning-tabpanel-0" 
          />
          <Tab 
            icon={<RestaurantMenuIcon />} 
            label="Meal Plan" 
            id="meal-planning-tab-1"
            aria-controls="meal-planning-tabpanel-1"
            disabled={!selectedMealPlan}
          />
          <Tab 
            icon={<ShoppingCartIcon />} 
            label="Shopping List" 
            id="meal-planning-tab-2"
            aria-controls="meal-planning-tabpanel-2"
            disabled={!selectedMealPlan}
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabIndex} index={0}>
        {mealPlannerStep === 'questionnaire' ? (
          <MealPlanQuestionnaire onComplete={handleQuestionnaireComplete} />
        ) : (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Your Meal Plan is Ready!
            </Typography>
            <Typography variant="body1" paragraph>
              Based on your preferences, we've created a personalized meal plan.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setTabIndex(1)}
              sx={{ mr: 2 }}
            >
              View Meal Plan
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleStartOver}
            >
              Start Over
            </Button>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabIndex} index={1}>
        {selectedMealPlan && (
          <MealPlanDisplay 
            mealPlan={selectedMealPlan}
            onAddToCart={handleAddMealPlanToCart}
          />
        )}
      </TabPanel>
      
      <TabPanel value={tabIndex} index={2}>
        {selectedMealPlan && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Shopping List for {selectedMealPlan.name}
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                onClick={() => handleAddMealPlanToCart(selectedMealPlan.ingredients)}
                sx={{ mb: 3 }}
              >
                Add All to Cart
              </Button>
              
              {/* Group ingredients by category */}
              {['Protein', 'Produce', 'Grains', 'Dairy', 'Oils & Vinegars', 'Nuts & Seeds'].map(category => {
                const categoryItems = selectedMealPlan.ingredients.filter(
                  item => item.name.includes(category) || (item.category === category)
                );
                
                if (categoryItems.length === 0) return null;
                
                return (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {category}
                    </Typography>
                    {categoryItems.map(item => (
                      <Box 
                        key={item.itemId}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="body2">{item.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {item.quantity} {item.unit}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => onAddToCart([item])}
                          >
                            Add
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Paper>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

export default MealPlanningSection;