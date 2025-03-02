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
  Alert,
  Zoom,
  Fab,
  Drawer
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import AlbumIcon from '@mui/icons-material/Album';
import { useWorkoutPlan } from '../context/WorkoutPlanContext';
import { useMusicPlayer, MusicPlayerContext } from '../context/MusicPlayerContext';

// YouTube Data API Integration
// This file uses the real YouTube Data API for music searches

// API KEY - This would normally be stored in environment variables
// For demo purposes only - this key would typically be restricted or proxied through a backend
const YOUTUBE_API_KEY = 'AIzaSyA-dlBUjVQeuc4a6ZN4RkNUjDFsu-F0Nrc';

// Genre list for categorization
const musicGenres = [
  'Workout', 'Running', 'High Intensity', 'Cardio', 'Dance', 'Hip Hop', 
  'Rock', 'Pop', 'Electronic', 'Motivation', 'Focus', 'Chill', 'Metal',
  'R&B', 'Latin', 'Country', 'Jazz', 'Classical', 'Indie', 'Alternative'
];

// Helper function to detect genre from title/description
const detectGenre = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check if any genre appears in the text
  for (const genre of musicGenres) {
    if (lowerText.includes(genre.toLowerCase())) {
      return genre;
    }
  }
  
  // Default mappings for certain keywords
  if (lowerText.includes('workout') || lowerText.includes('exercise') || lowerText.includes('fitness')) {
    return 'Workout';
  } else if (lowerText.includes('metal') || lowerText.includes('rock') || lowerText.includes('hard')) {
    return 'Rock';
  } else if (lowerText.includes('hip hop') || lowerText.includes('rap')) {
    return 'Hip Hop';
  } else if (lowerText.includes('edm') || lowerText.includes('electronic') || lowerText.includes('techno')) {
    return 'Electronic';
  } else if (lowerText.includes('relax') || lowerText.includes('sleep')) {
    return 'Chill';
  } else {
    return 'Pop'; // Default genre
  }
};

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
  
  // Use global music player context
  const { 
    currentSong, setCurrentSong,
    isPlaying, setIsPlaying,
    currentTime, setCurrentTime,
    volume, setVolume,
    muted, setMuted,
    queue, setQueue,
    showMiniPlayer, setShowMiniPlayer,
    repeatMode, setRepeatMode,
    shuffleEnabled, setShuffleEnabled,
    rockCatalog,
    playSong, togglePlay, handleSeek, handleVolumeChange, toggleMute,
    playNextSong, playPreviousSong, toggleShuffle, toggleRepeat,
    addToQueue, removeFromQueue, clearQueue, findSongById, playAlbum
  } = useMusicPlayer();
  
  // Local state variables
  const [selectedTab, setSelectedTab] = useState(0);
  const [playlistView, setPlaylistView] = useState('grid'); // 'grid' or 'list'
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
  const [miniPlayerExpanded, setMiniPlayerExpanded] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [showRockBands, setShowRockBands] = useState(false);
  
  // Function to search YouTube using the Data API
  const searchYouTube = async (query) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query + ' music')}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('YouTube API request failed');
      }
      
      const data = await response.json();
      console.log('YouTube API response:', data);
      
      // Transform YouTube data into our format
      return data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        album: 'YouTube Music',
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: 0, // We don't get duration from search API, would need another call
        videoId: item.id.videoId,
        bpm: Math.floor(Math.random() * 60) + 100, // Random BPM between 100-160
        tags: [detectGenre(item.snippet.title + ' ' + item.snippet.description)],
        liked: false
      }));
    } catch (error) {
      console.error('Error searching YouTube:', error);
      // Show error alert to user
      setAlertMessage('Failed to search YouTube: ' + error.message);
      setAlertSeverity('error');
      setAlertOpen(true);
      return [];
    }
  };
  
  // Function to get video details including duration
  const getVideoDetails = async (videoId) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('YouTube API request failed');
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const duration = data.items[0].contentDetails.duration; // ISO 8601 format
        // Convert ISO 8601 duration to seconds
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        
        const hours = (match[1] && match[1].replace('H', '')) || 0;
        const minutes = (match[2] && match[2].replace('M', '')) || 0;
        const seconds = (match[3] && match[3].replace('S', '')) || 0;
        
        return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting video details:', error);
      return 0;
    }
  };

  // Update filtered songs when search term changes - Using a hybrid approach with API and mock data
  useEffect(() => {
    if (!searchTerm) {
      // Default view without search - show rock bands catalog if enabled
      if (showRockBands) {
        // Flatten the rock catalog to display all songs
        const allRockSongs = [];
        for (const artist in rockCatalog) {
          rockCatalog[artist].forEach(album => {
            album.tracks.forEach(track => {
              allRockSongs.push({
                ...track,
                artist: album.artist,
                album: album.title,
                thumbnail: album.coverArt
              });
            });
          });
        }
        setFilteredSongs(allRockSongs.slice(0, 20)); // Limit to 20 songs
      } else {
        setFilteredSongs(mockSongs);
      }
      return;
    }
    
    // Check if the search matches any of our rock bands first
    const rockBandSearchRegex = /breaking\s*benjamin|twenty\s*one\s*pilots|linkin\s*park|of\s*monsters\s*and\s*men/i;
    if (rockBandSearchRegex.test(searchTerm)) {
      setShowRockBands(true);
      
      // Find matching songs from rock catalog
      const matchingSongs = [];
      for (const artist in rockCatalog) {
        if (artist.toLowerCase().includes(searchTerm.toLowerCase()) || 
            searchTerm.toLowerCase().includes(artist.toLowerCase())) {
          // Add all tracks from this artist
          rockCatalog[artist].forEach(album => {
            album.tracks.forEach(track => {
              matchingSongs.push({
                ...track,
                artist: album.artist,
                album: album.title,
                thumbnail: album.coverArt
              });
            });
          });
          continue;
        }
        
        // Check individual albums and tracks
        rockCatalog[artist].forEach(album => {
          if (album.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            // Add all tracks from this album
            album.tracks.forEach(track => {
              matchingSongs.push({
                ...track,
                artist: album.artist,
                album: album.title,
                thumbnail: album.coverArt
              });
            });
            return;
          }
          
          // Check individual tracks
          album.tracks.forEach(track => {
            if (track.title.toLowerCase().includes(searchTerm.toLowerCase())) {
              matchingSongs.push({
                ...track,
                artist: album.artist,
                album: album.title,
                thumbnail: album.coverArt
              });
            }
          });
        });
      }
      
      if (matchingSongs.length > 0) {
        setFilteredSongs(matchingSongs);
        setLoading(false);
        return;
      }
    }
    
    // If no rock band matches or it's a different search, use YouTube API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Search YouTube
        const results = await searchYouTube(searchTerm);
        
        if (results.length > 0) {
          // Get duration for first video for better UX
          if (results[0]) {
            const duration = await getVideoDetails(results[0].videoId);
            results[0].duration = duration;
          }
          
          // Store results
          setFilteredSongs(results);
        } else {
          // Fallback to mock data if no results
          console.log('No YouTube results, falling back to mock data');
          
          const matchingMockSongs = mockSongs.filter(song => 
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          setFilteredSongs(matchingMockSongs.length > 0 ? matchingMockSongs : mockSongs.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching from YouTube:', error);
        setFilteredSongs(mockSongs.slice(0, 5)); // Fallback
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // Debounce search
    
    return () => clearTimeout(timer);
  }, [searchTerm, showRockBands, rockCatalog]);
  
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
            playSong(suggestedSongs[0]);
          }
        }
      }
    }
  }, [syncWithWorkout, todaysWorkout, queue, currentSong, playSong]);

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
      if (!searchTerm) {
        setFilteredSongs(mockSongs);
      }
      // If there's a search term, don't override the search results
    } else {
      const filtered = mockSongs.filter(song => 
        song.tags.some(tag => selectedGenres.includes(tag))
      );
      setFilteredSongs(filtered);
    }
  }, [selectedGenres, searchTerm]);
  
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
        default:
          recommendedBpm = 140;
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
  
  // Toggle rock bands catalog view
  const toggleRockBandsView = () => {
    setShowRockBands(!showRockBands);
    
    if (!showRockBands) {
      // Flatten the rock catalog to display all songs
      const allRockSongs = [];
      for (const artist in rockCatalog) {
        rockCatalog[artist].forEach(album => {
          album.tracks.forEach(track => {
            allRockSongs.push({
              ...track,
              artist: album.artist,
              album: album.title,
              thumbnail: album.coverArt
            });
          });
        });
      }
      setFilteredSongs(allRockSongs.slice(0, 20)); // Limit to 20 songs
    } else {
      // Revert to mock songs
      setFilteredSongs(mockSongs);
    }
  };
  
  // Play an album directly
  const handlePlayAlbum = (albumId) => {
    playAlbum(albumId);
  };
  
  // Add an entire album to the queue
  const addAlbumToQueue = (albumId) => {
    for (const artist in rockCatalog) {
      const album = rockCatalog[artist].find(a => a.id === albumId);
      if (album) {
        const albumTracks = album.tracks.map(track => ({
          ...track,
          artist: album.artist,
          album: album.title,
          thumbnail: album.coverArt
        }));
        
        setQueue(prev => [...prev, ...albumTracks]);
        
        setAlertMessage(`Added ${album.title} to queue`);
        setAlertSeverity('success');
        setAlertOpen(true);
        return;
      }
    }
  };

  // Mini player component
  const MiniPlayer = () => {
    return (
      <Zoom in={showMiniPlayer && currentSong}>
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 10, sm: 15, md: 20 },
            right: { xs: 10, sm: 15, md: 20 },
            zIndex: 1000,
          }}
        >
          {miniPlayerExpanded ? (
            // Expanded mini player
            <Card
              sx={{
                width: { xs: 260, sm: 300 },
                borderRadius: { xs: 2, sm: 3 },
                background: 'linear-gradient(145deg, #5C1B9D, #2341DD)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setMiniPlayerExpanded(false)}
                  sx={{ color: 'white' }}
                >
                  <CloseFullscreenIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setShowMiniPlayer(false)}
                  sx={{ color: 'white' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', p: 1 }}>
                <Avatar
                  src={currentSong?.thumbnail}
                  variant="rounded"
                  sx={{ width: 60, height: 60, mr: 1 }}
                />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="subtitle2" noWrap sx={{ color: 'white', fontWeight: 'bold' }}>
                    {currentSong?.title}
                  </Typography>
                  <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {currentSong?.artist}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 28 }}>
                      {formatTime(Math.floor(currentTime))}
                    </Typography>
                    <Slider
                      size="small"
                      value={currentTime}
                      min={0}
                      max={currentSong?.duration || 0}
                      onChange={handleSeek}
                      sx={{
                        mx: 1,
                        color: 'white',
                        '& .MuiSlider-thumb': {
                          width: 8,
                          height: 8,
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 28 }}>
                      {formatTime(currentSong?.duration || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
                <IconButton onClick={playPreviousSong} size="small" sx={{ color: 'white' }}>
                  <SkipPreviousIcon />
                </IconButton>
                <IconButton onClick={togglePlay} sx={{ color: 'white', mx: 1 }}>
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={playNextSong} size="small" sx={{ color: 'white' }}>
                  <SkipNextIcon />
                </IconButton>
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', ml: 1 }}>
                  <IconButton
                    size="small"
                    onClick={toggleMute}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    sx={{ color: 'white' }}
                  >
                    {muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                  </IconButton>
                  {showVolumeSlider && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        p: 1,
                        borderRadius: 1,
                        width: 24,
                        height: 100,
                      }}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                      <Slider
                        orientation="vertical"
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        min={0}
                        max={100}
                        sx={{ height: '100%', color: 'white' }}
                        size="small"
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          ) : (
            // Collapsed mini player
            <Fab
              color="primary"
              sx={{
                background: 'linear-gradient(145deg, #5C1B9D, #2341DD)',
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onClick={() => setMiniPlayerExpanded(true)}
              >
                <Avatar
                  src={currentSong?.thumbnail}
                  sx={{
                    width: '100%',
                    height: '100%',
                    opacity: 0.7,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  }}
                >
                  <IconButton
                    sx={{ color: 'white', p: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Box>
              </Box>
            </Fab>
          )}
        </Box>
      </Zoom>
    );
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
      {/* Alert for errors and notifications */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
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
      
      {/* Rock Albums Showcase */}
      {showRockBands && (
        <Paper 
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            background: 'linear-gradient(145deg, #1a2035, #121212)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Rock Band Albums</Typography>
          
          <Grid container spacing={2}>
            {Object.keys(rockCatalog).map(artist => (
              <React.Fragment key={artist}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 1, mb: 1, color: '#90caf9' }}>
                    {artist.split(/(?=[A-Z])/).join(' ')}
                  </Typography>
                </Grid>
                
                {rockCatalog[artist].map(album => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={album.id}>
                    <Card 
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={album.coverArt}
                          alt={album.title}
                          sx={{ 
                            width: '100%',
                            aspectRatio: '1',
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
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            opacity: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.3s',
                            '&:hover': {
                              opacity: 1
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              onClick={() => handlePlayAlbum(album.id)}
                              sx={{ 
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                  bgcolor: theme.palette.primary.main
                                }
                              }}
                            >
                              <PlayArrowIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => addAlbumToQueue(album.id)}
                              sx={{ 
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                  bgcolor: theme.palette.secondary.main
                                }
                              }}
                            >
                              <QueueMusicIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {album.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {album.year} • {album.tracks.length} tracks
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </React.Fragment>
            ))}
          </Grid>
          
          <Button 
            variant="outlined"
            color="primary"
            onClick={toggleRockBandsView}
            startIcon={<MusicNoteIcon />}
            sx={{ mt: 2 }}
          >
            Return to All Music
          </Button>
        </Paper>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Main content */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {/* Player and controls column */}
          <Grid item xs={12} md={5} lg={4}>
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: { xs: 3, md: 4 }, 
                overflow: 'hidden', 
                mb: { xs: 2, sm: 3 },
                position: 'sticky',
                top: { xs: 8, sm: 12, md: 16 },
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
                borderRadius: { xs: 1.5, sm: 2 }, 
                mb: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 0.5, sm: 1 }
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
                    ...mockSongs.map(song => song.title),
                    ...mockSongs.map(song => song.artist),
                    ...musicGenres,
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
              {/* Rock bands toggle */}
              <Chip
                icon={<AlbumIcon />}
                label="Rock Bands"
                onClick={toggleRockBandsView}
                color={showRockBands ? "secondary" : "default"}
                variant={showRockBands ? "filled" : "outlined"}
                sx={{ 
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: showRockBands ? '' : alpha(theme.palette.secondary.main, 0.1)
                  }
                }}
              />
              
              {/* Genre filters */}
              {musicGenres.map(genre => (
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
            <Box sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
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
      
      {/* Render the mini player */}
      <MiniPlayer />
    </Box>
  );
};

export default MusicTab;