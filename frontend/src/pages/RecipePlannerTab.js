// frontend/src/pages/RecipePlannerTab.js

import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Container,
  Skeleton,
  Badge,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Avatar,
  ListItemIcon
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import KitchenIcon from '@mui/icons-material/Kitchen';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import EggAltIcon from '@mui/icons-material/EggAlt';
import GrassIcon from '@mui/icons-material/Grass';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpaIcon from '@mui/icons-material/Spa';
import NoMealsIcon from '@mui/icons-material/NoMeals';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import { useAuth } from '../context/AuthContext';
import { useWorkoutPlan } from '../context/WorkoutPlanContext';

// Mock recipes data - Replace with API call in production
const mockRecipes = [
  {
    id: 1,
    title: "Grilled Salmon with Avocado Salsa",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 420,
    protein: 38,
    carbs: 12,
    fat: 28,
    dietTypes: ["Keto", "High-Protein", "Paleo", "Gluten-Free"],
    ingredients: [
      "4 salmon fillets, about 6 oz each",
      "2 ripe avocados, diced",
      "1 small red onion, finely chopped",
      "1 jalapeño, seeded and minced",
      "2 tbsp fresh lime juice",
      "2 tbsp olive oil",
      "¼ cup fresh cilantro, chopped",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Preheat grill to medium-high heat.",
      "Season salmon fillets with salt and pepper.",
      "Grill salmon for 4-5 minutes per side until cooked through.",
      "Meanwhile, in a bowl, combine avocados, red onion, jalapeño, lime juice, olive oil, and cilantro.",
      "Season salsa with salt and pepper to taste.",
      "Serve salmon topped with avocado salsa."
    ],
    rating: 4.8,
    reviewCount: 152,
    difficulty: "Easy",
    tags: ["Dinner", "Healthy", "Seafood"],
    isFavorite: false
  },
  {
    id: 2,
    title: "Spicy Lentil and Vegetable Curry",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    prepTime: 20,
    cookTime: 35,
    servings: 6,
    calories: 320,
    protein: 14,
    carbs: 45,
    fat: 10,
    dietTypes: ["Vegan", "Vegetarian", "Gluten-Free", "Low-Fat"],
    ingredients: [
      "2 cups red lentils, rinsed",
      "1 large onion, diced",
      "3 cloves garlic, minced",
      "1 tbsp ginger, grated",
      "2 carrots, diced",
      "1 bell pepper, diced",
      "2 tbsp curry powder",
      "1 tsp turmeric",
      "1/2 tsp cayenne pepper",
      "1 can (14 oz) diced tomatoes",
      "4 cups vegetable broth",
      "1 can (14 oz) coconut milk",
      "2 cups spinach, fresh",
      "Salt to taste",
      "Fresh cilantro for garnish"
    ],
    instructions: [
      "Heat oil in a large pot over medium heat. Add onions, garlic, and ginger, and sauté for 5 minutes.",
      "Add carrots and bell pepper, cook for another 3 minutes.",
      "Stir in curry powder, turmeric, and cayenne, cooking until fragrant, about 1 minute.",
      "Add lentils, diced tomatoes, and vegetable broth. Bring to a boil, then reduce heat and simmer for 20 minutes.",
      "Stir in coconut milk and simmer for another 10 minutes until lentils are tender.",
      "Add spinach and cook until wilted, about 2 minutes.",
      "Season with salt to taste and garnish with fresh cilantro."
    ],
    rating: 4.6,
    reviewCount: 98,
    difficulty: "Medium",
    tags: ["Dinner", "Plant-based", "Curry"],
    isFavorite: false
  },
  {
    id: 3,
    title: "Mediterranean Quinoa Bowl",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 380,
    protein: 12,
    carbs: 52,
    fat: 15,
    dietTypes: ["Vegetarian", "Mediterranean", "Dairy-Free"],
    ingredients: [
      "1 cup quinoa, rinsed",
      "2 cups water",
      "1 cucumber, diced",
      "1 cup cherry tomatoes, halved",
      "1/2 red onion, thinly sliced",
      "1/2 cup Kalamata olives, pitted and halved",
      "1/4 cup fresh parsley, chopped",
      "1/4 cup fresh mint, chopped",
      "3 tbsp olive oil",
      "2 tbsp lemon juice",
      "1 tsp dried oregano",
      "Salt and pepper to taste",
      "1/4 cup feta cheese, crumbled (optional)"
    ],
    instructions: [
      "In a saucepan, combine quinoa and water. Bring to a boil, then reduce heat and simmer covered for about 15 minutes until water is absorbed.",
      "Fluff quinoa with a fork and let cool slightly.",
      "In a large bowl, combine cooked quinoa, cucumber, tomatoes, red onion, olives, parsley, and mint.",
      "In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.",
      "Pour dressing over the quinoa mixture and toss to combine.",
      "Top with crumbled feta cheese if desired. Serve at room temperature or chilled."
    ],
    rating: 4.5,
    reviewCount: 76,
    difficulty: "Easy",
    tags: ["Salad", "Lunch", "Healthy"],
    isFavorite: false
  },
  {
    id: 4,
    title: "Protein-Packed Breakfast Smoothie Bowl",
    image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    calories: 340,
    protein: 24,
    carbs: 42,
    fat: 10,
    dietTypes: ["Vegetarian", "High-Protein", "Gluten-Free"],
    ingredients: [
      "1 frozen banana",
      "1/2 cup frozen mixed berries",
      "1 scoop protein powder (vanilla or berry flavor)",
      "1/4 cup Greek yogurt",
      "1/4 cup almond milk",
      "Toppings: sliced fresh fruit, granola, chia seeds, hemp seeds, almond butter"
    ],
    instructions: [
      "Add frozen banana, berries, protein powder, Greek yogurt, and almond milk to a blender.",
      "Blend until smooth but thick enough to eat with a spoon. Add more almond milk if needed to achieve desired consistency.",
      "Pour into a bowl and arrange toppings artfully on top.",
      "Serve immediately."
    ],
    rating: 4.7,
    reviewCount: 124,
    difficulty: "Easy",
    tags: ["Breakfast", "Quick", "Smoothie"],
    isFavorite: false
  },
  {
    id: 5,
    title: "Sheet Pan Garlic Herb Chicken and Vegetables",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    calories: 410,
    protein: 35,
    carbs: 22,
    fat: 18,
    dietTypes: ["Paleo", "Whole30", "Gluten-Free", "Low-Carb"],
    ingredients: [
      "4 chicken breasts, boneless and skinless",
      "2 cups brussels sprouts, halved",
      "2 bell peppers, chopped into 1-inch pieces",
      "1 red onion, cut into wedges",
      "2 tbsp olive oil",
      "4 cloves garlic, minced",
      "1 tbsp fresh rosemary, chopped",
      "1 tbsp fresh thyme, chopped",
      "1 tsp paprika",
      "Salt and pepper to taste",
      "Lemon wedges for serving"
    ],
    instructions: [
      "Preheat oven to 425°F (220°C) and line a large baking sheet with parchment paper.",
      "In a small bowl, combine olive oil, garlic, rosemary, thyme, paprika, salt, and pepper.",
      "Place chicken and vegetables on the prepared baking sheet.",
      "Drizzle the herb mixture over the chicken and vegetables, tossing to coat evenly.",
      "Arrange in a single layer and bake for 25-30 minutes until chicken is cooked through and vegetables are tender.",
      "Serve with lemon wedges."
    ],
    rating: 4.9,
    reviewCount: 203,
    difficulty: "Easy",
    tags: ["Dinner", "One-Pan", "Meal Prep"],
    isFavorite: false
  }
];

// Available diet types for filtering
const dietTypes = [
  { id: 'all', label: 'All Diets', icon: <FastfoodIcon /> },
  { id: 'keto', label: 'Keto', icon: <EggAltIcon /> },
  { id: 'vegan', label: 'Vegan', icon: <GrassIcon /> },
  { id: 'vegetarian', label: 'Vegetarian', icon: <SpaIcon /> },
  { id: 'paleo', label: 'Paleo', icon: <OutdoorGrillIcon /> },
  { id: 'gluten-free', label: 'Gluten-Free', icon: <NoMealsIcon /> },
  { id: 'low-carb', label: 'Low-Carb', icon: <RiceBowlIcon /> },
];

const RecipePlannerTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { userPreferences } = useWorkoutPlan();
  
  // State for recipes
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Load recipes (mock data for now)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRecipes(mockRecipes);
      setFilteredRecipes(mockRecipes);
      setLoading(false);
    }, 1000);
    
    // Load saved favorites from localStorage
    const savedFavorites = localStorage.getItem('recipesFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);
  
  // Filter recipes based on search term and selected diet
  useEffect(() => {
    let results = recipes;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(recipe => 
        recipe.title.toLowerCase().includes(term) || 
        recipe.tags.some(tag => tag.toLowerCase().includes(term)) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(term))
      );
    }
    
    // Filter by diet type
    if (selectedDietType !== 'all') {
      results = results.filter(recipe => 
        recipe.dietTypes.some(diet => diet.toLowerCase() === selectedDietType.toLowerCase())
      );
    }
    
    // Apply favorites filter if on favorites tab
    if (currentTab === 1) {
      results = results.filter(recipe => favorites.includes(recipe.id));
    }
    
    setFilteredRecipes(results);
  }, [searchTerm, selectedDietType, recipes, currentTab, favorites]);
  
  // Toggle recipe as favorite
  const toggleFavorite = useCallback((recipeId) => {
    setFavorites(prev => {
      let newFavorites;
      if (prev.includes(recipeId)) {
        newFavorites = prev.filter(id => id !== recipeId);
      } else {
        newFavorites = [...prev, recipeId];
      }
      
      // Save to localStorage
      localStorage.setItem('recipesFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);
  
  // Open recipe details dialog
  const handleOpenRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
    setOpenRecipeDialog(true);
  };
  
  // Change diet type filter
  const handleDietTypeChange = (dietType) => {
    setSelectedDietType(dietType);
  };
  
  // Handle tab change (All Recipes / Favorites)
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  // Memoized diet filter chips
  const dietFilterChips = useMemo(() => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
      {dietTypes.map((diet) => (
        <Chip
          key={diet.id}
          icon={diet.icon}
          label={diet.label}
          onClick={() => handleDietTypeChange(diet.id)}
          color={selectedDietType === diet.id ? "primary" : "default"}
          variant={selectedDietType === diet.id ? "filled" : "outlined"}
          sx={{
            transition: 'all 0.3s ease',
            fontWeight: selectedDietType === diet.id ? 600 : 400,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
          }}
        />
      ))}
    </Box>
  ), [selectedDietType]);
  
  // Recipe recommendation section based on user preferences
  const recommendedRecipes = useMemo(() => {
    if (!recipes.length) return [];
    
    // Logic to recommend recipes based on user preferences
    // For now, just return 2 random recipes
    return recipes.sort(() => 0.5 - Math.random()).slice(0, 2);
  }, [recipes]);
  
  return (
    <Box sx={{ 
      px: { xs: 1, sm: 2, md: 3 }, 
      py: 2,
      position: 'relative',
      minHeight: '80vh'
    }}>
      {/* Header section */}
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 700,
              mb: 1.5,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <RestaurantMenuIcon fontSize="large" />
            Recipe Planner
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Discover, save, and cook delicious healthy recipes
          </Typography>
        </motion.div>
        
        {/* Search and Filter Section */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.9)})`,
            backdropFilter: 'blur(10px)',
            mb: 3
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search recipes by name, ingredient, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                  Filter by:
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              {dietFilterChips}
            </Grid>
          </Grid>
        </Paper>
        
        {/* Tabs for All Recipes / Favorites */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{ 
            mb: 3,
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: '8px 8px 0 0',
              fontWeight: 600,
              transition: 'all 0.3s ease',
            }
          }}
        >
          <Tab 
            label="All Recipes" 
            icon={<MenuBookIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Favorites" 
            icon={<FavoriteIcon />} 
            iconPosition="start" 
          />
        </Tabs>
      </Box>
      
      {/* Recommendations Section (only show on All Recipes tab) */}
      {currentTab === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Recommended for You
            </Typography>
            <Grid container spacing={3}>
              {recommendedRecipes.map(recipe => (
                <Grid item xs={12} sm={6} key={`recommended-${recipe.id}`}>
                  <motion.div whileHover={{ y: -5 }}>
                    <Card 
                      elevation={4} 
                      sx={{ 
                        display: 'flex', 
                        height: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        background: `linear-gradient(135deg, ${alpha('#ff9800', 0.05)}, ${alpha('#f57c00', 0.1)})`
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '60%' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="overline" color="primary">
                            Recommended
                          </Typography>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            {recipe.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {recipe.prepTime + recipe.cookTime} min
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {recipe.dietTypes.slice(0, 3).map(diet => (
                              <Chip
                                key={diet}
                                label={diet}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            onClick={() => handleOpenRecipeDetails(recipe)}
                            sx={{ fontWeight: 600 }}
                          >
                            View Recipe
                          </Button>
                          <IconButton 
                            onClick={() => toggleFavorite(recipe.id)}
                            color={favorites.includes(recipe.id) ? "error" : "default"}
                          >
                            {favorites.includes(recipe.id) ? 
                              <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                        </CardActions>
                      </Box>
                      <CardMedia
                        component="img"
                        sx={{ width: '40%', objectFit: 'cover' }}
                        image={recipe.image}
                        alt={recipe.title}
                      />
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>
      )}
      
      {/* Main Recipe Grid */}
      {loading ? (
        // Loading state with skeletons
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(item => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${item}`}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" height={32} width="80%" />
                  <Skeleton variant="text" height={20} width="40%" />
                  <Box sx={{ mt: 1 }}>
                    <Skeleton variant="rectangular" height={24} width="90%" />
                  </Box>
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" height={30} width={90} />
                  <Skeleton variant="circular" height={30} width={30} sx={{ ml: 1 }} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {filteredRecipes.length === 0 ? (
            // No results state
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}>
              <RestaurantMenuIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                {currentTab === 1 
                  ? "You haven't saved any favorites yet" 
                  : "No recipes match your search"}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={currentTab === 1 ? <MenuBookIcon /> : <CloseIcon />}
                onClick={() => {
                  if (currentTab === 1) {
                    setCurrentTab(0);
                  } else {
                    setSearchTerm('');
                    setSelectedDietType('all');
                  }
                }}
              >
                {currentTab === 1 ? "Browse Recipes" : "Clear Filters"}
              </Button>
            </Box>
          ) : (
            // Results grid with animation
            <AnimatePresence>
              <Grid container spacing={3}>
                {filteredRecipes.map((recipe, index) => (
                  <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card 
                        elevation={3} 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        {/* Favorite button overlay */}
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.9)',
                            },
                            zIndex: 2
                          }}
                          onClick={() => toggleFavorite(recipe.id)}
                          color={favorites.includes(recipe.id) ? "error" : "default"}
                        >
                          {favorites.includes(recipe.id) ? 
                            <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                        
                        <CardMedia
                          component="img"
                          height="180"
                          image={recipe.image}
                          alt={recipe.title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                            {recipe.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                              <Typography variant="body2" color="text.secondary">
                                {recipe.prepTime + recipe.cookTime} min
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocalDiningIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                              <Typography variant="body2" color="text.secondary">
                                {recipe.calories} cal
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                            {recipe.dietTypes.slice(0, 3).map(diet => (
                              <Chip
                                key={diet}
                                label={diet}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                            {recipe.dietTypes.length > 3 && (
                              <Chip
                                label={`+${recipe.dietTypes.length - 3}`}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Rating 
                              value={recipe.rating} 
                              precision={0.1} 
                              size="small" 
                              readOnly 
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              ({recipe.reviewCount})
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            variant="contained" 
                            fullWidth
                            onClick={() => handleOpenRecipeDetails(recipe)}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            View Recipe
                          </Button>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </AnimatePresence>
          )}
        </>
      )}
      
      {/* Recipe Detail Dialog */}
      <Dialog
        open={openRecipeDialog}
        onClose={() => setOpenRecipeDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        {selectedRecipe && (
          <>
            <DialogTitle sx={{ 
              p: 0, 
              position: 'relative',
              height: 240,
              backgroundImage: `url(${selectedRecipe.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1
              }
            }}>
              <Box sx={{ 
                position: 'absolute', 
                bottom: 20, 
                left: 24, 
                zIndex: 2, 
                width: 'calc(100% - 48px)'
              }}>
                <Typography variant="h4" component="h2" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                  {selectedRecipe.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<AccessTimeIcon sx={{ color: 'white !important' }} />} 
                    label={`${selectedRecipe.prepTime + selectedRecipe.cookTime} min`} 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      backdropFilter: 'blur(4px)',
                      '.MuiChip-icon': { color: 'white' }
                    }} 
                  />
                  <Chip 
                    icon={<LocalDiningIcon sx={{ color: 'white !important' }} />} 
                    label={`${selectedRecipe.calories} cal`} 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      backdropFilter: 'blur(4px)'
                    }} 
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                    <IconButton 
                      color="inherit" 
                      onClick={() => toggleFavorite(selectedRecipe.id)}
                      sx={{ color: 'white' }}
                    >
                      {favorites.includes(selectedRecipe.id) ? 
                        <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton color="inherit" sx={{ color: 'white' }}>
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  zIndex: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                  }
                }}
                onClick={() => setOpenRecipeDialog(false)}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Nutrition
                  </Typography>
                  <List disablePadding>
                    <ListItem divider sx={{ py: 1.5 }}>
                      <ListItemText primary="Calories" />
                      <Typography variant="body1" fontWeight={500}>
                        {selectedRecipe.calories} kcal
                      </Typography>
                    </ListItem>
                    <ListItem divider sx={{ py: 1.5 }}>
                      <ListItemText primary="Protein" />
                      <Typography variant="body1" fontWeight={500}>
                        {selectedRecipe.protein}g
                      </Typography>
                    </ListItem>
                    <ListItem divider sx={{ py: 1.5 }}>
                      <ListItemText primary="Carbs" />
                      <Typography variant="body1" fontWeight={500}>
                        {selectedRecipe.carbs}g
                      </Typography>
                    </ListItem>
                    <ListItem sx={{ py: 1.5 }}>
                      <ListItemText primary="Fat" />
                      <Typography variant="body1" fontWeight={500}>
                        {selectedRecipe.fat}g
                      </Typography>
                    </ListItem>
                  </List>
                  
                  <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                    Diet Types
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedRecipe.dietTypes.map(diet => (
                      <Chip
                        key={diet}
                        label={diet}
                        sx={{ margin: 0.5 }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedRecipe.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        variant="outlined"
                        size="small"
                        sx={{ margin: 0.5 }}
                      />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        <KitchenIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Ingredients
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <ListItem key={index} divider={index < selectedRecipe.ingredients.length - 1}>
                            <ListItemIcon>
                              <CheckCircleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={ingredient} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion defaultExpanded sx={{ borderRadius: 1, overflow: 'hidden' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        <RestaurantMenuIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Instructions
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {selectedRecipe.instructions.map((step, index) => (
                          <ListItem key={index} alignItems="flex-start" divider={index < selectedRecipe.instructions.length - 1}>
                            <ListItemIcon sx={{ mt: 0.5 }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: 'primary.main', 
                                  width: 28, 
                                  height: 28, 
                                  fontSize: '0.875rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText primary={step} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button onClick={() => setOpenRecipeDialog(false)}>Close</Button>
              <Button 
                variant="contained"
                startIcon={favorites.includes(selectedRecipe.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                color={favorites.includes(selectedRecipe.id) ? "secondary" : "primary"}
                onClick={() => toggleFavorite(selectedRecipe.id)}
              >
                {favorites.includes(selectedRecipe.id) ? "Saved to Favorites" : "Save to Favorites"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RecipePlannerTab;