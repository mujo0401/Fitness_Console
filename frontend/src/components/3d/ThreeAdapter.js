/**
 * ThreeAdapter.js
 * 
 * This file provides compatibility between different versions of Three.js
 * It handles exports that have been renamed or removed in newer versions
 */

// In Three.js 0.174.0, LinearEncoding was removed
// Now we use SRGBColorSpace and LinearSRGBColorSpace instead
export const LinearEncoding = 3000; // Use the original value for compatibility

// Export a compatibility layer for Three.js color spaces
export const compatibilityLayer = {
  // Map deprecated constants to their new equivalents
  SRGBColorSpace: 'srgb',
  LinearSRGBColorSpace: 'srgb-linear',
  
  // Helper to adapt color space to the current Three.js version
  adaptColorSpace: (renderer) => {
    if (renderer) {
      // Instead of:
      // renderer.outputEncoding = LinearEncoding;
      
      // Use the new approach in 0.174.0+:
      renderer.outputColorSpace = 'srgb-linear';
    }
  }
};

export default {
  LinearEncoding,
  compatibilityLayer
};