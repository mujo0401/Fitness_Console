import NightsStayIcon from '@mui/icons-material/NightsStay';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import HistoryIcon from '@mui/icons-material/History';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import PersonIcon from '@mui/icons-material/Person';
import BiotechIcon from '@mui/icons-material/Biotech';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import SpatialTrackingIcon from '@mui/icons-material/SpatialTracking';
import GridOnIcon from '@mui/icons-material/GridOn';

// Time intervals for heart rate data
export const TIME_INTERVALS = [
  { value: 'day', label: 'Day', icon: <CalendarTodayIcon /> },
  { value: 'week', label: 'Week', icon: <DateRangeIcon /> },
  { value: 'month', label: 'Month', icon: <CalendarTodayIcon /> },
  { value: '3month', label: '3 Months', icon: <HistoryIcon /> },
  { value: 'year', label: 'Year', icon: <HistoryIcon /> },
];

// AI analysis modes
export const ANALYSIS_MODES = [
  { value: 'basic', label: 'Basic', icon: <ShowChartIcon /> },
  { value: 'athletic', label: 'Athletic', icon: <DirectionsRunIcon /> },
  { value: 'medical', label: 'Medical', icon: <HealthAndSafetyIcon /> },
  { value: 'stress', label: 'Stress', icon: <PsychologyIcon /> },
  { value: 'sleep', label: 'Sleep', icon: <BedtimeIcon /> },
  { value: 'recovery', label: 'Recovery', icon: <BatteryChargingFullIcon /> },
  { value: 'research', label: 'Research', icon: <BiotechIcon /> },
  { value: 'personalized', label: 'Personalized', icon: <PersonIcon /> },
];

// Data visualization modes
export const VISUALIZATION_MODES = [
  { value: 'area', label: 'Area Chart', icon: <ShowChartIcon /> },
  { value: 'line', label: 'Line Chart', icon: <TimelineIcon /> },
  { value: 'bar', label: 'Bar Chart', icon: <BarChartIcon /> },
  { value: 'scatter', label: 'Scatter Plot', icon: <BubbleChartIcon /> },
  { value: 'zones', label: 'Zone Stacked', icon: <ViewComfyIcon /> },
  { value: 'radial', label: 'Radial', icon: <DonutLargeIcon /> },
  { value: 'heatmap', label: 'Heatmap', icon: <GridOnIcon /> },
  { value: 'bubble', label: 'Bubble', icon: <BubbleChartIcon /> },
  { value: '3d', label: '3D View', icon: <SpatialTrackingIcon /> },
];

// Enhanced heart rate zones with detailed descriptions and training benefits
export const HR_ZONES = [
  { 
    name: 'Rest',
    min: 0, 
    max: 60, 
    color: '#3f51b5',
    gradient: 'linear-gradient(135deg, #3f51b5, #5c6bc0)',
    description: 'Resting heart rate - your heart at complete rest',
    benefits: 'Recovery, low stress on cardiovascular system, optimal for sleep',
    icon: <NightsStayIcon fontSize="small" />,
    intensity: 'Very Low',
    recommendation: 'Perfect for recovery and rest days'
  },
  { 
    name: 'Fat Burn', 
    min: 60, 
    max: 70, 
    color: '#2196f3',
    gradient: 'linear-gradient(135deg, #2196f3, #64b5f6)',
    description: 'Low intensity exercise, optimal for fat burning',
    benefits: 'Improved fat metabolism, endurance building, lower perceived exertion',
    icon: <LocalFireDepartmentIcon fontSize="small" />,
    intensity: 'Low',
    recommendation: 'Ideal for long, steady cardio sessions and active recovery'
  },
  { 
    name: 'Cardio', 
    min: 70, 
    max: 85, 
    color: '#009688',
    gradient: 'linear-gradient(135deg, #009688, #4db6ac)',
    description: 'Medium-high intensity, improves cardiovascular fitness',
    benefits: 'Increased cardiac output, improved stamina, efficient calorie burning',
    icon: <FavoriteIcon fontSize="small" />,
    intensity: 'Moderate',
    recommendation: 'Optimal training zone for cardiovascular improvement'
  },
  { 
    name: 'Peak', 
    min: 85, 
    max: 100, 
    color: '#ff9800',
    gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)',
    description: 'High intensity exercise, increases performance and speed',
    benefits: 'Improved VO2 max, anaerobic capacity, speed, and power output',
    icon: <DirectionsRunIcon fontSize="small" />,
    intensity: 'High',
    recommendation: 'Use for interval training and performance enhancement'
  },
  { 
    name: 'Extreme', 
    min: 100, 
    max: 220, 
    color: '#f44336',
    gradient: 'linear-gradient(135deg, #f44336, #ef5350)',
    description: 'Maximum effort, short-duration exercise',
    benefits: 'Maximal performance, anaerobic power, sprint capability, lactate threshold training',
    icon: <SpeedIcon fontSize="small" />,
    intensity: 'Maximum',
    recommendation: 'Only for short bursts, significant recovery required'
  }
];