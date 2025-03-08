import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  Tooltip,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  alpha,
  Slide
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { motion } from 'framer-motion';
import MusicVisualizer from './MusicVisualizer';

// Format time helper
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * MiniPlayer component - A persistent mini player that shows when navigating away from the Music tab
 */
const MiniPlayer = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  const { 
    currentSong, 
    isPlaying, 
    currentTime,
    queue,
    togglePlay,
    playNextSong,
    playPreviousSong,
    setShowMiniPlayer
  } = useMusicPlayer();
  
  // If no song is playing, don't show the mini player
  if (!currentSong) {
    return null;
  }
  
  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1200,
          width: expanded ? 320 : 250,
          transition: 'all 0.3s ease',
          borderRadius: expanded ? 2 : 40,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #7228e6, #3d2a76)',
            color: 'white',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s',
            '&:hover': {
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            }
          }}
        >
          {/* Animated background */}
          <Box
            component="div"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              zIndex: 0,
              opacity: 0.4
            }}
          >
            <Box
              component={motion.div}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              sx={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                backgroundImage: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%)',
                backgroundSize: '100% 100%',
                transform: 'rotate(0deg)',
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {/* Album Art */}
            <CardMedia
              component="img"
              sx={{ 
                width: 60, 
                height: 60,
                opacity: isPlaying ? 1 : 0.7,
                transition: 'all 0.3s'
              }}
              image={currentSong.thumbnail}
              alt={currentSong.title}
            />
            
            {/* Song Info */}
            <CardContent sx={{ flex: '1 0 auto', py: 1, pr: expanded ? 1 : 5 }}>
              <Typography variant="subtitle2" noWrap fontWeight="medium">
                {currentSong.title}
              </Typography>
              <Typography variant="caption" color="white" sx={{ opacity: 0.7 }} noWrap>
                {currentSong.artist}
              </Typography>
              
              {expanded && (
                <Box sx={{ mt: 1, height: 30 }}>
                  <MusicVisualizer type="bars" height={30} color="#ffffff" />
                </Box>
              )}
            </CardContent>
            
            {/* Controls */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              position: expanded ? 'relative' : 'absolute',
              right: expanded ? 0 : 8
            }}>
              {expanded && (
                <IconButton 
                  size="small" 
                  onClick={playPreviousSong}
                  sx={{ color: 'white' }}
                >
                  <SkipPreviousIcon />
                </IconButton>
              )}
              
              <IconButton
                onClick={togglePlay}
                sx={{ 
                  color: 'white', 
                  bgcolor: alpha(theme.palette.primary.light, 0.2),
                  mx: 1,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.light, 0.3),
                  }
                }}
                size={expanded ? 'medium' : 'small'}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              
              {expanded && (
                <IconButton 
                  size="small" 
                  onClick={playNextSong}
                  sx={{ color: 'white' }}
                >
                  <SkipNextIcon />
                </IconButton>
              )}
            </Box>
          </Box>
          
          {/* Expanded content */}
          {expanded && (
            <Box sx={{ p: 1, pt: 0 }}>
              {/* Progress bar */}
              <Box sx={{ 
                width: '100%', 
                height: 4, 
                bgcolor: alpha('white', 0.2),
                borderRadius: 2,
                mt: 1,
                position: 'relative'
              }}>
                <Box 
                  sx={{ 
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(currentTime / currentSong.duration) * 100}%`,
                    bgcolor: 'white',
                    borderRadius: 2,
                    transition: 'width 0.1s linear'
                  }} 
                />
              </Box>
              
              {/* Time indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="white" sx={{ opacity: 0.7 }}>
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" color="white" sx={{ opacity: 0.7 }}>
                  {formatTime(currentSong.duration)}
                </Typography>
              </Box>
              
              {/* Queue info */}
              {queue.length > 1 && (
                <Typography variant="caption" color="white" sx={{ opacity: 0.7, display: 'block', textAlign: 'center', mt: 1 }}>
                  Next: {queue[queue.findIndex(s => s.id === currentSong.id) + 1]?.title || "End of queue"}
                </Typography>
              )}
            </Box>
          )}
          
          {/* Control buttons */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              p: 0.5,
              bgcolor: alpha('#000000', 0.2)
            }}
          >
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              sx={{ color: 'white', opacity: 0.7 }}
            >
              {expanded ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
            </IconButton>
            
            <IconButton 
              size="small" 
              onClick={() => setShowMiniPlayer(false)}
              sx={{ color: 'white', opacity: 0.7 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      </Box>
    </Slide>
  );
};

export default MiniPlayer;