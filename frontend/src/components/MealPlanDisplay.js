import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha
} from '@mui/material';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CalculateIcon from '@mui/icons-material/Calculate';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const MealPlanDisplay = ({ mealPlan, onAddToCart }) => {
  const theme = useTheme();
  const [expandedDay, setExpandedDay] = useState(0);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Helper function to mock daily meals based on the meal plan
  const generateDailyMeals = (mealPlan) => {
    // This would be replaced by an actual meal generation algorithm
    const mealsPerDay = 3; // Default to 3 meals
    const dailyMeals = days.map(day => {
      const meals = [];
      
      // Create breakfast
      meals.push({
        id: `${day}-breakfast`,
        name: `${mealPlan.dietType} Breakfast`,
        type: 'breakfast',
        calories: Math.round(mealPlan.totalCalories * 0.3),
        ingredients: mealPlan.ingredients.filter((_, i) => i % 5 === 0 || i % 3 === 0).slice(0, 3)
      });
      
      // Create lunch
      meals.push({
        id: `${day}-lunch`,
        name: `${mealPlan.dietType} Lunch`,
        type: 'lunch',
        calories: Math.round(mealPlan.totalCalories * 0.35),
        ingredients: mealPlan.ingredients.filter((_, i) => i % 4 === 0 || i % 7 === 0).slice(0, 4)
      });
      
      // Create dinner
      meals.push({
        id: `${day}-dinner`,
        name: `${mealPlan.dietType} Dinner`,
        type: 'dinner',
        calories: Math.round(mealPlan.totalCalories * 0.35),
        ingredients: mealPlan.ingredients.filter((_, i) => i % 2 === 0 || i % 3 === 1).slice(0, 4)
      });
      
      return {
        day,
        meals
      };
    });
    
    return dailyMeals;
  };
  
  const dailyMeals = useMemo(() => generateDailyMeals(mealPlan), [mealPlan]);
  
  // Create shopping list from all ingredients
  const shoppingList = useMemo(() => {
    return mealPlan.ingredients.map(item => ({
      ...item,
      checked: false
    }));
  }, [mealPlan]);
  
  const handleChange = (panel) => (event, newExpanded) => {
    setExpandedDay(newExpanded ? panel : false);
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'breakfast':
        return <FreeBreakfastIcon />;
      case 'lunch':
        return <RiceBowlIcon />;
      case 'dinner':
        return <DinnerDiningIcon />;
      default:
        return <LocalDiningIcon />;
    }
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HealthAndSafetyIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h2">
              {mealPlan.name}
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {mealPlan.description}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Chip 
              icon={<RestaurantMenuIcon />} 
              label={mealPlan.dietType} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              icon={<CalculateIcon />} 
              label={`${mealPlan.totalCalories} calories`} 
              color="secondary" 
              variant="outlined" 
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mr: 1 }}>Macros:</Typography>
            <Chip size="small" label={`Protein: ${mealPlan.macros.protein}`} color="default" />
            <Chip size="small" label={`Carbs: ${mealPlan.macros.carbs}`} color="default" />
            <Chip size="small" label={`Fat: ${mealPlan.macros.fat}`} color="default" />
          </Box>
        </CardContent>
      </Card>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Weekly Meal Plan
        </Typography>
        
        {dailyMeals.map((dailyMeal, index) => (
          <Accordion 
            key={dailyMeal.day}
            expanded={expandedDay === index}
            onChange={handleChange(index)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{dailyMeal.day}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List disablePadding>
                {dailyMeal.meals.map((meal) => (
                  <ListItem 
                    key={meal.id}
                    sx={{ 
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                      borderRadius: 1,
                      mb: 1
                    }}
                    secondaryAction={
                      <Typography variant="body2" color="text.secondary">
                        {meal.calories} cal
                      </Typography>
                    }
                  >
                    <ListItemIcon>
                      {getTypeIcon(meal.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={meal.name}
                      secondary={
                        <Box component="span" sx={{ display: 'block' }}>
                          {meal.ingredients.map(ing => ing.name).join(", ")}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Shopping List
          </Typography>
          <Button 
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => onAddToCart(shoppingList)}
          >
            Add All to Cart
          </Button>
        </Box>
        
        <List>
          {shoppingList.map((item) => (
            <ListItem
              key={item.itemId}
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {item.quantity} {item.unit}
                  </Typography>
                  <IconButton edge="end" onClick={() => onAddToCart([item])}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default MealPlanDisplay;