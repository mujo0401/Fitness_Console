/**
 * A dedicated helper function to combine and normalize heart rate data from multiple sources
 * for side-by-side comparison on charts.
 * 
 * This function ensures all data points have consistent field names and formats, making
 * them ready for direct use in chart components.
 */

import { format } from 'date-fns';

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
        // Create a new timestamp entry with consistent date/time fields
        const date = new Date(timestamp * 1000);
        const formattedDate = format(date, 'yyyy-MM-dd');
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        const formattedTime = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
        
        timestamps[timestamp] = {
          timestamp,
          date: formattedDate,
          time: formattedTime,
          formattedTime: formattedTime,
          formattedDate: formattedDate
        };
      }
      
      // Add source-specific data
      const hrValue = item.avg !== undefined ? item.avg : (item.value !== undefined ? item.value : 0);
      timestamps[timestamp][`${source}Avg`] = hrValue;
      timestamps[timestamp][`${source}Min`] = item.min !== undefined ? item.min : Math.floor(hrValue * 0.9);
      timestamps[timestamp][`${source}Max`] = item.max !== undefined ? item.max : Math.ceil(hrValue * 1.1);
      
      // Also set generic fields for compatibility
      if (!timestamps[timestamp].avg) {
        timestamps[timestamp].avg = hrValue;
        timestamps[timestamp].min = timestamps[timestamp][`${source}Min`];
        timestamps[timestamp].max = timestamps[timestamp][`${source}Max`];
      }
    });
  });
  
  // Log timestamp entries found
  console.log(`Created ${Object.keys(timestamps).length} combined data points`);
  
  // Convert the timestamps object to an array and sort by timestamp
  return Object.values(timestamps).sort((a, b) => a.timestamp - b.timestamp);
};