import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  Avatar
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

/**
 * StoreCard component for displaying a store
 * 
 * @param {Object} props
 * @param {Object} props.store - Store data to display
 * @param {Function} props.onSelect - Callback when store is selected
 * @param {boolean} props.compact - Whether to show a compact version
 */
const StoreCard = ({
  store,
  onSelect,
  compact = false
}) => {
  if (!store) return null;
  
  const handleSelectStore = () => {
    if (onSelect) {
      onSelect(store);
    }
  };
  
  // Compact view for selected store display
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 3 }}>
        <Avatar 
          src={store.logo}
          alt={store.name}
          sx={{ width: 40, height: 40, mr: 2 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{store.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {store.distance} miles • {store.address}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          color="primary" 
          size="small" 
          onClick={handleSelectStore}
        >
          Change
        </Button>
      </Box>
    );
  }
  
  // Full store card
  return (
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
          <Rating value={store.rating || 4.0} precision={0.5} size="small" readOnly />
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
          {Array(store.priceLevel || 2).fill().map((_, i) => '$').join('')}
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          fullWidth
          size="large"
          onClick={handleSelectStore}
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
  );
};

export default StoreCard;