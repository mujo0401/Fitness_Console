import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Slider, 
  FormControlLabel, 
  Switch, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  CircularProgress,
  Paper,
  IconButton,
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MicIcon from '@mui/icons-material/Mic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

import { heartRateService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Heart rate zones (same as in HeartTab.js)
const HR_ZONES = [
  { 
    name: 'Rest', 
    min: 0, 
    max: 60, 
    color: '#3f51b5',
    description: 'Resting heart rate - your heart at complete rest'
  },
  { 
    name: 'Fat Burn', 
    min: 60, 
    max: 70, 
    color: '#2196f3',
    description: 'Low intensity exercise, optimal for fat burning'
  },
  { 
    name: 'Cardio', 
    min: 70, 
    max: 85, 
    color: '#009688',
    description: 'Medium-high intensity, improves cardiovascular fitness'
  },
  { 
    name: 'Peak', 
    min: 85, 
    max: 100, 
    color: '#ff9800',
    description: 'High intensity exercise, increases performance and speed'
  },
  { 
    name: 'Extreme', 
    min: 100, 
    max: 220, 
    color: '#f44336',
    description: 'Maximum effort, short-duration exercise'
  }
];

// Get heart rate zone based on percentage of max heart rate
const getHeartRateZone = (value) => {
  if (!value) return null;
  return HR_ZONES.find(zone => value >= zone.min && value < zone.max);
};

// Mock heart rate data for testing
const generateMockHeartRate = (baseRate = 80, variance = 5) => {
  return baseRate + Math.floor(Math.random() * variance * 2) - variance;
};

// Voice feedback messages based on heart rate zones
const zoneFeedbackMessages = {
  'Rest': [
    "Your heart rate is in the rest zone. Consider increasing your intensity to reach your training goals.",
    "Your heart rate is quite low. If you're warming up, that's perfect. Otherwise, try picking up the pace.",
    "Currently in rest zone. Great for recovery, but increase intensity if you're aiming for fat burn or cardio benefits."
  ],
  'Fat Burn': [
    "You're in the fat burn zone. Great pace for endurance and fat metabolism.",
    "Perfect fat burning pace. This moderate intensity is ideal for longer workouts.",
    "Maintaining fat burn zone. Great job keeping a sustainable pace for optimal fat metabolism."
  ],
  'Cardio': [
    "You've reached cardio zone! This is improving your cardiovascular fitness.",
    "Good work! You're in the cardio zone, strengthening your heart and lungs.",
    "Cardio zone achieved. This intensity is great for improving stamina and heart health."
  ],
  'Peak': [
    "You're in the peak zone! This high intensity is building your performance capacity.",
    "Peak performance zone reached! Great for short intervals but not sustainable for long periods.",
    "Peak zone reached! This is building your high-intensity performance. Make sure to recover properly."
  ],
  'Extreme': [
    "Warning! Your heart rate is extremely high. Consider slowing down to reduce intensity.",
    "Heart rate very elevated! If this wasn't intentional, reduce your pace or take a brief rest.",
    "Your heart rate is in the extreme zone. Unless this is a planned sprint, consider easing back."
  ]
};

// Motivational messages for during exercise
const motivationalMessages = [
  "You're doing great! Keep pushing!",
  "Stay strong, you've got this!",
  "Remember why you started. Keep going!",
  "Every step counts. You're making progress!",
  "Breath deep and stay focused!",
  "You're stronger than you think!",
  "This effort is making you better!",
  "Embrace the challenge, it's worth it!",
  "Your future self will thank you for not giving up today!",
  "Feel that strength building with every rep!"
];

// Exercise milestone messages
const milestoneMessages = {
  time: {
    1: "First minute complete! Getting warmed up!",
    5: "Five minutes in! You're getting into the groove now!",
    10: "Ten minutes complete! You're doing amazing!",
    15: "Fifteen minute mark! Keep up the fantastic work!",
    20: "Twenty minutes in! You've reached a significant milestone!",
    30: "Half hour complete! Incredible endurance!",
    45: "Forty-five minutes! Your dedication is impressive!",
    60: "One hour of exercise! What an achievement!"
  },
  heartRate: {
    firstFatBurn: "You've reached fat burning zone! Great pace for endurance training.",
    firstCardio: "Cardio zone achieved! This is strengthening your cardiovascular system.",
    firstPeak: "Peak zone reached! You're really pushing your limits now!",
    stableZone: "Excellent zone stability! You're maintaining perfect intensity."
  }
};

// Speech synthesis setup
const setupSpeech = () => {
  if (!window.speechSynthesis) {
    console.error("Browser doesn't support speech synthesis");
    return null;
  }
  
  return window.speechSynthesis;
};

const ExerciseCoach = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [currentZone, setCurrentZone] = useState(null);
  const [previousZone, setPreviousZone] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [intensityTarget, setIntensityTarget] = useState(70); // Default to cardio zone
  const [exerciseType, setExerciseType] = useState('running');
  const [zoneTime, setZoneTime] = useState({});
  const [bluetoothStatus, setBluetoothStatus] = useState('disconnected');
  const [usingMockData, setUsingMockData] = useState(true);
  const [error, setError] = useState(null);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);
  const [lastMotivationTime, setLastMotivationTime] = useState(0);
  const [reachedMilestones, setReachedMilestones] = useState({});
  const [averageHR, setAverageHR] = useState(0);
  const [hrHistory, setHrHistory] = useState([]);
  const [maxHR, setMaxHR] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  
  // Use refs for interval IDs
  const timerInterval = useRef(null);
  const heartRateInterval = useRef(null);
  const speechSynthesis = useRef(setupSpeech());
  
  // Calculate user's max heart rate (simple estimate)
  const [age, setAge] = useState(30);
  const estimatedMaxHeartRate = 220 - age;
  
  useEffect(() => {
    // Clean up on component unmount
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (heartRateInterval.current) clearInterval(heartRateInterval.current);
      if (speechSynthesis.current?.speaking) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);
  
  // Try to connect to Bluetooth heart rate sensor
  const connectToBluetoothDevice = async () => {
    try {
      setBluetoothStatus('connecting');
      
      // Check if browser supports Web Bluetooth API
      if (!navigator.bluetooth) {
        throw new Error("Bluetooth not supported in this browser");
      }
      
      console.log("Requesting Bluetooth Device...");
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Polar' },
          { namePrefix: 'Garmin' }
        ],
        optionalServices: ['heart_rate']
      });
      
      console.log('Connecting to GATT Server...');
      const server = await device.gatt.connect();
      
      console.log('Getting Heart Rate Service...');
      const service = await server.getPrimaryService('heart_rate');
      
      console.log('Getting Heart Rate Measurement Characteristic...');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      console.log('Starting heart rate notifications...');
      await characteristic.startNotifications();
      
      // Listen for heart rate data
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const heartRate = value.getUint8(1);
        processHeartRateData(heartRate);
      });
      
      setBluetoothStatus('connected');
      setUsingMockData(false);
      setError(null);
      
      // Return the device for cleanup
      return { device, characteristic };
    } catch (error) {
      console.error('Bluetooth Error:', error);
      setBluetoothStatus('failed');
      setError(`Failed to connect: ${error.message}. Using simulated data instead.`);
      setUsingMockData(true);
      return null;
    }
  };
  
  // Process incoming heart rate data
  const processHeartRateData = (rate) => {
    setHeartRate(rate);
    
    // Add to history for stats
    const newHistory = [...hrHistory, { time: elapsedTime, value: rate }];
    setHrHistory(newHistory);
    
    // Update average
    const total = newHistory.reduce((sum, item) => sum + item.value, 0);
    setAverageHR(Math.round(total / newHistory.length));
    
    // Update max HR
    if (rate > maxHR) {
      setMaxHR(rate);
    }
    
    // Calculate zone based on percentage of max HR
    const percentage = Math.round((rate / estimatedMaxHeartRate) * 100);
    const newZone = getHeartRateZone(percentage);
    
    // Estimate calories burned (very rough formula)
    // Based on heartrate, weight, gender, time
    const weight = 70; // kg, would normally come from user profile
    const gender = 'male'; // would normally come from user profile
    const genderFactor = gender === 'male' ? 1 : 0.85;
    const caloriesPerMinute = ((-55.0969 + (0.6309 * rate) + (0.1988 * weight) + (0.2017 * age)) / 4.184) * 60 / 4.184 * genderFactor;
    const newCalories = caloriesBurned + (caloriesPerMinute / 60); // per second
    setCaloriesBurned(newCalories);
    
    // Track zone changes for feedback
    if (newZone && newZone.name !== currentZone?.name) {
      setPreviousZone(currentZone);
      setCurrentZone(newZone);
      
      // Update time spent in zones
      const now = Date.now();
      if (currentZone) {
        setZoneTime(prev => ({
          ...prev,
          [currentZone.name]: (prev[currentZone.name] || 0) + (now - (prev.lastUpdate || now)) / 1000
        }));
      }
      
      // Update last update time
      setZoneTime(prev => ({ ...prev, lastUpdate: now }));
      
      // Provide feedback on zone change
      if (feedbackEnabled) {
        provideZoneFeedback(newZone, previousZone);
      }
    }
  };
  
  // Start exercise session
  const startSession = async () => {
    setIsSessionActive(true);
    setIsPaused(false);
    setElapsedTime(0);
    setZoneTime({});
    setHrHistory([]);
    setAverageHR(0);
    setMaxHR(0);
    setCaloriesBurned(0);
    setReachedMilestones({});
    
    // Start timer
    timerInterval.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        checkTimeMilestones(newTime);
        return newTime;
      });
    }, 1000);
    
    // Try to connect to Bluetooth
    const bluetoothDevice = await connectToBluetoothDevice();
    
    // If Bluetooth failed, use mock data
    if (!bluetoothDevice && usingMockData) {
      // Generate mock heart rate data
      heartRateInterval.current = setInterval(() => {
        // Make mock heart rate gradually increase and then plateau
        const timeModifier = Math.min(1, elapsedTime / 300); // Ramp up over 5 minutes
        const baseRate = 60 + (timeModifier * 50); // Base rate between 60-110
        const variance = 5;
        const mockRate = generateMockHeartRate(baseRate, variance);
        
        processHeartRateData(mockRate);
      }, 1000);
    }
    
    // Initial voice feedback
    speakFeedback("Exercise session started. Let's get moving!");
  };
  
  // Pause or resume exercise session
  const togglePause = () => {
    if (isPaused) {
      // Resume session
      setIsPaused(false);
      
      // Resume timer
      timerInterval.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      // Resume mock heart rate updates if using mock data
      if (usingMockData) {
        heartRateInterval.current = setInterval(() => {
          const timeModifier = Math.min(1, elapsedTime / 300);
          const baseRate = 60 + (timeModifier * 50);
          const mockRate = generateMockHeartRate(baseRate, 5);
          processHeartRateData(mockRate);
        }, 1000);
      }
      
      // Feedback
      speakFeedback("Session resumed. Keep up the good work!");
    } else {
      // Pause session
      setIsPaused(true);
      
      // Pause timers
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (heartRateInterval.current) clearInterval(heartRateInterval.current);
      
      // Feedback
      speakFeedback("Session paused. Take a short break and resume when ready.");
    }
  };
  
  // End exercise session
  const endSession = () => {
    setIsSessionActive(false);
    setIsPaused(false);
    
    // Stop all timers
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (heartRateInterval.current) clearInterval(heartRateInterval.current);
    
    // Final feedback
    const sessionMinutes = Math.floor(elapsedTime / 60);
    speakFeedback(`Session complete! You exercised for ${sessionMinutes} minutes, with an average heart rate of ${averageHR} beats per minute. Great job!`);
    
    // Disconnect Bluetooth if connected
    if (bluetoothStatus === 'connected') {
      // Disconnect logic would go here
      setBluetoothStatus('disconnected');
    }
  };
  
  // Provide feedback based on heart rate zone
  const provideZoneFeedback = (newZone, oldZone) => {
    if (!newZone) return;
    
    // Only provide feedback if enough time has passed since last feedback
    const now = Date.now();
    if (now - lastFeedbackTime < 15000) return; // Minimum 15 seconds between feedback
    
    // Get appropriate feedback message
    const messages = zoneFeedbackMessages[newZone.name];
    if (!messages || messages.length === 0) return;
    
    // Pick a random message from the array
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Provide audio feedback
    speakFeedback(message);
    
    // Update last feedback time
    setLastFeedbackTime(now);
    
    // Check for zone-specific milestones
    if (oldZone?.name !== 'Fat Burn' && newZone.name === 'Fat Burn' && !reachedMilestones.firstFatBurn) {
      setReachedMilestones(prev => ({ ...prev, firstFatBurn: true }));
      setTimeout(() => speakFeedback(milestoneMessages.heartRate.firstFatBurn), 4000);
    }
    
    if (oldZone?.name !== 'Cardio' && newZone.name === 'Cardio' && !reachedMilestones.firstCardio) {
      setReachedMilestones(prev => ({ ...prev, firstCardio: true }));
      setTimeout(() => speakFeedback(milestoneMessages.heartRate.firstCardio), 4000);
    }
    
    if (oldZone?.name !== 'Peak' && newZone.name === 'Peak' && !reachedMilestones.firstPeak) {
      setReachedMilestones(prev => ({ ...prev, firstPeak: true }));
      setTimeout(() => speakFeedback(milestoneMessages.heartRate.firstPeak), 4000);
    }
  };
  
  // Check if we've hit any time-based milestones
  const checkTimeMilestones = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    
    // Check if we've reached any minute milestones
    if (seconds % 60 === 0 && milestoneMessages.time[minutes] && !reachedMilestones[`time_${minutes}`]) {
      setReachedMilestones(prev => ({ ...prev, [`time_${minutes}`]: true }));
      speakFeedback(milestoneMessages.time[minutes]);
      return;
    }
    
    // Provide random motivational messages
    if (seconds % 180 === 0 && Date.now() - lastMotivationTime > 120000) { // Every 3 minutes, but at least 2 min since last
      const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setTimeout(() => speakFeedback(message), 1500);
      setLastMotivationTime(Date.now());
    }
  };
  
  // Text-to-speech function
  const speakFeedback = (text) => {
    if (!voiceEnabled || !text) return;
    
    if (speechSynthesis.current) {
      // Cancel any ongoing speech
      if (speechSynthesis.current.speaking) {
        speechSynthesis.current.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Get available voices and set a good one if available
      const voices = speechSynthesis.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.current.speak(utterance);
    }
  };
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate percentages of time spent in each zone
  const calculateZonePercentages = () => {
    const totalTime = Object.keys(zoneTime)
      .filter(key => key !== 'lastUpdate')
      .reduce((sum, key) => sum + (zoneTime[key] || 0), 0);
    
    if (totalTime === 0) return {};
    
    const percentages = {};
    Object.keys(zoneTime).forEach(key => {
      if (key !== 'lastUpdate') {
        percentages[key] = Math.round((zoneTime[key] / totalTime) * 100);
      }
    });
    
    return percentages;
  };
  
  const zonePercentages = calculateZonePercentages();
  
  return (
    <Box sx={{ p: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ 
          borderRadius: 4, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          mb: 3
        }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #2196f3, #009688)', 
            py: 2.5, 
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              <DirectionsRunIcon sx={{ filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))' }} /> 
              Real-Time Exercise Coach
            </Typography>
            
            <Box>
              <IconButton 
                sx={{ color: 'white', mr: 1 }}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? "Voice feedback enabled" : "Voice feedback disabled"}
              >
                {voiceEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
            </Box>
          </Box>
          
          <CardContent>
            {/* Status messages for connection */}
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {bluetoothStatus === 'connecting' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Connecting to heart rate monitor...
              </Alert>
            )}
            
            {/* Heart rate and workout stats display */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
              {/* Heart rate card */}
              <Card 
                elevation={3} 
                sx={{ 
                  flex: 2, 
                  borderRadius: 2, 
                  background: currentZone ? `linear-gradient(135deg, ${currentZone.color}40, ${currentZone.color}10)` : 'white',
                  border: currentZone ? `1px solid ${currentZone.color}` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteIcon color="error" />
                    Heart Rate
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                    <Typography variant="h2" fontWeight="bold">
                      {heartRate}
                    </Typography>
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      BPM
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {currentZone ? `${currentZone.name} zone: ${currentZone.description}` : 'Waiting for heart rate data...'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip 
                      label={`Max: ${maxHR} BPM`} 
                      size="small" 
                      sx={{ bgcolor: theme.palette.error.light, color: 'white' }}
                    />
                    <Chip 
                      label={`Avg: ${averageHR} BPM`} 
                      size="small" 
                      sx={{ bgcolor: theme.palette.primary.light, color: 'white' }}
                    />
                  </Box>
                </CardContent>
              </Card>
              
              {/* Workout stats card */}
              <Card elevation={3} sx={{ flex: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsRunIcon color="primary" />
                    Workout Stats
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimerIcon fontSize="small" color="primary" />
                        {formatTime(elapsedTime)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Calories
                      </Typography>
                      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalFireDepartmentIcon fontSize="small" color="error" />
                        {Math.round(caloriesBurned)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Target Zone
                      </Typography>
                      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedIcon fontSize="small" color="primary" />
                        {intensityTarget}% MHR
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Zone distribution */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Zone Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {HR_ZONES.map(zone => (
                        <Chip
                          key={zone.name}
                          label={`${zone.name}: ${zonePercentages[zone.name] || 0}%`}
                          size="small"
                          sx={{ 
                            bgcolor: `${zone.color}20`, 
                            color: zone.color,
                            border: `1px solid ${zone.color}40`,
                            fontWeight: currentZone?.name === zone.name ? 'bold' : 'normal',
                            transform: currentZone?.name === zone.name ? 'scale(1.05)' : 'none'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            {/* Controls */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Workout Controls
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                {!isSessionActive ? (
                  <Button 
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={startSession}
                    disabled={!isAuthenticated}
                  >
                    Start Workout
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant={isPaused ? "outlined" : "contained"}
                      color={isPaused ? "primary" : "warning"}
                      startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                      onClick={togglePause}
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                    
                    <Button 
                      variant="outlined"
                      color="error"
                      startIcon={<StopIcon />}
                      onClick={endSession}
                    >
                      End Workout
                    </Button>
                  </>
                )}
                
                {bluetoothStatus === 'disconnected' && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<MicIcon />}
                    onClick={connectToBluetoothDevice}
                  >
                    Connect HR Monitor
                  </Button>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Workout Settings
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'flex-start' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Exercise Type</InputLabel>
                  <Select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value)}
                    label="Exercise Type"
                    disabled={isSessionActive}
                  >
                    <MenuItem value="running">Running</MenuItem>
                    <MenuItem value="cycling">Cycling</MenuItem>
                    <MenuItem value="hiit">HIIT Training</MenuItem>
                    <MenuItem value="strength">Strength Training</MenuItem>
                    <MenuItem value="cardio">Cardio Workout</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ minWidth: 250 }}>
                  <Typography variant="body2" gutterBottom>
                    Target Intensity: {intensityTarget}% of Max HR
                  </Typography>
                  <Slider
                    value={intensityTarget}
                    onChange={(e, value) => setIntensityTarget(value)}
                    min={50}
                    max={95}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                    disabled={isSessionActive}
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={feedbackEnabled} 
                      onChange={(e) => setFeedbackEnabled(e.target.checked)}
                    />
                  }
                  label="Real-time Feedback"
                />
              </Box>
            </Paper>
            
            {/* Instructions */}
            {!isSessionActive && (
              <Paper sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  How to Use the Real-Time Exercise Coach:
                </Typography>
                <Typography variant="body2" paragraph>
                  1. Set your target intensity and exercise type.
                </Typography>
                <Typography variant="body2" paragraph>
                  2. Connect a Bluetooth heart rate monitor (or use simulated data).
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Start your workout and receive real-time audio coaching through your Bluetooth headphones.
                </Typography>
                <Typography variant="body2">
                  4. The coach will help you maintain the right intensity, warn you if your heart rate gets too high, and provide motivational cues.
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ExerciseCoach;