import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import { motion } from 'framer-motion';
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAuth } from '../context/AuthContext';

// Temporary mock data - to be replaced with real API integration
// TODO: Replace with real-time grocery data from APIs like Spoonacular, Edamam, or Instacart API
// Example API endpoints:
// - Spoonacular: https://spoonacular.com/food-api/docs#Search-Grocery-Products
// - Edamam: https://developer.edamam.com/food-database-api-docs
// - Kroger API: https://developer.kroger.com/reference/
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

// Mock store data by region - would be replaced with real API data
const mockStoresByRegion = {
  // Minnesota stores
  MN: [
    { id: 1, name: "Lunds & Byerlys", deliveryAvailable: true, address: "1450 W Lake St, Minneapolis, MN 55408", distance: 1.2, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Kowalski's Market", deliveryAvailable: true, address: "2440 Hennepin Ave, Minneapolis, MN 55405", distance: 2.5, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "Cub Foods", deliveryAvailable: true, address: "1104 Lagoon Ave, Minneapolis, MN 55408", distance: 3.7, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 4, name: "Whole Foods Market", deliveryAvailable: true, address: "222 Hennepin Ave, Minneapolis, MN 55401", distance: 4.2, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 5, name: "Target", deliveryAvailable: true, address: "900 Nicollet Mall, Minneapolis, MN 55403", distance: 3.1, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  ],
  // California stores
  CA: [
    { id: 6, name: "Whole Foods", deliveryAvailable: true, address: "1234 Organic Blvd, Los Angeles, CA 90001", distance: 1.2, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 7, name: "Trader Joe's", deliveryAvailable: true, address: "5678 Healthy Way, Los Angeles, CA 90001", distance: 2.5, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 8, name: "Safeway", deliveryAvailable: true, address: "9101 Market Street, Los Angeles, CA 90001", distance: 3.7, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  ],
  // New York stores
  NY: [
    { id: 9, name: "Fairway Market", deliveryAvailable: true, address: "2127 Broadway, New York, NY 10023", distance: 1.2, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 10, name: "Whole Foods Market", deliveryAvailable: true, address: "10 Columbus Circle, New York, NY 10019", distance: 2.5, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
    { id: 11, name: "Trader Joe's", deliveryAvailable: true, address: "675 6th Ave, New York, NY 10010", distance: 3.7, logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" },
  ]
};

// Default to Minnesota stores as initial data
const mockStores = mockStoresByRegion.MN;

// Function to fetch nearby stores based on user location
// In a real implementation, this would connect to store locator APIs
const findNearbyStores = async (lat, lng) => {
  try {
    // This would be a real API call to store locator services like:
    // - Google Places API
    // - Instacart Partner API
    // - Kroger Locations API
    // Example API call:
    // const response = await fetch(
    //   `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=supermarket&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
    // );
    
    console.log(`Would fetch nearby stores for coordinates: ${lat}, ${lng}`);
    
    // Simulate API response delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Determine region based on geolocation (simplified for demo)
    // In a real implementation, this would use reverse geocoding to get the actual state/region
    
    // For demo purposes, we'll detect Minnesota locations
    // Minneapolis, MN approximate coordinates: lat ~44.9, lng ~-93.3
    const isNearMinneapolis = lat > 43.0 && lat < 46.0 && lng > -94.0 && lng < -92.0;
    
    // Los Angeles, CA approximate coordinates: lat ~34.0, lng ~-118.2
    const isNearLA = lat > 33.0 && lat < 35.0 && lng > -119.0 && lng < -117.0;
    
    // New York, NY approximate coordinates: lat ~40.7, lng ~-74.0
    const isNearNY = lat > 40.0 && lat < 41.5 && lng > -75.0 && lng < -73.0;
    
    // Select appropriate region stores
    let storesForRegion;
    if (isNearMinneapolis) {
      console.log("Detected Minnesota location");
      storesForRegion = mockStoresByRegion.MN;
    } else if (isNearLA) {
      console.log("Detected California location");
      storesForRegion = mockStoresByRegion.CA;
    } else if (isNearNY) {
      console.log("Detected New York location");
      storesForRegion = mockStoresByRegion.NY;
    } else {
      // Default to Minnesota as requested
      console.log("Using Minnesota stores by default");
      storesForRegion = mockStoresByRegion.MN;
    }
    
    // Randomize distances slightly to simulate real proximity
    const storesWithUpdatedDistances = storesForRegion.map(store => {
      // Random distance adjustment between -0.5 and +0.5 miles
      const distanceAdjustment = (Math.random() - 0.5);
      return {
        ...store,
        distance: Math.max(0.1, store.distance + distanceAdjustment)
      };
    });
    
    // Sort by distance
    return storesWithUpdatedDistances.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    return mockStoresByRegion.MN; // Return Minnesota stores on error
  }
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

// Helper component for the grocery item card
const GroceryItemCard = ({ item, onAdd, isAdded, cartQuantity = 0 }) => {
  const theme = useTheme();
  const [quantity, setQuantity] = useState(cartQuantity || 1);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleAdd = () => {
    onAdd(item, quantity);
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'relative', 
          paddingTop: '60%', 
          backgroundImage: `url(${item.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            m: 1 
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
          <Typography variant="h6" component="h3" fontWeight="medium" gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="h6" component="span" fontWeight="bold" color="primary">
            ${item.price}
            <Typography variant="caption" component="span" color="text.secondary">
              /{item.unit}
            </Typography>
          </Typography>
        </Box>
        
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <b>Category:</b> {item.category}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
              <b>Diet Types:</b>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {item.dietTypes.map((diet, index) => (
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
            </Box>
          </Box>
        </Box>
        
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Nutrition Facts (per serving)</Typography>
              <Typography variant="body2">Calories: {item.nutrition.calories} kcal</Typography>
              <Typography variant="body2">Protein: {item.nutrition.protein}g</Typography>
              <Typography variant="body2">Carbs: {item.nutrition.carbs}g</Typography>
              <Typography variant="body2">Fat: {item.nutrition.fat}g</Typography>
              <Typography variant="body2">Fiber: {item.nutrition.fiber}g</Typography>
            </Box>
          }
          open={tooltipOpen}
          onClose={() => setTooltipOpen(false)}
          onOpen={() => setTooltipOpen(true)}
          arrow
        >
          <Button 
            size="small" 
            startIcon={<InfoOutlinedIcon />}
            onClick={() => setTooltipOpen(!tooltipOpen)}
            sx={{ mb: 1.5, textTransform: 'none' }}
          >
            Nutrition Info
          </Button>
        </Tooltip>
        
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

// Helper component for recipe suggestions
const RecipeSuggestions = ({ cartItems, recipes }) => {
  const theme = useTheme();
  
  // Filter recipes based on cart items
  const getMatchingRecipes = () => {
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
  
  const matchingRecipes = getMatchingRecipes();
  
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
  const [activeTab, setActiveTab] = useState(0);
  const [currentMealPlan, setCurrentMealPlan] = useState(null);
  const [groceryItems, setGroceryItems] = useState(mockGroceryItems);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(groceryItems);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStore, setSelectedStore] = useState(null);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [availableStores, setAvailableStores] = useState(mockStores);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Get unique categories
  const categories = ['All', ...new Set(groceryItems.map(item => item.category))];
  
  // Function to fetch real grocery data from external API
  const fetchRealGroceryData = async (searchQuery) => {
    try {
      // First, look for any matches in our existing mock data
      let filtered = mockGroceryItems.filter(item => {
        const itemNameLower = item.name.toLowerCase();
        const searchTermLower = searchQuery.toLowerCase();
        return itemNameLower.includes(searchTermLower);
      });
      
      // If we find matches in our existing data, use those
      if (filtered.length > 0) {
        return filtered;
      }
      
      // If no matches found, generate dynamic grocery items for the search term
      console.log(`Generating dynamic grocery data for: ${searchQuery}`);
      
      // Simulating API response delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a dynamic item based on the search query
      // This simulates what would happen with a real API
      const dynamicItems = generateDynamicGroceryItems(searchQuery);
      
      // Add these dynamically generated items to our existing items
      // so they'll be available for future searches
      setGroceryItems(prevItems => [...prevItems, ...dynamicItems]);
      
      return dynamicItems;
    } catch (error) {
      console.error('Error fetching grocery data:', error);
      return []; // Return empty array on error
    }
  };
  
  // Function to generate dynamic grocery items based on search term
  const generateDynamicGroceryItems = (searchQuery) => {
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
    const capitalizedName = searchQuery
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Randomly assign a category that makes sense for the search term
    // This is a simple approach; a real API would have more sophisticated categorization
    let category = categories[Math.floor(Math.random() * categories.length)];
    
    // Try to make smarter category assignments based on keywords
    const foodKeywords = {
      fruit: ['apple', 'banana', 'berry', 'orange', 'grape', 'melon', 'pear', 'peach', 'plum', 'fruit'],
      vegetable: ['broccoli', 'carrot', 'spinach', 'lettuce', 'tomato', 'potato', 'onion', 'pepper', 'vegetable'],
      protein: ['chicken', 'beef', 'pork', 'fish', 'tofu', 'turkey', 'lamb', 'eggs', 'protein'],
      dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy'],
      grain: ['bread', 'rice', 'pasta', 'cereal', 'oat', 'quinoa', 'grain']
    };
    
    // Try to determine a more appropriate category
    const searchLower = searchQuery.toLowerCase();
    for (const [key, keywords] of Object.entries(foodKeywords)) {
      if (keywords.some(keyword => searchLower.includes(keyword))) {
        // Map our internal categories to displayable categories
        if (key === 'fruit' || key === 'vegetable') category = 'Produce';
        else if (key === 'protein') category = 'Protein';
        else if (key === 'dairy') category = 'Dairy';
        else if (key === 'grain') category = 'Grains';
        break;
      }
    }
    
    // Generate random nutrition facts that make sense for the category
    let nutrition;
    switch(category) {
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
    
    // Generate between 2-4 random diet types that make sense for the category
    const numDietTypes = Math.floor(Math.random() * 3) + 2;
    const randomDietTypes = [];
    
    // Add diet types that might make sense based on category
    if (category === 'Produce') {
      randomDietTypes.push('Vegan', 'Vegetarian', 'Gluten-Free');
    } else if (category === 'Protein' && !searchLower.includes('tofu')) {
      randomDietTypes.push('Keto', 'Paleo', 'High-Protein');
    } else if (category === 'Grains' && !searchLower.includes('wheat')) {
      randomDietTypes.push('Vegetarian', 'Mediterranean');
    }
    
    // Fill remaining diet type slots with random ones
    while (randomDietTypes.length < numDietTypes) {
      const randomDiet = dietTypes[Math.floor(Math.random() * dietTypes.length)];
      if (!randomDietTypes.includes(randomDiet)) {
        randomDietTypes.push(randomDiet);
      }
    }
    
    // Random store sections based on category
    let relevantStoreSections;
    switch(category) {
      case 'Produce':
        relevantStoreSections = ['Produce'];
        break;
      case 'Protein':
        relevantStoreSections = ['Meat', 'Refrigerated', 'Frozen'];
        break;
      case 'Dairy':
        relevantStoreSections = ['Dairy', 'Refrigerated'];
        break;
      case 'Grains':
        relevantStoreSections = ['Dry Goods', 'Bakery', 'Baking'];
        break;
      default:
        relevantStoreSections = storeSections;
    }
    
    // Pick 1-2 store sections
    const numSections = Math.floor(Math.random() * 2) + 1;
    const productStoreSections = [];
    for (let i = 0; i < numSections; i++) {
      const randomIndex = Math.floor(Math.random() * relevantStoreSections.length);
      const section = relevantStoreSections[randomIndex];
      if (!productStoreSections.includes(section)) {
        productStoreSections.push(section);
      }
    }
    
    // Generate store locations
    const storeLocations = [
      { 
        store: "Whole Foods", 
        aisle: `${Math.floor(Math.random() * 20) + 1}`, 
        section: productStoreSections[0] 
      },
      { 
        store: "Trader Joe's", 
        aisle: `${Math.floor(Math.random() * 10) + 1}`, 
        section: productStoreSections[0] 
      }
    ];
    
    // Generate a placeholder image based on category
    // In a real implementation, this would be a real product image
    const imagePlaceholders = {
      'Produce': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c',
      'Protein': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
      'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da',
      'Grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c',
      'Snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60',
      'Beverages': 'https://images.unsplash.com/photo-1550583724-b2692b85b150'
    };
    
    const imageUrl = imagePlaceholders[category] || 'https://images.unsplash.com/photo-1604742763101-7cbec5bc45f1';
    
    // Generate a random ID that doesn't conflict with existing items
    const newId = Math.max(...groceryItems.map(item => item.id), 0) + 1;
    
    // Create new dynamic item
    const newItem = {
      id: newId,
      name: capitalizedName,
      category: category,
      price: parseFloat(randomPrice),
      unit: randomUnit,
      nutrition: nutrition,
      dietTypes: randomDietTypes,
      isOrganic: Math.random() > 0.5, // 50% chance of being organic
      storeSections: productStoreSections,
      storeLocations: storeLocations,
      image: `${imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80`
    };
    
    // Return as an array of one new item
    // In a real API, this would be multiple matching items
    return [newItem];
  };

  // State for search loading indicators
  const [isSearching, setIsSearching] = useState(false);
  
  // Filter items based on search and category
  useEffect(() => {
    const filterItems = async () => {
      let items = groceryItems;
      
      // Filter by search
      if (searchTerm) {
        // Show loading state
        setIsSearching(true);
        
        try {
          // This will search existing items AND generate new ones if nothing is found
          const searchResults = await fetchRealGroceryData(searchTerm);
          
          // Always use the search results (they'll either be existing items
          // or dynamically generated ones)
          if (searchResults && searchResults.length > 0) {
            items = searchResults;
          } else {
            // Fallback if the search and generation failed
            setIsSearching(false);
            console.error('Search returned no results, even after item generation attempt');
            
            // Just do a basic filter on the existing items as a last resort
            const search = searchTerm.toLowerCase().trim();
            
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
        } catch (error) {
          console.error('Error in search:', error);
        } finally {
          // Hide loading state
          setIsSearching(false);
        }
      }
      
      // Filter by category
      if (selectedCategory !== 'All') {
        items = items.filter(item => item.category === selectedCategory);
      }
      
      setFilteredItems(items);
    };
    
    filterItems();
  }, [searchTerm, selectedCategory, groceryItems]);
  
  // Load meal plan ingredients if a meal plan is selected
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
  
  // Initialize with Minnesota stores on component mount
  useEffect(() => {
    // Since you mentioned you live in MN, ensure the component starts with MN stores
    if (!availableStores || availableStores.length === 0) {
      setAvailableStores(mockStoresByRegion.MN);
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
    // Check if we need to generate fresh dynamic ingredients
    const shouldRefreshPlan = !currentMealPlan || currentMealPlan.id !== mealPlan.id;
    
    if (shouldRefreshPlan) {
      // Get a copy of the meal plan
      const refreshedPlan = {...mealPlan};
      
      // Refresh some of the ingredients with dynamically generated ones
      // This creates more variety each time a meal plan is selected
      const refreshedIngredients = await refreshMealPlanIngredients(refreshedPlan.ingredients, refreshedPlan.dietType);
      refreshedPlan.ingredients = refreshedIngredients;
      
      // Set the updated meal plan
      setCurrentMealPlan(refreshedPlan);
    } else {
      // Just use the existing meal plan
      setCurrentMealPlan(mealPlan);
    }
  };
  
  // Helper function to refresh some ingredients in a meal plan
  const refreshMealPlanIngredients = async (ingredients, dietType) => {
    // Copy the existing ingredients
    const refreshedIngredients = [...ingredients];
    
    // Determine how many ingredients to refresh (30-50% of the ingredients)
    const numToRefresh = Math.floor(Math.random() * (ingredients.length * 0.2) + (ingredients.length * 0.3));
    
    // Keep track of refreshed indexes to avoid duplicates
    const refreshedIndexes = new Set();
    
    // Refresh random ingredients
    for (let i = 0; i < numToRefresh; i++) {
      // Pick a random ingredient to refresh
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * ingredients.length);
      } while (refreshedIndexes.has(randomIndex));
      
      refreshedIndexes.add(randomIndex);
      
      // Get the existing ingredient
      const ingredient = ingredients[randomIndex];
      
      try {
        // Get a new replacement ingredient that fits the diet type
        // First try to find a replacement from existing grocery items
        const category = getCategoryFromName(ingredient.name);
        
        // Create search terms based on category and diet type
        const searchTerms = [];
        
        // Add category-based search terms
        if (category === 'protein') {
          if (dietType === 'Vegan') {
            searchTerms.push('tofu', 'tempeh', 'seitan', 'lentils', 'beans');
          } else if (dietType === 'Vegetarian') {
            searchTerms.push('eggs', 'tofu', 'cheese', 'yogurt', 'cottage cheese');
          } else if (dietType === 'Keto') {
            searchTerms.push('beef', 'chicken', 'salmon', 'tuna', 'eggs');
          } else {
            searchTerms.push('chicken', 'fish', 'beef', 'pork', 'turkey');
          }
        } else if (category === 'vegetable') {
          searchTerms.push('broccoli', 'spinach', 'kale', 'peppers', 'cauliflower', 'brussels sprouts', 'asparagus');
        } else if (category === 'fruit') {
          if (dietType === 'Keto') {
            searchTerms.push('avocado', 'olives', 'berries');
          } else {
            searchTerms.push('apple', 'orange', 'berries', 'pear', 'banana', 'kiwi');
          }
        } else if (category === 'grain') {
          if (dietType === 'Keto' || dietType === 'Paleo') {
            searchTerms.push('coconut flour', 'almond flour');
          } else if (dietType === 'Gluten-Free') {
            searchTerms.push('quinoa', 'rice', 'gluten-free oats', 'buckwheat');
          } else {
            searchTerms.push('quinoa', 'rice', 'farro', 'oats', 'barley');
          }
        } else if (category === 'nuts') {
          searchTerms.push('almonds', 'walnuts', 'cashews', 'pecans', 'pistachios');
        } else if (category === 'dairy') {
          if (dietType === 'Vegan') {
            searchTerms.push('almond milk', 'oat milk', 'soy milk', 'coconut yogurt');
          } else if (dietType === 'Paleo' || dietType === 'Dairy-Free') {
            searchTerms.push('coconut milk', 'almond milk');
          } else {
            searchTerms.push('yogurt', 'milk', 'cheese', 'cottage cheese');
          }
        } else {
          // For unknown categories, use generic search terms
          searchTerms.push('food', 'healthy', 'organic');
        }
        
        // Pick a random search term
        const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        
        // Try to find or generate a new item
        let newItems = await fetchRealGroceryData(searchTerm);
        
        // If we found matching items, pick one
        if (newItems && newItems.length > 0) {
          // Pick a random item from the results
          const newItem = newItems[Math.floor(Math.random() * newItems.length)];
          
          // Update the ingredient with the new item
          refreshedIngredients[randomIndex] = {
            itemId: newItem.id,
            name: newItem.name,
            quantity: ingredient.quantity, // Keep the same quantity
            unit: newItem.unit
          };
        }
      } catch (error) {
        console.error('Error refreshing ingredient:', error);
        // If there's an error, keep the original ingredient
      }
    }
    
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
  
  // Function to get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setLocationLoading(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Get coordinates
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Set user location
          setUserLocation({ lat, lng });
          
          // Fetch nearby stores based on location
          const nearbyStores = await findNearbyStores(lat, lng);
          setAvailableStores(nearbyStores);
          
          // Auto-select the closest store if no store is selected
          if (!selectedStore && nearbyStores.length > 0) {
            setSelectedStore(nearbyStores[0]);
          }
          
          setLocationLoading(false);
        } catch (error) {
          console.error("Error finding nearby stores:", error);
          setLocationError("Failed to find stores near your location");
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        
        // Fall back to Minnesota location if geolocation fails
        handleFallbackLocation(error);
      },
      { timeout: 10000 }
    );
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
  
  // Handle checkout
  const handleCheckout = () => {
    setCheckoutDialogOpen(true);
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
            </Tabs>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            {/* Browse Tab */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <TextField
                      placeholder="Search groceries (e.g. strawberries, protein, vegan)..."
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
                        Search by name, category, diet type, or food group
                      </Typography>
                      <Chip 
                        label="Connects to grocery APIs" 
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
                            Real-time grocery data APIs (Instacart, Kroger, etc.)
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
                  <Grid container spacing={3}>
                    {filteredItems.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <GroceryItemCard 
                          item={item} 
                          onAdd={handleAddToCart} 
                          isAdded={isInCart(item.id)}
                          cartQuantity={getCartQuantity(item.id)}
                        />
                      </Grid>
                    ))}
                  </Grid>
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
                          >
                            {availableStores.map((store) => (
                              <MenuItem key={store.id} value={store.id}>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                  <Typography variant="body2">
                                    {store.name} {store.distance && `(${store.distance.toFixed(1)} miles away)`}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {store.address}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        {selectedStore && (
                          <Paper variant="outlined" sx={{ p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                            <Typography variant="caption" color="text.secondary">
                              <b>Delivery estimate:</b> {selectedStore.deliveryAvailable 
                                ? `30-45 minutes from ${selectedStore.name}` 
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
          Complete Your Order
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Your order from {selectedStore?.name} will be prepared for delivery.
          </DialogContentText>
          
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
                    label="Delivery available" 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
            </Paper>
          )}
          
          <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="success" fontSize="small" />
              Delivery to: {userLocation ? 'Your current location' : '123 Main St, Apt 4B, New York, NY 10001'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Estimated delivery: {selectedStore?.deliveryAvailable ? 'Today within 30-45 minutes' : 'Not available for this location'}
            </Typography>
          </Box>
          
          <Typography variant="body2" paragraph>
            This is a demo. In a real implementation, this would connect to Instacart, Kroger, or a similar service API to place your order with real-time location data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setCheckoutDialogOpen(false);
              // In a real app, this would submit the order
              alert("Thank you for your order! Your groceries will be delivered soon.");
              setCartItems([]);
            }} 
            variant="contained"
            color="primary"
          >
            Place Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroceryTab;