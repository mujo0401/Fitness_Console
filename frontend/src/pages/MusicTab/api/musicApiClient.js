import axios from 'axios';
import { mockSongs } from '../constants/mockSongs';
import { detectGenre } from '../utils/detectGenre';

/**
 * Search for music using the YouTube Music API
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of song objects
 */
export const searchYouTubeMusic = async (query) => {
  try {
    // First check if we're connected to YouTube Music
    const statusResponse = await axios.get('/api/youtube-music/status');
    console.log("YouTube Music connection status:", statusResponse.data);
    
    // If connected, then use the real YouTube Music endpoint
    if (statusResponse.data.connected) {
      console.log("Using real YouTube Music API since we're connected");
      
      // Now try the real YouTube Music endpoint
      console.log("Trying YouTube Music endpoint with query:", query);
      const musicResponse = await axios.get(
        `/api/youtube-music/search?q=${encodeURIComponent(query)}`
      );
      
      console.log("YouTube Music API response:", musicResponse.data);
      
      const data = musicResponse.data;
      
      // Format the results and return
      if (data.results && Array.isArray(data.results)) {
        return data.results.map(item => ({
          id: item.id || item.videoId,
          title: item.title,
          artist: item.artist,
          album: 'YouTube Music',
          thumbnail: item.thumbnail?.replace('i.ytimg.com', 'i3.ytimg.com').replace('hqdefault', 'mqdefault'),
          duration: item.duration || 240,
          videoId: item.videoId,
          bpm: item.bpm || Math.floor(Math.random() * 60) + 100,
          tags: [detectGenre(item.title)],
          liked: false
        }));
      }
    }
    
    // If the real API fails or user is not connected, fall back to direct endpoint
    console.log("Falling back to direct music endpoint...");
    try {
      const directResponse = await axios.get(
        `/api/direct-music/search?q=${encodeURIComponent(query)}`
      );
      console.log("Direct music response:", directResponse.data);
      
      const data = directResponse.data;
      
      // Return the direct API response data
      if (data.results && Array.isArray(data.results)) {
        return data.results.map(item => ({
          id: item.id || item.videoId,
          title: item.title,
          artist: item.artist,
          album: 'Direct Test',
          thumbnail: item.thumbnail?.replace('i.ytimg.com', 'i3.ytimg.com').replace('hqdefault', 'mqdefault'),
          duration: item.duration || 240,
          videoId: item.videoId,
          bpm: item.bpm || Math.floor(Math.random() * 60) + 100,
          tags: [detectGenre(item.title)],
          liked: false
        }));
      }
    } catch (directError) {
      console.error("Direct music error:", directError);
    }
    
    // If all else fails, use test endpoint as final fallback
    console.log("Trying test endpoint as final fallback...");
    const response = await axios.get(
      `/api/test-music/search?q=${encodeURIComponent(query)}`
    );
    
    const data = response.data;
    console.log('Search results from API:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Check if we got results
    if (data.results && Array.isArray(data.results)) {
      // Transform API data into our format
      return data.results.map(item => ({
        id: item.id || item.videoId,
        title: item.title,
        artist: item.artist,
        album: 'YouTube Music',
        thumbnail: item.thumbnail?.replace('i.ytimg.com', 'i3.ytimg.com').replace('hqdefault', 'mqdefault'),
        duration: item.duration || 240,
        videoId: item.videoId,
        bpm: item.bpm || Math.floor(Math.random() * 60) + 100,
        tags: [detectGenre(item.title)],
        liked: false
      }));
    }
    
    // Final fallback to mock data if all API calls fail
    console.log('No results returned, falling back to mock data');
    // Filter mock songs based on query
    const filteredMockSongs = mockSongs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );
    
    return filteredMockSongs.length > 0 ? filteredMockSongs : mockSongs.slice(0, 5);
  } catch (error) {
    console.error('Error searching YouTube:', error);
    
    // For any error, fall back to mock data
    const filteredMockSongs = mockSongs.filter(song => 
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
    );
    
    return filteredMockSongs.length > 0 ? filteredMockSongs : mockSongs.slice(0, 5);
  }
};

/**
 * Get recommended music based on user's workout
 * @param {string} workoutType - Type of workout
 * @returns {Promise<Array>} - Array of song objects
 */
export const getWorkoutRecommendations = async (workoutType) => {
  try {
    const response = await axios.get('/api/youtube-music/recommendations');
    
    if (response.data && response.data.recommendations) {
      return response.data.recommendations.map(item => ({
        id: item.id || item.videoId,
        title: item.title,
        artist: item.artist,
        album: 'Workout Recommendations',
        thumbnail: item.thumbnail?.replace('i.ytimg.com', 'i3.ytimg.com').replace('hqdefault', 'mqdefault'),
        duration: item.duration || 240,
        videoId: item.videoId,
        bpm: item.bpm || Math.floor(Math.random() * 60) + 100,
        tags: [detectGenre(item.title), 'Workout'],
        liked: false
      }));
    }
    
    // Fallback to mock songs tagged with the workout type
    return mockSongs.filter(song => 
      song.tags.some(tag => 
        tag.toLowerCase() === workoutType.toLowerCase() ||
        tag === 'Workout' ||
        tag === 'Motivation'
      )
    );
  } catch (error) {
    console.error('Error getting workout recommendations:', error);
    
    // Fallback to mock songs tagged with the workout type
    return mockSongs.filter(song => 
      song.tags.some(tag => 
        tag.toLowerCase() === workoutType.toLowerCase() ||
        tag === 'Workout' ||
        tag === 'Motivation'
      )
    );
  }
};

export default {
  searchYouTubeMusic,
  getWorkoutRecommendations
};