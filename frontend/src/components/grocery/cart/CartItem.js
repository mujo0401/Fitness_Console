import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

/**
 * CartItem component for displaying and managing a cart item
 * 
 * @param {Object} props
 * @param {Object} props.item - The cart item to display
 * @param {Function} props.onUpdateQuantity - Callback when quantity is updated
 * @param {Function} props.onSaveForLater - Callback when item is saved for later
 * @param {Function} props.onRemove - Callback when item is removed
 */
const CartItem = ({
  item,
  onUpdateQuantity,
  onSaveForLater,
  onRemove
}) => {
  if (!item) return null;
  
  const handleIncrement = () => {
    if (onUpdateQuantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };
  
  const handleDecrement = () => {
    if (onUpdateQuantity && item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else if (onRemove && item.quantity <= 1) {
      onRemove(item.id);
    }
  };
  
  const handleSaveForLater = () => {
    if (onSaveForLater) {
      onSaveForLater(item.id);
    }
  };
  
  return (
    <Paper sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', mb: 2 }}>
      <Box sx={{ display: 'flex' }}>
        {item.image && (
          <Box 
            component="img" 
            src={item.image} 
            alt={item.name}
            sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover', mr: 2 }}
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&size=100&background=random`; }}
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
        
        <Typography 
          variant="subtitle2" 
          color="primary.main" 
          sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          ${((item.price || 4.99) * item.quantity).toFixed(2)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Button 
          size="small" 
          color="primary" 
          variant="text"
          onClick={handleSaveForLater}
          sx={{ fontSize: '0.75rem' }}
        >
          Save for later
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <IconButton 
            size="small" 
            onClick={handleDecrement}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          
          <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
            {item.quantity}
          </Typography>
          
          <IconButton 
            size="small" 
            onClick={handleIncrement}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default CartItem;