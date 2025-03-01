// Mobile optimization utilities for Material UI

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create and export a responsive theme
const createResponsiveTheme = (baseTheme) => {
  // First create the theme with base settings
  let theme = createTheme(baseTheme);
  
  // Then apply responsive font sizes
  theme = responsiveFontSizes(theme, {
    breakpoints: ['xs', 'sm', 'md', 'lg', 'xl'],
    factor: 2, // Higher factor = bigger variation between sizes
  });
  
  // Add explicit mobile overrides
  theme.components = {
    ...theme.components,
    // Make buttons more mobile-friendly
    MuiButton: {
      styleOverrides: {
        root: {
          [theme.breakpoints.down('sm')]: {
            padding: '6px 12px',
            fontSize: '0.8125rem',
          },
          ...((theme.components?.MuiButton?.styleOverrides?.root) || {})
        },
      },
    },
    // Smaller padding in cards on mobile
    MuiCard: {
      styleOverrides: {
        root: {
          [theme.breakpoints.down('sm')]: {
            padding: '12px',
          },
          ...((theme.components?.MuiCard?.styleOverrides?.root) || {})
        },
      },
    },
    // More compact tabs on mobile
    MuiTab: {
      styleOverrides: {
        root: {
          [theme.breakpoints.down('sm')]: {
            minWidth: 'auto',
            padding: '6px 10px',
            fontSize: '0.75rem',
          },
          ...((theme.components?.MuiTab?.styleOverrides?.root) || {})
        },
      },
    },
    // Less padding in containers on mobile
    MuiContainer: {
      styleOverrides: {
        root: {
          [theme.breakpoints.down('sm')]: {
            padding: '12px !important',
          },
          ...((theme.components?.MuiContainer?.styleOverrides?.root) || {})
        },
      },
    },
    // Better display of tables on mobile
    MuiTable: {
      styleOverrides: {
        root: {
          [theme.breakpoints.down('sm')]: {
            display: 'block',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          },
          ...((theme.components?.MuiTable?.styleOverrides?.root) || {})
        },
      },
    },
  };
  
  return theme;
};

export default createResponsiveTheme;