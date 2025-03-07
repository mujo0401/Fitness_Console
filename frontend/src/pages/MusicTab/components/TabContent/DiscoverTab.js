import React from 'react';
import { Typography, Grid, Box, CircularProgress } from '@mui/material';
import SongCard from '../../../../components/music/SongCard';

/**
 * Discover tab content component
 * @param {string} searchTerm - Current search term
 * @param {Array} filteredSongs - Filtered songs to display
 * @param {function} toggleLike - Function to toggle like status
 * @param {boolean} loading - Whether content is loading
 * @returns {JSX.Element} - Rendered component
 */
const DiscoverTab = ({ searchTerm, filteredSongs, toggleLike, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }
  
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
        {searchTerm ? `Search Results: "${searchTerm}"` : 'Top Music for Workouts'}
      </Typography>
      <Grid container spacing={2}>
        {filteredSongs.map(song => (
          <Grid item xs={12} sm={6} md={4} lg={4} xl={3} key={song.id}>
            <SongCard song={song} onToggleLike={toggleLike} />
          </Grid>
        ))}
        
        {filteredSongs.length === 0 && (
          <Grid item xs={12}>
            <Box 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'white'
              }}
            >
              <Typography>No songs found matching your criteria.</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default DiscoverTab;