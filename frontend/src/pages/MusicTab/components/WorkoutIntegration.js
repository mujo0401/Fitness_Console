import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import SportsIcon from '@mui/icons-material/Sports';
import { useMusicPlayer } from '../../../context/MusicPlayerContext';
import { useWorkoutPlan } from '../../../context/WorkoutPlanContext';

/**
 * Component for integrating music with workouts
 * @param {boolean} syncWithWorkout - Whether music is synced with workout
 * @param {boolean} enableBpmSync - Whether BPM sync is enabled
 * @param {string} currentWorkoutType - Current workout type
 * @param {number} targetBpm - Target BPM for workout
 * @param {Array} workoutSuggestions - Suggested songs for workout
 * @param {function} toggleWorkoutSync - Function to toggle workout sync
 * @param {function} handleBpmSyncToggle - Function to toggle BPM sync
 * @param {function} setShowWorkoutModal - Function to show/hide workout modal
 * @returns {JSX.Element} - Rendered component
 */
const WorkoutIntegration = ({
  syncWithWorkout,
  enableBpmSync,
  currentWorkoutType,
  targetBpm,
  workoutSuggestions,
  toggleWorkoutSync,
  handleBpmSyncToggle,
  setShowWorkoutModal
}) => {
  const theme = useTheme();
  const { todaysWorkout } = useWorkoutPlan();
  const { currentSong, playSong } = useMusicPlayer();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Box 
        sx={{ 
          mt: 3, 
          p: 2, 
          borderRadius: 3,
          background: 'linear-gradient(145deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.1))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SportsIcon />
          <Typography variant="h6">Workout Integration</Typography>
        </Box>
        
        <FormControlLabel
          control={
            <Switch 
              checked={syncWithWorkout}
              onChange={toggleWorkoutSync}
              sx={{ 
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.success.main
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.palette.success.main
                }
              }}
            />
          }
          label="Sync with Current Workout"
          sx={{ color: 'white' }}
        />
        
        <FormControlLabel
          control={
            <Switch 
              checked={enableBpmSync}
              onChange={handleBpmSyncToggle}
              disabled={!syncWithWorkout}
              sx={{ 
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.success.main
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.palette.success.main
                }
              }}
            />
          }
          label="Match Music BPM to Workout"
          sx={{ 
            color: !syncWithWorkout ? 'rgba(255,255,255,0.5)' : 'white',
            transition: 'color 0.3s'
          }}
        />
        
        {currentWorkoutType && syncWithWorkout && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
              Current Workout: <b>{currentWorkoutType.charAt(0).toUpperCase() + currentWorkoutType.slice(1)}</b>
            </Typography>
            
            {enableBpmSync && (
              <Typography variant="body2" sx={{ opacity: 0.8 }} gutterBottom>
                Target BPM: <b>{targetBpm}</b>
              </Typography>
            )}
            
            {workoutSuggestions.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                  Recommended Music:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {workoutSuggestions.map((song) => (
                    <Chip
                      key={song.id}
                      label={song.title}
                      onClick={() => playSong(song)}
                      variant={currentSong && currentSong.id === song.id ? "filled" : "outlined"}
                      size="small"
                      color="primary"
                      sx={{ 
                        mb: 0.5,
                        background: currentSong && currentSong.id === song.id 
                          ? 'linear-gradient(45deg, #7229e6, #4169e1)' 
                          : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: 'none',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #8342e9, #5d7fe5)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}
        
        <Button
          variant="contained"
          color="success"
          fullWidth
          sx={{ 
            mt: 2,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
          startIcon={<SportsIcon />}
          onClick={() => setShowWorkoutModal(true)}
          disabled={!todaysWorkout}
        >
          Create Workout Playlist
        </Button>
      </Box>
    </motion.div>
  );
};

export default WorkoutIntegration;