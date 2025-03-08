// frontend/src/components/grocery/GroceryTab.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Badge,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';

// Import reusable components
import {
  ProductCard,
  CategoryChip,
  SearchBar,
  ProductGrid,
  VirtualizedProductList,
  CartItem,
  CartSummary,
  StoreCard
} from './';

// Context
import { useWorkoutPlan } from '../../context/WorkoutPlanContext';

/**
 * GroceryTab - Main component for the grocery shopping experience
 * Refactored to use reusable components following the chart component architecture
 */
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
  
  // Advanced UI controls
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortOrder, setSortOrder] = useState('relevance');
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

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Load tab-specific data as needed
    if (newValue === 0 && stores.length === 0) {
      handleGetLocation();
    }
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
        },
        (error) => {
          console.error("Error getting location:", error);
          showAlert("Could not get your location. Using default location instead.", "warning");
          
          // Fallback to default location
          const defaultLocation = { lat: 44.9778, lng: -93.2650 }; // Minneapolis
          setLocation(defaultLocation);
          fetchNearbyStores(defaultLocation.lat, defaultLocation.lng);
        }
      );
    } else {
      showAlert("Geolocation is not supported by your browser. Using default location.", "warning");
      
      // Fallback to default location
      const defaultLocation = { lat: 44.9778, lng: -93.2650 };
      setLocation(defaultLocation);
      fetchNearbyStores(defaultLocation.lat, defaultLocation.lng);
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
          // More mock stores...
        ];
        
        setStores(mockStores);
        setLoading(false);
        showAlert("Using demo store data since we couldn't connect to the store locator service.", "info");
      }
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

  // Calculate cart totals
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

  // Initialize location on component mount
  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);

  // Checkout flow
  const handleCheckout = () => {
    if (!selectedStore) {
      showAlert("Please select a store first", "error");
      return;
    }
    
    if (cartItems.length === 0) {
      showAlert("Your cart is empty", "warning");
      return;
    }
    
    // Mock delivery options
    setDeliveryOptions([
      { id: 'standard', name: 'Standard Delivery', fee: 3.99, eta: '2-3 hours', available: true },
      { id: 'express', name: 'Express Delivery', fee: 7.99, eta: '1 hour', available: true },
      { id: 'scheduled', name: 'Schedule Delivery', fee: 3.99, eta: 'Choose time', available: true }
    ]);
    
    // Select the first available option as default
    setSelectedDeliveryOption({ id: 'standard', name: 'Standard Delivery', fee: 3.99 });
    
    // Open checkout dialog
    setCheckoutDialogOpen(true);
  };

  // Submit order
  const handleSubmitOrder = () => {
    setLoading(true);
    setCheckoutStep(1); // Move to processing step
    
    // Simulate order processing
    setTimeout(() => {
      setCheckoutStep(2); // Success step
      setLoading(false);
      
      // Clear the cart after successful order
      setTimeout(() => {
        setCartItems([]);
        setCheckoutDialogOpen(false);
        setCheckoutStep(0); // Reset for next time
        showAlert("Your order has been placed successfully!", "success");
      }, 3000);
    }, 2000);
  };

  // Render functions for different tabs
  const renderStoreFinderTab = () => {
    return (
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
        
        {/* Store list */}
        <Typography variant="h6">Available Stores</Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography sx={{ mt: 2 }}>Finding stores near you...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {stores.map((store) => (
              <Grid item xs={12} sm={6} md={4} key={store.id}>
                <StoreCard 
                  store={store} 
                  onSelect={handleSelectStore} 
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderShopAndCartTab = () => {
    if (!selectedStore) {
      return (
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
      );
    }
    
    return (
      <Box>
        {/* Store header info */}
        <StoreCard 
          store={selectedStore} 
          onSelect={() => setActiveTab(0)} 
          compact={true}
        />
        
        {/* Cart and products view */}
        <Grid container spacing={3}>
          {/* Products/search panel */}
          <Grid item xs={12} md={8}>
            {/* Search bar */}
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              inputRef={searchInputRef}
              elevation={1}
            >
              {/* Category chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <CategoryChip 
                  label="All Products" 
                  onClick={() => handleCategoryChange('all')}
                  selected={selectedCategory === 'all'}
                />
                {productCategories.map(category => (
                  <CategoryChip
                    key={category.id}
                    label={category.name}
                    icon={category.icon}
                    onClick={() => handleCategoryChange(category.id)}
                    selected={selectedCategory === category.id}
                  />
                ))}
              </Box>
            </SearchBar>
            
            {/* Filter header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 3 }}>
              <Typography variant="subtitle1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} {
                  selectedCategory !== 'all' ? `in ${productCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}` : ''
                } {searchQuery ? `matching "${searchQuery}"` : ''}
              </Typography>
            </Box>
            
            {/* Featured products */}
            {selectedCategory === 'all' && searchQuery === '' && (
              <ProductGrid
                products={featuredProducts}
                title="Featured Products"
                onAddToCart={handleAddToCart}
                onSaveForLater={handleSaveForLater}
                md={4}
                sm={6}
              />
            )}
            
            {/* Product list */}
            {viewMode === 'grid' ? (
              <ProductGrid 
                products={filteredProducts}
                title={searchQuery ? 'Search Results' : (
                  selectedCategory === 'all' ? 'All Products' : 
                    `${productCategories.find(c => c.id === selectedCategory)?.name || 'Products'}`
                )}
                loading={loading}
                onAddToCart={handleAddToCart}
                onSaveForLater={handleSaveForLater}
                emptyMessage="No products found. Try adjusting your search or filters."
              />
            ) : (
              <VirtualizedProductList
                products={filteredProducts}
                loading={loading}
                onAddToCart={handleAddToCart}
                onSaveForLater={handleSaveForLater}
              />
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
            {cartItems.length === 0 ? (
              <Paper 
                sx={{ 
                  p: 2, 
                  position: 'sticky', 
                  top: 24, 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  textAlign: 'center',
                  py: 4 
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 1 }}>Your cart is empty</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add items from the store to get started
                </Typography>
              </Paper>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCartIcon sx={{ mr: 1 }} /> 
                  Your Cart {cartItems.length > 0 && `(${cartItems.length})`}
                </Typography>
                
                <List sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onSaveForLater={handleSaveForLater}
                      onRemove={handleRemoveFromCart}
                    />
                  ))}
                </List>
                
                {/* Saved for later items */}
                {savedForLater.length > 0 && (
                  <Box sx={{ mt: 3, mb: 2 }}>
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
                
                <CartSummary 
                  totals={cartTotals}
                  onCheckout={handleCheckout}
                  disabled={cartItems.length === 0}
                  loading={loading}
                  checkoutLabel={selectedStore?.instacartAvailable ? 'Checkout with Instacart' : 'Checkout with DoorDash'}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Render checkout dialog
  const renderCheckoutDialog = () => {
    return (
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
          {checkoutStep === 0 && (
            <>
              <StoreCard store={selectedStore} compact={true} />
              
              <Typography variant="h6" gutterBottom>Delivery Options</Typography>
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
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Items ({cartItems.length})</Typography>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary.main">
                    ${(cartTotals.subtotal + cartTotals.tax + (selectedDeliveryOption?.fee || cartTotals.deliveryFee)).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
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
    );
  };

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
          <Tab icon={<LocalDiningIcon />} label="Recipes" iconPosition="start" />
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
          {activeTab === 0 && renderStoreFinderTab()}
          
          {/* Shop & Cart Tab */}
          {activeTab === 1 && renderShopAndCartTab()}
          
          {/* Placeholder for other tabs */}
          {activeTab > 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                {activeTab === 2 && "Recipes"}
                {activeTab === 3 && "Smart Analysis"}
                {activeTab === 4 && "Meal Planner"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This section is coming soon in the refactored version!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Checkout Dialog */}
      {renderCheckoutDialog()}
    </Box>
  );
};

export default GroceryTab;