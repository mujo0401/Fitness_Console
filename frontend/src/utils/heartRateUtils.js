import { format } from 'date-fns';
import { HR_ZONES } from '../constants/heartRateConstants';

// Get heart rate zone for a given value
export const getHeartRateZone = (value) => {
  if (!value) return null;
  return HR_ZONES.find(zone => value >= zone.min && value < zone.max);
};

// Calculate heart rate zone distribution
export const calculateZoneDistribution = (heartRateData) => {
  if (!heartRateData || heartRateData.length === 0) {
    console.log("No data available for zone distribution calculation");
    return HR_ZONES.map(zone => ({
      name: zone.name,
      value: 0,
      count: 0,
      color: zone.color,
      gradient: zone.gradient,
      intensity: zone.intensity,
      icon: zone.icon,
      description: zone.description,
      benefits: zone.benefits,
      recommendation: zone.recommendation,
    }));
  }
  
  console.log(`Calculating zone distribution for ${heartRateData.length} data points`);
  
  // Initialize counters for each zone
  const zoneCounts = HR_ZONES.reduce((acc, zone) => {
    acc[zone.name] = 0;
    return acc;
  }, {});
  
  // Count valid data points for denominator
  let validPoints = 0;
  
  // Count data points in each zone
  heartRateData.forEach(item => {
    const hr = item.avg || item.value || 0;
    if (hr > 0) {
      validPoints++;
      const zone = getHeartRateZone(hr);
      if (zone) {
        zoneCounts[zone.name]++;
      }
    }
  });
  
  // Use valid points as denominator or fallback to total points
  const totalPoints = validPoints || heartRateData.length;
  console.log(`Found ${validPoints} valid heart rate points out of ${heartRateData.length} total points`);
  
  // Calculate percentages and prepare results
  const distribution = HR_ZONES.map(zone => {
    const count = zoneCounts[zone.name];
    const percentage = totalPoints > 0 ? Math.round((count / totalPoints) * 100) : 0;
    
    return {
      name: zone.name,
      value: percentage,
      count: count,
      color: zone.color,
      gradient: zone.gradient,
      intensity: zone.intensity,
      icon: zone.icon,
      description: zone.description,
      benefits: zone.benefits,
      recommendation: zone.recommendation,
    };
  });
  
  console.log("Zone distribution:", distribution.map(z => `${z.name}: ${z.value}%`).join(', '));
  return distribution;
};

// Calculate advanced heart metrics
export const calculateAdvancedHeartMetrics = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 10) {
    console.log("Insufficient data for advanced heart metrics calculation");
    return {
      hrvScore: 0,
      recoveryScore: 0,
      stressLevel: 0,
      cardiacEfficiency: 0,
      restingHR: 0,
      maxHR: 0,
      avgHR: 0,
      hrVariabilityIndex: 0,
      hrvStatus: 'Unknown',
      heartAgeEstimate: 0,
      cardioFitnessScore: 0,
      abnormalEvents: [],
      zoneDistribution: [],
    };
  }
  
  // Extract valid heart rate values
  const values = heartRateData
    .filter(item => {
      const val = item.avg || item.value || 0;
      return val > 30; // Filter out likely errors below 30 BPM
    })
    .map(item => item.avg || item.value);
  
  console.log(`Found ${values.length} valid heart rate values out of ${heartRateData.length} entries`);
  
  if (values.length < 5) {
    console.log("Too few valid heart rate values for meaningful analysis");
    return {
      hrvScore: 0,
      recoveryScore: 0,
      stressLevel: 0,
      cardiacEfficiency: 0,
      restingHR: 0,
      maxHR: 0,
      avgHR: 0,
      hrVariabilityIndex: 0,
      hrvStatus: 'Unknown',
      heartAgeEstimate: 0,
      cardioFitnessScore: 0,
      abnormalEvents: [],
      zoneDistribution: [],
    };
  }
  
  // Basic statistics
  const avgHR = values.reduce((sum, val) => sum + val, 0) / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const minHR = sortedValues[0];
  const maxHR = sortedValues[sortedValues.length - 1];
  const medianHR = sortedValues[Math.floor(sortedValues.length / 2)];
  
  // Get resting heart rate - either from data or estimate from lowest 10%
  let restingHR = 0;
  const explicitRestingValues = heartRateData
    .filter(item => (item.restingHeartRate || 0) > 30)
    .map(item => item.restingHeartRate);
    
  if (explicitRestingValues.length > 0) {
    restingHR = Math.min(...explicitRestingValues);
    console.log(`Using explicit resting HR: ${restingHR} BPM`);
  } else {
    // Estimate from lowest 10% of values
    const lowestIndex = Math.max(1, Math.floor(sortedValues.length * 0.1));
    const lowestValues = sortedValues.slice(0, lowestIndex);
    restingHR = Math.round(lowestValues.reduce((sum, val) => sum + val, 0) / lowestValues.length);
    console.log(`Estimated resting HR from lowest 10% of values: ${restingHR} BPM`);
  }
  
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
  const vo2Max = restingHR > 0 ? 15.3 * (maxHR / restingHR) : 0;
  
  // Cardiac efficiency ratio (resting HR to max HR ratio)
  const cardiacEfficiency = restingHR > 0 ? (1 - (restingHR / maxHR)) * 100 : 0;
  
  // Recovery score (0-100) based on HRV and resting HR
  const recoveryScore = Math.min(100, Math.max(0, 
    70 + // Base score
    (restingHR < 50 ? 15 : restingHR < 60 ? 10 : restingHR < 70 ? 5 : restingHR > 80 ? -5 : 0) + // Resting HR adjustment
    (hrvScore > 70 ? 15 : hrvScore > 50 ? 10 : hrvScore > 30 ? 5 : hrvScore < 15 ? -5 : 0) // HRV adjustment
  ));
  
  // Stress level (0-100) - inverse of HRV score with adjustments
  const stressLevel = Math.max(0, Math.min(100, 100 - hrvScore + 
    (restingHR > 85 ? 15 : restingHR > 75 ? 10 : restingHR > 65 ? 5 : 0)));
  
  // Heart age estimate (very rough approximation based on resting HR and HRV)
  // Lower resting HR and higher HRV generally indicates better cardiovascular fitness
  const baseAge = 40; // Baseline age
  const heartAgeEstimate = Math.max(20, Math.round(
    baseAge + 
    (restingHR - 60) * 0.7 + // Higher resting HR = higher estimated age
    (30 - Math.min(30, hrvScore/2)) * 0.5 // Lower HRV = higher estimated age
  ));
  
  // Cardio fitness score (0-100)
  const cardioFitnessScore = Math.max(0, Math.min(100, 
    Math.round(
      50 + // Base score
      (vo2Max > 35 ? (vo2Max - 35) * 1.2 : 0) + // VO2 max bonus
      (60 - Math.min(60, restingHR)) * 0.5 + // Resting HR bonus
      (hrvScore - 20) * 0.3 // HRV bonus
    )
  ));
  
  // HRV status based on score
  let hrvStatus = 'Unknown';
  if (hrvScore >= 70) hrvStatus = 'Excellent';
  else if (hrvScore >= 50) hrvStatus = 'Good';
  else if (hrvScore >= 30) hrvStatus = 'Moderate';
  else if (hrvScore >= 15) hrvStatus = 'Fair';
  else hrvStatus = 'Poor';
  
  // Calculate zone distribution
  const zoneDistribution = calculateZoneDistribution(heartRateData);
  
  // Check for abnormal patterns
  const abnormalEvents = detectAbnormalPatterns(heartRateData);
  
  // Calculate recovery rate
  let recoveryRate = 0;
  
  // Find peak heart rate and the following min
  let peakHR = maxHR;
  let peakIndex = values.indexOf(peakHR);
  
  // Need to have data after the peak
  if (peakIndex >= 0 && peakIndex < values.length - 5) {
    // Look at recovery window after peak
    const recoveryWindow = Math.min(5, values.length - peakIndex - 1);
    recoveryRate = Math.max(0, Math.round(peakHR - values[peakIndex + recoveryWindow]));
    console.log(`Recovery rate: ${recoveryRate} BPM (from ${peakHR} to ${values[peakIndex + recoveryWindow]})`);
  } else {
    console.log("Unable to calculate recovery rate - peak not found or insufficient data after peak");
  }
  
  // Log metrics summary
  console.log(`Heart Metrics: Avg HR=${Math.round(avgHR)}, Min=${minHR}, Max=${maxHR}, Resting=${restingHR}, HRV=${hrvScore}, Recovery=${recoveryRate}`);
  
  return {
    hrvScore,
    recoveryScore,
    stressLevel,
    cardiacEfficiency: Math.round(cardiacEfficiency),
    restingHR,
    maxHR,
    minHR,
    avgHR: Math.round(avgHR),
    medianHR,
    recoveryRate,
    vo2Max: Math.round(vo2Max),
    hrvStatus,
    heartAgeEstimate,
    cardioFitnessScore,
    abnormalEvents,
    zoneDistribution,
  };
};

// Detect abnormal patterns in heart rate data
export const detectAbnormalPatterns = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 10) return [];
  
  const abnormalities = [];
  const values = heartRateData
    .map(item => item.avg || item.value || 0)
    .filter(v => v > 30); // Filter out likely errors
  
  if (values.length < 10) return [];
  
  // Calculate mean and standard deviation
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Threshold for abnormal values (2 standard deviations)
  const highThreshold = mean + (stdDev * 2);
  const lowThreshold = Math.max(40, mean - (stdDev * 2)); // Not lower than 40 BPM
  
  console.log(`Abnormality thresholds - Mean: ${Math.round(mean)}, StdDev: ${Math.round(stdDev)}, High: ${Math.round(highThreshold)}, Low: ${Math.round(lowThreshold)}`);
  
  // Detect sudden changes (more than 20 BPM in consecutive readings)
  for (let i = 1; i < values.length; i++) {
    const change = Math.abs(values[i] - values[i-1]);
    if (change > 20) {
      abnormalities.push({
        type: 'Sudden change',
        value: `Change of ${Math.round(change)} BPM`,
        index: i,
        severity: change > 35 ? 'High' : 'Medium',
        time: heartRateData[i].formattedTime || heartRateData[i].time || '',
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
          time: heartRateData[i].formattedTime || heartRateData[i].time || '',
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
  
  // Detect unusually low heart rates (based on calculated threshold)
  for (let i = 0; i < values.length; i++) {
    if (values[i] < lowThreshold && values[i] > 35) {
      abnormalities.push({
        type: 'Unusually low heart rate',
        value: `${Math.round(values[i])} BPM (<${Math.round(lowThreshold)})`,
        index: i,
        severity: values[i] < 40 ? 'High' : 'Medium',
        time: heartRateData[i].formattedTime || heartRateData[i].time || '',
        date: heartRateData[i].date || format(new Date(), 'yyyy-MM-dd'),
        recommendation: "Assess if this occurred during deep rest or is unusually low for you.",
        details: "Some people naturally have lower heart rates, especially athletes. However, unexpectedly low heart rates can sometimes indicate heart block or other issues.",
        action: "If this pattern is new or causes symptoms, consider seeking medical advice."
      });
      // Skip a few points to avoid multiple alerts for the same period
      i += 5;
    }
  }
  
  // Detect unusually high heart rates (outside expected range)
  for (let i = 0; i < values.length; i++) {
    if (values[i] > highThreshold) {
      abnormalities.push({
        type: 'Unusually high heart rate',
        value: `${Math.round(values[i])} BPM (>${Math.round(highThreshold)})`,
        index: i,
        severity: 'Medium',
        time: heartRateData[i].formattedTime || heartRateData[i].time || '',
        date: heartRateData[i].date || format(new Date(), 'yyyy-MM-dd'),
        recommendation: "Check if this coincided with exercise, stress, or stimulant intake.",
        details: "Heart rates significantly above your typical range can indicate stress responses or potentially an arrhythmia if persistent.",
        action: "Monitor frequency and duration of these episodes, especially if they occur at rest."
      });
      // Skip a few points to avoid multiple alerts for the same period
      i += 5;
    }
  }
  
  // Check for abnormal rhythms through pattern analysis
  const rhythmAnomalies = analyzeRhythmPatterns(values);
  abnormalities.push(...rhythmAnomalies);
  
  console.log(`Detected ${abnormalities.length} potential abnormalities in heart rate data`);
  
  // Limit to top abnormalities by severity
  return abnormalities
    .sort((a, b) => {
      const severityScore = {High: 3, Medium: 2, Low: 1};
      return severityScore[b.severity] - severityScore[a.severity];
    })
    .slice(0, 5);
};

// Analyze heart rate data for rhythm abnormalities
function analyzeRhythmPatterns(values) {
  if (values.length < 20) return [];
  
  const anomalies = [];
  const minSegmentLength = 5; // Minimum number of points to analyze
  
  // Calculate average sequential difference
  let diffs = [];
  for (let i = 1; i < values.length; i++) {
    diffs.push(values[i] - values[i-1]);
  }
  
  // Check for alternating patterns (potential sign of atrial fibrillation or other arrhythmias)
  // This looks for repeat up-down-up-down patterns
  let alternatingCount = 0;
  let lastDirection = 0;
  
  for (let i = 0; i < diffs.length; i++) {
    const currentDirection = Math.sign(diffs[i]);
    
    if (currentDirection !== 0 && currentDirection === -lastDirection) {
      alternatingCount++;
      if (alternatingCount >= 5) {
        anomalies.push({
          type: 'Alternating pattern',
          value: 'Irregular rhythm detected',
          index: i,
          severity: 'Medium',
          recommendation: "This alternating pattern may indicate rhythm variability."
        });
        break;
      }
    } else {
      alternatingCount = 0;
    }
    
    if (currentDirection !== 0) {
      lastDirection = currentDirection;
    }
  }
  
  return anomalies;
}

// Calculate heart rate variability
export const calculateHRV = (heartRateData) => {
  if (!heartRateData || heartRateData.length < 2) return 0;
  
  // Get consecutive heart rate values
  const values = heartRateData
    .filter(item => (item.avg || item.value || 0) > 30) // Filter likely errors
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
  const values = heartRateData
    .map(item => item.avg || item.value || 0)
    .filter(v => v > 30); // Filter likely errors
    
  if (values.length < 5) return [];
  
  // Estimate resting heart rate from lowest 10% of values
  const sortedValues = [...values].sort((a, b) => a - b);
  const lowestIndex = Math.max(1, Math.floor(sortedValues.length * 0.1));
  const lowestValues = sortedValues.slice(0, lowestIndex);
  const restingEstimate = Math.round(lowestValues.reduce((sum, val) => sum + val, 0) / lowestValues.length);
  
  const highStressThreshold = restingEstimate * 1.5;
  
  // Find points above the threshold
  const stressPeriods = [];
  let currentPeriod = null;
  
  for (let i = 0; i < heartRateData.length; i++) {
    const hr = heartRateData[i].avg || heartRateData[i].value || 0;
    
    if (hr > highStressThreshold) {
      if (!currentPeriod) {
        currentPeriod = {
          startIndex: i,
          startTime: heartRateData[i].formattedTime || heartRateData[i].time || '',
          date: heartRateData[i].date || '',
          values: [hr]
        };
      } else {
        currentPeriod.values.push(hr);
      }
    } else if (currentPeriod) {
      // End of a stress period
      currentPeriod.endIndex = i - 1;
      currentPeriod.endTime = heartRateData[i-1].formattedTime || heartRateData[i-1].time || '';
      currentPeriod.avgHR = Math.round(currentPeriod.values.reduce((sum, v) => sum + v, 0) / currentPeriod.values.length);
      currentPeriod.maxHR = Math.max(...currentPeriod.values);
      currentPeriod.duration = currentPeriod.values.length; // Proxy for duration
      
      stressPeriods.push(currentPeriod);
      currentPeriod = null;
    }
  }
  
  // Handle case where the period extends to the end of the data
  if (currentPeriod) {
    currentPeriod.endIndex = heartRateData.length - 1;
    currentPeriod.endTime = heartRateData[heartRateData.length-1].formattedTime || heartRateData[heartRateData.length-1].time || '';
    currentPeriod.avgHR = Math.round(currentPeriod.values.reduce((sum, v) => sum + v, 0) / currentPeriod.values.length);
    currentPeriod.maxHR = Math.max(...currentPeriod.values);
    currentPeriod.duration = currentPeriod.values.length;
    
    stressPeriods.push(currentPeriod);
  }
  
  console.log(`Found ${stressPeriods.length} potential high stress periods using threshold ${highStressThreshold} BPM`);
  
  // Sort by duration (longer periods first) and return top 3
  return stressPeriods
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 3)
    .map(period => ({
      startTime: period.startTime,
      endTime: period.endTime,
      date: period.date,
      avgHR: period.avgHR,
      maxHR: period.maxHR,
      duration: period.duration,
      intensity: period.maxHR > restingEstimate * 1.8 ? 'High' : 'Medium'
    }));
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
        } 
        // Handle string timestamp
        else if (point.timestamp) {
          // Check if timestamp is numeric string
          if (!isNaN(Number(point.timestamp))) {
            pointDate = new Date(Number(point.timestamp) * 1000);
          } else {
            pointDate = new Date(point.timestamp);
          }
        }
        // Handle date + time strings
        else if (point.date) {
          pointDate = new Date(point.date + ' ' + (point.time || '00:00'));
        }
        // Fallback
        else {
          pointDate = new Date();
        }
        
        // Only use valid dates
        if (isNaN(pointDate.getTime())) {
          pointDate = new Date();
        }
      } catch (e) {
        console.error("Error parsing date:", e);
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