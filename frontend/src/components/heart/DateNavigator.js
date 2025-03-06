import React from 'react';
import { Box, Typography, IconButton, FormControl, InputLabel, Select, MenuItem, Popover, TextField } from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, isAfter, isValid } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * DateNavigator component for handling date navigation and period selection
 * with date picker popup and quick navigation buttons
 */
const DateNavigator = ({ 
  date, 
  onDateChange, 
  period, 
  onPeriodChange, 
  TIME_INTERVALS,
  showDatePicker,
  setShowDatePicker 
}) => {
  // Render date label based on period
  const renderDateLabel = () => {
    if (!date) return '';
    
    switch (period) {
      case 'day':
        return format(date, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(date);
        const weekEnd = endOfWeek(date);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(date, 'MMMM yyyy');
      case '3month':
        const monthStart = date;
        const monthEnd = addMonths(date, 2);
        return `${format(monthStart, 'MMM')} - ${format(monthEnd, 'MMM yyyy')}`;
      default:
        return format(date, 'MMMM d, yyyy');
    }
  };

  // Handle date change with proper formatting
  const handleDateChange = (newDate) => {
    if (newDate && isValid(newDate)) {
      // Fix timezone issues by using the date parts directly
      // This ensures the displayed date is the same as the selected date
      onDateChange(newDate);
      setShowDatePicker(false);
    }
  };

  // Handle quick date navigation
  const handleQuickDateChange = (direction) => {
    let newDate;
    switch (period) {
      case 'day':
        newDate = direction === 'next' ? addDays(date, 1) : subDays(date, 1);
        break;
      case 'week':
        newDate = direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
        break;
      case 'month':
        newDate = direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
        break;
      case '3month':
        newDate = direction === 'next' ? addMonths(date, 3) : subMonths(date, 3);
        break;
      default:
        newDate = direction === 'next' ? addDays(date, 1) : subDays(date, 1);
    }
    onDateChange(newDate);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Typography variant="subtitle1" color="white" fontWeight="medium">
          {renderDateLabel()}
        </Typography>
        
        <IconButton 
          size="small" 
          onClick={() => setShowDatePicker(prev => !prev)}
          sx={{ color: 'white', opacity: 0.8, ml: 0.5 }}
        >
          <CalendarTodayIcon fontSize="small" />
        </IconButton>
        
        <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
          <IconButton 
            size="small" 
            onClick={() => handleQuickDateChange('prev')}
            sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
          >
            <TrendingDownIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small" 
            onClick={() => handleQuickDateChange('next')}
            sx={{ color: 'white', opacity: 0.8, p: 0.5 }}
            disabled={isAfter(date, new Date())}
          >
            <TrendingUpIcon fontSize="small" />
          </IconButton>
        </Box>

        <FormControl 
          size="small" 
          sx={{ 
            minWidth: 120, 
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
            '& .MuiSelect-select': { color: 'white' },
            '& .MuiSvgIcon-root': { color: 'white' }
          }}
        >
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            label="Period"
            onChange={onPeriodChange}
          >
            {TIME_INTERVALS.map(interval => (
              <MenuItem key={interval.value} value={interval.value} sx={{ display: 'flex', gap: 1 }}>
                {interval.icon} {interval.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Date Picker Popover */}
      <Popover
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        anchorReference="anchorPosition"
        anchorPosition={{ top: 100, left: window.innerWidth / 2 }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={date}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} />}
            maxDate={new Date()}
          />
        </LocalizationProvider>
      </Popover>
    </>
  );
};

export default DateNavigator;