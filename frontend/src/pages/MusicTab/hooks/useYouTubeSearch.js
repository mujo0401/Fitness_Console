import { useState, useEffect, useCallback } from 'react';
import { mockSongs } from '../constants/mockSongs';
import { searchYouTubeMusic } from '../api/musicApiClient';
import { useMusicPlayer } from '../../../context/MusicPlayerContext';

/**
 * Custom hook for YouTube Music search functionality
 * @param {function} setAlertMessage - Function to set alert message
 * @param {function} setAlertSeverity - Function to set alert severity
 * @param {function} setAlertOpen - Function to open/close alert
 * @returns {Object} - Search state and functions
 */
const useYouTubeSearch = (setAlertMessage, setAlertSeverity, setAlertOpen) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(mockSongs);
  const [loading, setLoading] = useState(false);
  
  const { rockCatalog } = useMusicPlayer();

  /**
   * Performs the search against the API
   */
  const performSearch = useCallback(async (query) => {
    try {
      setLoading(true);
      const results = await searchYouTubeMusic(query);
      setFilteredSongs(results);
      setLoading(false);
    } catch (error) {
      console.error('Error in useYouTubeSearch:', error);
      setLoading(false);
      
      // Show error alert to user
      setAlertMessage('Search failed: ' + error.message);
      setAlertSeverity('error');
      setAlertOpen(true);
      
      // Fallback to mock data
      const filteredMockSongs = mockSongs.filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSongs(filteredMockSongs.length > 0 ? filteredMockSongs : mockSongs.slice(0, 5));
    }
  }, [setAlertMessage, setAlertSeverity, setAlertOpen]);

  /**
   * Checks if search term matches rock bands catalog
   */
  const searchRockCatalog = useCallback((term) => {
    const matchingSongs = [];
    
    for (const artist in rockCatalog) {
      if (artist.toLowerCase().includes(term.toLowerCase()) || 
          term.toLowerCase().includes(artist.toLowerCase())) {
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
        if (album.title.toLowerCase().includes(term.toLowerCase())) {
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
          if (track.title.toLowerCase().includes(term.toLowerCase())) {
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
    
    return matchingSongs;
  }, [rockCatalog]);

  // Effect to handle search term changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSongs(mockSongs);
      return;
    }
    
    // Search debouncing
    const timer = setTimeout(() => {
      // Always use the API for search
      performSearch(searchTerm);
    }, 500); // Debounce 500ms
    
    return () => clearTimeout(timer);
  }, [searchTerm, performSearch, searchRockCatalog]);

  return {
    searchTerm,
    setSearchTerm,
    filteredSongs,
    setFilteredSongs,
    loading,
    performSearch
  };
};

export default useYouTubeSearch;