import React, { useState, useEffect } from 'react';
import { Box, Grid, Snackbar, Alert, Tabs, Tab } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Icons
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AlbumIcon from '@mui/icons-material/Album';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import WorkoutIcon from '@mui/icons-material/Whatshot';

// Components
import MusicHeader from './components/MusicHeader';
import GenreChips from './components/GenreChips';
import WorkoutIntegration from './components/WorkoutIntegration';
import { DiscoverTab } from './components/TabContent';
import QueueDrawer from './components/QueueDrawer';
import FilterDrawer from './components/dialogs/FilterDrawer';
import WorkoutMusicDialog from './components/dialogs/WorkoutMusicDialog';

// Now Playing component from global components
import NowPlaying from '../../components/music/NowPlaying';

// Hooks
import useYouTubeSearch from './hooks/useYouTubeSearch';
import useGenreFilter from './hooks/useGenreFilter';
import useWorkoutSync from './hooks/useWorkoutSync';
import useMusicHistory from './hooks/useMusicHistory';

// Contexts
import { useMusicPlayer } from '../../context/MusicPlayerContext';

// Styles
import '../../styles/MusicPlayer.css';

/**
 * MusicTab component - Main music page with search, filtering, and playback
 * @returns {JSX.Element} - Rendered component
 */
const MusicTab = () => {
  // Core states
  const [selectedTab, setSelectedTab] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('info');

  // Get auth context to check connections
  const { checkYouTubeMusicConnection, connectedServices } = useAuth();
  
  // Make sure connection status is checked when component mounts
  useEffect(() => {
    // Check if we're supposed to be connected to YouTube Music
    const checkConnection = async () => {
      console.log('MusicTab mounted, checking YouTube Music connection...');
      
      try {
        // First try direct force connect which is more reliable
        const response = await fetch('/api/youtube-music/force-connect', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          console.log('YouTube Music direct force connect successful');
          // Update the connection state in AuthContext
          await checkYouTubeMusicConnection(true);
        } else {
          console.error('YouTube Music force connect failed, falling back to status check');
          await checkYouTubeMusicConnection(true);
        }
      } catch (error) {
        console.error('Error during YouTube Music connection:', error);
        // Fallback to regular check
        await checkYouTubeMusicConnection(true);
      }
      
      console.log('YouTube Music connection status after check:', connectedServices.youtubeMusic);
    };
    
    checkConnection();
  }, [checkYouTubeMusicConnection, connectedServices.youtubeMusic]);
  
  // Music player context
  const { isPlaying } = useMusicPlayer();

  // Custom hooks
  const { 
    searchTerm, setSearchTerm, 
    loading, filteredSongs, setFilteredSongs,
    performSearch
  } = useYouTubeSearch(setAlertMessage, setAlertSeverity, setAlertOpen);

  const {
    selectedGenres, 
    toggleGenre,
    showRockBands, setShowRockBands,
    toggleRockBandsView
  } = useGenreFilter(searchTerm, setFilteredSongs);

  const {
    syncWithWorkout, setSyncWithWorkout,
    enableBpmSync, setEnableBpmSync, 
    targetBpm, setTargetBpm,
    showWorkoutModal, setShowWorkoutModal,
    currentWorkoutType, workoutSuggestions,
    createWorkoutPlaylist, toggleWorkoutSync,
    handleBpmSyncToggle
  } = useWorkoutSync(setAlertMessage, setAlertSeverity, setAlertOpen);

  const { 
    likedSongs, 
    userHistory,
    toggleLike 
  } = useMusicHistory();

  return (
    <Box className={`music-page ${isPlaying ? 'playing' : ''}`}>
      {/* Alert for errors and notifications */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
      
      {/* Music Header */}
      <MusicHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setFiltersOpen={setFiltersOpen}
        setQueueOpen={setQueueOpen}
      />
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Player and controls column */}
        <Grid item xs={12} md={5} lg={4}>
          <Box sx={{ position: 'sticky', top: 20, pb: 3 }}>
            {/* Now Playing component */}
            <NowPlaying onToggleLike={toggleLike} />
            
            {/* Workout Music Integration */}
            <WorkoutIntegration 
              syncWithWorkout={syncWithWorkout}
              enableBpmSync={enableBpmSync}
              currentWorkoutType={currentWorkoutType}
              targetBpm={targetBpm}
              workoutSuggestions={workoutSuggestions}
              toggleWorkoutSync={toggleWorkoutSync}
              handleBpmSyncToggle={handleBpmSyncToggle}
              setShowWorkoutModal={setShowWorkoutModal}
            />
          </Box>
        </Grid>
        
        {/* Music Library/Discovery column */}
        <Grid item xs={12} md={7} lg={8}>
          <Box sx={{ mb: 3 }}>
            {/* Tabs */}
            <Tabs 
              value={selectedTab} 
              onChange={(e, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                '& .MuiTabs-flexContainer': {
                  gap: { xs: 0, sm: 0 }
                },
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  minHeight: 48,
                  transition: 'all 0.3s'
                },
                '& .Mui-selected': {
                  color: 'white',
                  fontWeight: 'bold'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3,
                  borderRadius: 3
                },
                mb: 2,
                px: 1,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Tab 
                label="Discover" 
                icon={<LibraryMusicIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Rock Albums" 
                icon={<AlbumIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Favorites" 
                icon={<FavoriteIcon />}
                iconPosition="start"
              />
              <Tab 
                label="History" 
                icon={<HistoryIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Workout" 
                icon={<WorkoutIcon />}
                iconPosition="start"
              />
            </Tabs>
            
            {/* Genre filters */}
            <GenreChips 
              selectedGenres={selectedGenres}
              toggleGenre={toggleGenre}
            />
            
            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '0 8px' }}
              >
                {/* For now, we'll only implement the Discover tab */}
                {selectedTab === 0 && (
                  <DiscoverTab 
                    searchTerm={searchTerm}
                    filteredSongs={filteredSongs}
                    toggleLike={toggleLike}
                    loading={loading}
                  />
                )}
                
                {/* We can add more tabs as needed */}
                {selectedTab > 0 && (
                  <Box sx={{ p: 3, textAlign: 'center', color: 'white' }}>
                    <h3>This tab is being refactored</h3>
                    <p>Please check back soon!</p>
                  </Box>
                )}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Grid>
      </Grid>
      
      {/* Drawers and Dialogs */}
      <QueueDrawer 
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        setAlertMessage={setAlertMessage}
        setAlertSeverity={setAlertSeverity}
        setAlertOpen={setAlertOpen}
      />
      
      <FilterDrawer 
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        selectedGenres={selectedGenres}
        toggleGenre={toggleGenre}
        targetBpm={targetBpm}
        setTargetBpm={setTargetBpm}
        showRockBands={showRockBands}
        toggleRockBandsView={toggleRockBandsView}
      />
      
      <WorkoutMusicDialog
        open={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        enableBpmSync={enableBpmSync}
        targetBpm={targetBpm}
        handleBpmSyncToggle={handleBpmSyncToggle}
        createWorkoutPlaylist={createWorkoutPlaylist}
      />
    </Box>
  );
};

export default MusicTab;