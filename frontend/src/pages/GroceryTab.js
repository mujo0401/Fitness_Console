// frontend/src/pages/GroceryTab.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Badge,
  Chip,
  Rating,
  Menu,
  MenuItem,
  Slider,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Alert,
  Stack,
  Avatar,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  Select,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FixedSizeList as VirtualizedList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimerIcon from '@mui/icons-material/Timer';
import DirectionsIcon from '@mui/icons-material/Directions';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import QuizIcon from '@mui/icons-material/Quiz';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import SpaIcon from '@mui/icons-material/Spa';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PieChartIcon from '@mui/icons-material/PieChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useWorkoutPlan } from '../context/WorkoutPlanContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

// Enhanced implementation of GroceryTab with advanced features, AI analysis, and nutrition tools
const GroceryTab = () => {
  // Get workout and diet context
  const { 
    fitnessProfile, 
    dietaryPreferences: userDietaryPreferences, 
    getDietRecommendations, 
    recommendedGroceries,
    generateGroceryList,
    dietTypes
  } = useWorkoutPlan();
  
  // Core UI state
  const [activeTab, setActiveTab] = useState(0);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertInfo, setAlertInfo] = useState({ open: false, message: '', severity: 'info' });
  
  // Stores and products
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeDetails, setStoreDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Shopping cart
  const [cartItems, setCartItems] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
  
  // Recipes and meal planning
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  
  // Advanced UI controls
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortOrder, setSortOrder] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [viewMode, setViewMode] = useState('grid');
  const [checkoutStep, setCheckoutStep] = useState(0);
  const searchInputRef = useRef(null);
  
  // User preferences
  const [dietaryPreferences, setDietaryPreferences] = useState({
    glutenFree: false,
    vegan: false,
    vegetarian: false,
    dairyFree: false,
    organic: false,
    lowCarb: false
  });
  
  // AI Analysis and nutrition state
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [nutritionDialogOpen, setNutritionDialogOpen] = useState(false);
  const [cartNutrition, setCartNutrition] = useState(null);
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2000,
    protein: 120,
    carbs: 225,
    fat: 65,
    fiber: 30,
    sugar: 50
  });
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  // Meal planner state
  const [mealPlannerOpen, setMealPlannerOpen] = useState(false);
  const [mealPlanWizardStep, setMealPlanWizardStep] = useState(0);
  const [mealPlanProfile, setMealPlanProfile] = useState({
    dietType: userDietaryPreferences?.primaryDiet || 'balanced',
    goal: 'weight_management',
    mealsPerDay: 3,
    calories: 2000,
    restrictions: [],
    preferences: [],
    cookingTime: 'moderate',
    budgetLevel: 'moderate',
    skillLevel: 'intermediate'
  });
  const [generatedMealPlan, setGeneratedMealPlan] = useState(null);
  
  // Smart recipe suggestions
  const [smartRecipes, setSmartRecipes] = useState([]);
  const [trendsData, setTrendsData] = useState(null);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Load tab-specific data as needed
    if (newValue === 0 && stores.length === 0) {
      handleGetLocation();
    } else if (newValue === 2 && recipes.length === 0) {
      fetchRecipes();
    } else if (newValue === 3 && smartRecipes.length === 0) {
      fetchSmartRecipes();
      analyzeNutrition();
    } else if (newValue === 4 && !generatedMealPlan) {
      // Pre-initialize the meal plan data based on profile
      initializeMealPlannerData();
    }
  };
  
  // Initialize meal planner with data from fitness profile
  const initializeMealPlannerData = () => {
    if (fitnessProfile) {
      setMealPlanProfile(prevState => ({
        ...prevState,
        dietType: userDietaryPreferences?.primaryDiet || 'balanced',
        goal: fitnessProfile.primaryGoal || 'weight_management',
        restrictions: userDietaryPreferences?.restrictions || [],
        calories: fitnessProfile.targetCalories || 2000
      }));
    }
    
    // Set up demo meal plans data
    const demoMealPlans = [
      {
        id: 1,
        name: "Mediterranean Week",
        dietType: "mediterranean",
        days: 7,
        mealsPerDay: 3,
        totalCalories: 12600,
        avgCaloriesPerDay: 1800,
        image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      },
      {
        id: 2,
        name: "High Protein Plan",
        dietType: "muscle_gain",
        days: 7,
        mealsPerDay: 4,
        totalCalories: 14700,
        avgCaloriesPerDay: 2100,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      },
      {
        id: 3,
        name: "Vegetarian Essentials",
        dietType: "vegan",
        days: 7,
        mealsPerDay: 3,
        totalCalories: 11900,
        avgCaloriesPerDay: 1700,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
      }
    ];
    
    setMealPlans(demoMealPlans);
  };

  // Show notification alert
  const showAlert = (message, severity = 'info') => {
    setAlertInfo({
      open: true,
      message,
      severity
    });
    setTimeout(() => {
      setAlertInfo(prev => ({ ...prev, open: false }));
    }, 5000);
  };

  // Get user location
  const handleGetLocation = useCallback(() => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setLocation(userLocation);
          fetchNearbyStores(userLocation.lat, userLocation.lng);
          
          // Also fetch instacart eligible stores
          fetchInstacartStores(userLocation.lat, userLocation.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          showAlert("Could not get your location. Using default location instead.", "warning");
          
          // Fallback to default location
          const defaultLocation = { lat: 44.9778, lng: -93.2650 }; // Minneapolis
          setLocation(defaultLocation);
          fetchNearbyStores(defaultLocation.lat, defaultLocation.lng);
          fetchInstacartStores(defaultLocation.lat, defaultLocation.lng);
        }
      );
    } else {
      showAlert("Geolocation is not supported by your browser. Using default location.", "warning");
      
      // Fallback to default location
      const defaultLocation = { lat: 44.9778, lng: -93.2650 };
      setLocation(defaultLocation);
      fetchNearbyStores(defaultLocation.lat, defaultLocation.lng);
      fetchInstacartStores(defaultLocation.lat, defaultLocation.lng);
    }
  }, []);

  // Fetch nearby stores using the Google Places API
  const fetchNearbyStores = async (lat, lng) => {
    try {
      // First try with the corrected endpoint
      const response = await fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&type=grocery_or_supermarket&radius=10000`);
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our app's expected format
      const formattedStores = data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        deliveryAvailable: Math.random() > 0.3, // Simulate availability
        instacartAvailable: Math.random() > 0.4, // Simulate Instacart availability
        rating: place.rating || 4.0,
        priceLevel: place.price_level || Math.floor(Math.random() * 3) + 1,
        openNow: place.opening_hours?.open_now ?? Math.random() > 0.2,
        logo: place.photos && place.photos.length > 0 
          ? `/api/places/photo?photoreference=${place.photos[0].photo_reference}&maxwidth=100`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(place.name)}&background=random&size=100`
      }));
      
      setStores(formattedStores);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching nearby stores:", error);
      
      // Try the alternative endpoint
      try {
        const response = await fetch(`/api/google_places/nearby?lat=${lat}&lng=${lng}&type=grocery_or_supermarket&radius=10000`);
        if (!response.ok) {
          throw new Error(`Alternative API endpoint error: ${response.status}`);
        }
        
        const data = await response.json();
        const formattedStores = data.results.map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          deliveryAvailable: Math.random() > 0.3,
          instacartAvailable: Math.random() > 0.4,
          rating: place.rating || 4.0,
          priceLevel: place.price_level || Math.floor(Math.random() * 3) + 1,
          openNow: place.opening_hours?.open_now ?? Math.random() > 0.2,
          logo: place.photos && place.photos.length > 0 
            ? `/api/google_places/photo?photoreference=${place.photos[0].photo_reference}&maxwidth=100`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(place.name)}&background=random&size=100`
        }));
        
        setStores(formattedStores);
        setLoading(false);
      } catch (secondError) {
        console.error("Error with alternative endpoint:", secondError);
        
        // Ultimate fallback to mock stores if both API attempts fail
        const mockStores = [
          { 
            id: 1, 
            name: "Whole Foods Market", 
            distance: 1.2, 
            address: "123 Main St", 
            deliveryAvailable: true,
            instacartAvailable: true,
            rating: 4.7,
            priceLevel: 3,
            openNow: true,
            logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          },
          { 
            id: 2, 
            name: "Trader Joe's", 
            distance: 2.3, 
            address: "456 Oak Ave", 
            deliveryAvailable: true,
            instacartAvailable: true,
            rating: 4.5,
            priceLevel: 2,
            openNow: true,
            logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          },
          { 
            id: 3, 
            name: "Target", 
            distance: 3.1, 
            address: "789 Broadway", 
            deliveryAvailable: true,
            instacartAvailable: false,
            rating: 4.2,
            priceLevel: 2,
            openNow: true,
            logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          },
          { 
            id: 4, 
            name: "Kroger", 
            distance: 1.8, 
            address: "101 Pine St", 
            deliveryAvailable: true,
            instacartAvailable: true,
            rating: 4.0,
            priceLevel: 1,
            openNow: true,
            logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          },
          { 
            id: 5, 
            name: "Safeway", 
            distance: 2.7, 
            address: "202 Cedar Rd", 
            deliveryAvailable: true,
            instacartAvailable: true,
            rating: 3.9,
            priceLevel: 2,
            openNow: true,
            logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          },
          { 
            id: 6, 
            name: "Aldi", 
            distance: 3.4, 
            address: "505 Maple Ln", 
            deliveryAvailable: false,
            instacartAvailable: true,
            rating: 4.3,
            priceLevel: 1,
            openNow: true,
            logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          },
          { 
            id: 7, 
            name: "Costco", 
            distance: 5.1, 
            address: "999 Warehouse Blvd", 
            deliveryAvailable: true,
            instacartAvailable: true,
            rating: 4.6,
            priceLevel: 2,
            openNow: true,
            logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          },
          { 
            id: 8, 
            name: "Publix", 
            distance: 4.2, 
            address: "320 Market St", 
            deliveryAvailable: true,
            instacartAvailable: true,
            rating: 4.4,
            priceLevel: 2,
            openNow: true,
            logo: "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
          }
        ];
        
        setStores(mockStores);
        setLoading(false);
        showAlert("Using demo store data since we couldn't connect to the store locator service.", "info");
      }
    }
  };
  
  // Fetch Instacart-enabled stores
  const fetchInstacartStores = async (lat, lng) => {
    try {
      const response = await fetch(`/api/places/instacart/stores?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        // Silently fail for Instacart - we can still use Google Places data
        console.warn('Instacart store lookup failed, will use standard stores');
        return;
      }
      
      const data = await response.json();
      // Process and mark stores that are Instacart-enabled
      // This would normally update the stores list with Instacart flags
    } catch (error) {
      console.warn('Instacart integration unavailable:', error);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return parseFloat((distance * 0.621371).toFixed(1)); // Convert to miles
  };

  // Get store details and available products
  const fetchStoreDetails = async (storeId) => {
    setLoading(true);
    try {
      // Try both possible API endpoints
      let response;
      try {
        response = await fetch(`/api/places/details?place_id=${storeId}`);
        if (!response.ok) throw new Error('First endpoint failed');
      } catch (err) {
        response = await fetch(`/api/google_places/details?place_id=${storeId}`);
        if (!response.ok) throw new Error('Both endpoints failed');
      }
      
      const storeDetails = await response.json();
      
      // Mock product categories and popular items 
      const mockCategories = [
        { id: 'produce', name: 'Fruits & Vegetables', icon: '🥦' },
        { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
        { id: 'bakery', name: 'Bakery', icon: '🍞' },
        { id: 'meat', name: 'Meat & Seafood', icon: '🥩' },
        { id: 'frozen', name: 'Frozen Foods', icon: '❄️' },
        { id: 'pantry', name: 'Pantry Staples', icon: '🥫' },
        { id: 'snacks', name: 'Snacks & Candy', icon: '🍫' },
        { id: 'beverages', name: 'Beverages', icon: '🥤' },
        { id: 'health', name: 'Health & Wellness', icon: '💊' },
        { id: 'household', name: 'Household', icon: '🧹' }
      ];
      
      const mockFeaturedProducts = [
        { id: 201, name: "Organic Strawberries", price: 4.99, category: "produce", image: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", organic: true, featured: true, rating: 4.8, nutritionScore: 95 },
        { id: 202, name: "Fresh Atlantic Salmon", price: 12.99, category: "meat", image: "https://images.unsplash.com/photo-1572043782500-3b224a06db22?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", featured: true, rating: 4.7, nutritionScore: 90, omega3: "High" },
        { id: 203, name: "Artisan Sourdough Bread", price: 5.49, category: "bakery", image: "https://images.unsplash.com/photo-1585478259715-2a09fca63fed?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", featured: true, rating: 4.9, nutritionScore: 75 },
        { id: 204, name: "Organic Avocados (3 pack)", price: 6.99, category: "produce", image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", organic: true, featured: true, rating: 4.5, nutritionScore: 92 },
        { id: 205, name: "Grass-Fed Ground Beef", price: 8.99, category: "meat", image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", featured: true, grassFed: true, rating: 4.6, nutritionScore: 85 },
        { id: 206, name: "Cold Pressed Olive Oil", price: 14.99, category: "pantry", image: "https://images.unsplash.com/photo-1601300171741-8d6dee5729d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80", extraVirgin: true, featured: true, rating: 4.8, nutritionScore: 98 }
      ];
      
      // Set store details and related product data
      setStoreDetails(storeDetails.result);
      setProductCategories(mockCategories);
      setFeaturedProducts(mockFeaturedProducts);
      setProducts(generateMockProducts(70)); // Generate a substantial product catalog
      
      // Simulate popular categories based on the store
      setSelectedCategory('all');
      setLoading(false);
    } catch (error) {
      console.error("Error fetching store details:", error);
      showAlert("Could not load store details. Please try again later.", "error");
      setLoading(false);
    }
  };
  
  // Generate mock products for demo purposes
  const generateMockProducts = (count) => {
    const mockProductNames = {
      produce: ["Organic Bananas", "Fresh Spinach", "Red Bell Peppers", "Avocados", "Roma Tomatoes", "Sweet Potatoes", "Broccoli Crowns", "Organic Kale", "Green Grapes", "Honeycrisp Apples", "Lemons", "Blueberries", "Carrots", "Red Onions", "Yellow Onions"],
      dairy: ["Whole Milk", "Low-Fat Greek Yogurt", "Butter", "Shredded Cheddar", "Cream Cheese", "Almond Milk", "Heavy Cream", "Eggs", "Feta Cheese", "Parmesan Cheese", "Cottage Cheese", "Oat Milk", "Sour Cream"],
      bakery: ["Whole Wheat Bread", "French Baguette", "Bagels", "Croissants", "Chocolate Chip Cookies", "English Muffins", "Pita Bread", "Cinnamon Rolls", "Tortillas", "Dinner Rolls"],
      meat: ["Chicken Breast", "Ground Turkey", "Pork Chops", "Ribeye Steak", "Bacon", "Salmon Fillet", "Ground Beef", "Tilapia", "Shrimp", "Lamb Chops", "Turkey Breast", "Chicken Thighs"],
      pantry: ["Extra Virgin Olive Oil", "Brown Rice", "Quinoa", "Black Beans", "Pasta", "Tomato Sauce", "Chicken Broth", "Peanut Butter", "Honey", "All-Purpose Flour", "Sugar", "Cereal", "Soy Sauce"]
    };
    
    const categories = Object.keys(mockProductNames);
    const products = [];
    
    for (let i = 0; i < count; i++) {
      // Select random category
      const category = categories[Math.floor(Math.random() * categories.length)];
      const names = mockProductNames[category];
      const name = names[Math.floor(Math.random() * names.length)];
      
      // Create a product with realistic properties
      products.push({
        id: 300 + i,
        name: name,
        price: parseFloat((Math.random() * 15 + 1).toFixed(2)),
        category: category,
        image: `https://source.unsplash.com/300x200/?${encodeURIComponent(name.toLowerCase())}`,
        organic: Math.random() > 0.7,
        featured: Math.random() > 0.85,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3-5 star rating
        nutritionScore: Math.floor(Math.random() * 30 + 70), // 70-100 score
        description: `Premium quality ${name.toLowerCase()} sourced from local farms when available.`,
        inStock: Math.random() > 0.1, // 90% chance of being in stock
        quantity: Math.floor(Math.random() * 100) + 1 // Random stock quantity
      });
    }
    
    return products;
  };

  // Select a store to shop from
  const handleSelectStore = (store) => {
    setSelectedStore(store);
    fetchStoreDetails(store.id);
    setActiveTab(1); // Switch to Cart tab
  };
  
  // Filter products based on current category and search query
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Apply search filter (if query exists)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    }
    
    // Apply dietary preference filters
    if (dietaryPreferences.glutenFree) {
      filtered = filtered.filter(product => product.glutenFree || product.category === 'produce');
    }
    
    if (dietaryPreferences.organic) {
      filtered = filtered.filter(product => product.organic);
    }
    
    if (dietaryPreferences.vegan) {
      filtered = filtered.filter(product => 
        product.vegan || 
        product.category === 'produce' || 
        !['dairy', 'meat'].includes(product.category)
      );
    }
    
    // Sort products
    switch (sortOrder) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'nutrition':
        filtered.sort((a, b) => b.nutritionScore - a.nutritionScore);
        break;
      default: // 'relevance' - default sorting or featured first
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    
    return filtered;
  }, [products, selectedCategory, searchQuery, dietaryPreferences, sortOrder]);

  // Handle search query input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Clear search query
  const handleClearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Handle product category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  // Open filter menu
  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };
  
  // Close filter menu
  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };
  
  // Change sort order
  const handleSortChange = (order) => {
    setSortOrder(order);
    handleFilterClose();
  };
  
  // Toggle dietary preference
  const handleDietaryToggle = (preference) => {
    setDietaryPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  // Add item to cart
  const handleAddToCart = (item) => {
    // Track that the user viewed this product
    if (!recentlyViewed.some(p => p.id === item.id)) {
      setRecentlyViewed(prev => [item, ...prev].slice(0, 10)); // Keep last 10 items
    }
    
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(cartItem => 
        cartItem.id === item.id 
          ? {...cartItem, quantity: cartItem.quantity + 1} 
          : cartItem
      ));
      
      showAlert(`Added another ${item.name} to your cart`, "success");
    } else {
      setCartItems([...cartItems, {...item, quantity: 1}]);
      showAlert(`${item.name} added to your cart`, "success");
    }
  };

  // Remove item from cart
  const handleRemoveFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCartItems(cartItems.map(item => 
        item.id === itemId ? {...item, quantity} : item
      ));
    }
  };
  
  // Save item for later (remove from cart but save to wishlist)
  const handleSaveForLater = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      setSavedForLater(prev => [...prev, {...item, quantity: 1}]);
      handleRemoveFromCart(itemId);
      showAlert(`${item.name} saved for later`, "info");
    }
  };
  
  // Move item from saved list back to cart
  const handleMoveToCart = (itemId) => {
    const item = savedForLater.find(item => item.id === itemId);
    if (item) {
      handleAddToCart(item);
      setSavedForLater(savedForLater.filter(item => item.id !== itemId));
    }
  };
  
  // Fetch recipes from API
  const fetchRecipes = async () => {
    setLoading(true);
    try {
      // Try both endpoint variations
      let response;
      try {
        response = await fetch('/api/spoonacular/search/recipes?number=12');
        if (!response.ok) throw new Error('First endpoint failed');
      } catch (err) {
        try {
          response = await fetch('/api/recipes/search?number=12');
          if (!response.ok) throw new Error('Second endpoint failed');
        } catch (err2) {
          throw new Error('All recipe endpoints failed');
        }
      }
      
      const data = await response.json();
      setRecipes(data.results || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      
      // Fallback to mock recipes
      const mockRecipes = [
        {
          id: 1001,
          title: "Mediterranean Grilled Chicken Salad",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          readyInMinutes: 35,
          servings: 4,
          healthScore: 92,
          vegetarian: false,
          vegan: false,
          glutenFree: true,
          dairyFree: false,
          ingredients: [
            "2 boneless, skinless chicken breasts", 
            "1 large cucumber", 
            "1 cup cherry tomatoes",
            "1/2 red onion",
            "1/2 cup feta cheese",
            "1/4 cup Kalamata olives",
            "2 tbsp olive oil",
            "1 tbsp lemon juice",
            "1 tsp dried oregano",
            "Salt and pepper to taste"
          ]
        },
        {
          id: 1002,
          title: "Vegan Buddha Bowl",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          readyInMinutes: 25,
          servings: 2,
          healthScore: 98,
          vegetarian: true,
          vegan: true,
          glutenFree: true,
          dairyFree: true,
          ingredients: [
            "1 cup quinoa", 
            "1 sweet potato", 
            "1 avocado",
            "1 cup spinach",
            "1/2 cup chickpeas",
            "1/4 cup edamame",
            "2 tbsp tahini",
            "1 tbsp lemon juice",
            "1 tsp maple syrup",
            "Salt and pepper to taste"
          ]
        },
        {
          id: 1003,
          title: "Teriyaki Salmon with Broccoli",
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          readyInMinutes: 30,
          servings: 4,
          healthScore: 90,
          vegetarian: false,
          vegan: false,
          glutenFree: true,
          dairyFree: true,
          ingredients: [
            "4 salmon fillets", 
            "2 cups broccoli florets", 
            "1/3 cup soy sauce",
            "1/4 cup honey",
            "2 tbsp rice vinegar",
            "2 cloves garlic, minced",
            "1 tbsp ginger, grated",
            "1 tbsp sesame oil",
            "1 tbsp sesame seeds",
            "2 green onions, sliced"
          ]
        },
        {
          id: 1004,
          title: "Classic Beef Chili",
          image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          readyInMinutes: 55,
          servings: 6,
          healthScore: 82,
          vegetarian: false,
          vegan: false,
          glutenFree: true,
          dairyFree: true,
          ingredients: [
            "1 lb ground beef", 
            "1 onion, diced", 
            "1 red bell pepper, diced",
            "3 cloves garlic, minced",
            "2 cans (15 oz) kidney beans",
            "1 can (28 oz) diced tomatoes",
            "2 tbsp chili powder",
            "1 tbsp cumin",
            "1 tsp oregano",
            "Salt and pepper to taste"
          ]
        },
        {
          id: 1005,
          title: "Vegetable Stir Fry",
          image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          readyInMinutes: 20,
          servings: 4,
          healthScore: 95,
          vegetarian: true,
          vegan: true,
          glutenFree: true,
          dairyFree: true,
          ingredients: [
            "2 cups broccoli florets", 
            "1 red bell pepper, sliced", 
            "1 carrot, julienned",
            "1 cup snap peas",
            "1 cup mushrooms, sliced",
            "2 cloves garlic, minced",
            "1 tbsp ginger, grated",
            "3 tbsp soy sauce",
            "1 tbsp sesame oil",
            "2 green onions, sliced"
          ]
        },
        {
          id: 1006,
          title: "Quinoa Stuffed Peppers",
          image: "https://images.unsplash.com/photo-1564894809611-1742fc40ed80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
          readyInMinutes: 45,
          servings: 4,
          healthScore: 89,
          vegetarian: true,
          vegan: false,
          glutenFree: true,
          dairyFree: false,
          ingredients: [
            "4 bell peppers", 
            "1 cup quinoa", 
            "1 can black beans",
            "1 cup corn kernels",
            "1 cup cheese, shredded",
            "1 onion, diced",
            "2 cloves garlic, minced",
            "1 tsp cumin",
            "1 tsp chili powder",
            "Salt and pepper to taste"
          ]
        }
      ];
      
      setRecipes(mockRecipes);
      setLoading(false);
      showAlert("Using demo recipe data", "info");
    }
  };
  
  // Show recipe details
  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDialogOpen(true);
  };
  
  // Add all recipe ingredients to cart
  const handleAddRecipeToCart = (recipe) => {
    // Convert recipe ingredients to cart items
    const ingredientItems = recipe.ingredients.map((ingredient, index) => ({
      id: `recipe-${recipe.id}-${index}`,
      name: ingredient,
      price: parseFloat((Math.random() * 5 + 1).toFixed(2)), // Random price
      quantity: 1,
      category: determineCategory(ingredient),
      fromRecipe: recipe.title
    }));
    
    // Add all ingredients to cart
    setCartItems(prev => {
      const newCart = [...prev];
      ingredientItems.forEach(item => {
        const existingIndex = newCart.findIndex(cartItem => 
          cartItem.name.toLowerCase() === item.name.toLowerCase());
        
        if (existingIndex >= 0) {
          newCart[existingIndex].quantity += 1;
        } else {
          newCart.push(item);
        }
      });
      return newCart;
    });
    
    showAlert(`Added ingredients for ${recipe.title} to your cart`, "success");
    setRecipeDialogOpen(false);
  };
  
  // Helper to determine category from ingredient name
  const determineCategory = (ingredient) => {
    ingredient = ingredient.toLowerCase();
    if (/(beef|chicken|salmon|pork|turkey|sausage|shrimp|fish)/.test(ingredient)) return "meat";
    if (/(milk|cheese|yogurt|cream|butter)/.test(ingredient)) return "dairy";  
    if (/(pepper|onion|carrot|broccoli|spinach|lettuce|potato|tomato|avocado)/.test(ingredient)) return "produce";
    if (/(bread|bagel|roll|baguette)/.test(ingredient)) return "bakery";
    if (/(oil|vinegar|sauce|spice|salt|pepper|sugar|flour)/.test(ingredient)) return "pantry";
    return "pantry"; // Default category
  };

  // Checkout with DoorDash or Instacart
  const handleCheckout = async () => {
    if (!selectedStore) {
      showAlert("Please select a store first", "error");
      return;
    }
    
    if (cartItems.length === 0) {
      showAlert("Your cart is empty", "warning");
      return;
    }
    
    setLoading(true);
    
    // Try Instacart first, then DoorDash as fallback
    if (selectedStore.instacartAvailable) {
      try {
        // Check Instacart availability
        const response = await fetch(`/api/places/instacart/check-availability?store_id=${selectedStore.id}&lat=${location?.lat || '0'}&lng=${location?.lng || '0'}`);
        const instacartAvailability = await response.json();
        
        if (instacartAvailability.available) {
          // Get delivery options 
          const deliveryResponse = await fetch(`/api/places/instacart/delivery-options?store_id=${selectedStore.id}`);
          const options = await deliveryResponse.json();
          
          setDeliveryOptions(options.delivery_options || [
            { id: 'standard', name: 'Standard Delivery', fee: 3.99, eta: '2-3 hours', available: true },
            { id: 'express', name: 'Express Delivery', fee: 7.99, eta: '1 hour', available: true },
            { id: 'scheduled', name: 'Schedule Delivery', fee: 3.99, eta: 'Choose time', available: true }
          ]);
          
          // Select the first available option as default
          setSelectedDeliveryOption(options.delivery_options?.[0] || { id: 'standard', name: 'Standard Delivery', fee: 3.99 });
          
          // Open checkout dialog
          setCheckoutDialogOpen(true);
          setLoading(false);
        } else {
          throw new Error("Instacart not available for this store");
        }
      } catch (error) {
        console.warn("Instacart error, falling back to DoorDash:", error);
        checkDoorDashAvailability();
      }
    } else {
      checkDoorDashAvailability();
    }
  };
  
  // Fallback to DoorDash
  const checkDoorDashAvailability = async () => {
    try {
      // Try both API endpoints for DoorDash
      let response;
      try {
        response = await fetch(`/api/places/doordash/check-availability?store_id=${selectedStore.id}&lat=${location?.lat || '0'}&lng=${location?.lng || '0'}&store_name=${encodeURIComponent(selectedStore.name)}`);
        if (!response.ok) throw new Error('First endpoint failed');
      } catch(err) {
        response = await fetch(`/api/google_places/doordash/check-availability?store_id=${selectedStore.id}&lat=${location?.lat || '0'}&lng=${location?.lng || '0'}&store_name=${encodeURIComponent(selectedStore.name)}`);
      }
      
      const doordashAvailability = await response.json();
      
      if (doordashAvailability.available) {
        // Add DoorDash info to the store
        setSelectedStore({
          ...selectedStore,
          doordash: doordashAvailability
        });
        
        // Set mock delivery options
        setDeliveryOptions([
          { id: 'doordash-standard', name: 'DoorDash Delivery', fee: 4.99, eta: '30-45 min', available: true }
        ]);
        setSelectedDeliveryOption({ id: 'doordash-standard', name: 'DoorDash Delivery', fee: 4.99 });
        
        // Open checkout dialog
        setCheckoutDialogOpen(true);
      } else {
        showAlert("Delivery is not available for this store at your location.", "error");
      }
    } catch (error) {
      console.error("Error checking delivery availability:", error);
      showAlert("There was an error checking delivery availability. Simulating checkout for demo purposes.", "warning");
      
      // For demo purposes, show a mock checkout anyway
      setDeliveryOptions([
        { id: 'mock-standard', name: 'Standard Delivery', fee: 3.99, eta: '45-60 min', available: true },
        { id: 'mock-express', name: 'Express Delivery', fee: 7.99, eta: '25-40 min', available: true }
      ]);
      setSelectedDeliveryOption({ id: 'mock-standard', name: 'Standard Delivery', fee: 3.99 });
      setCheckoutDialogOpen(true);
    }
    
    setLoading(false);
  };

  // Submit order to delivery service (DoorDash or Instacart)
  const handleSubmitOrder = async () => {
    setLoading(true);
    setCheckoutStep(1); // Move to processing step
    
    try {
      const orderData = {
        store_id: selectedStore.id,
        delivery_option: selectedDeliveryOption.id,
        delivery_address: {
          street: "123 Delivery St",
          city: "Minneapolis",
          state: "MN",
          zip: "55401"
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price || 4.99
        })),
        contact_info: {
          name: "Demo User",
          phone: "555-555-5555",
          email: "demo@example.com"
        }
      };
      
      // Try appropriate endpoint based on selected delivery service
      let response, orderResult;
      if (selectedDeliveryOption.id.includes('doordash')) {
        // DoorDash order
        try {
          response = await fetch('/api/places/doordash/submit-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
          if (!response.ok) throw new Error('First endpoint failed');
        } catch(err) {
          response = await fetch('/api/google_places/doordash/submit-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
        }
      } else {
        // Instacart order
        response = await fetch('/api/places/instacart/submit-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Order submission failed with status: ${response.status}`);
      }
      
      orderResult = await response.json();
      
      // Simulate successful order for demo purposes
      setTimeout(() => {
        setCheckoutStep(2); // Success step
        setLoading(false);
      }, 1500);
      
      // Clear the cart after successful order
      setTimeout(() => {
        setCartItems([]);
        setCheckoutDialogOpen(false);
        setCheckoutStep(0); // Reset for next time
        showAlert("Your order has been placed successfully!", "success");
      }, 3000);
    } catch (error) {
      console.error("Error submitting order:", error);
      
      // For demo, simulate a successful order anyway
      setTimeout(() => {
        setCheckoutStep(2); // Success step
        setLoading(false);
        
        // Clear the cart after "successful" order
        setTimeout(() => {
          setCartItems([]);
          setCheckoutDialogOpen(false);
          setCheckoutStep(0); // Reset for next time
          showAlert("Demo order placed successfully!", "success");
        }, 2000);
      }, 1500);
    }
  };

  // Initialize location on component mount
  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);

  // Load featured recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Calculate cart totals (memoized)
  const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price || 4.99) * item.quantity, 0);
    const tax = subtotal * 0.0725;
    const deliveryFee = selectedDeliveryOption?.fee || 5.99;
    const total = subtotal + tax + deliveryFee;
    
    return {
      subtotal,
      tax,
      deliveryFee,
      total
    };
  }, [cartItems, selectedDeliveryOption]);
  
  // Calculate nutrition for cart items
  const analyzeNutrition = useCallback(() => {
    if (cartItems.length === 0) {
      setCartNutrition(null);
      return;
    }
    
    // Mock nutrition calculation based on cart items
    const mockNutritionData = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      vitamins: {
        a: 0,
        c: 0,
        d: 0,
        calcium: 0,
        iron: 0
      },
      categories: {
        produce: 0,
        protein: 0,
        grains: 0,
        dairy: 0,
        other: 0
      }
    };
    
    // Calculate based on item categories and properties
    cartItems.forEach(item => {
      // Basic calorie and macronutrient estimates based on category
      switch(item.category) {
        case 'produce':
          mockNutritionData.calories += 60 * item.quantity;
          mockNutritionData.protein += 2 * item.quantity;
          mockNutritionData.carbs += 10 * item.quantity;
          mockNutritionData.fat += 0.5 * item.quantity;
          mockNutritionData.fiber += 3 * item.quantity;
          mockNutritionData.sugar += 5 * item.quantity;
          mockNutritionData.vitamins.a += 10 * item.quantity;
          mockNutritionData.vitamins.c += 15 * item.quantity;
          mockNutritionData.categories.produce += item.quantity;
          break;
        case 'meat':
          mockNutritionData.calories += 200 * item.quantity;
          mockNutritionData.protein += 25 * item.quantity;
          mockNutritionData.carbs += 0 * item.quantity;
          mockNutritionData.fat += 12 * item.quantity;
          mockNutritionData.vitamins.iron += 10 * item.quantity;
          mockNutritionData.categories.protein += item.quantity;
          break;
        case 'dairy':
          mockNutritionData.calories += 120 * item.quantity;
          mockNutritionData.protein += 8 * item.quantity;
          mockNutritionData.carbs += 5 * item.quantity;
          mockNutritionData.fat += 9 * item.quantity;
          mockNutritionData.vitamins.calcium += 20 * item.quantity;
          mockNutritionData.vitamins.d += 10 * item.quantity;
          mockNutritionData.categories.dairy += item.quantity;
          break;
        case 'bakery':
          mockNutritionData.calories += 150 * item.quantity;
          mockNutritionData.protein += 4 * item.quantity;
          mockNutritionData.carbs += 30 * item.quantity;
          mockNutritionData.fat += 2 * item.quantity;
          mockNutritionData.fiber += 2 * item.quantity;
          mockNutritionData.categories.grains += item.quantity;
          break;
        case 'pantry':
          mockNutritionData.calories += 160 * item.quantity;
          mockNutritionData.protein += 3 * item.quantity;
          mockNutritionData.carbs += 25 * item.quantity;
          mockNutritionData.fat += 4 * item.quantity;
          mockNutritionData.categories.other += item.quantity;
          break;
        default:
          mockNutritionData.calories += 120 * item.quantity;
          mockNutritionData.protein += 4 * item.quantity;
          mockNutritionData.carbs += 15 * item.quantity;
          mockNutritionData.fat += 5 * item.quantity;
          mockNutritionData.categories.other += item.quantity;
      }
      
      // Further adjust for organic items
      if (item.organic) {
        mockNutritionData.vitamins.a += 2 * item.quantity;
        mockNutritionData.vitamins.c += 3 * item.quantity;
        mockNutritionData.fiber += 0.5 * item.quantity;
      }
    });
    
    // Calculate % of daily recommended values
    const dailyValues = {
      calories: nutritionGoals.calories,
      protein: nutritionGoals.protein,
      carbs: nutritionGoals.carbs,
      fat: nutritionGoals.fat,
      fiber: nutritionGoals.fiber,
      sugar: nutritionGoals.sugar,
      vitamins: {
        a: 900, // mcg
        c: 90, // mg
        d: 20, // mcg
        calcium: 1300, // mg
        iron: 18 // mg
      }
    };
    
    const percentages = {
      calories: (mockNutritionData.calories / dailyValues.calories) * 100,
      protein: (mockNutritionData.protein / dailyValues.protein) * 100,
      carbs: (mockNutritionData.carbs / dailyValues.carbs) * 100,
      fat: (mockNutritionData.fat / dailyValues.fat) * 100,
      fiber: (mockNutritionData.fiber / dailyValues.fiber) * 100,
      sugar: (mockNutritionData.sugar / dailyValues.sugar) * 100,
      vitamins: {
        a: (mockNutritionData.vitamins.a / dailyValues.vitamins.a) * 100,
        c: (mockNutritionData.vitamins.c / dailyValues.vitamins.c) * 100,
        d: (mockNutritionData.vitamins.d / dailyValues.vitamins.d) * 100,
        calcium: (mockNutritionData.vitamins.calcium / dailyValues.vitamins.calcium) * 100,
        iron: (mockNutritionData.vitamins.iron / dailyValues.vitamins.iron) * 100
      }
    };
    
    setCartNutrition({
      ...mockNutritionData,
      percentages
    });
    
    // Create diet analysis & recommendations based on the cart items
    generateAiRecommendations(mockNutritionData);
    
  }, [cartItems, nutritionGoals]);

  // Simulate AI analysis and recommendations
  const generateAiRecommendations = useCallback((nutritionData) => {
    setAiLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      // Get user's dietary preferences and goals
      const userDiet = userDietaryPreferences?.primaryDiet || 'balanced';
      const userGoal = fitnessProfile?.primaryGoal || 'weight_management';
      
      // Generate diet-type specific recommendations
      let recommendations = {
        score: Math.floor(Math.random() * 30) + 70, // 70-100 score
        analysis: "Based on your current cart items:",
        strengths: [],
        weaknesses: [],
        suggestions: [],
        missingNutrients: [],
        balanceData: {}
      };
      
      // Analyze cart composition
      const totalItems = Object.values(nutritionData.categories).reduce((sum, val) => sum + val, 0);
      const producePercentage = (nutritionData.categories.produce / totalItems) * 100 || 0;
      const proteinPercentage = (nutritionData.categories.protein / totalItems) * 100 || 0;
      const grainsPercentage = (nutritionData.categories.grains / totalItems) * 100 || 0;
      const dairyPercentage = (nutritionData.categories.dairy / totalItems) * 100 || 0;
      
      // Balance data for visualization
      recommendations.balanceData = {
        produce: producePercentage,
        protein: proteinPercentage,
        grains: grainsPercentage,
        dairy: dairyPercentage,
        other: 100 - (producePercentage + proteinPercentage + grainsPercentage + dairyPercentage)
      };
      
      // Identify strengths
      if (producePercentage >= 30) {
        recommendations.strengths.push("Good proportion of fruits and vegetables");
      }
      
      if (proteinPercentage >= 20) {
        recommendations.strengths.push("Adequate protein sources");
      }
      
      if (nutritionData.fiber >= 20) {
        recommendations.strengths.push("Good amount of dietary fiber");
      }
      
      // Identify weaknesses
      if (producePercentage < 30) {
        recommendations.weaknesses.push("Low proportion of fruits and vegetables");
      }
      
      if (proteinPercentage < 15) {
        recommendations.weaknesses.push("Could add more protein sources");
      }
      
      if (nutritionData.fiber < 15) {
        recommendations.weaknesses.push("Low in dietary fiber");
      }
      
      // Generate diet-specific recommendations
      switch(userDiet) {
        case 'mediterranean':
          if (grainsPercentage < 20) {
            recommendations.suggestions.push("Add more whole grains like quinoa or bulgur");
          }
          if (proteinPercentage < 15) {
            recommendations.suggestions.push("Consider adding healthy proteins like fish or legumes");
          }
          break;
        case 'keto':
          if (nutritionData.carbs > 50) {
            recommendations.suggestions.push("Your cart contains high-carb items. Consider lower-carb alternatives");
          }
          break;
        case 'vegan':
          if (proteinPercentage < 20) {
            recommendations.suggestions.push("Add more plant-based proteins like tofu, tempeh, or legumes");
          }
          recommendations.suggestions.push("Ensure you're getting vitamin B12 from fortified foods");
          break;
        case 'paleo':
          if (grainsPercentage > 5) {
            recommendations.suggestions.push("Your cart contains grain products that aren't typically part of a paleo diet");
          }
          break;
        case 'weight_loss':
          if (nutritionData.calories > 1800) {
            recommendations.suggestions.push("Consider lower-calorie alternatives to some items");
          }
          break;
        default: // balanced
          if (producePercentage < 30) {
            recommendations.suggestions.push("Add more fruits and vegetables for a balanced diet");
          }
      }
      
      // Generate general suggestions based on missing nutrients
      if (nutritionData.vitamins.c < 45) {
        recommendations.missingNutrients.push("Vitamin C");
        recommendations.suggestions.push("Add citrus fruits or bell peppers for vitamin C");
      }
      
      if (nutritionData.vitamins.calcium < 500) {
        recommendations.missingNutrients.push("Calcium");
        if (userDiet === 'vegan') {
          recommendations.suggestions.push("Add calcium-fortified plant milks or leafy greens");
        } else {
          recommendations.suggestions.push("Add dairy products or calcium-rich foods");
        }
      }
      
      if (nutritionData.fiber < 15) {
        recommendations.suggestions.push("Add more high-fiber foods like beans, lentils, or whole grains");
      }
      
      // Generate smart recipe suggestions based on cart contents
      const suggestionTypes = [
        "Recipes using your cart items",
        "Complementary items for your cart",
        "Nutrition-boosting additions"
      ];
      
      const suggestionType = suggestionTypes[Math.floor(Math.random() * suggestionTypes.length)];
      
      // Create 2-3 AI-powered recipe or product suggestions
      const numSuggestions = Math.floor(Math.random() * 2) + 2; // 2-3 suggestions
      const suggestions = [];
      
      for (let i = 0; i < numSuggestions; i++) {
        suggestions.push({
          id: `sugg-${i}`,
          type: suggestionType,
          title: getRandomRecipeTitle(),
          ingredients: getRandomIngredients(3),
          confidence: Math.floor(Math.random() * 15) + 85, // 85-100% confidence
          alreadyInCart: Math.random() > 0.7, // 30% chance item is already in cart
          missingIngredients: getRandomIngredients(2)
        });
      }
      
      setAiSuggestions(suggestions);
      setAiRecommendations(recommendations);
      setAiLoading(false);
    }, 1500); // Simulated delay
  }, [fitnessProfile, userDietaryPreferences]);
  
  // Helper function for AI suggestion recipe titles
  const getRandomRecipeTitle = () => {
    const recipes = [
      "Mediterranean Veggie Bowl",
      "High-Protein Chicken Stir Fry",
      "Omega-3 Rich Salmon Salad",
      "Hearty Vegetable Soup",
      "Quinoa Power Bowl",
      "Antioxidant Berry Smoothie",
      "Low-Carb Cauliflower Rice",
      "Plant-Based Lentil Curry",
      "Whole Grain Pasta Primavera",
      "Vitamin-Packed Green Smoothie"
    ];
    
    return recipes[Math.floor(Math.random() * recipes.length)];
  };
  
  // Helper function for random ingredient lists
  const getRandomIngredients = (count) => {
    const allIngredients = [
      "spinach", "kale", "bell peppers", "quinoa", "sweet potatoes",
      "chickpeas", "lentils", "brown rice", "salmon", "chicken breast",
      "tofu", "tempeh", "chia seeds", "flax seeds", "almonds", "walnuts",
      "olive oil", "avocado", "berries", "bananas", "garlic", "onion",
      "turmeric", "ginger", "cinnamon", "greek yogurt", "almond milk"
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * allIngredients.length);
      result.push(allIngredients[randomIndex]);
    }
    
    return result;
  };
  
  // Fetch smart recipe suggestions
  const fetchSmartRecipes = useCallback(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate nutritional trend data
      const trendData = [
        { name: 'Mon', calories: 1950, protein: 95, carbs: 210, fat: 60 },
        { name: 'Tue', calories: 2100, protein: 110, carbs: 225, fat: 65 },
        { name: 'Wed', calories: 1850, protein: 100, carbs: 190, fat: 58 },
        { name: 'Thu', calories: 2050, protein: 115, carbs: 215, fat: 62 },
        { name: 'Fri', calories: 2200, protein: 120, carbs: 235, fat: 68 },
        { name: 'Sat', calories: 1900, protein: 90, carbs: 200, fat: 65 },
        { name: 'Sun', calories: 1800, protein: 85, carbs: 185, fat: 60 }
      ];
      
      setTrendsData(trendData);
      
      // Mock smart recipes based on user profile
      const mockSmartRecipes = [
        {
          id: 101,
          title: "One-Pot Mediterranean Quinoa",
          dietMatch: 96, // percentage match to user's dietary preferences
          nutritionMatch: 92, // percentage match to nutritional needs
          ingredients: ["Quinoa", "Cherry Tomatoes", "Cucumber", "Red Onion", "Feta Cheese", "Kalamata Olives", "Fresh Herbs", "Lemon Juice", "Olive Oil"],
          nutrients: { calories: 320, protein: 12, carbs: 45, fat: 14, fiber: 8 },
          prepTime: 15,
          cookTime: 20,
          aiRecommendedReason: "Aligned with Mediterranean diet preferences, high in fiber and plant proteins",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
          id: 102,
          title: "High-Protein Green Smoothie Bowl",
          dietMatch: 94,
          nutritionMatch: 90,
          ingredients: ["Spinach", "Banana", "Greek Yogurt", "Almond Milk", "Protein Powder", "Chia Seeds", "Blueberries", "Granola"],
          nutrients: { calories: 380, protein: 28, carbs: 50, fat: 8, fiber: 10 },
          prepTime: 10,
          cookTime: 0,
          aiRecommendedReason: "Nutrient-dense breakfast option with an excellent protein profile for muscle recovery",
          image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
          id: 103,
          title: "Herb-Roasted Salmon with Vegetables",
          dietMatch: 92,
          nutritionMatch: 95,
          ingredients: ["Salmon Fillet", "Asparagus", "Cherry Tomatoes", "Garlic", "Lemon", "Fresh Herbs", "Olive Oil", "Black Pepper"],
          nutrients: { calories: 420, protein: 38, carbs: 12, fat: 24, fiber: 4 },
          prepTime: 15,
          cookTime: 25,
          aiRecommendedReason: "Rich in omega-3 fatty acids and lean protein, aligned with your protein needs",
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
          id: 104,
          title: "Energy-Boosting Oatmeal Bowl",
          dietMatch: 90,
          nutritionMatch: 88,
          ingredients: ["Rolled Oats", "Banana", "Almond Butter", "Honey", "Berries", "Cinnamon", "Flaxseed", "Almond Milk"],
          nutrients: { calories: 390, protein: 14, carbs: 62, fat: 12, fiber: 12 },
          prepTime: 5,
          cookTime: 10,
          aiRecommendedReason: "Perfect pre-workout meal with sustained energy release from complex carbs",
          image: "https://images.unsplash.com/photo-1517093702855-01ce066c9a14?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        },
        {
          id: 105,
          title: "Lentil & Vegetable Soup",
          dietMatch: 88,
          nutritionMatch: 91,
          ingredients: ["Red Lentils", "Carrots", "Celery", "Onion", "Garlic", "Vegetable Broth", "Spinach", "Tomatoes", "Cumin", "Paprika"],
          nutrients: { calories: 310, protein: 18, carbs: 52, fat: 4, fiber: 16 },
          prepTime: 15,
          cookTime: 30,
          aiRecommendedReason: "Fiber-rich plant-based protein source, excellent for gut health",
          image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        }
      ];
      
      setSmartRecipes(mockSmartRecipes);
      setLoading(false);
    }, 1200);
  }, []);
  
  // Create advanced meal plan
  const generateMealPlan = () => {
    setAiLoading(true);
    
    // Simulate API call to generate meal plan
    setTimeout(() => {
      // Structure based on meal plan profile
      const mealPlanData = {
        id: Date.now(),
        name: `Custom ${dietTypes[mealPlanProfile.dietType]?.name || 'Balanced'} Plan`,
        dietType: mealPlanProfile.dietType,
        goal: mealPlanProfile.goal,
        days: 7,
        mealsPerDay: mealPlanProfile.mealsPerDay,
        totalCalories: mealPlanProfile.calories * 7,
        avgCaloriesPerDay: mealPlanProfile.calories,
        preferences: mealPlanProfile.preferences,
        restrictions: mealPlanProfile.restrictions,
        days: [
          {
            day: "Monday",
            meals: []
          },
          {
            day: "Tuesday",
            meals: []
          },
          {
            day: "Wednesday",
            meals: []
          },
          {
            day: "Thursday",
            meals: []
          },
          {
            day: "Friday",
            meals: []
          },
          {
            day: "Saturday",
            meals: []
          },
          {
            day: "Sunday",
            meals: []
          }
        ]
      };
      
      // Generate meals for each day based on meals per day
      const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Pre-workout", "Post-workout"];
      
      for (let i = 0; i < mealPlanData.days.length; i++) {
        const dayMeals = [];
        
        for (let j = 0; j < mealPlanProfile.mealsPerDay; j++) {
          const mealType = j < 3 ? mealTypes[j] : mealTypes[3 + (j-3) % 3];
          
          dayMeals.push({
            id: `meal-${i}-${j}`,
            type: mealType,
            title: getRandomRecipeTitle(),
            calories: Math.floor(mealPlanProfile.calories / mealPlanProfile.mealsPerDay),
            prepTime: Math.floor(Math.random() * 15) + 10,
            ingredients: getRandomIngredients(Math.floor(Math.random() * 4) + 5),
            macros: {
              protein: Math.floor(Math.random() * 10) + 15,
              carbs: Math.floor(Math.random() * 20) + 30,
              fat: Math.floor(Math.random() * 10) + 10,
              fiber: Math.floor(Math.random() * 5) + 3
            },
            inCart: false
          });
        }
        
        mealPlanData.days[i].meals = dayMeals;
      }
      
      setGeneratedMealPlan(mealPlanData);
      setAiLoading(false);
      setMealPlanWizardStep(5); // Move to review step
      
      showAlert("Meal plan generated successfully!", "success");
    }, 2500);
  };
  
  // Add all ingredients from meal plan to cart
  const addMealPlanToCart = (mealPlan) => {
    // Extract all ingredients from the meal plan
    const allIngredients = [];
    
    mealPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ingredient => {
          allIngredients.push({
            id: `mp-${Math.random().toString(36).substring(2, 10)}`,
            name: ingredient,
            price: parseFloat((Math.random() * 5 + 1).toFixed(2)),
            category: determineCategory(ingredient),
            quantity: 1,
            image: `https://source.unsplash.com/100x100/?${encodeURIComponent(ingredient)}`,
            fromMealPlan: mealPlan.name
          });
        });
      });
    });
    
    // Add all ingredients to cart
    setCartItems(prev => [...prev, ...allIngredients]);
    setMealPlannerOpen(false);
    showAlert(`Added all ingredients from ${mealPlan.name} to your cart!`, "success");
  };

  // Custom styled components
  const ProductCard = styled(Card)(({ theme, featured }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
    ...(featured && {
      boxShadow: `0 8px 24px rgba(0, 0, 0, 0.12)`,
      border: `1px solid ${theme.palette.primary.light}`,
    }),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 28px rgba(0, 0, 0, 0.15)'
    }
  }));

  const CategoryChip = styled(Chip)(({ theme, selected }) => ({
    margin: theme.spacing(0.5),
    fontWeight: 600,
    ...(selected && {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    })
  }));
  
  const VirtualizedItemRenderer = ({ index, style }) => {
    const product = filteredProducts[index];
    
    return (
      <Box style={style} sx={{ px: 1 }}>
        <ProductCard featured={product.featured} sx={{ mb: 2 }}>
          {product.organic && (
            <Chip 
              label="Organic" 
              size="small" 
              color="success" 
              sx={{ 
                position: 'absolute', 
                top: 10, 
                left: 10, 
                zIndex: 1,
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }} 
            />
          )}
          <Box 
            component="img" 
            src={product.image} 
            alt={product.name}
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=200&background=random`; }}
            sx={{ 
              width: '100%', 
              height: 150, 
              objectFit: 'cover',
              objectPosition: 'center' 
            }}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 1, fontSize: '1rem' }}>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                ${product.price.toFixed(2)}
              </Typography>
              <Rating value={product.rating} precision={0.5} size="small" readOnly />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <HealthAndSafetyIcon sx={{ color: 'success.main', fontSize: '0.9rem', mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Nutrition Score: {product.nutritionScore}/100
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {product.description}
            </Typography>
          </CardContent>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              startIcon={<ShoppingCartIcon />} 
              variant="contained" 
              color="primary"
              size="small"
              onClick={() => handleAddToCart(product)}
              disabled={!product.inStock}
              sx={{ flexGrow: 1, mr: 1 }}
            >
              Add to Cart
            </Button>
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleSaveForLater(product.id)}
              sx={{ border: '1px solid', borderColor: 'primary.light' }}
            >
              <BookmarkIcon fontSize="small" />
            </IconButton>
          </Box>
        </ProductCard>
      </Box>
    );
  };

  // Render the UI
  return (
    <Box sx={{ p: 2 }}>
      {/* Main card */}
      <Card sx={{ 
        borderRadius: 4, 
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)', 
        overflow: 'hidden', 
        mb: 3,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #43a047, #1b5e20)', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalGroceryStoreIcon sx={{ fontSize: 36, mr: 2 }} />
            <Box>
              <Typography variant="h5" component="h2">Smart Grocery Shop</Typography>
              <Typography variant="body2">Find groceries, recipes and delivery options</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge 
              badgeContent={cartItems.length} 
              color="error" 
              sx={{ mr: 2 }}
              overlap="circular"
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <IconButton 
                color="inherit" 
                onClick={() => setActiveTab(1)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                }}
              >
                <ShoppingCartIcon fontSize="large" />
              </IconButton>
            </Badge>
            {cartItems.length > 0 && (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                ${cartTotals.subtotal.toFixed(2)}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Navigation Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2
            }
          }}
        >
          <Tab icon={<LocationOnIcon />} label="Find Stores" iconPosition="start" />
          <Tab icon={<ShoppingCartIcon />} label="Shop & Cart" iconPosition="start" />
          <Tab icon={<RestaurantIcon />} label="Recipes" iconPosition="start" />
          <Tab icon={<SmartToyIcon />} label="Smart Analysis" iconPosition="start" />
          <Tab icon={<MenuBookIcon />} label="Meal Planner" iconPosition="start" />
        </Tabs>
        
        {/* Alert for notifications */}
        {alertInfo.open && (
          <Alert 
            severity={alertInfo.severity} 
            sx={{ 
              mx: 2, 
              mt: 2, 
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              borderRadius: 2
            }}
            onClose={() => setAlertInfo(prev => ({ ...prev, open: false }))}
          >
            {alertInfo.message}
          </Alert>
        )}
        
        {/* Tab Content */}
        <CardContent>
          {/* Store Finder Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Find Grocery Stores Near You</Typography>
              
              {/* Location selector */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {location ? `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Location not set"}
                  </Typography>
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGetLocation} 
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LocationOnIcon />}
                  sx={{ 
                    borderRadius: 8,
                    px: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  {location ? "Update Location" : "Get My Location"}
                </Button>
              </Paper>
              
              {/* Store filters */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Available Stores</Typography>
                <Box>
                  <Chip 
                    icon={<FilterListIcon />} 
                    label="Filter" 
                    onClick={handleFilterClick}
                    sx={{ mr: 1, fontWeight: 'bold' }}
                  />
                  <Menu
                    anchorEl={filterMenuAnchor}
                    open={Boolean(filterMenuAnchor)}
                    onClose={handleFilterClose}
                  >
                    <MenuItem onClick={() => handleSortChange('distance')} selected={sortOrder === 'distance'}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      Nearest First
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange('rating')} selected={sortOrder === 'rating'}>
                      <FavoriteIcon fontSize="small" sx={{ mr: 1 }} />
                      Highest Rated
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={dietaryPreferences.organic}
                            onChange={() => handleDietaryToggle('organic')}
                            size="small"
                          />
                        }
                        label="Instacart Available"
                      />
                    </MenuItem>
                    <MenuItem>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={dietaryPreferences.deliveryOnly}
                            onChange={() => handleDietaryToggle('deliveryOnly')}
                            size="small"
                          />
                        }
                        label="Delivery Available"
                      />
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
              
              {/* Store list */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, flexDirection: 'column', alignItems: 'center' }}>
                  <CircularProgress size={60} thickness={4} />
                  <Typography sx={{ mt: 2 }}>Finding stores near you...</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {stores.map((store) => (
                    <Grid item xs={12} sm={6} md={4} key={store.id}>
                      <Card sx={{ 
                        height: '100%', 
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                        },
                        position: 'relative',
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        {/* Store logo/image */}
                        <Box sx={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                          <Box
                            component="img"
                            src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&size=200&background=random`}
                            alt={store.name}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&size=200&background=random`; }}
                            sx={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          {store.openNow && (
                            <Chip 
                              label="Open Now" 
                              size="small" 
                              color="success"
                              sx={{ 
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                fontWeight: 'bold'
                              }}
                            />
                          )}
                        </Box>
                        
                        <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>{store.name}</Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
                              {store.distance} miles 
                            </Typography>
                            <Rating value={store.rating} precision={0.5} size="small" readOnly />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {store.address}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {store.instacartAvailable && (
                              <Chip 
                                label="Instacart" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                icon={<LocalShippingIcon fontSize="small" />}
                              />
                            )}
                            {store.deliveryAvailable && (
                              <Chip 
                                label="Delivery" 
                                size="small" 
                                color="info" 
                                variant="outlined"
                                icon={<LocalShippingIcon fontSize="small" />}
                              />
                            )}
                            {Array(store.priceLevel).fill().map((_, i) => '$').join('')}
                          </Box>
                          
                          <Button 
                            variant="contained" 
                            color="primary"
                            fullWidth
                            size="large"
                            onClick={() => handleSelectStore(store)}
                            startIcon={<ShoppingCartIcon />}
                            sx={{ 
                              borderRadius: 2,
                              py: 1,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          >
                            Shop Here
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
          
          {/* Shop & Cart Tab */}
          {activeTab === 1 && (
            <Box>
              {!selectedStore ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <LocalGroceryStoreIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.6 }} />
                  <Typography variant="h6" gutterBottom>Please Select a Store First</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                    Start by selecting a grocery store from the "Find Stores" tab to browse products and add items to your cart.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setActiveTab(0)}
                    startIcon={<LocationOnIcon />}
                  >
                    Find Stores
                  </Button>
                </Box>
              ) : (
                <Box>
                  {/* Store header info */}
                  <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={selectedStore.logo}
                        alt={selectedStore.name}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">{selectedStore.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedStore.distance} miles • {selectedStore.address}
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small" 
                      onClick={() => setActiveTab(0)}
                      startIcon={<LocalGroceryStoreIcon />}
                    >
                      Change Store
                    </Button>
                  </Paper>
                  
                  {/* Cart and products view */}
                  <Grid container spacing={3}>
                    {/* Products/search panel */}
                    <Grid item xs={12} md={8}>
                      {/* Search bar */}
                      <Paper sx={{ p: 2, mb: 3 }}>
                        <TextField
                          fullWidth
                          placeholder="Search for groceries, ingredients..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          inputRef={searchInputRef}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={handleClearSearch}>
                                  <RemoveIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                          }}
                          variant="outlined"
                        />
                        
                        {/* Filter chips */}
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap' }}>
                          <CategoryChip 
                            label="All Products" 
                            onClick={() => handleCategoryChange('all')}
                            selected={selectedCategory === 'all'}
                          />
                          {productCategories.map(category => (
                            <CategoryChip
                              key={category.id}
                              label={`${category.icon} ${category.name}`}
                              onClick={() => handleCategoryChange(category.id)}
                              selected={selectedCategory === category.id}
                            />
                          ))}
                        </Box>
                      </Paper>
                      
                      {/* Sort and filter header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1">
                          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} {
                            selectedCategory !== 'all' ? `in ${productCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}` : ''
                          } {searchQuery ? `matching "${searchQuery}"` : ''}
                        </Typography>
                        <Box>
                          <Button
                            size="small"
                            startIcon={<FilterListIcon />}
                            onClick={handleFilterClick}
                          >
                            Sort & Filter
                          </Button>
                          <Menu
                            anchorEl={filterMenuAnchor}
                            open={Boolean(filterMenuAnchor)}
                            onClose={handleFilterClose}
                          >
                            <MenuItem onClick={() => handleSortChange('relevance')} selected={sortOrder === 'relevance'}>
                              Relevance
                            </MenuItem>
                            <MenuItem onClick={() => handleSortChange('price-asc')} selected={sortOrder === 'price-asc'}>
                              Price: Low to High
                            </MenuItem>
                            <MenuItem onClick={() => handleSortChange('price-desc')} selected={sortOrder === 'price-desc'}>
                              Price: High to Low
                            </MenuItem>
                            <MenuItem onClick={() => handleSortChange('rating')} selected={sortOrder === 'rating'}>
                              Highest Rated
                            </MenuItem>
                            <MenuItem onClick={() => handleSortChange('nutrition')} selected={sortOrder === 'nutrition'}>
                              Nutrition Score
                            </MenuItem>
                            <Divider />
                            <MenuItem>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={dietaryPreferences.organic} 
                                    onChange={() => handleDietaryToggle('organic')}
                                  />
                                }
                                label="Organic Only"
                              />
                            </MenuItem>
                            <MenuItem>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={dietaryPreferences.glutenFree} 
                                    onChange={() => handleDietaryToggle('glutenFree')}
                                  />
                                }
                                label="Gluten Free"
                              />
                            </MenuItem>
                            <MenuItem>
                              <FormControlLabel
                                control={
                                  <Checkbox 
                                    checked={dietaryPreferences.vegan} 
                                    onChange={() => handleDietaryToggle('vegan')}
                                  />
                                }
                                label="Vegan"
                              />
                            </MenuItem>
                          </Menu>
                        </Box>
                      </Box>
                      
                      {/* Featured products */}
                      {selectedCategory === 'all' && searchQuery === '' && (
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>Featured Products</Typography>
                          <Grid container spacing={2}>
                            {featuredProducts.map(product => (
                              <Grid item xs={12} sm={6} md={4} key={product.id}>
                                <ProductCard featured={true}>
                                  {product.organic && (
                                    <Chip 
                                      label="Organic" 
                                      size="small" 
                                      color="success" 
                                      sx={{ 
                                        position: 'absolute', 
                                        top: 10, 
                                        left: 10, 
                                        zIndex: 1,
                                        fontWeight: 'bold'
                                      }} 
                                    />
                                  )}
                                  <Box 
                                    component="img" 
                                    src={product.image} 
                                    alt={product.name}
                                    sx={{ 
                                      width: '100%', 
                                      height: 140, 
                                      objectFit: 'cover' 
                                    }}
                                  />
                                  <CardContent>
                                    <Typography variant="h6" component="h3" sx={{ mb: 0.5 }}>
                                      {product.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                        ${product.price.toFixed(2)}
                                      </Typography>
                                      <Rating value={product.rating} precision={0.5} size="small" readOnly />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                      <HealthAndSafetyIcon color="success" sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                                      <Typography variant="body2" color="text.secondary">
                                        Nutrition Score: {product.nutritionScore}/100
                                      </Typography>
                                    </Box>
                                  </CardContent>
                                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                                    <Button 
                                      startIcon={<ShoppingCartIcon />} 
                                      variant="contained" 
                                      color="primary"
                                      size="small"
                                      onClick={() => handleAddToCart(product)}
                                      sx={{ flexGrow: 1, mr: 1 }}
                                    >
                                      Add to Cart
                                    </Button>
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleSaveForLater(product.id)}
                                      sx={{ border: '1px solid', borderColor: 'primary.light' }}
                                    >
                                      <InfoIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </ProductCard>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                      
                      {/* Virtualized product list */}
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {searchQuery ? 'Search Results' : (
                          selectedCategory === 'all' ? 'All Products' : 
                            `${productCategories.find(c => c.id === selectedCategory)?.name || 'Products'}`
                        )}
                      </Typography>
                      
                      {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : filteredProducts.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="h6" color="text.secondary">No products found</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Try adjusting your search or filters
                          </Typography>
                        </Paper>
                      ) : (
                        <Box sx={{ height: 600, width: '100%' }}>
                          <AutoSizer>
                            {({ height, width }) => (
                              <VirtualizedList
                                height={height}
                                width={width}
                                itemCount={filteredProducts.length}
                                itemSize={350} // Adjust based on your card height
                                overscanCount={5}
                              >
                                {VirtualizedItemRenderer}
                              </VirtualizedList>
                            )}
                          </AutoSizer>
                        </Box>
                      )}
                      
                      {/* Recently viewed */}
                      {recentlyViewed.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>Recently Viewed</Typography>
                          <Grid container spacing={2}>
                            {recentlyViewed.slice(0, 3).map(product => (
                              <Grid item xs={12} sm={4} key={`recent-${product.id}`}>
                                <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                  <Box 
                                    component="img" 
                                    src={product.image} 
                                    alt={product.name}
                                    sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover', mr: 2 }}
                                  />
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                      {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="primary.main">
                                      ${product.price.toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleAddToCart(product)}
                                  >
                                    <ShoppingCartIcon fontSize="small" />
                                  </IconButton>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Grid>
                    
                    {/* Cart panel */}
                    <Grid item xs={12} md={4}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          position: 'sticky', 
                          top: 24, 
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <ShoppingCartIcon sx={{ mr: 1 }} /> 
                          Your Cart {cartItems.length > 0 && `(${cartItems.length})`}
                        </Typography>
                        
                        {cartItems.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="body1" sx={{ mb: 1 }}>Your cart is empty</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              Add items from the store to get started
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                              {cartItems.map((item) => (
                                <Box key={item.id} sx={{ mb: 2 }}>
                                  <Paper sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.02)' }}>
                                    <Box sx={{ display: 'flex' }}>
                                      {item.image && (
                                        <Box 
                                          component="img" 
                                          src={item.image} 
                                          alt={item.name}
                                          sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover', mr: 2 }}
                                        />
                                      )}
                                      <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle2">
                                          {item.name}
                                          {item.fromRecipe && (
                                            <Chip 
                                              label={item.fromRecipe} 
                                              size="small" 
                                              color="primary"
                                              variant="outlined"
                                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                            />
                                          )}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          ${(item.price || 4.99).toFixed(2)} each
                                        </Typography>
                                      </Box>
                                      <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                        ${((item.price || 4.99) * item.quantity).toFixed(2)}
                                      </Typography>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                      <Button 
                                        size="small" 
                                        color="primary" 
                                        variant="text"
                                        onClick={() => handleSaveForLater(item.id)}
                                        sx={{ fontSize: '0.75rem' }}
                                      >
                                        Save for later
                                      </Button>
                                      
                                      <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                        >
                                          <RemoveIcon fontSize="small" />
                                        </IconButton>
                                        
                                        <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
                                          {item.quantity}
                                        </Typography>
                                        
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                        >
                                          <AddIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Paper>
                                </Box>
                              ))}
                            </List>
                            
                            {/* Saved for later items */}
                            {savedForLater.length > 0 && (
                              <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Saved for Later ({savedForLater.length})
                                </Typography>
                                <List sx={{ maxHeight: 150, overflow: 'auto' }}>
                                  {savedForLater.map(item => (
                                    <ListItem 
                                      key={`saved-${item.id}`}
                                      secondaryAction={
                                        <Button 
                                          size="small" 
                                          onClick={() => handleMoveToCart(item.id)}
                                        >
                                          Add
                                        </Button>
                                      }
                                    >
                                      <ListItemText
                                        primary={item.name}
                                        secondary={`$${(item.price || 4.99).toFixed(2)}`}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'body2' }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {/* Order summary */}
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography>Subtotal:</Typography>
                                <Typography>${cartTotals.subtotal.toFixed(2)}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography>Estimated Tax:</Typography>
                                <Typography>${cartTotals.tax.toFixed(2)}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography>Delivery Fee:</Typography>
                                <Typography>${cartTotals.deliveryFee.toFixed(2)}</Typography>
                              </Box>
                              <Divider sx={{ my: 2 }} />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6" color="primary.main">
                                  ${cartTotals.total.toFixed(2)}
                                </Typography>
                              </Box>
                              
                              <Button 
                                variant="contained" 
                                color="primary"
                                fullWidth
                                size="large"
                                sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                                onClick={handleCheckout}
                                disabled={loading || cartItems.length === 0}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LocalShippingIcon />}
                              >
                                {loading ? 'Processing...' : (
                                  selectedStore?.instacartAvailable ? 'Checkout with Instacart' : 'Checkout with DoorDash'
                                )}
                              </Button>
                            </Box>
                          </>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
          
          {/* Recipes & Meal Plans Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 2
              }}>
                <RestaurantIcon sx={{ mr: 1 }} />
                Recipes Browser
              </Typography>
              
              <Typography variant="body1" paragraph>
                Browse recipes and instantly add ingredients to your cart.
              </Typography>
              
              {/* Search recipes */}
              <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Find Recipes</Typography>
                <TextField
                  fullWidth
                  placeholder="Search recipes by name or ingredients..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 8 }
                  }}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="All Recipes" color="primary" onClick={() => {}} />
                  <Chip label="Vegetarian" variant="outlined" onClick={() => {}} />
                  <Chip label="Vegan" variant="outlined" onClick={() => {}} />
                  <Chip label="Gluten Free" variant="outlined" onClick={() => {}} />
                  <Chip label="High Protein" variant="outlined" onClick={() => {}} />
                  <Chip label="Quick Meals" variant="outlined" onClick={() => {}} />
                </Box>
              </Paper>
              
              {/* Recipe grid */}
              <Typography variant="h6" sx={{ mb: 2 }}>Popular Recipes</Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {recipes.map(recipe => (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                      <Card sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                        },
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}>
                        <Box 
                          component="img" 
                          src={recipe.image} 
                          alt={recipe.title}
                          sx={{ 
                            width: '100%', 
                            height: 180, 
                            objectFit: 'cover' 
                          }}
                        />
                        
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>{recipe.title}</Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TimerIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                              {recipe.readyInMinutes} min
                            </Typography>
                            <LocalDiningIcon color="action" fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {recipe.servings} servings
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                            {recipe.vegetarian && <Chip label="Vegetarian" size="small" color="success" variant="outlined" />}
                            {recipe.vegan && <Chip label="Vegan" size="small" color="success" variant="outlined" />}
                            {recipe.glutenFree && <Chip label="Gluten Free" size="small" color="primary" variant="outlined" />}
                            {recipe.dairyFree && <Chip label="Dairy Free" size="small" color="primary" variant="outlined" />}
                            {recipe.healthScore >= 90 && <Chip label="Very Healthy" size="small" color="success" />}
                          </Box>
                        </CardContent>
                        
                        <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            onClick={() => handleViewRecipe(recipe)}
                            sx={{ flexGrow: 1, mr: 1 }}
                          >
                            View Recipe
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<ShoppingCartIcon />}
                            onClick={() => handleAddRecipeToCart(recipe)}
                          >
                            Add to Cart
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {/* Meal plans section */}
              <Typography variant="h6" sx={{ mt: 6, mb: 2 }}>Meal Plans</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Mediterranean Diet</Typography>
                      <Typography variant="body2" paragraph>
                        Rich in healthy fats, whole grains, and vegetables. Scientifically proven to support heart health.
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HealthAndSafetyIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">Health Score: 95/100</Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ mt: 2 }}
                      >
                        View Plan
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>High Protein Plan</Typography>
                      <Typography variant="body2" paragraph>
                        Focuses on lean proteins for muscle building and recovery. Perfect for active individuals.
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HealthAndSafetyIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">Health Score: 88/100</Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ mt: 2 }}
                      >
                        View Plan
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Plant-Based Diet</Typography>
                      <Typography variant="body2" paragraph>
                        Whole foods from plant sources. Environmentally sustainable and rich in nutrients.
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HealthAndSafetyIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">Health Score: 92/100</Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ mt: 2 }}
                      >
                        View Plan
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Smart Analysis Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 2
              }}>
                <SmartToyIcon sx={{ mr: 1 }} />
                AI Nutrition Analysis & Recommendations
              </Typography>
              
              <Grid container spacing={3}>
                {/* Left column - Nutrition Dashboard */}
                <Grid item xs={12} md={7}>
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalculateIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Nutrition Calculator</Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        color="secondary"
                        startIcon={<PieChartIcon />}
                        onClick={() => setNutritionDialogOpen(true)}
                        size="small"
                      >
                        Set Goals
                      </Button>
                    </Box>
                    
                    <CardContent>
                      {cartItems.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            Add items to your cart to see nutrition analysis
                          </Typography>
                          <Button 
                            variant="outlined" 
                            onClick={() => setActiveTab(1)}
                            startIcon={<ShoppingCartIcon />}
                          >
                            Go to Shop & Cart
                          </Button>
                        </Box>
                      ) : cartNutrition ? (
                        <Box>
                          {/* Macronutrient distribution */}
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Macronutrient Distribution
                          </Typography>
                          <Box sx={{ height: 250, mb: 3 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Protein', value: cartNutrition.protein * 4 },
                                    { name: 'Carbs', value: cartNutrition.carbs * 4 },
                                    { name: 'Fat', value: cartNutrition.fat * 9 }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  <Cell fill="#4caf50" />
                                  <Cell fill="#2196f3" />
                                  <Cell fill="#ff9800" />
                                </Pie>
                                <Legend />
                                <RechartsTooltip formatter={(value) => (`${value} calories`)} />
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>
                          
                          {/* Nutrient percentages of daily values */}
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Percentage of Daily Targets
                          </Typography>
                          <Grid container spacing={1} sx={{ mb: 3 }}>
                            <Grid item xs={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">Calories</Typography>
                                  <Typography variant="body2">{cartNutrition.percentages.calories.toFixed(0)}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(cartNutrition.percentages.calories, 100)} 
                                  color={cartNutrition.percentages.calories > 110 ? "error" : "primary"}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">Protein</Typography>
                                  <Typography variant="body2">{cartNutrition.percentages.protein.toFixed(0)}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(cartNutrition.percentages.protein, 100)} 
                                  color="success"
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">Carbs</Typography>
                                  <Typography variant="body2">{cartNutrition.percentages.carbs.toFixed(0)}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(cartNutrition.percentages.carbs, 100)} 
                                  color="primary" 
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">Fat</Typography>
                                  <Typography variant="body2">{cartNutrition.percentages.fat.toFixed(0)}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(cartNutrition.percentages.fat, 100)} 
                                  color="warning"
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">Fiber</Typography>
                                  <Typography variant="body2">{cartNutrition.percentages.fiber.toFixed(0)}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(cartNutrition.percentages.fiber, 100)} 
                                  color="success"
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2">Sugar</Typography>
                                  <Typography variant="body2">{cartNutrition.percentages.sugar.toFixed(0)}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(cartNutrition.percentages.sugar, 100)} 
                                  color={cartNutrition.percentages.sugar > 100 ? "error" : "warning"}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            </Grid>
                          </Grid>
                          
                          {/* Micronutrients */}
                          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Micronutrients
                          </Typography>
                          <Box sx={{ height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart outerRadius={90} data={[
                                { 
                                  subject: 'Vit A', 
                                  A: cartNutrition.percentages.vitamins.a,
                                  fullMark: 100 
                                },
                                { 
                                  subject: 'Vit C', 
                                  A: cartNutrition.percentages.vitamins.c,
                                  fullMark: 100 
                                },
                                { 
                                  subject: 'Vit D', 
                                  A: cartNutrition.percentages.vitamins.d,
                                  fullMark: 100 
                                },
                                { 
                                  subject: 'Calcium', 
                                  A: cartNutrition.percentages.vitamins.calcium,
                                  fullMark: 100 
                                },
                                { 
                                  subject: 'Iron', 
                                  A: cartNutrition.percentages.vitamins.iron,
                                  fullMark: 100 
                                }
                              ]}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="% of Daily Value" dataKey="A" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} />
                                <Legend />
                              </RadarChart>
                            </ResponsiveContainer>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress />
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={analyzeNutrition}
                          startIcon={<BarChartIcon />}
                          disabled={cartItems.length === 0}
                        >
                          Analyze My Cart
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  {/* Nutrition trends */}
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ mr: 1 }} />
                        Weekly Nutrition Trends
                      </Typography>
                      
                      {trendsData ? (
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendsData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey="protein" fill="#4caf50" name="Protein (g)" />
                              <Bar dataKey="carbs" fill="#2196f3" name="Carbs (g)" />
                              <Bar dataKey="fat" fill="#ff9800" name="Fat (g)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Right column - AI Recommendations */}
                <Grid item xs={12} md={5}>
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'primary.dark', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <SmartToyIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">AI Nutrition Assistant</Typography>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {aiLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress sx={{ mb: 2 }} />
                            <Typography>AI is analyzing your cart...</Typography>
                          </Box>
                        </Box>
                      ) : !aiRecommendations ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, textAlign: 'center' }}>
                          <Box>
                            <SmartToyIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.7, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>AI Nutrition Analysis</Typography>
                            <Typography variant="body2" paragraph>
                              Add items to your cart and click "Analyze My Cart" to get AI-powered nutrition insights.
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* AI Score */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            mb: 3
                          }}>
                            <Box sx={{ 
                              position: 'relative', 
                              width: 120, 
                              height: 120,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <CircularProgress 
                                variant="determinate" 
                                value={100} 
                                size={120} 
                                thickness={4}
                                sx={{ color: 'grey.300', position: 'absolute' }}
                              />
                              <CircularProgress 
                                variant="determinate" 
                                value={aiRecommendations.score} 
                                size={120} 
                                thickness={4}
                                sx={{ 
                                  color: aiRecommendations.score >= 80 ? 'success.main' : 
                                    aiRecommendations.score >= 60 ? 'warning.main' : 'error.main',
                                  position: 'absolute'
                                }}
                              />
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary.main">
                                  {aiRecommendations.score}
                                </Typography>
                                <Typography variant="caption">Nutrition Score</Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          {/* Diet Balance */}
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Food Group Balance
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Box sx={{ mb: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Produce</Typography>
                                    <Typography variant="body2">{aiRecommendations.balanceData.produce.toFixed(0)}%</Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={aiRecommendations.balanceData.produce} 
                                    color="success"
                                    sx={{ height: 8, borderRadius: 4 }}
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ mb: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Protein</Typography>
                                    <Typography variant="body2">{aiRecommendations.balanceData.protein.toFixed(0)}%</Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={aiRecommendations.balanceData.protein} 
                                    color="primary"
                                    sx={{ height: 8, borderRadius: 4 }}
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ mb: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Grains</Typography>
                                    <Typography variant="body2">{aiRecommendations.balanceData.grains.toFixed(0)}%</Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={aiRecommendations.balanceData.grains} 
                                    color="warning"
                                    sx={{ height: 8, borderRadius: 4 }}
                                  />
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ mb: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Dairy</Typography>
                                    <Typography variant="body2">{aiRecommendations.balanceData.dairy.toFixed(0)}%</Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={aiRecommendations.balanceData.dairy}
                                    color="info" 
                                    sx={{ height: 8, borderRadius: 4 }}
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                          
                          {/* AI analysis */}
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            AI Analysis
                          </Typography>
                          
                          {aiRecommendations.strengths.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Strengths
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {aiRecommendations.strengths.map((strength, index) => (
                                  <Typography component="li" variant="body2" key={`strength-${index}`}>
                                    {strength}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {aiRecommendations.weaknesses.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Areas for Improvement
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {aiRecommendations.weaknesses.map((weakness, index) => (
                                  <Typography component="li" variant="body2" key={`weakness-${index}`}>
                                    {weakness}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {aiRecommendations.suggestions.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                <SmartToyIcon fontSize="small" sx={{ mr: 0.5 }} />
                                AI Recommendations
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {aiRecommendations.suggestions.map((suggestion, index) => (
                                  <Typography component="li" variant="body2" key={`suggestion-${index}`}>
                                    {suggestion}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {/* Missing Nutrients */}
                          {aiRecommendations.missingNutrients.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Missing Nutrients
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {aiRecommendations.missingNutrients.map((nutrient, index) => (
                                  <Chip 
                                    key={`nutrient-${index}`}
                                    label={nutrient} 
                                    color="primary" 
                                    variant="outlined"
                                    size="small"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {/* Smart Recipe Suggestions */}
                          {aiSuggestions.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Smart Suggestions
                              </Typography>
                              {aiSuggestions.map((suggestion, index) => (
                                <Card key={`ai-suggestion-${index}`} sx={{ mb: 1, bgcolor: 'primary.lighter' }}>
                                  <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                      <Box sx={{ 
                                        mr: 1, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                      }}>
                                        AI
                                      </Box>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                                        {suggestion.title}
                                      </Typography>
                                      <Chip 
                                        label={`${suggestion.confidence}%`} 
                                        size="small" 
                                        color="primary"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                      {suggestion.type}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.8rem', mb: 1 }}>
                                      Main ingredients: {suggestion.ingredients.join(', ')}
                                    </Typography>
                                    {suggestion.missingIngredients.length > 0 && (
                                      <Typography variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
                                        Missing from cart: {suggestion.missingIngredients.join(', ')}
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', pt: 2 }}>
                            <Button 
                              variant="contained"
                              color="primary"
                              onClick={() => setActiveTab(4)}
                              startIcon={<MenuBookIcon />}
                            >
                              Create Meal Plan
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Recommended Smart Recipes */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'success.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmojiEventsIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">AI-Recommended Recipes</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ 
                        bgcolor: 'rgba(255,255,255,0.3)', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1,
                        fontWeight: 'bold'
                      }}>
                        <FiberNewIcon sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'text-bottom' }} />
                        Smart Match Technology
                      </Typography>
                    </Box>
                    
                    <CardContent>
                      {smartRecipes.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <Grid container spacing={3}>
                          {smartRecipes.map(recipe => (
                            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                              <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-5px)',
                                  boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                                },
                                overflow: 'hidden'
                              }}>
                                <Box sx={{ position: 'relative' }}>
                                  <Box 
                                    component="img"
                                    src={recipe.image} 
                                    alt={recipe.title}
                                    sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                                  />
                                  <Box sx={{ 
                                    position: 'absolute', 
                                    top: 10, 
                                    right: 10, 
                                    display: 'flex', 
                                    gap: 0.5 
                                  }}>
                                    <Chip 
                                      label={`${recipe.dietMatch}% Match`} 
                                      size="small" 
                                      color="success"
                                      sx={{ 
                                        fontWeight: 'bold',
                                        bgcolor: 'rgba(76, 175, 80, 0.9)'
                                      }}
                                    />
                                  </Box>
                                </Box>
                                
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    {recipe.title}
                                  </Typography>
                                  
                                  <Box sx={{ display: 'flex', mb: 1, gap: 1 }}>
                                    <Chip 
                                      icon={<AccessTimeIcon fontSize="small" />} 
                                      label={`${recipe.prepTime + recipe.cookTime} min`} 
                                      size="small"
                                      variant="outlined"
                                    />
                                    <Chip 
                                      icon={<LocalDiningIcon fontSize="small" />} 
                                      label={`${recipe.nutrients.calories} cal`} 
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Box>
                                  
                                  <Typography variant="body2" sx={{ 
                                    mb: 2,
                                    flexGrow: 1,
                                    color: 'text.secondary',
                                    fontStyle: 'italic'
                                  }}>
                                    {recipe.aiRecommendedReason}
                                  </Typography>
                                  
                                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                                    Key Nutrients:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                    <Chip 
                                      label={`Protein: ${recipe.nutrients.protein}g`} 
                                      size="small" 
                                      color="primary"
                                      variant="outlined"
                                      sx={{ height: 24 }}
                                    />
                                    <Chip 
                                      label={`Carbs: ${recipe.nutrients.carbs}g`} 
                                      size="small" 
                                      color="secondary"
                                      variant="outlined"
                                      sx={{ height: 24 }}
                                    />
                                    <Chip 
                                      label={`Fiber: ${recipe.nutrients.fiber}g`} 
                                      size="small" 
                                      color="success"
                                      variant="outlined"
                                      sx={{ height: 24 }}
                                    />
                                  </Box>
                                  
                                  <Button 
                                    variant="contained" 
                                    color="primary"
                                    fullWidth
                                    onClick={() => {
                                      // Create cart items from recipe ingredients
                                      const recipeItems = recipe.ingredients.map((ingredient, index) => ({
                                        id: `recipe-${recipe.id}-${index}`,
                                        name: ingredient,
                                        price: parseFloat((Math.random() * 5 + 1).toFixed(2)),
                                        category: determineCategory(ingredient),
                                        quantity: 1,
                                        image: `https://source.unsplash.com/100x100/?${encodeURIComponent(ingredient)}`,
                                        fromRecipe: recipe.title
                                      }));
                                      
                                      setCartItems(prev => [...prev, ...recipeItems]);
                                      showAlert(`Added ingredients for ${recipe.title} to your cart!`, "success");
                                    }}
                                  >
                                    Add Ingredients To Cart
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Meal Planner Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                pb: 2
              }}>
                <MenuBookIcon sx={{ mr: 1 }} />
                Smart Meal Planner
              </Typography>
              
              <Card sx={{ 
                mb: 3, 
                borderRadius: 2, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                bgcolor: 'primary.lighter'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SpaIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" color="primary.main">Create Your Personalized Meal Plan</Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    Our AI-powered meal planner creates a customized weekly meal plan based on your dietary preferences, nutritional needs, and lifestyle.
                  </Typography>
                  <Button 
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SmartToyIcon />}
                    onClick={() => setMealPlannerOpen(true)}
                  >
                    Create New Meal Plan
                  </Button>
                </CardContent>
              </Card>
              
              {/* Pre-made meal plans */}
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 4
              }}>
                <RestaurantIcon sx={{ mr: 1 }} />
                Recommended Meal Plans
              </Typography>
              
              <Grid container spacing={3}>
                {mealPlans.map(plan => (
                  <Grid item xs={12} md={4} key={plan.id}>
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                      },
                      position: 'relative',
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                        <Box
                          component="img"
                          src={plan.image}
                          alt={plan.name}
                          sx={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 1,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white'
                        }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {plan.name}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          <strong>Diet Type:</strong> {dietTypes[plan.dietType]?.name || plan.dietType}
                        </Typography>
                        
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Days:</strong> {plan.days}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Meals/day:</strong> {plan.mealsPerDay}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Avg. Calories/day:</strong> {plan.avgCaloriesPerDay}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Button 
                          variant="contained" 
                          color="primary"
                          fullWidth
                          onClick={() => setSelectedMealPlan(plan)}
                        >
                          View Plan
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Custom Meal Plans */}
              {generatedMealPlan && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 4
                  }}>
                    <FiberNewIcon sx={{ mr: 1 }} />
                    Your Custom Meal Plan
                  </Typography>
                  
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Typography variant="h6">{generatedMealPlan.name}</Typography>
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="secondary"
                        onClick={() => addMealPlanToCart(generatedMealPlan)}
                      >
                        Add All to Cart
                      </Button>
                    </Box>
                    
                    <CardContent>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={4}>
                          <Typography variant="body2">
                            <strong>Diet Type:</strong> {dietTypes[generatedMealPlan.dietType]?.name || generatedMealPlan.dietType}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2">
                            <strong>Goal:</strong> {generatedMealPlan.goal}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2">
                            <strong>Calories/day:</strong> {generatedMealPlan.avgCaloriesPerDay}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {/* Day tabs */}
                      <Tabs 
                        value={0} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ mb: 2 }}
                      >
                        {generatedMealPlan.days.map((day, index) => (
                          <Tab key={day.day} label={day.day} />
                        ))}
                      </Tabs>
                      
                      {/* Sample day */}
                      <Box>
                        {generatedMealPlan.days[0].meals.map((meal, index) => (
                          <Accordion key={meal.id} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="subtitle1">{meal.type}: {meal.title}</Typography>
                                </Box>
                                <Typography variant="body2" color="primary">
                                  {meal.calories} cal
                                </Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>Prep Time:</strong> {meal.prepTime} minutes
                                </Typography>
                                
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>Ingredients:</strong>
                                </Typography>
                                <Box component="ul" sx={{ mb: 2, pl: 2 }}>
                                  {meal.ingredients.map((ingredient, idx) => (
                                    <Typography component="li" variant="body2" key={`ingredient-${idx}`}>
                                      {ingredient}
                                    </Typography>
                                  ))}
                                </Box>
                                
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>Macros:</strong> Protein: {meal.macros.protein}g, Carbs: {meal.macros.carbs}g, Fat: {meal.macros.fat}g, Fiber: {meal.macros.fiber}g
                                </Typography>
                                
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  sx={{ mt: 1 }}
                                  onClick={() => {
                                    const mealItems = meal.ingredients.map((ingredient, idx) => ({
                                      id: `meal-${meal.id}-${idx}`,
                                      name: ingredient,
                                      price: parseFloat((Math.random() * 5 + 1).toFixed(2)),
                                      category: determineCategory(ingredient),
                                      quantity: 1,
                                      image: `https://source.unsplash.com/100x100/?${encodeURIComponent(ingredient)}`,
                                      fromMealPlan: `${generatedMealPlan.name} - ${meal.type}`
                                    }));
                                    
                                    setCartItems(prev => [...prev, ...mealItems]);
                                    showAlert(`Added ingredients for ${meal.title} to your cart!`, "success");
                                  }}
                                >
                                  Add to Cart
                                </Button>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Recipe Dialog */}
      <Dialog 
        open={recipeDialogOpen} 
        onClose={() => setRecipeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecipe && (
          <>
            <DialogTitle>
              <Typography variant="h5">{selectedRecipe.title}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box 
                    component="img"
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    sx={{ 
                      width: '100%', 
                      borderRadius: 2,
                      mb: 2,
                      maxHeight: 300,
                      objectFit: 'cover'
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip icon={<TimerIcon />} label={`${selectedRecipe.readyInMinutes} min`} />
                    <Chip icon={<LocalDiningIcon />} label={`${selectedRecipe.servings} servings`} />
                    <Chip icon={<HealthAndSafetyIcon />} label={`Health: ${selectedRecipe.healthScore}/100`} color="success" />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    {selectedRecipe.vegetarian && <Chip label="Vegetarian" sx={{ mr: 1, mb: 1 }} color="success" />}
                    {selectedRecipe.vegan && <Chip label="Vegan" sx={{ mr: 1, mb: 1 }} color="success" />}
                    {selectedRecipe.glutenFree && <Chip label="Gluten Free" sx={{ mr: 1, mb: 1 }} />}
                    {selectedRecipe.dairyFree && <Chip label="Dairy Free" sx={{ mr: 1, mb: 1 }} />}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Ingredients</Typography>
                  <List>
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <ListItem key={index} divider>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={ingredient} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Instructions</Typography>
                  <Typography variant="body1">
                    For detailed cooking instructions, view the full recipe or add all ingredients to your cart.
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRecipeDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<ShoppingCartIcon />}
                onClick={() => handleAddRecipeToCart(selectedRecipe)}
              >
                Add All Ingredients to Cart
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Nutrition Goals Dialog */}
      <Dialog
        open={nutritionDialogOpen}
        onClose={() => setNutritionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalculateIcon sx={{ mr: 1 }} />
            Customize Nutrition Goals
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Set your daily nutrition targets to personalize your analysis and recommendations.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography gutterBottom>Daily Calorie Target</Typography>
              <Slider
                value={nutritionGoals.calories}
                onChange={(e, newValue) => setNutritionGoals(prev => ({ ...prev, calories: newValue }))}
                min={1200}
                max={3500}
                step={50}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1500, label: '1500' },
                  { value: 2000, label: '2000' },
                  { value: 2500, label: '2500' },
                  { value: 3000, label: '3000' }
                ]}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Protein (g)</Typography>
              <Slider
                value={nutritionGoals.protein}
                onChange={(e, newValue) => setNutritionGoals(prev => ({ ...prev, protein: newValue }))}
                min={50}
                max={200}
                step={5}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Carbohydrates (g)</Typography>
              <Slider
                value={nutritionGoals.carbs}
                onChange={(e, newValue) => setNutritionGoals(prev => ({ ...prev, carbs: newValue }))}
                min={100}
                max={400}
                step={10}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Fat (g)</Typography>
              <Slider
                value={nutritionGoals.fat}
                onChange={(e, newValue) => setNutritionGoals(prev => ({ ...prev, fat: newValue }))}
                min={30}
                max={120}
                step={5}
                valueLabelDisplay="auto"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Fiber (g)</Typography>
              <Slider
                value={nutritionGoals.fiber}
                onChange={(e, newValue) => setNutritionGoals(prev => ({ ...prev, fiber: newValue }))}
                min={15}
                max={50}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <SmartToyIcon fontSize="small" sx={{ mr: 1 }} />
              AI Diet Type Preset
            </Typography>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <Select
                value={userDietaryPreferences?.primaryDiet || 'balanced'}
                onChange={(e) => {
                  const dietType = e.target.value;
                  // Adjust nutrition goals based on diet type
                  switch(dietType) {
                    case 'keto':
                      setNutritionGoals({
                        calories: 2000,
                        protein: 150,
                        carbs: 50,
                        fat: 166,
                        fiber: 25,
                        sugar: 25
                      });
                      break;
                    case 'vegan':
                      setNutritionGoals({
                        calories: 2000,
                        protein: 80,
                        carbs: 275,
                        fat: 65,
                        fiber: 35,
                        sugar: 40
                      });
                      break;
                    case 'paleo':
                      setNutritionGoals({
                        calories: 2000,
                        protein: 150,
                        carbs: 100,
                        fat: 130,
                        fiber: 25,
                        sugar: 30
                      });
                      break;
                    case 'mediterranean':
                      setNutritionGoals({
                        calories: 2000,
                        protein: 90,
                        carbs: 250,
                        fat: 80,
                        fiber: 35,
                        sugar: 40
                      });
                      break;
                    case 'muscle_gain':
                      setNutritionGoals({
                        calories: 2500,
                        protein: 190,
                        carbs: 275,
                        fat: 80,
                        fiber: 35,
                        sugar: 50
                      });
                      break;
                    case 'weight_loss':
                      setNutritionGoals({
                        calories: 1600,
                        protein: 130,
                        carbs: 130,
                        fat: 65,
                        fiber: 30,
                        sugar: 25
                      });
                      break;
                    default: // balanced
                      setNutritionGoals({
                        calories: 2000,
                        protein: 120,
                        carbs: 225,
                        fat: 65,
                        fiber: 30,
                        sugar: 50
                      });
                  }
                }}
              >
                {Object.entries(dietTypes).map(([key, diet]) => (
                  <MenuItem key={key} value={key}>{diet.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setNutritionDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              setNutritionDialogOpen(false);
              analyzeNutrition();
              showAlert("Nutrition goals updated", "success");
            }}
          >
            Save & Analyze
          </Button>
        </DialogActions>
      </Dialog>

      {/* Meal Planner Dialog */}
      <Dialog
        open={mealPlannerOpen}
        onClose={() => !aiLoading && setMealPlannerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MenuBookIcon sx={{ mr: 1 }} />
            Create Your Custom Meal Plan
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={mealPlanWizardStep} sx={{ mb: 4 }}>
            <Step key="diet-type">
              <StepLabel>Diet Type</StepLabel>
            </Step>
            <Step key="preferences">
              <StepLabel>Preferences</StepLabel>
            </Step>
            <Step key="restrictions">
              <StepLabel>Restrictions</StepLabel>
            </Step>
            <Step key="meals">
              <StepLabel>Meals</StepLabel>
            </Step>
            <Step key="lifestyle">
              <StepLabel>Lifestyle</StepLabel>
            </Step>
            <Step key="review">
              <StepLabel>Review</StepLabel>
            </Step>
          </Stepper>
          
          {/* Diet Type Step */}
          {mealPlanWizardStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Choose Your Diet Type</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Select the dietary approach that best aligns with your goals and preferences.
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries(dietTypes).map(([key, diet]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Card sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      border: mealPlanProfile.dietType === key ? '2px solid' : '1px solid',
                      borderColor: mealPlanProfile.dietType === key ? 'primary.main' : 'divider',
                      bgcolor: mealPlanProfile.dietType === key ? 'primary.lighter' : 'background.paper',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.lighter',
                        transform: 'translateY(-3px)',
                        boxShadow: 3
                      },
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => setMealPlanProfile(prev => ({ ...prev, dietType: key }))}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {diet.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {diet.description}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 'bold' }}>
                          Typical Macros:
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
                          Protein: {diet.macros.protein} • Carbs: {diet.macros.carbs} • Fat: {diet.macros.fat}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Preferences Step */}
          {mealPlanWizardStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Your Goals & Preferences</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Tell us about your nutrition goals and food preferences.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>Primary Goal</Typography>
              <RadioGroup
                value={mealPlanProfile.goal}
                onChange={(e) => setMealPlanProfile(prev => ({ ...prev, goal: e.target.value }))}
                sx={{ mb: 3 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel 
                      value="weight_loss" 
                      control={<Radio />} 
                      label="Weight Loss" 
                      sx={{ 
                        p: 1, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        width: '100%',
                        m: 0
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel 
                      value="weight_management" 
                      control={<Radio />} 
                      label="Weight Maintenance" 
                      sx={{ 
                        p: 1, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        width: '100%',
                        m: 0
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel 
                      value="muscle_gain" 
                      control={<Radio />} 
                      label="Muscle Gain" 
                      sx={{ 
                        p: 1, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        width: '100%',
                        m: 0
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel 
                      value="athletic_performance" 
                      control={<Radio />} 
                      label="Athletic Performance" 
                      sx={{ 
                        p: 1, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        width: '100%',
                        m: 0
                      }}
                    />
                  </Grid>
                </Grid>
              </RadioGroup>
              
              <Typography variant="subtitle1" gutterBottom>Daily Calorie Target</Typography>
              <Slider
                value={mealPlanProfile.calories}
                onChange={(e, newValue) => setMealPlanProfile(prev => ({ ...prev, calories: newValue }))}
                min={1200}
                max={3500}
                step={50}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1500, label: '1500' },
                  { value: 2000, label: '2000' },
                  { value: 2500, label: '2500' },
                  { value: 3000, label: '3000' }
                ]}
                sx={{ mb: 3 }}
              />
              
              <Typography variant="subtitle1" gutterBottom>Food Preferences</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Select foods you especially like to include in your meal plan.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {['chicken', 'beef', 'fish', 'tofu', 'eggs', 'quinoa', 'rice', 'pasta', 'potatoes', 'leafy greens', 'berries', 'nuts'].map(preference => (
                  <Chip
                    key={preference}
                    label={preference}
                    onClick={() => {
                      setMealPlanProfile(prev => {
                        const newPreferences = prev.preferences.includes(preference)
                          ? prev.preferences.filter(p => p !== preference)
                          : [...prev.preferences, preference];
                        return { ...prev, preferences: newPreferences };
                      });
                    }}
                    color={mealPlanProfile.preferences.includes(preference) ? "primary" : "default"}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Restrictions Step */}
          {mealPlanWizardStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Dietary Restrictions</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Let us know about any foods you need to avoid.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>Food Allergies & Restrictions</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {['gluten', 'dairy', 'eggs', 'soy', 'nuts', 'shellfish', 'peanuts', 'wheat'].map(restriction => (
                  <Chip
                    key={restriction}
                    label={restriction}
                    onClick={() => {
                      setMealPlanProfile(prev => {
                        const newRestrictions = prev.restrictions.includes(restriction)
                          ? prev.restrictions.filter(r => r !== restriction)
                          : [...prev.restrictions, restriction];
                        return { ...prev, restrictions: newRestrictions };
                      });
                    }}
                    color={mealPlanProfile.restrictions.includes(restriction) ? "error" : "default"}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>Special Diets</Typography>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={mealPlanProfile.restrictions.includes('vegetarian')}
                          onChange={(e) => {
                            setMealPlanProfile(prev => {
                              const newRestrictions = e.target.checked
                                ? [...prev.restrictions, 'vegetarian']
                                : prev.restrictions.filter(r => r !== 'vegetarian');
                              return { ...prev, restrictions: newRestrictions };
                            });
                          }}
                        />
                      } 
                      label="Vegetarian" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={mealPlanProfile.restrictions.includes('vegan')}
                          onChange={(e) => {
                            setMealPlanProfile(prev => {
                              const newRestrictions = e.target.checked
                                ? [...prev.restrictions, 'vegan']
                                : prev.restrictions.filter(r => r !== 'vegan');
                              return { ...prev, restrictions: newRestrictions };
                            });
                          }}
                        />
                      } 
                      label="Vegan" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={mealPlanProfile.restrictions.includes('gluten-free')}
                          onChange={(e) => {
                            setMealPlanProfile(prev => {
                              const newRestrictions = e.target.checked
                                ? [...prev.restrictions, 'gluten-free']
                                : prev.restrictions.filter(r => r !== 'gluten-free');
                              return { ...prev, restrictions: newRestrictions };
                            });
                          }}
                        />
                      } 
                      label="Gluten Free" 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel 
                      control={
                        <Switch 
                          checked={mealPlanProfile.restrictions.includes('dairy-free')}
                          onChange={(e) => {
                            setMealPlanProfile(prev => {
                              const newRestrictions = e.target.checked
                                ? [...prev.restrictions, 'dairy-free']
                                : prev.restrictions.filter(r => r !== 'dairy-free');
                              return { ...prev, restrictions: newRestrictions };
                            });
                          }}
                        />
                      } 
                      label="Dairy Free" 
                    />
                  </Grid>
                </Grid>
              </FormControl>
            </Box>
          )}
          
          {/* Meals Step */}
          {mealPlanWizardStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Meals Configuration</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Tell us about your meal frequency and preferences.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>Meals Per Day</Typography>
              <ToggleButtonGroup
                value={mealPlanProfile.mealsPerDay}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setMealPlanProfile(prev => ({ ...prev, mealsPerDay: newValue }));
                  }
                }}
                sx={{ display: 'flex', mb: 3, flexWrap: 'wrap' }}
              >
                <ToggleButton value={3} sx={{ flex: '1 0 30%' }}>
                  3 Meals
                </ToggleButton>
                <ToggleButton value={4} sx={{ flex: '1 0 30%' }}>
                  4 Meals
                </ToggleButton>
                <ToggleButton value={5} sx={{ flex: '1 0 30%' }}>
                  5 Meals
                </ToggleButton>
                <ToggleButton value={6} sx={{ flex: '1 0 30%' }}>
                  6 Meals
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
          
          {/* Lifestyle Step */}
          {mealPlanWizardStep === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Lifestyle Factors</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Tell us about your cooking preferences and lifestyle.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>Cooking Time</Typography>
              <RadioGroup
                value={mealPlanProfile.cookingTime}
                onChange={(e) => setMealPlanProfile(prev => ({ ...prev, cookingTime: e.target.value }))}
                sx={{ mb: 3 }}
              >
                <FormControlLabel value="minimal" control={<Radio />} label="Quick meals only (15 min or less)" />
                <FormControlLabel value="moderate" control={<Radio />} label="Moderate cooking time (up to 30 min)" />
                <FormControlLabel value="extended" control={<Radio />} label="I enjoy cooking (any duration)" />
              </RadioGroup>
              
              <Typography variant="subtitle1" gutterBottom>Cooking Skill Level</Typography>
              <RadioGroup
                value={mealPlanProfile.skillLevel}
                onChange={(e) => setMealPlanProfile(prev => ({ ...prev, skillLevel: e.target.value }))}
                sx={{ mb: 3 }}
              >
                <FormControlLabel value="beginner" control={<Radio />} label="Beginner" />
                <FormControlLabel value="intermediate" control={<Radio />} label="Intermediate" />
                <FormControlLabel value="advanced" control={<Radio />} label="Advanced" />
              </RadioGroup>
              
              <Typography variant="subtitle1" gutterBottom>Budget Level</Typography>
              <RadioGroup
                value={mealPlanProfile.budgetLevel}
                onChange={(e) => setMealPlanProfile(prev => ({ ...prev, budgetLevel: e.target.value }))}
                sx={{ mb: 3 }}
              >
                <FormControlLabel value="budget" control={<Radio />} label="Budget-friendly" />
                <FormControlLabel value="moderate" control={<Radio />} label="Moderate" />
                <FormControlLabel value="premium" control={<Radio />} label="Premium" />
              </RadioGroup>
            </Box>
          )}
          
          {/* Review Step */}
          {mealPlanWizardStep === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Your Meal Plan is Ready!</Typography>
              
              {aiLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    AI is creating your personalized meal plan...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This may take a moment as we analyze your preferences and generate optimal meals.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Card sx={{ mb: 3, bgcolor: 'success.lighter', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="success.main">Meal Plan Generated Successfully!</Typography>
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        Your custom {dietTypes[mealPlanProfile.dietType]?.name || mealPlanProfile.dietType} plan has been created based on your preferences.
                      </Typography>
                      
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                          setMealPlannerOpen(false);
                          setTimeout(() => setSelectedMealPlan(generatedMealPlan), 500);
                        }}
                        fullWidth
                      >
                        View Your Meal Plan
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Typography variant="subtitle1" gutterBottom>Plan Summary</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Diet Type:</strong> {dietTypes[mealPlanProfile.dietType]?.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Goal:</strong> {mealPlanProfile.goal}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Calories/day:</strong> {mealPlanProfile.calories}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Meals/day:</strong> {mealPlanProfile.mealsPerDay}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Restrictions:</strong> {mealPlanProfile.restrictions.length > 0 
                          ? mealPlanProfile.restrictions.join(', ') 
                          : 'None'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {mealPlanWizardStep > 0 && mealPlanWizardStep < 5 && (
            <Button 
              onClick={() => setMealPlanWizardStep(prev => prev - 1)}
            >
              Back
            </Button>
          )}
          
          {mealPlanWizardStep < 4 && (
            <Button 
              variant="contained"
              color="primary"
              onClick={() => setMealPlanWizardStep(prev => prev + 1)}
            >
              Next
            </Button>
          )}
          
          {mealPlanWizardStep === 4 && (
            <Button 
              variant="contained"
              color="primary"
              onClick={generateMealPlan}
            >
              Generate Plan
            </Button>
          )}
          
          {mealPlanWizardStep === 5 && (
            <Button 
              variant="contained"
              color="success"
              onClick={() => {
                setMealPlannerOpen(false);
                if (generatedMealPlan) {
                  addMealPlanToCart(generatedMealPlan);
                }
              }}
              startIcon={<ShoppingCartIcon />}
            >
              Add All to Cart
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Checkout Dialog with stepper */}
      <Dialog 
        open={checkoutDialogOpen} 
        onClose={() => {
          if (checkoutStep !== 1) { // Don't allow closing during processing
            setCheckoutDialogOpen(false);
            setCheckoutStep(0);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {checkoutStep === 0 && "Complete Your Order"}
          {checkoutStep === 1 && "Processing Order"}
          {checkoutStep === 2 && "Order Confirmed"}
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={checkoutStep} sx={{ mb: 4 }}>
            <Step key="details">
              <StepLabel>Review Order</StepLabel>
            </Step>
            <Step key="processing">
              <StepLabel>Processing</StepLabel>
            </Step>
            <Step key="confirmation">
              <StepLabel>Confirmation</StepLabel>
            </Step>
          </Stepper>
          
          {checkoutStep === 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={selectedStore?.logo}
                  alt={selectedStore?.name}
                  sx={{ width: 40, height: 40, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">{selectedStore?.name}</Typography>
                  <Typography variant="body2">{selectedStore?.address}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Delivery Options</Typography>
              <Box sx={{ mb: 3 }}>
                {deliveryOptions.map(option => (
                  <Box 
                    key={option.id}
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      border: 1, 
                      borderColor: selectedDeliveryOption?.id === option.id ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: selectedDeliveryOption?.id === option.id ? 'primary.lighter' : 'background.paper'
                    }}
                    onClick={() => setSelectedDeliveryOption(option)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {option.name}
                      </Typography>
                      <Typography variant="subtitle1" color="primary">
                        ${option.fee.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Estimated delivery: {option.eta}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Items ({cartItems.length})</Typography>
              <List sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                {cartItems.map(item => (
                  <ListItem key={item.id} divider>
                    <ListItemText 
                      primary={item.name}
                      secondary={`${item.quantity} × $${(item.price || 4.99).toFixed(2)}`}
                    />
                    <Typography variant="body2">
                      ${((item.price || 4.99) * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${cartTotals.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Delivery Fee:</Typography>
                  <Typography>${selectedDeliveryOption?.fee.toFixed(2) || cartTotals.deliveryFee.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax:</Typography>
                  <Typography>${cartTotals.tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary.main">
                    ${(cartTotals.subtotal + cartTotals.tax + (selectedDeliveryOption?.fee || cartTotals.deliveryFee)).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                By placing your order, you agree to the terms of service and privacy policy.
                Items may be subject to availability and prices may vary.
              </Typography>
            </>
          )}
          
          {checkoutStep === 1 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>Processing Your Order</Typography>
              <Typography variant="body1">
                Please wait while we confirm your delivery details...
              </Typography>
            </Box>
          )}
          
          {checkoutStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'success.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 50 }} />
              </Box>
              <Typography variant="h5" gutterBottom sx={{ color: 'success.main' }}>
                Order Confirmed!
              </Typography>
              <Typography variant="h6" gutterBottom>
                Order #DM{Math.floor(Math.random() * 10000000)}
              </Typography>
              <Typography variant="body1" paragraph>
                Your order from {selectedStore?.name} has been placed successfully.
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 2, mb: 3 }}>
                <Typography variant="body1">
                  Estimated delivery: {selectedDeliveryOption?.eta || '45-60 minutes'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                You will receive an email confirmation and delivery updates.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {checkoutStep === 0 && (
            <>
              <Button onClick={() => setCheckoutDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button 
                variant="contained"
                color="primary"
                onClick={handleSubmitOrder}
                disabled={loading || !selectedDeliveryOption}
                startIcon={loading ? <CircularProgress size={20} /> : <LocalShippingIcon />}
              >
                Place Order
              </Button>
            </>
          )}
          {checkoutStep === 2 && (
            <Button 
              variant="contained"
              color="primary"
              onClick={() => {
                setCheckoutDialogOpen(false);
                setCheckoutStep(0);
              }}
              fullWidth
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroceryTab;