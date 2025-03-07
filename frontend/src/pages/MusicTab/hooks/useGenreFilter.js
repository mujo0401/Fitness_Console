import { useState, useEffect } from 'react';
import { mockSongs } from '../constants/mockSongs';
import { useMusicPlayer } from '../../../context/MusicPlayerContext';

/**
 * Custom hook for genre filtering functionality
 * @param {string} searchTerm - Current search term
 * @param {function} setFilteredSongs - Function to update filtered songs
 * @returns {Object} - Genre filter state and functions
 */
const useGenreFilter = (searchTerm, setFilteredSongs) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showRockBands, setShowRockBands] = useState(false);
  
  const { rockCatalog } = useMusicPlayer();

  /**
   * Toggle a genre selection
   * @param {string} genre - Genre to toggle
   */
  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(prev => prev.filter(g => g !== genre));
    } else {
      setSelectedGenres(prev => [...prev, genre]);
    }
  };

  /**
   * Toggle rock bands catalog view
   */
  const toggleRockBandsView = () => {
    const newShowRockBands = !showRockBands;
    setShowRockBands(newShowRockBands);
    
    if (newShowRockBands) {
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

  // Effect to filter songs by genre
  useEffect(() => {
    if (selectedGenres.length === 0) {
      // If there's no search term, don't override the search results
      if (!searchTerm) {
        if (!showRockBands) {
          setFilteredSongs(mockSongs);
        }
      }
    } else {
      const filtered = mockSongs.filter(song => 
        song.tags.some(tag => selectedGenres.includes(tag))
      );
      setFilteredSongs(filtered);
    }
  }, [selectedGenres, searchTerm, showRockBands, setFilteredSongs]);

  return {
    selectedGenres,
    toggleGenre,
    showRockBands,
    setShowRockBands,
    toggleRockBandsView
  };
};

export default useGenreFilter;