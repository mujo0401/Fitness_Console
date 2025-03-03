// GroceryTabFallback.js - A simplified version of the Grocery Tab to use in case of errors
import React from 'react';
import {
  Box, 
  Typography, 
  Card, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const GroceryTabFallback = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Grocery Shop
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to the Grocery Shop! Here you can browse grocery items, create a shopping cart, and arrange for delivery through our DoorDash integration.
      </Typography>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Features:
        </Typography>
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
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => window.location.reload()}
      >
        Refresh to Load Shop
      </Button>
    </Box>
  );
};

export default GroceryTabFallback;