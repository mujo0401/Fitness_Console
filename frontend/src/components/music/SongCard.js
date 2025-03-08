import React from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  IconButton,
  Chip,
  useTheme
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { motion } from 'framer-motion';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import '../../styles/MusicPlayer.css';

// Helper function to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SongCard = ({ song, onToggleLike }) => {
  const theme = useTheme();
  const { playSong, addToQueue } = useMusicPlayer();
  
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="song-card">
        <Box className="song-card-media">
          <CardMedia
            component="img"
            image={song.thumbnail || song.fallbackThumbnail || `https://dummyimage.com/300x300/blue/fff.png&text=${encodeURIComponent(song.artist || 'Music')}`}
            alt={song.title}
            sx={{ aspectRatio: '16/9', objectFit: 'cover' }}
            onError={(e) => {
              // If primary thumbnail fails, try fallback or use a generated one
              if (song.fallbackThumbnail && e.target.src !== song.fallbackThumbnail) {
                e.target.src = song.fallbackThumbnail;
              } else {
                // Generate a simple colored placeholder
                const colorIndex = (song.title?.charCodeAt(0) || 0) % 6;
                const colors = ['blue', 'red', 'yellow', 'green', 'purple', 'orange'];
                const color = colors[colorIndex];
                e.target.src = `https://dummyimage.com/300x300/${color}/fff.png&text=${encodeURIComponent(song.artist || 'Music')}`;
              }
            }}
          />
          <Box className="song-card-overlay" />
          <Box 
            className="song-card-play-button"
            onClick={() => playSong(song)}
          >
            <PlayArrowIcon fontSize="large" sx={{ color: 'white' }} />
          </Box>
        </Box>
        <CardContent className="song-card-content">
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {song.title}
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)" noWrap>
            {song.artist}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mt: 1 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton 
                size="small" 
                onClick={() => onToggleLike(song.id)}
                sx={{ color: song.liked ? theme.palette.error.light : 'rgba(255,255,255,0.6)' }}
              >
                {song.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => addToQueue(song)}
                sx={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <QueueMusicIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="rgba(255,255,255,0.5)">
                {formatTime(song.duration)}
              </Typography>
              {song.bpm && (
                <Chip 
                  label={`${song.bpm} BPM`} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.625rem',
                    background: 'rgba(255,255,255,0.1)', 
                    color: 'white' 
                  }} 
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SongCard;