/**
 * Mock playlists for development and testing
 */
export const mockPlaylists = [
  {
    id: 'playlist1',
    title: 'Ultimate Workout Mix',
    thumbnail: 'https://i3.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    description: 'High-energy tracks to power through any workout',
    trackCount: 24,
    tags: ['Workout', 'High Intensity', 'Motivation'],
    createdBy: 'Fitness App',
    bpm: 140
  },
  {
    id: 'playlist2',
    title: 'Running Essentials',
    thumbnail: 'https://i3.ytimg.com/vi/9bZkp7q19f0/mqdefault.jpg',
    description: 'Perfect pace-setting tracks for runners',
    trackCount: 18,
    tags: ['Running', 'Cardio', 'Motivation'],
    createdBy: 'Fitness App',
    bpm: 160
  },
  {
    id: 'playlist3',
    title: 'HIIT Workout Intensity',
    thumbnail: 'https://i3.ytimg.com/vi/k2WcOJt-i8M/mqdefault.jpg',
    description: 'Intense tracks with peaks and troughs for interval training',
    trackCount: 15,
    tags: ['HIIT', 'High Intensity', 'Workout'],
    createdBy: 'Fitness App',
    bpm: 155
  },
  {
    id: 'playlist4',
    title: 'Cool Down & Stretch',
    thumbnail: 'https://i3.ytimg.com/vi/mWRsgZuwf_8/mqdefault.jpg',
    description: 'Relaxing music for post-workout stretching and recovery',
    trackCount: 12,
    tags: ['Chill', 'Recovery', 'Focus'],
    createdBy: 'Fitness App',
    bpm: 80
  },
  {
    id: 'playlist5',
    title: 'Motivation Beats',
    thumbnail: 'https://i3.ytimg.com/vi/pXRviuL6vMY/mqdefault.jpg',
    description: 'Songs to keep you motivated when the going gets tough',
    trackCount: 20,
    tags: ['Motivation', 'Workout', 'Energy'],
    createdBy: 'Fitness App',
    bpm: 130
  },
  {
    id: 'playlist6',
    title: 'Strength Training Power',
    thumbnail: 'https://i3.ytimg.com/vi/CD-E-LDc384/mqdefault.jpg',
    description: 'Powerful beats for pumping iron and building muscle',
    trackCount: 16,
    tags: ['Strength', 'Workout', 'Energy'],
    createdBy: 'Fitness App',
    bpm: 120
  }
];

/**
 * Workout-specific music recommendations
 */
export const workoutMusicRecommendations = {
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
  // Add more workout types as needed
};

export default {
  mockPlaylists,
  workoutMusicRecommendations
};