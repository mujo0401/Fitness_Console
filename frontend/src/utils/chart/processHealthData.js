import { format } from 'date-fns';
import { getHeartRateZone } from '../heartRateUtils';

/**
 * Process heart rate data with minimal downsampling to preserve detail
 * Reduces data size for performance while maintaining important features
 * 
 * @param {Array} data - Heart rate data to downsample
 * @param {number} targetPoints - Target number of data points (default: 5000)
 * @returns {Array} Downsampled data
 */
export const downsampleData = (sourceData, targetPoints = 5000) => {
  if (!sourceData || sourceData.length === 0) {
    console.warn("No data to downsample");
    return [];
  }
  
  // If data points are fewer than target, no need to downsample
  if (sourceData.length <= targetPoints) {
    console.log(`No downsampling needed: ${sourceData.length} points is below target of ${targetPoints}`);
    return sourceData;
  }
  
  // Calculate the factor by which to reduce the data - use minimal reduction
  const factor = Math.max(1, Math.ceil(sourceData.length / targetPoints));
  console.log(`Downsampling ${sourceData.length} points with factor ${factor} to ~${Math.ceil(sourceData.length/factor)} points`);
  
  const result = [];
  
  // Always include first and last point for proper time range
  if (sourceData.length > 1) {
    result.push({...sourceData[0]});
  }
  
  // Process middle points
  for (let i = 1; i < sourceData.length - 1; i += factor) {
    const chunk = sourceData.slice(i, Math.min(i + factor, sourceData.length - 1));
    
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
  if (sourceData.length > 1) {
    result.push({...sourceData[sourceData.length - 1]});
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
  if (!data || !Array.isArray(data)) {
    console.warn("No data to enhance");
    return [];
  }
  
  console.log(`Enhancing ${data.length} data points from source: ${source}`);
  
  // Check the first few data points to understand structure
  if (data.length > 0) {
    console.log("Data structure sample:", JSON.stringify(data[0]));
  }
  
  // Log time range of data points to help debug time cutoffs
  if (data.length > 1) {
    const firstTimestamp = data[0].timestamp || (new Date(data[0].date + (data[0].time ? ' ' + data[0].time : '')).getTime() / 1000);
    const lastTimestamp = data[data.length-1].timestamp || (new Date(data[data.length-1].date + (data[data.length-1].time ? ' ' + data[data.length-1].time : '')).getTime() / 1000);
    
    console.log(`Data time range: ${new Date(firstTimestamp * 1000).toLocaleString()} to ${new Date(lastTimestamp * 1000).toLocaleString()}`);
  }
  
  return data.map((item, index) => {
    try {
      // CRITICAL FIX: Extract heart rate value to ensure ALL data points have BOTH value and avg fields
      // This is important because different chart types use different field access patterns
      const hrValue = item.avg !== undefined ? item.avg : (item.value !== undefined ? item.value : 0);
      
      // Get min/max values - estimate if not available
      const minValue = item.min !== undefined ? item.min : Math.floor(hrValue * 0.9);
      const maxValue = item.max !== undefined ? item.max : Math.ceil(hrValue * 1.1);
      
      if (index === 0 || index === data.length - 1) {
        console.log(`${index === 0 ? 'First' : 'Last'} data point HR value: ${hrValue} (from ${item.avg !== undefined ? 'avg' : 'value'} field)`);
      }
      
      // Get heart rate zone info
      const zone = getHeartRateZone(hrValue);
      
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
      
      // CRITICAL FIX: ALWAYS generate a proper formattedTime with AM/PM
      // This ensures consistent time formatting regardless of data source
      const date = new Date(timestamp * 1000);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      const formattedTime = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
      
      // Create the enhanced data point with normalized fields
      const enhancedPoint = {
        ...item,
        source: source,
        timestamp: timestamp,
        // CRITICAL FIX: ALWAYS set both value and avg to the same heart rate value
        // This ensures consistent rendering across all chart types
        value: hrValue,
        avg: hrValue,
        // CRITICAL FIX: ALWAYS set min/max values (estimated if necessary)
        min: minValue,
        max: maxValue,
        // CRITICAL FIX: Set a delta field for range charts
        delta: maxValue - minValue,
        // Zone information
        zoneColor: zone?.color || '#8884d8',
        zoneName: zone?.name || 'Unknown',
        // CRITICAL FIX: ALWAYS overwrite time fields with consistently formatted time
        time: formattedTime,
        formattedTime: formattedTime,
        // For zone area chart
        rest: hrValue <= 60 ? hrValue : 0,
        fatBurn: hrValue > 60 && hrValue <= 70 ? hrValue : 0,
        cardio: hrValue > 70 && hrValue <= 85 ? hrValue : 0,
        peak: hrValue > 85 && hrValue <= 100 ? hrValue : 0,
        extreme: hrValue > 100 ? hrValue : 0,
      };
      
      // Debug log for first and last point
      if (index === 0 || index === data.length - 1) {
        console.log(`${index === 0 ? 'First' : 'Last'} enhanced point:`, 
          JSON.stringify({
            value: enhancedPoint.value,
            avg: enhancedPoint.avg, 
            min: enhancedPoint.min,
            max: enhancedPoint.max,
            delta: enhancedPoint.delta,
            time: enhancedPoint.formattedTime,
            timestamp: enhancedPoint.timestamp,
            date: new Date(enhancedPoint.timestamp * 1000).toLocaleString(),
            zone: enhancedPoint.zoneName
          })
        );
      }
      
      // Log a debug point every hour to track data continuity
      const hour = new Date(timestamp * 1000).getHours();
      const minute = new Date(timestamp * 1000).getMinutes();
      if (minute === 0 || minute === 30) {
        console.log(`Data point at ${hour}:${minute.toString().padStart(2, '0')}: HR=${hrValue}, time=${formattedTime}`);
      }
      
      return enhancedPoint;
    } catch (e) {
      console.error('Error enhancing heart rate data:', e, 'for item:', item);
      // Even in error case, create a properly structured data point
      const timestamp = item.timestamp || Date.now() / 1000;
      const date = new Date(timestamp * 1000);
      const formattedTime = format(date, 'hh:mm:ss a');
      const hrValue = item.avg !== undefined ? item.avg : (item.value !== undefined ? item.value : 0);
      
      return {
        ...item,
        source: source,
        timestamp: timestamp,
        // Normalized fields even for error case
        value: hrValue,
        avg: hrValue,
        min: Math.floor(hrValue * 0.9),
        max: Math.ceil(hrValue * 1.1),
        delta: Math.ceil(hrValue * 0.2),
        time: formattedTime,
        formattedTime: formattedTime,
        zoneColor: '#8884d8',
        zoneName: 'Unknown',
        error: true
      };
    }
  });
};

/**
 * Calculate data quality score based on completeness and frequency
 * Used to determine the best data source to use
 * 
 * @param {Array} data - Health data to analyze
 * @param {Object} options - Options for scoring
 * @param {Array} options.requiredFields - Fields required for this data type
 * @param {Array} options.optionalFields - Fields that are optional but add value
 * @returns {number} Quality score (0-100)
 */
export const calculateDataQualityScore = (data, options = {}) => {
  if (!data || data.length === 0) return 0;
  
  const { 
    requiredFields = ['avg', 'value'],
    optionalFields = ['min', 'max', 'restingHeartRate']
  } = options;
  
  // Calculate score based on:
  // 1. Data points (quantity) - max 40 points
  const dataPointsScore = Math.min(40, data.length / 10);
  
  // 2. Completeness (has required/optional values) - max 30 points
  let completenessCount = 0;
  const maxCompleteness = data.length * (requiredFields.length + optionalFields.length);
  
  data.forEach(item => {
    // Check required fields
    requiredFields.forEach(field => {
      if (item[field]) completenessCount += 2;
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (item[field]) completenessCount += 1;
    });
  });
  
  const completenessScore = Math.min(30, (completenessCount / maxCompleteness) * 30);
  
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

/**
 * Combine data from multiple sources for comparison
 * 
 * @param {Object} dataSources - Object containing arrays of data from different sources
 * @param {Array} dataSources.fitbit - Fitbit data
 * @param {Array} dataSources.googleFit - Google Fit data
 * @param {Array} dataSources.appleHealth - Apple Health data
 * @returns {Array} Combined data with separate fields for each source
 */
export const combineDataForComparison = (dataSources) => {
  const combinedData = [];
  const timestamps = {};
  
  // Log sources and data lengths
  console.log("Combining data from sources:", 
    Object.entries(dataSources)
      .map(([source, data]) => `${source}: ${data?.length || 0} points`)
      .join(", ")
  );
  
  // Process each data source
  Object.entries(dataSources).forEach(([source, data]) => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    
    console.log(`Processing ${source} data: ${data.length} points`);
    
    // Create a map of timestamps to data points
    data.forEach(item => {
      let timestamp;
      
      if (item.timestamp) {
        timestamp = item.timestamp;
      } else if (item.date) {
        timestamp = new Date(item.date + (item.time ? ' ' + item.time : '')).getTime() / 1000;
      } else {
        // Skip items with no timestamp
        return;
      }
      
      // Round timestamp to nearest minute for better matching between sources
      timestamp = Math.round(timestamp / 60) * 60;
      
      // Create or update the timestamp entry
      if (!timestamps[timestamp]) {
        timestamps[timestamp] = {
          timestamp,
          date: item.date || format(new Date(timestamp * 1000), 'yyyy-MM-dd'),
          time: item.time || format(new Date(timestamp * 1000), 'HH:mm:ss'),
          formattedTime: item.formattedTime || format(new Date(timestamp * 1000), 'HH:mm:ss')
        };
      }
      
      // Add source-specific data
      const hrValue = item.avg || item.value || 0;
      timestamps[timestamp][`${source}Avg`] = hrValue;
      timestamps[timestamp][`${source}Min`] = item.min || hrValue * 0.9; // Estimate if not available
      timestamps[timestamp][`${source}Max`] = item.max || hrValue * 1.1; // Estimate if not available
    });
  });
  
  // Log timestamp entries found
  console.log(`Created ${Object.keys(timestamps).length} combined data points`);
  
  // Convert the timestamps object to an array and sort by timestamp
  return Object.values(timestamps).sort((a, b) => a.timestamp - b.timestamp);
};