import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { ProductCard } from '../common';

/**
 * ProductGrid component for displaying a grid of products
 * 
 * @param {Object} props
 * @param {Array} props.products - List of products to display
 * @param {boolean} props.loading - Whether the products are loading
 * @param {Function} props.onAddToCart - Callback when adding to cart
 * @param {Function} props.onSaveForLater - Callback when saving for later
 * @param {string} props.title - Optional title for the grid
 * @param {Object} props.emptyMessage - Message to display when there are no products
 */
const ProductGrid = ({ 
  products = [], 
  loading = false, 
  onAddToCart, 
  onSaveForLater,
  title,
  emptyMessage = "No products found",
  xs = 12,
  sm = 6, 
  md = 4,
  lg = 3,
  showRating = true,
  showNutrition = true
}) => {
  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Empty state
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      )}
      
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={xs} sm={sm} md={md} lg={lg} key={product.id}>
            <ProductCard 
              product={product}
              featured={product.featured}
              onAddToCart={onAddToCart}
              onSaveForLater={onSaveForLater}
              showRating={showRating}
              showNutrition={showNutrition}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductGrid;