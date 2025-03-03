// frontend/src/pages/GroceryTab.js
import React, { useState, useEffect } from 'react';
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
  Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// A fixed implementation of GroceryTab that uses the correct API endpoints
const GroceryTab = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [location, setLocation] = useState(null);
  const [loading, setLocationLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Get user location
  const handleGetLocation = () => {
    setLocationLoading(true);
    
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
          setLocationLoading(false);
          
          // Fallback to default location
          const defaultLocation = { lat: 44.9778, lng: -93.2650 };
          setLocation(defaultLocation);
          fetchNearbyStores(defaultLocation.lat, defaultLocation.lng);
        }
      );
    } else {
      console.log("Geolocation not supported by this browser");
      setLocationLoading(false);
      
      // Fallback to default location
      const defaultLocation = { lat: 44.9778, lng: -93.2650 };
      setLocation(defaultLocation);
      fetchNearbyStores(defaultLocation.lat, defaultLocation.lng);
    }
  };

  // Fetch nearby stores using the Google Places API
  const fetchNearbyStores = async (lat, lng) => {
    try {
      // Use the correct API endpoint
      const response = await fetch(`/api/google_places/nearby?lat=${lat}&lng=${lng}&type=grocery_or_supermarket`);
      
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
        deliveryAvailable: true,
        rating: place.rating || 4.0,
        logo: place.photos && place.photos.length > 0 
          ? `/api/google_places/photo?photoreference=${place.photos[0].photo_reference}&maxwidth=100`
          : "https://images.unsplash.com/photo-1580857626078-289a0276981a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      }));
      
      setStores(formattedStores);
      setLocationLoading(false);
    } catch (error) {
      console.error("Error fetching nearby stores:", error);
      setLocationLoading(false);
      
      // Fallback to mock stores
      const mockStores = [
        { id: 1, name: "Whole Foods", distance: 1.2, address: "123 Main St", deliveryAvailable: true },
        { id: 2, name: "Trader Joe's", distance: 2.3, address: "456 Oak Ave", deliveryAvailable: true },
        { id: 3, name: "Target", distance: 3.1, address: "789 Broadway", deliveryAvailable: true },
        { id: 4, name: "Kroger", distance: 1.8, address: "101 Pine St", deliveryAvailable: true },
        { id: 5, name: "Safeway", distance: 2.7, address: "202 Cedar Rd", deliveryAvailable: true }
      ];
      
      setStores(mockStores);
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

  // Select a store to shop from
  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setActiveTab(1); // Switch to Cart tab
  };

  // Add item to cart
  const handleAddToCart = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(cartItem => 
        cartItem.id === item.id 
          ? {...cartItem, quantity: cartItem.quantity + 1} 
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, {...item, quantity: 1}]);
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

  // Checkout with DoorDash
  const handleCheckout = async () => {
    if (!selectedStore) {
      alert("Please select a store first");
      return;
    }
    
    try {
      setLocationLoading(true);
      
      // Check if DoorDash delivery is available
      const response = await fetch(
        `/api/google_places/doordash/check-availability?store_id=${selectedStore.id}&lat=${location?.lat || '0'}&lng=${location?.lng || '0'}&store_name=${encodeURIComponent(selectedStore.name)}`
      );
      
      const doordashAvailability = await response.json();
      
      setLocationLoading(false);
      
      if (doordashAvailability.available) {
        // Add DoorDash info to the store
        setSelectedStore({
          ...selectedStore,
          doordash: doordashAvailability
        });
        
        // Open checkout dialog
        setCheckoutDialogOpen(true);
      } else {
        alert("DoorDash delivery is not available for this store at your location.");
      }
    } catch (error) {
      console.error("Error checking DoorDash availability:", error);
      setLocationLoading(false);
      alert("There was an error checking delivery availability. Please try again later.");
    }
  };

  // Submit order to DoorDash
  const handleDoorDashSubmit = async () => {
    try {
      const orderData = {
        store_id: selectedStore.id,
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
      
      // Submit the order
      const response = await fetch('/api/google_places/doordash/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const orderResult = await response.json();
      
      if (orderResult.success) {
        alert("Your order has been placed successfully! You can track it using the link provided by DoorDash.");
        
        // Clear the cart
        setCartItems([]);
        
        // Close the checkout dialog
        setCheckoutDialogOpen(false);
      } else {
        alert("There was an error placing your order with DoorDash. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting DoorDash order:", error);
      alert("There was an error connecting to DoorDash. Please try again later.");
    }
  };

  // Initialize location on component mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  // Calculate cart totals
  const cartTotal = cartItems.reduce((total, item) => total + (item.price || 4.99) * item.quantity, 0);
  
  // Demo grocery items
  const groceryItems = [
    { id: 101, name: "Organic Bananas", price: 0.99, category: "Produce" },
    { id: 102, name: "Whole Milk", price: 3.49, category: "Dairy" },
    { id: 103, name: "Eggs (1 Dozen)", price: 4.99, category: "Dairy" },
    { id: 104, name: "Whole Wheat Bread", price: 3.99, category: "Bakery" },
    { id: 105, name: "Chicken Breast", price: 6.99, category: "Meat" },
    { id: 106, name: "Spinach", price: 2.99, category: "Produce" },
    { id: 107, name: "Avocados", price: 1.49, category: "Produce" },
    { id: 108, name: "Greek Yogurt", price: 4.49, category: "Dairy" },
    { id: 109, name: "Brown Rice", price: 3.29, category: "Grains" },
    { id: 110, name: "Salmon Fillet", price: 9.99, category: "Seafood" },
    { id: 111, name: "Sweet Potatoes", price: 1.29, category: "Produce" },
    { id: 112, name: "Almonds", price: 7.99, category: "Nuts & Seeds" }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden', mb: 3 }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #43a047, #1b5e20)', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" component="h2">Grocery Shop</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={cartItems.length} color="error" sx={{ mr: 2 }}>
              <ShoppingCartIcon fontSize="large" />
            </Badge>
            {cartItems.length > 0 && (
              <Typography variant="subtitle1">${cartTotal.toFixed(2)}</Typography>
            )}
          </Box>
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Browse Stores" />
          <Tab label="Shopping Cart" />
          <Tab label="Meal Plans" />
        </Tabs>
        
        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>Find Grocery Stores Near You</Typography>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {location ? "Location set" : "Location not set"}
                  </Typography>
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGetLocation} 
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LocationOnIcon />}
                >
                  {location ? "Update Location" : "Get My Location"}
                </Button>
              </Paper>
              
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Available Stores
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {stores.map((store) => (
                    <Grid item xs={12} sm={6} md={4} key={store.id}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6">{store.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {store.distance} miles away
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {store.address}
                          </Typography>
                          <Button 
                            variant="contained" 
                            color="primary"
                            size="small"
                            onClick={() => handleSelectStore(store)}
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
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Shopping Cart</Typography>
              
              {!selectedStore ? (
                <Typography variant="body1" color="text.secondary">
                  Please select a store from the Browse Stores tab.
                </Typography>
              ) : cartItems.length === 0 ? (
                <Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Your cart is empty. Add some items below.
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    Shopping at: {selectedStore.name}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {groceryItems.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6">{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              ${item.price.toFixed(2)} each
                            </Typography>
                            <Button 
                              variant="outlined" 
                              color="primary"
                              size="small"
                              onClick={() => handleAddToCart(item)}
                              startIcon={<ShoppingCartIcon />}
                            >
                              Add to Cart
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                    Shopping at: {selectedStore.name}
                  </Typography>
                  
                  <List>
                    {cartItems.map((item) => (
                      <Paper key={item.id} sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">{item.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${(item.price || 4.99).toFixed(2)} each
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            
                            <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                            
                            <IconButton 
                              size="small" 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <AddIcon />
                            </IconButton>
                            
                            <Button 
                              variant="text" 
                              color="error"
                              sx={{ ml: 2 }}
                              onClick={() => handleRemoveFromCart(item.id)}
                            >
                              Remove
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(67, 160, 71, 0.1)', borderRadius: 2 }}>
                    <Typography variant="h6">Order Summary</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography>Subtotal:</Typography>
                      <Typography>${cartTotal.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography>Delivery Fee:</Typography>
                      <Typography>$5.99</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography>Tax:</Typography>
                      <Typography>${(cartTotal * 0.0725).toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6">
                        ${(cartTotal + 5.99 + cartTotal * 0.0725).toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      size="large"
                      sx={{ mt: 2 }}
                      onClick={handleCheckout}
                      disabled={loading}
                    >
                      Checkout with DoorDash
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Meal Plans</Typography>
              <Typography variant="body1" paragraph>
                Meal planning helps you create a balanced diet and makes grocery shopping easier.
              </Typography>
              
              <Card sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6">Popular Meal Plans:</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><LocalDiningIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Mediterranean Diet" 
                      secondary="Rich in healthy fats, whole grains, and vegetables" 
                    />
                    <Button variant="outlined" size="small">View</Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocalDiningIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="High Protein Plan" 
                      secondary="Focuses on lean proteins for muscle building" 
                    />
                    <Button variant="outlined" size="small">View</Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocalDiningIcon color="primary" /></ListItemIcon>
                    <ListItemText 
                      primary="Plant-Based Diet" 
                      secondary="Whole foods from plant sources" 
                    />
                    <Button variant="outlined" size="small">View</Button>
                  </ListItem>
                </List>
              </Card>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Checkout Dialog */}
      <Dialog open={checkoutDialogOpen} onClose={() => setCheckoutDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Checkout with DoorDash</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>{selectedStore?.name}</Typography>
          <Typography variant="body2" paragraph>{selectedStore?.address}</Typography>
          
          <Typography variant="subtitle1" gutterBottom>Order Summary</Typography>
          <List>
            {cartItems.map(item => (
              <ListItem key={item.id}>
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
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>${cartTotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography>Delivery Fee:</Typography>
              <Typography>$5.99</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography>Tax:</Typography>
              <Typography>${(cartTotal * 0.0725).toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="subtitle1">Total:</Typography>
              <Typography variant="subtitle1">
                ${(cartTotal + 5.99 + cartTotal * 0.0725).toFixed(2)}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            By placing your order, you agree to DoorDash's terms of service and privacy policy. 
            Items may be subject to availability and prices may vary.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDoorDashSubmit} 
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Place Order with DoorDash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroceryTab;