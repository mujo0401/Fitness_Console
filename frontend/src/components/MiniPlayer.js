import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Paper, Avatar } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import CloseIcon from '@mui/icons-material/Close';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { formatTime } from '../utils/formatTime';

const MiniPlayer = () => {
  const { 
    currentSong, 
    isPlaying,
    currentTime,
    togglePlay, 
    playNextSong, 
    playPreviousSong,
    setMiniPlayerVisible
  } = useMusicPlayer();

  if (!currentSong) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 70, // Increased to avoid footer overlap
        right: 16,
        width: 320,
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 1,
        backdropFilter: 'blur(10px)',
        background: 'rgba(30, 30, 45, 0.85)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
    >
      <Avatar
        src={currentSong.thumbnail}
        alt={currentSong.title}
        variant="rounded"
        sx={{ width: 56, height: 56, mr: 1 }}
      />
      
      <Box sx={{ flexGrow: 1, overflow: 'hidden', mr: 1 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'medium' }}>
          {currentSong.title}
        </Typography>
        <Typography variant="caption" noWrap sx={{ opacity: 0.8 }}>
          {currentSong.artist}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Box 
            sx={{ 
              height: 3, 
              width: '100%', 
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: 1,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${currentSong?.duration ? (currentTime / currentSong.duration) * 100 : 0}%`,
                bgcolor: '#3f51b5',
                borderRadius: 1
              }}
            />
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          size="small" 
          onClick={playPreviousSong}
          sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
        >
          <SkipPreviousIcon fontSize="small" />
        </IconButton>
        
        <IconButton
          onClick={togglePlay}
          sx={{ 
            color: 'white', 
            mx: 0.5,
            '&:hover': { 
              bgcolor: 'rgba(255,255,255,0.1)' 
            }
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        
        <IconButton 
          size="small" 
          onClick={playNextSong}
          sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
        >
          <SkipNextIcon fontSize="small" />
        </IconButton>
        
        <IconButton 
          size="small" 
          onClick={() => setMiniPlayerVisible(false)}
          sx={{ color: 'white', opacity: 0.6, '&:hover': { opacity: 1 }, ml: 0.5 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MiniPlayer;