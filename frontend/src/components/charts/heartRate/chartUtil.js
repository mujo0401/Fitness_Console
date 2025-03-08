/**
 * Process heart rate data with minimal downsampling to preserve detail
 * Reduces data size for performance while maintaining important features
 * 
 * @param {Array} data - Heart rate data to downsample
 * @param {number} targetPoints - Target number of data points (default: 5000)
 * @returns {Array} Downsampled data
 */
export const downsampleData = (data, targetPoints = 5000) => {
  if (!data || data.length === 0) return [];
  
  // If data points are fewer than target, no need to downsample
  if (data.length <= targetPoints) {
    console.log(`No downsampling needed: ${data.length} points is below target of ${targetPoints}`);
    return data;
  }
  
  // Calculate the factor by which to reduce the data - use minimal reduction
  const factor = Math.max(1, Math.ceil(data.length / targetPoints));
  console.log(`Downsampling ${data.length} points with factor ${factor} to ~${Math.ceil(data.length/factor)} points`);
  
  const result = [];
  
  // Always include first and last point for proper time range
  if (data.length > 1) {
    result.push({...data[0]});
  }
  
  // Process middle points
  for (let i = 1; i < data.length - 1; i += factor) {
    const chunk = data.slice(i, Math.min(i + factor, data.length - 1));
    
    // For high-fidelity detail, use first point in each chunk but preserve min/max
    const pointObj = { ...chunk[0] };
    
    // Only calculate min/max for chunks with multiple points
    if (chunk.length > 1) {
      Object.keys(pointObj).forEach(key => {
        if (typeof pointObj[key] === 'number') {
          const validValues = chunk
            .map(item => item[key])
            .filter(val => typeof val === 'number' && !isNaN(val));
            
          if (validValues.length > 0) {
            if (key === 'min') {
              pointObj[key] = Math.min(...validValues);
            } else if (key === 'max') {
              pointObj[key] = Math.max(...validValues);
            }
            // For other values like 'avg', keep original point data for precise visualization
          }
        }
      });
    }
    
    result.push(pointObj);
  }
  
  // Always include last point
  if (data.length > 1) {
    result.push({...data[data.length - 1]});
  }
  
  return result;
};

/**
 * Helper function to enhance heart rate data with zone information and source
 * Adds zone color, name, formatting and additional fields
 * 
 * @param {Array} data - Heart rate data to enhance
 * @param {string} source - Data source name (fitbit, googleFit, appleHealth)
 * @returns {Array} Enhanced heart rate data
 */
export const enhanceHeartRateData = (data, source) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => {
    try {
      // Support both value and avg fields (Google Fit uses value, Fitbit uses avg)
      const hrValue = item.avg || item.value || 0;
      
      // Get heart rate zone info
      let zoneColor = '#8884d8';
      let zoneName = 'Unknown';
      
      if (hrValue > 0) {
        if (hrValue < 60) {
          zoneColor = '#3f51b5';
          zoneName = 'Rest';
        } else if (hrValue < 70) {
          zoneColor = '#2196f3';
          zoneName = 'Fat Burn';
        } else if (hrValue < 85) {
          zoneColor = '#009688';
          zoneName = 'Cardio';
        } else if (hrValue < 100) {
          zoneColor = '#ff9800';
          zoneName = 'Peak';
        } else {
          zoneColor = '#f44336';
          zoneName = 'Extreme';
        }
      }
      
      // Create consistent timestamp format for all data sources
      let timestamp;
      if (item.timestamp) {
        // Google Fit data already has timestamp in seconds since epoch
        timestamp = item.timestamp;
      } else if (item.date) {
        // Fitbit data has date and possibly time
        timestamp = new Date(item.date + (item.time ? ' ' + item.time : '')).getTime() / 1000;
      } else {
        // Fallback in case no time information is available
        timestamp = Date.now() / 1000;
      }
      
      // Format a more readable time for display
      let formattedTime = item.time;
      if (!formattedTime && timestamp) {
        const date = new Date(timestamp * 1000);
        formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      }
      
      return {
        ...item,
        source: source,
        timestamp: timestamp,
        value: hrValue, // Ensure all data has a value field
        zoneColor: zoneColor,
        zoneName: zoneName,
        // Add formatted time if available
        formattedTime: formattedTime,
        // For zone area chart
        rest: hrValue <= 60 ? hrValue : 0,
        fatBurn: hrValue > 60 && hrValue <= 70 ? hrValue : 0,
        cardio: hrValue > 70 && hrValue <= 85 ? hrValue : 0,
        peak: hrValue > 85 && hrValue <= 100 ? hrValue : 0,
        extreme: hrValue > 100 ? hrValue : 0,
      };
    } catch (e) {
      console.error('Error enhancing heart rate data:', e);
      return item;
    }
  });
};

/**
 * Calculate data quality score based on completeness and frequency
 * Used to determine the best data source to use
 * 
 * @param {Array} data - Heart rate data to analyze
 * @returns {number} Quality score (0-100)
 */
export const calculateDataQualityScore = (data) => {
  if (!data || data.length === 0) return 0;
  
  // Calculate score based on:
  // 1. Data points (quantity) - max 40 points
  const dataPointsScore = Math.min(40, data.length / 10);
  
  // 2. Completeness (has min/max/avg values) - max 30 points
  let completenessCount = 0;
  data.forEach(item => {
    if (item.avg || item.value) completenessCount += 2;
    if (item.min) completenessCount += 1;
    if (item.max) completenessCount += 1;
    if (item.restingHeartRate) completenessCount += 1;
  });
  const completenessScore = Math.min(30, (completenessCount / (data.length * 5)) * 30);
  
  // 3. Recency (how recent the data is) - max 30 points
  let recencyScore = 30;
  if (data.length > 0) {
    const mostRecentItem = data[data.length - 1];
    
    // Support for both date strings and timestamps
    let itemTime = null;
    try {
      if (mostRecentItem.timestamp) {
        itemTime = new Date(mostRecentItem.timestamp * 1000);
      } else if (mostRecentItem.date) {
        itemTime = new Date(mostRecentItem.date + (mostRecentItem.time ? ' ' + mostRecentItem.time : ''));
      }
      
      if (itemTime && !isNaN(itemTime.getTime())) {
        const hoursDiff = Math.abs((new Date() - itemTime) / 1000 / 60 / 60);
        recencyScore = Math.max(0, 30 - hoursDiff / 8); // Lose 1 point per 8 hours old
      }
    } catch (e) {
      console.error('Error calculating recency score:', e);
    }
  }
  
  return Math.round(dataPointsScore + completenessScore + recencyScore);
};