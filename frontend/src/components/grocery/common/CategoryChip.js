import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Reusable CategoryChip component for displaying and selecting categories
 * 
 * @param {Object} props
 * @param {string} props.label - Text to display on the chip
 * @param {string} props.icon - Optional icon to display
 * @param {boolean} props.selected - Whether the chip is selected
 * @param {Function} props.onClick - Callback when the chip is clicked
 * @param {string} props.color - Color of the chip
 */
const CategoryChip = ({ 
  label, 
  icon, 
  selected = false, 
  onClick,
  color = 'primary',
  ...rest
}) => {
  return (
    <StyledChip
      label={icon ? `${icon} ${label}` : label}
      onClick={onClick}
      selected={selected}
      color={selected ? color : 'default'}
      variant={selected ? 'filled' : 'outlined'}
      {...rest}
    />
  );
};

// Styled component
const StyledChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 600,
  ...(selected && {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  })
}));

export default CategoryChip;