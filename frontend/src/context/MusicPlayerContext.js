import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

// Create a context for the music player
export const MusicPlayerContext = createContext();

// Custom hook to use the music player context
export const useMusicPlayer = () => useContext(MusicPlayerContext);

// NON-COPYRIGHTED placeholder music catalog
// Uses generated titles and images with no copyrighted content
const generatePlaceholderCatalog = () => {
  // Music genres to use for generic content
  const genres = ['Rock', 'Electronic', 'Ambient', 'Instrumental', 'Jazz', 'Classical'];
  const moods = ['Energetic', 'Relaxing', 'Focused', 'Upbeat', 'Calm', 'Intense'];
  const artists = ['Demo Artist', 'Music Producer', 'Studio Band', 'Workout Mix', 'Instrumental Group', 'Sound Library'];
  
  // Generate catalog with non-copyrighted content
  const catalog = {};
  
  // Generate a few generic artist entries
  for (let i = 0; i < 4; i++) {
    const artistId = `artist_${i}`;
    const artistName = artists[i % artists.length];
    
    catalog[artistId] = [];
    
    // Each artist has 1-2 albums
    for (let j = 0; j < 1 + (i % 2); j++) {
      const albumId = `${artistId}_album_${j}`;
      const genre = genres[(i + j) % genres.length];
      const year = 2010 + (i * 2) + j;
      
      // Create album with non-copyrighted title and placeholder image
      const album = {
        id: albumId,
        title: `${genre} ${moods[j % moods.length]} Collection`,
        artist: artistName,
        year: year,
        // Generate a colorful placeholder image instead of using copyrighted album art
        coverArt: `https://dummyimage.com/300x300/${getRandomColor()}/fff.png&text=${encodeURIComponent(genre)}`,
        tracks: []
      };
      
      // Generate non-copyrighted tracks
      const trackCount = 8 + (i % 5);
      for (let k = 0; k < trackCount; k++) {
        const mood = moods[k % moods.length];
        const trackNum = k + 1;
        
        // Create track with original, non-copyrighted title
        album.tracks.push({
          id: `${albumId}_track_${k}`,
          title: `${mood} ${genre} Track ${trackNum}`,
          duration: 180 + (k * 15), // 3-5 minute tracks
          // Each track gets a random color for visualization
          videoId: `demo${i}${j}${k}`, // Non-functional placeholder ID
          bpm: 80 + (k * 5) // Varied BPM
        });
      }
      
      catalog[artistId].push(album);
    }
  }
  
  return catalog;
};

// Helper to generate random colors for placeholder images
const getRandomColor = () => {
  const colors = [
    '4285F4', '34A853', 'FBBC05', 'EA4335', // Primary colors
    '673AB7', '3F51B5', '2196F3', '03A9F4', // Blues/Purples
    '00BCD4', '009688', '4CAF50', '8BC34A', // Greens/Teals
    'CDDC39', 'FFC107', 'FF9800', 'FF5722'  // Yellows/Oranges
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// MusicPlayerProvider component
export const MusicPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [showMiniPlayer, setShowMiniPlayer] = useState(true);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'all', 'one'
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [rockCatalog, setRockCatalog] = useState(generatePlaceholderCatalog());
  
  const playerRef = useRef(null);
  const progressInterval = useRef(null);
  
  // Initialize YouTube API
  useEffect(() => {
    // Define YT globally if it doesn't exist yet
    if (!window.YT) {
      window.YT = {
        PlayerState: {
          ENDED: 0,
          PLAYING: 1,
          PAUSED: 2,
          BUFFERING: 3
        }
      };
    }
    
    // Load YouTube iframe API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
    
    return () => {
      // Clean up timer when component unmounts
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);
  
  // Initialize YouTube player
  const initializeYouTubePlayer = () => {
    if (typeof window.YT === 'undefined' || !window.YT.Player) {
      // If YT is not yet loaded, try again in 100ms
      console.log('YouTube API not ready yet, retrying in 100ms');
      setTimeout(initializeYouTubePlayer, 100);
      return;
    }
    
    console.log('Initializing YouTube player in global context');
    
    try {
      // Clean up any existing player first
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          console.warn("Could not destroy previous player instance:", e);
        }
      }
      
      // Create hidden element if it doesn't exist or recreate it
      let playerElement = document.getElementById('global-youtube-player');
      if (playerElement) {
        playerElement.remove(); // Remove any existing element
      }
      
      // Create a fresh element
      playerElement = document.createElement('div');
      playerElement.id = 'global-youtube-player';
      playerElement.style.position = 'absolute';
      playerElement.style.top = '-9999px';
      playerElement.style.left = '-9999px';
      playerElement.style.width = '120px';
      playerElement.style.height = '120px';
      document.body.appendChild(playerElement);
      
      console.log("Created player element:", playerElement);
      
      // Don't use a placeholder video ID - load an empty player
      playerRef.current = new window.YT.Player('global-youtube-player', {
        height: '120',
        width: '120',
        playerVars: {
          'playsinline': 1,
          'controls': 0,
          'disablekb': 1,
          'enablejsapi': 1,
          'modestbranding': 1,
          'rel': 0,
          'origin': window.location.origin
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': (event) => {
            console.error('YouTube player error:', event.data);
            // Reset the player state on error
            setIsPlaying(false);
          }
        }
      });
      
      // Restore player state if it exists
      if (window.musicPlayerState && window.musicPlayerState.currentSong) {
        console.log('Restoring previous song in player', window.musicPlayerState.currentSong);
        setCurrentSong(window.musicPlayerState.currentSong);
        setCurrentTime(window.musicPlayerState.currentTime || 0);
        setQueue(window.musicPlayerState.queue || []);
        
        if (window.musicPlayerState.isPlaying) {
          setShowMiniPlayer(true);
        }
      }
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      // Try again after a delay
      setTimeout(() => {
        console.log("Retrying YouTube player initialization...");
        initializeYouTubePlayer();
      }, 3000);
    }
  };
  
  const onPlayerReady = (event) => {
    console.log("YouTube player ready in global context");
    event.target.setVolume(volume);
    
    // Ensure player is muted initially (will unmute when actually playing)
    try {
      event.target.mute();
      // Immediately stop the placeholder video
      event.target.stopVideo();
    } catch (e) {
      console.warn("Could not mute or stop player on init:", e);
    }
    
    console.log("Player ready, waiting for user to select a song");
    
    // Restore previous state if available
    if (window.musicPlayerState && window.musicPlayerState.currentSong) {
      const { videoId, currentTime, isPlaying } = window.musicPlayerState;
      
      console.log("Restoring state with videoId:", videoId, "isPlaying:", isPlaying);
      
      try {
        // Only try to load a video if it's a real YouTube ID
        const isRealYouTubeId = videoId && 
                               !videoId.startsWith('demo') && 
                               !videoId.startsWith('track_') && 
                               !videoId.startsWith('workout_demo');
        
        if (isRealYouTubeId) {
          console.log("Loading saved video:", videoId);
          
          // Unmute before loading
          event.target.unMute();
          // Load the video but don't autoplay yet
          playerRef.current.cueVideoById(videoId);
          
          if (currentTime) {
            console.log("Seeking to saved position:", currentTime);
            playerRef.current.seekTo(currentTime);
          }
          
          if (isPlaying) {
            console.log("Auto-playing saved video after delay");
            setTimeout(() => {
              try {
                playerRef.current.playVideo();
                setIsPlaying(true);
              } catch (e) {
                console.error("Failed to auto-play saved video:", e);
              }
            }, 500);
          } else {
            console.log("Saved video ready but paused");
            setIsPlaying(false);
          }
        } else {
          console.log("Saved video is a demo ID, not loading actual YouTube video");
          playerRef.current.stopVideo();
          // For demo tracks, we still set UI state
          if (isPlaying) {
            setIsPlaying(true);
          }
        }
      } catch (error) {
        console.error('Error restoring player state:', error);
      }
    }
  };
  
  const onPlayerStateChange = (event) => {
    // 0 = ended, 1 = playing, 2 = paused, 3 = buffering
    if (event.data === window.YT.PlayerState.ENDED) {
      handleSongEnd();
    } else if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      
      // Start tracking progress
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      progressInterval.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          setCurrentTime(currentTime);
          
          // Save current state
          savePlayerState();
        }
      }, 1000);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      // Save current state
      savePlayerState();
    }
  };
  
  // Handle song selection
  const playSong = (song) => {
    if (!song) return;
    
    console.log("Attempting to play song:", song);
    setCurrentSong(song);
    
    // If player is initialized, load and play the video
    if (playerRef.current) {
      try {
        // Check if this is a real YouTube video ID or a demo ID
        const isRealYouTubeId = song.videoId && 
                               !song.videoId.startsWith('demo') && 
                               !song.videoId.startsWith('track_') && 
                               !song.videoId.startsWith('workout_demo');
        
        console.log("Is real YouTube ID:", isRealYouTubeId, "VideoID:", song.videoId);
        
        if (isRealYouTubeId) {
          // Load real YouTube video
          console.log("Loading real YouTube video:", song.videoId);
          playerRef.current.loadVideoById(song.videoId);
          
          // Force play after a short delay to ensure it starts
          setTimeout(() => {
            if (playerRef.current) {
              console.log("Forcing playback to start");
              playerRef.current.playVideo();
            }
          }, 500);
        } else {
          // For demo IDs, we'll show a visual player but not load a real video
          // This simulates playback without requiring real videos
          console.log("Playing demo track (no actual video loaded):", song.title);
          // For demos, we'll just stop any currently playing video and show UI
          playerRef.current.stopVideo();
          
          // For demo tracks, we still want to show the player as "playing"
          setIsPlaying(true);
        }
        
        playerRef.current.setVolume(muted ? 0 : volume);
        setIsPlaying(true);
        setShowMiniPlayer(true);
      } catch (error) {
        console.error("Error playing song:", error);
        // Still set as playing for UI feedback even if real playback fails
        setIsPlaying(true);
        setShowMiniPlayer(true);
      }
    } else {
      console.warn("YouTube player not initialized yet");
    }
    
    // Save player state
    savePlayerState();
  };
  
  // Handle play/pause
  const togglePlay = () => {
    if (!currentSong) return;
    
    console.log("Toggle play called, current state:", isPlaying);
    
    if (playerRef.current) {
      try {
        // Check if this is a real YouTube video ID or a demo ID
        const isRealYouTubeId = currentSong.videoId && 
                               !currentSong.videoId.startsWith('demo') && 
                               !currentSong.videoId.startsWith('track_') && 
                               !currentSong.videoId.startsWith('workout_demo');
        
        if (isPlaying) {
          console.log("Pausing playback");
          // Pausing works for both real and demo tracks
          if (isRealYouTubeId) {
            playerRef.current.pauseVideo();
          }
          setIsPlaying(false);
        } else {
          console.log("Resuming playback");
          if (isRealYouTubeId) {
            // First, make sure the video is loaded
            const playerState = playerRef.current.getPlayerState();
            console.log("Current player state:", playerState);
            
            // If video is not loaded or cued, reload it
            if (playerState === -1 || playerState === 5) {
              console.log("Video not loaded, loading video:", currentSong.videoId);
              playerRef.current.loadVideoById(currentSong.videoId, currentTime);
            } else {
              // Otherwise just play it
              console.log("Playing loaded video");
              playerRef.current.playVideo();
            }
            
            // Ensure volume is set correctly
            playerRef.current.setVolume(muted ? 0 : volume);
            playerRef.current.unMute();
          }
          setIsPlaying(true);
        }
        
        // Save player state
        savePlayerState();
      } catch (error) {
        console.error("Error during play/pause:", error);
        // Toggle UI state anyway for better UX
        setIsPlaying(!isPlaying);
      }
    } else {
      console.warn("Player not initialized, toggling UI only");
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle seeking in the song
  const handleSeek = (newValue) => {
    if (playerRef.current && currentSong) {
      playerRef.current.seekTo(newValue);
      setCurrentTime(newValue);
      
      // Save player state
      savePlayerState();
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (newValue) => {
    setVolume(newValue);
    if (playerRef.current) {
      playerRef.current.setVolume(newValue);
      if (newValue === 0) {
        setMuted(true);
      } else if (muted) {
        setMuted(false);
      }
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (playerRef.current) {
      if (muted) {
        playerRef.current.setVolume(volume);
      } else {
        playerRef.current.setVolume(0);
      }
      setMuted(!muted);
    }
  };
  
  // Handle song ending
  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      // Replay the current song
      if (playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
    } else {
      playNextSong();
    }
  };
  
  // Play next song
  const playNextSong = () => {
    if (!currentSong || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    if (currentIndex === -1) {
      // Current song not in queue, play first in queue
      playSong(queue[0]);
    } else {
      const nextIndex = (currentIndex + 1) % queue.length;
      playSong(queue[nextIndex]);
    }
  };
  
  // Play previous song
  const playPreviousSong = () => {
    if (!currentSong || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    if (currentIndex === -1) {
      // Current song not in queue, play last in queue
      playSong(queue[queue.length - 1]);
    } else {
      const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
      playSong(queue[prevIndex]);
    }
  };
  
  // Toggle shuffle mode
  const toggleShuffle = () => {
    setShuffleEnabled(!shuffleEnabled);
    if (!shuffleEnabled && queue.length > 0) {
      // Shuffle the queue
      const shuffled = [...queue];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQueue(shuffled);
    }
  };
  
  // Toggle repeat mode
  const toggleRepeat = () => {
    if (repeatMode === 'none') {
      setRepeatMode('all');
    } else if (repeatMode === 'all') {
      setRepeatMode('one');
    } else {
      setRepeatMode('none');
    }
  };
  
  // Add song to queue
  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
  };
  
  // Remove song from queue
  const removeFromQueue = (songId) => {
    setQueue(prev => prev.filter(song => song.id !== songId));
  };
  
  // Clear queue
  const clearQueue = () => {
    setQueue([]);
  };
  
  // Save player state globally
  const savePlayerState = () => {
    if (currentSong) {
      window.musicPlayerState = {
        currentSong,
        isPlaying,
        currentTime,
        videoId: currentSong.videoId,
        queue
      };
    }
  };
  
  // Find a song by ID in the catalog
  const findSongById = (songId) => {
    for (const artist in rockCatalog) {
      for (const album of rockCatalog[artist]) {
        for (const track of album.tracks) {
          if (track.id === songId) {
            return track;
          }
        }
      }
    }
    return null;
  };
  
  // Play an album
  const playAlbum = (albumId) => {
    for (const artist in rockCatalog) {
      const album = rockCatalog[artist].find(a => a.id === albumId);
      if (album) {
        setQueue(album.tracks);
        playSong(album.tracks[0]);
        return;
      }
    }
  };
  
  return (
    <MusicPlayerContext.Provider value={{
      currentSong,
      isPlaying,
      currentTime,
      volume,
      muted,
      queue,
      showMiniPlayer,
      repeatMode,
      shuffleEnabled,
      rockCatalog,
      
      // Methods
      setCurrentSong,
      setIsPlaying,
      setCurrentTime,
      setVolume,
      setMuted,
      setQueue,
      setShowMiniPlayer,
      setRepeatMode,
      setShuffleEnabled,
      
      playSong,
      togglePlay,
      handleSeek,
      handleVolumeChange,
      toggleMute,
      playNextSong,
      playPreviousSong,
      toggleShuffle,
      toggleRepeat,
      addToQueue,
      removeFromQueue,
      clearQueue,
      findSongById,
      playAlbum
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export default MusicPlayerProvider;