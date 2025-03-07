import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { useMusicPlayer } from '../../../context/MusicPlayerContext';
import formatTime from '../utils/formatTime';

/**
 * Drawer component for music queue
 * @param {boolean} open - Whether drawer is open
 * @param {function} onClose - Function to close drawer
 * @param {function} setAlertMessage - Function to set alert message
 * @param {function} setAlertSeverity - Function to set alert severity
 * @param {function} setAlertOpen - Function to open/close alert
 * @returns {JSX.Element} - Rendered component
 */
const QueueDrawer = ({
  open,
  onClose,
  setAlertMessage,
  setAlertSeverity,
  setAlertOpen
}) => {
  const { queue, currentSong, playSong, removeFromQueue, clearQueue } = useMusicPlayer();

  /**
   * Create a playlist from current queue
   */
  const createPlaylistFromQueue = () => {
    // In a real app, this would send a request to create a playlist
    setAlertMessage('Playlist created from queue!');
    setAlertSeverity('success');
    setAlertOpen(true);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '85%', sm: 400 },
          background: 'linear-gradient(135deg, #1e123a, #0d1528)',
          color: 'white',
          boxShadow: '-5px 0 25px rgba(0,0,0,0.5)'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QueueMusicIcon /> Current Queue
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      {queue.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="rgba(255,255,255,0.7)">Queue is empty</Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.5)" sx={{ mt: 1 }}>
            Add songs to your queue to get started
          </Typography>
        </Box>
      ) : (
        <Box>
          <List sx={{ pb: 7 }} className="song-list-container">
            {queue.map((song, index) => (
              <React.Fragment key={`${song.id}-${index}`}>
                <ListItem
                  sx={{ 
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)'
                    },
                    ...(currentSong && currentSong.id === song.id ? {
                      bgcolor: 'rgba(255,255,255,0.1)'
                    } : {})
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="remove" 
                      onClick={() => removeFromQueue(song.id)}
                      size="small"
                      sx={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={song.thumbnail} 
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={song.title} 
                    secondary={
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {song.artist} • {formatTime(song.duration)}
                      </Typography>
                    }
                    primaryTypographyProps={{
                      noWrap: true,
                      sx: {
                        color: 'white',
                        fontWeight: currentSong && currentSong.id === song.id ? 'bold' : 'normal'
                      }
                    }}
                    onClick={() => playSong(song)}
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItem>
                {index < queue.length - 1 && <Divider variant="inset" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />}
              </React.Fragment>
            ))}
          </List>
          
          <Box 
            sx={{ 
              position: 'fixed', 
              bottom: 0, 
              right: 0,
              left: 0,
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              bgcolor: 'rgba(10,10,20,0.8)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Button 
              onClick={createPlaylistFromQueue}
              variant="outlined"
              sx={{ 
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              Save as Playlist
            </Button>
            
            <Button 
              onClick={clearQueue}
              color="error"
              variant="text"
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Clear
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default QueueDrawer;