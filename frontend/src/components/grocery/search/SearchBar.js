import React, { useRef } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton,
  Box,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * SearchBar component for product search
 * Includes input field with search and clear buttons
 * 
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Callback for search value change
 * @param {Function} props.onClear - Callback when search is cleared
 * @param {string} props.placeholder - Placeholder text for the search field
 * @param {boolean} props.fullWidth - Whether the search field takes full width
 */
const SearchBar = ({ 
  value = '', 
  onChange, 
  onClear,
  placeholder = 'Search for groceries, ingredients...',
  fullWidth = true,
  variant = 'outlined',
  children,
  elevation = 0,
  ...props
}) => {
  const inputRef = useRef(null);
  
  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const searchField = (
    <TextField
      fullWidth={fullWidth}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      inputRef={inputRef}
      variant={variant}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={handleClear}
              aria-label="Clear search"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
        sx: { borderRadius: 2 }
      }}
      {...props}
    />
  );
  
  // If no children and no elevation, just return the TextField
  if (!children && elevation === 0) {
    return searchField;
  }
  
  // Otherwise, wrap in Paper with children
  return (
    <Paper sx={{ p: 2 }} elevation={elevation}>
      {searchField}
      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Paper>
  );
};

export default SearchBar;