import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Button,
  Slider,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import { musicGenres } from '../../constants/genres';

/**
 * Drawer for music filtering options
 * @param {boolean} open - Whether drawer is open
 * @param {function} onClose - Function to close drawer
 * @param {Array} selectedGenres - Currently selected genres
 * @param {function} toggleGenre - Function to toggle genre selection
 * @param {number} targetBpm - Target BPM
 * @param {function} setTargetBpm - Function to update target BPM
 * @param {boolean} showRockBands - Whether rock bands view is shown
 * @param {function} toggleRockBandsView - Function to toggle rock bands view
 * @returns {JSX.Element} - Rendered component
 */
const FilterDrawer = ({
  open,
  onClose,
  selectedGenres,
  toggleGenre,
  targetBpm,
  setTargetBpm,
  showRockBands,
  toggleRockBandsView
}) => {
  const theme = useTheme();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '85%', sm: 400 },
          background: 'linear-gradient(135deg, #1e123a, #0d1528)',
          color: 'white',
          boxShadow: '5px 0 25px rgba(0,0,0,0.5)'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon /> Music Filters
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Genres</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {musicGenres.map(genre => (
            <Chip
              key={genre}
              label={genre}
              onClick={() => toggleGenre(genre)}
              sx={{ 
                mb: 1,
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
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>BPM Range</Typography>
          <Slider
            value={targetBpm}
            min={60}
            max={200}
            step={5}
            onChange={(_, value) => setTargetBpm(value)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value} BPM`}
            sx={{ 
              color: theme.palette.primary.main,
              '& .MuiSlider-valueLabel': {
                bgcolor: theme.palette.primary.main
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Slow (60 BPM)
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Fast (200 BPM)
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Special Collections</Typography>
          <Button
            variant={showRockBands ? "contained" : "outlined"}
            color="primary"
            onClick={toggleRockBandsView}
            sx={{ mr: 1, mb: 1 }}
          >
            Rock Bands
          </Button>
          <Button
            variant="outlined"
            sx={{ 
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white'
              },
              mr: 1,
              mb: 1
            }}
            onClick={() => {
              if (!selectedGenres.includes('Workout')) toggleGenre('Workout');
              if (!selectedGenres.includes('Motivation')) toggleGenre('Motivation');
              onClose();
            }}
          >
            Workout Mix
          </Button>
          <Button
            variant="outlined"
            sx={{ 
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white'
              },
              mr: 1,
              mb: 1
            }}
            onClick={() => {
              if (!selectedGenres.includes('Chill')) toggleGenre('Chill');
              onClose();
            }}
          >
            Relaxation
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;