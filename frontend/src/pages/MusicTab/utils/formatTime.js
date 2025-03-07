/**
 * Format seconds into a MM:SS string
 * @param {number} seconds - The seconds to format
 * @returns {string} - Formatted time string (e.g. "3:45")
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default formatTime;