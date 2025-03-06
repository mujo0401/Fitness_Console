// Media Helper Functions

// Categorized sample audio files for different genres
export const SAMPLE_AUDIO_URLS = {
  workout: [
    'https://storage.googleapis.com/fitness-console/audio/workout-1.mp3',
    'https://storage.googleapis.com/fitness-console/audio/workout-2.mp3',
    'https://audio.jukehost.co.uk/9rtZZrbY6rnVnEV7jDQWgRmhHqhQcTzI',
    'https://audio.jukehost.co.uk/38EZ6ZSNvdTrMQIaEZm8nPYRYfywWBGz'
  ],
  relax: [
    'https://storage.googleapis.com/fitness-console/audio/relax-1.mp3',
    'https://storage.googleapis.com/fitness-console/audio/relax-2.mp3',
    'https://audio.jukehost.co.uk/VwC4fhxnS51r44PYnXnY12WNMwcDO9C8',
    'https://audio.jukehost.co.uk/f5CRXzGr7NUY6JZxH5WJWfXKTaVITzwQ'
  ],
  focus: [
    'https://storage.googleapis.com/fitness-console/audio/focus-1.mp3',
    'https://storage.googleapis.com/fitness-console/audio/focus-2.mp3',
    'https://audio.jukehost.co.uk/b6JvRDkiRTOC1QvQYLzIbAMeKAkTh5bv',
    'https://audio.jukehost.co.uk/CHZwSQDW0B9y7D2I3Q85JYgEcfnFwljp'
  ],
  podcast: [
    'https://storage.googleapis.com/fitness-console/audio/podcast-1.mp3',
    'https://storage.googleapis.com/fitness-console/audio/podcast-2.mp3',
    'https://audio.jukehost.co.uk/8lqnEO1tANmTQgBB8WH72E2OGXTdLAc6',
    'https://audio.jukehost.co.uk/b8LkCZUCc4yiDxvTgwEU0BuOXp4m7CXv'
  ],
  // Fallback URLs for any other category
  default: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  ]
};

// Get a random audio URL based on category
export const getRandomAudioUrl = (category = 'default') => {
  // Get the category array or fall back to default
  const categoryUrls = SAMPLE_AUDIO_URLS[category] || SAMPLE_AUDIO_URLS.default;
  
  // Get a random URL from the category
  const randomIndex = Math.floor(Math.random() * categoryUrls.length);
  return categoryUrls[randomIndex];
};

// Ensure a track has playable media (will add an mp3Url if needed)
export const ensurePlayableMedia = (track, playlist = null) => {
  if (!track) return null;
  
  // Create a copy to avoid mutating the original
  const enhancedTrack = { ...track };
  
  // Add artist from playlist if missing
  if (playlist && !enhancedTrack.artist) {
    enhancedTrack.artist = playlist.artist;
  }
  
  // Add album info if available
  if (playlist) {
    enhancedTrack.album = playlist.title || playlist.name;
    enhancedTrack.thumbnail = enhancedTrack.thumbnail || playlist.coverArt || playlist.images?.[0]?.url;
  }
  
  // Determine the appropriate audio category based on playlist or track metadata
  let category = 'default';
  
  if (playlist) {
    // Extract category from playlist ID or title
    const playlistId = playlist.id || '';
    const playlistTitle = (playlist.title || playlist.name || '').toLowerCase();
    
    if (playlistId.startsWith('workout') || 
        playlistTitle.includes('workout') || 
        playlistTitle.includes('exercise') || 
        playlistTitle.includes('gym') ||
        playlistTitle.includes('energy')) {
      category = 'workout';
    } else if (playlistId.startsWith('relax') || 
               playlistTitle.includes('relax') || 
               playlistTitle.includes('sleep') || 
               playlistTitle.includes('calm') ||
               playlistTitle.includes('meditation')) {
      category = 'relax';
    } else if (playlistId.startsWith('focus') || 
               playlistTitle.includes('focus') || 
               playlistTitle.includes('study') || 
               playlistTitle.includes('concentration') ||
               playlistTitle.includes('work')) {
      category = 'focus';
    } else if (playlistId.startsWith('podcast') || 
               playlistTitle.includes('podcast') || 
               playlistTitle.includes('talk') ||
               playlistTitle.includes('speech')) {
      category = 'podcast';
    }
  }
  
  // Ensure there's a playable media URL
  if (!enhancedTrack.mp3Url) {
    enhancedTrack.mp3Url = getRandomAudioUrl(category);
    enhancedTrack.audioCategory = category; // Store the category for reference
  }
  
  return enhancedTrack;
};

// Enhance a list of tracks with playable media
export const enhanceTracksList = (tracks, playlist = null) => {
  if (!tracks || !Array.isArray(tracks)) return [];
  
  return tracks.map(track => ensurePlayableMedia(track, playlist));
};