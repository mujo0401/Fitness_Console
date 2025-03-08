import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Rating
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

/**
 * Reusable ProductCard component for displaying product information
 * 
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {boolean} props.featured - Whether the product is featured
 * @param {Function} props.onAddToCart - Callback when adding to cart
 * @param {Function} props.onSaveForLater - Callback when saving for later
 * @param {Function} props.onViewDetails - Callback when viewing details
 */
const ProductCard = ({ 
  product, 
  featured = false, 
  onAddToCart, 
  onSaveForLater, 
  onViewDetails,
  showRating = true,
  showNutrition = true,
  compact = false
}) => {
  if (!product) return null;
  
  const handleAddToCart = () => {
    if (onAddToCart) onAddToCart(product);
  };
  
  const handleSaveForLater = () => {
    if (onSaveForLater) onSaveForLater(product.id);
  };
  
  return (
    <StyledProductCard featured={featured}>
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
          height: compact ? 120 : 150, 
          objectFit: 'cover',
          objectPosition: 'center' 
        }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontSize: compact ? '0.9rem' : '1rem' }}>
          {product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
            ${product.price.toFixed(2)}
          </Typography>
          {showRating && (
            <Rating value={product.rating} precision={0.5} size="small" readOnly />
          )}
        </Box>
        
        {showNutrition && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <HealthAndSafetyIcon sx={{ color: 'success.main', fontSize: '0.9rem', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Nutrition Score: {product.nutritionScore}/100
            </Typography>
          </Box>
        )}
        
        {!compact && product.description && (
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
        )}
      </CardContent>
      
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          startIcon={<ShoppingCartIcon />} 
          variant="contained" 
          color="primary"
          size="small"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          sx={{ flexGrow: 1, mr: 1 }}
        >
          Add to Cart
        </Button>
        <IconButton 
          size="small" 
          color="primary"
          onClick={handleSaveForLater}
          sx={{ border: '1px solid', borderColor: 'primary.light' }}
        >
          <BookmarkIcon fontSize="small" />
        </IconButton>
      </Box>
    </StyledProductCard>
  );
};

// Styled components
const StyledProductCard = styled(Card)(({ theme, featured }) => ({
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

export default ProductCard;