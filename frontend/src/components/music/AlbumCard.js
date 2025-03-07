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
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { motion } from 'framer-motion';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import '../../styles/MusicPlayer.css';

const AlbumCard = ({ album, showArtist = true }) => {
  const theme = useTheme();
  const { playAlbum, addAlbumToQueue } = useMusicPlayer();
  
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card 
        className="playlist-card" 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.dark}99, ${theme.palette.primary.main}66)`,
          height: '100%'
        }}
      >
        <Box className="playlist-image-container">
          <CardMedia
            component="img"
            className="playlist-image"
            image={album.coverArt}
            alt={album.title}
          />
          <Box 
            className="playlist-overlay"
            sx={{ 
              background: `linear-gradient(to top, ${theme.palette.primary.dark}E6, transparent)`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
              {album.title}
            </Typography>
            {showArtist && (
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                {album.artist}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <IconButton 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': { bgcolor: theme.palette.primary.main }
                }}
                onClick={() => playAlbum(album.id)}
              >
                <PlayArrowIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  '&:hover': { bgcolor: theme.palette.secondary.main }
                }}
                onClick={() => addAlbumToQueue(album.id)}
              >
                <QueueMusicIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <CardContent sx={{ pt: 1, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip 
              label={`${album.year}`} 
              size="small" 
              sx={{ 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white',
                mr: 1
              }} 
            />
            <Typography variant="body2">
              {album.tracks.length} tracks
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AlbumCard;