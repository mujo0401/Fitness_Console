import { format } from 'date-fns';
import { HR_ZONES } from '../constants/heartRateConstants';

// Get heart rate zone for a given value
export const getHeartRateZone = (value) => {
  if (!value) return null;
  return HR_ZONES.find(zone => value >= zone.min && value < zone.max);
};

// Calculate heart rate zone distribution
export const calculateZoneDistribution = (heartRateData) => {
  if (!heartRateData || heartRateData.length === 0) return [];
  
  // Initialize counters for each zone
  const zoneCounts = HR_ZONES.reduce((acc, zone) => {
    acc[zone.name] = 0;
    return acc;
  }, {});
  
  // Count data points in each zone
  heartRateData.forEach(item => {
    const hr = item.avg || item.value || 0;
    if (hr > 0) {
      const zone = getHeartRateZone(hr);
      if (zone) {
        zoneCounts[zone.name]++;
      }
    }
  });
  
  // Calculate percentages and prepare results
  const totalPoints = heartRateData.length;
  const distribution = HR_ZONES.map(zone => ({
    name: zone.name,
    value: Math.round((zoneCounts[zone.name] / totalPoints) * 100),
    count: zoneCounts[zone.name],
    color: zone.color,
    gradient: zone.gradient,
    intensity: zone.intensity,
    icon: zone.icon,
    description: zone.description,
    benefits: zone.benefits,
    recommendation: zone.recommendation,
  }));
  
  return distribution;
};

// Calculate advanced heart metrics
export const calculateAdvancedHeartMetrics = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 10) {
    return {
      hrvScore: 0,
      recoveryScore: 0,
      stressLevel: 0,
      cardiacEfficiency: 0,
      restingHR: 0,
      maxHR: 0,
      hrVariabilityIndex: 0,
      hrvStatus: 'Unknown',
      heartAgeEstimate: 0,
      cardioFitnessScore: 0,
      abnormalEvents: [],
    };
  }
  
  // Extract valid heart rate values
  const values = heartRateData
    .filter(item => {
      const val = item.avg || item.value || 0;
      if (val === 0) {
        console.warn("Zero heart rate value found:", item);
      }
      return val > 0;
    })
    .map(item => item.avg || item.value);
  
  console.log(`Found ${values.length} valid heart rate values out of ${heartRateData.length} entries`);
  
  // Basic statistics
  const avgHR = values.reduce((sum, val) => sum + val, 0) / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const minHR = sortedValues[0];
  const maxHR = sortedValues[sortedValues.length - 1];
  const medianHR = sortedValues[Math.floor(sortedValues.length / 2)];
  const restingHR = Math.min(...heartRateData.filter(item => item.restingHeartRate || 0 > 0).map(item => item.restingHeartRate)) || sortedValues[Math.floor(sortedValues.length * 0.1)];
  
  // Calculate heart rate variability (RMSSD) - Root Mean Square of Successive Differences
  const differences = [];
  for (let i = 1; i < values.length; i++) {
    differences.push(Math.abs(values[i] - values[i-1]));
  }
  
  const squaredDiffs = differences.map(diff => diff * diff);
  const meanSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  const rmssd = Math.sqrt(meanSquaredDiff);
  const hrvScore = Math.min(100, Math.round(rmssd * 1.5));
  
  // Approximate VO2 max calculation based on resting heart rate
  // Using the Uth–Sørensen–Overgaard–Pedersen formula
  const vo2Max = 15.3 * (maxHR / restingHR);
  
  // Cardiac efficiency ratio (resting HR to max HR ratio)
  const cardiacEfficiency = (1 - (restingHR / maxHR)) * 100;
  
  // Recovery score (0-100) based on HRV and resting HR
  const recoveryScore = Math.min(100, Math.max(0, 
    70 + // Base score
    (restingHR < 60 ? 15 : restingHR < 70 ? 5 : -5) + // Resting HR bonus/penalty
    (hrvScore > 60 ? 15 : hrvScore > 40 ? 5 : -5) // HRV bonus/penalty
  ));
  
  // Stress level (0-100) - inverse of HRV score with adjustments
  const stressLevel = Math.max(0, Math.min(100, 100 - hrvScore + 
    (restingHR > 80 ? 10 : restingHR > 70 ? 5 : 0)));
  
  // Heart age estimate (very rough approximation based on resting HR)
  // Lower resting HR generally indicates better cardiovascular fitness
  const baseAge = 40; // Baseline age
  const heartAgeEstimate = Math.max(20, Math.round(baseAge + (restingHR - 60) * 0.7));
  
  // Cardio fitness score (0-100)
  const cardioFitnessScore = Math.max(0, Math.min(100, 
    Math.round(50 + (vo2Max - 35) * 1.5 + (60 - restingHR) * 0.5)
  ));
  
  // HRV status based on score
  let hrvStatus = 'Unknown';
  if (hrvScore >= 80) hrvStatus = 'Excellent';
  else if (hrvScore >= 60) hrvStatus = 'Good';
  else if (hrvScore >= 40) hrvStatus = 'Moderate';
  else if (hrvScore >= 20) hrvStatus = 'Fair';
  else hrvStatus = 'Poor';
  
  // Check for abnormal patterns
  const abnormalEvents = detectAbnormalPatterns(heartRateData);
  
  return {
    hrvScore,
    recoveryScore,
    stressLevel,
    cardiacEfficiency,
    restingHR,
    maxHR,
    avgHR,
    vo2Max: Math.round(vo2Max),
    hrvStatus,
    heartAgeEstimate,
    cardioFitnessScore,
    abnormalEvents,
  };
};

// Detect abnormal patterns in heart rate data
export const detectAbnormalPatterns = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 10) return [];
  
  const abnormalities = [];
  const values = heartRateData.map(item => item.avg || item.value || 0);
  
  // Calculate mean and standard deviation
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Threshold for abnormal values (2 standard deviations)
  const highThreshold = mean + (stdDev * 2);
  const lowThreshold = Math.max(40, mean - (stdDev * 2)); // Not lower than 40 BPM
  
  // Detect sudden changes (more than 20 BPM in consecutive readings)
  for (let i = 1; i < values.length; i++) {
    const change = Math.abs(values[i] - values[i-1]);
    if (change > 20) {
      abnormalities.push({
        type: 'Sudden change',
        value: `Change of ${Math.round(change)} BPM`,
        index: i,
        severity: change > 35 ? 'High' : 'Medium',
        time: heartRateData[i].time || '',
        date: heartRateData[i].date || format(new Date(), 'yyyy-MM-dd'),
        recommendation: "This could indicate a rapid transition between activities or a potential arrhythmia.",
        details: "Sudden heart rate changes can be normal during exercise or stress, but unexpected shifts may require attention.",
        action: "Compare with activity data to see if this correlates with exercise or movement."
      });
    }
  }
  
  // Detect sustained high heart rate (>100 BPM for multiple readings)
  let highHRCount = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > 100) {
      highHRCount++;
      if (highHRCount === 5) {
        abnormalities.push({
          type: 'Sustained high heart rate',
          value: `${Math.round(values[i])} BPM sustained`,
          index: i,
          severity: values[i] > 120 ? 'High' : 'Medium',
          time: heartRateData[i].time || '',
          date: heartRateData[i].date || format(new Date(), 'yyyy-MM-dd'),
          recommendation: "Consider checking for stress, anxiety, or excessive caffeine/stimulant intake.",
          details: "Elevated heart rate for extended periods may indicate physiological stress, illness, or medication effects.",
          action: "If recurring, consider tracking potential triggers like caffeine, stress, or medications."
        });
        highHRCount = 0;
      }
    } else {
      highHRCount = 0;
    }
  }
  
  // Limit to top 6 abnormalities by severity
  return abnormalities
    .sort((a, b) => {
      const severityScore = {High: 3, Medium: 2, Low: 1};
      return severityScore[b.severity] - severityScore[a.severity];
    })
    .slice(0, 6);
};

// Calculate heart rate variability
export const calculateHRV = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 2) return 0;
  
  // Get consecutive heart rate values
  const values = heartRateData
    .filter(item => item.avg || item.value)
    .map(item => item.avg || item.value);
  
  if (values.length < 2) return 0;
  
  // Calculate differences between adjacent values
  const differences = [];
  for (let i = 1; i < values.length; i++) {
    differences.push(Math.abs(values[i] - values[i-1]));
  }
  
  // Calculate root mean square of differences
  const squaredDiffs = differences.map(diff => diff * diff);
  const meanSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  const rmssd = Math.sqrt(meanSquaredDiff);
  
  return Math.round(rmssd);
};

// Find periods of high stress in heart rate data
export const findHighStressPeriods = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 10) return [];
  
  // Find periods where heart rate is significantly higher than resting
  const values = heartRateData.map(item => item.avg || item.value || 0);
  const restingEstimate = Math.min(...values.filter(v => v > 40));
  const highStressThreshold = restingEstimate * 1.5;
  
  return heartRateData
    .filter(item => (item.avg || item.value || 0) > highStressThreshold)
    .slice(0, 3);
};

// Calculate data quality score based on completeness and frequency
export const calculateDataQuality = (data) => {
  if (!data || data.length === 0) return 0;
  
  // Data points count (more is better)
  const countScore = Math.min(data.length / 100, 1) * 40;
  
  // Data freshness (is recent data available)
  const now = new Date();
  
  try {
    const mostRecentData = data.reduce((latest, point) => {
      let pointDate;
      
      try {
        // Handle Google Fit timestamp (seconds since epoch)
        if (typeof point.timestamp === 'number') {
          pointDate = new Date(point.timestamp * 1000);
          console.log(`Converted timestamp ${point.timestamp} to date: ${pointDate.toISOString()}`);
        } 
        // Handle string timestamp
        else if (point.timestamp) {
          // Check if timestamp is numeric string
          if (!isNaN(Number(point.timestamp))) {
            pointDate = new Date(Number(point.timestamp) * 1000);
            console.log(`Converted numeric string timestamp ${point.timestamp} to date: ${pointDate.toISOString()}`);
          } else {
            pointDate = new Date(point.timestamp);
            console.log(`Parsed string timestamp ${point.timestamp} to date: ${pointDate.toISOString()}`);
          }
        }
        // Handle date + time strings
        else if (point.date) {
          pointDate = new Date(point.date + ' ' + (point.time || '00:00'));
          console.log(`Parsed date+time ${point.date} ${point.time || '00:00'} to: ${pointDate.toISOString()}`);
        }
        // Fallback
        else {
          pointDate = new Date();
          console.log(`Using fallback current date: ${pointDate.toISOString()}`);
        }
        
        // Only use valid dates
        if (isNaN(pointDate.getTime())) {
          pointDate = new Date();
          console.log(`Invalid date detected, using current date: ${pointDate.toISOString()}`);
        }
      } catch (e) {
        console.error("Error parsing date:", e, "from point:", point);
        pointDate = new Date();
      }
      
      return pointDate > latest ? pointDate : latest;
    }, new Date(0));
    
    const hoursSinceLatest = (now - mostRecentData) / (1000 * 60 * 60);
    const freshnessScore = Math.max(0, (24 - hoursSinceLatest) / 24) * 30;
    
    // Data consistency (regular intervals)
    let intervalScores = [];
    for (let i = 1; i < data.length && i < 100; i++) { // Limit to max 100 points for performance
      let curr, prev;
      
      try {
        // Handle Google Fit timestamp (seconds since epoch)
        if (typeof data[i].timestamp === 'number') {
          curr = new Date(data[i].timestamp * 1000);
        } 
        // Handle string timestamp
        else if (data[i].timestamp) {
          curr = new Date(data[i].timestamp * 1000);
        }
        // Handle date + time strings
        else if (data[i].date) {
          curr = new Date(data[i].date + ' ' + (data[i].time || '00:00'));
        }
        // Fallback
        else {
          continue; // Skip this point if we can't determine the time
        }
        
        // Same for previous point
        if (typeof data[i-1].timestamp === 'number') {
          prev = new Date(data[i-1].timestamp * 1000);
        }
        else if (data[i-1].timestamp) {
          prev = new Date(data[i-1].timestamp * 1000);
        }
        else if (data[i-1].date) {
          prev = new Date(data[i-1].date + ' ' + (data[i-1].time || '00:00'));
        }
        else {
          continue;
        }
        
        // Skip invalid dates
        if (isNaN(curr.getTime()) || isNaN(prev.getTime())) {
          continue;
        }
        
        const interval = Math.abs(curr - prev);
        if (interval > 0) {
          intervalScores.push(interval);
        }
      } catch (e) {
        console.error("Error calculating interval:", e);
        continue;
      }
    }
    
    // Calculate consistency - lower standard deviation is better
    let consistencyScore = 15; // Default middle score
    
    if (intervalScores.length > 0) {
      const avgInterval = intervalScores.reduce((sum, val) => sum + val, 0) / intervalScores.length;
      const variance = intervalScores.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervalScores.length;
      const stdDev = Math.sqrt(variance);
      consistencyScore = Math.max(0, (3600000 - stdDev) / 3600000) * 30; // 1 hour is threshold
    }
    
    // Ensure we return a reasonable score
    const totalScore = Math.round(countScore + freshnessScore + consistencyScore);
    
    // Return at least 1 if data exists
    return Math.max(1, totalScore);
  } catch (e) {
    console.error("Error calculating data quality:", e);
    // Return at least 1 for data quality if data exists
    return 1;
  }
};