// frontend/src/pages/GroceryTab.js
// This file has been updated to include Recipe Planner functionality
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  Switch,
  Tabs,
  Tab,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slider,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  LinearProgress,
  useTheme,
  alpha,
  Avatar,
  Fade,
  Zoom,
  Skeleton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormGroup,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import { FixedSizeGrid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import KitchenIcon from '@mui/icons-material/Kitchen';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
// import EcoIcon from '@mui/icons-material/Eco';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
// import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import CalculateIcon from '@mui/icons-material/Calculate';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReplayIcon from '@mui/icons-material/Replay';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import IcecreamIcon from '@mui/icons-material/Icecream';
import BoltIcon from '@mui/icons-material/Bolt';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ShieldIcon from '@mui/icons-material/Shield';
import SpaIcon from '@mui/icons-material/Spa';
import YardIcon from '@mui/icons-material/Yard';
import GrassIcon from '@mui/icons-material/Grass';
import NoMealsIcon from '@mui/icons-material/NoMeals';
import NoFoodIcon from '@mui/icons-material/NoFood';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import EggAltIcon from '@mui/icons-material/EggAlt';
import MonitorHeightIcon from '@mui/icons-material/Height';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import Rating from '@mui/material/Rating';
import { useAuth } from '../context/AuthContext';
import { useWorkoutPlan } from '../context/WorkoutPlanContext';

// Import our custom meal planning components
import MealPlanQuestionnaire from '../components/MealPlanQuestionnaire';
import MealPlanDisplay from '../components/MealPlanDisplay';
import MealPlanningSection from '../components/MealPlanningSection';

// API integration for dynamic grocery items
// This uses the Spoonacular API to fetch real grocery data
// NOTE: You will need to set up your API key in an environment variable: REACT_APP_SPOONACULAR_API_KEY

// Function to fetch grocery items from Spoonacular API
const fetchGroceryItems = async (filters = {}) => {
  try {
    // Get API key from environment variables
    const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY || "YOUR_API_KEY_HERE"; // Replace with your API key if not using env vars
    
    // Construct the API URL with query parameters
    let url = `https://api.spoonacular.com/food/products/search?apiKey=${API_KEY}&number=25`;
    
    // Add filters if provided
    if (filters.query) url += `&query=${encodeURIComponent(filters.query)}`;
    if (filters.diet) url += `&diet=${encodeURIComponent(filters.diet)}`;
    if (filters.intolerances) url += `&intolerances=${encodeURIComponent(filters.intolerances)}`;
    if (filters.sortDirection) url += `&sortDirection=${filters.sortDirection}`;
    
    console.log("Fetching grocery items from API...");
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Get detailed information for each product
    const itemsWithDetails = await Promise.all(
      data.products.map(async (product) => {
        try {
          // For each product ID, fetch detailed information
          const detailUrl = `https://api.spoonacular.com/food/products/${product.id}?apiKey=${API_KEY}`;
          const detailResponse = await fetch(detailUrl);
          
          if (!detailResponse.ok) {
            throw new Error(`Product detail request failed for ID ${product.id}`);
          }
          
          const productDetails = await detailResponse.json();
          
          // Transform the API data to match our application's grocery item format
          return {
            id: product.id,
            name: product.title,
            category: productDetails.aisle || "General",
            price: ((Math.random() * 10) + 1).toFixed(2), // Spoonacular doesn't provide price, so generate random price
            unit: "item",
            nutrition: {
              calories: productDetails.nutrition?.calories || 0,
              protein: productDetails.nutrition?.protein || 0,
              carbs: productDetails.nutrition?.carbs || 0,
              fat: productDetails.nutrition?.fat || 0,
              fiber: productDetails.nutrition?.fiber || 0
            },
            dietTypes: productDetails.diets || [],
            isOrganic: product.title.toLowerCase().includes("organic"),
            storeSections: [productDetails.aisle || "General"],
            storeLocations: [
              { store: "Local Grocery", aisle: productDetails.aisle || "General", section: "General" }
            ],
            image: product.image || "https://via.placeholder.com/300?text=Food+Item"
          };
        } catch (error) {
          console.error(`Error fetching details for product ${product.id}:`, error);
          // Return a basic version if detail fetch fails
          return {
            id: product.id,
            name: product.title,
            category: "General",
            price: ((Math.random() * 10) + 1).toFixed(2),
            unit: "item",
            nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
            dietTypes: [],
            isOrganic: product.title.toLowerCase().includes("organic"),
            storeSections: ["General"],
            storeLocations: [{ store: "Local Grocery", aisle: "General", section: "General" }],
            image: product.image || "https://via.placeholder.com/300?text=Food+Item"
          };
        }
      })
    );
    
    return itemsWithDetails;
  } catch (error) {
    console.error("Error fetching grocery items:", error);
    // Fall back to mock data if API fails
    console.warn("Falling back to mock data due to API error");
    return mockGroceryItems;
  }
};

// Fallback mock data in case API fails or for development without API key
const mockGroceryItems = [
  {
    id: 1,
    name: "Organic Chicken Breast",
    category: "Protein",
    price: 7.99,
    unit: "lb",
    nutrition: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0
    },
    dietTypes: ["Keto", "Paleo", "High-Protein"],
    isOrganic: true,
    storeSections: ["Meat", "Refrigerated"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Meat Counter", section: "Fresh Poultry" },
      { store: "Trader Joe's", aisle: "5", section: "Refrigerated Meats" }
    ],
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 16,
    name: "Strawberries, Organic",
    category: "Produce",
    price: 4.99,
    unit: "16oz",
    nutrition: {
      calories: 53,
      protein: 1.1,
      carbs: 12.7,
      fat: 0.5,
      fiber: 3.3
    },
    dietTypes: ["Vegan", "Paleo", "Low-Fat", "Gluten-Free"],
    isOrganic: true,
    storeSections: ["Produce"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Produce", section: "Berries" },
      { store: "Trader Joe's", aisle: "Produce", section: "Fresh Fruits" }
    ],
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    name: "Greek Yogurt, Plain",
    category: "Dairy",
    price: 4.99,
    unit: "32oz",
    nutrition: {
      calories: 100,
      protein: 18,
      carbs: 6,
      fat: 0,
      fiber: 0
    },
    dietTypes: ["Keto", "High-Protein", "Mediterranean"],
    isOrganic: false,
    storeSections: ["Dairy", "Refrigerated"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Dairy", section: "Yogurt" },
      { store: "Safeway", aisle: "2", section: "Dairy" }
    ],
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    name: "Quinoa",
    category: "Grains",
    price: 6.49,
    unit: "16oz",
    nutrition: {
      calories: 222,
      protein: 8,
      carbs: 39,
      fat: 4,
      fiber: 5
    },
    dietTypes: ["Vegetarian", "Vegan", "Gluten-Free"],
    isOrganic: true,
    storeSections: ["Dry Goods", "Grains"],
    storeLocations: [
      { store: "Whole Foods", aisle: "7", section: "Grains & Rice" },
      { store: "Trader Joe's", aisle: "2", section: "Dry Goods" }
    ],
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 4,
    name: "Avocado",
    category: "Produce",
    price: 1.49,
    unit: "each",
    nutrition: {
      calories: 240,
      protein: 3,
      carbs: 12,
      fat: 22,
      fiber: 10
    },
    dietTypes: ["Keto", "Paleo", "Vegan"],
    isOrganic: true,
    storeSections: ["Produce"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Produce", section: "Tropical Fruits" },
      { store: "Trader Joe's", aisle: "Produce", section: "Fresh Fruits" }
    ],
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 5,
    name: "Almond Milk, Unsweetened",
    category: "Dairy Alternative",
    price: 3.99,
    unit: "64oz",
    nutrition: {
      calories: 30,
      protein: 1,
      carbs: 1,
      fat: 2.5,
      fiber: 0
    },
    dietTypes: ["Vegan", "Dairy-Free", "Keto"],
    isOrganic: false,
    storeSections: ["Dairy", "Refrigerated"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Dairy", section: "Alternative Milks" },
      { store: "Safeway", aisle: "2", section: "Dairy Alternatives" }
    ],
    image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 6,
    name: "Sweet Potatoes",
    category: "Produce",
    price: 1.99,
    unit: "lb",
    nutrition: {
      calories: 100,
      protein: 2,
      carbs: 24,
      fat: 0,
      fiber: 4
    },
    dietTypes: ["Paleo", "Whole30", "Vegan"],
    isOrganic: true,
    storeSections: ["Produce"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Produce", section: "Root Vegetables" },
      { store: "Trader Joe's", aisle: "Produce", section: "Potatoes" }
    ],
    image: "https://images.unsplash.com/photo-1596097095887-e58f4f348b6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 7,
    name: "Salmon Fillet",
    category: "Protein",
    price: 12.99,
    unit: "lb",
    nutrition: {
      calories: 208,
      protein: 22,
      carbs: 0,
      fat: 13,
      fiber: 0
    },
    dietTypes: ["Keto", "Paleo", "Mediterranean"],
    isOrganic: false,
    storeSections: ["Seafood", "Refrigerated"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Seafood Counter", section: "Fresh Fish" },
      { store: "Safeway", aisle: "Seafood", section: "Fresh Fish" }
    ],
    image: "https://images.unsplash.com/photo-1559848082-9da1a4ea4515?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 8,
    name: "Broccoli",
    category: "Produce",
    price: 2.49,
    unit: "lb",
    nutrition: {
      calories: 55,
      protein: 3.7,
      carbs: 11.2,
      fat: 0.6,
      fiber: 5
    },
    dietTypes: ["Keto", "Paleo", "Vegan", "Low-Carb"],
    isOrganic: true,
    storeSections: ["Produce"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Produce", section: "Vegetables" },
      { store: "Trader Joe's", aisle: "Produce", section: "Fresh Vegetables" }
    ],
    image: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 9,
    name: "Extra Virgin Olive Oil",
    category: "Oils & Vinegars",
    price: 12.99,
    unit: "16.9oz",
    nutrition: {
      calories: 120,
      protein: 0,
      carbs: 0,
      fat: 14,
      fiber: 0
    },
    dietTypes: ["Keto", "Paleo", "Mediterranean", "Whole30"],
    isOrganic: true,
    storeSections: ["Pantry", "Oils & Vinegars"],
    storeLocations: [
      { store: "Whole Foods", aisle: "4", section: "Oils & Vinegars" },
      { store: "Trader Joe's", aisle: "3", section: "Oils" }
    ],
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 10,
    name: "Blueberries",
    category: "Produce",
    price: 4.99,
    unit: "pint",
    nutrition: {
      calories: 84,
      protein: 1.1,
      carbs: 21,
      fat: 0.5,
      fiber: 3.6
    },
    dietTypes: ["Paleo", "Vegan", "Low-Fat"],
    isOrganic: true,
    storeSections: ["Produce"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Produce", section: "Berries" },
      { store: "Trader Joe's", aisle: "Produce", section: "Fresh Fruits" }
    ],
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 11,
    name: "Almonds, Raw",
    category: "Nuts & Seeds",
    price: 7.99,
    unit: "16oz",
    nutrition: {
      calories: 164,
      protein: 6,
      carbs: 6,
      fat: 14,
      fiber: 3.5
    },
    dietTypes: ["Keto", "Paleo", "Vegan", "Gluten-Free"],
    isOrganic: true,
    storeSections: ["Nuts & Seeds", "Snacks"],
    storeLocations: [
      { store: "Whole Foods", aisle: "5", section: "Nuts & Seeds" },
      { store: "Trader Joe's", aisle: "2", section: "Dry Goods" }
    ],
    image: "https://images.unsplash.com/photo-1536816579748-4ecb3f03d72a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 12,
    name: "Brown Rice",
    category: "Grains",
    price: 3.49,
    unit: "32oz",
    nutrition: {
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      fiber: 3.5
    },
    dietTypes: ["Vegetarian", "Vegan", "Gluten-Free"],
    isOrganic: true,
    storeSections: ["Dry Goods", "Grains"],
    storeLocations: [
      { store: "Whole Foods", aisle: "7", section: "Grains & Rice" },
      { store: "Safeway", aisle: "5", section: "Rice & Grains" }
    ],
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 13,
    name: "Spinach, Baby",
    category: "Produce",
    price: 3.99,
    unit: "5oz",
    nutrition: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2
    },
    dietTypes: ["Keto", "Paleo", "Vegan", "Low-Carb"],
    isOrganic: true,
    storeSections: ["Produce"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Produce", section: "Leafy Greens" },
      { store: "Trader Joe's", aisle: "Produce", section: "Packaged Greens" }
    ],
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 14,
    name: "Eggs, Large, Organic",
    category: "Dairy",
    price: 5.99,
    unit: "dozen",
    nutrition: {
      calories: 70,
      protein: 6,
      carbs: 0,
      fat: 5,
      fiber: 0
    },
    dietTypes: ["Keto", "Paleo", "Vegetarian", "High-Protein"],
    isOrganic: true,
    storeSections: ["Dairy", "Refrigerated"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Dairy", section: "Eggs" },
      { store: "Safeway", aisle: "2", section: "Dairy & Eggs" }
    ],
    image: "https://images.unsplash.com/photo-1551791872-0fcfd014ef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 15,
    name: "Chia Seeds",
    category: "Nuts & Seeds",
    price: 6.99,
    unit: "12oz",
    nutrition: {
      calories: 138,
      protein: 4.7,
      carbs: 12,
      fat: 8.7,
      fiber: 9.8
    },
    dietTypes: ["Vegan", "Gluten-Free", "Keto", "Paleo"],
    isOrganic: true,
    storeSections: ["Nuts & Seeds", "Health Foods"],
    storeLocations: [
      { store: "Whole Foods", aisle: "5", section: "Nuts & Seeds" },
      { store: "Trader Joe's", aisle: "2", section: "Dry Goods" }
    ],
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 17,
    name: "Bananas",
    category: "Produce",
    price: 0.59,
    unit: "lb",
    nutrition: {
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1
    },
    dietTypes: ["Vegan", "Low-Fat", "Gluten-Free"],
    isOrganic: false,
    storeSections: ["Produce"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Produce", section: "Fruits" },
      { store: "Trader Joe's", aisle: "Produce", section: "Fresh Fruits" }
    ],
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 18,
    name: "Ground Turkey",
    category: "Protein",
    price: 5.99,
    unit: "lb",
    nutrition: {
      calories: 170,
      protein: 22,
      carbs: 0,
      fat: 9,
      fiber: 0
    },
    dietTypes: ["Paleo", "High-Protein", "Low-Carb"],
    isOrganic: false,
    storeSections: ["Meat", "Refrigerated"],
    storeLocations: [
      { store: "Whole Foods", aisle: "Meat Counter", section: "Poultry" },
      { store: "Safeway", aisle: "Meat", section: "Ground Meats" }
    ],
    image: "https://images.unsplash.com/photo-1642067599447-8a2ec8c2543a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  }
];

// Mock meal plans that would come from the Fitness tab
const mockMealPlans = [
  {
    id: 1,
    name: "High-Protein Weight Loss Plan",
    description: "Focuses on lean proteins and moderate carbs to support weight loss while preserving muscle mass.",
    dietType: "High-Protein",
    totalCalories: 1800,
    macros: { protein: "40%", carbs: "30%", fat: "30%" },
    ingredients: [
      { itemId: 1, name: "Organic Chicken Breast", quantity: 2, unit: "lb" },
      { itemId: 2, name: "Greek Yogurt, Plain", quantity: 1, unit: "32oz" },
      { itemId: 3, name: "Quinoa", quantity: 1, unit: "16oz" },
      { itemId: 8, name: "Broccoli", quantity: 2, unit: "lb" },
      { itemId: 9, name: "Extra Virgin Olive Oil", quantity: 1, unit: "16.9oz" },
      { itemId: 10, name: "Blueberries", quantity: 2, unit: "pint" },
      { itemId: 13, name: "Spinach, Baby", quantity: 2, unit: "5oz" },
      { itemId: 14, name: "Eggs, Large, Organic", quantity: 1, unit: "dozen" },
      { itemId: 16, name: "Strawberries, Organic", quantity: 1, unit: "16oz" },
    ]
  },
  {
    id: 2,
    name: "Mediterranean Diet Plan",
    description: "Based on traditional foods of countries bordering the Mediterranean Sea, rich in healthy fats, whole grains, and vegetables.",
    dietType: "Mediterranean",
    totalCalories: 2000,
    macros: { protein: "20%", carbs: "50%", fat: "30%" },
    ingredients: [
      { itemId: 7, name: "Salmon Fillet", quantity: 1.5, unit: "lb" },
      { itemId: 3, name: "Quinoa", quantity: 1, unit: "16oz" },
      { itemId: 4, name: "Avocado", quantity: 3, unit: "each" },
      { itemId: 9, name: "Extra Virgin Olive Oil", quantity: 1, unit: "16.9oz" },
      { itemId: 8, name: "Broccoli", quantity: 1, unit: "lb" },
      { itemId: 11, name: "Almonds, Raw", quantity: 1, unit: "16oz" },
      { itemId: 13, name: "Spinach, Baby", quantity: 2, unit: "5oz" },
      { itemId: 15, name: "Chia Seeds", quantity: 1, unit: "12oz" },
      { itemId: 12, name: "Brown Rice", quantity: 2, unit: "32oz" },
    ]
  },
  {
    id: 3,
    name: "Keto Meal Plan",
    description: "Very low in carbohydrates and high in fats to help your body enter a state of ketosis.",
    dietType: "Keto",
    totalCalories: 1700,
    macros: { protein: "25%", carbs: "5%", fat: "70%" },
    ingredients: [
      { itemId: 1, name: "Organic Chicken Breast", quantity: 1, unit: "lb" },
      { itemId: 4, name: "Avocado", quantity: 5, unit: "each" },
      { itemId: 5, name: "Almond Milk, Unsweetened", quantity: 1, unit: "64oz" },
      { itemId: 7, name: "Salmon Fillet", quantity: 1, unit: "lb" },
      { itemId: 8, name: "Broccoli", quantity: 2, unit: "lb" },
      { itemId: 9, name: "Extra Virgin Olive Oil", quantity: 1, unit: "16.9oz" },
      { itemId: 11, name: "Almonds, Raw", quantity: 1, unit: "16oz" },
      { itemId: 13, name: "Spinach, Baby", quantity: 3, unit: "5oz" },
      { itemId: 14, name: "Eggs, Large, Organic", quantity: 2, unit: "dozen" },
    ]
  },
  {
    id: 4,
    name: "Plant-Based Vegan Plan",
    description: "Nutrient-rich diet focusing on plant foods that provide complete nutrition without animal products.",
    dietType: "Vegan",
    totalCalories: 1900,
    macros: { protein: "20%", carbs: "60%", fat: "20%" },
    ingredients: [
      { itemId: 3, name: "Quinoa", quantity: 2, unit: "16oz" },
      { itemId: 4, name: "Avocado", quantity: 4, unit: "each" },
      { itemId: 5, name: "Almond Milk, Unsweetened", quantity: 2, unit: "64oz" },
      { itemId: 6, name: "Sweet Potatoes", quantity: 3, unit: "lb" },
      { itemId: 8, name: "Broccoli", quantity: 2, unit: "lb" },
      { itemId: 9, name: "Extra Virgin Olive Oil", quantity: 1, unit: "16.9oz" },
      { itemId: 10, name: "Blueberries", quantity: 2, unit: "pint" },
      { itemId: 11, name: "Almonds, Raw", quantity: 2, unit: "16oz" },
      { itemId: 12, name: "Brown Rice", quantity: 1, unit: "32oz" },
      { itemId: 13, name: "Spinach, Baby", quantity: 3, unit: "5oz" },
      { itemId: 15, name: "Chia Seeds", quantity: 1, unit: "12oz" },
      { itemId: 16, name: "Strawberries, Organic", quantity: 2, unit: "16oz" },
      { itemId: 17, name: "Bananas", quantity: 2, unit: "lb" },
    ]
  },
  {
    id: 5,
    name: "DASH Diet Heart Health Plan",
    description: "Dietary Approaches to Stop Hypertension (DASH) helps lower blood pressure and improves heart health.",
    dietType: "Heart-Healthy",
    totalCalories: 2000,
    macros: { protein: "18%", carbs: "55%", fat: "27%" },
    ingredients: [
      { itemId: 2, name: "Greek Yogurt, Plain", quantity: 1, unit: "32oz" },
      { itemId: 3, name: "Quinoa", quantity: 1, unit: "16oz" },
      { itemId: 6, name: "Sweet Potatoes", quantity: 2, unit: "lb" },
      { itemId: 7, name: "Salmon Fillet", quantity: 1, unit: "lb" },
      { itemId: 8, name: "Broccoli", quantity: 2, unit: "lb" },
      { itemId: 9, name: "Extra Virgin Olive Oil", quantity: 1, unit: "16.9oz" },
      { itemId: 10, name: "Blueberries", quantity: 3, unit: "pint" },
      { itemId: 12, name: "Brown Rice", quantity: 1, unit: "32oz" },
      { itemId: 13, name: "Spinach, Baby", quantity: 2, unit: "5oz" },
      { itemId: 14, name: "Eggs, Large, Organic", quantity: 1, unit: "dozen" },
      { itemId: 17, name: "Bananas", quantity: 2, unit: "lb" },
    ]
  },
  {
    id: 6,
    name: "Gluten-Free Performance Plan",
    description: "Designed for active individuals with gluten sensitivity, focusing on energy-sustaining foods without gluten.",
    dietType: "Gluten-Free",
    totalCalories: 2200,
    macros: { protein: "30%", carbs: "45%", fat: "25%" },
    ingredients: [
      { itemId: 1, name: "Organic Chicken Breast", quantity: 2, unit: "lb" },
      { itemId: 2, name: "Greek Yogurt, Plain", quantity: 2, unit: "32oz" },
      { itemId: 3, name: "Quinoa", quantity: 2, unit: "16oz" },
      { itemId: 4, name: "Avocado", quantity: 3, unit: "each" },
      { itemId: 5, name: "Almond Milk, Unsweetened", quantity: 1, unit: "64oz" },
      { itemId: 6, name: "Sweet Potatoes", quantity: 3, unit: "lb" },
      { itemId: 7, name: "Salmon Fillet", quantity: 1, unit: "lb" },
      { itemId: 8, name: "Broccoli", quantity: 2, unit: "lb" },
      { itemId: 9, name: "Extra Virgin Olive Oil", quantity: 1, unit: "16.9oz" },
      { itemId: 10, name: "Blueberries", quantity: 2, unit: "pint" },
      { itemId: 11, name: "Almonds, Raw", quantity: 1, unit: "16oz" },
      { itemId: 13, name: "Spinach, Baby", quantity: 3, unit: "5oz" },
      { itemId: 14, name: "Eggs, Large, Organic", quantity: 2, unit: "dozen" },
      { itemId: 16, name: "Strawberries, Organic", quantity: 1, unit: "16oz" },
    ]
  },
  {
    id: 7,
    name: "Low-FODMAP Digestive Health Plan",
    description: "Developed for those with IBS or digestive sensitivities, reducing fermentable carbohydrates that can trigger symptoms.",
    dietType: "Low-FODMAP",
    totalCalories: 1900,
    macros: { protein: "25%", carbs: "40%", fat: "35%" },
    ingredients: [
      { itemId: 1, name: "Organic Chicken Breast", quantity: 2, unit: "lb" },
      { itemId: 3, name: "Quinoa", quantity: 1, unit: "16oz" },
      { itemId: 7, name: "Salmon Fillet", quantity: 1, unit: "lb" },
      { itemId: 8, name: "Broccoli", quantity: 1, unit: "lb" },
      { itemId: 9, name: "Extra Virgin Olive Oil", quantity: 1, unit: "16.9oz" },
      { itemId: 12, name: "Brown Rice", quantity: 2, unit: "32oz" },
      { itemId: 13, name: "Spinach, Baby", quantity: 3, unit: "5oz" },
      { itemId: 14, name: "Eggs, Large, Organic", quantity: 2, unit: "dozen" },
      { itemId: 16, name: "Strawberries, Organic", quantity: 2, unit: "16oz" },
    ]
  },
  {
    id: 8,
    name: "Paleo Ancestral Diet Plan",
    description: "Based on foods presumed to be available to paleolithic humans, focusing on whole foods and avoiding processed items.",
    dietType: "Paleo",
    totalCalories: 2100,
    macros: { protein: "30%", carbs: "25%", fat: "45%" },
    ingredients: [
      { itemId: 1, name: "Organic Chicken Breast", quantity: 2, unit: "lb" },
      { itemId: 4, name: "Avocado", quantity: 4, unit: "each" },
      { itemId: 6, name: "Sweet Potatoes", quantity: 3, unit: "lb" },
      { itemId: 7, name: "Salmon Fillet", quantity: 1.5, unit: "lb" },
      { itemId: 8, name: "Broccoli", quantity: 2, unit: "lb" },
      { itemId: 9, name: "Extra Virgin Olive Oil", quantity: 1, unit: "16.9oz" },
      { itemId: 10, name: "Blueberries", quantity: 2, unit: "pint" },
      { itemId: 11, name: "Almonds, Raw", quantity: 1, unit: "16oz" },
      { itemId: 13, name: "Spinach, Baby", quantity: 3, unit: "5oz" },
      { itemId: 14, name: "Eggs, Large, Organic", quantity: 2, unit: "dozen" },
      { itemId: 16, name: "Strawberries, Organic", quantity: 1, unit: "16oz" },
      { itemId: 18, name: "Ground Turkey", quantity: 2, unit: "lb" },
    ]
  }
];

// Store database - would be replaced with real API data in production
// This is a more extensive collection of grocery stores across the US
const storeDatabase = [
  // National chains that exist in most cities
  { id: 1, name: "Whole Foods Market", chain: "Whole Foods", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Trader Joe's", chain: "Trader Joe's", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Kroger", chain: "Kroger", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Safeway", chain: "Safeway", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Target", chain: "Target", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 6, name: "Walmart Supercenter", chain: "Walmart", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 7, name: "Costco", chain: "Costco", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 8, name: "Publix", chain: "Publix", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 9, name: "Albertsons", chain: "Albertsons", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  { id: 10, name: "Sprouts Farmers Market", chain: "Sprouts", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  
  // Regional chains (Midwest)
  { id: 11, name: "Lunds & Byerlys", chain: "Lunds & Byerlys", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "Midwest" },
  { id: 12, name: "Kowalski's Market", chain: "Kowalski's", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "Midwest" },
  { id: 13, name: "Cub Foods", chain: "Cub Foods", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "Midwest" },
  { id: 14, name: "Meijer", chain: "Meijer", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "Midwest" },
  { id: 15, name: "Festival Foods", chain: "Festival Foods", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "Midwest" },
  
  // Regional chains (East Coast)
  { id: 16, name: "Stop & Shop", chain: "Stop & Shop", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "East" },
  { id: 17, name: "Fairway Market", chain: "Fairway", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "East" },
  { id: 18, name: "Wegmans", chain: "Wegmans", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "East" },
  { id: 19, name: "Giant Food", chain: "Giant", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "East" },
  { id: 20, name: "ShopRite", chain: "ShopRite", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "East" },
  
  // Regional chains (West Coast)
  { id: 21, name: "Gelson's", chain: "Gelson's", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "West" },
  { id: 22, name: "Raley's", chain: "Raley's", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "West" },
  { id: 23, name: "Vons", chain: "Vons", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "West" },
  { id: 24, name: "Fred Meyer", chain: "Fred Meyer", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "West" },
  { id: 25, name: "QFC", chain: "QFC", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "West" },
  
  // Regional chains (South)
  { id: 26, name: "H-E-B", chain: "H-E-B", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "South" },
  { id: 27, name: "Winn-Dixie", chain: "Winn-Dixie", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "South" },
  { id: 28, name: "Food Lion", chain: "Food Lion", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "South" },
  { id: 29, name: "Harris Teeter", chain: "Harris Teeter", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "South" },
  { id: 30, name: "Piggly Wiggly", chain: "Piggly Wiggly", deliveryAvailable: true, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", region: "South" }
];

// Default to a mix of national chains as initial data
const mockStores = storeDatabase.slice(0, 5);

// Mock data for stores by region
const mockStoresByRegion = {
  MN: [
    { id: 11, name: "Lunds & Byerlys - Minneapolis", chain: "Lunds & Byerlys", address: "1450 W Lake St, Minneapolis, MN 55408", distance: 1.2, coordinates: { lat: 44.9521, lng: -93.2985 }, deliveryAvailable: true, rating: 4.7, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 13, name: "Cub Foods - Uptown", chain: "Cub Foods", address: "1104 Lagoon Ave, Minneapolis, MN 55408", distance: 1.8, coordinates: { lat: 44.9521, lng: -93.2907 }, deliveryAvailable: true, rating: 4.2, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 1, name: "Whole Foods Market - Minneapolis", chain: "Whole Foods", address: "222 Hennepin Ave, Minneapolis, MN 55401", distance: 2.5, coordinates: { lat: 44.9865, lng: -93.2706 }, deliveryAvailable: true, rating: 4.6, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 12, name: "Kowalski's Market - Uptown", chain: "Kowalski's", address: "2440 Hennepin Ave, Minneapolis, MN 55405", distance: 2.7, coordinates: { lat: 44.9581, lng: -93.2896 }, deliveryAvailable: true, rating: 4.8, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Trader Joe's - Downtown", chain: "Trader Joe's", address: "721 Washington Ave S, Minneapolis, MN 55415", distance: 3.2, coordinates: { lat: 44.9764, lng: -93.2568 }, deliveryAvailable: true, rating: 4.5, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "Target - Nicollet Mall", chain: "Target", address: "900 Nicollet Mall, Minneapolis, MN 55403", distance: 3.5, coordinates: { lat: 44.9737, lng: -93.2751 }, deliveryAvailable: true, rating: 4.3, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 15, name: "Festival Foods - Minneapolis", chain: "Festival Foods", address: "4500 Central Ave NE, Minneapolis, MN 55421", distance: 5.8, coordinates: { lat: 45.0462, lng: -93.2393 }, deliveryAvailable: true, rating: 4.4, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" }
  ],
  CA: [
    { id: 21, name: "Gelson's - Hollywood", chain: "Gelson's", address: "5877 Franklin Ave, Los Angeles, CA 90028", distance: 1.4, coordinates: { lat: 34.1050, lng: -118.3168 }, deliveryAvailable: true, rating: 4.7, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 1, name: "Whole Foods Market - DTLA", chain: "Whole Foods", address: "788 S Grand Ave, Los Angeles, CA 90017", distance: 2.1, coordinates: { lat: 34.0467, lng: -118.2565 }, deliveryAvailable: true, rating: 4.6, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Trader Joe's - Hollywood", chain: "Trader Joe's", address: "1600 Vine St, Los Angeles, CA 90028", distance: 2.3, coordinates: { lat: 34.1012, lng: -118.3265 }, deliveryAvailable: true, rating: 4.5, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 23, name: "Vons - Sunset", chain: "Vons", address: "1342 Sunset Blvd, Los Angeles, CA 90026", distance: 2.8, coordinates: { lat: 34.0765, lng: -118.2605 }, deliveryAvailable: true, rating: 4.1, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 10, name: "Sprouts Farmers Market - Hollywood", chain: "Sprouts", address: "5660 Sunset Blvd, Los Angeles, CA 90028", distance: 3.2, coordinates: { lat: 34.0981, lng: -118.3121 }, deliveryAvailable: true, rating: 4.4, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 22, name: "Raley's - Los Feliz", chain: "Raley's", address: "1800 N Vermont Ave, Los Angeles, CA 90027", distance: 3.7, coordinates: { lat: 34.1046, lng: -118.2919 }, deliveryAvailable: true, rating: 4.3, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" }
  ],
  NY: [
    { id: 1, name: "Whole Foods Market - Columbus Circle", chain: "Whole Foods", address: "10 Columbus Circle, New York, NY 10019", distance: 1.3, coordinates: { lat: 40.7686, lng: -73.9832 }, deliveryAvailable: true, rating: 4.6, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 17, name: "Fairway Market - Upper West Side", chain: "Fairway", address: "2131 Broadway, New York, NY 10023", distance: 1.9, coordinates: { lat: 40.7829, lng: -73.9809 }, deliveryAvailable: true, rating: 4.5, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Trader Joe's - Union Square", chain: "Trader Joe's", address: "142 E 14th St, New York, NY 10003", distance: 2.4, coordinates: { lat: 40.7344, lng: -73.9877 }, deliveryAvailable: true, rating: 4.4, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 20, name: "ShopRite - Chelsea", chain: "ShopRite", address: "401 W 42nd St, New York, NY 10036", distance: 2.7, coordinates: { lat: 40.7592, lng: -73.9933 }, deliveryAvailable: true, rating: 4.2, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 18, name: "Wegmans - Brooklyn Navy Yard", chain: "Wegmans", address: "21 Flushing Ave, Brooklyn, NY 11201", distance: 4.6, coordinates: { lat: 40.7009, lng: -73.9715 }, deliveryAvailable: true, rating: 4.8, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 5, name: "Target - Midtown", chain: "Target", address: "112 W 34th St, New York, NY 10120", distance: 2.9, coordinates: { lat: 40.7509, lng: -73.9886 }, deliveryAvailable: true, rating: 4.1, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" }
  ],
  TX: [
    { id: 26, name: "H-E-B - South Congress", chain: "H-E-B", address: "1000 E 41st St, Austin, TX 78751", distance: 1.6, coordinates: { lat: 30.3004, lng: -97.7145 }, deliveryAvailable: true, rating: 4.8, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 1, name: "Whole Foods Market - Downtown", chain: "Whole Foods", address: "525 N Lamar Blvd, Austin, TX 78703", distance: 2.2, coordinates: { lat: 30.2723, lng: -97.7533 }, deliveryAvailable: true, rating: 4.7, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 29, name: "Central Market - North Lamar", chain: "Central Market", address: "4001 N Lamar Blvd, Austin, TX 78756", distance: 2.8, coordinates: { lat: 30.3080, lng: -97.7404 }, deliveryAvailable: true, rating: 4.9, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Trader Joe's - Downtown", chain: "Trader Joe's", address: "211 Walter Seaholm Dr, Austin, TX 78701", distance: 3.1, coordinates: { lat: 30.2658, lng: -97.7533 }, deliveryAvailable: true, rating: 4.4, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 10, name: "Sprouts Farmers Market - Lamar", chain: "Sprouts", address: "4006 S Lamar Blvd, Austin, TX 78704", distance: 3.5, coordinates: { lat: 30.2392, lng: -97.7935 }, deliveryAvailable: true, rating: 4.3, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 5, name: "Target - Tech Ridge", chain: "Target", address: "12901 N I-35, Austin, TX 78753", distance: 7.2, coordinates: { lat: 30.4069, lng: -97.6758 }, deliveryAvailable: true, rating: 4.2, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" }
  ]
};

// Helper function for random delivery time
const randomDeliveryTime = () => {
  const baseMinutes = Math.floor(Math.random() * 20) + 25; // 25-45 minutes base
  const rangeMinutes = Math.floor(Math.random() * 15) + 5; // 5-20 minute range
  return `${baseMinutes}-${baseMinutes + rangeMinutes} min`;
};

// Forward declaration to avoid "not defined" error
let findNearbyGroceryStores;

// This function is now replaced by findNearbyGroceryStores which uses Google Places API
// Keeping for backward compatibility with existing code
const findNearbyStores = async (lat, lng) => {
  try {
    console.log(`Finding nearby stores for coordinates: ${lat}, ${lng} using updated method...`);
    return await findNearbyGroceryStores(lat, lng);
  } catch (error) {
    console.error('Error in legacy findNearbyStores:', error);
    return generateFallbackStores(); // Return fallback stores
  }
};

// Generate fallback stores for error cases
const generateFallbackStores = () => {
  const defaultStores = storeDatabase.slice(0, 5);
  return defaultStores.map(store => ({
    ...store,
    address: "123 Main St, Minneapolis, MN 55401",
    distance: (Math.random() * 5 + 0.5).toFixed(1)
  }));
};

// Recipe suggestions based on ingredients
const mockRecipes = [
  {
    id: 1,
    name: "Mediterranean Quinoa Bowl",
    description: "Protein-packed quinoa bowl with roasted vegetables, feta cheese, and a lemon-herb dressing.",
    ingredients: ["Quinoa", "Broccoli", "Extra Virgin Olive Oil", "Spinach, Baby"],
    preparationTime: "25 minutes",
    calories: 420,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    dietTypes: ["Mediterranean", "Vegetarian"]
  },
  {
    id: 2,
    name: "Keto Avocado & Egg Breakfast",
    description: "Simple and satisfying keto breakfast with baked eggs in avocado halves.",
    ingredients: ["Avocado", "Eggs, Large, Organic", "Extra Virgin Olive Oil"],
    preparationTime: "15 minutes",
    calories: 350,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    dietTypes: ["Keto", "Low-Carb"]
  },
  {
    id: 3,
    name: "Berry Greek Yogurt Parfait",
    description: "Layered parfait with Greek yogurt, fresh berries, and crunchy granola or nuts.",
    ingredients: ["Greek Yogurt, Plain", "Blueberries", "Almonds, Raw", "Chia Seeds"],
    preparationTime: "10 minutes",
    calories: 300,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    dietTypes: ["High-Protein", "Vegetarian"]
  },
  {
    id: 4,
    name: "Baked Salmon with Sweet Potatoes",
    description: "Herb-crusted salmon fillets with roasted sweet potatoes and steamed broccoli.",
    ingredients: ["Salmon Fillet", "Sweet Potatoes", "Broccoli", "Extra Virgin Olive Oil"],
    preparationTime: "35 minutes",
    calories: 520,
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    dietTypes: ["Paleo", "Mediterranean"]
  }
];

// Optimized helper component for the grocery item card
const GroceryItemCard = React.memo(({ item, onAdd, isAdded, cartQuantity = 0 }) => {
  const theme = useTheme();
  const [quantity, setQuantity] = useState(cartQuantity || 1);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);
  
  // Use a ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Lazy load images when they come into view
  useEffect(() => {
    // Only load images if specifically requested
    if (showImage) {
      const img = new Image();
      img.src = item.image;
      img.onload = () => {
        if (isMounted.current) {
          setImageLoaded(true);
        }
      };
      img.onerror = () => {
        if (isMounted.current) {
          setImageLoaded(false);
        }
      };
    }
  }, [item.image, showImage]);
  
  // Memoize handlers to prevent unnecessary re-renders
  const handleAdd = useCallback(() => {
    onAdd(item, quantity);
  }, [item, quantity, onAdd]);
  
  const incrementQuantity = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);
  
  const decrementQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }, [quantity]);
  
  const toggleFavorite = useCallback(() => {
    setIsFavorite(prev => !prev);
  }, []);
  
  // Toggle image loading for performance
  const handleCardMouseEnter = useCallback(() => {
    setShowImage(true);
  }, []);
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)'
        }
      }}
      onMouseEnter={handleCardMouseEnter}
    >
      <Box 
        sx={{ 
          position: 'relative', 
          paddingTop: '60%', 
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          backgroundImage: (showImage && imageLoaded) ? `url(${item.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Show item name as text placeholder instead of loading image for better performance */}
        {(!showImage || !imageLoaded) && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {item.name}
            </Typography>
          </Box>
        )}
        
        {/* Favorite button only shown on hover to improve performance */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            m: 1,
            opacity: 0,
            transition: 'opacity 0.2s ease',
            '.MuiCard-root:hover &': {
              opacity: 1
            }
          }}
        >
          <IconButton 
            size="small"
            onClick={toggleFavorite}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
            }}
          >
            {isFavorite 
              ? <FavoriteIcon color="error" /> 
              : <FavoriteBorderIcon />
            }
          </IconButton>
        </Box>
        
        {item.isOrganic && (
          <Chip 
            icon={<LocalOfferIcon />} 
            label="Organic" 
            size="small" 
            color="success"
            sx={{ 
              position: 'absolute', 
              bottom: 8, 
              left: 8,
              fontWeight: 'medium'
            }} 
          />
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" component="h3" fontWeight="medium">
            {item.name}
          </Typography>
          <Typography variant="subtitle1" component="span" fontWeight="bold" color="primary">
            ${item.price}
            <Typography variant="caption" component="span" color="text.secondary">
              /{item.unit}
            </Typography>
          </Typography>
        </Box>
        
        {/* Simplified diet types display for better performance */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <b>Category:</b> {item.category}
          </Typography>
          
          {/* Only show the first 3 diet types for better performance */}
          {item.dietTypes.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {item.dietTypes.slice(0, 3).map((diet, index) => (
                <Chip 
                  key={index} 
                  label={diet} 
                  size="small" 
                  sx={{ 
                    fontSize: '0.7rem',
                    height: 20,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }} 
                />
              ))}
              {item.dietTypes.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  +{item.dietTypes.length - 3} more
                </Typography>
              )}
            </Box>
          )}
        </Box>
        
        {/* Simplified nutrition display for better performance */}
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <IconButton size="small" onClick={decrementQuantity} disabled={quantity <= 1}>
                <RemoveCircleOutlineIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ px: 1, minWidth: 24, textAlign: 'center' }}>
                {quantity}
              </Typography>
              <IconButton size="small" onClick={incrementQuantity}>
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Button 
              variant={isAdded ? "outlined" : "contained"}
              size="small"
              onClick={handleAdd}
              startIcon={isAdded ? <CheckCircleIcon /> : <ShoppingCartIcon />}
              color={isAdded ? "success" : "primary"}
              sx={{ ml: 1 }}
            >
              {isAdded ? "Added" : "Add to Cart"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

// Local helper component for meal planning
const LocalMealPlanQuestionnaire = ({ onComplete }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    goals: [],
    dietaryRestrictions: [],
    allergies: [],
    mealPreferences: {
      breakfast: true,
      lunch: true,
      dinner: true,
      snacks: true
    },
    calorieGoal: 2000,
    numMealsPerDay: 3,
    cookingTime: 'moderate',
    flavorPreferences: [],
    foodGroups: {
      protein: 5,
      vegetables: 5,
      fruits: 5,
      grains: 5,
      dairy: 5
    }
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (category, item) => {
    setFormData(prev => {
      const currentItems = [...prev[category]];
      const itemIndex = currentItems.indexOf(item);
      
      if (itemIndex === -1) {
        // Add item
        return {
          ...prev,
          [category]: [...currentItems, item]
        };
      } else {
        // Remove item
        currentItems.splice(itemIndex, 1);
        return {
          ...prev,
          [category]: currentItems
        };
      }
    });
  };

  const handleSliderChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      foodGroups: {
        ...prev.foodGroups,
        [category]: value
      }
    }));
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  // Step content based on current step
  const getStepContent = () => {
    switch (activeStep) {
      case 0: // Health goals
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What are your main health and nutrition goals?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select all that apply to customize your meal recommendations.
            </Typography>
            
            <Grid container spacing={2}>
              {[
                { value: 'weight_loss', label: 'Weight Loss', icon: <MonitorHeightIcon /> },
                { value: 'muscle_gain', label: 'Muscle Gain', icon: <FitnessCenterIcon /> },
                { value: 'energy_boost', label: 'Energy Boost', icon: <BoltIcon /> },
                { value: 'heart_health', label: 'Heart Health', icon: <FavoriteIcon /> },
                { value: 'better_sleep', label: 'Better Sleep', icon: <NightsStayIcon /> },
                { value: 'digestion', label: 'Digestive Health', icon: <HealthAndSafetyIcon /> },
                { value: 'immune_support', label: 'Immune Support', icon: <ShieldIcon /> },
                { value: 'general_health', label: 'General Wellness', icon: <SpaIcon /> }
              ].map((goal) => {
                const isSelected = formData.goals.includes(goal.value);
                return (
                  <Grid item xs={6} sm={4} md={3} key={goal.value}>
                    <Paper
                      elevation={isSelected ? 3 : 1}
                      onClick={() => handleCheckboxChange('goals', goal.value)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'white',
                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <Box sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                        color: isSelected ? 'white' : theme.palette.primary.main,
                        mb: 1
                      }}>
                        {goal.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                        {goal.label}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
        
      case 1: // Dietary restrictions
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Do you have any dietary restrictions?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select all that apply to ensure your meal plan is compatible with your diet.
            </Typography>
            
            <Grid container spacing={2}>
              {[
                { value: 'vegetarian', label: 'Vegetarian', icon: <YardIcon /> },
                { value: 'vegan', label: 'Vegan', icon: <GrassIcon /> },
                { value: 'gluten_free', label: 'Gluten-Free', icon: <NoMealsIcon /> },
                { value: 'dairy_free', label: 'Dairy-Free', icon: <NoMealsIcon /> },
                { value: 'keto', label: 'Keto', icon: <RamenDiningIcon /> },
                { value: 'paleo', label: 'Paleo', icon: <EggAltIcon /> },
                { value: 'low_carb', label: 'Low-Carb', icon: <NoFoodIcon /> },
                { value: 'low_sodium', label: 'Low-Sodium', icon: <NoFoodIcon /> },
                { value: 'low_fat', label: 'Low-Fat', icon: <NoFoodIcon /> },
                { value: 'mediterranean', label: 'Mediterranean', icon: <DinnerDiningIcon /> },
                { value: 'none', label: 'No Restrictions', icon: <RestaurantIcon /> }
              ].map((restriction) => {
                const isSelected = formData.dietaryRestrictions.includes(restriction.value);
                return (
                  <Grid item xs={6} sm={4} md={3} key={restriction.value}>
                    <Paper
                      elevation={isSelected ? 3 : 1}
                      onClick={() => {
                        // If "none" is selected, clear all others
                        if (restriction.value === 'none') {
                          setFormData({
                            ...formData,
                            dietaryRestrictions: isSelected ? [] : ['none']
                          });
                        } else {
                          // If selecting a specific restriction, remove "none" if present
                          let newRestrictions = [...formData.dietaryRestrictions];
                          const noneIndex = newRestrictions.indexOf('none');
                          if (noneIndex !== -1) {
                            newRestrictions.splice(noneIndex, 1);
                          }
                          
                          // Toggle the selected restriction
                          const restrictionIndex = newRestrictions.indexOf(restriction.value);
                          if (restrictionIndex === -1) {
                            newRestrictions.push(restriction.value);
                          } else {
                            newRestrictions.splice(restrictionIndex, 1);
                          }
                          
                          setFormData({
                            ...formData,
                            dietaryRestrictions: newRestrictions
                          });
                        }
                      }}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'white',
                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <Box sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                        color: isSelected ? 'white' : theme.palette.primary.main,
                        mb: 1
                      }}>
                        {restriction.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                        {restriction.label}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );

      case 2: // Food preferences
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Food Group Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Rate how much you enjoy each food group to help us customize your meal recommendations.
            </Typography>
            
            <Box sx={{ py: 2 }}>
              {[
                { name: 'protein', label: 'Protein (Meat, Fish, Beans, etc.)', icon: '🥩' },
                { name: 'vegetables', label: 'Vegetables', icon: '🥦' },
                { name: 'fruits', label: 'Fruits', icon: '🍎' },
                { name: 'grains', label: 'Grains (Bread, Rice, Pasta, etc.)', icon: '🌾' },
                { name: 'dairy', label: 'Dairy', icon: '🧀' }
              ].map((food) => (
                <Box key={food.name} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ mr: 1 }}>{food.icon}</Typography>
                    <Typography variant="subtitle2">{food.label}</Typography>
                  </Box>
                  <Box sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ mr: 1, minWidth: '45px' }}>
                      Dislike
                    </Typography>
                    <Slider
                      value={formData.foodGroups[food.name]}
                      onChange={(e, newValue) => handleSliderChange(food.name, newValue)}
                      step={1}
                      marks
                      min={1}
                      max={10}
                      sx={{ 
                        mx: 1,
                        color: formData.foodGroups[food.name] < 4 ? '#f44336' : 
                              formData.foodGroups[food.name] > 7 ? '#4caf50' : '#ff9800'
                      }}
                    />
                    <Typography variant="caption" sx={{ ml: 1, minWidth: '45px' }}>
                      Love it
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Flavor Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select the flavor profiles you enjoy most.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {[
                'Spicy', 'Sweet', 'Savory', 'Tangy', 'Salty', 'Bitter', 'Umami', 'Herbal',
                'Smoky', 'Citrusy', 'Garlic', 'Minty', 'Nutty'
              ].map((flavor) => {
                const isSelected = formData.flavorPreferences.includes(flavor);
                return (
                  <Chip
                    key={flavor}
                    label={flavor}
                    onClick={() => handleCheckboxChange('flavorPreferences', flavor)}
                    color={isSelected ? "primary" : "default"}
                    variant={isSelected ? "filled" : "outlined"}
                    sx={{ 
                      m: 0.5,
                      '&:hover': {
                        bgcolor: isSelected ? '' : alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        );

      case 3: // Meal structure
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Meal Planning Details
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Help us understand your meal structure preferences.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>How many meals do you prefer per day?</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {[2, 3, 4, 5, 6].map((number) => (
                    <Button
                      key={number}
                      variant={formData.numMealsPerDay === number ? "contained" : "outlined"}
                      color="primary"
                      onClick={() => setFormData({...formData, numMealsPerDay: number})}
                      sx={{ minWidth: '60px' }}
                    >
                      {number}
                    </Button>
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Preferred cooking time:</Typography>
                <RadioGroup
                  row
                  name="cookingTime"
                  value={formData.cookingTime}
                  onChange={handleInputChange}
                >
                  <FormControlLabel value="quick" control={<Radio />} label="Quick (< 30 min)" />
                  <FormControlLabel value="moderate" control={<Radio />} label="Moderate (30-60 min)" />
                  <FormControlLabel value="elaborate" control={<Radio />} label="Elaborate (60+ min)" />
                </RadioGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Typography gutterBottom>Which meals would you like to plan?</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {[
                    { key: 'breakfast', label: 'Breakfast', icon: <FreeBreakfastIcon /> },
                    { key: 'lunch', label: 'Lunch', icon: <RestaurantIcon /> },
                    { key: 'dinner', label: 'Dinner', icon: <DinnerDiningIcon /> },
                    { key: 'snacks', label: 'Snacks', icon: <IcecreamIcon /> },
                  ].map((meal) => {
                    const isSelected = formData.mealPreferences[meal.key];
                    return (
                      <Paper
                        key={meal.key}
                        elevation={isSelected ? 3 : 1}
                        onClick={() => setFormData({
                          ...formData,
                          mealPreferences: {
                            ...formData.mealPreferences,
                            [meal.key]: !isSelected
                          }
                        })}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          width: '120px',
                          height: '100px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'white',
                          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: 2
                          }
                        }}
                      >
                        <Box sx={{
                          p: 1,
                          borderRadius: '50%',
                          bgcolor: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                          color: isSelected ? 'white' : theme.palette.primary.main,
                          mb: 1
                        }}>
                          {meal.icon}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                          {meal.label}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography gutterBottom>Daily calorie target (approximate):</Typography>
                <Slider
                  value={formData.calorieGoal}
                  onChange={(e, newValue) => setFormData({...formData, calorieGoal: newValue})}
                  step={100}
                  marks={[
                    { value: 1200, label: '1200' },
                    { value: 1500, label: '1500' },
                    { value: 2000, label: '2000' },
                    { value: 2500, label: '2500' },
                    { value: 3000, label: '3000' }
                  ]}
                  min={1000}
                  max={3500}
                  valueLabelDisplay="on"
                  sx={{ color: theme.palette.primary.main }}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 4: // Food allergies
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Do you have any food allergies?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select all allergies that apply to ensure your meal plan is safe.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {[
                'None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 
                'Soy', 'Wheat', 'Gluten', 'Sesame', 'Corn', 'Berries'
              ].map((allergy) => {
                const isSelected = formData.allergies.includes(allergy);
                return (
                  <Chip
                    key={allergy}
                    label={allergy}
                    onClick={() => {
                      // Handle 'None' special case
                      if (allergy === 'None') {
                        setFormData({
                          ...formData,
                          allergies: isSelected ? [] : ['None']
                        });
                      } else {
                        let newAllergies = [...formData.allergies];
                        // Remove 'None' if it exists
                        const noneIndex = newAllergies.indexOf('None');
                        if (noneIndex !== -1) {
                          newAllergies.splice(noneIndex, 1);
                        }
                        
                        // Toggle the selected allergy
                        const allergyIndex = newAllergies.indexOf(allergy);
                        if (allergyIndex === -1) {
                          newAllergies.push(allergy);
                        } else {
                          newAllergies.splice(allergyIndex, 1);
                        }
                        
                        setFormData({
                          ...formData,
                          allergies: newAllergies
                        });
                      }
                    }}
                    color={isSelected ? "error" : "default"}
                    variant={isSelected ? "filled" : "outlined"}
                    sx={{ 
                      m: 0.5,
                      '&:hover': {
                        bgcolor: isSelected ? '' : alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  />
                );
              })}
            </Box>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Your meal plan will exclude these allergens. If you have severe allergies, please consult with a healthcare professional before following any meal plan.
            </Alert>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };

  // Steps array
  const steps = [
    'Health Goals',
    'Dietary Restrictions',
    'Food Preferences',
    'Meal Structure',
    'Allergies'
  ];

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          Personalized Meal Planning
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, pt: 2 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2, minHeight: '300px' }}>
          {getStepContent()}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleComplete}
              startIcon={<CheckIcon />}
            >
              Generate Meal Plan
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Continue
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// Helper component for the shopping cart item
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const theme = useTheme();
  
  return (
    <ListItem 
      alignItems="flex-start"
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        px: 0
      }}
    >
      <Box 
        sx={{ 
          width: 40, 
          height: 40, 
          borderRadius: 1, 
          backgroundImage: `url(${item.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mr: 2,
          flexShrink: 0
        }} 
      />
      
      <ListItemText
        primary={
          <Typography variant="subtitle2" fontWeight="medium">
            {item.name}
          </Typography>
        }
        secondary={
          <Box>
            <Typography variant="body2" component="span" color="text.secondary">
              ${(item.price * item.quantity).toFixed(2)} (${item.price}/{item.unit})
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                sx={{ p: 0.5 }}
              >
                <RemoveCircleOutlineIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ px: 1 }}>
                {item.quantity} {item.unit}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                sx={{ p: 0.5 }}
              >
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <IconButton 
          edge="end" 
          onClick={() => onRemove(item.id)}
          sx={{ color: theme.palette.error.main }}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// Helper component for nutrition calculator
const NutritionCalculator = ({ cartItems, groceryItems }) => {
  const theme = useTheme();
  const [selectedItems, setSelectedItems] = useState([]);
  const [servingSizes, setServingSizes] = useState({});
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });
  const [activeView, setActiveView] = useState('calculator'); // 'calculator' or 'visualize'
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Auto-select cart items when component loads or cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      // Auto-select all cart items and initialize their serving sizes
      const cartItemIds = cartItems.map(item => item.id);
      setSelectedItems(cartItemIds);
      
      // Initialize serving sizes based on cart quantities
      const initialServingSizes = {};
      cartItems.forEach(item => {
        initialServingSizes[item.id] = item.quantity || 1;
      });
      setServingSizes(prev => ({...prev, ...initialServingSizes}));
    }
  }, [cartItems]);
  
  // Calculate nutrition based on selected items and serving sizes
  useEffect(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
    
    selectedItems.forEach(itemId => {
      const item = groceryItems.find(g => g.id === itemId);
      const servingMultiplier = servingSizes[itemId] || 1;
      
      if (item && item.nutrition) {
        totals.calories += item.nutrition.calories * servingMultiplier;
        totals.protein += item.nutrition.protein * servingMultiplier;
        totals.carbs += item.nutrition.carbs * servingMultiplier;
        totals.fat += item.nutrition.fat * servingMultiplier;
        totals.fiber += item.nutrition.fiber * servingMultiplier;
      }
    });
    
    // Round all values to 1 decimal place
    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] * 10) / 10;
    });
    
    // Add animation effect when totals change significantly
    const calorieChange = Math.abs(totals.calories - nutritionTotals.calories);
    if (calorieChange > 50) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    }
    
    setNutritionTotals(totals);
  }, [selectedItems, servingSizes, groceryItems, nutritionTotals.calories]);
  
  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
    
    // Initialize serving size if not already set
    if (!servingSizes[itemId]) {
      // If the item is in the cart, use its quantity as the initial serving size
      const cartItem = cartItems.find(item => item.id === itemId);
      const initialServingSize = cartItem ? cartItem.quantity : 1;
      
      setServingSizes(prev => ({
        ...prev,
        [itemId]: initialServingSize
      }));
    }
  };
  
  const handleServingSizeChange = (itemId, value) => {
    setServingSizes(prev => ({
      ...prev,
      [itemId]: value
    }));
  };
  
  // Calculate daily value percentages
  const getDailyValuePercentage = (nutrient, value) => {
    const dailyValues = {
      calories: 2000,
      protein: 50,
      carbs: 275,
      fat: 78,
      fiber: 28
    };
    
    return Math.round((value / dailyValues[nutrient]) * 100);
  };
  
  // Nutrient breakdown chart data
  const getNutrientBreakdown = () => {
    const totalNutrients = nutritionTotals.protein + nutritionTotals.carbs + nutritionTotals.fat;
    if (totalNutrients === 0) return [33, 33, 34]; // Default even split
    
    const proteinPercentage = Math.round((nutritionTotals.protein * 4 / (nutritionTotals.calories || 1)) * 100);
    const carbsPercentage = Math.round((nutritionTotals.carbs * 4 / (nutritionTotals.calories || 1)) * 100);
    const fatPercentage = Math.round((nutritionTotals.fat * 9 / (nutritionTotals.calories || 1)) * 100);
    
    return [proteinPercentage, carbsPercentage, fatPercentage];
  };
  
  const nutrientBreakdown = getNutrientBreakdown();
  
  // Get recommended adjustments
  const getRecommendedAdjustments = () => {
    // Calculate macronutrient balance
    const proteinCalories = nutritionTotals.protein * 4;
    const carbCalories = nutritionTotals.carbs * 4;
    const fatCalories = nutritionTotals.fat * 9;
    const totalCalories = nutritionTotals.calories || 1;
    
    const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100);
    const carbPercentage = Math.round((carbCalories / totalCalories) * 100);
    const fatPercentage = Math.round((fatCalories / totalCalories) * 100);
    
    const adjustments = [];
    
    // Check protein
    if (proteinPercentage < 15) {
      adjustments.push("Add more protein-rich foods like chicken, Greek yogurt, or tofu");
    } else if (proteinPercentage > 35) {
      adjustments.push("Consider balancing with more complex carbs and healthy fats");
    }
    
    // Check carbs
    if (carbPercentage < 40) {
      adjustments.push("Consider adding more whole grains, fruits, or vegetables");
    } else if (carbPercentage > 65) {
      adjustments.push("Balance with more proteins and healthy fats");
    }
    
    // Check fiber
    if (nutritionTotals.fiber < 25 && nutritionTotals.calories > 1500) {
      adjustments.push("Add more fiber-rich foods like vegetables, fruits, beans, or nuts");
    }
    
    // Check fat
    if (fatPercentage < 20) {
      adjustments.push("Include more healthy fats like avocados, olive oil, or nuts");
    } else if (fatPercentage > 40) {
      adjustments.push("Balance with more lean proteins and complex carbs");
    }
    
    return adjustments.length > 0 ? adjustments : ["Your nutrient balance looks good!"];
  };
  
  // Calculate calorie-to-nutrient ratios for optimization
  const calculateNutrientDensity = () => {
    if (nutritionTotals.calories === 0) return "N/A";
    
    const proteinDensity = (nutritionTotals.protein / nutritionTotals.calories) * 1000;
    const fiberDensity = (nutritionTotals.fiber / nutritionTotals.calories) * 1000;
    
    // Higher score is better (more nutrients per calorie)
    const densityScore = Math.round(proteinDensity + fiberDensity);
    
    if (densityScore > 30) return "Excellent";
    if (densityScore > 20) return "Very Good";
    if (densityScore > 15) return "Good";
    if (densityScore > 10) return "Average";
    return "Could improve";
  };
  
  // Toggle between calculator and visualization views
  const toggleView = () => {
    setActiveView(prev => prev === 'calculator' ? 'visualize' : 'calculator');
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon color="primary" /> Nutrition Calculator
        </Typography>
        
        <Tabs value={activeView} onChange={(e, newValue) => setActiveView(newValue)} aria-label="nutrition calculator views">
          <Tab value="calculator" label="Calculator" />
          <Tab value="visualize" label="Visualize" />
        </Tabs>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        {activeView === 'calculator' 
          ? "Select items and adjust serving sizes to calculate total nutrition values."
          : "Visualize your nutrition data and get personalized recommendations."
        }
      </Typography>
      
      {activeView === 'calculator' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                height: '100%',
                maxHeight: 350,
                overflow: 'auto',
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Items to Calculate:
                </Typography>
                
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                  onClick={() => {
                    const allIds = (cartItems.length > 0 ? cartItems : groceryItems).map(item => item.id);
                    if (selectedItems.length < allIds.length) {
                      setSelectedItems(allIds);
                      
                      // Initialize serving sizes for newly selected items
                      const newServingSizes = {...servingSizes};
                      allIds.forEach(id => {
                        if (!newServingSizes[id]) {
                          const cartItem = cartItems.find(item => item.id === id);
                          newServingSizes[id] = cartItem ? cartItem.quantity : 1;
                        }
                      });
                      setServingSizes(newServingSizes);
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                  sx={{ textTransform: 'none', py: 0 }}
                >
                  {selectedItems.length === (cartItems.length > 0 ? cartItems : groceryItems).length 
                    ? "Deselect All" 
                    : "Select All"}
                </Button>
              </Box>
              
              <List sx={{ pt: 0 }}>
                {(cartItems.length > 0 ? cartItems : groceryItems).map((item) => (
                  <ListItem
                    key={item.id}
                    dense
                    disablePadding
                    sx={{ 
                      mb: 1,
                      bgcolor: selectedItems.includes(item.id) ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      borderRadius: 1,
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <Switch
                        edge="start"
                        size="small"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemToggle(item.id)}
                        inputProps={{ 'aria-labelledby': `item-${item.id}` }}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemText
                      id={`item-${item.id}`}
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: selectedItems.includes(item.id) ? 'medium' : 'normal'
                          }}
                        >
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary">
                            {item.nutrition.calories} cal
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#f44336' }}>
                            {item.nutrition.protein}g protein
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#2196f3' }}>
                            {item.nutrition.carbs}g carbs
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#ff9800' }}>
                            {item.nutrition.fat}g fat
                          </Typography>
                        </Box>
                      }
                    />
                    {selectedItems.includes(item.id) && (
                      <Box sx={{ width: 130, mr: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Servings:
                          </Typography>
                          <Typography variant="caption" fontWeight="medium">
                            {servingSizes[item.id] || 1}
                          </Typography>
                        </Box>
                        <Slider
                          size="small"
                          value={servingSizes[item.id] || 1}
                          min={0.25}
                          max={5}
                          step={0.25}
                          marks={[
                            { value: 1, label: '1' },
                            { value: 3, label: '3' }
                          ]}
                          valueLabelDisplay="auto"
                          onChange={(e, value) => handleServingSizeChange(item.id, value)}
                          sx={{ 
                            color: theme.palette.primary.main,
                            '& .MuiSlider-thumb': {
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.2)'
                              }
                            }
                          }}
                        />
                      </Box>
                    )}
                  </ListItem>
                ))}
                
                {cartItems.length === 0 && groceryItems.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No items available"
                      secondary="Add items to your cart first"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: isAnimating ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                transition: 'border-color 0.3s ease'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Nutrition Summary
              </Typography>
              
              {selectedItems.length > 0 ? (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isAnimating ? [1, 0.5, 1] : 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Items Selected:</span>
                      <span><b>{selectedItems.length}</b></span>
                    </Typography>
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Nutrient Density Score:</span>
                      <span><b>{calculateNutrientDensity()}</b></span>
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Calories:</span>
                      <span><b>{nutritionTotals.calories} kcal</b> <Typography component="span" variant="caption">({getDailyValuePercentage('calories', nutritionTotals.calories)}% DV)</Typography></span>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (nutritionTotals.calories / 2000) * 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mb: 2,
                        bgcolor: alpha(theme.palette.warning.main, 0.2),
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: theme.palette.warning.main,
                          transition: 'transform 1s ease-in-out'
                        }
                      }}
                    />
                    
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Protein:</span>
                      <span><b>{nutritionTotals.protein}g</b> <Typography component="span" variant="caption">({getDailyValuePercentage('protein', nutritionTotals.protein)}% DV)</Typography></span>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (nutritionTotals.protein / 50) * 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mb: 2,
                        bgcolor: alpha('#f44336', 0.2),
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: '#f44336',
                          transition: 'transform 1s ease-in-out'
                        }
                      }}
                    />
                    
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Carbohydrates:</span>
                      <span><b>{nutritionTotals.carbs}g</b> <Typography component="span" variant="caption">({getDailyValuePercentage('carbs', nutritionTotals.carbs)}% DV)</Typography></span>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (nutritionTotals.carbs / 275) * 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mb: 2,
                        bgcolor: alpha('#2196f3', 0.2),
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: '#2196f3',
                          transition: 'transform 1s ease-in-out'
                        }
                      }}
                    />
                    
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Fats:</span>
                      <span><b>{nutritionTotals.fat}g</b> <Typography component="span" variant="caption">({getDailyValuePercentage('fat', nutritionTotals.fat)}% DV)</Typography></span>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (nutritionTotals.fat / 78) * 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mb: 2,
                        bgcolor: alpha('#ff9800', 0.2),
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: '#ff9800',
                          transition: 'transform 1s ease-in-out'
                        }
                      }}
                    />
                    
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Fiber:</span>
                      <span><b>{nutritionTotals.fiber}g</b> <Typography component="span" variant="caption">({getDailyValuePercentage('fiber', nutritionTotals.fiber)}% DV)</Typography></span>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (nutritionTotals.fiber / 28) * 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mb: 2,
                        bgcolor: alpha('#4caf50', 0.2),
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: '#4caf50',
                          transition: 'transform 1s ease-in-out'
                        }
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={toggleView}
                      sx={{ textTransform: 'none', mb: 1 }}
                    >
                      View Nutrition Insights
                    </Button>
                    <Typography variant="caption" color="text.secondary" display="block">
                      * Based on standard serving sizes. Adjust the slider for each item to
                      change the serving amount.
                    </Typography>
                  </Box>
                </motion.div>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Select items to calculate nutrition
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {activeView === 'visualize' && selectedItems.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Macronutrient Breakdown
              </Typography>
              
              <Box sx={{ 
                height: 50, 
                display: 'flex', 
                width: '100%', 
                borderRadius: 2, 
                overflow: 'hidden',
                mb: 2
              }}>
                <Box 
                  sx={{ 
                    width: `${nutrientBreakdown[0]}%`, 
                    bgcolor: '#f44336',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    transition: 'width 1s ease'
                  }}
                >
                  {nutrientBreakdown[0]}%
                </Box>
                <Box 
                  sx={{ 
                    width: `${nutrientBreakdown[1]}%`, 
                    bgcolor: '#2196f3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    transition: 'width 1s ease'
                  }}
                >
                  {nutrientBreakdown[1]}%
                </Box>
                <Box 
                  sx={{ 
                    width: `${nutrientBreakdown[2]}%`, 
                    bgcolor: '#ff9800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    transition: 'width 1s ease'
                  }}
                >
                  {nutrientBreakdown[2]}%
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#f44336', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2">Protein</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#2196f3', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2">Carbs</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="body2">Fats</Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Daily Value Coverage
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Calories', value: nutritionTotals.calories, dailyValue: 2000, color: theme.palette.warning.main },
                  { label: 'Protein', value: nutritionTotals.protein, dailyValue: 50, color: '#f44336' },
                  { label: 'Carbs', value: nutritionTotals.carbs, dailyValue: 275, color: '#2196f3' },
                  { label: 'Fats', value: nutritionTotals.fat, dailyValue: 78, color: '#ff9800' },
                  { label: 'Fiber', value: nutritionTotals.fiber, dailyValue: 28, color: '#4caf50' }
                ].map((nutrient) => (
                  <Box key={nutrient.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      {nutrient.label}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">
                          {nutrient.value}
                        </Typography>
                        <Typography variant="caption">
                          {Math.min(100, Math.round((nutrient.value / nutrient.dailyValue) * 100))}% of {nutrient.dailyValue}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (nutrient.value / nutrient.dailyValue) * 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(nutrient.color, 0.2),
                          '& .MuiLinearProgress-bar': { bgcolor: nutrient.color }
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Nutrition Insights & Recommendations
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.05), 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  mb: 2
                }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Nutrient Density Score: <Chip 
                      label={calculateNutrientDensity()} 
                      size="small" 
                      color={
                        calculateNutrientDensity() === "Excellent" ? "success" :
                        calculateNutrientDensity() === "Very Good" ? "primary" :
                        calculateNutrientDensity() === "Good" ? "info" :
                        calculateNutrientDensity() === "Average" ? "warning" : "default"
                      }
                      sx={{ ml: 1, fontWeight: 'medium' }}
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This score indicates how nutritious your food selection is relative to its calorie content.
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Recommended Adjustments:
                </Typography>
                <List dense sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  {getRecommendedAdjustments().map((adjustment, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={adjustment}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Nutrition Quality Metrics:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="h5" color="success.main" fontWeight="bold">
                        {Math.round((nutritionTotals.protein / (nutritionTotals.calories / 1000)) * 10) / 10}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Protein per 1000 calories
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="h5" color="info.main" fontWeight="bold">
                        {Math.round((nutritionTotals.fiber / (nutritionTotals.calories / 1000)) * 10) / 10}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Fiber per 1000 calories
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={toggleView}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Calculator
                </Button>
                
                <Button 
                  variant="contained" 
                  size="small"
                  color="primary"
                  sx={{ textTransform: 'none' }}
                  disabled
                >
                  Save Nutrition Profile
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

// Helper component for Health Assistant Chat
const HealthAssistantChat = () => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 1, 
      sender: 'assistant', 
      content: "👋 Hello! I'm your Fitbit Health Assistant. I can help answer questions about your health data, nutrition, and fitness metrics. Try asking me about:",
      timestamp: new Date().toISOString(),
    },
    { 
      id: 2, 
      sender: 'assistant', 
      content: "• Your step count and activity trends\n• Heart rate patterns and zones\n• Sleep quality metrics\n• Nutrition information\n• Workout suggestions based on your data",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Predefined suggestions for the chat
  const suggestions = [
    { id: 1, text: "What was my average heart rate yesterday?", category: "heart" },
    { id: 2, text: "How many steps have I taken this week?", category: "activity" },
    { id: 3, text: "What's my sleep quality trend?", category: "sleep" },
    { id: 4, text: "Give me meal suggestions based on my activity level", category: "nutrition" },
    { id: 5, text: "When did I have my highest heart rate today?", category: "heart" },
    { id: 6, text: "Recommend a workout based on my recent activity", category: "fitness" },
    { id: 7, text: "How does my step count compare to last week?", category: "activity" },
    { id: 8, text: "What's the nutritional breakdown of my cart items?", category: "nutrition" },
  ];
  
  // Filtered suggestions based on selected category
  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);
  
  // Mock Fitbit data that would come from the actual Fitbit API
  const mockFitbitData = {
    steps: {
      today: 8432,
      yesterday: 9781,
      thisWeek: 56214,
      lastWeek: 52109,
      average: 8030
    },
    heartRate: {
      current: 72,
      resting: 68,
      zones: {
        fatBurn: { min: 97, max: 135, minutes: 103 },
        cardio: { min: 136, max: 166, minutes: 45 },
        peak: { min: 167, max: 220, minutes: 12 }
      },
      yesterday: {
        average: 76,
        max: { value: 142, time: "18:45" },
        min: { value: 62, time: "03:22" }
      }
    },
    sleep: {
      lastNight: {
        duration: 7.4,
        quality: "Good",
        deepSleep: 1.8,
        remSleep: 2.2,
        lightSleep: 3.1,
        awake: 0.3
      },
      weekAverage: 7.2,
      efficiency: 89
    },
    caloriesBurned: {
      today: 2145,
      goal: 2500,
      average: 2267
    },
    exercise: {
      lastSession: {
        type: "Running",
        duration: 32,
        caloriesBurned: 387,
        date: "2023-06-12"
      },
      weeklyActive: 182 // minutes
    }
  };
  
  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // Function to get response from "AI"
  const getAIResponse = async (userMessage) => {
    // This would be replaced with an actual API call to a backend service
    // that would process user questions and return relevant Fitbit data
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = "";
    
    // Simple keyword matching for demo purposes
    const messageLower = userMessage.toLowerCase();
    
    if (messageLower.includes('steps') || messageLower.includes('walk')) {
      if (messageLower.includes('today')) {
        response = `You've taken ${mockFitbitData.steps.today.toLocaleString()} steps today! That's ${Math.round((mockFitbitData.steps.today / 10000) * 100)}% of your daily goal.`;
      } else if (messageLower.includes('yesterday')) {
        response = `Yesterday, you took ${mockFitbitData.steps.yesterday.toLocaleString()} steps. That's ${mockFitbitData.steps.yesterday > mockFitbitData.steps.average ? 'above' : 'below'} your average of ${mockFitbitData.steps.average.toLocaleString()} steps.`;
      } else if (messageLower.includes('week')) {
        const comparison = mockFitbitData.steps.thisWeek - mockFitbitData.steps.lastWeek;
        const percentChange = Math.abs(Math.round((comparison / mockFitbitData.steps.lastWeek) * 100));
        
        response = `This week, you've taken ${mockFitbitData.steps.thisWeek.toLocaleString()} steps, which is ${comparison > 0 ? 'up' : 'down'} ${percentChange}% compared to last week (${mockFitbitData.steps.lastWeek.toLocaleString()} steps).`;
      } else {
        response = `Your average daily step count is ${mockFitbitData.steps.average.toLocaleString()} steps. Today, you've taken ${mockFitbitData.steps.today.toLocaleString()} steps so far.`;
      }
    } 
    else if (messageLower.includes('heart') || messageLower.includes('bpm') || messageLower.includes('pulse')) {
      if (messageLower.includes('highest') || messageLower.includes('max')) {
        response = `Your highest heart rate today was ${mockFitbitData.heartRate.yesterday.max.value} BPM at ${mockFitbitData.heartRate.yesterday.max.time}.`;
      } else if (messageLower.includes('average') || messageLower.includes('mean')) {
        response = `Your average heart rate yesterday was ${mockFitbitData.heartRate.yesterday.average} BPM. Your resting heart rate is ${mockFitbitData.heartRate.resting} BPM.`;
      } else if (messageLower.includes('zone')) {
        response = `Yesterday, you spent:\n• ${mockFitbitData.heartRate.zones.fatBurn.minutes} minutes in the Fat Burn zone (${mockFitbitData.heartRate.zones.fatBurn.min}-${mockFitbitData.heartRate.zones.fatBurn.max} BPM)\n• ${mockFitbitData.heartRate.zones.cardio.minutes} minutes in the Cardio zone (${mockFitbitData.heartRate.zones.cardio.min}-${mockFitbitData.heartRate.zones.cardio.max} BPM)\n• ${mockFitbitData.heartRate.zones.peak.minutes} minutes in the Peak zone (${mockFitbitData.heartRate.zones.peak.min}+ BPM)`;
      } else {
        response = `Your current heart rate is ${mockFitbitData.heartRate.current} BPM, and your resting heart rate is ${mockFitbitData.heartRate.resting} BPM.`;
      }
    }
    else if (messageLower.includes('sleep') || messageLower.includes('slept')) {
      if (messageLower.includes('quality') || messageLower.includes('good')) {
        response = `Last night's sleep quality was rated as "${mockFitbitData.sleep.lastNight.quality}" with a sleep efficiency of ${mockFitbitData.sleep.efficiency}%.`;
      } else if (messageLower.includes('deep')) {
        response = `Last night, you had ${mockFitbitData.sleep.lastNight.deepSleep} hours of deep sleep, which is ${mockFitbitData.sleep.lastNight.deepSleep >= 1.5 ? 'good' : 'below recommended levels'}.`;
      } else if (messageLower.includes('trend') || messageLower.includes('average')) {
        response = `Your average sleep duration over the past week is ${mockFitbitData.sleep.weekAverage} hours. The recommended amount is 7-9 hours for adults.`;
      } else {
        response = `Last night, you slept for ${mockFitbitData.sleep.lastNight.duration} hours total:\n• ${mockFitbitData.sleep.lastNight.deepSleep} hours of deep sleep\n• ${mockFitbitData.sleep.lastNight.remSleep} hours of REM sleep\n• ${mockFitbitData.sleep.lastNight.lightSleep} hours of light sleep\n• ${mockFitbitData.sleep.lastNight.awake} hours awake`;
      }
    }
    else if (messageLower.includes('calories') || messageLower.includes('burn')) {
      response = `Today, you've burned ${mockFitbitData.caloriesBurned.today} calories out of your daily goal of ${mockFitbitData.caloriesBurned.goal} calories (${Math.round((mockFitbitData.caloriesBurned.today / mockFitbitData.caloriesBurned.goal) * 100)}% complete).`;
    }
    else if (messageLower.includes('workout') || messageLower.includes('exercise') || messageLower.includes('training') || messageLower.includes('recommend')) {
      response = `Based on your recent activity patterns and heart rate data, I'd recommend a ${mockFitbitData.heartRate.zones.cardio.minutes < 30 ? 'cardio workout like a 30-minute run or bike ride' : 'recovery day with light yoga or a gentle walk'}. Your last workout was ${mockFitbitData.exercise.lastSession.type} for ${mockFitbitData.exercise.lastSession.duration} minutes.`;
    }
    else if (messageLower.includes('nutrition') || messageLower.includes('food') || messageLower.includes('meal') || messageLower.includes('diet')) {
      response = `Based on your activity level and calories burned (${mockFitbitData.caloriesBurned.today} today), I'd recommend focusing on protein-rich foods like lean meats, legumes, and dairy. Aim for about 2,300 calories today with at least 100g of protein to support your activity level.`;
    }
    else {
      response = "I'm not sure I understand that question. Could you rephrase it or ask me about your steps, heart rate, sleep quality, calories burned, or workout recommendations?";
    }
    
    setIsLoading(false);
    return response;
  };
  
  // Handle sending a new message
  const handleSendMessage = async (inputMessage = null) => {
    const messageToSend = inputMessage || message;
    if (!messageToSend.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: chatHistory.length + 1,
      sender: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    
    // Get AI response
    const response = await getAIResponse(messageToSend);
    
    // Add AI response to chat
    const aiMessage = {
      id: chatHistory.length + 2,
      sender: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
    
    setChatHistory(prev => [...prev, aiMessage]);
  };
  
  // Handle sending a message with the Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Category Filters */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          icon={<InfoOutlinedIcon />} 
          label="All" 
          onClick={() => setSelectedCategory('all')}
          color={selectedCategory === 'all' ? 'primary' : 'default'}
          variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
          sx={{ fontWeight: selectedCategory === 'all' ? 'bold' : 'normal' }}
        />
        <Chip 
          icon={<DirectionsRunIcon />} 
          label="Activity" 
          onClick={() => setSelectedCategory('activity')}
          color={selectedCategory === 'activity' ? 'primary' : 'default'}
          variant={selectedCategory === 'activity' ? 'filled' : 'outlined'}
          sx={{ fontWeight: selectedCategory === 'activity' ? 'bold' : 'normal' }}
        />
        <Chip 
          icon={<MonitorHeartIcon />} 
          label="Heart Rate" 
          onClick={() => setSelectedCategory('heart')}
          color={selectedCategory === 'heart' ? 'primary' : 'default'}
          variant={selectedCategory === 'heart' ? 'filled' : 'outlined'}
          sx={{ fontWeight: selectedCategory === 'heart' ? 'bold' : 'normal' }}
        />
        <Chip 
          icon={<NightsStayIcon />} 
          label="Sleep" 
          onClick={() => setSelectedCategory('sleep')}
          color={selectedCategory === 'sleep' ? 'primary' : 'default'}
          variant={selectedCategory === 'sleep' ? 'filled' : 'outlined'}
          sx={{ fontWeight: selectedCategory === 'sleep' ? 'bold' : 'normal' }}
        />
        <Chip 
          icon={<LocalDiningIcon />} 
          label="Nutrition" 
          onClick={() => setSelectedCategory('nutrition')}
          color={selectedCategory === 'nutrition' ? 'primary' : 'default'}
          variant={selectedCategory === 'nutrition' ? 'filled' : 'outlined'}
          sx={{ fontWeight: selectedCategory === 'nutrition' ? 'bold' : 'normal' }}
        />
        <Chip 
          icon={<FitnessCenterIcon />} 
          label="Fitness" 
          onClick={() => setSelectedCategory('fitness')}
          color={selectedCategory === 'fitness' ? 'primary' : 'default'}
          variant={selectedCategory === 'fitness' ? 'filled' : 'outlined'}
          sx={{ fontWeight: selectedCategory === 'fitness' ? 'bold' : 'normal' }}
        />
      </Box>
      
      {/* Chat messages container */}
      <Paper 
        elevation={2} 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2, 
          borderRadius: 3,
          overflowY: 'auto',
          maxHeight: 500,
          bgcolor: alpha(theme.palette.background.default, 0.8),
          backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.12)} 1px, transparent 0)`,
          backgroundSize: '18px 18px',
          position: 'relative'
        }}
      >
        {/* Message bubbles */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {chatHistory.map((msg) => (
            <Zoom 
              key={msg.id} 
              in={true} 
              style={{ 
                transformOrigin: msg.sender === 'user' ? 'right' : 'left'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', maxWidth: '80%' }}>
                  {msg.sender === 'assistant' && (
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 38,
                        height: 38,
                        mr: 1,
                        mt: 0.5
                      }}
                    >
                      <SmartToyIcon />
                    </Avatar>
                  )}
                  
                  <Box>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: msg.sender === 'user' ? theme.palette.primary.main : theme.palette.background.paper,
                        color: msg.sender === 'user' ? 'white' : 'inherit',
                        borderTopRightRadius: msg.sender === 'user' ? 0 : 3,
                        borderTopLeftRadius: msg.sender === 'assistant' ? 0 : 3,
                        position: 'relative',
                        maxWidth: '100%',
                        boxShadow: msg.sender === 'user' 
                          ? '0 2px 8px rgba(0,0,0,0.15)' 
                          : '0 2px 5px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Typography
                        variant="body1"
                        component="div"
                        sx={{ 
                          whiteSpace: 'pre-line', 
                          overflowWrap: 'break-word'
                        }}
                      >
                        {msg.content}
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        color: 'text.secondary',
                        display: 'block',
                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                        ml: 1,
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  
                  {msg.sender === 'user' && (
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.info.dark,
                        width: 38,
                        height: 38,
                        ml: 1,
                        mt: 0.5
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  )}
                </Box>
              </Box>
            </Zoom>
          ))}
          
          {/* Loading animation */}
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 1,
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 38,
                    height: 38,
                    mr: 1,
                    mt: 0.5
                  }}
                >
                  <SmartToyIcon />
                </Avatar>
                
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: theme.palette.background.paper,
                    borderTopLeftRadius: 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.5,
                      alignItems: 'center',
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [0.8, 1, 0.8],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeInOut",
                        repeat: Infinity,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: theme.palette.primary.main,
                          borderRadius: '50%',
                        }}
                      />
                    </motion.div>
                    <motion.div
                      animate={{
                        scale: [0.8, 1, 0.8],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: theme.palette.primary.main,
                          borderRadius: '50%',
                        }}
                      />
                    </motion.div>
                    <motion.div
                      animate={{
                        scale: [0.8, 1, 0.8],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: theme.palette.primary.main,
                          borderRadius: '50%',
                        }}
                      />
                    </motion.div>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </Paper>
      
      {/* Suggestion chips */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ ml: 1 }}>
          Suggested questions:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: '100%', overflowX: 'auto', pb: 1 }}>
          {filteredSuggestions.map((suggestion) => (
            <Chip
              key={suggestion.id}
              label={suggestion.text}
              onClick={() => handleSendMessage(suggestion.text)}
              sx={{ 
                borderRadius: 4,
                px: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                },
                transition: 'all 0.2s ease',
                fontWeight: 'normal',
                cursor: 'pointer'
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Input area */}
      <Paper
        component="form"
        variant="outlined"
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
          border: `1px solid ${theme.palette.divider}`,
          gap: 1,
          bgcolor: theme.palette.background.paper,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ask about your Fitbit data or health metrics..."
          variant="standard"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          inputRef={inputRef}
          InputProps={{
            disableUnderline: true,
            style: { fontSize: '14px' }
          }}
          sx={{ ml: 1, flex: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="refresh"
            onClick={() => {
              setChatHistory([
                { 
                  id: 1, 
                  sender: 'assistant', 
                  content: "👋 Hello! I'm your Fitbit Health Assistant. I can help answer questions about your health data, nutrition, and fitness metrics. Try asking me about:",
                  timestamp: new Date().toISOString(),
                },
                { 
                  id: 2, 
                  sender: 'assistant', 
                  content: "• Your step count and activity trends\n• Heart rate patterns and zones\n• Sleep quality metrics\n• Nutrition information\n• Workout suggestions based on your data",
                  timestamp: new Date().toISOString(),
                }
              ]);
            }}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main
              }
            }}
          >
            <ReplayIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="primary"
            aria-label="send message"
            onClick={() => handleSendMessage()}
            disabled={!message.trim() || isLoading}
            sx={{
              bgcolor: !message.trim() || isLoading ? alpha(theme.palette.primary.main, 0.1) : theme.palette.primary.main,
              color: !message.trim() || isLoading ? theme.palette.text.disabled : 'white',
              '&:hover': {
                bgcolor: !message.trim() || isLoading ? alpha(theme.palette.primary.main, 0.15) : theme.palette.primary.dark,
              },
              transition: 'all 0.3s ease',
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
      
      {/* Information panel */}
      <Box 
        sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: alpha(theme.palette.info.main, 0.05), 
          borderRadius: 2,
          border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`
        }}
      >
        <Typography variant="caption" color="text.secondary">
          <InfoOutlinedIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          This chat assistant is connected to your Fitbit data and provides personalized insights based on your health metrics. Try asking questions about your activity, sleep patterns, heart rate, and nutrition to get personalized recommendations.
        </Typography>
      </Box>
    </Box>
  );
};

// Recipe template database
const recipeTemplates = [
  {
    template: "protein_with_veggies",
    name: "{protein} with {vegetable} and {grain}",
    description: "Delicious {protein} served with {vegetable} and a side of {grain}, seasoned with herbs and spices.",
    requiresTypes: ["protein", "vegetable"],
    optionalTypes: ["grain", "herb"],
    preparationTime: "30 minutes",
    baseCalories: 350,
    baseImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    possibleDietTypes: ["High-Protein", "Low-Carb", "Paleo"]
  },
  {
    template: "vegetable_salad",
    name: "{vegetable} Salad with {protein}",
    description: "Fresh {vegetable} salad topped with {protein} and dressed with {condiment}.",
    requiresTypes: ["vegetable"],
    optionalTypes: ["protein", "condiment", "herb"],
    preparationTime: "15 minutes",
    baseCalories: 250,
    baseImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    possibleDietTypes: ["Vegan", "Vegetarian", "Low-Carb", "Keto"]
  },
  {
    template: "grain_bowl",
    name: "{grain} Bowl with {protein} and {vegetable}",
    description: "Hearty {grain} bowl topped with {protein} and {vegetable}, finished with {condiment}.",
    requiresTypes: ["grain"],
    optionalTypes: ["protein", "vegetable", "condiment"],
    preparationTime: "25 minutes",
    baseCalories: 400,
    baseImage: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    possibleDietTypes: ["Vegetarian", "Mediterranean", "High-Protein"]
  },
  {
    template: "smoothie",
    name: "{fruit} and {vegetable} Smoothie",
    description: "Refreshing smoothie with {fruit}, {vegetable}, and {dairy} for a nutritious boost.",
    requiresTypes: ["fruit"],
    optionalTypes: ["vegetable", "dairy", "nuts_seeds"],
    preparationTime: "10 minutes",
    baseCalories: 200,
    baseImage: "https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    possibleDietTypes: ["Vegan", "Vegetarian", "Gluten-Free"]
  },
  {
    template: "stir_fry",
    name: "{protein} Stir Fry with {vegetable}",
    description: "Quick and flavorful stir fry with {protein} and {vegetable}, served over {grain}.",
    requiresTypes: ["protein", "vegetable"],
    optionalTypes: ["grain", "condiment"],
    preparationTime: "20 minutes",
    baseCalories: 380,
    baseImage: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    possibleDietTypes: ["High-Protein", "Low-Carb"]
  }
];

// Generate dynamic recipes based on ingredients
const generateDynamicRecipes = (cartItems) => {
  if (!cartItems || cartItems.length < 2) return [];
  
  // Helper function to categorize ingredients
  const categorizeIngredient = (name) => {
    name = name.toLowerCase();
    
    // Check protein ingredients
    if (name.includes('chicken') || name.includes('beef') || 
        name.includes('fish') || name.includes('salmon') || 
        name.includes('tofu') || name.includes('turkey') || 
        name.includes('egg') || name.includes('yogurt')) {
      return "protein";
    }
    
    // Check produce/vegetables
    if (name.includes('spinach') || name.includes('kale') || 
        name.includes('broccoli') || name.includes('pepper') || 
        name.includes('carrot') || name.includes('tomato') || 
        name.includes('lettuce') || name.includes('onion') ||
        name.includes('zucchini') || name.includes('cucumber')) {
      return "vegetable";
    }
    
    // Check fruits
    if (name.includes('apple') || name.includes('banana') || 
        name.includes('berry') || name.includes('berries') || 
        name.includes('orange') || name.includes('pear') || 
        name.includes('mango') || name.includes('pineapple') ||
        name.includes('avocado')) {
      return "fruit";
    }
    
    // Check grains
    if (name.includes('rice') || name.includes('quinoa') || 
        name.includes('pasta') || name.includes('bread') || 
        name.includes('oat') || name.includes('barley') ||
        name.includes('couscous') || name.includes('farro')) {
      return "grain";
    }
    
    // Check dairy
    if (name.includes('milk') || name.includes('cheese') || 
        name.includes('yogurt') || name.includes('cream')) {
      return "dairy";
    }
    
    // Check nuts and seeds
    if (name.includes('almond') || name.includes('walnut') || 
        name.includes('cashew') || name.includes('pecan') || 
        name.includes('chia') || name.includes('flax') ||
        name.includes('seed') || name.includes('nut')) {
      return "nuts_seeds";
    }
    
    // Check herbs and spices
    if (name.includes('basil') || name.includes('thyme') || 
        name.includes('cilantro') || name.includes('mint') || 
        name.includes('parsley') || name.includes('oregano') ||
        name.includes('spice') || name.includes('herb')) {
      return "herb";
    }
    
    // Check condiments
    if (name.includes('oil') || name.includes('vinegar') || 
        name.includes('sauce') || name.includes('dressing') || 
        name.includes('honey') || name.includes('syrup') ||
        name.includes('mayo') || name.includes('mustard')) {
      return "condiment";
    }
    
    return "other";
  };
  
  // Group cart items by category
  const groupedIngredients = {};
  cartItems.forEach(item => {
    const category = categorizeIngredient(item.name);
    if (!groupedIngredients[category]) {
      groupedIngredients[category] = [];
    }
    groupedIngredients[category].push(item);
  });
  
  console.log("Grouped ingredients by category:", Object.keys(groupedIngredients));
  
  // Find suitable recipe templates based on available ingredients
  const matchingTemplates = recipeTemplates.filter(template => {
    // Check if we have all required ingredient types
    return template.requiresTypes.every(type => groupedIngredients[type] && groupedIngredients[type].length > 0);
  });
  
  if (matchingTemplates.length === 0) return [];
  
  // Select up to 3 templates to create recipes from
  const selectedTemplates = matchingTemplates
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 3);
  
  // Generate actual recipes from templates
  return selectedTemplates.map((template, index) => {
    // Pick ingredients for each required slot
    const selectedIngredients = [];
    const ingredientNames = {};
    
    // Fill required ingredient slots
    template.requiresTypes.forEach(type => {
      if (groupedIngredients[type] && groupedIngredients[type].length > 0) {
        // Pick a random ingredient of this type
        const randomIndex = Math.floor(Math.random() * groupedIngredients[type].length);
        const ingredient = groupedIngredients[type][randomIndex];
        
        selectedIngredients.push(ingredient.name);
        ingredientNames[type] = ingredient.name;
      }
    });
    
    // Fill optional ingredient slots if available
    template.optionalTypes.forEach(type => {
      if (groupedIngredients[type] && groupedIngredients[type].length > 0) {
        // 70% chance to include an optional ingredient
        if (Math.random() > 0.3) {
          const randomIndex = Math.floor(Math.random() * groupedIngredients[type].length);
          const ingredient = groupedIngredients[type][randomIndex];
          
          selectedIngredients.push(ingredient.name);
          ingredientNames[type] = ingredient.name;
        }
      }
    });
    
    // Customize the recipe name and description using the selected ingredients
    let customizedName = template.name;
    let customizedDescription = template.description;
    
    // Replace placeholders with actual ingredient names
    Object.entries(ingredientNames).forEach(([type, name]) => {
      const cleanName = name.replace(/,.*$/, ''); // Remove anything after a comma
      customizedName = customizedName.replace(`{${type}}`, cleanName);
      customizedDescription = customizedDescription.replace(`{${type}}`, cleanName);
    });
    
    // Handle any remaining placeholders
    customizedName = customizedName.replace(/{[^}]+}/g, ''); // Remove any remaining placeholders
    customizedDescription = customizedDescription.replace(/{[^}]+}/g, ''); // Remove any remaining placeholders
    
    // Clean up double spaces
    customizedName = customizedName.replace(/\s+/g, ' ').trim();
    customizedDescription = customizedDescription.replace(/\s+/g, ' ').trim();
    
    // Determine applicable diet types based on ingredients
    const dietTypes = [];
    
    // Add template's possible diet types if they apply to our ingredients
    template.possibleDietTypes.forEach(dietType => {
      if (dietType === "Vegan" && !selectedIngredients.some(ing => 
        ing.toLowerCase().includes('meat') || ing.toLowerCase().includes('chicken') || 
        ing.toLowerCase().includes('beef') || ing.toLowerCase().includes('fish') ||
        ing.toLowerCase().includes('egg') || ing.toLowerCase().includes('milk') ||
        ing.toLowerCase().includes('cheese') || ing.toLowerCase().includes('yogurt'))) {
        dietTypes.push(dietType);
      } else if (dietType === "Vegetarian" && !selectedIngredients.some(ing => 
        ing.toLowerCase().includes('meat') || ing.toLowerCase().includes('chicken') || 
        ing.toLowerCase().includes('beef') || ing.toLowerCase().includes('fish'))) {
        dietTypes.push(dietType);
      } else if (dietType === "High-Protein" && selectedIngredients.some(ing => 
        ing.toLowerCase().includes('chicken') || ing.toLowerCase().includes('beef') || 
        ing.toLowerCase().includes('fish') || ing.toLowerCase().includes('egg') ||
        ing.toLowerCase().includes('yogurt') || ing.toLowerCase().includes('tofu'))) {
        dietTypes.push(dietType);
      } else if (dietType === "Low-Carb" && !selectedIngredients.some(ing => 
        ing.toLowerCase().includes('rice') || ing.toLowerCase().includes('pasta') || 
        ing.toLowerCase().includes('bread') || ing.toLowerCase().includes('potato'))) {
        dietTypes.push(dietType);
      } else if (dietType === "Paleo" && !selectedIngredients.some(ing => 
        ing.toLowerCase().includes('grain') || ing.toLowerCase().includes('dairy') || 
        ing.toLowerCase().includes('legume'))) {
        dietTypes.push(dietType);
      } else if (dietType === "Gluten-Free" && !selectedIngredients.some(ing => 
        ing.toLowerCase().includes('wheat') || ing.toLowerCase().includes('gluten'))) {
        dietTypes.push(dietType);
      } else if (dietType === "Mediterranean" && selectedIngredients.some(ing => 
        ing.toLowerCase().includes('olive oil') || ing.toLowerCase().includes('fish') || 
        ing.toLowerCase().includes('vegetable'))) {
        dietTypes.push(dietType);
      } else if (dietType === "Keto" && !selectedIngredients.some(ing => 
        ing.toLowerCase().includes('sugar') || ing.toLowerCase().includes('grain') || 
        ing.toLowerCase().includes('rice') || ing.toLowerCase().includes('potato'))) {
        dietTypes.push(dietType);
      }
    });
    
    // Add a few more common diet types if applicable
    if (!selectedIngredients.some(ing => ing.toLowerCase().includes('gluten'))) {
      dietTypes.push("Gluten-Free");
    }
    
    // Remove duplicates
    const uniqueDietTypes = [...new Set(dietTypes)];
    
    // Calculate approximate calories based on ingredients and template base
    const calorieModifier = selectedIngredients.length * 25; // 25 calories per ingredient
    const calories = template.baseCalories + calorieModifier;
    
    // Calculate match percentage based on how many ingredient slots were filled
    const totalSlots = template.requiresTypes.length + template.optionalTypes.length;
    const filledSlots = Object.keys(ingredientNames).length;
    const matchPercentage = Math.round((filledSlots / totalSlots) * 100);
    
    return {
      id: 1000 + index,
      name: customizedName,
      description: customizedDescription,
      ingredients: selectedIngredients,
      preparationTime: template.preparationTime,
      calories,
      image: template.baseImage,
      dietTypes: uniqueDietTypes,
      matchPercentage: Math.max(70, matchPercentage) // Minimum 70% match
    };
  });
};

// Helper component for recipe suggestions
const RecipeSuggestions = ({ cartItems, recipes }) => {
  const theme = useTheme();
  
  // Generate dynamic recipes based on cart items
  const dynamicRecipes = generateDynamicRecipes(cartItems);
  
  // Filter static recipes based on cart items
  const getMatchingStaticRecipes = () => {
    if (!cartItems || cartItems.length === 0) return recipes;
    
    const cartItemNames = cartItems.map(item => item.name);
    
    return recipes
      .map(recipe => {
        const matchingIngredients = recipe.ingredients.filter(ing => 
          cartItemNames.some(item => item.includes(ing))
        );
        return {
          ...recipe,
          matchCount: matchingIngredients.length,
          matchPercentage: Math.round((matchingIngredients.length / recipe.ingredients.length) * 100)
        };
      })
      .filter(recipe => recipe.matchCount > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  };
  
  // Combine static and dynamic recipes
  const staticRecipes = getMatchingStaticRecipes();
  const allRecipes = [...dynamicRecipes, ...staticRecipes].slice(0, 4); // Limit to 4 total recipes
  
  const matchingRecipes = allRecipes;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RestaurantIcon color="primary" /> Recipe Suggestions
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Based on ingredients in your shopping cart
      </Typography>
      
      {matchingRecipes.length > 0 ? (
        <Grid container spacing={2}>
          {matchingRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} key={recipe.id}>
              <Paper
                elevation={1}
                sx={{
                  p: 0,
                  overflow: 'hidden',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', height: '100%' }}>
                  <Box 
                    sx={{ 
                      width: 120, 
                      backgroundImage: `url(${recipe.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0
                    }} 
                  />
                  <Box sx={{ p: 2, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" component="h3" fontWeight="medium">
                        {recipe.name}
                      </Typography>
                      
                      {'matchPercentage' in recipe && (
                        <Chip 
                          label={`${recipe.matchPercentage}% match`} 
                          size="small"
                          color={
                            recipe.matchPercentage > 75 ? "success" :
                            recipe.matchPercentage > 50 ? "primary" : "default"
                          }
                          sx={{ fontWeight: 'medium' }}
                        />
                      )}
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph 
                      sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {recipe.description}
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 0.5, 
                        flexWrap: 'wrap',
                        mb: 1
                      }}
                    >
                      {recipe.dietTypes.map((diet, index) => (
                        <Chip 
                          key={index} 
                          label={diet} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 20,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }} 
                        />
                      ))}
                      <Chip 
                        label={`${recipe.calories} cal`} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main
                        }} 
                      />
                      <Chip 
                        label={recipe.preparationTime} 
                        size="small" 
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main
                        }} 
                      />
                    </Box>
                    
                    <Button 
                      size="small" 
                      sx={{ textTransform: 'none', mt: 'auto' }}
                    >
                      View Recipe
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Add ingredients to your cart to see matching recipes
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// Main Grocery Tab component
const GroceryTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { saveFitnessProfile, fitnessProfile, dietaryPreferences, recommendedGroceries } = useWorkoutPlan();
  const [activeTab, setActiveTab] = useState(0);
  const [currentMealPlan, setCurrentMealPlan] = useState(null);
  const [groceryItems, setGroceryItems] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Load grocery items from API on component mount
  useEffect(() => {
    async function loadGroceryItems() {
      try {
        console.log("Loading initial grocery items from API...");
        // Show loading indicator
        setIsSearching(true);
        
        // Initialize with some random search terms to get varied results
        const initialFoods = ['fresh', 'organic', 'protein', 'healthy', 'vegetables', 'fruit', 'dairy', 'meat'];
        const randomTerm = initialFoods[Math.floor(Math.random() * initialFoods.length)];
        
        // Fetch items from API
        const items = await fetchGroceryItems({ query: randomTerm });
        
        console.log(`Loaded ${items.length} items from API`);
        setGroceryItems(items);
        setInitialLoadComplete(true);
        setIsSearching(false);
      } catch (error) {
        console.error("Error loading initial grocery data:", error);
        // Fall back to mock data if API fails
        console.warn("Using mock data as fallback");
        setGroceryItems(mockGroceryItems);
        setInitialLoadComplete(true);
        setIsSearching(false);
      }
    }
    
    loadGroceryItems();
  }, []);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(groceryItems);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStore, setSelectedStore] = useState(null);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  // Initialize with some default stores from our store database
  const defaultStores = storeDatabase.slice(0, 5).map(store => ({
    ...store,
    address: "123 Main St, Minneapolis, MN 55401",
    distance: Math.round((Math.random() * 5 + 0.5) * 10) / 10
  }));
  const [availableStores, setAvailableStores] = useState(defaultStores);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  // Meal planning questionnaire state
  const [showMealPlanningQuestionnaire, setShowMealPlanningQuestionnaire] = useState(false);
  const [mealPlanningResults, setMealPlanningResults] = useState(null);
  const [dietFilters, setDietFilters] = useState([]);
  const [foodGroupFilters, setFoodGroupFilters] = useState({});
  const [generatedMealPlan, setGeneratedMealPlan] = useState(null);
  
  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Get unique categories
  const categories = ['All', ...new Set(groceryItems.map(item => item.category))];
  
  // Function to fetch grocery data based on search term using Open Food Facts API
const fetchRealGroceryData = async (searchQuery) => {
  try {
    console.log(`Fetching grocery data for: ${searchQuery}`);
    
    // First check if we already have matches in our existing database
    const existingMatches = mockGroceryItems.filter(item => {
      const itemNameLower = item.name.toLowerCase();
      const searchTermLower = searchQuery.toLowerCase();
      return itemNameLower.includes(searchTermLower);
    });
    
    if (existingMatches.length > 0) {
      console.log(`Found ${existingMatches.length} existing matches for "${searchQuery}"`);
      return existingMatches;
    }
    
    // If no matches found in existing data, fetch from Open Food Facts API
    console.log(`Fetching from Open Food Facts API for: ${searchQuery}`);
    
    // Encode search query for URL
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodedQuery}&search_simple=1&action=process&json=1&page_size=20`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open Food Facts API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Open Food Facts API response:', data);
    
    // Check if we have valid products
    if (!data.products || data.products.length === 0) {
      console.log('No products found in API response, falling back to generated items');
      // Fall back to generated items if no API results
      const dynamicItems = generateDynamicGroceryItems(searchQuery);
      setGroceryItems(prevItems => [...prevItems, ...dynamicItems]);
      return dynamicItems;
    }
    
    // Convert the API results to our groceryItems format
    const apiItems = data.products.map((product, index) => {
      // Extract product categories (use first one for simplicity)
      const categories = product.categories_tags ? 
        product.categories_tags[0]?.replace('en:', '') : 'Food';
      
      // Map category to our format
      let displayCategory = 'Other';
      if (categories) {
        if (categories.includes('fruit') || categories.includes('vegetable')) {
          displayCategory = 'Produce';
        } else if (categories.includes('meat') || categories.includes('poultry') || categories.includes('seafood')) {
          displayCategory = 'Protein';
        } else if (categories.includes('dairy') || categories.includes('milk') || categories.includes('cheese')) {
          displayCategory = 'Dairy';
        } else if (categories.includes('grain') || categories.includes('bread') || categories.includes('cereal')) {
          displayCategory = 'Grains';
        } else if (categories.includes('nut') || categories.includes('seed')) {
          displayCategory = 'Nuts & Seeds';
        } else if (categories.includes('beverage') || categories.includes('drink')) {
          displayCategory = 'Beverages';
        }
      }
      
      // Extract nutrition data
      const nutrients = product.nutriments || {};
      
      // Generate nutrition data based on API response or defaults
      const nutrition = {
        calories: Math.round(nutrients['energy-kcal_100g'] || nutrients['energy_100g'] / 4.184 || 100),
        protein: Math.round((nutrients.proteins_100g || 2) * 10) / 10,
        carbs: Math.round((nutrients.carbohydrates_100g || 10) * 10) / 10,
        fat: Math.round((nutrients.fat_100g || 2) * 10) / 10,
        fiber: Math.round((nutrients.fiber_100g || 1) * 10) / 10
      };
      
      // Extract image URL or use placeholder
      const imageUrl = product.image_url || product.image_small_url || 
        'https://images.unsplash.com/photo-1604742763101-7cbec5bc45f1';
      
      // Extract product name
      const name = product.product_name || product.product_name_en || searchQuery;
      
      // Generate price (not available in API)
      const price = (Math.random() * 5 + 1.99).toFixed(2);
      
      // Generate diet types based on API data
      const dietTypes = [];
      if (product.labels_tags) {
        if (product.labels_tags.includes('en:vegan') || product.labels_tags.includes('en:vegan-status-vegan')) {
          dietTypes.push('Vegan');
        }
        if (product.labels_tags.includes('en:vegetarian') || product.labels_tags.includes('en:vegetarian-status-vegetarian')) {
          dietTypes.push('Vegetarian');
        }
        if (product.labels_tags.includes('en:gluten-free')) {
          dietTypes.push('Gluten-Free');
        }
        if (product.labels_tags.includes('en:organic')) {
          dietTypes.push('Organic');
        }
      }
      
      // Add more diet types if needed
      if (dietTypes.length === 0) {
        // Add some default diet types based on category
        if (displayCategory === 'Produce') {
          dietTypes.push('Vegan', 'Vegetarian', 'Gluten-Free');
        } else if (displayCategory === 'Protein' && !name.toLowerCase().includes('meat')) {
          dietTypes.push('High-Protein');
        }
      }
      
      // Create the new grocery item
      return {
        id: nextId++,
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        category: displayCategory,
        price: parseFloat(price),
        unit: product.quantity ? product.quantity.split(' ').pop() || 'each' : 'each',
        nutrition,
        dietTypes: dietTypes.length > 0 ? dietTypes : ['Vegetarian'],
        isOrganic: product.labels_tags?.includes('en:organic') || false,
        storeSections: [displayCategory],
        storeLocations: [
          { store: "Whole Foods", aisle: `${Math.floor(Math.random() * 20) + 1}`, section: displayCategory },
          { store: "Trader Joe's", aisle: `${Math.floor(Math.random() * 10) + 1}`, section: displayCategory }
        ],
        image: `${imageUrl}`
      };
    });
    
    console.log(`Converted ${apiItems.length} API items to grocery format`);
    
    // Add the API items to our existing items for future searches
    setGroceryItems(prevItems => [...prevItems, ...apiItems]);
    
    return apiItems;
  } catch (error) {
    console.error('Error fetching grocery data:', error);
    
    // If API request fails, fall back to generated items
    console.log('Falling back to generated items due to API error');
    const dynamicItems = generateDynamicGroceryItems(searchQuery);
    setGroceryItems(prevItems => [...prevItems, ...dynamicItems]);
    
    return dynamicItems;
  }
};
  
  // Food category definitions for search matching
const foodCategories = {
  'fruits': ['apple', 'banana', 'orange', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'grape', 'watermelon', 'kiwi', 'pineapple', 'mango', 'peach', 'pear', 'plum', 'cherry', 'avocado'],
  'vegetables': ['carrot', 'broccoli', 'spinach', 'lettuce', 'tomato', 'potato', 'onion', 'garlic', 'cucumber', 'pepper', 'zucchini', 'eggplant', 'asparagus', 'kale', 'cabbage', 'cauliflower'],
  'protein': ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna', 'tofu', 'tempeh', 'eggs', 'steak', 'shrimp', 'lamb'],
  'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'cottage cheese', 'sour cream', 'kefir', 'icecream'],
  'grains': ['bread', 'rice', 'pasta', 'cereal', 'oats', 'quinoa', 'barley', 'couscous', 'farro', 'cornmeal', 'flour', 'tortilla'],
  'nuts_seeds': ['almond', 'walnut', 'pecan', 'cashew', 'peanut', 'chia', 'flax', 'pumpkin seed', 'sunflower seed', 'pistachio', 'hazelnut'],
  'beverages': ['coffee', 'tea', 'juice', 'soda', 'water', 'smoothie', 'kombucha', 'wine', 'beer', 'cocktail', 'milk']
};

// Variable to track the next ID for dynamic items
let nextId = 2000;

// Function to dynamically generate grocery items based on search term
const generateDynamicGroceryItems = (searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') return [];
  
  // Clean up and normalize the search query
  const query = searchQuery.toLowerCase().trim();
  const results = [];
  
  // Try to match the search query to a food category or specific food
  let matchedCategory = null;
  let matchedFoods = [];
  
  // Check if search directly matches a category
  for (const [category, foods] of Object.entries(foodCategories)) {
    if (query.includes(category)) {
      matchedCategory = category;
      matchedFoods = foods.slice(0, 10); // Limit to 10 foods from this category
      break;
    }
  }
  
  // If no category match, check if search matches any specific food
  if (!matchedCategory) {
    for (const [category, foods] of Object.entries(foodCategories)) {
      const matchedFood = foods.find(food => query.includes(food) || food.includes(query));
      if (matchedFood) {
        matchedCategory = category;
        // Find similar foods in the same category
        matchedFoods = foods.filter(food => 
          food.includes(matchedFood.substring(0, 3)) || 
          matchedFood.includes(food.substring(0, 3))
        ).slice(0, 8); // Limit to 8 similar foods
        break;
      }
    }
  }
  
  // If we still have no matched foods, use the original approach
  if (matchedFoods.length === 0) {
    // Categories we can assign to new items
    const categories = ['Produce', 'Protein', 'Dairy', 'Grains', 'Snacks', 'Beverages', 'Nuts & Seeds', 'Condiments', 'Baking', 'Canned Goods'];
    
    // Diet types we can assign
    const dietTypes = ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free', 'Low-Fat', 'High-Protein', 'Mediterranean', 'Whole30', 'Dairy-Free'];
    
    // Store sections
    const storeSections = ['Produce', 'Meat', 'Dairy', 'Bakery', 'Dry Goods', 'Frozen', 'Canned Goods', 'Snacks', 'International', 'Health Foods'];
    
    // Generate a random price between $1.99 and $15.99
    const randomPrice = (Math.random() * 14 + 1.99).toFixed(2);
    
    // Random units based on category
    const units = ["lb", "oz", "each", "pack", "bunch", "qt", "gal", "dozen"];
    const randomUnit = units[Math.floor(Math.random() * units.length)];
    
    // Capitalize the search term for item name
    const name = searchQuery
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Default to Produce category if nothing matched
    const displayCategory = 'Produce';
    
    // Create nutrition data
    const nutrition = {
      calories: Math.floor(Math.random() * 100) + 20,
      protein: Math.floor(Math.random() * 3) + 1,
      carbs: Math.floor(Math.random() * 20) + 5,
      fat: Math.floor(Math.random() * 2) + 0.1,
      fiber: Math.floor(Math.random() * 5) + 2
    };
    
    // Select some diet types
    const selectedDietTypes = ['Vegan', 'Vegetarian', 'Gluten-Free'];
    
    // Generate store sections
    const produceSections = ['Produce'];
    
    // Generate store locations
    const storeLocations = [
      { 
        store: "Whole Foods", 
        aisle: `${Math.floor(Math.random() * 20) + 1}`, 
        section: 'Produce'
      },
      { 
        store: "Trader Joe's", 
        aisle: `${Math.floor(Math.random() * 10) + 1}`, 
        section: 'Produce'
      }
    ];
    
    // Generate image URL
    const imageUrl = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c';
    
    // Default to organic
    const isOrganic = true;
    
    // Create new grocery item
    const newItem = {
      id: nextId++,
      name,
      category: displayCategory,
      price: parseFloat(randomPrice),
      unit: randomUnit,
      nutrition,
      dietTypes: selectedDietTypes,
      isOrganic,
      produceSections,
      storeLocations,
      image: `${imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80`
    };
    
    results.push(newItem);
  } else {
    // Create items based on matched foods
    for (const food of matchedFoods) {
      // Convert category to displayable format
      let displayCategory;
      switch(matchedCategory) {
        case 'fruits':
        case 'vegetables':
          displayCategory = 'Produce';
          break;
        case 'protein':
          displayCategory = 'Protein';
          break;
        case 'dairy':
          displayCategory = 'Dairy';
          break;
        case 'grains':
          displayCategory = 'Grains';
          break;
        case 'nuts_seeds':
          displayCategory = 'Nuts & Seeds';
          break;
        case 'beverages':
          displayCategory = 'Beverages';
          break;
        default:
          displayCategory = 'Produce';
      }
      
      // Generate nutrition data based on category
      let nutrition;
      switch(displayCategory) {
        case 'Produce':
          nutrition = {
            calories: Math.floor(Math.random() * 100) + 20,
            protein: Math.floor(Math.random() * 3) + 1,
            carbs: Math.floor(Math.random() * 20) + 5,
            fat: Math.floor(Math.random() * 2) + 0.1,
            fiber: Math.floor(Math.random() * 5) + 2
          };
          break;
        case 'Protein':
          nutrition = {
            calories: Math.floor(Math.random() * 150) + 100,
            protein: Math.floor(Math.random() * 25) + 15,
            carbs: Math.floor(Math.random() * 5),
            fat: Math.floor(Math.random() * 15) + 2,
            fiber: 0
          };
          break;
        case 'Dairy':
          nutrition = {
            calories: Math.floor(Math.random() * 120) + 60,
            protein: Math.floor(Math.random() * 8) + 3,
            carbs: Math.floor(Math.random() * 12) + 1,
            fat: Math.floor(Math.random() * 10) + 2,
            fiber: 0
          };
          break;
        case 'Grains':
          nutrition = {
            calories: Math.floor(Math.random() * 150) + 100,
            protein: Math.floor(Math.random() * 5) + 2,
            carbs: Math.floor(Math.random() * 30) + 20,
            fat: Math.floor(Math.random() * 3) + 0.5,
            fiber: Math.floor(Math.random() * 5) + 1
          };
          break;
        case 'Nuts & Seeds':
          nutrition = {
            calories: Math.floor(Math.random() * 100) + 150,
            protein: Math.floor(Math.random() * 8) + 5,
            carbs: Math.floor(Math.random() * 10) + 5,
            fat: Math.floor(Math.random() * 15) + 8,
            fiber: Math.floor(Math.random() * 5) + 2
          };
          break;
        default:
          nutrition = {
            calories: Math.floor(Math.random() * 200) + 100,
            protein: Math.floor(Math.random() * 10) + 1,
            carbs: Math.floor(Math.random() * 25) + 5,
            fat: Math.floor(Math.random() * 10) + 1,
            fiber: Math.floor(Math.random() * 4) + 0
          };
      }
      
      // Generate diet types based on category
      let dietTypes = [];
      if (displayCategory === 'Produce') {
        dietTypes = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Paleo', 'Whole30'];
      } else if (displayCategory === 'Protein') {
        if (food.includes('tofu') || food.includes('tempeh')) {
          dietTypes = ['Vegan', 'Vegetarian', 'Gluten-Free'];
        } else {
          dietTypes = ['Keto', 'Paleo', 'High-Protein', 'Low-Carb'];
        }
      } else if (displayCategory === 'Dairy') {
        dietTypes = ['Vegetarian', 'Keto', 'High-Protein'];
      } else if (displayCategory === 'Grains') {
        if (food.includes('quinoa') || food.includes('rice')) {
          dietTypes = ['Gluten-Free', 'Vegetarian', 'Vegan'];
        } else {
          dietTypes = ['Vegetarian', 'Vegan', 'Mediterranean'];
        }
      } else if (displayCategory === 'Nuts & Seeds') {
        dietTypes = ['Vegan', 'Vegetarian', 'Paleo', 'Keto', 'Gluten-Free'];
      }
      
      // Capitalize the food name
      const name = food
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Random price based on category
      let price;
      switch(displayCategory) {
        case 'Produce':
          price = (Math.random() * 4 + 0.99).toFixed(2);
          break;
        case 'Protein':
          price = (Math.random() * 10 + 4.99).toFixed(2);
          break;
        case 'Dairy':
          price = (Math.random() * 3 + 2.99).toFixed(2);
          break;
        case 'Grains':
          price = (Math.random() * 4 + 1.99).toFixed(2);
          break;
        case 'Nuts & Seeds':
          price = (Math.random() * 6 + 3.99).toFixed(2);
          break;
        default:
          price = (Math.random() * 5 + 1.99).toFixed(2);
      }
      
      // Units based on category
      let unit;
      switch(displayCategory) {
        case 'Produce':
          unit = Math.random() > 0.5 ? 'lb' : 'each';
          break;
        case 'Protein':
          unit = 'lb';
          break;
        case 'Dairy':
          unit = Math.random() > 0.5 ? 'oz' : 'qt';
          break;
        case 'Grains':
          unit = Math.random() > 0.5 ? 'oz' : 'lb';
          break;
        case 'Nuts & Seeds':
          unit = 'oz';
          break;
        default:
          unit = 'each';
      }
      
      // Store sections based on category
      let storeSections;
      switch(displayCategory) {
        case 'Produce':
          storeSections = ['Produce'];
          break;
        case 'Protein':
          storeSections = ['Meat', 'Refrigerated'];
          break;
        case 'Dairy':
          storeSections = ['Dairy', 'Refrigerated'];
          break;
        case 'Grains':
          storeSections = ['Dry Goods', 'Bakery'];
          break;
        case 'Nuts & Seeds':
          storeSections = ['Nuts & Seeds', 'Snacks', 'Health Foods'];
          break;
        default:
          storeSections = ['Produce'];
      }
      
      // Generate store locations
      const storeLocations = [
        { 
          store: "Whole Foods", 
          aisle: `${Math.floor(Math.random() * 20) + 1}`, 
          section: storeSections[0] 
        },
        { 
          store: "Trader Joe's", 
          aisle: `${Math.floor(Math.random() * 10) + 1}`, 
          section: storeSections[0] 
        }
      ];
      
      // Generate image URL based on category
      const imagePlaceholders = {
        'Produce': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c',
        'Protein': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
        'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da',
        'Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
        'Nuts & Seeds': 'https://images.unsplash.com/photo-1536816579748-4ecb3f03d72a',
        'Beverages': 'https://images.unsplash.com/photo-1550583724-b2692b85b150'
      };
      
      const imageUrl = imagePlaceholders[displayCategory] || 'https://images.unsplash.com/photo-1604742763101-7cbec5bc45f1';
      
      // Create the new grocery item
      const newItem = {
        id: nextId++,
        name: name,
        category: displayCategory,
        price: parseFloat(price),
        unit: unit,
        nutrition: nutrition,
        dietTypes: dietTypes,
        isOrganic: Math.random() > 0.5, // 50% chance of being organic
        storeSections: storeSections,
        storeLocations: storeLocations,
        image: `${imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80`
      };
      
      results.push(newItem);
    }
  }
  
  // Return dynamic items
  return results;
};

  // State for search loading indicators
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [enableDietFiltering, setEnableDietFiltering] = useState(false);
  const [selectedDietType, setSelectedDietType] = useState('all');
  
  // Add debounce to search term to avoid unnecessary API calls
  useEffect(() => {
    // Set a timeout to update the debounced search term
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce time
    
    // Cleanup function to clear the timeout if search term changes again within debounce time
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  // Filter items based on search and category with debounced search
  useEffect(() => {
    // Create a flag to handle component unmounting during async operations
    let isMounted = true;
    
    const filterItems = async () => {
      let items = groceryItems;
      
      // Only start search if there's a valid search term
      if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 0) {
        // Show loading state
        setIsSearching(true);
        
        try {
          // Search with the Spoonacular API for new dynamic results
          const apiSearchResults = await fetchGroceryItems({ 
            query: debouncedSearchTerm.trim(),
            diet: selectedDietType !== 'all' ? selectedDietType : undefined
          });
          
          // Check if component is still mounted before updating state
          if (!isMounted) return;
          
          // If we got results from the API, use them
          if (apiSearchResults && apiSearchResults.length > 0) {
            console.log(`Found ${apiSearchResults.length} items from API search for "${debouncedSearchTerm}"`);
            items = apiSearchResults;
            
            // Update the main grocery items list with these new items to keep them available
            setGroceryItems(prevItems => {
              // Combine existing items with new ones, avoiding duplicates by ID
              const existingIds = new Set(prevItems.map(item => item.id));
              const newItems = apiSearchResults.filter(item => !existingIds.has(item.id));
              
              // If we found new items, add them to the existing items
              if (newItems.length > 0) {
                return [...prevItems, ...newItems];
              }
              return prevItems;
            });
          } else {
            // Fallback: search existing items and generate new ones if needed
            console.log("API search returned no results, falling back to existing items");
            
            // Fallback to searching the existing items
            const searchResults = await fetchRealGroceryData(debouncedSearchTerm);
            
            if (searchResults && searchResults.length > 0) {
              items = searchResults;
            } else {
              console.warn('Both API and fallback search returned no results');
              
              // Do a basic filter on the existing items as a last resort
              const search = debouncedSearchTerm.toLowerCase().trim();
              
              // Split search into words to handle multiple search terms
              const searchTerms = search.split(/\s+/).filter(term => term.length > 0);
              
              if (searchTerms.length > 0) {
                items = groceryItems.filter(item => {
                  // Check if any search term matches
                  return searchTerms.some(term => {
                    return item.name.toLowerCase().includes(term) || 
                           item.category.toLowerCase().includes(term);
                  });
                });
              }
            }
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error in API search:', error);
            // Fallback to existing search method
            try {
              const fallbackResults = await fetchRealGroceryData(debouncedSearchTerm);
              if (fallbackResults && fallbackResults.length > 0) {
                items = fallbackResults;
              }
            } catch (fallbackError) {
              console.error('Fallback search also failed:', fallbackError);
            }
          }
        } finally {
          // Hide loading state if component is still mounted
          if (isMounted) {
            setIsSearching(false);
          }
        }
      }
      
      // Filter by category
      if (selectedCategory !== 'All' && isMounted) {
        items = items.filter(item => item.category === selectedCategory);
      }
      
      // Filter by diet types based on user's preferences from WorkoutPlanContext
      if (isMounted && dietaryPreferences && enableDietFiltering) {
        // Map from our diet types to the dietTypes in grocery items
        const dietTypeMap = {
          'vegan': 'Vegan',
          'vegetarian': 'Vegetarian',
          'keto': 'Keto',
          'paleo': 'Paleo',
          'gluten_free': 'Gluten-Free',
          'high-protein': 'High-Protein',
          'balanced': 'Mediterranean',
          'athletic': 'Performance',
          'muscle_gain': 'High-Protein',
          'weight_loss': 'Low-Fat'
        };
        
        // Get the appropriate diet type to filter by
        const dietToFilterBy = dietTypeMap[dietaryPreferences.primaryDiet] || null;
        
        // If we have a valid diet filter
        if (dietToFilterBy) {
          console.log(`Filtering items by diet type: ${dietToFilterBy}`);
          items = items.filter(item => 
            // Check if item's dietTypes includes the user's preferred diet
            item.dietTypes && item.dietTypes.some(diet => diet === dietToFilterBy)
          );
        }
        
        // Check for restrictions and filter those out
        if (dietaryPreferences.restrictions && dietaryPreferences.restrictions.length > 0) {
          // Items to exclude based on restrictions
          const excludeTerms = [];
          
          if (dietaryPreferences.restrictions.includes('dairy_free')) {
            excludeTerms.push('milk', 'cheese', 'yogurt', 'cream');
          }
          
          if (dietaryPreferences.restrictions.includes('gluten_free')) {
            excludeTerms.push('wheat', 'gluten', 'bread', 'pasta');
          }
          
          // Filter out items containing excluded terms
          if (excludeTerms.length > 0) {
            items = items.filter(item => {
              const itemName = item.name.toLowerCase();
              return !excludeTerms.some(term => itemName.includes(term));
            });
          }
        }
      }
      
      // Update filtered items if component is still mounted
      if (isMounted) {
        setFilteredItems(items);
      }
    };
    
    // Execute filter function
    filterItems();
    
    // Cleanup function to set mounted flag to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [debouncedSearchTerm, selectedCategory, groceryItems, dietaryPreferences, enableDietFiltering]);
  
  // Memorize filtered items to prevent unnecessary re-renders
  const memoizedFilteredItems = useMemo(() => filteredItems, [filteredItems]);
  
  // Load meal plan ingredients if a meal plan is selected
  // Handle meal plan questionnaire results
  const handleMealPlanningComplete = (formData) => {
    setMealPlanningResults(formData);
    setShowMealPlanningQuestionnaire(false);
    
    // Generate meal plan based on questionnaire responses
    const mealPlan = generateMealPlan(formData);
    setGeneratedMealPlan(mealPlan);
    
    // Set dietary filters based on responses for grocery filtering
    if (formData.dietaryRestrictions && formData.dietaryRestrictions.length > 0) {
      // Map from our dietary restriction values to dietTypes used in grocery items
      const dietFilterMap = {
        'vegetarian': 'Vegetarian',
        'vegan': 'Vegan',
        'gluten_free': 'Gluten-Free',
        'dairy_free': 'Dairy-Free',
        'keto': 'Keto',
        'paleo': 'Paleo',
        'low_carb': 'Low-Carb',
        'mediterranean': 'Mediterranean'
      };
      
      // Set diet filters based on restrictions
      const newDietFilters = formData.dietaryRestrictions
        .filter(r => dietFilterMap[r]) // Filter out restrictions without mappings
        .map(r => dietFilterMap[r]);   // Map to grocery diet type format
      
      setDietFilters(newDietFilters);
    }
    
    // Set food group filters based on preferences
    setFoodGroupFilters(formData.foodGroups);
    
    // Save to fitness profile in context for future use
    saveFitnessProfile({
      preferredDiet: formData.dietaryRestrictions[0] || 'balanced',
      dietaryRestrictions: formData.dietaryRestrictions.join(','),
      mealsPerDay: formData.numMealsPerDay,
      primaryGoal: formData.goals[0] || 'general_health',
      currentDiet: formData.dietaryRestrictions[0] || ''
    });
    
    // Switch to browse tab to show filtered results
    setActiveTab(0);
  };
  
  // Generate a personalized meal plan based on the questionnaire responses
  const generateMealPlan = (formData) => {
    // Use goals, restrictions, and preferences to create a meal plan
    const caloricGoal = formData.calorieGoal;
    const dietType = formData.dietaryRestrictions[0] || 'balanced';
    const numMeals = formData.numMealsPerDay;
    const preferredFoodGroups = Object.entries(formData.foodGroups)
      .filter(([_, value]) => value >= 7)
      .map(([key, _]) => key);
    
    // Generate a basic structure for the meal plan
    const mealPlan = {
      title: `Custom ${dietType.charAt(0).toUpperCase() + dietType.slice(1)} Meal Plan`,
      description: `A personalized meal plan based on your preferences and goals${formData.goals.length > 0 ? ` focused on ${formData.goals.join(', ')}` : ''}.`,
      dailyCalories: caloricGoal,
      mealsPerDay: numMeals,
      restrictions: formData.dietaryRestrictions,
      allergies: formData.allergies,
      days: []
    };
    
    // Generate meal plan for 7 days
    for (let i = 0; i < 7; i++) {
      const day = {
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
        meals: []
      };
      
      // Add meals based on preferences
      if (formData.mealPreferences.breakfast) {
        day.meals.push({
          type: 'Breakfast',
          calories: Math.floor(caloricGoal * 0.25),
          options: generateMealOptions('Breakfast', dietType, preferredFoodGroups)
        });
      }
      
      if (formData.mealPreferences.lunch) {
        day.meals.push({
          type: 'Lunch',
          calories: Math.floor(caloricGoal * 0.3),
          options: generateMealOptions('Lunch', dietType, preferredFoodGroups)
        });
      }
      
      if (formData.mealPreferences.dinner) {
        day.meals.push({
          type: 'Dinner',
          calories: Math.floor(caloricGoal * 0.35),
          options: generateMealOptions('Dinner', dietType, preferredFoodGroups)
        });
      }
      
      if (formData.mealPreferences.snacks) {
        day.meals.push({
          type: 'Snack',
          calories: Math.floor(caloricGoal * 0.1),
          options: generateMealOptions('Snack', dietType, preferredFoodGroups)
        });
      }
      
      mealPlan.days.push(day);
    }
    
    // Generate shopping list based on the meal plan
    mealPlan.shoppingList = generateShoppingList(mealPlan, formData);
    
    return mealPlan;
  };
  
  // Helper to generate meal options for a specific meal type
  const generateMealOptions = (mealType, dietType, preferredFoodGroups) => {
    // Define meal templates based on diet type
    const mealTemplates = {
      'Breakfast': {
        'vegetarian': [
          'Greek Yogurt with Berries and Granola',
          'Avocado Toast with Poached Eggs',
          'Overnight Oats with Almond Milk and Fruits',
          'Spinach and Mushroom Omelette',
          'Whole Grain Pancakes with Fruit Compote'
        ],
        'vegan': [
          'Tofu Scramble with Vegetables',
          'Overnight Oats with Almond Milk and Fruits',
          'Smoothie Bowl with Chia Seeds and Berries',
          'Avocado Toast with Nutritional Yeast',
          'Vegan Breakfast Burrito with Beans and Salsa'
        ],
        'gluten_free': [
          'Gluten-Free Oatmeal with Berries',
          'Egg Muffins with Spinach and Feta',
          'Greek Yogurt Parfait with Gluten-Free Granola',
          'Sweet Potato Breakfast Hash',
          'Smoothie Bowl with Chia Seeds and Nuts'
        ],
        'keto': [
          'Bacon and Avocado Breakfast Bowl',
          'Keto Eggs Benedict without English Muffin',
          'Cream Cheese Pancakes',
          'Sausage and Spinach Frittata',
          'Keto Breakfast Casserole'
        ],
        'balanced': [
          'Greek Yogurt with Honey and Granola',
          'Whole Grain Toast with Avocado and Egg',
          'Oatmeal with Fresh Berries and Almonds',
          'Vegetable Omelette with Toast',
          'Protein Smoothie with Banana and Peanut Butter'
        ],
        'low_carb': [
          'Egg Muffins with Vegetables',
          'Greek Yogurt with Berries and Nuts',
          'Avocado and Egg Breakfast Bowl',
          'Turkey Breakfast Sausage with Vegetables',
          'Cottage Cheese with Sliced Almonds and Berries'
        ]
      },
      'Lunch': {
        'vegetarian': [
          'Quinoa Salad with Roasted Vegetables',
          'Lentil Soup with Whole Grain Bread',
          'Greek Salad with Feta Cheese',
          'Vegetable Wrap with Hummus',
          'Caprese Sandwich on Whole Grain Bread'
        ],
        'vegan': [
          'Buddha Bowl with Tofu and Tahini Dressing',
          'Lentil and Vegetable Soup',
          'Chickpea Salad Sandwich',
          'Quinoa Bowl with Roasted Vegetables',
          'Vegan Burrito with Black Beans and Guacamole'
        ],
        'gluten_free': [
          'Chicken and Rice Bowl with Vegetables',
          'Gluten-Free Wrap with Turkey and Avocado',
          'Quinoa Salad with Grilled Chicken',
          'Stuffed Sweet Potato with Black Beans',
          'Shrimp and Vegetable Stir-Fry over Rice'
        ],
        'keto': [
          'Chicken Caesar Salad without Croutons',
          'Tuna Salad Lettuce Wraps',
          'Zucchini Noodles with Alfredo Sauce and Chicken',
          'Bacon Avocado Burger without Bun',
          'Egg Salad on Cloud Bread'
        ],
        'balanced': [
          'Turkey and Avocado Wrap',
          'Greek Salad with Grilled Chicken',
          'Quinoa Bowl with Roasted Vegetables and Tofu',
          'Mediterranean Tuna Salad',
          'Black Bean and Sweet Potato Burrito'
        ],
        'low_carb': [
          'Grilled Chicken Salad with Olive Oil Dressing',
          'Lettuce-Wrapped Turkey Burger',
          'Cauliflower Rice Bowl with Grilled Shrimp',
          'Tuna Salad Stuffed Avocados',
          'Zucchini Noodles with Pesto and Chicken'
        ]
      },
      'Dinner': {
        'vegetarian': [
          'Eggplant Parmesan with Side Salad',
          'Vegetable Stir-Fry with Tofu',
          'Black Bean and Sweet Potato Enchiladas',
          'Mushroom Risotto with Grilled Asparagus',
          'Spinach and Ricotta Stuffed Shells'
        ],
        'vegan': [
          'Lentil and Vegetable Curry with Rice',
          'Tempeh Stir-Fry with Broccoli and Carrots',
          'Sweet Potato and Black Bean Chili',
          'Vegan Buddha Bowl with Tahini Dressing',
          'Chickpea and Vegetable Tagine'
        ],
        'gluten_free': [
          'Baked Salmon with Roasted Vegetables',
          'Gluten-Free Pasta with Turkey Meatballs',
          'Stuffed Bell Peppers with Ground Turkey',
          'Garlic Shrimp with Zucchini Noodles',
          'Herb-Roasted Chicken with Quinoa and Vegetables'
        ],
        'keto': [
          'Baked Salmon with Asparagus',
          'Steak with Butter-Fried Vegetables',
          'Chicken Thighs with Creamed Spinach',
          'Bacon-Wrapped Pork Tenderloin with Brussels Sprouts',
          'Shrimp and Cauliflower Fried "Rice"'
        ],
        'balanced': [
          'Grilled Chicken with Roasted Vegetables',
          'Baked Salmon with Quinoa and Broccoli',
          'Turkey Chili with Mixed Green Salad',
          'Stir-Fry with Lean Beef and Brown Rice',
          'Shrimp and Vegetable Pasta Primavera'
        ],
        'low_carb': [
          'Baked Cod with Roasted Vegetables',
          'Grilled Chicken with Cauliflower Mash',
          'Pork Tenderloin with Sautéed Greens',
          'Turkey Stuffed Bell Peppers',
          'Beef and Broccoli Stir-Fry without Rice'
        ]
      },
      'Snack': {
        'vegetarian': [
          'Greek Yogurt with Honey',
          'Apple Slices with Almond Butter',
          'Hummus with Carrot Sticks',
          'String Cheese with Fruit',
          'Trail Mix with Nuts and Dried Fruit'
        ],
        'vegan': [
          'Hummus with Vegetable Sticks',
          'Apple Slices with Almond Butter',
          'Trail Mix with Nuts and Seeds',
          'Roasted Chickpeas',
          'Sliced Fruit with Coconut Yogurt'
        ],
        'gluten_free': [
          'Rice Cakes with Almond Butter',
          'Greek Yogurt with Berries',
          'Hard-Boiled Eggs',
          'Gluten-Free Pretzels with Hummus',
          'Fruit and Nut Mix'
        ],
        'keto': [
          'Cheese Cubes and Olives',
          'Avocado with Salt and Pepper',
          'Hard-Boiled Eggs',
          'Cucumber Slices with Cream Cheese',
          'Bacon-Wrapped Asparagus'
        ],
        'balanced': [
          'Apple Slices with Peanut Butter',
          'Greek Yogurt with Berries',
          'Hummus with Vegetable Sticks',
          'Trail Mix with Nuts and Dried Fruit',
          'Whole Grain Crackers with Cheese'
        ],
        'low_carb': [
          'Celery Sticks with Almond Butter',
          'Hard-Boiled Eggs',
          'String Cheese',
          'Turkey Roll-Ups with Avocado',
          'Cucumber Slices with Tuna Salad'
        ]
      }
    };
    
    // Use the right diet type or fallback to balanced
    const dietKey = dietType in mealTemplates[mealType] ? dietType : 'balanced';
    const options = mealTemplates[mealType][dietKey];
    
    // Select 2-3 options randomly, favoring meals with preferred food groups if possible
    const shuffledOptions = [...options].sort(() => 0.5 - Math.random());
    return shuffledOptions.slice(0, 3);
  };
  
  // Generate a shopping list based on the meal plan
  const generateShoppingList = (mealPlan, formData) => {
    const shoppingItems = {};
    
    // Map common meal components to grocery categories
    const ingredientCategories = {
      'chicken': 'Protein',
      'beef': 'Protein',
      'turkey': 'Protein',
      'pork': 'Protein',
      'lamb': 'Protein',
      'fish': 'Protein',
      'salmon': 'Protein',
      'tuna': 'Protein',
      'shrimp': 'Protein',
      'tofu': 'Protein',
      'tempeh': 'Protein',
      'eggs': 'Protein',
      'yogurt': 'Dairy',
      'cheese': 'Dairy',
      'milk': 'Dairy',
      'cream': 'Dairy',
      'butter': 'Dairy',
      'rice': 'Grains',
      'quinoa': 'Grains',
      'pasta': 'Grains',
      'bread': 'Grains',
      'oats': 'Grains',
      'granola': 'Grains',
      'broccoli': 'Produce',
      'spinach': 'Produce',
      'kale': 'Produce',
      'lettuce': 'Produce',
      'carrot': 'Produce',
      'tomato': 'Produce',
      'potato': 'Produce',
      'sweet potato': 'Produce',
      'zucchini': 'Produce',
      'bell pepper': 'Produce',
      'onion': 'Produce',
      'garlic': 'Produce',
      'avocado': 'Produce',
      'apple': 'Produce',
      'banana': 'Produce',
      'berries': 'Produce',
      'almond': 'Nuts & Seeds',
      'walnut': 'Nuts & Seeds',
      'cashew': 'Nuts & Seeds',
      'peanut': 'Nuts & Seeds',
      'chia': 'Nuts & Seeds',
      'flax': 'Nuts & Seeds',
      'olive oil': 'Oils & Vinegars',
      'coconut oil': 'Oils & Vinegars',
      'beans': 'Canned Goods',
      'lentils': 'Canned Goods',
      'chickpeas': 'Canned Goods',
      'hummus': 'Refrigerated'
    };
    
    // Extract ingredients from meal options
    const mealMentions = new Set();
    mealPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.options.forEach(option => {
          // Split meal options into words to match ingredients
          const words = option.toLowerCase().split(/\s+/);
          for (const word of words) {
            // Check if this word is a known ingredient
            for (const [ingredient, category] of Object.entries(ingredientCategories)) {
              if (option.toLowerCase().includes(ingredient.toLowerCase())) {
                if (!shoppingItems[category]) {
                  shoppingItems[category] = [];
                }
                if (!shoppingItems[category].includes(ingredient)) {
                  shoppingItems[category].push(ingredient);
                }
                mealMentions.add(ingredient);
              }
            }
          }
        });
      });
    });
    
    // Generate the shopping list with structured categories
    const shoppingList = [];
    
    for (const [category, items] of Object.entries(shoppingItems)) {
      shoppingList.push({
        category: category,
        items: items.map(item => ({
          name: item.charAt(0).toUpperCase() + item.slice(1),
          quantity: 1,
          unit: getDefaultUnit(item),
          checked: false
        }))
      });
    }
    
    return shoppingList;
  };
  
  // Helper to determine default unit for shopping list items
  const getDefaultUnit = (item) => {
    const unitMap = {
      'chicken': 'lb',
      'beef': 'lb',
      'turkey': 'lb',
      'pork': 'lb',
      'lamb': 'lb',
      'fish': 'lb',
      'salmon': 'lb',
      'tuna': 'can',
      'shrimp': 'lb',
      'tofu': 'package',
      'tempeh': 'package',
      'eggs': 'dozen',
      'yogurt': 'container',
      'cheese': 'oz',
      'milk': 'gallon',
      'cream': 'pint',
      'butter': 'stick',
      'rice': 'lb',
      'quinoa': 'cup',
      'pasta': 'box',
      'bread': 'loaf',
      'oats': 'cup',
      'granola': 'cup',
      'broccoli': 'head',
      'spinach': 'bag',
      'kale': 'bunch',
      'lettuce': 'head',
      'carrot': 'lb',
      'tomato': 'lb',
      'potato': 'lb',
      'sweet potato': 'lb',
      'zucchini': 'each',
      'bell pepper': 'each',
      'onion': 'each',
      'garlic': 'head',
      'avocado': 'each',
      'apple': 'each',
      'banana': 'bunch',
      'berries': 'container',
      'almond': 'oz',
      'walnut': 'oz',
      'cashew': 'oz',
      'peanut': 'jar',
      'chia': 'tbsp',
      'flax': 'tbsp',
      'olive oil': 'bottle',
      'coconut oil': 'jar',
      'beans': 'can',
      'lentils': 'cup',
      'chickpeas': 'can',
      'hummus': 'container'
    };
    
    return unitMap[item] || 'each';
  };
  
  // Component to display the generated meal plan
  const MealPlanResults = ({ mealPlan }) => {
    const [selectedDay, setSelectedDay] = useState(0);
    
    const addToCart = (item) => {
      // Find or create grocery items for each shopping list item
      const groceryItem = groceryItems.find(g => 
        g.name.toLowerCase().includes(item.name.toLowerCase()) || 
        item.name.toLowerCase().includes(g.name.toLowerCase())
      );
      
      if (groceryItem) {
        handleAddToCart(groceryItem, item.quantity || 1);
      } else {
        // Create a new grocery item if none found
        const newItem = {
          id: nextId++,
          name: item.name,
          category: item.category || 'Other',
          price: (Math.random() * 5 + 1.99).toFixed(2),
          unit: item.unit || 'each',
          nutrition: {
            calories: Math.floor(Math.random() * 200) + 50,
            protein: Math.floor(Math.random() * 10) + 1,
            carbs: Math.floor(Math.random() * 20) + 5,
            fat: Math.floor(Math.random() * 10) + 1,
            fiber: Math.floor(Math.random() * 5)
          },
          dietTypes: [...(dietFilters.length > 0 ? dietFilters : ['Vegetarian'])],
          isOrganic: Math.random() > 0.5,
          storeSections: [item.category || 'Other'],
          storeLocations: [
            { store: "Whole Foods", aisle: "1", section: item.category || 'Other' },
            { store: "Trader Joe's", aisle: "2", section: item.category || 'Other' }
          ],
          image: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        };
        
        setGroceryItems(prev => [...prev, newItem]);
        handleAddToCart(newItem, item.quantity || 1);
      }
    };
    
    const addAllToCart = () => {
      // Flatten all shopping list items and add to cart
      const allItems = [];
      mealPlan.shoppingList.forEach(category => {
        category.items.forEach(item => {
          allItems.push({
            ...item,
            category: category.category
          });
        });
      });
      
      // Add each item to cart
      allItems.forEach(item => addToCart(item));
    };
    
    return (
      <Box>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: theme.palette.primary.main }}>
                {mealPlan.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {mealPlan.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  icon={<LocalDiningIcon />} 
                  label={`${mealPlan.dailyCalories} calories/day`} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<RestaurantMenuIcon />} 
                  label={`${mealPlan.mealsPerDay} meals/day`} 
                  color="primary" 
                  variant="outlined" 
                />
                {mealPlan.restrictions.filter(r => r !== 'none').map((restriction, index) => (
                  <Chip 
                    key={index}
                    label={restriction.replace('_', ' ')} 
                    color="secondary" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={addAllToCart}
              startIcon={<ShoppingCartIcon />}
            >
              Add All Items to Cart
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              7-Day Meal Plan
            </Typography>
            
            <Box sx={{ display: 'flex', overflow: 'auto', gap: 1, mb: 2, pb: 1 }}>
              {mealPlan.days.map((day, index) => (
                <Button
                  key={index}
                  variant={selectedDay === index ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setSelectedDay(index)}
                  sx={{ minWidth: '100px' }}
                >
                  {day.day}
                </Button>
              ))}
            </Box>
            
            <Box>
              {mealPlan.days[selectedDay].meals.map((meal, mealIndex) => (
                <Paper 
                  key={mealIndex} 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 2,
                    borderLeft: `4px solid ${
                      meal.type === 'Breakfast' ? '#8bc34a' : 
                      meal.type === 'Lunch' ? '#2196f3' : 
                      meal.type === 'Dinner' ? '#ff9800' : 
                      '#9e9e9e'
                    }`
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {meal.type} ({meal.calories} calories)
                  </Typography>
                  
                  <List sx={{ pt: 0 }}>
                    {meal.options.map((option, optionIndex) => (
                      <ListItem key={optionIndex} sx={{ px: 1 }}>
                        <ListItemText primary={option} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ))}
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Shopping List
            </Typography>
            
            <Grid container spacing={2}>
              {mealPlan.shoppingList.map((category, categoryIndex) => (
                <Grid item xs={12} sm={6} md={4} key={categoryIndex}>
                  <Paper elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {category.category}
                    </Typography>
                    
                    <List dense>
                      {category.items.map((item, itemIndex) => (
                        <ListItem
                          key={itemIndex}
                          secondaryAction={
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => addToCart({...item, category: category.category})}
                              sx={{ minWidth: 0, p: '4px 8px' }}
                            >
                              <AddCircleOutlineIcon fontSize="small" />
                            </Button>
                          }
                        >
                          <ListItemText 
                            primary={item.name} 
                            secondary={`${item.quantity} ${item.unit}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Box>
    );
  };

  useEffect(() => {
    if (currentMealPlan) {
      const ingredientItems = currentMealPlan.ingredients.map(ingredient => {
        const groceryItem = mockGroceryItems.find(item => item.id === ingredient.itemId);
        if (groceryItem) {
          return {
            ...groceryItem,
            quantity: ingredient.quantity
          };
        }
        return null;
      }).filter(Boolean);
      
      setCartItems(ingredientItems);
    }
  }, [currentMealPlan]);
  
  // Function to get user's current location using the browser's Geolocation API
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        setLocationError(`Error: ${error.message}`);
        setLocationLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Automatically get user location when cart tab is opened
  useEffect(() => {
    if (activeTab === 1 && cartItems.length > 0 && !userLocation && !locationLoading) {
      // Request user's location when the cart tab is opened with items in cart
      // Add a small delay to avoid immediate permission dialog
      const timer = setTimeout(() => {
        getUserLocation();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, cartItems.length, userLocation, locationLoading]);
  
  // Initialize with default stores on component mount
  useEffect(() => {
    // Ensure the component starts with some default stores
    if (!availableStores || availableStores.length === 0) {
      setAvailableStores(generateFallbackStores());
    }
  }, []);
  
  // Handle adding item to cart
  const handleAddToCart = (item, quantity) => {
    setCartItems(prevItems => {
      // Check if item already in cart
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity if already in cart
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity
        };
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { ...item, quantity }];
      }
    });
  };
  
  // Handle updating item quantity in cart
  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  // Handle removing item from cart
  const handleRemoveFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };
  
  // Check if item is in cart
  const isInCart = (itemId) => {
    return cartItems.some(item => item.id === itemId);
  };
  
  // Get item quantity in cart
  const getCartQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle meal plan selection
  const handleMealPlanSelect = async (mealPlan) => {
    // Always generate fresh dynamic ingredients when a meal plan is selected
    console.log("Refreshing meal plan with dynamic ingredients...");
    
    // Get a copy of the meal plan
    const refreshedPlan = {
      ...mealPlan,
      generatedOn: new Date().toLocaleString() // Add timestamp to show it's refreshed
    };
    
    // Refresh ingredients with dynamically generated ones
    // This creates more variety each time a meal plan is selected
    try {
      const refreshedIngredients = await refreshMealPlanIngredients(refreshedPlan.ingredients, refreshedPlan.dietType);
      refreshedPlan.ingredients = refreshedIngredients;
      console.log("Successfully refreshed meal plan ingredients:", refreshedIngredients);
    } catch (error) {
      console.error("Error refreshing meal plan ingredients:", error);
    }
    
    // Set the updated meal plan
    setCurrentMealPlan(refreshedPlan);
    
    // Show a visual indicator that ingredients have been refreshed
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1000);
  };
  
  // Function to refresh and update meal plan ingredients
const refreshMealPlanIngredients = async (ingredients, dietType) => {
  console.log(`Refreshing meal plan for ${dietType} diet using API data`);
  
  try {
    // Get ingredients from Spoonacular API based on diet type
    const apiIngredients = await fetchGroceryItems({ 
      diet: dietType.toLowerCase().replace('_', '-'),
      number: 20 // Get 20 ingredients that match this diet
    });
    
    if (apiIngredients && apiIngredients.length > 0) {
      console.log(`Successfully fetched ${apiIngredients.length} ingredients for ${dietType} diet from API`);
      
      // Process ingredients into the structure expected by meal plans
      const processedIngredients = apiIngredients.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: Math.floor(Math.random() * 3) + 1, // Random quantity 1-3
        unit: item.unit || "item"
      }));
      
      // Return a mix of original and new ingredients
      // Keep some original ingredients for stability
      const originalIngredientsToKeep = ingredients.slice(0, Math.min(5, ingredients.length));
      return [...originalIngredientsToKeep, ...processedIngredients.slice(0, 15)];
    } else {
      console.warn("API didn't return ingredients, falling back to diet type mapping");
      // Fall back to the static mapping if API fails
      throw new Error("API returned no ingredients");
    }
  } catch (error) {
    console.error("Error refreshing ingredients from API:", error);
    
    // Fallback to the static mapping
    console.log("Using fallback static ingredient data");
    
    // Get the diet-specific ingredient suggestions
  const dietIngredients = {
    "High-Protein": {
      proteins: ['chicken breast', 'turkey', 'salmon', 'tuna', 'eggs', 'greek yogurt', 'cottage cheese', 'tofu'],
      produce: ['spinach', 'broccoli', 'kale', 'peppers', 'brussels sprouts', 'blueberries', 'strawberries'],
      grains: ['quinoa', 'brown rice', 'oats'],
      others: ['protein powder', 'chia seeds', 'almonds', 'walnuts']
    },
    "Mediterranean": {
      proteins: ['fish', 'salmon', 'chicken', 'beans', 'lentils', 'chickpeas'],
      produce: ['tomatoes', 'cucumber', 'olives', 'spinach', 'eggplant', 'zucchini', 'oranges', 'grapes'],
      grains: ['bulgur', 'farro', 'couscous', 'whole grain bread'],
      others: ['olive oil', 'feta cheese', 'yogurt', 'hummus', 'tahini', 'walnuts']
    },
    "Keto": {
      proteins: ['beef', 'bacon', 'salmon', 'chicken thighs', 'eggs', 'pork'],
      produce: ['avocado', 'spinach', 'zucchini', 'cauliflower', 'broccoli', 'cabbage', 'berries'],
      grains: ['almond flour', 'coconut flour'],
      others: ['butter', 'olive oil', 'coconut oil', 'cheese', 'heavy cream', 'nuts', 'seeds']
    },
    "Vegan": {
      proteins: ['tofu', 'tempeh', 'seitan', 'lentils', 'beans', 'chickpeas', 'edamame'],
      produce: ['spinach', 'kale', 'broccoli', 'sweet potatoes', 'mushrooms', 'berries', 'bananas'],
      grains: ['quinoa', 'brown rice', 'oats', 'farro', 'barley'],
      others: ['nutritional yeast', 'chia seeds', 'flax seeds', 'almond milk', 'cashews', 'peanut butter']
    },
    "Paleo": {
      proteins: ['chicken', 'beef', 'turkey', 'pork', 'eggs', 'salmon', 'tuna'],
      produce: ['spinach', 'kale', 'broccoli', 'sweet potatoes', 'berries', 'apples', 'avocado'],
      grains: [],
      others: ['almond flour', 'coconut flour', 'olive oil', 'coconut oil', 'almonds', 'walnuts']
    },
    "Gluten-Free": {
      proteins: ['chicken', 'beef', 'fish', 'eggs', 'tofu'],
      produce: ['spinach', 'broccoli', 'carrots', 'peppers', 'berries', 'apples', 'bananas'],
      grains: ['rice', 'quinoa', 'gluten-free oats', 'buckwheat'],
      others: ['almond flour', 'tapioca flour', 'gluten-free bread', 'chia seeds']
    }
  }[dietType] || { proteins: [], produce: [], grains: [], others: [] };
  
  // Create a fresh ingredients list
  const getRefreshedIngredients = async () => {
    const refreshedIngredients = [];
    
    // Determine percentage of ingredients to refresh (30-50%)
    const refreshRatio = Math.random() * 0.2 + 0.3;
    const numToKeep = Math.floor(ingredients.length * (1 - refreshRatio));
    
    // Keep some existing ingredients
    const ingredientsToKeep = [...ingredients]
      .sort(() => 0.5 - Math.random())
      .slice(0, numToKeep);
    
    refreshedIngredients.push(...ingredientsToKeep);
    console.log(`Kept ${ingredientsToKeep.length} original ingredients`);
    
    // Track categories we've already added to avoid duplicates
    const addedCategories = new Set(ingredientsToKeep.map(ing => getCategoryFromName(ing.name)));
    
    // Add new ingredients from each category
    const addNewIngredients = async (categoryItems, categoryName, count) => {
      if (categoryItems.length === 0) return;
      
      // Skip if we already have enough of this category
      if (addedCategories.has(categoryName) && Math.random() > 0.3) return;
      
      // Randomly pick items from the category
      const shuffled = [...categoryItems].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      
      for (const item of selected) {
        try {
          // Try to find or generate a new item
          const newItems = await fetchRealGroceryData(item);
          
          // If we found matching items, pick one
          if (newItems && newItems.length > 0) {
            // Pick first item that matches
            const newItem = newItems[0];
            
            // Create a new ingredient entry
            refreshedIngredients.push({
              itemId: newItem.id,
              name: newItem.name,
              quantity: (Math.random() * 2 + 0.5).toFixed(1), // Random quantity between 0.5 and 2.5
              unit: newItem.unit
            });
            
            addedCategories.add(categoryName);
          }
        } catch (error) {
          console.error(`Error adding ${item} ingredient:`, error);
        }
      }
    };
    
    // Add ingredients from each category based on diet type
    await addNewIngredients(dietIngredients.proteins, 'protein', 2);
    await addNewIngredients(dietIngredients.produce, 'vegetable', 3);
    await addNewIngredients(dietIngredients.grains, 'grain', 1);
    await addNewIngredients(dietIngredients.others, 'other', 2);
    
    console.log(`Created refreshed ingredient list with ${refreshedIngredients.length} items`);
    return refreshedIngredients;
  };
  
  // Generate and return the refreshed ingredients
  const refreshedIngredients = await getRefreshedIngredients();
  return refreshedIngredients;
};
  
  // Helper function to determine category from item name
  const getCategoryFromName = (name) => {
    const nameLower = name.toLowerCase();
    
    // Simple keyword matching for determining category
    if (nameLower.includes('chicken') || nameLower.includes('beef') || 
        nameLower.includes('fish') || nameLower.includes('salmon') ||
        nameLower.includes('tofu') || nameLower.includes('turkey') ||
        nameLower.includes('egg')) {
      return 'protein';
    } else if (nameLower.includes('rice') || nameLower.includes('quinoa') ||
               nameLower.includes('bread') || nameLower.includes('pasta') ||
               nameLower.includes('oat')) {
      return 'grain';
    } else if (nameLower.includes('milk') || nameLower.includes('yogurt') ||
               nameLower.includes('cheese')) {
      return 'dairy';
    } else if (nameLower.includes('spinach') || nameLower.includes('broccoli') ||
               nameLower.includes('kale') || nameLower.includes('carrot') ||
               nameLower.includes('lettuce') || nameLower.includes('potato') ||
               nameLower.includes('onion')) {
      return 'vegetable';
    } else if (nameLower.includes('apple') || nameLower.includes('banana') ||
               nameLower.includes('berry') || nameLower.includes('berries') ||
               nameLower.includes('orange') || nameLower.includes('pear') ||
               nameLower.includes('avocado')) {
      return 'fruit';
    } else if (nameLower.includes('almond') || nameLower.includes('cashew') ||
               nameLower.includes('walnut') || nameLower.includes('pecan') ||
               nameLower.includes('nut') || nameLower.includes('seed')) {
      return 'nuts';
    } else {
      return 'other';
    }
  };
  
  // Function to get user's current location using the browser's Geolocation API
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setLocationLoading(true);
    setLocationError(null);
    
    console.log("Getting user location using browser's Geolocation API...");
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        try {
          // Get coordinates from browser's geolocation
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          console.log(`Got user location: ${lat}, ${lng}`);
          
          // Set user location
          setUserLocation({ lat, lng });
          
          // Fetch nearby grocery stores using Google Places API
          const nearbyStores = await findNearbyGroceryStores(lat, lng);
          setAvailableStores(nearbyStores);
          console.log("Found nearby stores:", nearbyStores.map(s => s.name).join(', '));
          
          // Auto-select the closest store if no store is selected
          if (!selectedStore && nearbyStores.length > 0) {
            setSelectedStore(nearbyStores[0]);
            console.log(`Auto-selected store: ${nearbyStores[0].name}`);
          }
          
          setLocationLoading(false);
        } catch (error) {
          console.error("Error finding nearby stores:", error);
          setLocationError("Failed to find stores near your location");
          setLocationLoading(false);
          // Fall back to a default location
          handleFallbackLocation({ code: 2, message: "Error processing location" });
        }
      },
      // Error callback
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(`Geolocation error: ${error.message}`);
        setLocationLoading(false);
        // Fall back to a default location
        handleFallbackLocation(error);
      },
      // Options
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };
  
  // Function to find nearby grocery stores using actual Google Places API
  findNearbyGroceryStores = async (lat, lng) => {
    try {
      console.log(`Searching for grocery stores near ${lat}, ${lng}`);
      
      // Make backend API call to our server which will call Google Places API
      // This protects our API key by not exposing it in frontend code
      const backendUrl = `/api/places/nearby?lat=${lat}&lng=${lng}&type=grocery_or_supermarket&radius=5000`;
      
      console.log(`Calling backend API: ${backendUrl}`);
      const response = await fetch(backendUrl);
      
      if (!response.ok) {
        throw new Error(`Backend API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Google Places API response:', data);
      
      if (!data.results || data.results.length === 0) {
        console.log('No stores found through Places API, using fallback data');
        return generateFallbackStores();
      }
      
      // Convert Google Places API response to our store format
      const stores = data.results.map((place, index) => {
        // Format the address
        const address = place.vicinity || place.formatted_address || "";
        
        // Extract and format opening hours if available
        let hours = null;
        let isOpenNow = null;
        let openingTime = null;
        let closingTime = null;
        
        if (place.opening_hours) {
          isOpenNow = place.opening_hours.open_now;
          
          // If detailed hours are available (would require a Place Details request)
          if (place.opening_hours.weekday_text) {
            hours = place.opening_hours.weekday_text.join(", ");
          } else {
            // Default format if specific hours aren't available
            hours = isOpenNow ? "Open now" : "Closed now";
          }
        }
        
        // Calculate distance from user (would be in the response if using Distance Matrix API)
        // For now, we'll use a placeholder calculation
        const distance = calculateDistance(
          lat, 
          lng, 
          place.geometry.location.lat, 
          place.geometry.location.lng
        );
        
        // Get photos if available
        const photoUrl = place.photos && place.photos.length > 0
          ? `/api/places/photo?photoreference=${place.photos[0].photo_reference}&maxwidth=400`
          : "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
        
        return {
          id: place.place_id || index + 1,
          name: place.name,
          chain: place.name.split(' ')[0], // Simplified way to get store chain
          address: address,
          distance: parseFloat(distance.toFixed(1)),
          rating: place.rating,
          priceLevel: place.price_level,
          hours: hours,
          isOpenNow: isOpenNow,
          openingTime: openingTime,
          closingTime: closingTime,
          coordinates: { 
            lat: place.geometry.location.lat, 
            lng: place.geometry.location.lng
          },
          deliveryAvailable: true, // Assuming delivery is available for all stores
          estimatedDeliveryTime: randomDeliveryTime(),
          logo: photoUrl
        };
      });
      
      // Sort by distance
      return stores.sort((a, b) => a.distance - b.distance);
      
    } catch (error) {
      console.error('Error finding nearby grocery stores:', error);
      
      // If API call fails, fall back to local data generation
      console.log('Falling back to generated store data');
      
      // Get location name for better fallback data
      const cityName = await getLocationName(lat, lng);
      
      // Create realistic grocery store data including hours
      const storeTypes = [
        { name: "Whole Foods Market", chain: "Whole Foods", rating: 4.5, priceLevel: 3 },
        { name: "Trader Joe's", chain: "Trader Joe's", rating: 4.6, priceLevel: 2 },
        { name: "Safeway", chain: "Safeway", rating: 4.2, priceLevel: 2 },
        { name: "Kroger", chain: "Kroger", rating: 4.3, priceLevel: 2 },
        { name: "Publix", chain: "Publix", rating: 4.5, priceLevel: 2 },
        { name: "Target", chain: "Target", rating: 4.1, priceLevel: 2 },
        { name: "Walmart Supercenter", chain: "Walmart", rating: 3.9, priceLevel: 1 },
        { name: "Aldi", chain: "Aldi", rating: 4.3, priceLevel: 1 },
        { name: "Costco", chain: "Costco", rating: 4.5, priceLevel: 2 }
      ];
      
      // Generate 5-7 stores
      const storeCount = Math.floor(Math.random() * 3) + 4;
      const shuffledStores = [...storeTypes].sort(() => 0.5 - Math.random()).slice(0, storeCount);
      
      // Generate realistic store addresses and distances
      const stores = shuffledStores.map((store, index) => {
        // Calculate a pseudo-random distance (0.5 - 7.5 miles)
        const distance = (Math.random() * 7 + 0.5).toFixed(1);
        
        // Generate opening hours (most stores open 8-9am and close 8-10pm)
        const openingHour = Math.floor(Math.random() * 2) + 8; // 8am or 9am
        const closingHour = Math.floor(Math.random() * 3) + 20; // 8pm, 9pm, or 10pm
        const openingTime = `${openingHour}:00 AM`;
        const closingTime = `${closingHour - 12}:00 PM`;
        
        // Add if open now based on current time
        const now = new Date();
        const currentHour = now.getHours();
        const isOpenNow = currentHour >= openingHour && currentHour < closingHour;
        
        // Generate days open (most grocery stores open all days)
        const daysOpen = "Monday - Sunday";
        
        // Generate full hours string
        const hours = `${daysOpen}, ${openingTime} - ${closingTime}`;
        
        // Generate address
        const streetNumber = Math.floor(Math.random() * 9000) + 1000;
        const streets = ["Main St", "Broadway", "Park Ave", "Market St", "Oak Rd", "Washington Ave", "Lake St", "Center St"];
        const street = streets[Math.floor(Math.random() * streets.length)];
        const address = `${streetNumber} ${street}, ${cityName}`;
        
        // Add slight variations to location for realistic map display
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lngOffset = (Math.random() - 0.5) * 0.05;
        
        return {
          id: index + 1,
          name: `${store.name} ${cityName}`,
          chain: store.chain,
          address: address,
          distance: parseFloat(distance),
          rating: store.rating + (Math.random() * 0.4 - 0.2), // Add some variation
          priceLevel: store.priceLevel,
          hours: hours,
          isOpenNow: isOpenNow,
          openingTime: openingTime,
          closingTime: closingTime,
          coordinates: { 
            lat: lat + latOffset, 
            lng: lng + lngOffset 
          },
          deliveryAvailable: Math.random() > 0.1, // 90% chance delivery is available
          estimatedDeliveryTime: randomDeliveryTime(),
          logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        };
      });
      
      // Sort by distance
      return stores.sort((a, b) => a.distance - b.distance);
    }
  };
  
  // Helper function to get location name from coordinates (would use Google Geocoding API)
  const getLocationName = async (lat, lng) => {
    try {
      // In real implementation, would call Google Geocoding API:
      // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_API_KEY`;
      
      // For demo, use a list of major cities and find closest one
      const cities = [
        { name: "New York, NY", lat: 40.7128, lng: -74.0060 },
        { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
        { name: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
        { name: "Houston, TX", lat: 29.7604, lng: -95.3698 },
        { name: "Phoenix, AZ", lat: 33.4484, lng: -112.0740 },
        { name: "Philadelphia, PA", lat: 39.9526, lng: -75.1652 },
        { name: "San Antonio, TX", lat: 29.4241, lng: -98.4936 },
        { name: "San Diego, CA", lat: 32.7157, lng: -117.1611 },
        { name: "Dallas, TX", lat: 32.7767, lng: -96.7970 },
        { name: "Minneapolis, MN", lat: 44.9778, lng: -93.2650 },
        { name: "Boston, MA", lat: 42.3601, lng: -71.0589 },
        { name: "Seattle, WA", lat: 47.6062, lng: -122.3321 },
        { name: "Denver, CO", lat: 39.7392, lng: -104.9903 }
      ];
      
      // Calculate distances and find closest city
      let closestCity = cities[0];
      let minDistance = calculateDistance(lat, lng, closestCity.lat, closestCity.lng);
      
      for (let i = 1; i < cities.length; i++) {
        const distance = calculateDistance(lat, lng, cities[i].lat, cities[i].lng);
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = cities[i];
        }
      }
      
      return closestCity.name;
    } catch (error) {
      console.error('Error getting location name:', error);
      return "Minneapolis, MN"; // Default city on error
    }
  };
  
  // Helper function to calculate distance between coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180; // Convert to radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  };
  
  // Fallback to Minnesota location for demonstration
  const handleFallbackLocation = async (error) => {
    try {
      // Use Minneapolis, MN coordinates as fallback
      const mnLat = 44.9778;
      const mnLng = -93.2650;
      
      console.log("Using Minneapolis location as fallback");
      setUserLocation({ lat: mnLat, lng: mnLng });
      
      // Show friendly error message
      if (error.code === 1) {  // Permission denied
        setLocationError("Permission denied. Using Minneapolis, MN stores instead.");
      } else {
        setLocationError("Couldn't get your exact location. Using Minneapolis, MN stores instead.");
      }
      
      // Get Minnesota stores
      const mnStores = await findNearbyStores(mnLat, mnLng);
      setAvailableStores(mnStores);
      
      // Select the closest store
      if (!selectedStore && mnStores.length > 0) {
        setSelectedStore(mnStores[0]);
      }
    } catch (fallbackError) {
      console.error("Even fallback location failed:", fallbackError);
      setLocationError("Couldn't load store data. Please try again later.");
    } finally {
      setLocationLoading(false);
    }
  };
  
  // Handle store selection
  const handleStoreSelect = (store) => {
    setSelectedStore(store);
  };
  
  // Handle checkout with DoorDash integration
  const handleCheckout = async () => {
    if (!selectedStore) {
      // If no store is selected, prompt user to select one
      alert("Please select a store for delivery first.");
      return;
    }
    
    // Check if DoorDash is available for the selected store
    try {
      setLocationLoading(true);
      
      // First check if DoorDash is available for this store and location
      const doordashAvailabilityResponse = await fetch(
        `/api/places/doordash/check-availability?store_id=${selectedStore.id}&lat=${userLocation?.lat || '0'}&lng=${userLocation?.lng || '0'}&store_name=${encodeURIComponent(selectedStore.name)}`
      );
      
      const doordashAvailability = await doordashAvailabilityResponse.json();
      
      // If DoorDash is available, show checkout dialog
      if (doordashAvailability.available) {
        // Add DoorDash information to selectedStore
        setSelectedStore({
          ...selectedStore,
          doordash: doordashAvailability
        });
        
        // Open the checkout dialog
        setCheckoutDialogOpen(true);
      } else {
        // If DoorDash is not available, show alternative checkout dialog
        alert("DoorDash delivery is not available for this store in your area. Please select another store or try again later.");
      }
    } catch (error) {
      console.error("Error checking DoorDash availability:", error);
      // Fall back to regular checkout dialog
      setCheckoutDialogOpen(true);
    } finally {
      setLocationLoading(false);
    }
  };
  
  // Handle submitting an order through DoorDash
  const handleDoorDashSubmit = async () => {
    try {
      // Prepare order data
      const orderData = {
        store_id: selectedStore.id,
        delivery_address: userLocation ? "Current Location" : "123 Main St, New York, NY 10001",
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit
        })),
        delivery_instructions: "",
        contact_info: {
          name: "Demo User",
          phone: "555-555-5555",
          email: "demo@example.com"
        }
      };
      
      // Submit the order to DoorDash API
      const response = await fetch('/api/places/doordash/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const orderResult = await response.json();
      
      if (orderResult.success) {
        // If order was successful, show confirmation
        alert(`Your order #${orderResult.order_id} has been placed with DoorDash! Expected delivery in ${orderResult.estimated_delivery.min_minutes}-${orderResult.estimated_delivery.max_minutes} minutes.`);
        
        // Clear the cart
        setCartItems([]);
        
        // Close the checkout dialog
        setCheckoutDialogOpen(false);
      } else {
        // If order failed, show error
        alert("There was an error placing your order with DoorDash. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting DoorDash order:", error);
      alert("There was an error connecting to DoorDash. Please try again later.");
    }
  };
  
  // Allow access even if not authenticated
  
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
            background: 'linear-gradient(135deg, #43a047, #66bb6a)', 
            py: 2.5, 
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ShoppingCartIcon sx={{ color: 'white', fontSize: 28 }} />
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                Smart Grocery Shopping
              </Typography>
            </Box>
            
            <Badge 
              badgeContent={cartItems.length} 
              color="error"
              sx={{ 
                '& .MuiBadge-badge': { 
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }
              }}
            >
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                onClick={() => setActiveTab(1)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                View Cart ${cartTotal.toFixed(2)}
              </Button>
            </Badge>
          </Box>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="grocery tabs"
              sx={{ px: 2 }}
            >
              <Tab 
                label="Browse Groceries" 
                icon={<KitchenIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Shopping Cart" 
                icon={<ShoppingCartIcon />} 
                iconPosition="start"
                sx={{ mr: 2 }}
              />
              <Tab 
                label="Meal Plan Import" 
                icon={<RestaurantIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Nutrition Calculator" 
                icon={<CalculateIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Meal Planner" 
                icon={<QuestionAnswerIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            {/* Browse Tab */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <TextField
                      placeholder="Search any ingredient (e.g. apple, bread, rice, cheese)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Search for any ingredient - powered by Open Food Facts API
                      </Typography>
                      <Chip 
                        label="Uses Open Food Facts API" 
                        variant="outlined" 
                        size="small" 
                        icon={<InfoOutlinedIcon fontSize="small" />}
                        color="primary"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    </Box>
                  </Box>
                  
                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                      labelId="category-filter-label"
                      id="category-filter"
                      value={selectedCategory}
                      label="Category"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <FilterListIcon fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {/* Diet Filter Toggle */}
                  {dietaryPreferences && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableDietFiltering}
                          onChange={(e) => setEnableDietFiltering(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <RestaurantMenuIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            Filter by diet ({dietaryPreferences.primaryDiet 
                              ? dietaryPreferences.primaryDiet.replace('_', ' ') 
                              : 'none'})
                          </Typography>
                        </Box>
                      }
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>
                
                {filteredItems.length === 0 ? (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No matching items found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Try adjusting your search or filter criteria
                    </Typography>
                    
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, maxWidth: 600, mx: 'auto' }}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>
                        Real API Integration Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }} paragraph>
                        In a production environment, this would connect to:
                      </Typography>
                      <Box component="ul" sx={{ textAlign: 'left', pl: 2 }}>
                        <Box component="li">
                          <Typography variant="body2" color="text.secondary">
                            Real-time grocery data APIs (DoorDash, Kroger, etc.)
                          </Typography>
                        </Box>
                        <Box component="li">
                          <Typography variant="body2" color="text.secondary">
                            Food database APIs for nutritional information
                          </Typography>
                        </Box>
                        <Box component="li">
                          <Typography variant="body2" color="text.secondary">
                            Location services to display nearby store inventory
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                ) : (
                  <Box sx={{ height: 'calc(100vh - 300px)', minHeight: 500 }}>
                    {isSearching ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Searching for groceries...
                        </Typography>
                      </Box>
                    ) : (
                      <AutoSizer>
                        {({ height, width }) => {
                          // Calculate number of columns based on width and desired minimum column width
                          const columnCount = Math.floor(width / 300) || 1;
                          const columnWidth = width / columnCount;
                          const rowHeight = 420; // Adjust this based on your card height
                          const rowCount = Math.ceil(memoizedFilteredItems.length / columnCount);
                          
                          // Item renderer for the grid
                          const ItemRenderer = ({ columnIndex, rowIndex, style }) => {
                            const index = rowIndex * columnCount + columnIndex;
                            
                            if (index >= memoizedFilteredItems.length) {
                              return null;
                            }
                            
                            const item = memoizedFilteredItems[index];
                            
                            return (
                              <div style={{
                                ...style,
                                padding: '12px',
                                boxSizing: 'border-box'
                              }}>
                                <GroceryItemCard 
                                  item={item} 
                                  onAdd={handleAddToCart} 
                                  isAdded={isInCart(item.id)}
                                  cartQuantity={getCartQuantity(item.id)}
                                />
                              </div>
                            );
                          };
                          
                          // Check if an item is loaded
                          const isItemLoaded = (index) => index < memoizedFilteredItems.length;
                          
                          // Key for the grid
                          const gridKey = `grocery-grid-${memoizedFilteredItems.length}`;
                          
                          // Render virtualized grid
                          return (
                            <InfiniteLoader
                              isItemLoaded={isItemLoaded}
                              itemCount={memoizedFilteredItems.length}
                              loadMoreItems={() => {}} // No-op since we're not paginating in this example
                              threshold={5} // Preload 5 items ahead for smoother scrolling
                            >
                              {({ onItemsRendered, ref }) => {
                                // Convert from Grid to List onItemsRendered format
                                const onGridItemsRendered = ({ visibleRowStartIndex, visibleRowStopIndex, visibleColumnStartIndex, visibleColumnStopIndex }) => {
                                  const startIndex = visibleRowStartIndex * columnCount + visibleColumnStartIndex;
                                  const stopIndex = visibleRowStopIndex * columnCount + visibleColumnStopIndex;
                                  
                                  onItemsRendered({
                                    visibleStartIndex: startIndex,
                                    visibleStopIndex: stopIndex
                                  });
                                };
                                
                                return (
                                  <FixedSizeGrid
                                    key={gridKey}
                                    ref={ref}
                                    columnCount={columnCount}
                                    columnWidth={columnWidth}
                                    height={height}
                                    rowCount={rowCount}
                                    rowHeight={rowHeight}
                                    width={width}
                                    onItemsRendered={onGridItemsRendered}
                                    overscanRowCount={2} // Overscanning for smoother scrolling
                                    overscanColumnCount={1}
                                  >
                                    {ItemRenderer}
                                  </FixedSizeGrid>
                                );
                              }}
                            </InfiniteLoader>
                          );
                        }}
                      </AutoSizer>
                    )}
                  </Box>
                )}
              </Box>
            )}
            
            {/* Cart Tab */}
            {activeTab === 1 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        height: '100%'
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Shopping Cart ({cartItems.length} items)</span>
                        {cartItems.length > 0 && (
                          <Button 
                            size="small"
                            startIcon={<DeleteIcon />}
                            color="error"
                            onClick={() => setCartItems([])}
                          >
                            Clear Cart
                          </Button>
                        )}
                      </Typography>
                      
                      {cartItems.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                          <ShoppingCartIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            Your cart is empty
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            onClick={() => setActiveTab(0)}
                            sx={{ mt: 2 }}
                          >
                            Browse Groceries
                          </Button>
                        </Box>
                      ) : (
                        <List sx={{ mt: 2 }}>
                          {cartItems.map((item) => (
                            <CartItem 
                              key={item.id} 
                              item={item} 
                              onUpdateQuantity={handleUpdateQuantity}
                              onRemove={handleRemoveFromCart}
                            />
                          ))}
                        </List>
                      )}
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        height: '100%'
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Order Summary
                      </Typography>
                      
                      <Box sx={{ my: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Subtotal</Typography>
                          <Typography variant="body2">${cartTotal.toFixed(2)}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Delivery Fee</Typography>
                          <Typography variant="body2">${cartItems.length > 0 ? '5.99' : '0.00'}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Tax</Typography>
                          <Typography variant="body2">${(cartTotal * 0.0825).toFixed(2)}</Typography>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            ${(cartTotal + (cartItems.length > 0 ? 5.99 : 0) + (cartTotal * 0.0825)).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">
                            Select Delivery Store:
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<LocationOnIcon />}
                            onClick={getUserLocation}
                            disabled={locationLoading}
                            variant="outlined"
                            color="primary"
                            sx={{ borderRadius: 20, textTransform: 'none', py: 0.5 }}
                          >
                            {locationLoading ? 'Finding stores...' : 'Find nearby stores'}
                          </Button>
                        </Box>
                        
                        {locationError && (
                          <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }} onClose={() => setLocationError(null)}>
                            {locationError}
                          </Alert>
                        )}
                        
                        {userLocation && (
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            <LocationOnIcon fontSize="inherit" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                            Using your location to find nearby stores
                          </Typography>
                        )}
                        
                        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                          <InputLabel id="store-select-label">Store</InputLabel>
                          <Select
                            labelId="store-select-label"
                            id="store-select"
                            value={selectedStore ? selectedStore.id : ''}
                            label="Store"
                            onChange={(e) => handleStoreSelect(availableStores.find(s => s.id === e.target.value))}
                            disabled={locationLoading}
                            startAdornment={locationLoading ? (
                              <InputAdornment position="start">
                                <CircularProgress size={16} />
                              </InputAdornment>
                            ) : null}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  maxHeight: 400,
                                  '& .MuiMenuItem-root': {
                                    py: 1.5
                                  }
                                }
                              }
                            }}
                          >
                            {availableStores.map((store) => (
                              <MenuItem key={store.id} value={store.id}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="medium">
                                      {store.name} 
                                    </Typography>
                                    {store.isOpenNow !== undefined && (
                                      <Chip 
                                        label={store.isOpenNow ? "Open" : "Closed"} 
                                        size="small" 
                                        color={store.isOpenNow ? "success" : "error"}
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                      />
                                    )}
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {store.distance && `${store.distance.toFixed(1)} miles • `}{store.address}
                                  </Typography>
                                  {store.hours && (
                                    <Typography variant="caption" color="text.secondary" sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center',
                                      gap: 0.5,
                                      mt: 0.5
                                    }}>
                                      <AccessTimeIcon sx={{ fontSize: 14 }} />
                                      {store.hours}
                                    </Typography>
                                  )}
                                  {store.rating && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                                      <Rating 
                                        value={store.rating} 
                                        precision={0.1} 
                                        readOnly 
                                        size="small"
                                        sx={{ fontSize: '0.8rem' }}
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        {store.rating.toFixed(1)}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        {selectedStore && (
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {selectedStore.name}
                                  {selectedStore.isOpenNow !== undefined && (
                                    <Chip 
                                      label={selectedStore.isOpenNow ? "Open Now" : "Closed"} 
                                      size="small" 
                                      color={selectedStore.isOpenNow ? "success" : "error"}
                                      sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  <LocationOnIcon fontSize="inherit" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                                  {selectedStore.address}
                                </Typography>
                                {selectedStore.hours && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    <AccessTimeIcon fontSize="inherit" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                                    {selectedStore.hours}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocalShippingIcon fontSize="inherit" />
                              <b>Delivery estimate:</b> {selectedStore.deliveryAvailable 
                                ? `${selectedStore.estimatedDeliveryTime || '30-45 minutes'} from ${selectedStore.name}` 
                                : 'Not available for this location'}
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        startIcon={<ShoppingCartIcon />}
                        disabled={cartItems.length === 0 || !selectedStore}
                        onClick={handleCheckout}
                        sx={{ mb: 2 }}
                      >
                        Checkout
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        fullWidth
                        onClick={() => setActiveTab(0)}
                      >
                        Continue Shopping
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
                
                {cartItems.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <RecipeSuggestions cartItems={cartItems} recipes={mockRecipes} />
                  </Box>
                )}
              </Box>
            )}
            
            {/* Meal Plan Import Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RestaurantIcon color="primary" /> AI-Generated Meal Plans
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Select a personalized meal plan to automatically add all ingredients to your shopping cart. Each plan is designed by our AI nutritionist based on specific dietary goals.
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {['All', 'High-Protein', 'Keto', 'Vegan', 'Mediterranean', 'Paleo', 'Gluten-Free', 'Heart-Healthy', 'Low-FODMAP'].map((dietType) => (
                    <Chip 
                      key={dietType}
                      label={dietType} 
                      onClick={() => {}} // In a real implementation, this would filter meal plans
                      variant={dietType === 'All' ? 'filled' : 'outlined'}
                      color={dietType === 'All' ? 'primary' : 'default'}
                      sx={{ 
                        fontWeight: 'medium',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Grid container spacing={3}>
                  {mockMealPlans.map((plan) => {
                    // Determine color theme based on diet type
                    let dietColor;
                    switch(plan.dietType) {
                      case 'Keto': 
                        dietColor = '#9c27b0'; // purple
                        break;
                      case 'Vegan': 
                        dietColor = '#4caf50'; // green
                        break;
                      case 'Mediterranean': 
                        dietColor = '#2196f3'; // blue
                        break;
                      case 'Gluten-Free': 
                        dietColor = '#ff9800'; // orange
                        break;
                      case 'High-Protein': 
                        dietColor = '#f44336'; // red
                        break;
                      case 'Heart-Healthy': 
                        dietColor = '#e91e63'; // pink
                        break;
                      case 'Low-FODMAP': 
                        dietColor = '#009688'; // teal
                        break;
                      case 'Paleo': 
                        dietColor = '#795548'; // brown
                        break;
                      default: 
                        dietColor = theme.palette.primary.main;
                    }
                    
                    return (
                      <Grid item xs={12} md={6} lg={4} key={plan.id}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 0, 
                            borderRadius: 2,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            border: currentMealPlan && currentMealPlan.id === plan.id 
                              ? `2px solid ${dietColor}` 
                              : '2px solid transparent',
                            '&:hover': {
                              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                              transform: 'translateY(-4px)'
                            }
                          }}
                          onClick={() => handleMealPlanSelect(plan)}
                        >
                          {/* Header */}
                          <Box 
                            sx={{ 
                              p: 2, 
                              background: `linear-gradient(120deg, ${alpha(dietColor, 0.8)}, ${alpha(dietColor, 0.6)})`,
                              color: 'white'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                                {plan.name}
                              </Typography>
                              <Chip 
                                label={plan.dietType} 
                                size="small"
                                sx={{ 
                                  fontWeight: 'bold',
                                  bgcolor: 'rgba(255,255,255,0.25)',
                                  color: 'white',
                                  borderColor: 'rgba(255,255,255,0.5)'
                                }}
                              />
                            </Box>
                          </Box>
                          
                          {/* Content */}
                          <Box sx={{ p: 2 }}>
                            <Typography variant="body2" sx={{ minHeight: 60 }} paragraph>
                              {plan.description}
                            </Typography>
                            
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap',
                                alignItems: 'center', 
                                gap: 1, 
                                mb: 2,
                                justifyContent: 'space-between',
                                bgcolor: alpha(dietColor, 0.05),
                                p: 1.5,
                                borderRadius: 1
                              }}
                            >
                              <Chip 
                                label={`${plan.totalCalories} calories`} 
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 'medium',
                                  borderColor: dietColor,
                                  color: dietColor
                                }}
                              />
                              
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                  label={`P: ${plan.macros.protein}`} 
                                  size="small"
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    height: 20,
                                    bgcolor: alpha('#f44336', 0.1),
                                    color: '#d32f2f'
                                  }}
                                />
                                <Chip 
                                  label={`C: ${plan.macros.carbs}`} 
                                  size="small"
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    height: 20,
                                    bgcolor: alpha('#2196f3', 0.1),
                                    color: '#1976d2'
                                  }}
                                />
                                <Chip 
                                  label={`F: ${plan.macros.fat}`} 
                                  size="small"
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    height: 20,
                                    bgcolor: alpha('#ff9800', 0.1),
                                    color: '#ed6c02'
                                  }}
                                />
                              </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography 
                              variant="subtitle2" 
                              gutterBottom 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5, 
                                color: dietColor
                              }}
                            >
                              <RestaurantIcon fontSize="small" /> 
                              Shopping List ({plan.ingredients.length} items):
                            </Typography>
                            
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 0.5, 
                                mb: 2,
                                maxHeight: 80,
                                overflow: 'auto'
                              }}
                            >
                              {plan.ingredients.slice(0, 8).map((ingredient, index) => (
                                <Chip
                                  key={index}
                                  label={`${ingredient.name}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    borderColor: alpha(dietColor, 0.3),
                                    color: 'text.secondary'
                                  }}
                                />
                              ))}
                              {plan.ingredients.length > 8 && (
                                <Chip
                                  label={`+${plan.ingredients.length - 8} more`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.7rem', 
                                    bgcolor: alpha(dietColor, 0.05),
                                    borderColor: 'transparent'
                                  }}
                                />
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Typography variant="caption" color="text.secondary">
                                Estimated grocery cost: ${((plan.ingredients.length * 5) + 15).toFixed(2)}
                              </Typography>
                            </Box>
                            
                            <Button 
                              variant={currentMealPlan && currentMealPlan.id === plan.id ? "contained" : "outlined"}
                              fullWidth
                              sx={{ 
                                mt: 2,
                                bgcolor: currentMealPlan && currentMealPlan.id === plan.id ? dietColor : 'transparent',
                                borderColor: dietColor,
                                color: currentMealPlan && currentMealPlan.id === plan.id ? 'white' : dietColor,
                                '&:hover': {
                                  bgcolor: currentMealPlan && currentMealPlan.id === plan.id ? dietColor : alpha(dietColor, 0.1),
                                  borderColor: dietColor
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMealPlanSelect(plan);
                                setActiveTab(1); // Navigate to cart
                              }}
                            >
                              {currentMealPlan && currentMealPlan.id === plan.id 
                                ? "Added to Cart - View Items" 
                                : "Add All Ingredients to Cart"
                              }
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
                
                <Paper
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    mt: 4, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="bold">
                    About Our AI Meal Planning
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    These meal plans are generated by our advanced AI nutritionist based on your fitness profile, goals, and dietary preferences. Each plan is designed to optimize nutrition while meeting specific health objectives.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The grocery lists are customized to provide exactly what you need for your selected meal plan. Simply choose a plan and add all ingredients to your cart with one click.
                  </Typography>
                </Paper>
              </Box>
            )}
            
            {/* Nutrition Calculator Tab */}
            {activeTab === 3 && (
              <NutritionCalculator cartItems={cartItems} groceryItems={groceryItems} />
            )}
            
            {/* Meal Planner Tab */}
            {activeTab === 4 && (
              <MealPlanningSection 
                onAddToCart={(items) => {
                  // Convert meal plan ingredients format to cart items format
                  const cartItems = items.map(item => {
                    // Find the grocery item that matches this ingredient
                    const groceryItem = groceryItems.find(g => 
                      g.name.toLowerCase().includes(item.name.toLowerCase()) ||
                      item.name.toLowerCase().includes(g.name.toLowerCase())
                    );
                    
                    // If we found a matching grocery item, use it with the meal plan quantity
                    if (groceryItem) {
                      return {
                        ...groceryItem,
                        quantity: item.quantity || 1
                      };
                    }
                    
                    // Otherwise, create a placeholder item
                    return {
                      id: `meal-${item.itemId || Date.now()}`,
                      name: item.name,
                      category: item.category || 'Other',
                      price: 0,
                      unit: item.unit || 'each',
                      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                      dietTypes: [],
                      quantity: item.quantity || 1
                    };
                  });
                  
                  // Add all items to cart
                  cartItems.forEach(item => handleAddToCart(item, item.quantity || 1));
                  
                  // Optionally switch to the cart tab
                  setActiveTab(1);
                }}
                mockMealPlans={mockMealPlans}
              />
            )}
            
          </CardContent>
        </Card>
        
        {activeTab !== 3 && activeTab !== 2 && cartItems.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <NutritionCalculator cartItems={cartItems} groceryItems={groceryItems} />
          </Box>
        )}
      </motion.div>
      
      {/* Checkout Dialog */}
      <Dialog
        open={checkoutDialogOpen}
        onClose={() => setCheckoutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="span">Complete Your Order</Typography>
            <img 
              src="https://www.doordash.com/assets/icons/app-icon.svg" 
              alt="DoorDash Logo" 
              style={{ height: 24, marginLeft: 'auto' }}
            />
            <Typography variant="body2" color="primary.main" fontWeight="medium">via DoorDash</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {locationLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
                icon={<img src="https://www.doordash.com/assets/icons/app-icon.svg" alt="DoorDash" style={{ width: 20, height: 20 }} />}
              >
                Your order will be fulfilled through DoorDash's delivery network
              </Alert>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">Items: {cartItems.length}</Typography>
                <Typography variant="body1" fontWeight="bold">${(cartTotal + (cartItems.length > 0 ? 5.99 : 0) + (cartTotal * 0.0825)).toFixed(2)}</Typography>
              </Box>
              
              {selectedStore && (
                <Paper variant="outlined" sx={{ p: 0, borderRadius: 2, mb: 2, overflow: 'hidden' }}>
                  {/* This would be a real map in production using Google Maps or similar */}
                  <Box 
                    sx={{ 
                      height: 150, 
                      width: '100%', 
                      bgcolor: '#e5e5f7',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%2376a6ed\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }} 
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <LocationOnIcon color="error" sx={{ fontSize: 40, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }} />
                      <Box 
                        sx={{ 
                          bgcolor: 'background.paper', 
                          p: 0.5, 
                          px: 1, 
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      >
                        {selectedStore.name}
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 5, right: 10, color: 'text.secondary' }}>
                      {/* In a real implementation this would be an actual Google Maps or Mapbox map */}
                      Map view - would use real maps API
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {selectedStore.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {selectedStore.address}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {selectedStore.distance && `${selectedStore.distance.toFixed(1)} miles away`}
                      </Typography>
                      <Chip 
                        label="DoorDash Delivery" 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                </Paper>
              )}
              
              {/* Cart summary with DoorDash fees */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  mb: 2, 
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <Typography variant="subtitle2" gutterBottom>Order Summary</Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">${cartTotal.toFixed(2)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Delivery Fee</Typography>
                  <Typography variant="body2">$5.99</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Service Fee</Typography>
                  <Typography variant="body2">$3.99</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Estimated Tax</Typography>
                  <Typography variant="body2">${(cartTotal * 0.0825).toFixed(2)}</Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight="bold">Total</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${(cartTotal + 9.98 + (cartTotal * 0.0825)).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
              
              <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon color="success" fontSize="small" />
                  Delivery to: {userLocation ? 'Your current location' : '123 Main St, Apt 4B, New York, NY 10001'}
                </Typography>
                <Typography variant="body2" color="success.main" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <LocalShippingIcon fontSize="small" />
                  Estimated delivery: Today within {selectedStore?.doordash?.delivery_estimate?.min_minutes || 30}-{selectedStore?.doordash?.delivery_estimate?.max_minutes || 60} minutes
                </Typography>
              </Box>
              
              {/* DoorDash shopper info */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  mb: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img 
                    src="https://www.doordash.com/assets/icons/app-icon.svg" 
                    alt="DoorDash" 
                    style={{ width: 36, height: 36 }}
                  />
                  <Box>
                    <Typography variant="subtitle2">DoorDash Personal Shopper</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your items will be carefully selected by a professional DoorDash shopper
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              
              <Typography variant="caption" color="text.secondary">
                By placing your order, you agree to DoorDash's terms of service and privacy policy. 
                Items may be subject to availability and prices may vary.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDoorDashSubmit} 
            variant="contained"
            color="primary"
            disabled={locationLoading}
            startIcon={<img src="https://www.doordash.com/assets/icons/app-icon.svg" alt="DoorDash" style={{ width: 20, height: 20 }} />}
          >
            Place Order with DoorDash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

};

export default GroceryTab;
