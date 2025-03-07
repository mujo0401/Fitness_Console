import React from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  InputAdornment,
  IconButton, 
  Chip,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../../context/AuthContext';

/**
 * Header component for the Music Tab
 * @param {string} searchTerm - Current search term
 * @param {function} setSearchTerm - Function to update search term
 * @param {function} setFiltersOpen - Function to open/close filters drawer
 * @param {function} setQueueOpen - Function to open/close queue drawer
 * @returns {JSX.Element} - Rendered component
 */
const MusicHeader = ({ searchTerm, setSearchTerm, setFiltersOpen, setQueueOpen }) => {
  const theme = useTheme();
  const { connectedServices, loginYouTubeMusic } = useAuth();

  return (
    <Box className="music-header" sx={{ mb: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
              background: 'linear-gradient(90deg, #fff, #a3a3ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Music Player
          </Typography>
          
          {/* YouTube Music Connect Button */}
          {!connectedServices.youtubeMusic && (
            <IconButton
              onClick={loginYouTubeMusic}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                },
                mx: 1
              }}
              aria-label="Connect YouTube Music"
              title="Connect YouTube Music"
            >
              <LoginIcon />
            </IconButton>
          )}
          
          {connectedServices.youtubeMusic && (
            <Chip 
              label="YouTube Music Connected" 
              color="success" 
              variant="outlined"
              icon={<CheckCircleIcon />} 
              sx={{ fontWeight: 'medium' }}
            />
          )}
        </Box>
        
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
          Discover music that moves with your workout
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search artists, songs, genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            className="search-bar"
            InputProps={{
              className: "search-input",
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchTerm('')}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ 
              flexGrow: 1, 
              maxWidth: { xs: '100%', sm: 350 }
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              color="primary" 
              onClick={() => setFiltersOpen(true)}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <TuneIcon />
            </IconButton>
            
            <IconButton 
              color="primary" 
              onClick={() => setQueueOpen(true)}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <QueueMusicIcon />
            </IconButton>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default MusicHeader;