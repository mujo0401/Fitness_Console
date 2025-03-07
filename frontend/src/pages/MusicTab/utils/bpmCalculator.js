/**
 * Gets BPM (Beats Per Minute) for a workout type
 * @param {string} workoutType - The type of workout (running, hiit, etc.)
 * @returns {number} - Recommended BPM for the workout
 */
export const getRecommendedBpmForWorkout = (workoutType) => {
  const type = workoutType.toLowerCase();
  
  switch (type) {
    case 'running':
      return 160;
    case 'hiit':
      return 155;
    case 'strength':
      return 125;
    case 'cardio':
      return 145;
    case 'recovery':
      return 85;
    default:
      return 140; // Default BPM
  }
};

/**
 * Filters songs by BPM within a certain range
 * @param {Array} songs - Array of song objects with BPM property
 * @param {number} targetBpm - The target BPM
 * @param {number} range - The allowed range (+/- from target)
 * @returns {Array} - Filtered songs
 */
export const filterSongsByBpm = (songs, targetBpm, range = 10) => {
  return songs.filter(song => 
    Math.abs((song.bpm || 120) - targetBpm) <= range
  );
};

export default {
  getRecommendedBpmForWorkout,
  filterSongsByBpm
};