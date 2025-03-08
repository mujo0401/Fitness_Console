import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { FixedSizeList as VirtualizedList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ProductCard } from '../common';

/**
 * VirtualizedProductList component for efficiently displaying large product lists
 * Uses virtualization for performance
 * 
 * @param {Object} props
 * @param {Array} props.products - List of products to display
 * @param {boolean} props.loading - Whether the products are loading
 * @param {Function} props.onAddToCart - Callback when adding to cart
 * @param {Function} props.onSaveForLater - Callback when saving for later
 * @param {number} props.itemHeight - Height of each product item
 * @param {number} props.overscanCount - Number of items to render beyond visible area
 */
const VirtualizedProductList = ({ 
  products = [], 
  loading = false, 
  onAddToCart, 
  onSaveForLater,
  itemHeight = 350,
  overscanCount = 5
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render a product item
  const ItemRenderer = ({ index, style }) => {
    const product = products[index];
    
    return (
      <Box style={style} sx={{ px: 1 }}>
        <ProductCard 
          product={product}
          featured={product.featured}
          onAddToCart={onAddToCart}
          onSaveForLater={onSaveForLater}
          sx={{ mb: 2 }}
        />
      </Box>
    );
  };
  
  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <VirtualizedList
            height={height}
            width={width}
            itemCount={products.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
          >
            {ItemRenderer}
          </VirtualizedList>
        )}
      </AutoSizer>
    </Box>
  );
};

export default VirtualizedProductList;