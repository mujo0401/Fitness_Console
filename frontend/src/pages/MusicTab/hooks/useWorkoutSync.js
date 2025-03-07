import { useState, useEffect, useCallback } from 'react';
import { useWorkoutPlan } from '../../../context/WorkoutPlanContext';
import { useMusicPlayer } from '../../../context/MusicPlayerContext';
import { mockSongs } from '../constants/mockSongs';
import { workoutMusicRecommendations } from '../constants/mockPlaylists';
import { getRecommendedBpmForWorkout, filterSongsByBpm } from '../utils/bpmCalculator';
import { getWorkoutRecommendations } from '../api/musicApiClient';

/**
 * Custom hook for workout music synchronization
 * @param {function} setAlertMessage - Function to set alert message
 * @param {function} setAlertSeverity - Function to set alert severity
 * @param {function} setAlertOpen - Function to open/close alert
 * @returns {Object} - Workout sync state and functions
 */
const useWorkoutSync = (setAlertMessage, setAlertSeverity, setAlertOpen) => {
  const { todaysWorkout } = useWorkoutPlan();
  const { queue, setQueue, currentSong, playSong } = useMusicPlayer();
  
  // State for workout sync
  const [syncWithWorkout, setSyncWithWorkout] = useState(false);
  const [enableBpmSync, setEnableBpmSync] = useState(false);
  const [targetBpm, setTargetBpm] = useState(140);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [currentWorkoutType, setCurrentWorkoutType] = useState('');
  const [workoutSuggestions, setWorkoutSuggestions] = useState([]);

  /**
   * Toggle workout sync
   */
  const toggleWorkoutSync = (event) => {
    setSyncWithWorkout(event.target.checked);
    
    if (event.target.checked) {
      setShowWorkoutModal(true);
    }
  };

  /**
   * Handle BPM sync toggle
   */
  const handleBpmSyncToggle = useCallback((event) => {
    setEnableBpmSync(event.target.checked);
    
    if (event.target.checked && todaysWorkout) {
      // Set target BPM based on workout type
      const workoutType = todaysWorkout.type.toLowerCase();
      const recommendedBpm = getRecommendedBpmForWorkout(workoutType);
      
      setTargetBpm(recommendedBpm);
      
      // Filter songs by BPM (within +/- 10 BPM)
      const bpmFiltered = filterSongsByBpm(mockSongs, recommendedBpm);
      
      if (bpmFiltered.length > 0) {
        setQueue(bpmFiltered);
      }
    }
  }, [todaysWorkout, setQueue]);

  /**
   * Create a playlist for the current workout
   */
  const createWorkoutPlaylist = useCallback(async () => {
    if (!todaysWorkout) return;
    
    setShowWorkoutModal(false);
    
    const workoutType = todaysWorkout.type.toLowerCase();
    setCurrentWorkoutType(workoutType);
    
    try {
      // Try to get recommendations from API first
      const apiRecommendations = await getWorkoutRecommendations(workoutType);
      
      if (apiRecommendations && apiRecommendations.length > 0) {
        setQueue(apiRecommendations);
        setWorkoutSuggestions(apiRecommendations);
        
        // Start playing the first song
        if (apiRecommendations.length > 0) {
          playSong(apiRecommendations[0]);
        }
        
        setAlertMessage(`Created a ${workoutType} workout playlist!`);
        setAlertSeverity('success');
        setAlertOpen(true);
        return;
      }
      
      // Fallback to mock recommendations
      // Get recommended songs for this workout type
      const recommendations = workoutMusicRecommendations[workoutType] || [];
      if (recommendations.length > 0) {
        const suggestedSongs = recommendations
          .map(rec => ({
            ...mockSongs.find(song => song.id === rec.id),
            sortOrder: rec.sortOrder
          }))
          .filter(Boolean) // Remove any undefined items
          .sort((a, b) => a.sortOrder - b.sortOrder);
        
        setQueue(suggestedSongs);
        setWorkoutSuggestions(suggestedSongs);
        
        // Start playing the first song
        if (suggestedSongs.length > 0) {
          playSong(suggestedSongs[0]);
        }
        
        setAlertMessage(`Created a ${workoutType} workout playlist!`);
        setAlertSeverity('success');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('Error creating workout playlist:', error);
      setAlertMessage('Failed to create workout playlist: ' + error.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }, [
    todaysWorkout, 
    setQueue, 
    playSong, 
    setAlertMessage, 
    setAlertSeverity, 
    setAlertOpen
  ]);

  // Effect to sync with workout if enabled
  useEffect(() => {
    if (syncWithWorkout && todaysWorkout && todaysWorkout.type) {
      // Set current workout type
      const workoutType = todaysWorkout.type.toLowerCase();
      setCurrentWorkoutType(workoutType);
      
      // Get recommended songs for this workout type
      const recommendations = workoutMusicRecommendations[workoutType] || [];
      if (recommendations.length > 0) {
        const suggestedSongs = recommendations
          .map(rec => ({
            ...mockSongs.find(song => song.id === rec.id),
            sortOrder: rec.sortOrder
          }))
          .filter(Boolean) // Remove any undefined items
          .sort((a, b) => a.sortOrder - b.sortOrder);
        
        setWorkoutSuggestions(suggestedSongs);
        
        // Automatically set queue if it's empty
        if (queue.length === 0 && suggestedSongs.length > 0) {
          setQueue(suggestedSongs);
          
          // Start playing the first song if none is playing
          if (!currentSong) {
            playSong(suggestedSongs[0]);
          }
        }
      }
    }
  }, [syncWithWorkout, todaysWorkout, queue, currentSong, playSong, setQueue]);

  return {
    syncWithWorkout,
    setSyncWithWorkout,
    enableBpmSync,
    setEnableBpmSync,
    targetBpm,
    setTargetBpm,
    showWorkoutModal,
    setShowWorkoutModal,
    currentWorkoutType,
    workoutSuggestions,
    createWorkoutPlaylist,
    toggleWorkoutSync,
    handleBpmSyncToggle
  };
};

export default useWorkoutSync;