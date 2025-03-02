import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

// Create a context for the music player
export const MusicPlayerContext = createContext();

// Custom hook to use the music player context
export const useMusicPlayer = () => useContext(MusicPlayerContext);

// Sample album data for popular rock bands
const rockAlbums = {
  breakingBenjamin: [
    {
      id: 'bb_phobia',
      title: 'Phobia',
      artist: 'Breaking Benjamin',
      year: 2006,
      coverArt: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Breaking_Benjamin_-_Phobia.jpg/220px-Breaking_Benjamin_-_Phobia.jpg',
      tracks: [
        { id: 'bb_phobia_1', title: 'Intro', duration: 124, videoId: 'kEJ_AxWAvVM' },
        { id: 'bb_phobia_2', title: 'The Diary of Jane', duration: 242, videoId: 'DWaB4PXCwFU' },
        { id: 'bb_phobia_3', title: 'Breath', duration: 228, videoId: 'qQ3qJmgktS0' },
        { id: 'bb_phobia_4', title: 'You', duration: 258, videoId: '-cKAN5Tp6_0' },
        { id: 'bb_phobia_5', title: 'Evil Angel', duration: 242, videoId: '7FXE_c7Jc-k' },
        { id: 'bb_phobia_6', title: 'Until The End', duration: 246, videoId: 'O3bfRBassAE' },
        { id: 'bb_phobia_7', title: 'Dance With The Devil', duration: 230, videoId: 'lMSkC2PGyTs' },
        { id: 'bb_phobia_8', title: 'Topless', duration: 210, videoId: 'UYnf1vfgm-Q' },
        { id: 'bb_phobia_9', title: 'Here We Are', duration: 240, videoId: 'fNtIRvXeLQo' },
        { id: 'bb_phobia_10', title: 'Unknown Soldier', duration: 226, videoId: 'KNTrhAxTjEc' },
        { id: 'bb_phobia_11', title: 'Had Enough', duration: 218, videoId: '4bb8a6dLZh4' },
        { id: 'bb_phobia_12', title: 'You Fight Me', duration: 222, videoId: 'zAZ77Ot-F8M' },
        { id: 'bb_phobia_13', title: 'The Diary of Jane (Acoustic)', duration: 242, videoId: 'sXVpcgfxcCU' }
      ]
    },
    {
      id: 'bb_ember',
      title: 'Ember',
      artist: 'Breaking Benjamin',
      year: 2018,
      coverArt: 'https://upload.wikimedia.org/wikipedia/en/4/47/Breaking_Benjamin_-_Ember.jpg',
      tracks: [
        { id: 'bb_ember_1', title: 'Feed the Wolf', duration: 217, videoId: 'TN4Ccy6j5HQ' },
        { id: 'bb_ember_2', title: 'Red Cold River', duration: 205, videoId: 'BXOH4IgRjM8' },
        { id: 'bb_ember_3', title: 'Tourniquet', duration: 215, videoId: 'dAiHME-3C7c' },
        { id: 'bb_ember_4', title: 'Psycho', duration: 211, videoId: 'BHtZMSB4TDY' },
        { id: 'bb_ember_5', title: 'The Dark of You', duration: 228, videoId: 'p06dl4DG0HU' },
        { id: 'bb_ember_6', title: 'Down', duration: 227, videoId: 'DChj8YN2i6c' },
        { id: 'bb_ember_7', title: 'Torn in Two', duration: 242, videoId: 'GKRKquvv4wI' },
        { id: 'bb_ember_8', title: 'Blood', duration: 238, videoId: 'k8P-G_ttZ_0' },
        { id: 'bb_ember_9', title: 'Save Yourself', duration: 206, videoId: '_YvBKxF6iCU' },
        { id: 'bb_ember_10', title: 'Close Your Eyes', duration: 188, videoId: 'DG1mgIh3qXg' },
        { id: 'bb_ember_11', title: 'Vega', duration: 76, videoId: 'xdxZ2AfwJXs' },
        { id: 'bb_ember_12', title: 'Save Yourself (Acoustic)', duration: 206, videoId: 'Hn7mBIdR8zI' }
      ]
    }
  ],
  twentyOnePilots: [
    {
      id: 'top_blurryface',
      title: 'Blurryface',
      artist: 'Twenty One Pilots',
      year: 2015,
      coverArt: 'https://upload.wikimedia.org/wikipedia/en/7/7d/Blurryface_by_Twenty_One_Pilots.png',
      tracks: [
        { id: 'top_blurryface_1', title: 'Heavydirtysoul', duration: 234, videoId: 'r_9Kf0D5BTs' },
        { id: 'top_blurryface_2', title: 'Stressed Out', duration: 202, videoId: 'pXRviuL6vMY' },
        { id: 'top_blurryface_3', title: 'Ride', duration: 214, videoId: 'Pw-0pbY9JeU' },
        { id: 'top_blurryface_4', title: 'Fairly Local', duration: 210, videoId: 'HDI9inno86U' },
        { id: 'top_blurryface_5', title: 'Tear in My Heart', duration: 180, videoId: 'nky4me4NP70' },
        { id: 'top_blurryface_6', title: 'Lane Boy', duration: 257, videoId: 'ywvRgGAd2XI' },
        { id: 'top_blurryface_7', title: 'The Judge', duration: 290, videoId: 'PbP-aIe51Ek' },
        { id: 'top_blurryface_8', title: 'Doubt', duration: 192, videoId: 'MEiVnNNpJLA' },
        { id: 'top_blurryface_9', title: 'Polarize', duration: 230, videoId: 'MiPBQJq49xk' },
        { id: 'top_blurryface_10', title: 'We Don\'t Believe What\'s on TV', duration: 170, videoId: 'zZEumf7RowI' },
        { id: 'top_blurryface_11', title: 'Message Man', duration: 200, videoId: 'iE_54CU7Fxk' },
        { id: 'top_blurryface_12', title: 'Hometown', duration: 237, videoId: 'pJtlLzsDICo' },
        { id: 'top_blurryface_13', title: 'Not Today', duration: 239, videoId: 'yqem6k_3pZ8' },
        { id: 'top_blurryface_14', title: 'Goner', duration: 236, videoId: '3J5mE-J1WLk' }
      ]
    }
  ],
  linkinPark: [
    {
      id: 'lp_hybrid_theory',
      title: 'Hybrid Theory',
      artist: 'Linkin Park',
      year: 2000,
      coverArt: 'https://upload.wikimedia.org/wikipedia/en/2/2a/Linkin_Park_Hybrid_Theory_Album_Cover.jpg',
      tracks: [
        { id: 'lp_hybrid_1', title: 'Papercut', duration: 184, videoId: 'vjVkXlXsuu8' },
        { id: 'lp_hybrid_2', title: 'One Step Closer', duration: 157, videoId: '4qlCC1GOwFw' },
        { id: 'lp_hybrid_3', title: 'With You', duration: 203, videoId: 'M8UTS2yjXAc' },
        { id: 'lp_hybrid_4', title: 'Points of Authority', duration: 200, videoId: 'jZSPAp8kCl4' },
        { id: 'lp_hybrid_5', title: 'Crawling', duration: 209, videoId: 'Gd9OhYroLN0' },
        { id: 'lp_hybrid_6', title: 'Runaway', duration: 184, videoId: '1NSyU3unPPk' },
        { id: 'lp_hybrid_7', title: 'By Myself', duration: 187, videoId: 'sblR0eIRW-I' },
        { id: 'lp_hybrid_8', title: 'In the End', duration: 216, videoId: 'eVTXPUF4Oz4' },
        { id: 'lp_hybrid_9', title: 'A Place for My Head', duration: 184, videoId: '3t2WkCudwfY' },
        { id: 'lp_hybrid_10', title: 'Forgotten', duration: 194, videoId: 'HNCgBuI2eJc' },
        { id: 'lp_hybrid_11', title: 'Cure for the Itch', duration: 157, videoId: 'qqC5sdsHLq8' },
        { id: 'lp_hybrid_12', title: 'Pushing Me Away', duration: 191, videoId: 'GBUJvCxewvU' }
      ]
    },
    {
      id: 'lp_meteora',
      title: 'Meteora',
      artist: 'Linkin Park',
      year: 2003,
      coverArt: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Linkin_Park_Meteora_Album_Cover.jpg',
      tracks: [
        { id: 'lp_meteora_1', title: 'Foreword', duration: 13, videoId: 'xcJmE4c50K8' },
        { id: 'lp_meteora_2', title: 'Don\'t Stay', duration: 187, videoId: 'oWfGOVWrueo' },
        { id: 'lp_meteora_3', title: 'Somewhere I Belong', duration: 214, videoId: 'zsCD5XCu6CM' },
        { id: 'lp_meteora_4', title: 'Lying from You', duration: 175, videoId: '_QdPW8JrYzQ' },
        { id: 'lp_meteora_5', title: 'Hit the Floor', duration: 164, videoId: 'oMals9XXQY8' },
        { id: 'lp_meteora_6', title: 'Easier to Run', duration: 204, videoId: 'U5zdmjVeQzE' },
        { id: 'lp_meteora_7', title: 'Faint', duration: 162, videoId: 'LYU-8IFcDPw' },
        { id: 'lp_meteora_8', title: 'Figure.09', duration: 197, videoId: 'LnwPVEa_IfE' },
        { id: 'lp_meteora_9', title: 'Breaking the Habit', duration: 196, videoId: 'v2H4l9RpkwM' },
        { id: 'lp_meteora_10', title: 'From the Inside', duration: 173, videoId: 'YLHpvjrFpe0' },
        { id: 'lp_meteora_11', title: 'Nobody\'s Listening', duration: 179, videoId: 'QJ87793QXes' },
        { id: 'lp_meteora_12', title: 'Session', duration: 144, videoId: 'J1KFZVGrZzY' },
        { id: 'lp_meteora_13', title: 'Numb', duration: 187, videoId: 'kXYiU_JCYtU' }
      ]
    }
  ],
  ofMonstersAndMen: [
    {
      id: 'omam_myhead',
      title: 'My Head Is An Animal',
      artist: 'Of Monsters and Men',
      year: 2011,
      coverArt: 'https://upload.wikimedia.org/wikipedia/en/6/60/My_Head_Is_an_Animal.jpg',
      tracks: [
        { id: 'omam_myhead_1', title: 'Dirty Paws', duration: 244, videoId: 'mCHUw7ACS8o' },
        { id: 'omam_myhead_2', title: 'King and Lionheart', duration: 252, videoId: 'A76a_LNIYwE' },
        { id: 'omam_myhead_3', title: 'Mountain Sound', duration: 226, videoId: 'qt7ox1M_XG4' },
        { id: 'omam_myhead_4', title: 'Slow and Steady', duration: 268, videoId: 'NezxBvxpKTw' },
        { id: 'omam_myhead_5', title: 'From Finner', duration: 254, videoId: 'H8lRbYdElgw' },
        { id: 'omam_myhead_6', title: 'Little Talks', duration: 266, videoId: 'ghb6eDopW8I' },
        { id: 'omam_myhead_7', title: 'Six Weeks', duration: 307, videoId: 'I35XPs0fXFU' },
        { id: 'omam_myhead_8', title: 'Love Love Love', duration: 204, videoId: 'beiPP_MGz6I' },
        { id: 'omam_myhead_9', title: 'Your Bones', duration: 240, videoId: 'IgEXrHG4NMc' },
        { id: 'omam_myhead_10', title: 'Sloom', duration: 216, videoId: 'ZuS0YGK8pkM' },
        { id: 'omam_myhead_11', title: 'Lakehouse', duration: 290, videoId: 'Yk2x3TeRqa0' },
        { id: 'omam_myhead_12', title: 'Yellow Light', duration: 349, videoId: 'vDrfJhXJbxQ' }
      ]
    }
  ]
};

// MusicPlayerProvider component
export const MusicPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'all', 'one'
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [rockCatalog, setRockCatalog] = useState(rockAlbums);
  
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
      // Create hidden element if it doesn't exist
      let playerElement = document.getElementById('global-youtube-player');
      if (!playerElement) {
        playerElement = document.createElement('div');
        playerElement.id = 'global-youtube-player';
        playerElement.style.display = 'none';
        document.body.appendChild(playerElement);
      }
      
      playerRef.current = new window.YT.Player('global-youtube-player', {
        height: '0',
        width: '0',
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
    }
  };
  
  const onPlayerReady = (event) => {
    console.log("YouTube player ready in global context");
    event.target.setVolume(volume);
    
    // Restore previous state if available
    if (window.musicPlayerState && window.musicPlayerState.currentSong) {
      const { videoId, currentTime, isPlaying } = window.musicPlayerState;
      
      try {
        playerRef.current.loadVideoById(videoId);
        
        if (currentTime) {
          playerRef.current.seekTo(currentTime);
        }
        
        if (isPlaying) {
          setTimeout(() => {
            playerRef.current.playVideo();
            setIsPlaying(true);
          }, 300);
        } else {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
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
    
    setCurrentSong(song);
    
    // If player is initialized, load and play the video
    if (playerRef.current) {
      playerRef.current.loadVideoById(song.videoId);
      playerRef.current.setVolume(muted ? 0 : volume);
      setIsPlaying(true);
      setShowMiniPlayer(true);
    }
    
    // Save player state
    savePlayerState();
  };
  
  // Handle play/pause
  const togglePlay = () => {
    if (!currentSong) return;
    
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
      
      // Save player state
      savePlayerState();
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