import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  useTheme
} from '@mui/material';
import { useWorkoutPlan } from '../../../../context/WorkoutPlanContext';

/**
 * Dialog for creating workout playlists
 * @param {boolean} open - Whether dialog is open
 * @param {function} onClose - Function to close dialog
 * @param {boolean} enableBpmSync - Whether BPM sync is enabled
 * @param {number} targetBpm - Target BPM for workout
 * @param {function} handleBpmSyncToggle - Function to toggle BPM sync
 * @param {function} createWorkoutPlaylist - Function to create workout playlist
 * @returns {JSX.Element} - Rendered component
 */
const WorkoutMusicDialog = ({
  open,
  onClose,
  enableBpmSync,
  targetBpm,
  handleBpmSyncToggle,
  createWorkoutPlaylist
}) => {
  const theme = useTheme();
  const { todaysWorkout } = useWorkoutPlan();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1a0e2f',
          color: 'white',
          borderRadius: 3,
          backgroundImage: 'linear-gradient(to bottom right, rgba(114, 41, 230, 0.1), rgba(255, 255, 255, 0.05))'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: theme.palette.success.main, color: 'white' }}>
        Create Workout Playlist
      </DialogTitle>
      <DialogContent>
        {!todaysWorkout ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              No workout planned for today.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Go to the Exercise Coach tab to set up a workout plan.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
            <Typography variant="h6" gutterBottom color="white">
              {todaysWorkout.name}
            </Typography>
            <Typography variant="body1" paragraph color="white">
              Workout Type: <b>{todaysWorkout.type}</b>
            </Typography>
            <Typography variant="body2" paragraph sx={{ color: 'rgba(255,255,255,0.7)' }}>
              We'll create a music playlist optimized for your {todaysWorkout.type.toLowerCase()} workout, 
              with tracks that match the intensity and rhythm of your exercise.
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={enableBpmSync}
                    onChange={handleBpmSyncToggle}
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
                label="Match Music BPM to Workout Intensity"
                sx={{ color: 'white' }}
              />
            </Box>
            
            {enableBpmSync && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
                <Typography variant="body2" color="white">
                  Target BPM: <b>{targetBpm}</b>
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mt: 0.5 }}>
                  BPM (Beats Per Minute) will be matched to your workout intensity
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={createWorkoutPlaylist}
          disabled={!todaysWorkout}
          color="success"
        >
          Create Playlist
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkoutMusicDialog;