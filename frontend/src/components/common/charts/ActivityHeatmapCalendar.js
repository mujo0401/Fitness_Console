import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  alpha, 
  Tooltip, 
  Paper 
} from '@mui/material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isToday, 
  isSameDay, 
  subMonths, 
  addMonths, 
  isSameMonth 
} from 'date-fns';

/**
 * ActivityHeatmapCalendar component
 * Displays a monthly calendar where each day is colored by activity intensity
 * 
 * @param {Object} props
 * @param {Array} props.data - Activity data array with date and steps properties
 * @param {Date} props.currentDate - Current date to center the calendar on
 * @param {number} props.maxValue - Maximum value for the heatmap scale
 * @param {string} props.valueKey - Which data key to use for coloring (e.g., 'steps')
 * @param {Object} props.colorScale - Object with color ranges
 * @param {Function} props.onDateClick - Callback for when a date cell is clicked
 */
const ActivityHeatmapCalendar = ({
  data = [],
  currentDate = new Date(),
  maxValue = 10000,
  valueKey = 'steps',
  colorScale = {
    0: '#f1f5f9',       // 0 steps
    1: '#dbeafe',       // 1-2500 steps
    2500: '#93c5fd',    // 2500-5000 steps
    5000: '#60a5fa',    // 5000-7500 steps
    7500: '#3b82f6',    // 7500-10000 steps
    10000: '#2563eb',   // 10000+ steps
  },
  onDateClick = () => {}
}) => {
  const theme = useTheme();
  const today = new Date();
  
  // Process dates for the calendar
  const calendarData = useMemo(() => {
    // Get days of the month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get day of week for the 1st of the month (0 = Sunday, 1 = Monday, etc.)
    const startDay = getDay(monthStart);
    
    // Build calendar grid (6 rows x 7 columns)
    const calendarGrid = [];
    const totalSlots = 42; // 6 weeks x 7 days
    
    // Fill leading empty slots for the first week
    for (let i = 0; i < startDay; i++) {
      calendarGrid.push({ date: null, empty: true });
    }
    
    // Fill days of the month
    daysInMonth.forEach(day => {
      // Find activity data for this day
      const dayData = data.find(item => {
        return isSameDay(new Date(item.dateTime), day);
      });
      
      // Calculate activity level (0-5)
      let activityLevel = 0;
      let activityValue = 0;
      
      if (dayData) {
        activityValue = dayData[valueKey] || 0;
        
        // Determine activity level based on value
        if (activityValue > 0) {
          activityLevel = 1;
        }
        if (activityValue >= 2500) {
          activityLevel = 2;
        }
        if (activityValue >= 5000) {
          activityLevel = 3;
        } 
        if (activityValue >= 7500) {
          activityLevel = 4;
        }
        if (activityValue >= 10000) {
          activityLevel = 5;
        }
      }
      
      calendarGrid.push({
        date: day,
        activityLevel,
        activityValue,
        dayData,
        inCurrentMonth: true,
        isToday: isToday(day)
      });
    });
    
    // Fill trailing empty slots
    const remainingSlots = totalSlots - calendarGrid.length;
    for (let i = 0; i < remainingSlots; i++) {
      calendarGrid.push({ date: null, empty: true });
    }
    
    return calendarGrid;
  }, [data, currentDate, valueKey]);
  
  // Get color for activity level
  const getActivityColor = (activityValue) => {
    // Object where keys are thresholds (1, 2500, 5000, etc.)
    const thresholds = Object.keys(colorScale)
      .map(k => parseInt(k))
      .sort((a, b) => a - b);
    
    // Find the appropriate color based on thresholds
    let color = colorScale[0]; // Default color
    
    for (let threshold of thresholds) {
      if (activityValue >= threshold) {
        color = colorScale[threshold];
      } else {
        break;
      }
    }
    
    return color;
  };
  
  // Day name row (Sun, Mon, Tue, etc.)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Calendar header */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Typography 
          variant="subtitle1" 
          fontWeight="medium" 
          align="center"
          color="text.primary"
        >
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
      </Box>
      
      {/* Day names */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
        {dayNames.map(day => (
          <Typography 
            key={day} 
            variant="caption" 
            align="center"
            color="text.secondary"
            sx={{ fontWeight: 'medium', fontSize: '0.7rem' }}
          >
            {day}
          </Typography>
        ))}
      </Box>
      
      {/* Calendar grid */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(6, 1fr)',
          gap: 0.5,
        }}
      >
        {calendarData.map((day, index) => {
          if (day.empty) {
            return (
              <Box 
                key={`empty-${index}`}
                sx={{ 
                  aspectRatio: '1/1',
                  borderRadius: 1
                }}
              />
            );
          }
          
          const dayColor = getActivityColor(day.activityValue);
          const isCurrentDay = isToday(day.date);
          
          return (
            <Tooltip 
              key={format(day.date, 'yyyy-MM-dd')}
              title={
                <Box>
                  <Typography variant="caption" fontWeight="bold">
                    {format(day.date, 'MMMM d, yyyy')}
                  </Typography>
                  <Typography variant="body2">
                    {day.activityValue.toLocaleString()} steps
                  </Typography>
                </Box>
              }
            >
              <Box
                onClick={() => onDateClick(day.date)}
                sx={{ 
                  aspectRatio: '1/1',
                  borderRadius: 1,
                  bgcolor: dayColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: isCurrentDay ? `0 0 0 2px ${theme.palette.primary.main}` : 'none',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease'
                  }
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: day.activityLevel > 2 ? 'white' : 'text.secondary',
                    fontWeight: isCurrentDay ? 'bold' : 'normal'
                  }}
                >
                  {format(day.date, 'd')}
                </Typography>
                
                {/* Small indicator for the activity level */}
                {day.activityValue > 0 && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      bottom: '2px',
                      width: '30%',
                      height: '2px',
                      bgcolor: day.activityLevel > 3 
                        ? alpha('white', 0.7) 
                        : alpha(theme.palette.primary.main, 0.7),
                      borderRadius: '1px'
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      
      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: colorScale[0], borderRadius: '2px' }} />
          <Typography variant="caption" color="text.secondary">0</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: colorScale[1], borderRadius: '2px' }} />
          <Typography variant="caption" color="text.secondary">1-2.5K</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: colorScale[2500], borderRadius: '2px' }} />
          <Typography variant="caption" color="text.secondary">2.5-5K</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: colorScale[5000], borderRadius: '2px' }} />
          <Typography variant="caption" color="text.secondary">5-7.5K</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: colorScale[7500], borderRadius: '2px' }} />
          <Typography variant="caption" color="text.secondary">7.5-10K</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: colorScale[10000], borderRadius: '2px' }} />
          <Typography variant="caption" color="text.secondary">10K+</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ActivityHeatmapCalendar;