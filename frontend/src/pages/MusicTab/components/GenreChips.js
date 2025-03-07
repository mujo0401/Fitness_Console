import React from 'react';
import { Box, Chip } from '@mui/material';
import { musicGenres } from '../constants/genres';

/**
 * Component to display and select music genres
 * @param {Array} selectedGenres - Currently selected genres
 * @param {function} toggleGenre - Function to toggle genre selection
 * @returns {JSX.Element} - Rendered component
 */
const GenreChips = ({ selectedGenres, toggleGenre }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 1, 
      mb: 3,
      px: 1
    }}>
      {/* Display first 8 genres to avoid overcrowding */}
      {musicGenres.slice(0, 8).map(genre => (
        <Chip
          key={genre}
          label={genre}
          onClick={() => toggleGenre(genre)}
          className={`genre-chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
          sx={{
            bgcolor: selectedGenres.includes(genre) 
              ? 'primary.main' 
              : 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': {
              bgcolor: selectedGenres.includes(genre) 
                ? 'primary.dark' 
                : 'rgba(255,255,255,0.2)',
            }
          }}
        />
      ))}
      
      {/* Clear Filters button */}
      {selectedGenres.length > 0 && (
        <Chip
          label="Clear Filters"
          onClick={() => {
            // Reset all selected genres
            selectedGenres.forEach(genre => toggleGenre(genre));
          }}
          size="small"
          sx={{ 
            ml: 1,
            bgcolor: 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            }
          }}
        />
      )}
    </Box>
  );
};

export default GenreChips;