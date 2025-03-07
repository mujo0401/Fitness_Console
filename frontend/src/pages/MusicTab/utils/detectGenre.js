import { musicGenres } from '../constants/genres';

/**
 * Detects the most likely genre for a song based on its title/description
 * @param {string} text - The text to analyze (usually song title or description)
 * @returns {string} - The detected genre
 */
export const detectGenre = (text) => {
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

export default detectGenre;