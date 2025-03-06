import { format, subDays, subMinutes, addHours, addMinutes } from 'date-fns';

// Generate mock heart rate data
export const generateMockHeartRateData = (period, source = 'fitbit') => {
  const today = new Date();
  const maxCount = period === 'day' ? 288 : // 5 minute intervals for a day (24 * 12)
                  period === 'week' ? 336 : // hourly intervals for a week (7 * 24) * 2
                  period === 'month' ? 672 : // 2-hour intervals for a month (30 * 24) / 2 * 2
                  period === '3month' ? 1080 : // 6-hour intervals for 3 months (90 * 24) / 6 * 3
                  period === 'year' ? 2016 : 288; // daily intervals for a year (366 * 5.5)
  
  // Generate mock data points
  const mockData = [];
  const maxHR = 110 + Math.random() * 50; // Random max HR between 110-160
  const restingHR = 55 + Math.random() * 15; // Random resting HR between 55-70
  const avgHR = restingHR + (maxHR - restingHR) * 0.4; // Weighted closer to resting
  
  // Create a realistic day pattern with lower resting period, active period, and high intensity
  const dayPattern = [
    // Night - low HR (sleep)
    { start: 0, end: 6, baseHR: restingHR - 10, variance: 5 },
    // Morning - increasing HR (waking up, breakfast, commute)
    { start: 6, end: 9, baseHR: restingHR + 10, variance: 15 },
    // Work morning - moderate HR (typical day)
    { start: 9, end: 12, baseHR: restingHR + 20, variance: 10 },
    // Lunch - slight increase in HR
    { start: 12, end: 14, baseHR: restingHR + 25, variance: 15 },
    // Work afternoon - moderate HR
    { start: 14, end: 17, baseHR: restingHR + 15, variance: 10 },
    // Exercise - high HR (workout)
    { start: 17, end: 19, baseHR: maxHR - 20, variance: 25 },
    // Evening - decreasing HR (relaxing)
    { start: 19, end: 22, baseHR: restingHR + 15, variance: 10 },
    // Bedtime - approaching resting HR
    { start: 22, end: 24, baseHR: restingHR, variance: 5 }
  ];

  // Helper to get the appropriate base HR for a time
  const getBaseHRForTime = (hour) => {
    const pattern = dayPattern.find(p => hour >= p.start && hour < p.end);
    return pattern ? pattern.baseHR : restingHR;
  };
  
  // Helper to get the appropriate variance for a time
  const getVarianceForTime = (hour) => {
    const pattern = dayPattern.find(p => hour >= p.start && hour < p.end);
    return pattern ? pattern.variance : 5;
  };

  // Generate data based on period
  let intervalMinutes;
  let startDate;
  
  switch(period) {
    case 'day':
      intervalMinutes = 5; // 5-minute intervals for a day
      startDate = subDays(today, 0);
      break;
    case 'week':
      intervalMinutes = 30; // 30-minute intervals for a week
      startDate = subDays(today, 6);
      break;
    case 'month':
      intervalMinutes = 60; // hourly for a month
      startDate = subDays(today, 29);
      break;
    case '3month':
      intervalMinutes = 180; // 3-hour intervals for 3 months
      startDate = subDays(today, 89);
      break;
    case 'year':
      intervalMinutes = 720; // 12-hour intervals for a year
      startDate = subDays(today, 364);
      break;
    default:
      intervalMinutes = 5;
      startDate = subDays(today, 0);
  }
  
  // Generate data points
  for (let i = 0; i < maxCount; i++) {
    const timestamp = addMinutes(startDate, i * intervalMinutes);
    const hour = timestamp.getHours();
    const baseHR = getBaseHRForTime(hour);
    const variance = getVarianceForTime(hour);
    
    // Add some natural variability to heart rate
    const heartRate = Math.max(40, Math.round(baseHR + (Math.random() * variance * 2 - variance)));
    
    // Some weekly patterns
    const weekDay = timestamp.getDay();
    const isWeekend = weekDay === 0 || weekDay === 6;
    const dayModifier = isWeekend ? 1.1 : 1.0; // Slightly higher HR on weekends
    
    // Format the time as AM/PM
    const hours12 = timestamp.getHours() % 12 || 12;
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const amPm = timestamp.getHours() >= 12 ? 'PM' : 'AM';
    const timeFormatted = `${hours12}:${minutes} ${amPm}`;
    
    // Create data point with Fitbit-like format
    mockData.push({
      date: format(timestamp, 'yyyy-MM-dd'),
      time: timeFormatted,
      value: Math.round(heartRate * dayModifier),
      avg: Math.round(heartRate * dayModifier),
      min: Math.max(40, Math.round((heartRate * dayModifier) - Math.random() * 10)),
      max: Math.round((heartRate * dayModifier) + Math.random() * 15),
      restingHeartRate: i % 144 === 0 ? Math.round(restingHR) : undefined, // Add resting HR once per day
      source: source
    });
  }
  
  // Add some abnormality if needed for demo purposes
  if (Math.random() > 0.5) {
    // Add a high heart rate abnormality
    const randomIndex = Math.floor(Math.random() * mockData.length * 0.7); // In the first 70% of the data
    
    // Create a "spike" over several data points
    for (let i = 0; i < 5; i++) {
      const adjustIndex = randomIndex + i;
      if (adjustIndex < mockData.length) {
        const spikeHR = 120 + Math.random() * 40; // Random spike between 120-160
        mockData[adjustIndex].value = Math.round(spikeHR);
        mockData[adjustIndex].avg = Math.round(spikeHR);
        mockData[adjustIndex].max = Math.round(spikeHR + Math.random() * 10);
      }
    }
  }

  return {
    data: mockData,
    meta: {
      period,
      source,
      count: mockData.length,
      avgHR: Math.round(avgHR),
      maxHR: Math.round(maxHR),
      restingHR: Math.round(restingHR)
    }
  };
};