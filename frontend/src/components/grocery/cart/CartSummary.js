import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

/**
 * CartSummary component for displaying cart totals and checkout button
 * 
 * @param {Object} props
 * @param {Object} props.totals - Cart totals (subtotal, tax, deliveryFee, total)
 * @param {boolean} props.loading - Whether checkout is loading
 * @param {Function} props.onCheckout - Callback when checkout button is clicked
 * @param {boolean} props.disabled - Whether checkout is disabled
 * @param {string} props.checkoutLabel - Label for the checkout button
 */
const CartSummary = ({
  totals = { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 },
  loading = false,
  onCheckout,
  disabled = false,
  checkoutLabel = 'Checkout',
  deliveryOptionText = null
}) => {
  return (
    <Paper 
      sx={{ 
        p: 2, 
        position: 'sticky', 
        top: 24, 
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      
      {/* Totals breakdown */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Subtotal:</Typography>
          <Typography>${totals.subtotal.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Delivery Fee:</Typography>
          <Typography>${totals.deliveryFee.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Tax:</Typography>
          <Typography>${totals.tax.toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" color="primary.main">
            ${totals.total.toFixed(2)}
          </Typography>
        </Box>
      </Box>
      
      {/* Delivery option info if provided */}
      {deliveryOptionText && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {deliveryOptionText}
        </Typography>
      )}
      
      {/* Checkout button */}
      <Button 
        variant="contained" 
        color="primary"
        fullWidth
        size="large"
        sx={{ py: 1.5, borderRadius: 2 }}
        onClick={onCheckout}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LocalShippingIcon />}
      >
        {loading ? 'Processing...' : checkoutLabel}
      </Button>
    </Paper>
  );
};

export default CartSummary;