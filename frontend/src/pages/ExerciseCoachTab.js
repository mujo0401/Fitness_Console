import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid,
  Paper,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Avatar,
  useTheme,
  alpha,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  List,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip as MuiTooltip,
  LinearProgress,
  Tab,
  Tabs,
  Zoom,
  Fab,
  Menu,
  Rating,
  Switch,
  TextField,
  InputAdornment,
  Backdrop,
  AvatarGroup,
  Stack
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Icons
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TimerIcon from '@mui/icons-material/Timer';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SettingsIcon from '@mui/icons-material/Settings';
import CameraIcon from '@mui/icons-material/Camera';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FilterListIcon from '@mui/icons-material/FilterList';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import Bluetooth from '@mui/icons-material/Bluetooth';
import BluetoothSearchingIcon from '@mui/icons-material/BluetoothSearching';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import BluetoothDisabledIcon from '@mui/icons-material/BluetoothDisabled';
import PersonRunningIcon from '@mui/icons-material/DirectionsRun';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { ReferenceLine, Cell } from 'recharts';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ScienceIcon from '@mui/icons-material/Science';
import StarIcon from '@mui/icons-material/Star';
import ExploreIcon from '@mui/icons-material/Explore';
import AddIcon from '@mui/icons-material/Add';

// Contexts
import { useWorkoutPlan } from '../context/WorkoutPlanContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';

// Diagnostics functionality removed

// Visualization libraries
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area } from 'recharts';

// Styled components
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: 'white',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
  '&:hover': {
    boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)',
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
  }
}));

const ProgressCircle = styled(Box)(({ value, color, size = 120, theme }) => ({
  position: 'relative',
  width: size,
  height: size,
  borderRadius: '50%',
  background: `conic-gradient(${color} ${value}%, transparent ${value}%, transparent 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: '50%',
    background: theme.palette.background.paper,
  }
}));

// Heart rate zone constants
const HR_ZONES = [
  { 
    name: 'Rest', 
    min: 0, 
    max: 60, 
    color: '#3f51b5',
    gradient: 'linear-gradient(135deg, #3f51b5, #5c6bc0)',
    description: 'Recovery zone',
    benefits: 'Recovery and restoration',
    suitable: 'Warm-up, cool-down, recovery days',
    calorieEfficiency: 'Low',
    cadence: '60-80 rpm'
  },
  { 
    name: 'Fat Burn', 
    min: 60, 
    max: 70, 
    color: '#2196f3',
    gradient: 'linear-gradient(135deg, #2196f3, #64b5f6)',
    description: 'Fat metabolism zone',
    benefits: 'Improved fat oxidation, endurance building',
    suitable: 'Long, steady workouts, base building',
    calorieEfficiency: 'Medium',
    cadence: '80-90 rpm'
  },
  { 
    name: 'Cardio', 
    min: 70, 
    max: 85, 
    color: '#009688',
    gradient: 'linear-gradient(135deg, #009688, #4db6ac)',
    description: 'Cardiovascular fitness',
    benefits: 'Improved heart and lung capacity',
    suitable: 'Sustained efforts, threshold training',
    calorieEfficiency: 'High',
    cadence: '90-100 rpm'
  },
  { 
    name: 'Peak', 
    min: 85, 
    max: 100, 
    color: '#ff9800',
    gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)',
    description: 'Maximum performance',
    benefits: 'VO2 max improvement, lactate threshold',
    suitable: 'Short intense intervals, race efforts',
    calorieEfficiency: 'Very high',
    cadence: '100-110 rpm'
  },
  { 
    name: 'Maximum', 
    min: 100, 
    max: 220, 
    color: '#f44336',
    gradient: 'linear-gradient(135deg, #f44336, #ef5350)',
    description: 'Anaerobic zone',
    benefits: 'Power, speed, anaerobic capacity',
    suitable: 'Short, maximal efforts, sprints',
    calorieEfficiency: 'Extreme',
    cadence: '110+ rpm'
  }
];

// Class types (like Peloton classes)
const CLASS_TYPES = [
  {
    id: 'hiit',
    name: 'HIIT',
    icon: <BoltIcon />,
    description: 'High intensity interval training',
    color: '#f44336',
    difficulty: 'Advanced'
  },
  {
    id: 'strength',
    name: 'Strength',
    icon: <FitnessCenterIcon />,
    description: 'Build muscle and strength',
    color: '#ff9800',
    difficulty: 'Intermediate'
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: <DirectionsRunIcon />,
    description: 'Indoor cycling workouts',
    color: '#2196f3',
    difficulty: 'All levels'
  },
  {
    id: 'yoga',
    name: 'Yoga',
    icon: <SelfImprovementIcon />,
    description: 'Flexibility and mindfulness',
    color: '#009688',
    difficulty: 'Beginner'
  },
  {
    id: 'cardio',
    name: 'Cardio',
    icon: <FavoriteIcon />,
    description: 'Elevate your heart rate',
    color: '#e91e63',
    difficulty: 'Intermediate'
  }
];

// Virtual trainers (like Peloton instructors)
const TRAINERS = [
  {
    id: 'alex',
    name: 'Alex Thompson',
    specialty: 'HIIT, Strength',
    avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=100&auto=format&fit=crop',
    bio: 'Former pro athlete specializing in high-intensity training',
    experience: '10+ years',
    rating: 4.9,
    quote: 'Push beyond your limits, that\'s where growth happens!'
  },
  {
    id: 'emma',
    name: 'Emma Rodriguez',
    specialty: 'Cycling, Cardio',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=100&auto=format&fit=crop',
    bio: 'Endurance specialist with competitive cycling background',
    experience: '8 years',
    rating: 4.8,
    quote: 'Find your rhythm and ride to the beat!'
  },
  {
    id: 'michael',
    name: 'Michael Chang',
    specialty: 'Strength, Recovery',
    avatar: 'https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?q=80&w=100&auto=format&fit=crop',
    bio: 'Physical therapist turned fitness coach',
    experience: '12 years',
    rating: 4.7,
    quote: 'Build strength from the inside out'
  },
  {
    id: 'sarah',
    name: 'Sarah Johnson',
    specialty: 'Yoga, Flexibility',
    avatar: 'https://images.unsplash.com/photo-1577565177023-d0f29c354b69?q=80&w=100&auto=format&fit=crop',
    bio: 'Certified yoga instructor and mindfulness coach',
    experience: '15 years',
    rating: 4.9,
    quote: 'Connect your mind and body with every breath'
  }
];

// Sample leaderboard data
const LEADERBOARD_DATA = [
  { id: 1, name: 'JakeRunner92', output: 385, avatar: 'https://i.pravatar.cc/40?img=1', isFollowing: true },
  { id: 2, name: 'FitnessPro', output: 372, avatar: 'https://i.pravatar.cc/40?img=2', isFollowing: false },
  { id: 3, name: 'SpinMaster', output: 368, avatar: 'https://i.pravatar.cc/40?img=3', isFollowing: true },
  { id: 4, name: 'MountainClimber', output: 345, avatar: 'https://i.pravatar.cc/40?img=4', isFollowing: false },
  { id: 5, name: 'CardioQueen', output: 339, avatar: 'https://i.pravatar.cc/40?img=5', isFollowing: true },
  { id: 6, name: 'IronPumper', output: 330, avatar: 'https://i.pravatar.cc/40?img=6', isFollowing: false },
  { id: 7, name: 'EnduranceKing', output: 328, avatar: 'https://i.pravatar.cc/40?img=7', isFollowing: true },
  { id: 8, name: 'SpeedDemon', output: 312, avatar: 'https://i.pravatar.cc/40?img=8', isFollowing: false },
  { id: 9, name: 'PowerPedaler', output: 295, avatar: 'https://i.pravatar.cc/40?img=9', isFollowing: true },
  { id: 10, name: 'FitnessJunkie', output: 290, avatar: 'https://i.pravatar.cc/40?img=10', isFollowing: false }
];

// Trainer card component
const TrainerCard = ({ trainer = TRAINERS[0], onClick, isSelected }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={isSelected ? 2 : 1}
      sx={{ 
        p: 1.5, 
        borderRadius: 2,
        cursor: 'pointer',
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar 
          src={trainer.avatar} 
          alt={trainer.name}
          sx={{ 
            width: 45, 
            height: 45,
            border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.3)}`
          }}
        />
        <Box sx={{ ml: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold">{trainer.name}</Typography>
          <Typography variant="caption" color="text.secondary">{trainer.specialty}</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Rating value={trainer.rating} precision={0.1} size="small" readOnly />
          <Typography variant="caption" color="text.secondary">{trainer.experience}</Typography>
        </Box>
      </Box>
      
      <Box sx={{ 
        mt: 1, 
        pt: 1, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        alignItems: 'center'
      }}>
        <FormatQuoteIcon 
          fontSize="small" 
          sx={{ 
            transform: 'rotate(180deg)', 
            mr: 0.5,
            color: alpha(theme.palette.text.secondary, 0.5)
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          "{trainer.quote}"
        </Typography>
      </Box>
    </Paper>
  );
};

// Class card component
const ClassCard = ({ classInfo = CLASS_TYPES[0], onClick, isSelected }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={isSelected ? 2 : 1}
      sx={{ 
        p: 1.5, 
        borderRadius: 2,
        cursor: 'pointer',
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Avatar
          sx={{ 
            bgcolor: alpha(classInfo.color, 0.2),
            color: classInfo.color,
            width: 40,
            height: 40
          }}
        >
          {React.cloneElement(classInfo.icon, { fontSize: 'small' })}
        </Avatar>
        <Box sx={{ ml: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold">{classInfo.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {classInfo.difficulty}
          </Typography>
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {classInfo.description}
      </Typography>
    </Paper>
  );
};

// Helper function to generate workout exercises based on type
const generateExercisesForType = (type) => {
  const exercisesByType = {
    hiit: [
      { name: "Burpees", sets: 3, reps: 15, duration: 45, rest: 15, intensity: "high", description: "Full body exercise combining squat, push-up, and jump" },
      { name: "Mountain Climbers", sets: 3, reps: 30, duration: 45, rest: 15, intensity: "high", description: "Dynamic plank with alternating knee drives" },
      { name: "Jump Squats", sets: 3, reps: 20, duration: 45, rest: 15, intensity: "high", description: "Explosive lower body movement" },
      { name: "Push-up to Renegade Row", sets: 3, reps: 10, duration: 45, rest: 15, intensity: "high", description: "Compound upper body strength move" },
      { name: "High Knees", sets: 3, duration: 45, rest: 15, intensity: "high", description: "Running in place with high knees" }
    ],
    strength: [
      { name: "Barbell Squats", sets: 4, reps: 8, rest: 60, intensity: "medium", weight: true, description: "Compound lower body exercise" },
      { name: "Dumbbell Bench Press", sets: 4, reps: 10, rest: 60, intensity: "medium", weight: true, description: "Upper body pushing movement" },
      { name: "Bent-Over Rows", sets: 4, reps: 12, rest: 60, intensity: "medium", weight: true, description: "Upper body pulling exercise" },
      { name: "Romanian Deadlifts", sets: 3, reps: 10, rest: 60, intensity: "medium", weight: true, description: "Posterior chain developer" },
      { name: "Overhead Press", sets: 3, reps: 8, rest: 60, intensity: "medium", weight: true, description: "Shoulder strength movement" }
    ],
    cycling: [
      { name: "Warm-up Cycle", duration: 300, intensity: "low", cadence: "60-70 rpm", resistance: "light", description: "Easy pedaling to increase blood flow" },
      { name: "Speed Intervals", sets: 6, duration: 60, rest: 60, intensity: "high", cadence: "90-100 rpm", resistance: "medium", description: "Fast-paced cycling intervals" },
      { name: "Hill Climb", duration: 300, intensity: "high", cadence: "60-70 rpm", resistance: "heavy", description: "Simulated uphill riding" },
      { name: "Endurance Ride", duration: 600, intensity: "medium", cadence: "80-90 rpm", resistance: "medium", description: "Sustained effort cycling" },
      { name: "Cool Down", duration: 180, intensity: "low", cadence: "60-70 rpm", resistance: "light", description: "Gradual reduction in effort" }
    ],
    yoga: [
      { name: "Sun Salutation A", sets: 5, duration: 120, intensity: "low", description: "Flowing sequence of yoga poses" },
      { name: "Warrior Sequence", duration: 300, intensity: "medium", description: "Standing poses that build strength and focus" },
      { name: "Balance Poses", duration: 240, intensity: "medium", description: "Tree, eagle, and other balance-focused poses" },
      { name: "Hip Openers", duration: 300, intensity: "low", description: "Poses targeting hip flexibility" },
      { name: "Savasana", duration: 300, intensity: "very low", description: "Final relaxation pose" }
    ],
    cardio: [
      { name: "Jumping Jacks", duration: 60, sets: 3, rest: 20, intensity: "medium", description: "Full body cardio movement" },
      { name: "Jump Rope", duration: 120, sets: 3, rest: 30, intensity: "medium", description: "Coordination and cardio development" },
      { name: "Lateral Shuffles", duration: 45, sets: 4, rest: 15, intensity: "medium", description: "Side-to-side agility movement" },
      { name: "Stair Climber", duration: 300, intensity: "medium", description: "Climb stairs or use stair machine" },
      { name: "Sprint Intervals", sets: 8, duration: 30, rest: 90, intensity: "high", description: "All-out running efforts" }
    ],
    hiit_advanced: [
      { name: "Tuck Jumps", sets: 4, reps: 15, rest: 20, intensity: "very high", description: "Explosive jump with knees to chest" },
      { name: "Burpee to Tuck Jump", sets: 4, reps: 10, rest: 20, intensity: "very high", description: "Burpee with tuck jump at the end" },
      { name: "Plyo Push-ups", sets: 4, reps: 8, rest: 20, intensity: "very high", description: "Explosive push-up with hands leaving ground" },
      { name: "Reverse Lunge to Knee Drive", sets: 4, reps: 12, perSide: true, rest: 20, intensity: "high", description: "Lunge backward then drive knee up" },
      { name: "Lateral Burpees", sets: 4, reps: 6, perSide: true, rest: 20, intensity: "very high", description: "Burpee with lateral jump" }
    ],
    pilates: [
      { name: "The Hundred", sets: 1, duration: 100, intensity: "medium", description: "Core stabilization with arm pumps" },
      { name: "Roll Up", sets: 3, reps: 5, intensity: "medium", description: "Controlled spinal articulation" },
      { name: "Single Leg Circles", sets: 2, reps: 10, perSide: true, intensity: "medium", description: "Leg circles from supine position" },
      { name: "Spine Stretch Forward", sets: 2, reps: 8, intensity: "low", description: "Seated forward flexion with control" },
      { name: "Saw", sets: 2, reps: 5, perSide: true, intensity: "medium", description: "Seated rotation with reach" }
    ],
    boxing: [
      { name: "Shadow Boxing", sets: 3, duration: 180, intensity: "medium", description: "Practice punches and footwork without equipment" },
      { name: "Speed Bag", sets: 3, duration: 60, rest: 30, intensity: "medium", description: "Rhythm and coordination training" },
      { name: "Heavy Bag HIIT", sets: 5, duration: 60, rest: 30, intensity: "high", description: "High-intensity striking intervals" },
      { name: "Footwork Drills", sets: 3, duration: 60, rest: 30, intensity: "medium", description: "Focus on movement patterns" },
      { name: "Boxing Combinations", sets: 4, duration: 90, rest: 30, intensity: "high", description: "Practice specific punch combinations" }
    ],
    resistance: [
      { name: "Resistance Band Squats", sets: 3, reps: 15, intensity: "medium", description: "Squats with added band resistance" },
      { name: "Band Pull-Aparts", sets: 3, reps: 15, intensity: "medium", description: "Upper back strengthening with band" },
      { name: "Banded Push-ups", sets: 3, reps: 12, intensity: "medium", description: "Push-ups with band across back" },
      { name: "Lateral Band Walks", sets: 3, reps: 12, perSide: true, intensity: "medium", description: "Side steps with band around ankles" },
      { name: "Resistance Band Rows", sets: 3, reps: 15, intensity: "medium", description: "Pulling movement with resistance band" }
    ]
  };
  
  return exercisesByType[type] || exercisesByType.hiit;
};

// Exercise Coach Tab Component
const ExerciseCoachTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const { todaysWorkout, predefinedPlans, selectedPlan } = useWorkoutPlan();
  const { currentTrack, isPlaying } = useMusicPlayer();
  
  // Workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutPhase, setWorkoutPhase] = useState('preparation');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentHeartRate, setCurrentHeartRate] = useState(75);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState(true);
  const [musicSyncEnabled, setMusicSyncEnabled] = useState(true);
  
  // Enhanced workout setup and simulation
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutSetupDialogOpen, setWorkoutSetupDialogOpen] = useState(false);
  const [workoutSimulatorOpen, setWorkoutSimulatorOpen] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseTimeRemaining, setExerciseTimeRemaining] = useState(0);
  const [workoutIntensity, setWorkoutIntensity] = useState(85); // 0-100 scale
  const [coachingStyle, setCoachingStyle] = useState('balanced'); // 'encouraging', 'balanced', 'demanding'
  const [coachFrequency, setCoachFrequency] = useState('medium'); // 'low', 'medium', 'high'
  const [targetDistance, setTargetDistance] = useState(3); // in miles/km
  const [showExercisePreview, setShowExercisePreview] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  
  // Voice coach and audio feedback
  const [voiceCoachVolume, setVoiceCoachVolume] = useState(80);
  const [lastVoiceCoachMessage, setLastVoiceCoachMessage] = useState('');
  const [voiceCoachSpeaking, setVoiceCoachSpeaking] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState([
    { id: 'device1', name: 'PowerBeats Pro', connected: false, type: 'headphones', battery: 75 },
    { id: 'device2', name: 'Bose Sport Earbuds', connected: false, type: 'headphones', battery: 60 },
    { id: 'device3', name: 'Apple AirPods Pro', connected: false, type: 'headphones', battery: 90 }
  ]);
  const [showBluetoothDialog, setShowBluetoothDialog] = useState(false);
  const [bluetoothSearching, setBluetoothSearching] = useState(false);
  
  // Subtabs
  const [activeSubTab, setActiveSubTab] = useState('workout');

  // Virtual workout avatar
  const [showWorkoutAvatar, setShowWorkoutAvatar] = useState(true);
  const [avatarPerspective, setAvatarPerspective] = useState('front'); // front, side, back
  
  // Enhanced Peloton-like features
  const [selectedTrainer, setSelectedTrainer] = useState(TRAINERS[0].id);
  const [selectedClassType, setSelectedClassType] = useState(CLASS_TYPES[0].id);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [resistanceLevel, setResistanceLevel] = useState(35);
  const [cadence, setCadence] = useState(80);
  const [output, setOutput] = useState(0);
  const [personalBest, setPersonalBest] = useState(385);
  const [milestones, setMilestones] = useState([]);
  
  // Enhanced workout programs
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [programCategories, setProgramCategories] = useState([
    { 
      id: 'strength', 
      name: 'Strength Builder',
      description: 'Progressive 6-week program to build lean muscle and strength',
      level: 'Intermediate',
      duration: '6 weeks',
      commitment: '4 days/week',
      icon: <FitnessCenterIcon />,
      color: '#d81b60',
      progress: 35,
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1740&auto=format&fit=crop'
    },
    { 
      id: 'cardio', 
      name: 'Cardio Endurance',
      description: 'Improve cardiovascular fitness and endurance capacity',
      level: 'All levels',
      duration: '8 weeks',
      commitment: '3-4 days/week',
      icon: <DirectionsRunIcon />,
      color: '#00acc1',
      progress: 0,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1740&auto=format&fit=crop'
    },
    { 
      id: 'flexibility', 
      name: 'Recovery & Mobility',
      description: 'Improve flexibility, joint health and recovery capacity',
      level: 'All levels',
      duration: '4 weeks',
      commitment: '3-5 days/week',
      icon: <SelfImprovementIcon />,
      color: '#7e57c2',
      progress: 0,
      image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=1740&auto=format&fit=crop'
    },
    { 
      id: 'weightloss', 
      name: 'Weight Management',
      description: 'Optimize body composition with strategic workout programming',
      level: 'Beginner to Intermediate',
      duration: '12 weeks',
      commitment: '4-5 days/week',
      icon: <FavoriteIcon />,
      color: '#00897b',
      progress: 0,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1740&auto=format&fit=crop'
    }
  ]);
  
  // Trainer personality enhancement
  const [selectedPersonality, setSelectedPersonality] = useState(coachingStyle);
  const [showPersonalityDialog, setShowPersonalityDialog] = useState(false);
  const [customTrainers, setCustomTrainers] = useState([
    {
      id: 'custom_coach_1',
      name: 'Coach Alex',
      personality: 'demanding',
      specialty: 'HIIT, Strength',
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
      experience: '8 years',
      rating: 4.8,
      bio: 'Former military fitness instructor who believes in pushing your limits',
      quote: 'The pain you feel today will be the strength you feel tomorrow'
    },
    {
      id: 'custom_coach_2',
      name: 'Coach Maria',
      personality: 'mindful',
      specialty: 'Yoga, Recovery',
      avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
      experience: '12 years',
      rating: 4.9,
      bio: 'Certified yoga instructor and mindfulness coach focusing on mind-body connection',
      quote: 'Movement is medicine when approached with awareness'
    },
    {
      id: 'custom_coach_3',
      name: 'Coach Tyler',
      personality: 'playful',
      specialty: 'Cardio, HIIT',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      experience: '6 years',
      rating: 4.7,
      bio: 'Fun-loving fitness enthusiast who believes fitness should be enjoyable',
      quote: 'If you\'re not having fun, you\'re doing it wrong!'
    }
  ]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start or pause workout
  const toggleWorkout = () => {
    setIsWorkoutActive(prev => !prev);
  };
  
  // Reset workout
  const resetWorkout = () => {
    setIsWorkoutActive(false);
    setElapsedTime(0);
    setCaloriesBurned(0);
    setExerciseIndex(0);
    setWorkoutPhase('preparation');
    setCadence(80);
    setResistanceLevel(35);
    setOutput(0);
    setMilestones([]);
  };
  
  // Web Speech API for voice coach
  const synth = window.speechSynthesis;
  
  // Enhanced trainer personalities with distinct voice characteristics
  const TRAINER_PERSONALITIES = {
    encouraging: {
      name: "Encouraging",
      description: "Supportive and positive, focuses on your progress",
      voiceStyle: {
        rate: 0.9,
        pitch: 1.2,
        volume: 1.0
      },
      phrases: {
        start: [
          "Let's get started! You've got this!",
          "Ready to crush this workout? I believe in you!",
          "This is going to be a great session! Let's make it count!"
        ],
        during: [
          "You're doing amazing! Keep it up!",
          "Look at that form! Excellent work!",
          "You're getting stronger with every rep!",
          "That's it! You're nailing this workout!"
        ],
        finish: [
          "Fantastic job today! You should be proud!",
          "You crushed that workout! Well done!",
          "Amazing effort! You're making great progress!"
        ],
        struggle: [
          "It's okay to find it challenging - that means you're growing!",
          "You can do this! I've seen your strength!",
          "Breathe through it - you're stronger than you know!"
        ]
      },
      emoji: "🙌"
    },
    balanced: {
      name: "Balanced",
      description: "Clear instructions with moderate motivation",
      voiceStyle: {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      },
      phrases: {
        start: [
          "Let's begin our workout. Focus on proper form.",
          "We'll start with the first exercise. Ready?",
          "Let's get started with today's routine."
        ],
        during: [
          "Good form. Keep your core engaged.",
          "Maintain your breathing pattern. In through the nose, out through the mouth.",
          "Focus on the muscle you're working.",
          "Keep a steady pace. Quality over quantity."
        ],
        finish: [
          "Good work today. You've completed the workout.",
          "Workout complete. Make sure to cool down properly.",
          "That's our session done. Well executed."
        ],
        struggle: [
          "If needed, take a brief pause, then continue.",
          "Modify the exercise if necessary, but keep moving.",
          "Focus on your breathing to get through this challenge."
        ]
      },
      emoji: "✓"
    },
    demanding: {
      name: "Demanding",
      description: "Intense motivation for those who want to be pushed",
      voiceStyle: {
        rate: 1.1,
        pitch: 0.8,
        volume: 1.0
      },
      phrases: {
        start: [
          "Time to work! No excuses today!",
          "Let's push past your limits! This is where growth happens!",
          "Forget comfortable - we're here to transform!"
        ],
        during: [
          "Don't quit now! Push through the burn!",
          "Is that all you've got? I know you can do better!",
          "One more rep! Don't you dare give up!",
          "This is where champions are made! Keep pushing!"
        ],
        finish: [
          "You survived! Next time we'll go even harder!",
          "Good effort, but I know you've got more in the tank for next time!",
          "That's it! You've earned your rest - until tomorrow!"
        ],
        struggle: [
          "Pain is weakness leaving the body! Embrace it!",
          "This is the moment that defines you! Break through!",
          "You didn't come this far to only come this far! Push!"
        ]
      },
      emoji: "🔥"
    },
    technical: {
      name: "Technical",
      description: "Detailed form cues and scientific approach",
      voiceStyle: {
        rate: 0.95,
        pitch: 1.0,
        volume: 0.9
      },
      phrases: {
        start: [
          "We'll begin by engaging the target muscle groups in sequence.",
          "Let's commence with proper biomechanical alignment for optimal results.",
          "Today's protocol is designed to maximize neuromuscular adaptation."
        ],
        during: [
          "Ensure scapular retraction during the concentric phase.",
          "Maintain neutral spine alignment throughout the movement pattern.",
          "Focus on time under tension - 2 seconds concentric, 3 seconds eccentric.",
          "Optimize your joint angles for maximum muscle fiber recruitment."
        ],
        finish: [
          "Protocol complete. Your myofibrillar hypertrophy stimulus has been applied.",
          "Session concluded. The recovery phase is critical for adaptation.",
          "Workout complete. Protein synthesis will be elevated for approximately 24-48 hours."
        ],
        struggle: [
          "Fatigue is simply motor unit exhaustion. Push through this plateau.",
          "When reaching muscular failure, focus on maintaining technical excellence.",
          "This momentary discomfort indicates proper recruitment of fast-twitch fibers."
        ]
      },
      emoji: "📊"
    },
    mindful: {
      name: "Mindful",
      description: "Focus on mind-body connection and presence",
      voiceStyle: {
        rate: 0.8,
        pitch: 0.9,
        volume: 0.7
      },
      phrases: {
        start: [
          "Let's begin by centering ourselves and setting an intention for this practice.",
          "Take a deep breath and connect with your body as we prepare to move.",
          "Bring your awareness to the present moment as we begin our movement practice."
        ],
        during: [
          "Notice the sensations in your body without judgment.",
          "Stay present with each movement, feeling the energy flow through you.",
          "Breathe deeply into any areas of tension or resistance.",
          "Connect your movement with your breath - movement is meditation."
        ],
        finish: [
          "Take a moment to appreciate the energy you've cultivated today.",
          "Notice how your body feels now compared to when we began.",
          "Carry this mindful awareness with you throughout your day."
        ],
        struggle: [
          "Acknowledge the challenge without allowing it to define your experience.",
          "Breathe into any discomfort, knowing it's temporary and transformative.",
          "Your mind may want to resist, but gently guide your focus back to your breath."
        ]
      },
      emoji: "🧘"
    },
    playful: {
      name: "Playful",
      description: "Fun, light-hearted approach with humor",
      voiceStyle: {
        rate: 1.05,
        pitch: 1.1,
        volume: 0.95
      },
      phrases: {
        start: [
          "Let's have some fun with fitness today! No workout faces allowed!",
          "Time to play! Remember when exercise was just called 'playing outside'?",
          "Workout party starting now! Who needs a nightclub when you have endorphins?"
        ],
        during: [
          "If anyone asks what you're doing, say you're auditioning for a superhero movie!",
          "That's it! You're looking less like a newbie and more like a 'maybe'!",
          "Is that sweat or are you just happy to be exercising with me?",
          "Looking good! Well, red-faced and sweaty, but that's the look we're going for!"
        ],
        finish: [
          "Workout complete! You're free to return to your regular, less awesome activities!",
          "Congratulations! You've earned the right to walk funny tomorrow!",
          "That's it! Time to celebrate with a shower—you definitely need one!"
        ],
        struggle: [
          "This is the part where you question your life choices! You're welcome!",
          "Remember when you thought this would be fun? Let's pretend it still is!",
          "If this feels tough, just imagine how boring life would be without me!"
        ]
      },
      emoji: "😄"
    }
  };
  
  // Voice coach functions with enhanced capabilities
  const speakVoiceCoach = (message, messageType = 'custom') => {
    if (!voiceCoachEnabled) return;
    
    // Set speaking state and last message
    setLastVoiceCoachMessage(message);
    setVoiceCoachSpeaking(true);
    
    // Check if we should use a personality-based phrase instead
    let finalMessage = message;
    
    // Get the current trainer personality
    const currentPersonality = TRAINER_PERSONALITIES[coachingStyle] || TRAINER_PERSONALITIES.balanced;
    
    // If message type is not custom, use a phrase from the personality
    if (messageType !== 'custom' && currentPersonality.phrases[messageType]) {
      const phrases = currentPersonality.phrases[messageType];
      // Select random phrase from the appropriate category
      finalMessage = phrases[Math.floor(Math.random() * phrases.length)];
    }
    
    // Add trainer's signature emoji for visual identification
    setLastVoiceCoachMessage(`${finalMessage} ${currentPersonality.emoji}`);
    
    // Use Web Speech API for actual speech synthesis
    if (synth) {
      // Stop any ongoing speech first
      synth.cancel();
      
      // Create new utterance with the message
      const utterance = new SpeechSynthesisUtterance(finalMessage);
      
      // Set voice properties based on trainer personality
      const voiceStyle = currentPersonality.voiceStyle;
      utterance.rate = voiceStyle.rate;
      utterance.pitch = voiceStyle.pitch;
      utterance.volume = (voiceCoachVolume / 100) * voiceStyle.volume;
      
      // Load and use available voices
      let voices = synth.getVoices();
      
      // If voices array is empty, wait and try again (handling Chrome async voice loading)
      if (voices.length === 0) {
        // Wait for voices to load
        setTimeout(() => {
          voices = synth.getVoices();
          if (voices.length > 0) {
            setVoice(utterance, voices, currentPersonality);
            speakWithAudio(utterance);
          } else {
            // Fallback if still no voices
            console.warn("No speech synthesis voices available");
            speakWithAudio(utterance);
          }
        }, 500);
      } else {
        // Set voice and speak
        setVoice(utterance, voices, currentPersonality);
        speakWithAudio(utterance);
      }
    } else {
      // Fallback if speech synthesis not available
      console.warn("Speech synthesis not supported");
      playFallbackAudio(finalMessage);
    }
  };
  
  // Helper to set the appropriate voice based on personality
  const setVoice = (utterance, voices, personality) => {
    // Voice preferences for different personalities
    const voicePreferences = {
      encouraging: ['female', 'Google', 'en-US', 'Premium'],
      balanced: ['male', 'Google', 'en-US', 'Premium'],
      demanding: ['male', 'en-US', 'UK', 'Premium'],
      technical: ['male', 'en-US', 'Google'],
      mindful: ['female', 'UK', 'en-GB', 'Premium'],
      playful: ['female', 'en-US', 'Google', 'Premium']
    };
    
    // Get preference for current personality
    const preference = voicePreferences[personality.name.toLowerCase()] || voicePreferences.balanced;
    
    // Try to find matching voice
    let selectedVoice = null;
    
    // First try to find perfect match with all preferences
    for (const voice of voices) {
      if (preference.every(pref => 
        voice.name.includes(pref) || 
        voice.lang.includes(pref) || 
        (pref === 'male' && voice.name.includes('Male')) ||
        (pref === 'female' && voice.name.includes('Female'))
      )) {
        selectedVoice = voice;
        break;
      }
    }
    
    // If no perfect match, try to find voice with at least one matching preference
    if (!selectedVoice) {
      for (const voice of voices) {
        if (preference.some(pref => 
          voice.name.includes(pref) || 
          voice.lang.includes(pref) || 
          (pref === 'male' && voice.name.includes('Male')) ||
          (pref === 'female' && voice.name.includes('Female'))
        )) {
          selectedVoice = voice;
          break;
        }
      }
    }
    
    // If still no match, just use any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.includes('en')) || voices[0];
    }
    
    // Set the selected voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  };
  
  // Speak with audio feedback for better user experience
  const speakWithAudio = (utterance) => {
    // Add event handlers
    utterance.onstart = () => {
      // Could play a subtle "start speaking" sound here
      console.log("Coach started speaking");
    };
    
    utterance.onend = () => {
      setVoiceCoachSpeaking(false);
      // Could play a subtle "end speaking" sound here
      console.log("Coach finished speaking");
    };
    
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setVoiceCoachSpeaking(false);
      playFallbackAudio(utterance.text);
    };
    
    // Speak the message
    synth.speak(utterance);
  };
  
  // Fallback audio method (using preset audio files for common phrases)
  const playFallbackAudio = (message) => {
    console.log("Using fallback audio for:", message);
    
    // In a real implementation, this would play pre-recorded audio files
    // For now, we'll just set a timeout to simulate the audio playing
    setTimeout(() => {
      setVoiceCoachSpeaking(false);
    }, message.length * 80); // Roughly simulate speaking time based on message length
  };
  
  // Web Bluetooth API implementation
  const connectBluetoothDevice = async (deviceId) => {
    if (!navigator.bluetooth) {
      alert('Bluetooth is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    
    setBluetoothSearching(true);
    
    try {
      // Request device with Bluetooth services
      const device = await navigator.bluetooth.requestDevice({
        // Accept all Bluetooth devices that have a name property
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });
      
      // Get device name
      const deviceName = device.name || 'Unknown Device';
      
      // Connect to the device
      const server = await device.gatt.connect();
      
      // Try to get battery information if available
      let batteryLevel = null;
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryChar.readValue();
        batteryLevel = batteryValue.getUint8(0);
      } catch (error) {
        console.log('Battery info not available');
      }
      
      // Create a new device object
      const newDevice = {
        id: device.id || 'device' + Math.random().toString(36).substr(2, 9),
        name: deviceName,
        connected: true,
        type: 'audio',
        battery: batteryLevel || 'unknown',
        device: device // Store the actual device object for disconnect
      };
      
      // Update the devices list
      setBluetoothDevices(prev => {
        // Disconnect any previously connected devices
        const updatedDevices = prev.map(d => ({...d, connected: false}));
        // Add the new device if it doesn't exist
        const existingDeviceIndex = updatedDevices.findIndex(d => d.id === newDevice.id);
        if (existingDeviceIndex >= 0) {
          updatedDevices[existingDeviceIndex] = newDevice;
        } else {
          updatedDevices.push(newDevice);
        }
        return updatedDevices;
      });
      
      // Set up disconnection listener
      device.addEventListener('gattserverdisconnected', () => {
        console.log(`${deviceName} disconnected`);
        setBluetoothDevices(prev => 
          prev.map(d => d.id === newDevice.id ? {...d, connected: false} : d)
        );
        speakVoiceCoach(`${deviceName} has been disconnected`);
      });
      
      setBluetoothSearching(false);
      speakVoiceCoach(`Connected to ${deviceName}`);
      
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      setBluetoothSearching(false);
      alert(`Failed to connect: ${error.message || 'Unknown error'}`);
    }
  };
  
  const disconnectBluetoothDevice = async (deviceId) => {
    const device = bluetoothDevices.find(d => d.id === deviceId);
    
    if (device && device.device && device.device.gatt.connected) {
      try {
        // Disconnect the device
        device.device.gatt.disconnect();
        speakVoiceCoach(`Disconnected from ${device.name}`);
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    } else {
      // Just update the UI if we don't have the actual device object
      setBluetoothDevices(prev => 
        prev.map(d => d.id === deviceId ? {...d, connected: false} : d)
      );
      
      const deviceName = bluetoothDevices.find(d => d.id === deviceId)?.name || 'device';
      speakVoiceCoach(`Disconnected from ${deviceName}`);
    }
  };
  
  const scanForBluetoothDevices = async () => {
    // Web Bluetooth doesn't have a general "scan" functionality - you need to request a specific device
    // So we'll just call connectBluetoothDevice which handles device selection
    connectBluetoothDevice();
  };
  
  // Helper function for navigating exercises
  const goToNextExercise = () => {
    if (!selectedWorkout || !selectedWorkout.exercises) return;
    
    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < selectedWorkout.exercises.length) {
      setCurrentExerciseIndex(nextIndex);
      // Add the current exercise to history
      if (currentExerciseIndex >= 0) {
        setExerciseHistory(prev => [...prev, {
          ...selectedWorkout.exercises[currentExerciseIndex],
          completed: true,
          performanceRating: Math.floor(Math.random() * 5) + 1 // Mock performance rating 1-5
        }]);
      }
      // Play voice coach message for the next exercise
      speakVoiceCoach(`Next exercise: ${selectedWorkout.exercises[nextIndex].name}. ${selectedWorkout.exercises[nextIndex].description}`);
    } else {
      // Workout complete
      speakVoiceCoach("Congratulations! Workout complete.");
      setWorkoutSimulatorOpen(false);
      // Add achievement for completing workout
      // In real implementation, this would update achievement data in a context
    }
  };
  
  const goToPreviousExercise = () => {
    if (!selectedWorkout || !selectedWorkout.exercises) return;
    
    const prevIndex = currentExerciseIndex - 1;
    if (prevIndex >= 0) {
      setCurrentExerciseIndex(prevIndex);
      speakVoiceCoach(`Going back to: ${selectedWorkout.exercises[prevIndex].name}`);
    }
  };
  
  // Current trainer
  const selectedTrainerObject = TRAINERS.find(t => t.id === selectedTrainer);
  
  // Exercise Preview Component
  const ExercisePreview = ({ exercise, onStart, onModify }) => {
    if (!exercise) return null;
    
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {exercise.name}
        </Typography>
        
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.light, 0.1) }}>
          <Typography variant="body1" gutterBottom>
            {exercise.description}
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {exercise.sets && (
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Sets</Typography>
                <Typography variant="subtitle2">{exercise.sets}</Typography>
              </Grid>
            )}
            
            {exercise.reps && (
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Reps</Typography>
                <Typography variant="subtitle2">
                  {exercise.reps} {exercise.perSide ? 'per side' : ''}
                </Typography>
              </Grid>
            )}
            
            {exercise.duration && (
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Duration</Typography>
                <Typography variant="subtitle2">{Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')}</Typography>
              </Grid>
            )}
            
            {exercise.intensity && (
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Intensity</Typography>
                <Typography variant="subtitle2" sx={{ 
                  color: exercise.intensity === 'high' || exercise.intensity === 'very high' 
                    ? 'error.main' 
                    : exercise.intensity === 'medium' 
                      ? 'warning.main' 
                      : 'success.main' 
                }}>
                  {exercise.intensity.charAt(0).toUpperCase() + exercise.intensity.slice(1)}
                </Typography>
              </Grid>
            )}
            
            {exercise.rest && (
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Rest</Typography>
                <Typography variant="subtitle2">{exercise.rest} sec</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />} 
            onClick={onModify}
          >
            Modify
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            endIcon={<PlayArrowIcon />} 
            onClick={onStart}
          >
            Start
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Fullscreen workout mode */}
      {isFullscreenMode && isWorkoutActive && (
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column',
            bgcolor: theme.palette.background.default
          }}
          open={isFullscreenMode && isWorkoutActive}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            zIndex: 10 
          }}>
            <Button 
              variant="contained"
              onClick={() => setIsFullscreenMode(false)}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(0,0,0,0.5)', 
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                fontWeight: 'bold',
                px: 2
              }}
              startIcon={<FullscreenIcon />}
            >
              Exit Fullscreen
            </Button>
          </Box>
          
          <Box sx={{ 
            bgcolor: 'black', 
            width: '100%', 
            height: '70vh', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Basic content in fullscreen mode */}
            <Typography variant="h3" sx={{ color: 'white', textAlign: 'center' }}>
              Workout in Progress
            </Typography>
          </Box>
        </Backdrop>
      )}
      
      {/* Workout Setup Dialog */}
      <Dialog
        open={workoutSetupDialogOpen}
        onClose={() => setWorkoutSetupDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Customize Your Workout</Typography>
            <Chip 
              label={selectedWorkout?.name || "Custom Workout"} 
              color="primary" 
              size="medium"
            />
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Workout Parameters
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>Workout Intensity</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Easier</Typography>
                  <Slider
                    value={workoutIntensity}
                    onChange={(e, newValue) => setWorkoutIntensity(newValue)}
                    step={5}
                    marks
                    min={50}
                    max={100}
                    sx={{ mx: 2, flexGrow: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">Harder</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                  {workoutIntensity < 60 ? 'Beginner' :
                   workoutIntensity < 75 ? 'Moderate' :
                   workoutIntensity < 90 ? 'Challenging' : 'Extreme'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>Target Distance (mi)</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant={targetDistance === 1 ? "contained" : "outlined"}
                    onClick={() => setTargetDistance(1)}
                    sx={{ mr: 1 }}
                  >
                    1
                  </Button>
                  <Button
                    size="small"
                    variant={targetDistance === 3 ? "contained" : "outlined"}
                    onClick={() => setTargetDistance(3)}
                    sx={{ mr: 1 }}
                  >
                    3
                  </Button>
                  <Button
                    size="small"
                    variant={targetDistance === 5 ? "contained" : "outlined"}
                    onClick={() => setTargetDistance(5)}
                    sx={{ mr: 1 }}
                  >
                    5
                  </Button>
                  <Button
                    size="small"
                    variant={targetDistance === 10 ? "contained" : "outlined"}
                    onClick={() => setTargetDistance(10)}
                  >
                    10
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Workout Goals
              </Typography>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Focus Area</InputLabel>
                <Select
                  value="strength_endurance"
                  label="Focus Area"
                >
                  <MenuItem value="strength_endurance">Strength & Endurance</MenuItem>
                  <MenuItem value="cardio">Cardiovascular Fitness</MenuItem>
                  <MenuItem value="flexibility">Flexibility & Mobility</MenuItem>
                  <MenuItem value="weight_loss">Weight Loss</MenuItem>
                  <MenuItem value="muscle_gain">Muscle Building</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Coaching Preferences
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>Coaching Style</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={coachingStyle === 'encouraging' ? 'contained' : 'outlined'}
                    onClick={() => setCoachingStyle('encouraging')}
                    startIcon={<EmojiEmotionsIcon />}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  >
                    Encouraging
                  </Button>
                  <Button
                    variant={coachingStyle === 'balanced' ? 'contained' : 'outlined'}
                    onClick={() => setCoachingStyle('balanced')}
                    startIcon={<CheckCircleIcon />}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  >
                    Balanced
                  </Button>
                  <Button
                    variant={coachingStyle === 'demanding' ? 'contained' : 'outlined'}
                    onClick={() => setCoachingStyle('demanding')}
                    startIcon={<WhatshotIcon />}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  >
                    Demanding
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>Coaching Frequency</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={coachFrequency === 'low' ? 'contained' : 'outlined'}
                    onClick={() => setCoachFrequency('low')}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  >
                    Minimal
                  </Button>
                  <Button
                    variant={coachFrequency === 'medium' ? 'contained' : 'outlined'}
                    onClick={() => setCoachFrequency('medium')}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  >
                    Moderate
                  </Button>
                  <Button
                    variant={coachFrequency === 'high' ? 'contained' : 'outlined'}
                    onClick={() => setCoachFrequency('high')}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  >
                    Frequent
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Voice Coach</Typography>
                  <Switch 
                    checked={voiceCoachEnabled}
                    onChange={(e) => setVoiceCoachEnabled(e.target.checked)}
                    color="primary"
                  />
                </Box>
                
                {voiceCoachEnabled && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Voice Volume
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <VolumeOffIcon fontSize="small" color="disabled" />
                      <Slider
                        value={voiceCoachVolume}
                        onChange={(e, value) => setVoiceCoachVolume(value)}
                        min={0}
                        max={100}
                        size="small"
                      />
                      <VolumeUpIcon fontSize="small" color="primary" />
                    </Stack>
                    
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => speakVoiceCoach("Voice coach test. I'll help guide your workout.")}
                        startIcon={<MicIcon />}
                        sx={{ flexGrow: 1 }}
                      >
                        Test Voice
                      </Button>
                      <MuiTooltip title="Connect Bluetooth Headphones">
                        <Button 
                          variant="outlined" 
                          size="small"
                          color={bluetoothDevices.some(d => d.connected) ? "success" : "primary"}
                          onClick={() => setShowBluetoothDialog(true)}
                          startIcon={bluetoothDevices.some(d => d.connected) ? <BluetoothConnectedIcon /> : <BluetoothIcon />}
                          sx={{ flexGrow: 1 }}
                        >
                          {bluetoothDevices.some(d => d.connected) ? "Connected" : "Bluetooth"}
                        </Button>
                      </MuiTooltip>
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2">Music Sync</Typography>
                  <Switch 
                    checked={musicSyncEnabled}
                    onChange={(e) => setMusicSyncEnabled(e.target.checked)}
                    color="primary"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Show Leaderboard</Typography>
                  <Switch 
                    checked={showLeaderboard}
                    onChange={(e) => setShowLeaderboard(e.target.checked)}
                    color="primary"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setWorkoutSetupDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              setWorkoutSetupDialogOpen(false);
              setWorkoutSimulatorOpen(true);
              speakVoiceCoach(`Starting ${selectedWorkout?.name || 'your workout'}. Get ready!`);
            }}
          >
            Start Workout
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Workout Simulator */}
      <Dialog
        open={workoutSimulatorOpen}
        onClose={() => setWorkoutSimulatorOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '900px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Typography variant="h6">{selectedWorkout?.name || "Workout Simulator"}</Typography>
            <Typography variant="caption" color="text.secondary">
              with {selectedTrainerObject?.name || "Virtual Coach"}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              icon={<AccessTimeFilledIcon fontSize="small" />} 
              label={elapsedTime > 0 ? formatTime(elapsedTime) : "00:00"}
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<FavoriteIcon fontSize="small" />} 
              label={`${currentHeartRate} BPM`}
              color="error" 
              variant="outlined"
            />
            <Chip 
              icon={<LocalFireDepartmentIcon fontSize="small" />} 
              label={`${caloriesBurned} cal`}
              color="warning" 
              variant="outlined"
            />
            <IconButton onClick={() => setIsFullscreenMode(true)}>
              <FullscreenIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', p: 0, flexGrow: 1 }}>
          <Grid container sx={{ flexGrow: 1 }}>
            <Grid item xs={12} md={8} sx={{ 
              position: 'relative',
              bgcolor: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* This would be a video or 3D animation in a real implementation */}
              <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
                <Typography variant="h3" gutterBottom>
                  {selectedWorkout?.exercises?.[currentExerciseIndex]?.name || "Exercise Visualization"}
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.7, mb: 4 }}>
                  {selectedWorkout?.exercises?.[currentExerciseIndex]?.description || "Follow along with the exercise guidance"}
                </Typography>
                
                <Box sx={{ mt: 4 }}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    startIcon={isWorkoutActive ? <PauseIcon /> : <PlayArrowIcon />}
                    onClick={toggleWorkout}
                    sx={{ mr: 2, px: 3, py: 1.5 }}
                  >
                    {isWorkoutActive ? "Pause" : "Start"}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={resetWorkout}
                    sx={{ color: 'white', borderColor: 'white', px: 3, py: 1.5 }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
              
              {voiceCoachSpeaking && (
                <Paper
                  elevation={5}
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxWidth: '80%',
                    p: 2,
                    borderRadius: 2,
                    animation: 'fadeInOut 0.5s ease',
                    '@keyframes fadeInOut': {
                      '0%': { opacity: 0, transform: 'translate(-50%, 20px)' },
                      '100%': { opacity: 1, transform: 'translate(-50%, 0)' }
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                      <MicIcon />
                    </Avatar>
                    <Typography variant="body1">
                      {lastVoiceCoachMessage}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ 
              borderLeft: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Workout Progress
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Overall Progress
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {selectedWorkout?.exercises 
                        ? Math.round((currentExerciseIndex / selectedWorkout.exercises.length) * 100) 
                        : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={selectedWorkout?.exercises 
                      ? (currentExerciseIndex / selectedWorkout.exercises.length) * 100 
                      : 0} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={1}
                      sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Heart Rate Zone
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                        {currentHeartRate < 120 ? 'Moderate' : 'Cardio'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper 
                      elevation={1}
                      sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Trainer Intensity
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                        {workoutIntensity}%
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto', bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Exercise Sequence
                </Typography>
                
                <List dense>
                  {selectedWorkout?.exercises?.map((exercise, index) => (
                    <ListItem 
                      key={index}
                      selected={index === currentExerciseIndex}
                      sx={{ 
                        borderRadius: 1,
                        mb: 0.5,
                        bgcolor: index === currentExerciseIndex 
                          ? alpha(theme.palette.primary.main, 0.1)
                          : 'transparent',
                        border: index === currentExerciseIndex
                          ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                          : 'none'
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: index < currentExerciseIndex
                              ? 'success.main'
                              : index === currentExerciseIndex
                              ? 'primary.main'
                              : alpha(theme.palette.text.disabled, 0.1),
                            color: index < currentExerciseIndex
                              ? 'white'
                              : index === currentExerciseIndex
                              ? 'white'
                              : theme.palette.text.disabled
                          }}
                        >
                          {index < currentExerciseIndex 
                            ? <CheckCircleIcon fontSize="small" />
                            : index === currentExerciseIndex
                            ? (index + 1)
                            : (index + 1)
                          }
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={exercise.name}
                        secondary={
                          exercise.sets 
                            ? `${exercise.sets} sets × ${exercise.reps || ''} ${exercise.duration ? `(${Math.floor(exercise.duration / 60)}:${(exercise.duration % 60).toString().padStart(2, '0')})` : ''}`
                            : exercise.duration 
                            ? `Duration: ${Math.floor(exercise.duration / 60)}:${(exercise.duration % 60).toString().padStart(2, '0')}`
                            : ''
                        }
                        primaryTypographyProps={{
                          fontWeight: index === currentExerciseIndex ? 'bold' : 'normal',
                          color: index < currentExerciseIndex ? 'text.disabled' : 'text.primary'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="outlined"
                    startIcon={<SkipPreviousIcon />}
                    onClick={goToPreviousExercise}
                    disabled={currentExerciseIndex <= 0}
                  >
                    Previous
                  </Button>
                  
                  <Button 
                    variant="contained"
                    endIcon={<SkipNextIcon />}
                    onClick={goToNextExercise}
                    disabled={!selectedWorkout?.exercises || currentExerciseIndex >= selectedWorkout.exercises.length - 1}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Elite Fitness Coach
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isWorkoutActive && (
              <Button
                variant="outlined"
                startIcon={<FullscreenIcon />}
                size="small"
                onClick={() => setIsFullscreenMode(true)}
              >
                Full Screen
              </Button>
            )}
            
            {milestones.length > 0 && (
              <Badge badgeContent={milestones.length} color="error">
                <IconButton color="primary">
                  <NotificationsIcon />
                </IconButton>
              </Badge>
            )}
            
            <IconButton 
              color="primary"
              onClick={() => setShowBluetoothDialog(true)}
              sx={{ mr: 1 }}
            >
              <MuiTooltip title="Connect Bluetooth Headphones">
                <BluetoothIcon />
              </MuiTooltip>
            </IconButton>
            
            <IconButton 
              color="primary"
            >
              <HeadphonesIcon />
            </IconButton>
            
            {/* Diagnostics functionality removed */}
            
            {voiceCoachSpeaking && (
              <Zoom in={voiceCoachSpeaking}>
                <Chip
                  icon={<MicIcon />}
                  label={lastVoiceCoachMessage.length > 20 ? lastVoiceCoachMessage.substring(0, 20) + '...' : lastVoiceCoachMessage}
                  color="primary"
                  size="small"
                  sx={{ 
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.7 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0.7 }
                    }
                  }}
                />
              </Zoom>
            )}
          </Box>
        </Box>
        
        {/* Sub tabs for navigation */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeSubTab} 
            onChange={(e, newValue) => setActiveSubTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ '& .MuiTab-root': { fontWeight: 'medium' } }}
          >
            <Tab 
              label="Workout" 
              value="workout" 
              icon={<FitnessCenterIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Achievements" 
              value="achievements" 
              icon={<EmojiEventsIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {activeSubTab === "achievements" && (
          <>
            {/* Achievements Hero Section */}
            <Box
              sx={{
                mb: 4,
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                height: 240,
                display: 'flex',
                alignItems: 'flex-end',
                backgroundImage: 'linear-gradient(to right, rgba(126, 87, 194, 0.8), rgba(171, 71, 188, 0.8)), url(https://images.unsplash.com/photo-1565728744382-61accd4aa148?q=80&w=1470&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
              }}
            >
              <Box
                sx={{
                  p: 3,
                  width: '100%',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      AI-Powered Achievement System
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      Your Fitness Journey
                    </Typography>
                    <Typography variant="subtitle1">
                      Personalized achievements that evolve as you grow stronger
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip 
                        icon={<EmojiEventsIcon fontSize="small" />}
                        label="12 Unlocked" 
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <Chip 
                        icon={<TrendingUpIcon fontSize="small" />} 
                        label="75% Progress" 
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <Chip 
                        icon={<AutoGraphIcon fontSize="small" />} 
                        label="Elite Status"
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </Stack>
                  </Box>
                  <GradientButton
                    variant="contained"
                    size="large"
                    endIcon={<EmojiEventsIcon />}
                    sx={{ 
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      backgroundImage: 'linear-gradient(90deg, #7c4dff, #b388ff)',
                      boxShadow: '0 8px 16px rgba(124, 77, 255, 0.3)'
                    }}
                  >
                    Share Progress
                  </GradientButton>
                </Box>
              </Box>
            </Box>

            {/* AI Achievement Analysis */}
            <Paper
              elevation={4}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #303f9f, #7b1fa2)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2 }}>
                <Chip
                  icon={<ScienceIcon />}
                  label="AI-Powered"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: 4
                  }}
                />
              </Box>
              
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoGraphIcon /> Achievement Analytics
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Based on your activity, sleep, and heart rate data, we've identified these achievement opportunities:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      height: '100%',
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#64ffda' }}>
                      Heart Rate Recovery
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Your heart rate recovery has improved by 15% since last month. Keep up the cardio training!
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(to right, #64ffda, #1de9b6)'
                        }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      height: '100%',
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#ffab40' }}>
                      Sleep Quality Booster
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Your deep sleep has increased by 22 minutes on days you exercise. Try evening workouts for further improvement.
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={65} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(to right, #ffab40, #ff6e40)'
                        }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      height: '100%',
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: '#8c9eff' }}>
                      Activity Champion
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Your active minutes are up 18% this week, with 42 more vigorous activity minutes than last week.
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={82} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(to right, #8c9eff, #536dfe)'
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Recent Achievements with 3D-like cards */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Recently Unlocked
              </Typography>
              
              <Grid container spacing={3}>
                {[
                  {
                    title: 'Early Riser',
                    description: 'Completed 5 workouts before 8 AM',
                    date: '2 days ago',
                    icon: <AccessTimeFilledIcon />,
                    color: '#2196f3',
                    points: 200,
                    rarity: 'Uncommon',
                    image: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?q=80&w=1469&auto=format&fit=crop'
                  },
                  {
                    title: 'Calorie Crusher',
                    description: 'Burned over 5,000 calories in one week',
                    date: '5 days ago',
                    icon: <LocalFireDepartmentIcon />,
                    color: '#ff5722',
                    points: 300,
                    rarity: 'Rare',
                    image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?q=80&w=1470&auto=format&fit=crop'
                  },
                  {
                    title: 'Perseverance',
                    description: 'Completed a workout on 10 consecutive days',
                    date: '1 week ago',
                    icon: <EmojiEventsIcon />,
                    color: '#ffc107',
                    points: 500,
                    rarity: 'Epic',
                    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1469&auto=format&fit=crop'
                  }
                ].map((achievement, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      elevation={8}
                      sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                        height: 260,
                        background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${achievement.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-10px) scale(1.02)',
                          boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                          '& .achievement-content': {
                            transform: 'translateY(-5px)'
                          }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          m: 2
                        }}
                      >
                        <Chip
                          label={achievement.rarity}
                          size="small"
                          sx={{
                            bgcolor: achievement.rarity === 'Epic' 
                              ? 'rgba(156, 39, 176, 0.8)' 
                              : achievement.rarity === 'Rare' 
                                ? 'rgba(33, 150, 243, 0.8)' 
                                : 'rgba(76, 175, 80, 0.8)',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Box 
                        className="achievement-content"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 3,
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1,
                            gap: 1
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: achievement.color,
                              boxShadow: `0 0 20px ${achievement.color}`
                            }}
                          >
                            {achievement.icon}
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" color="white">
                            {achievement.title}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mb: 1 }}>
                          {achievement.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Chip 
                            label={`+${achievement.points} XP`} 
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.2)', 
                              color: 'white',
                              fontWeight: 'bold' 
                            }}
                          />
                          <Typography variant="caption" color="rgba(255,255,255,0.6)">
                            {achievement.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Achievement Progress Tracker */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #fafafa, #f5f5f5)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Achievement Roadmap
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Timeline position="alternate">
                    {[
                      {
                        title: 'Fitness Initiate',
                        description: 'Complete your first 5 workouts',
                        complete: true,
                        color: '#4caf50',
                        icon: <FitnessCenterIcon />
                      },
                      {
                        title: 'Diversification',
                        description: 'Try all 5 workout categories',
                        complete: true,
                        color: '#2196f3',
                        icon: <EmojiEventsIcon />
                      },
                      {
                        title: 'Dedication',
                        description: 'Work out 3 times a week for a month',
                        complete: false,
                        current: true,
                        color: '#ff9800',
                        icon: <CalendarMonthIcon />
                      },
                      {
                        title: 'Elite Athlete',
                        description: 'Maintain "Active" status for 3 months',
                        complete: false,
                        color: '#f44336',
                        icon: <WhatshotIcon />
                      },
                      {
                        title: 'Master of Fitness',
                        description: 'Complete all achievement categories',
                        complete: false,
                        color: '#9c27b0',
                        icon: <StarIcon />
                      }
                    ].map((milestone, index) => (
                      <TimelineItem key={index}>
                        <TimelineSeparator>
                          <TimelineDot
                            sx={{
                              bgcolor: milestone.complete 
                                ? milestone.color 
                                : milestone.current 
                                  ? 'white' 
                                  : 'grey.300',
                              border: milestone.current 
                                ? `2px solid ${milestone.color}` 
                                : 'none',
                              boxShadow: milestone.complete || milestone.current
                                ? `0 0 10px ${alpha(milestone.color, 0.5)}`
                                : 'none'
                            }}
                          >
                            {milestone.icon}
                          </TimelineDot>
                          <TimelineConnector 
                            sx={{ 
                              bgcolor: index < 2 
                                ? milestone.color 
                                : 'grey.300'
                            }} 
                          />
                        </TimelineSeparator>
                        <TimelineContent>
                          <Paper
                            elevation={milestone.current ? 3 : 1}
                            sx={{
                              p: 2,
                              bgcolor: milestone.current 
                                ? alpha(milestone.color, 0.1)
                                : 'background.paper',
                              border: milestone.current 
                                ? `1px solid ${alpha(milestone.color, 0.3)}`
                                : '1px solid transparent',
                              borderRadius: 2
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {milestone.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {milestone.description}
                            </Typography>
                            {milestone.complete && (
                              <Chip 
                                icon={<CheckCircleIcon fontSize="small" />}
                                label="Completed" 
                                size="small" 
                                color="success"
                                sx={{ mt: 1 }}
                              />
                            )}
                            {milestone.current && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                  Progress: 70%
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={70} 
                                  sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    bgcolor: alpha(milestone.color, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: milestone.color
                                    }
                                  }}
                                />
                              </Box>
                            )}
                          </Paper>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card 
                    elevation={4}
                    sx={{ 
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ 
                      bgcolor: '#673ab7', 
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <LightbulbIcon />
                      <Typography variant="h6" fontWeight="bold">
                        AI Fitness Insights
                      </Typography>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" paragraph>
                        Based on your achievement patterns, our AI suggests:
                      </Typography>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: '#ff4081', width: 28, height: 28 }}>
                              <TrendingUpIcon fontSize="small" />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText 
                            primary="Try interval training to boost your achievement pace"
                            secondary="Helps with unlocking performance-based rewards"
                          />
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: '#00bcd4', width: 28, height: 28 }}>
                              <CalendarMonthIcon fontSize="small" />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText 
                            primary="Workout on Tuesdays and Thursdays"
                            secondary="These are your missing days for consistency badges"
                          />
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: '#4caf50', width: 28, height: 28 }}>
                              <DirectionsRunIcon fontSize="small" />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText 
                            primary="You excel at high-intensity workouts"
                            secondary="Focusing here could earn unique achievements"
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button 
                          variant="outlined" 
                          color="secondary"
                          startIcon={<AutoGraphIcon />}
                        >
                          View Detailed Analysis
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Upcoming Achievements */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                On Your Horizon
              </Typography>
              
              <Box sx={{ display: 'flex', overflowX: 'auto', pb: 2, gap: 2 }}>
                {[
                  {
                    title: 'Morning Warrior',
                    description: 'Complete 10 workouts before 9 AM',
                    icon: <AccessTimeFilledIcon />,
                    color: '#3f51b5',
                    progress: 60,
                    reward: '400 XP',
                    difficulty: 'Challenging'
                  },
                  {
                    title: 'HIIT Master',
                    description: 'Complete 15 HIIT workouts',
                    icon: <WhatshotIcon />,
                    color: '#e91e63',
                    progress: 40,
                    reward: '350 XP',
                    difficulty: 'Moderate'
                  },
                  {
                    title: 'Consistency King',
                    description: 'Work out 5 days per week for a month',
                    icon: <CalendarMonthIcon />,
                    color: '#009688',
                    progress: 75,
                    reward: '600 XP',
                    difficulty: 'Hard'
                  },
                  {
                    title: 'Exercise Explorer',
                    description: 'Try 20 different workout routines',
                    icon: <ExploreIcon />,
                    color: '#ff5722',
                    progress: 25,
                    reward: '300 XP',
                    difficulty: 'Easy'
                  },
                  {
                    title: 'Iron Will',
                    description: 'Complete 5 workouts of 60+ minutes',
                    icon: <FitnessCenterIcon />,
                    color: '#607d8b',
                    progress: 50,
                    reward: '500 XP',
                    difficulty: 'Moderate'
                  }
                ].map((achievement, index) => (
                  <Paper
                    key={index}
                    elevation={3}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      minWidth: 280,
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                      },
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: `linear-gradient(to right, ${achievement.color}, ${achievement.color}dd)`
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(achievement.color, 0.1),
                          color: achievement.color
                        }}
                      >
                        {achievement.icon}
                      </Avatar>
                      <Chip 
                        label={achievement.difficulty}
                        size="small"
                        sx={{
                          bgcolor: achievement.difficulty === 'Easy' 
                            ? alpha('#4caf50', 0.1)
                            : achievement.difficulty === 'Moderate'
                            ? alpha('#ff9800', 0.1)
                            : alpha('#f44336', 0.1),
                          color: achievement.difficulty === 'Easy' 
                            ? '#4caf50'
                            : achievement.difficulty === 'Moderate'
                            ? '#ff9800'
                            : '#f44336',
                          border: '1px solid',
                          borderColor: achievement.difficulty === 'Easy' 
                            ? alpha('#4caf50', 0.3)
                            : achievement.difficulty === 'Moderate'
                            ? alpha('#ff9800', 0.3)
                            : alpha('#f44336', 0.3),
                        }}
                      />
                    </Box>
                    
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      {achievement.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {achievement.description}
                    </Typography>
                    
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" color={achievement.color}>
                          {achievement.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={achievement.progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(achievement.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: achievement.color
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Chip 
                        icon={<EmojiEventsIcon fontSize="small" />}
                        label={achievement.reward} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(achievement.color, 0.1),
                          color: achievement.color,
                          fontWeight: 'bold',
                          border: `1px solid ${alpha(achievement.color, 0.3)}`
                        }}
                      />
                      <IconButton size="small" color="primary">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          </>
        )}
        
        {activeSubTab === "workout" && (
          <>
            {/* Workout Hero Section with featured workout */}
            <Box
              sx={{
                mb: 4,
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                height: 240,
                display: 'flex',
                alignItems: 'flex-end',
                backgroundImage: 'linear-gradient(to right, rgba(25,118,210,0.8), rgba(3,169,244,0.8)), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
              }}
            >
              <Box
                sx={{
                  p: 3,
                  width: '100%',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      Today's Recommended Workout
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {todaysWorkout?.name || "Upper Body HIIT"}
                    </Typography>
                    <Typography variant="subtitle1">
                      {todaysWorkout?.description || "Intense upper body training with cardio bursts"}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip 
                        label={todaysWorkout?.level || "Advanced"} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <Chip 
                        icon={<AccessTimeFilledIcon fontSize="small" />} 
                        label={todaysWorkout?.duration || "45 min"} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                      <Chip 
                        icon={<LocalFireDepartmentIcon fontSize="small" />} 
                        label={todaysWorkout?.calories || "450 cal"}
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </Stack>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<FitnessCenterIcon />}
                      onClick={() => {
                        setWorkoutSetupDialogOpen(true);
                        setSelectedWorkout(todaysWorkout || {
                          name: "Upper Body HIIT",
                          description: "Intense upper body training with cardio bursts",
                          level: "Advanced",
                          duration: "45 min",
                          calories: "450 cal",
                          type: "hiit"
                        });
                      }}
                      sx={{ 
                        px: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        }
                      }}
                    >
                      Customize Workout
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<HeadsetMicIcon />}
                      onClick={() => {
                        setCoachingStyle(selectedPersonality || 'balanced');
                        setShowPersonalityDialog(true);
                      }}
                      sx={{ 
                        px: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.3)',
                        }
                      }}
                    >
                      Choose Trainer
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Workout Type Selection Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Workout Categories
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[...CLASS_TYPES, 
                  {
                    id: 'hiit_advanced',
                    name: 'Advanced HIIT',
                    icon: <BoltIcon />,
                    description: 'High-intensity tabata and circuit training',
                    color: '#d32f2f',
                    difficulty: 'Elite'
                  },
                  {
                    id: 'pilates',
                    name: 'Pilates',
                    icon: <SelfImprovementIcon />,
                    description: 'Core strength and flexibility training',
                    color: '#00acc1',
                    difficulty: 'All levels'
                  },
                  {
                    id: 'boxing',
                    name: 'Boxing',
                    icon: <SportsMartialArtsIcon />,
                    description: 'High-energy boxing combinations',
                    color: '#f57c00',
                    difficulty: 'Intermediate'
                  },
                  {
                    id: 'resistance',
                    name: 'Resistance',
                    icon: <FitnessCenterIcon />,
                    description: 'Band and bodyweight resistance training',
                    color: '#7b1fa2',
                    difficulty: 'All levels'
                  }
                ].map((classType) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={classType.id}>
                    <ClassCard 
                      classInfo={classType}
                      isSelected={selectedClassType === classType.id}
                      onClick={() => {
                        setSelectedClassType(classType.id);
                        // Find a workout that matches this type
                        const matchingWorkout = {
                          name: `${classType.name} Workout`,
                          description: classType.description,
                          level: classType.difficulty,
                          duration: "30 min",
                          calories: "350 cal",
                          type: classType.id,
                          exercises: generateExercisesForType(classType.id)
                        };
                        setSelectedWorkout(matchingWorkout);
                        setWorkoutSetupDialogOpen(true);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* NEW: Structured Workout Programs Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonthIcon sx={{ mr: 1 }} /> Structured Workout Programs
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Take your fitness to the next level with our professionally designed multi-week programs.
              </Typography>
              
              <Grid container spacing={3}>
                {programCategories.map(program => (
                  <Grid item xs={12} sm={6} md={3} key={program.id}>
                    <Card 
                      elevation={3}
                      sx={{ 
                        borderRadius: 4, 
                        overflow: 'hidden',
                        height: '100%',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <Box 
                          component="img"
                          src={program.image}
                          alt={program.name}
                          sx={{ 
                            width: '100%',
                            height: 140,
                            objectFit: 'cover'
                          }}
                        />
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%',
                          background: `linear-gradient(to bottom, transparent 20%, ${alpha(program.color, 0.8)} 100%)`
                        }} />
                        
                        <Box sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          p: 2,
                          width: '100%',
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold" color="white">
                            {program.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip 
                              size="small" 
                              label={program.level} 
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)', 
                                color: 'white',
                                height: 20,
                                fontSize: '0.7rem'
                              }} 
                            />
                            <Chip 
                              size="small" 
                              label={program.duration} 
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)', 
                                color: 'white',
                                height: 20,
                                fontSize: '0.7rem'
                              }} 
                            />
                          </Box>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {program.description}
                        </Typography>
                        
                        <Box>
                          {program.progress > 0 ? (
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Progress</Typography>
                                <Typography variant="caption" fontWeight="bold" color={program.color}>
                                  {program.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={program.progress} 
                                sx={{ 
                                  height: 6, 
                                  borderRadius: 3,
                                  bgcolor: alpha(program.color, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: program.color
                                  }
                                }}
                              />
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <AccessTimeFilledIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {program.commitment} commitment
                              </Typography>
                            </Box>
                          )}
                          
                          <Button 
                            variant="contained"
                            fullWidth
                            startIcon={program.progress > 0 ? <PlayArrowIcon /> : <AddIcon />}
                            sx={{ 
                              bgcolor: program.color,
                              '&:hover': {
                                bgcolor: alpha(program.color, 0.8)
                              }
                            }}
                            onClick={() => {
                              setSelectedProgram(program);
                              setShowProgramDialog(true);
                            }}
                          >
                            {program.progress > 0 ? 'Continue Program' : 'Start Program'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            {/* Workout Simulation Section */}
            <Box sx={{ mb: 4 }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Workout Simulator
                </Typography>
                
                <Typography variant="body1" paragraph>
                  Experience a realistic workout preview with our interactive simulator. Follow along 
                  with guided exercises and adjust intensity in real-time.
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<FitnessCenterIcon />}
                    onClick={() => {
                      setWorkoutSimulatorOpen(true);
                      // Start with a default workout if none selected
                      if (!selectedWorkout) {
                        setSelectedWorkout({
                          name: "Full Body Circuit",
                          description: "Complete body workout with strength and cardio elements",
                          level: "Intermediate",
                          duration: "35 min",
                          calories: "380 cal",
                          type: "strength",
                          exercises: generateExercisesForType("strength")
                        });
                      }
                    }}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      background: 'linear-gradient(45deg, #3d5afe, #651fff)'
                    }}
                  >
                    Launch Simulator
                  </Button>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Simulator Features:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip size="small" icon={<MonitorHeartIcon fontSize="small" />} label="Heart Rate Tracking" />
                      <Chip size="small" icon={<DirectionsRunIcon fontSize="small" />} label="Form Guidance" />
                      <Chip size="small" icon={<MicIcon fontSize="small" />} label="Voice Coach" />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Trainers Selection with enhanced visuals */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Elite Trainers
              </Typography>
              
              <Grid container spacing={2}>
                {[...TRAINERS, 
                  {
                    id: 'james',
                    name: 'James Wilson',
                    specialty: 'HIIT, Boxing',
                    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                    bio: 'Olympic medalist and fitness expert',
                    experience: '15+ years',
                    rating: 4.95,
                    quote: 'Your only competition is yourself yesterday'
                  },
                  {
                    id: 'sophia',
                    name: 'Sophia Martinez',
                    specialty: 'Yoga, Recovery',
                    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                    bio: 'Mind-body wellness specialist',
                    experience: '12 years',
                    rating: 4.9,
                    quote: 'Find peace in every movement'
                  }
                ].map((trainer) => (
                  <Grid item xs={12} sm={6} md={3} key={trainer.id}>
                    <TrainerCard 
                      trainer={trainer}
                      isSelected={selectedTrainer === trainer.id}
                      onClick={() => setSelectedTrainer(trainer.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </motion.div>
      
      {/* Diagnostics functionality removed */}
      
      {/* Personality Selection Dialog */}
      <Dialog
        open={showPersonalityDialog}
        onClose={() => setShowPersonalityDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HeadsetMicIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
              <Typography variant="h6" fontWeight="bold">Customize Your Workout Coach</Typography>
            </Box>
            <IconButton onClick={() => setShowPersonalityDialog(false)}>
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Choose Your Coach's Personality
              </Typography>
              
              <Typography variant="body2" paragraph>
                Customize how your virtual coach motivates and guides you through workouts. Each personality has a unique voice, coaching style, and language patterns.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {Object.keys(TRAINER_PERSONALITIES).map(personalityKey => {
                  const personality = TRAINER_PERSONALITIES[personalityKey];
                  // Select appropriate icon for each personality
                  let PersonalityIcon;
                  switch(personalityKey) {
                    case 'encouraging': PersonalityIcon = EmojiEmotionsIcon; break;
                    case 'balanced': PersonalityIcon = CheckCircleIcon; break;
                    case 'demanding': PersonalityIcon = WhatshotIcon; break;
                    case 'technical': PersonalityIcon = ScienceIcon; break;
                    case 'mindful': PersonalityIcon = SelfImprovementIcon; break;
                    case 'playful': PersonalityIcon = EmojiPeopleIcon; break;
                    default: PersonalityIcon = EmojiEmotionsIcon;
                  }
                  
                  return (
                    <Paper
                      key={personalityKey}
                      elevation={coachingStyle === personalityKey ? 3 : 1}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderLeft: coachingStyle === personalityKey ? 
                          `4px solid ${theme.palette.primary.main}` :
                          `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        bgcolor: coachingStyle === personalityKey ?
                          alpha(theme.palette.primary.light, 0.1) :
                          'transparent',
                        '&:hover': {
                          bgcolor: coachingStyle === personalityKey ?
                            alpha(theme.palette.primary.light, 0.1) :
                            alpha(theme.palette.background.default, 0.7),
                          transform: 'translateX(5px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        setCoachingStyle(personalityKey);
                        setTimeout(() => {
                          speakVoiceCoach("", personalityKey === 'encouraging' ? 'start' :
                            personalityKey === 'demanding' ? 'start' :
                            personalityKey === 'technical' ? 'start' :
                            personalityKey === 'mindful' ? 'start' :
                            personalityKey === 'playful' ? 'start' : 'start');
                        }, 300);
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                          sx={{ 
                            mr: 2,
                            bgcolor: personalityKey === 'encouraging' ? '#4caf50' :
                              personalityKey === 'balanced' ? '#2196f3' :
                              personalityKey === 'demanding' ? '#f44336' :
                              personalityKey === 'technical' ? '#3f51b5' :
                              personalityKey === 'mindful' ? '#9c27b0' :
                              '#ff9800'
                          }}
                        >
                          <PersonalityIcon />
                        </Avatar>
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {personality.name} {personality.emoji}
                            </Typography>
                            
                            {coachingStyle === personalityKey && (
                              <Chip
                                label="Selected"
                                size="small"
                                color="primary"
                                sx={{ height: 24 }}
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {personality.description}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              mt: 1,
                              fontStyle: 'italic',
                              color: 'text.secondary',
                              border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.background.default, 0.5)
                            }}
                          >
                            Example: "{personality.phrases.during[0]}"
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Voice Settings
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ mr: 2, minWidth: 100 }}>
                  Coach Volume
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
                  <VolumeOffIcon fontSize="small" color="disabled" />
                  <Slider
                    value={voiceCoachVolume}
                    onChange={(e, value) => setVoiceCoachVolume(value)}
                    min={0}
                    max={100}
                    size="small"
                  />
                  <VolumeUpIcon fontSize="small" color="primary" />
                </Stack>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body2" sx={{ mr: 2, minWidth: 100 }}>
                  Coaching Frequency
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={coachFrequency === 'low' ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setCoachFrequency('low')}
                      sx={{ flexGrow: 1 }}
                    >
                      Minimal
                    </Button>
                    <Button
                      variant={coachFrequency === 'medium' ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setCoachFrequency('medium')}
                      sx={{ flexGrow: 1 }}
                    >
                      Moderate
                    </Button>
                    <Button
                      variant={coachFrequency === 'high' ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setCoachFrequency('high')}
                      sx={{ flexGrow: 1 }}
                    >
                      Frequent
                    </Button>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {coachFrequency === 'low' ? 'Coach speaks only at key moments' :
                    coachFrequency === 'medium' ? 'Regular cues throughout workout' :
                    'Constant motivation and feedback'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<MicIcon />}
                  onClick={() => speakVoiceCoach("This is how your coach will sound during the workout", 'during')}
                  fullWidth
                >
                  Test Voice
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Preset Trainer Profiles
              </Typography>
              
              <Typography variant="body2" paragraph>
                Choose from our custom trainers with specialized coaching styles.
              </Typography>
              
              <Grid container spacing={2}>
                {customTrainers.map(trainer => (
                  <Grid item xs={12} key={trainer.id}>
                    <Paper
                      elevation={selectedTrainer === trainer.id ? 3 : 1}
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderLeft: selectedTrainer === trainer.id ? 
                          `4px solid ${theme.palette.primary.main}` : 
                          '1px solid transparent',
                        bgcolor: selectedTrainer === trainer.id ? 
                          alpha(theme.palette.primary.light, 0.1) : 
                          'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateX(5px)',
                          bgcolor: alpha(theme.palette.background.default, 0.7)
                        }
                      }}
                      onClick={() => {
                        setSelectedTrainer(trainer.id);
                        setCoachingStyle(trainer.personality);
                        speakVoiceCoach(`Hello, I'm ${trainer.name}. ${trainer.quote}`, 'custom');
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={trainer.avatar} sx={{ width: 60, height: 60, mr: 2 }} />
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
                              {trainer.name}
                            </Typography>
                            <Rating value={trainer.rating} size="small" precision={0.1} readOnly />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {trainer.specialty} · {trainer.experience}
                          </Typography>
                          
                          <Chip
                            label={TRAINER_PERSONALITIES[trainer.personality]?.name || 'Balanced'}
                            size="small"
                            sx={{ 
                              height: 24, 
                              bgcolor: trainer.personality === 'encouraging' ? '#e8f5e9' :
                                trainer.personality === 'demanding' ? '#ffebee' :
                                trainer.personality === 'mindful' ? '#f3e5f5' :
                                trainer.personality === 'playful' ? '#fff8e1' :
                                trainer.personality === 'technical' ? '#e3f2fd' :
                                '#e0f7fa',
                              color: trainer.personality === 'encouraging' ? '#2e7d32' :
                                trainer.personality === 'demanding' ? '#c62828' :
                                trainer.personality === 'mindful' ? '#6a1b9a' :
                                trainer.personality === 'playful' ? '#ff8f00' :
                                trainer.personality === 'technical' ? '#1565c0' :
                                '#0097a7'
                            }}
                          />
                          
                          <Typography variant="body2" sx={{ 
                            mt: 1,
                            fontStyle: 'italic',
                            color: 'text.secondary',
                            fontSize: '0.8rem'
                          }}>
                            "{trainer.quote}"
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.info.light, 0.1), 
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`
              }}>
                <Typography variant="subtitle2" color="info.main" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                  What Makes a Good Coach?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Research shows that motivation style affects workout adherence. Choose a coaching style that matches your preferences to improve consistency and results.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setShowPersonalityDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setShowPersonalityDialog(false);
              speakVoiceCoach("Your coach is ready! Let's get started.", 'start');
            }}
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Program Details Dialog */}
      <Dialog
        open={showProgramDialog}
        onClose={() => setShowProgramDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          elevation: 5,
          sx: { borderRadius: 3 }
        }}
      >
        {selectedProgram && (
          <>
            <Box sx={{ position: 'relative' }}>
              <Box 
                component="img"
                src={selectedProgram.image}
                alt={selectedProgram.name}
                sx={{ 
                  width: '100%',
                  height: 200,
                  objectFit: 'cover'
                }}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                background: `linear-gradient(to bottom, transparent 0%, ${alpha(selectedProgram.color, 0.9)} 100%)`
              }} />
              
              <Box sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                p: 3,
                width: '100%',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="white">
                      {selectedProgram.name}
                    </Typography>
                    <Typography variant="subtitle1" color="white" sx={{ opacity: 0.9 }}>
                      {selectedProgram.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={<AccessTimeFilledIcon fontSize="small" />}
                      label={selectedProgram.duration} 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                    />
                    <Chip 
                      icon={<FitnessCenterIcon fontSize="small" />}
                      label={selectedProgram.level} 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                    />
                  </Box>
                </Box>
              </Box>
              
              <IconButton 
                onClick={() => setShowProgramDialog(false)}
                sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Program Schedule
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Tabs
                        value={activeWeek}
                        onChange={(e, newValue) => setActiveWeek(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="program weeks"
                        sx={{
                          mb: 2,
                          '& .MuiTab-root': {
                            minWidth: '80px'
                          }
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, selectedProgram.duration.split(' ')[0]).map(week => (
                          <Tab 
                            key={week} 
                            label={`Week ${week}`} 
                            value={week} 
                            sx={{
                              bgcolor: week < activeWeek ? alpha(selectedProgram.color, 0.1) : 'transparent',
                              '&.Mui-selected': {
                                color: selectedProgram.color,
                                fontWeight: 'bold'
                              }
                            }}
                          />
                        ))}
                      </Tabs>
                      
                      <Box sx={{ px: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                          Week {activeWeek} Schedule:
                        </Typography>
                        
                        <Grid container spacing={1}>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                            <Grid item xs={12} sm={6} key={day}>
                              <Paper
                                elevation={1}
                                sx={{ 
                                  p: 2, 
                                  mb: 1, 
                                  borderRadius: 2,
                                  border: day === 'Monday' || day === 'Wednesday' || day === 'Friday' || day === 'Saturday' 
                                    ? `1px solid ${alpha(selectedProgram.color, 0.3)}` 
                                    : '1px solid transparent',
                                  bgcolor: day === 'Monday' || day === 'Wednesday' || day === 'Friday' || day === 'Saturday'
                                    ? alpha(selectedProgram.color, 0.05)
                                    : alpha('#f5f5f5', 0.5)
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {day}
                                  </Typography>
                                  
                                  {day === 'Monday' || day === 'Wednesday' || day === 'Friday' || day === 'Saturday' ? (
                                    <Chip 
                                      size="small"
                                      label={
                                        day === 'Monday' 
                                          ? selectedProgram.id === 'strength' ? "Upper Body" : "Cardio" 
                                          : day === 'Wednesday' 
                                          ? selectedProgram.id === 'strength' ? "Lower Body" : "HIIT"
                                          : day === 'Friday'
                                          ? selectedProgram.id === 'strength' ? "Full Body" : "Endurance"
                                          : "Mobility"
                                      }
                                      sx={{ 
                                        bgcolor: alpha(selectedProgram.color, 0.1),
                                        color: selectedProgram.color,
                                        fontWeight: 'medium'
                                      }}
                                    />
                                  ) : (
                                    <Chip 
                                      size="small"
                                      label="Rest"
                                      sx={{ 
                                        bgcolor: alpha('#9e9e9e', 0.1),
                                        color: 'text.secondary'
                                      }}
                                    />
                                  )}
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {day === 'Monday' || day === 'Wednesday' || day === 'Friday' || day === 'Saturday' ? (
                                    <>
                                      {day === 'Monday' 
                                        ? selectedProgram.id === 'strength' ? "Chest, shoulders & triceps workout" : "Steady state cardio run/bike" 
                                        : day === 'Wednesday' 
                                        ? selectedProgram.id === 'strength' ? "Legs, glutes & core workout" : "Interval sprint training"
                                        : day === 'Friday'
                                        ? selectedProgram.id === 'strength' ? "Full body compound movements" : "Long endurance session"
                                        : "Recovery, stretching & mobility work"
                                      }
                                    </>
                                  ) : (
                                    "Active recovery day - light walking recommended"
                                  )}
                                </Typography>
                                
                                {(day === 'Monday' || day === 'Wednesday' || day === 'Friday' || day === 'Saturday') && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ 
                                      mt: 1.5,
                                      color: selectedProgram.color,
                                      borderColor: alpha(selectedProgram.color, 0.5)
                                    }}
                                    startIcon={<PlayArrowIcon />}
                                    onClick={() => {
                                      setShowProgramDialog(false);
                                      const workout = {
                                        name: `${selectedProgram.name}: Week ${activeWeek} - ${day}`,
                                        description: day === 'Monday' 
                                          ? selectedProgram.id === 'strength' ? "Chest, shoulders & triceps workout" : "Steady state cardio run/bike" 
                                          : day === 'Wednesday' 
                                          ? selectedProgram.id === 'strength' ? "Legs, glutes & core workout" : "Interval sprint training"
                                          : day === 'Friday'
                                          ? selectedProgram.id === 'strength' ? "Full body compound movements" : "Long endurance session"
                                          : "Recovery, stretching & mobility work",
                                        level: selectedProgram.level,
                                        duration: "45 min",
                                        calories: "400 cal",
                                        type: selectedProgram.id
                                      };
                                      setSelectedWorkout(workout);
                                      setWorkoutSetupDialogOpen(true);
                                    }}
                                  >
                                    Start Workout
                                  </Button>
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Program Details
                      </Typography>
                      
                      <Paper sx={{ p: 2, bgcolor: alpha(selectedProgram.color, 0.05), mb: 3, borderRadius: 2 }}>
                        <List dense disablePadding>
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28, 
                                  bgcolor: alpha(selectedProgram.color, 0.2),
                                  color: selectedProgram.color
                                }}
                              >
                                <CalendarMonthIcon fontSize="small" />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" color="text.secondary">
                                  Duration
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body1" fontWeight="medium">
                                  {selectedProgram.duration}
                                </Typography>
                              }
                            />
                          </ListItem>
                          
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28, 
                                  bgcolor: alpha(selectedProgram.color, 0.2),
                                  color: selectedProgram.color
                                }}
                              >
                                <SpeedIcon fontSize="small" />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" color="text.secondary">
                                  Difficulty Level
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body1" fontWeight="medium">
                                  {selectedProgram.level}
                                </Typography>
                              }
                            />
                          </ListItem>
                          
                          <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28, 
                                  bgcolor: alpha(selectedProgram.color, 0.2),
                                  color: selectedProgram.color
                                }}
                              >
                                <AccessTimeFilledIcon fontSize="small" />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" color="text.secondary">
                                  Time Commitment
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body1" fontWeight="medium">
                                  {selectedProgram.commitment}
                                </Typography>
                              }
                            />
                          </ListItem>
                          
                          <ListItem disablePadding>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28, 
                                  bgcolor: alpha(selectedProgram.color, 0.2),
                                  color: selectedProgram.color
                                }}
                              >
                                <HeadsetMicIcon fontSize="small" />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2" color="text.secondary">
                                  Coach Support
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body1" fontWeight="medium">
                                  Voice coaching included
                                </Typography>
                              }
                            />
                          </ListItem>
                        </List>
                      </Paper>
                      
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Expected Results
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <List dense>
                          {selectedProgram.id === 'strength' ? (
                            <>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Increased muscle mass and definition" />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Improved overall strength and power" />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Enhanced metabolic rate and body composition" />
                              </ListItem>
                            </>
                          ) : selectedProgram.id === 'cardio' ? (
                            <>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Improved cardiovascular health and efficiency" />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Enhanced endurance and stamina" />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Reduced resting heart rate and faster recovery" />
                              </ListItem>
                            </>
                          ) : selectedProgram.id === 'flexibility' ? (
                            <>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Increased range of motion and flexibility" />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Reduced muscle tension and improved recovery" />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Better posture and reduced injury risk" />
                              </ListItem>
                            </>
                          ) : (
                            <>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Optimized body composition and metabolism" />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Sustainable fitness habits and nutrition patterns" />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText primary="Improved overall health markers and energy levels" />
                              </ListItem>
                            </>
                          )}
                        </List>
                      </Box>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ 
                          bgcolor: selectedProgram.color,
                          '&:hover': {
                            bgcolor: alpha(selectedProgram.color, 0.8)
                          },
                          py: 1.5
                        }}
                        startIcon={selectedProgram.progress > 0 ? <PlayArrowIcon /> : <AddIcon />}
                        onClick={() => {
                          // In a real implementation, this would enroll the user in the program
                          // For now, just close the dialog and update the UI
                          if (selectedProgram.progress === 0) {
                            // Update the program progress state
                            setProgramCategories(prev => 
                              prev.map(p => 
                                p.id === selectedProgram.id 
                                  ? {...p, progress: 5} 
                                  : p
                              )
                            );
                          }
                          setShowProgramDialog(false);
                        }}
                      >
                        {selectedProgram.progress > 0 ? `Continue Week ${activeWeek}` : 'Start This Program'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
      
      {/* Bluetooth connection dialog */}
      <Dialog 
        open={showBluetoothDialog} 
        onClose={() => setShowBluetoothDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BluetoothIcon sx={{ mr: 1, color: 'primary.main' }} />
            Connect Bluetooth Device
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select a device to connect for voice coaching and audio:
          </Typography>
          
          <List>
            {bluetoothDevices.map((device) => (
              <ListItem 
                key={device.id}
                secondaryAction={
                  device.connected ? (
                    <Button 
                      variant="outlined" 
                      size="small"
                      color="error"
                      onClick={() => disconnectBluetoothDevice(device.id)}
                      startIcon={<BluetoothDisabledIcon />}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => device.device ? device.device.gatt.connect() : connectBluetoothDevice()}
                      startIcon={<BluetoothIcon />}
                    >
                      Connect
                    </Button>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: device.connected ? 'primary.main' : alpha('#000', 0.1) }}>
                    {device.connected ? <BluetoothConnectedIcon /> : <BluetoothIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={device.name} 
                  secondary={
                    <>
                      {typeof device.battery === 'number' ? (
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={device.battery} 
                            sx={{ 
                              width: 60, 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                              display: 'inline-block',
                              mr: 0.5
                            }} 
                          />
                          {device.battery}% battery
                        </Box>
                      ) : (
                        device.type
                      )}
                      
                      {device.connected && (
                        <Chip 
                          size="small" 
                          color="success" 
                          label="Connected" 
                          variant="outlined"
                          icon={<BluetoothConnectedIcon fontSize="small" />}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          {bluetoothSearching && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Searching for Bluetooth devices...
              </Typography>
            </Box>
          )}
          
          {!bluetoothSearching && bluetoothDevices.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <BluetoothSearchingIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
              <Typography variant="body2">
                No devices found. Click "Scan for Devices" to search for Bluetooth audio devices.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<BluetoothSearchingIcon />}
            disabled={bluetoothSearching}
            onClick={scanForBluetoothDevices}
          >
            Scan Again
          </Button>
          <Button onClick={() => setShowBluetoothDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExerciseCoachTab;