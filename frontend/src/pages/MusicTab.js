import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  IconButton, 
  Slider, 
  TextField, 
  Paper, 
  Avatar, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  ListItemButton, 
  Divider, 
  CircularProgress, 
  Tooltip, 
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  InputAdornment,
  Backdrop,
  Autocomplete,
  Menu,
  MenuItem,
  Badge,
  Snackbar,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import SearchIcon from '@mui/icons-material/Search';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import SportsIcon from '@mui/icons-material/Sports';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { useWorkoutPlan } from '../context/WorkoutPlanContext';

// Mock data for YouTube Music API integration
// In a real app, you would use an actual YouTube Music API or a third-party API
const mockGenres = [
  'Workout', 'Running', 'High Intensity', 'Cardio', 'Dance', 'Hip Hop', 
  'Rock', 'Pop', 'Electronic', 'Motivation', 'Focus', 'Chill', 'Metal',
  'R&B', 'Latin', 'Country', 'Jazz', 'Classical', 'Indie', 'Alternative'
];

// Mock artists data
const mockArtists = [
  { name: 'Metallica', genre: 'Metal' },
  { name: 'Beyoncé', genre: 'Pop' },
  { name: 'Eminem', genre: 'Hip Hop' },
  { name: 'Dua Lipa', genre: 'Pop' },
  { name: 'Ed Sheeran', genre: 'Pop' },
  { name: 'Queen', genre: 'Rock' },
  { name: 'Kendrick Lamar', genre: 'Hip Hop' },
  { name: 'AC/DC', genre: 'Rock' },
  { name: 'Taylor Swift', genre: 'Pop' },
  { name: 'Drake', genre: 'Hip Hop' },
  { name: 'The Weeknd', genre: 'R&B' },
  { name: 'Ariana Grande', genre: 'Pop' },
  { name: 'Bad Bunny', genre: 'Latin' },
  { name: 'Daft Punk', genre: 'Electronic' },
  { name: 'Coldplay', genre: 'Rock' }
];

const mockPlaylists = [
  {
    id: 'playlist1',
    title: 'Ultimate Workout Mix',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    description: 'High-energy tracks to power through any workout',
    trackCount: 24,
    tags: ['Workout', 'High Intensity', 'Motivation'],
    createdBy: 'Fitness App',
    bpm: 140
  },
  {
    id: 'playlist2',
    title: 'Running Essentials',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg',
    description: 'Perfect pace-setting tracks for runners',
    trackCount: 18,
    tags: ['Running', 'Cardio', 'Motivation'],
    createdBy: 'Fitness App',
    bpm: 160
  },
  {
    id: 'playlist3',
    title: 'HIIT Workout Intensity',
    thumbnail: 'https://i.ytimg.com/vi/YlRpH6DkqY0/mqdefault.jpg',
    description: 'Intense tracks with peaks and troughs for interval training',
    trackCount: 15,
    tags: ['HIIT', 'High Intensity', 'Workout'],
    createdBy: 'Fitness App',
    bpm: 155
  },
  {
    id: 'playlist4',
    title: 'Cool Down & Stretch',
    thumbnail: 'https://i.ytimg.com/vi/zRgWvJQfKCY/mqdefault.jpg',
    description: 'Relaxing music for post-workout stretching and recovery',
    trackCount: 12,
    tags: ['Chill', 'Recovery', 'Focus'],
    createdBy: 'Fitness App',
    bpm: 80
  },
  {
    id: 'playlist5',
    title: 'Motivation Beats',
    thumbnail: 'https://i.ytimg.com/vi/pRXLhxp2fZU/mqdefault.jpg',
    description: 'Songs to keep you motivated when the going gets tough',
    trackCount: 20,
    tags: ['Motivation', 'Workout', 'Energy'],
    createdBy: 'Fitness App',
    bpm: 130
  },
  {
    id: 'playlist6',
    title: 'Strength Training Power',
    thumbnail: 'https://i.ytimg.com/vi/gCYcHz2k5x0/mqdefault.jpg',
    description: 'Powerful beats for pumping iron and building muscle',
    trackCount: 16,
    tags: ['Strength', 'Workout', 'Energy'],
    createdBy: 'Fitness App',
    bpm: 120
  }
];

const mockSongs = [
  {
    id: 'song1',
    title: 'Power Up',
    artist: 'Energy Crew',
    album: 'Workout Sessions',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    duration: 212, // seconds
    videoId: 'dQw4w9WgXcQ',
    bpm: 145,
    tags: ['Workout', 'High Intensity'],
    liked: true
  },
  {
    id: 'song2',
    title: 'Run the Miles',
    artist: 'Cardio Kings',
    album: 'Marathon Mix',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg',
    duration: 198,
    videoId: '9bZkp7q19f0',
    bpm: 160,
    tags: ['Running', 'Cardio'],
    liked: false
  },
  {
    id: 'song3',
    title: 'Pump It Up',
    artist: 'Muscle Motivation',
    album: 'Iron Tracks',
    thumbnail: 'https://i.ytimg.com/vi/YlRpH6DkqY0/mqdefault.jpg',
    duration: 187,
    videoId: 'YlRpH6DkqY0',
    bpm: 132,
    tags: ['Strength', 'Motivation'],
    liked: false
  },
  {
    id: 'song4',
    title: 'Sprint Interval',
    artist: 'HIIT Heroes',
    album: 'Tabata Time',
    thumbnail: 'https://i.ytimg.com/vi/zRgWvJQfKCY/mqdefault.jpg',
    duration: 240,
    videoId: 'zRgWvJQfKCY',
    bpm: 170,
    tags: ['HIIT', 'High Intensity'],
    liked: true
  },
  {
    id: 'song5',
    title: 'Cool Stretch',
    artist: 'Recovery Rhythms',
    album: 'Chill After Burn',
    thumbnail: 'https://i.ytimg.com/vi/pRXLhxp2fZU/mqdefault.jpg',
    duration: 254,
    videoId: 'pRXLhxp2fZU',
    bpm: 85,
    tags: ['Recovery', 'Chill'],
    liked: false
  },
  {
    id: 'song6',
    title: 'Maximum Effort',
    artist: 'Limit Breakers',
    album: 'No Pain No Gain',
    thumbnail: 'https://i.ytimg.com/vi/gCYcHz2k5x0/mqdefault.jpg',
    duration: 221,
    videoId: 'gCYcHz2k5x0',
    bpm: 150,
    tags: ['Motivation', 'High Intensity'],
    liked: true
  },
  {
    id: 'song7',
    title: 'Endurance Run',
    artist: 'Distance Demons',
    album: 'Marathon Mix',
    thumbnail: 'https://i.ytimg.com/vi/VDvr08sCPOc/mqdefault.jpg',
    duration: 197,
    videoId: 'VDvr08sCPOc',
    bpm: 165,
    tags: ['Running', 'Cardio'],
    liked: false
  },
  {
    id: 'song8',
    title: 'Flex and Flow',
    artist: 'Muscle Motivation',
    album: 'Iron Tracks Vol. 2',
    thumbnail: 'https://i.ytimg.com/vi/3jWRrafhO7M/mqdefault.jpg',
    duration: 231,
    videoId: '3jWRrafhO7M',
    bpm: 125,
    tags: ['Strength', 'Focus'],
    liked: true
  },
  {
    id: 'song9',
    title: 'Enter Sandman',
    artist: 'Metallica',
    album: 'Metallica',
    thumbnail: 'https://i.ytimg.com/vi/CD-E-LDc384/mqdefault.jpg',
    duration: 332,
    videoId: 'CD-E-LDc384',
    bpm: 123,
    tags: ['Metal', 'Rock', 'Strength'],
    liked: false
  },
  {
    id: 'song10',
    title: 'Formation',
    artist: 'Beyoncé',
    album: 'Lemonade',
    thumbnail: 'https://i.ytimg.com/vi/WDZJPJV__bQ/mqdefault.jpg',
    duration: 277,
    videoId: 'WDZJPJV__bQ',
    bpm: 123,
    tags: ['Pop', 'R&B', 'Dance'],
    liked: true
  },
  {
    id: 'song11',
    title: 'Lose Yourself',
    artist: 'Eminem',
    album: '8 Mile Soundtrack',
    thumbnail: 'https://i.ytimg.com/vi/_Yhyp-_hX2s/mqdefault.jpg',
    duration: 326,
    videoId: '_Yhyp-_hX2s',
    bpm: 171,
    tags: ['Hip Hop', 'Motivation', 'Running'],
    liked: true
  },
  {
    id: 'song12',
    title: 'Physical',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    thumbnail: 'https://i.ytimg.com/vi/9HDEHj2yzew/mqdefault.jpg',
    duration: 194,
    videoId: '9HDEHj2yzew',
    bpm: 124,
    tags: ['Pop', 'Dance', 'Workout'],
    liked: false
  },
  {
    id: 'song13',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg',
    duration: 233,
    videoId: 'JGwWNGJdvx8',
    bpm: 96,
    tags: ['Pop', 'Dance'],
    liked: false
  },
  {
    id: 'song14',
    title: 'We Will Rock You',
    artist: 'Queen',
    album: 'News of the World',
    thumbnail: 'https://i.ytimg.com/vi/-tJYN-eG1zk/mqdefault.jpg',
    duration: 122,
    videoId: '-tJYN-eG1zk',
    bpm: 81,
    tags: ['Rock', 'Motivation'],
    liked: true
  },
  {
    id: 'song15',
    title: 'HUMBLE.',
    artist: 'Kendrick Lamar',
    album: 'DAMN.',
    thumbnail: 'https://i.ytimg.com/vi/tvTRZJ-4EyI/mqdefault.jpg',
    duration: 177,
    videoId: 'tvTRZJ-4EyI',
    bpm: 150,
    tags: ['Hip Hop', 'High Intensity'],
    liked: false
  },
  {
    id: 'song16',
    title: 'Thunderstruck',
    artist: 'AC/DC',
    album: 'The Razors Edge',
    thumbnail: 'https://i.ytimg.com/vi/v2AC41dglnM/mqdefault.jpg',
    duration: 292,
    videoId: 'v2AC41dglnM',
    bpm: 138,
    tags: ['Rock', 'Motivation', 'Strength'],
    liked: true
  }
];

// Workout-specific music recommendations
const workoutMusicRecommendations = {
  running: [
    { id: 'song2', sortOrder: 1 },
    { id: 'song7', sortOrder: 2 },
    { id: 'song1', sortOrder: 3 },
    { id: 'song6', sortOrder: 4 }
  ],
  hiit: [
    { id: 'song4', sortOrder: 1 },
    { id: 'song6', sortOrder: 2 },
    { id: 'song1', sortOrder: 3 },
    { id: 'song3', sortOrder: 4 }
  ],
  strength: [
    { id: 'song3', sortOrder: 1 },
    { id: 'song8', sortOrder: 2 },
    { id: 'song6', sortOrder: 3 },
    { id: 'song1', sortOrder: 4 }
  ],
  cardio: [
    { id: 'song1', sortOrder: 1 },
    { id: 'song2', sortOrder: 2 },
    { id: 'song7', sortOrder: 3 },
    { id: 'song4', sortOrder: 4 }
  ],
  recovery: [
    { id: 'song5', sortOrder: 1 },
    { id: 'song8', sortOrder: 2 }
  ]
};

// Format seconds to mm:ss format
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MusicTab = () => {
  const theme = useTheme();
  const { todaysWorkout } = useWorkoutPlan();
  
  // State variables
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [playlistView, setPlaylistView] = useState('grid'); // 'grid' or 'list'
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'all', 'one'
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(mockSongs);
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [likedSongs, setLikedSongs] = useState(mockSongs.filter(song => song.liked));
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [syncWithWorkout, setSyncWithWorkout] = useState(false);
  const [workoutSuggestions, setWorkoutSuggestions] = useState([]);
  const [currentWorkoutType, setCurrentWorkoutType] = useState('');
  const [enableBpmSync, setEnableBpmSync] = useState(false);
  const [targetBpm, setTargetBpm] = useState(140);
  
  const audioRef = useRef(null);
  const progressInterval = useRef(null);
  const playerRef = useRef(null);
  
  // Initialize YouTube iframe API
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
  
  // Update filtered songs when search term changes
  useEffect(() => {
    if (searchTerm) {
      setLoading(true);
      // Simulate API request delay
      setTimeout(() => {
        // First look for exact artist match in mock artists
        const artistMatch = mockArtists.find(artist => 
          artist.name.toLowerCase() === searchTerm.toLowerCase() ||
          artist.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        let filtered;
        if (artistMatch) {
          console.log("Found artist match:", artistMatch);
          // If artist found, show all songs by that artist
          filtered = mockSongs.filter(song => 
            song.artist.toLowerCase().includes(artistMatch.name.toLowerCase())
          );
          
          // If no songs found for exact artist, search by genre instead
          if (filtered.length === 0) {
            console.log("No songs found for artist, searching by genre:", artistMatch.genre);
            filtered = mockSongs.filter(song => 
              song.tags.some(tag => tag.toLowerCase() === artistMatch.genre.toLowerCase())
            );
          }
        } else {
          // More flexible search - use partial matching for all fields
          const searchTermLower = searchTerm.toLowerCase();
          filtered = mockSongs.filter(song => {
            const titleMatch = song.title.toLowerCase().includes(searchTermLower);
            const artistMatch = song.artist.toLowerCase().includes(searchTermLower);
            const albumMatch = song.album.toLowerCase().includes(searchTermLower);
            const tagMatch = song.tags.some(tag => tag.toLowerCase().includes(searchTermLower));
            
            // Log the search results for debugging
            if (titleMatch || artistMatch || albumMatch || tagMatch) {
              console.log("Match found:", song.title, "by", song.artist);
              return true;
            }
            return false;
          });
        }
        
        console.log(`Search for "${searchTerm}" found ${filtered.length} results`);
        
        if (filtered.length === 0) {
          // If no exact matches, try a more fuzzy search
          const searchWords = searchTerm.toLowerCase().split(' ');
          filtered = mockSongs.filter(song => {
            return searchWords.some(word => 
              song.title.toLowerCase().includes(word) ||
              song.artist.toLowerCase().includes(word) ||
              song.album.toLowerCase().includes(word) ||
              song.tags.some(tag => tag.toLowerCase().includes(word))
            );
          });
          console.log(`Fuzzy search found ${filtered.length} results`);
        }
        
        setFilteredSongs(filtered);
        setLoading(false);
      }, 300);
    } else {
      setFilteredSongs(mockSongs);
    }
  }, [searchTerm]);
  
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
          .sort((a, b) => a.sortOrder - b.sortOrder);
        
        setWorkoutSuggestions(suggestedSongs);
        
        // Automatically set queue if it's empty
        if (queue.length === 0) {
          setQueue(suggestedSongs);
          
          // Start playing the first song if none is playing
          if (!currentSong) {
            setCurrentSong(suggestedSongs[0]);
          }
        }
      }
    }
  }, [syncWithWorkout, todaysWorkout, queue.length, currentSong]);
  
  // Initialize YouTube player
  const initializeYouTubePlayer = () => {
    if (typeof window.YT === 'undefined' || !window.YT.Player) {
      // If YT is not yet loaded, try again in 100ms
      setTimeout(initializeYouTubePlayer, 100);
      return;
    }
    
    playerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      playerVars: {
        'playsinline': 1,
        'controls': 0,
        'disablekb': 1,
        'enablejsapi': 1,
        'modestbranding': 1,
        'rel': 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  };
  
  const onPlayerReady = (event) => {
    // Player is ready
    console.log("YouTube player ready");
    // Set initial volume
    event.target.setVolume(volume);
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
        }
      }, 1000);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  };
  
  // Handle song selection
  const playSong = (song) => {
    if (!song) return;
    
    setCurrentSong(song);
    
    // Add to user history
    setUserHistory(prev => {
      // Remove duplicates
      const history = prev.filter(item => item.id !== song.id);
      // Add to beginning
      return [song, ...history].slice(0, 20);
    });
    
    // If player is initialized, load and play the video
    if (playerRef.current) {
      playerRef.current.loadVideoById(song.videoId);
      playerRef.current.setVolume(muted ? 0 : volume);
      setIsPlaying(true);
    }
  };
  
  // Handle play/pause
  const togglePlay = () => {
    if (!currentSong) {
      // If no song is selected, play the first song in the filtered list
      if (filteredSongs.length > 0) {
        playSong(filteredSongs[0]);
      }
      return;
    }
    
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle seeking in the song
  const handleSeek = (e, newValue) => {
    if (playerRef.current && currentSong) {
      playerRef.current.seekTo(newValue);
      setCurrentTime(newValue);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e, newValue) => {
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
  
  // Toggle like status of a song
  const toggleLike = (songId) => {
    const updatedSongs = filteredSongs.map(song => {
      if (song.id === songId) {
        return { ...song, liked: !song.liked };
      }
      return song;
    });
    setFilteredSongs(updatedSongs);
    
    // Update current song if it's the one being liked/unliked
    if (currentSong && currentSong.id === songId) {
      setCurrentSong({ ...currentSong, liked: !currentSong.liked });
    }
    
    // Update liked songs list
    setLikedSongs(updatedSongs.filter(song => song.liked));
  };
  
  // Add song to queue
  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
  };
  
  // Remove song from queue
  const removeFromQueue = (songId) => {
    setQueue(prev => prev.filter(song => song.id !== songId));
  };
  
  // Create a playlist from current queue
  const createPlaylistFromQueue = () => {
    // In a real app, this would send a request to create a playlist
    console.log("Create playlist from queue:", queue);
  };
  
  // Toggle genre selection
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    } else {
      setSelectedGenres(prev => [...prev, genre]);
    }
  };
  
  // Filter songs by selected genres
  useEffect(() => {
    if (selectedGenres.length === 0) {
      setFilteredSongs(mockSongs);
    } else {
      const filtered = mockSongs.filter(song => 
        song.tags.some(tag => selectedGenres.includes(tag))
      );
      setFilteredSongs(filtered);
    }
  }, [selectedGenres]);
  
  // Clear queue
  const clearQueue = () => {
    setQueue([]);
  };
  
  // Handle BPM sync toggle
  const handleBpmSyncToggle = (event) => {
    setEnableBpmSync(event.target.checked);
    
    if (event.target.checked && todaysWorkout) {
      // Set target BPM based on workout type
      const workoutType = todaysWorkout.type.toLowerCase();
      let recommendedBpm = 140; // Default
      
      switch (workoutType) {
        case 'running':
          recommendedBpm = 160;
          break;
        case 'hiit':
          recommendedBpm = 155;
          break;
        case 'strength':
          recommendedBpm = 125;
          break;
        case 'cardio':
          recommendedBpm = 145;
          break;
        case 'recovery':
          recommendedBpm = 85;
          break;
      }
      
      setTargetBpm(recommendedBpm);
      
      // Filter songs by BPM (within +/- 10 BPM)
      const bpmFiltered = mockSongs.filter(song => 
        Math.abs(song.bpm - recommendedBpm) <= 10
      );
      
      if (bpmFiltered.length > 0) {
        setQueue(bpmFiltered);
        setFilteredSongs(bpmFiltered);
      }
    }
  };
  
  // Toggle workout sync
  const toggleWorkoutSync = (event) => {
    setSyncWithWorkout(event.target.checked);
    
    if (event.target.checked) {
      setShowWorkoutModal(true);
    }
  };
  
  // Create workout playlist
  const createWorkoutPlaylist = () => {
    if (!todaysWorkout) return;
    
    setShowWorkoutModal(false);
    
    const workoutType = todaysWorkout.type.toLowerCase();
    
    // Get recommended songs for this workout type
    const recommendations = workoutMusicRecommendations[workoutType] || [];
    if (recommendations.length > 0) {
      const suggestedSongs = recommendations
        .map(rec => ({
          ...mockSongs.find(song => song.id === rec.id),
          sortOrder: rec.sortOrder
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      
      setQueue(suggestedSongs);
      
      // Start playing the first song
      playSong(suggestedSongs[0]);
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main content */}
        <Grid container spacing={3}>
          {/* Player and controls column */}
          <Grid item xs={12} md={5} lg={4}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 4, 
                overflow: 'hidden', 
                mb: 3,
                position: 'sticky',
                top: 16,
                background: 'linear-gradient(145deg, #5C1B9D, #2341DD)'
              }}
            >
              {/* Now Playing */}
              <Box sx={{ position: 'relative' }}>
                {/* Hidden YouTube Player */}
                <div id="youtube-player" style={{ display: 'none' }}></div>
                
                {/* Album Art */}
                <Box 
                  sx={{ 
                    pt: '100%', 
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {currentSong ? (
                    <motion.div
                      animate={{ 
                        rotate: isPlaying ? 360 : 0 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 20, 
                        ease: "linear"
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box 
                        component="img"
                        src={currentSong.thumbnail}
                        alt={currentSong.title}
                        sx={{ 
                          width: '85%',
                          height: '85%',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          border: '8px solid rgba(255,255,255,0.2)'
                        }}
                      />
                    </motion.div>
                  ) : (
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
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
                </Box>
                
                {/* Song Info */}
                <CardContent sx={{ color: 'white' }}>
                  <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {currentSong ? currentSong.title : 'No song selected'}
                  </Typography>
                  <Typography variant="subtitle1" noWrap sx={{ textAlign: 'center', opacity: 0.8 }}>
                    {currentSong ? currentSong.artist : 'Select a song to play'}
                  </Typography>
                  
                  {currentSong && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {formatTime(Math.floor(currentTime))}
                      </Typography>
                      <Slider
                        value={currentTime}
                        min={0}
                        max={currentSong.duration}
                        onChange={handleSeek}
                        sx={{ 
                          color: 'white',
                          '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                            '&:hover, &.Mui-focusVisible': {
                              boxShadow: '0 0 0 8px rgba(255,255,255,0.16)'
                            }
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {formatTime(currentSong.duration)}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Playback Controls */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <IconButton 
                      onClick={toggleShuffle} 
                      sx={{ color: shuffleEnabled ? 'primary.light' : 'white' }}
                    >
                      <ShuffleIcon />
                    </IconButton>
                    <IconButton onClick={playPreviousSong} sx={{ color: 'white' }}>
                      <SkipPreviousIcon fontSize="large" />
                    </IconButton>
                    <IconButton 
                      onClick={togglePlay} 
                      sx={{ 
                        color: 'white', 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
                    </IconButton>
                    <IconButton onClick={playNextSong} sx={{ color: 'white' }}>
                      <SkipNextIcon fontSize="large" />
                    </IconButton>
                    <IconButton 
                      onClick={toggleRepeat} 
                      sx={{ color: repeatMode !== 'none' ? 'primary.light' : 'white' }}
                    >
                      {repeatMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
                    </IconButton>
                  </Box>
                  
                  {/* Volume Control */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mt: 1
                    }}
                  >
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
                        sx={{ 
                          width: 100, 
                          ml: 1,
                          position: 'relative',
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: -15,
                            left: 0,
                            right: 0,
                            height: 30,
                          } 
                        }}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <Slider
                          value={muted ? 0 : volume}
                          onChange={handleVolumeChange}
                          min={0}
                          max={100}
                          sx={{ 
                            color: 'white',
                            '& .MuiSlider-thumb': {
                              width: 10,
                              height: 10
                            }
                          }}
                        />
                      </Box>
                    )}
                    
                    {currentSong && (
                      <Tooltip title={currentSong.liked ? "Remove from favorites" : "Add to favorites"}>
                        <IconButton 
                          onClick={() => toggleLike(currentSong.id)} 
                          sx={{ color: currentSong.liked ? 'error.light' : 'white', ml: 2 }}
                        >
                          {currentSong.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title={`Song BPM: ${currentSong ? currentSong.bpm : 'N/A'}`}>
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
                          {currentSong ? `${currentSong.bpm} BPM` : 'BPM'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Box>
            </Card>
            
            {/* Queue */}
            <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ 
                bgcolor: theme.palette.primary.main, 
                color: 'white', 
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QueueMusicIcon /> Up Next ({queue.length})
                </Typography>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={clearQueue}
                  disabled={queue.length === 0}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  Clear
                </Button>
              </Box>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {queue.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">Queue is empty</Typography>
                  </Box>
                ) : (
                  <List dense disablePadding>
                    {queue.map((song, index) => (
                      <React.Fragment key={`${song.id}-${index}`}>
                        <ListItem 
                          disablePadding
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              aria-label="remove" 
                              onClick={() => removeFromQueue(song.id)}
                              size="small"
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemButton 
                            onClick={() => playSong(song)}
                            selected={currentSong && currentSong.id === song.id}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                src={song.thumbnail} 
                                variant="rounded"
                                sx={{ width: 40, height: 40 }}
                              />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={song.title} 
                              secondary={song.artist}
                              primaryTypographyProps={{
                                noWrap: true,
                                variant: 'body2',
                                fontWeight: currentSong && currentSong.id === song.id ? 'bold' : 'normal'
                              }}
                              secondaryTypographyProps={{
                                noWrap: true,
                                variant: 'caption'
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                        {index < queue.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </Card>
            
            {/* Workout Music Integration */}
            <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ 
                bgcolor: theme.palette.success.main, 
                color: 'white', 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <SportsIcon />
                <Typography variant="h6">Workout Integration</Typography>
              </Box>
              <CardContent>
                <FormControlLabel
                  control={<Switch 
                    checked={syncWithWorkout}
                    onChange={toggleWorkoutSync}
                  />}
                  label="Sync with Current Workout"
                />
                
                <FormControlLabel
                  control={<Switch 
                    checked={enableBpmSync}
                    onChange={handleBpmSyncToggle}
                    disabled={!syncWithWorkout}
                  />}
                  label="Match Music BPM to Workout"
                />
                
                {currentWorkoutType && syncWithWorkout && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Workout: <b>{currentWorkoutType.charAt(0).toUpperCase() + currentWorkoutType.slice(1)}</b>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Target BPM: <b>{targetBpm}</b>
                    </Typography>
                    
                    {workoutSuggestions.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                          Suggested Music:
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {workoutSuggestions.map((song, index) => (
                            <Chip
                              key={song.id}
                              label={`${song.title} (${song.bpm} BPM)`}
                              onClick={() => playSong(song)}
                              variant={currentSong && currentSong.id === song.id ? "filled" : "outlined"}
                              color="primary"
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
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
                  sx={{ mt: 2 }}
                  startIcon={<SportsIcon />}
                  onClick={() => setShowWorkoutModal(true)}
                  disabled={!todaysWorkout}
                >
                  Create Workout Playlist
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Music Library/Discovery column */}
          <Grid item xs={12} md={7} lg={8}>
            {/* Tabs and search */}
            <Paper
              elevation={3}
              sx={{ 
                borderRadius: 2, 
                mb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1
              }}
            >
              <Tabs 
                value={selectedTab} 
                onChange={(e, newValue) => setSelectedTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 48,
                  flex: 1,
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: 0, sm: 0 }
                  },
                }}
              >
                <Tab 
                  label="Discover" 
                  icon={<LibraryMusicIcon />}
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab 
                  label="Playlists" 
                  icon={<QueueMusicIcon />}
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab 
                  label="Favorites" 
                  icon={<FavoriteIcon />}
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
                <Tab 
                  label="History" 
                  icon={<HistoryIcon />}
                  iconPosition="start"
                  sx={{ minHeight: 48 }}
                />
              </Tabs>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                ml: { xs: 0, sm: 2 },
                mt: { xs: 1, sm: 0 },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Autocomplete
                  freeSolo
                  options={[
                    ...mockArtists.map(artist => artist.name),
                    ...mockSongs.map(song => song.title),
                    ...mockGenres,
                    ...mockSongs.map(song => song.album)
                  ].filter((v, i, a) => a.indexOf(v) === i)} // Remove duplicates
                  value={searchTerm}
                  onInputChange={(event, newValue) => {
                    setSearchTerm(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search artists, songs, genres..."
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <SearchIcon color="action" sx={{ mr: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        width: { xs: '100%', sm: 250 },
                        '& .MuiOutlinedInput-root': {
                          background: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(5px)',
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    />
                  )}
                  ListboxProps={{
                    sx: { 
                      maxHeight: 300,
                      '& .MuiAutocomplete-option': {
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }
                    }
                  }}
                />
                <IconButton color="primary">
                  <TuneIcon />
                </IconButton>
              </Box>
            </Paper>
            
            {/* Genre filters */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {mockGenres.map(genre => (
                <Chip
                  key={genre}
                  label={genre}
                  onClick={() => toggleGenre(genre)}
                  color={selectedGenres.includes(genre) ? "primary" : "default"}
                  variant={selectedGenres.includes(genre) ? "filled" : "outlined"}
                  sx={{ 
                    '&:hover': {
                      bgcolor: selectedGenres.includes(genre) ? '' : alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                />
              ))}
            </Box>
            
            {/* Tab content */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Discover Tab */}
                {selectedTab === 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Top Music for Workouts
                    </Typography>
                    <Grid container spacing={2}>
                      {filteredSongs.map(song => (
                        <Grid item xs={12} sm={6} md={4} key={song.id}>
                          <Card 
                            elevation={2} 
                            sx={{ 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                              }
                            }}
                          >
                            <Box sx={{ position: 'relative' }}>
                              <Box 
                                component="img"
                                src={song.thumbnail}
                                alt={song.title}
                                sx={{ 
                                  width: '100%',
                                  aspectRatio: '16/9',
                                  objectFit: 'cover'
                                }}
                              />
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: 'rgba(0,0,0,0.3)',
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  '&:hover': {
                                    opacity: 1
                                  }
                                }}
                              >
                                <IconButton 
                                  sx={{ 
                                    color: 'white', 
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    '&:hover': {
                                      bgcolor: theme.palette.primary.main
                                    }
                                  }}
                                  onClick={() => playSong(song)}
                                >
                                  <PlayArrowIcon fontSize="large" />
                                </IconButton>
                              </Box>
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="subtitle1" noWrap fontWeight="bold">
                                {song.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {song.artist}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mt: 1 
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => toggleLike(song.id)}
                                    color={song.liked ? "error" : "default"}
                                  >
                                    {song.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    onClick={() => addToQueue(song)}
                                  >
                                    <QueueMusicIcon />
                                  </IconButton>
                                </Box>
                                <Chip 
                                  label={`${song.bpm} BPM`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
                
                {/* Playlists Tab */}
                {selectedTab === 1 && (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 2 
                    }}>
                      <Typography variant="h6">Workout Playlists</Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={createPlaylistFromQueue}
                      >
                        Create Playlist
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {mockPlaylists.map(playlist => (
                        <Grid item xs={12} sm={6} md={4} key={playlist.id}>
                          <Card 
                            elevation={2} 
                            sx={{ 
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                              }
                            }}
                          >
                            <Box sx={{ position: 'relative' }}>
                              <Box 
                                component="img"
                                src={playlist.thumbnail}
                                alt={playlist.title}
                                sx={{ 
                                  width: '100%',
                                  aspectRatio: '16/9',
                                  objectFit: 'cover',
                                  filter: 'brightness(0.8)'
                                }}
                              />
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  position: 'absolute', 
                                  bottom: 0, 
                                  left: 0, 
                                  right: 0, 
                                  p: 2, 
                                  color: 'white',
                                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                  fontWeight: 'bold'
                                }}
                              >
                                {playlist.title}
                              </Typography>
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: 'rgba(0,0,0,0.3)',
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  '&:hover': {
                                    opacity: 1
                                  }
                                }}
                              >
                                <IconButton 
                                  sx={{ 
                                    color: 'white', 
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    '&:hover': {
                                      bgcolor: theme.palette.primary.main
                                    }
                                  }}
                                  onClick={() => {
                                    // Get songs for this playlist and add to queue
                                    const playlistSongs = mockSongs.filter(song => 
                                      song.tags.some(tag => playlist.tags.includes(tag))
                                    );
                                    setQueue(playlistSongs);
                                    if (playlistSongs.length > 0) {
                                      playSong(playlistSongs[0]);
                                    }
                                  }}
                                >
                                  <PlayArrowIcon fontSize="large" />
                                </IconButton>
                              </Box>
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                {playlist.trackCount} tracks • Avg. {playlist.bpm} BPM
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {playlist.description}
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {playlist.tags.map(tag => (
                                  <Chip 
                                    key={tag} 
                                    label={tag} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                ))}
                              </Box>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'flex-end',
                                mt: 1 
                              }}>
                                <IconButton size="small">
                                  <DownloadIcon />
                                </IconButton>
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    // Get songs for this playlist and add to queue
                                    const playlistSongs = mockSongs.filter(song => 
                                      song.tags.some(tag => playlist.tags.includes(tag))
                                    );
                                    setQueue(prev => [...prev, ...playlistSongs]);
                                  }}
                                >
                                  <QueueMusicIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
                
                {/* Favorites Tab */}
                {selectedTab === 2 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Your Favorite Tracks
                    </Typography>
                    {likedSongs.length === 0 ? (
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <FavoriteBorderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No favorite tracks yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Heart your favorite songs to see them here
                        </Typography>
                      </Paper>
                    ) : (
                      <List>
                        {likedSongs.map(song => (
                          <React.Fragment key={song.id}>
                            <ListItem
                              secondaryAction={
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton edge="end" onClick={() => toggleLike(song.id)} color="error">
                                    <FavoriteIcon />
                                  </IconButton>
                                  <IconButton edge="end" onClick={() => addToQueue(song)}>
                                    <QueueMusicIcon />
                                  </IconButton>
                                </Box>
                              }
                            >
                              <ListItemButton onClick={() => playSong(song)}>
                                <ListItemAvatar>
                                  <Avatar 
                                    src={song.thumbnail} 
                                    variant="rounded" 
                                    sx={{ width: 56, height: 56, mr: 2 }}
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={song.title}
                                  secondary={
                                    <Typography variant="body2" color="text.secondary">
                                      {song.artist} • {song.album} • {formatTime(song.duration)}
                                    </Typography>
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </>
                )}
                
                {/* History Tab */}
                {selectedTab === 3 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Recently Played
                    </Typography>
                    {userHistory.length === 0 ? (
                      <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No play history yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Play some songs to see your history
                        </Typography>
                      </Paper>
                    ) : (
                      <List>
                        {userHistory.map(song => (
                          <React.Fragment key={song.id}>
                            <ListItem
                              secondaryAction={
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => toggleLike(song.id)}
                                    color={song.liked ? "error" : "default"}
                                  >
                                    {song.liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                  </IconButton>
                                  <IconButton edge="end" onClick={() => addToQueue(song)}>
                                    <QueueMusicIcon />
                                  </IconButton>
                                </Box>
                              }
                            >
                              <ListItemButton onClick={() => playSong(song)}>
                                <ListItemAvatar>
                                  <Avatar 
                                    src={song.thumbnail} 
                                    variant="rounded" 
                                    sx={{ width: 56, height: 56, mr: 2 }}
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={song.title}
                                  secondary={
                                    <Typography variant="body2" color="text.secondary">
                                      {song.artist} • {song.album} • {formatTime(song.duration)}
                                    </Typography>
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                            <Divider variant="inset" component="li" />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </motion.div>
      
      {/* Workout Music Dialog */}
      <Dialog 
        open={showWorkoutModal} 
        onClose={() => setShowWorkoutModal(false)}
        maxWidth="sm"
        fullWidth
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
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {todaysWorkout.name}
              </Typography>
              <Typography variant="body1" paragraph>
                Workout Type: <b>{todaysWorkout.type}</b>
              </Typography>
              <Typography variant="body2" paragraph>
                We'll create a music playlist optimized for your {todaysWorkout.type.toLowerCase()} workout, 
                with tracks that match the intensity and rhythm of your exercise.
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={<Switch 
                    checked={enableBpmSync}
                    onChange={handleBpmSyncToggle}
                  />}
                  label="Match Music BPM to Workout Intensity"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWorkoutModal(false)}>
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
    </Box>
  );
};

export default MusicTab;