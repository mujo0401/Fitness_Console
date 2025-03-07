import { useState, useEffect } from 'react';
import { mockSongs } from '../constants/mockSongs';
import { useMusicPlayer } from '../../../context/MusicPlayerContext';

/**
 * Custom hook for tracking music history and liked songs
 * @returns {Object} - Music history state and functions
 */
const useMusicHistory = () => {
  const [userHistory, setUserHistory] = useState([]);
  const [likedSongs, setLikedSongs] = useState(mockSongs.filter(song => song.liked));
  
  const { currentSong } = useMusicPlayer();

  /**
   * Toggle the like status of a song
   * @param {string} songId - ID of the song to toggle
   */
  const toggleLike = (songId) => {
    // Update liked status in all places
    setLikedSongs(prevLiked => {
      const songIndex = prevLiked.findIndex(song => song.id === songId);
      
      if (songIndex >= 0) {
        // Song is liked, so unlike it
        return prevLiked.filter(song => song.id !== songId);
      } else {
        // Song is not liked, find it and add to liked songs
        const songToLike = mockSongs.find(song => song.id === songId) || 
                          userHistory.find(song => song.id === songId);
        
        if (songToLike) {
          return [...prevLiked, { ...songToLike, liked: true }];
        }
        return prevLiked;
      }
    });
    
    // Also update liked status in history
    setUserHistory(prevHistory => {
      return prevHistory.map(song => {
        if (song.id === songId) {
          return { ...song, liked: !song.liked };
        }
        return song;
      });
    });
  };

  // When a song is played, add it to history
  useEffect(() => {
    if (currentSong && !userHistory.some(song => song.id === currentSong.id)) {
      setUserHistory(prev => [currentSong, ...prev].slice(0, 20)); // Keep last 20 songs
    }
  }, [currentSong, userHistory]);

  return {
    userHistory,
    likedSongs,
    toggleLike
  };
};

export default useMusicHistory;