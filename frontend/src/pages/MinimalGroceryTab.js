// MinimalGroceryTab.js - A minimal implementation of GroceryTab for emergency use
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
  ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// A minimal, guaranteed-to-work implementation of GroceryTab
const MinimalGroceryTab = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGetLocation = () => {
    setLoading(true);
    // Simulate location finding
    setTimeout(() => {
      setLocation({ lat: 44.9778, lng: -93.2650, name: "Minneapolis, MN" });
      setLoading(false);
    }, 1000);
  };

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
          <ShoppingCartIcon fontSize="large" />
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Browse" />
          <Tab label="Cart" />
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
                    {location ? location.name : "Location not set"}
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
              
              <TextField
                fullWidth
                margin="normal"
                variant="outlined"
                placeholder="Search for groceries..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Available Stores
              </Typography>
              
              <Grid container spacing={2}>
                {["Whole Foods", "Target", "Kroger", "Trader Joe's", "Safeway"].map((store, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6">{store}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(Math.random() * 5 + 0.5).toFixed(1)} miles away
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="primary"
                          size="small"
                          sx={{ mt: 2 }}
                        >
                          Shop Here
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Shopping Cart</Typography>
              <Typography variant="body1" color="text.secondary">
                Your cart is empty. Add items from the Browse tab.
              </Typography>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Meal Plans</Typography>
              <Typography variant="body1" color="text.secondary">
                Create a meal plan to automatically add ingredients to your cart.
              </Typography>
              
              <Card sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6">Features:</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><ShoppingCartIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Browse groceries by category" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocalDiningIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Plan meals and add ingredients to your cart" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocalShippingIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Arrange delivery through DoorDash" />
                  </ListItem>
                </List>
              </Card>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MinimalGroceryTab;