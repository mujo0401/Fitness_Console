import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  CardContent, 
  IconButton, 
  Slider, 
  Tooltip,
  useTheme
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import MusicVisualizer from './MusicVisualizer';
import '../../styles/MusicPlayer.css';

// Helper function to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const NowPlaying = ({ onToggleLike }) => {
  const theme = useTheme();
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    volume, 
    muted, 
    repeatMode, 
    shuffleEnabled,
    togglePlay,
    playNextSong,
    playPreviousSong,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    toggleShuffle,
    toggleRepeat
  } = useMusicPlayer();
  
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  return (
    <Box 
      className="music-player-container"
      sx={{ 
        background: `linear-gradient(145deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background glow effect */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          opacity: isPlaying ? 1 : 0.5,
          transition: 'opacity 1s ease',
          zIndex: 0
        }}
      />
      
      {/* Album art */}
      <Box 
        sx={{ 
          pt: 4,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSong?.id || 'no-song'}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ 
              opacity: 1, 
              rotateY: 0,
              rotate: isPlaying ? [0, 360] : 0
            }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ 
              duration: 0.5,
              rotate: { 
                duration: 20,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop"
              }
            }}
            className="album-cover-animate"
            style={{
              width: '75%',
              maxWidth: 280,
              aspectRatio: '1/1',
              overflow: 'hidden',
              borderRadius: '50%',
              marginBottom: 20
            }}
          >
            {currentSong ? (
              <Box 
                component="img"
                src={currentSong.thumbnail}
                alt={currentSong.title}
                sx={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box 
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.3)'
                }}
              >
                <MusicNoteIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.3)' }} />
              </Box>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
      
      {/* Song info */}
      <CardContent sx={{ color: 'white', position: 'relative', zIndex: 1 }}>
        <Typography variant="h6" align="center" fontWeight="bold" noWrap>
          {currentSong ? currentSong.title : 'No song selected'}
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ opacity: 0.8 }} noWrap>
          {currentSong ? currentSong.artist : 'Select a song to play'}
        </Typography>
        
        {currentSong && (
          <>
            {/* Music visualizer */}
            <Box sx={{ mt: 2 }}>
              <MusicVisualizer 
                type="waveform" 
                color={isPlaying ? '#ffffff' : 'rgba(255,255,255,0.5)'} 
              />
            </Box>
            
            {/* Seek bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.7, width: 40, textAlign: 'right' }}>
                {formatTime(Math.floor(currentTime))}
              </Typography>
              <Slider
                value={currentTime}
                min={0}
                max={currentSong.duration}
                onChange={(_, value) => handleSeek(value)}
                sx={{ 
                  color: 'white',
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    transition: '0.2s',
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(255,255,255,0.16)'
                    }
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.3
                  }
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.7, width: 40 }}>
                {formatTime(currentSong.duration)}
              </Typography>
            </Box>
          </>
        )}
        
        {/* Playback controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, gap: 1 }}>
          <IconButton 
            onClick={toggleShuffle} 
            sx={{ 
              color: shuffleEnabled ? theme.palette.secondary.light : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s'
            }}
          >
            <ShuffleIcon />
          </IconButton>
          <IconButton 
            onClick={playPreviousSong} 
            sx={{ 
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            <SkipPreviousIcon fontSize="large" />
          </IconButton>
          <IconButton 
            onClick={togglePlay} 
            sx={{ 
              color: 'white', 
              bgcolor: 'rgba(255,255,255,0.2)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'scale(1.1)'
              },
              p: 1.5
            }}
          >
            {isPlaying ? (
              <PauseIcon fontSize="large" />
            ) : (
              <PlayArrowIcon fontSize="large" />
            )}
          </IconButton>
          <IconButton 
            onClick={playNextSong} 
            sx={{ 
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            <SkipNextIcon fontSize="large" />
          </IconButton>
          <IconButton 
            onClick={toggleRepeat} 
            sx={{ 
              color: repeatMode !== 'none' ? theme.palette.secondary.light : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s'
            }}
          >
            {repeatMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
          </IconButton>
        </Box>
        
        {/* Volume and like controls */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mt: 2,
          position: 'relative'
        }}>
          <Box sx={{ position: 'relative' }}>
            <IconButton 
              onClick={toggleMute} 
              onMouseEnter={() => setShowVolumeSlider(true)}
              sx={{ color: 'white' }}
            >
              {muted ? <VolumeOffIcon /> : 
               volume < 30 ? <VolumeDownIcon /> : <VolumeUpIcon />}
            </IconButton>
            
            {showVolumeSlider && (
              <Box 
                className="volume-slider-container"
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Slider
                  orientation="vertical"
                  value={muted ? 0 : volume}
                  onChange={(_, value) => handleVolumeChange(value)}
                  min={0}
                  max={100}
                  sx={{ 
                    height: 100,
                    color: 'white',
                    '& .MuiSlider-rail': {
                      opacity: 0.3
                    }
                  }}
                  size="small"
                />
              </Box>
            )}
          </Box>
          
          {currentSong && (
            <Tooltip title={currentSong.liked ? "Remove from favorites" : "Add to favorites"}>
              <IconButton 
                onClick={() => onToggleLike(currentSong.id)} 
                sx={{ 
                  color: currentSong.liked ? theme.palette.error.light : 'white', 
                  ml: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              >
                {currentSong.liked ? (
                  <FavoriteIcon sx={{ 
                    animation: currentSong.liked ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }} />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
          
          {currentSong && currentSong.bpm && (
            <Tooltip title={`Song BPM: ${currentSong.bpm}`}>
              <Box 
                sx={{ 
                  ml: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {currentSong.bpm} BPM
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Box>
  );
};

export default NowPlaying;