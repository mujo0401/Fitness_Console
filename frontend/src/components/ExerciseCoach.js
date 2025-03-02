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
import InfoIcon from '@mui/icons-material/Info';

import { heartRateService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWorkoutPlan } from '../context/WorkoutPlanContext';

// Heart rate zones (same as in HeartTab.js)
const HR_ZONES = [
  { 
    name: 'Rest', 
    min: 0, 
    max: 60, 
    color: '#3f51b5',
    description: 'Resting heart rate - your heart at complete rest',
    benefits: 'Recovery and relaxation',
    calorieBurn: 'Low',
    fatBurn: 'Low',
    endurance: 'Minimal',
    performance: 'Maintenance',
    sustainableFor: 'Hours to all day'
  },
  { 
    name: 'Fat Burn', 
    min: 60, 
    max: 70, 
    color: '#2196f3',
    description: 'Low intensity exercise, optimal for fat burning',
    benefits: 'Improved fat metabolism, base endurance building',
    calorieBurn: 'Moderate',
    fatBurn: 'Optimal',
    endurance: 'Improving',
    performance: 'Building base',
    sustainableFor: '1-3 hours'
  },
  { 
    name: 'Cardio', 
    min: 70, 
    max: 85, 
    color: '#009688',
    description: 'Medium-high intensity, improves cardiovascular fitness',
    benefits: 'Improved heart and lung capacity, endurance',
    calorieBurn: 'High',
    fatBurn: 'Moderate',
    endurance: 'Optimal training',
    performance: 'Building',
    sustainableFor: '30-60 minutes'
  },
  { 
    name: 'Peak', 
    min: 85, 
    max: 100, 
    color: '#ff9800',
    description: 'High intensity exercise, increases performance and speed',
    benefits: 'Improved VO2 max, lactate threshold, and speed',
    calorieBurn: 'Very high',
    fatBurn: 'Low',
    endurance: 'High impact',
    performance: 'Optimal training',
    sustainableFor: '5-20 minutes'
  },
  { 
    name: 'Extreme', 
    min: 100, 
    max: 220, 
    color: '#f44336',
    description: 'Maximum effort, short-duration exercise',
    benefits: 'Anaerobic capacity, power, sprint performance',
    calorieBurn: 'Extremely high',
    fatBurn: 'Minimal',
    endurance: 'Sprint capacity',
    performance: 'Peak/specialized training',
    sustainableFor: 'Seconds to 2-3 minutes'
  }
];

// Workout types with specific heart rate guidance
const WORKOUT_TYPES = {
  running: {
    name: 'Running',
    icon: DirectionsRunIcon,
    recommendedZones: ['Fat Burn', 'Cardio', 'Peak'],
    intervalStructure: {
      warmup: { zone: 'Fat Burn', duration: 5 }, // minutes
      main: { zone: 'Cardio', duration: 20 },
      intervals: { high: 'Peak', low: 'Fat Burn', highDuration: 1, lowDuration: 2, sets: 5 },
      cooldown: { zone: 'Rest', duration: 5 }
    },
    tips: [
      "Land midfoot, not on your heel or toe",
      "Keep your head up and back straight",
      "Swing your arms forward and back, not across your body",
      "Take shorter, quicker steps rather than long strides"
    ]
  },
  cycling: {
    name: 'Cycling',
    icon: DirectionsRunIcon,
    recommendedZones: ['Fat Burn', 'Cardio'],
    intervalStructure: {
      warmup: { zone: 'Fat Burn', duration: 5 },
      main: { zone: 'Cardio', duration: 25 },
      intervals: { high: 'Peak', low: 'Fat Burn', highDuration: 2, lowDuration: 3, sets: 4 },
      cooldown: { zone: 'Rest', duration: 5 }
    },
    tips: [
      "Maintain a cadence of 80-90 RPM for efficiency",
      "Keep your shoulders relaxed and elbows slightly bent",
      "Engage your core for stability",
      "Position your knee over the ball of your foot at the bottom of the pedal stroke"
    ]
  },
  hiit: {
    name: 'HIIT Training',
    icon: DirectionsRunIcon,
    recommendedZones: ['Cardio', 'Peak'],
    intervalStructure: {
      warmup: { zone: 'Fat Burn', duration: 5 },
      intervals: { high: 'Peak', low: 'Fat Burn', highDuration: 0.5, lowDuration: 1.5, sets: 10 },
      cooldown: { zone: 'Rest', duration: 5 }
    },
    tips: [
      "Push to maximum effort during high intervals",
      "Focus on proper form even when fatigued",
      "Breathe rhythmically through intense intervals",
      "Allow full recovery during rest periods"
    ]
  },
  strength: {
    name: 'Strength Training',
    icon: DirectionsRunIcon,
    recommendedZones: ['Fat Burn', 'Cardio'],
    intervalStructure: {
      warmup: { zone: 'Fat Burn', duration: 5 },
      main: { zone: 'Cardio', duration: 30 },
      cooldown: { zone: 'Rest', duration: 5 }
    },
    tips: [
      "Maintain a consistent breathing pattern, exhaling during exertion",
      "Focus on controlled movements, not speed",
      "Ensure proper form before increasing weight",
      "Allow specific muscle groups to recover between sets"
    ]
  },
  cardio: {
    name: 'Cardio Workout',
    icon: DirectionsRunIcon,
    recommendedZones: ['Cardio'],
    intervalStructure: {
      warmup: { zone: 'Fat Burn', duration: 5 },
      main: { zone: 'Cardio', duration: 30 },
      cooldown: { zone: 'Fat Burn', duration: 5 }
    },
    tips: [
      "Maintain steady, controlled breathing throughout",
      "Find a sustainable rhythm you can maintain",
      "Stay hydrated throughout your session",
      "Gradually increase intensity as you build endurance"
    ]
  }
};

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
  const { todaysWorkout, predefinedPlans, selectedPlan, selectPredefinedPlan } = useWorkoutPlan();
  
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
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  
  // Advanced workout features
  const [workoutPhase, setWorkoutPhase] = useState('warmup'); // warmup, main, interval, cooldown
  const [intervalMode, setIntervalMode] = useState(false);
  const [currentIntervalNumber, setCurrentIntervalNumber] = useState(0);
  const [intervalTimeRemaining, setIntervalTimeRemaining] = useState(0);
  const [guidedWorkoutEnabled, setGuidedWorkoutEnabled] = useState(true);
  
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
    setWorkoutPhase('warmup');
    setCurrentIntervalNumber(0);
    
    // Initialize workout - first check if today's workout is available
    if (guidedWorkoutEnabled && todaysWorkout) {
      // Use today's workout from the fitness plan
      const workout = todaysWorkout;
      
      // Update exercise type to match workout type
      setExerciseType(workout.type);
      
      // Set heart rate target based on workout
      if (workout.heartRateTarget) {
        setIntensityTarget(workout.heartRateTarget);
      }
      
      // Announce the workout plan
      if (feedbackEnabled) {
        setTimeout(() => {
          speakFeedback(`Starting today's ${workout.name} workout. Today is ${workout.day}.`);
        }, 2000);
        
        // Announce workout structure
        setTimeout(() => {
          if (workout.structured?.warmup) {
            speakFeedback(`We'll begin with a ${workout.structured.warmup.duration} minute warm up.`);
          }
        }, 5000);
      }
      
      // If workout has intervals, announce them
      if (workout.structured?.intervals) {
        const { intervals } = workout.structured;
        setTimeout(() => {
          speakFeedback(`This workout includes ${intervals.sets} intervals, alternating between ${intervals.highDuration} minutes at ${intervals.high} intensity and ${intervals.lowDuration} minutes of ${intervals.low} intensity recovery.`);
        }, 10000);
      }
      
      // Announce first exercise
      if (workout.exercises && workout.exercises.length > 0 && feedbackEnabled) {
        setTimeout(() => {
          const exercise = workout.exercises[0];
          const description = exercise.sets && exercise.reps
            ? `${exercise.sets} sets of ${exercise.reps} reps`
            : exercise.duration
              ? `for ${exercise.duration}`
              : '';
              
          speakFeedback(`Your first exercise is ${exercise.name} ${description}`);
        }, 15000);
      }
    }
    // Fall back to default workout types
    else if (guidedWorkoutEnabled && WORKOUT_TYPES[exerciseType]) {
      const workoutPlan = WORKOUT_TYPES[exerciseType];
      
      // Announce workout plan
      if (feedbackEnabled) {
        setTimeout(() => {
          speakFeedback(`Starting a ${workoutPlan.name} workout. We'll begin with a ${workoutPlan.intervalStructure.warmup.duration} minute warm up.`);
        }, 3000);
      }
      
      // If workout has intervals, announce them
      if (workoutPlan.intervalStructure.intervals) {
        const { intervals } = workoutPlan.intervalStructure;
        setTimeout(() => {
          speakFeedback(`This workout includes ${intervals.sets} intervals, alternating between ${intervals.highDuration} minutes at ${intervals.high} intensity and ${intervals.lowDuration} minutes of ${intervals.low} intensity recovery.`);
        }, 10000);
      }
    }
    
    // Start timer
    timerInterval.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;
        checkTimeMilestones(newTime);
        
        // Update workout phase based on elapsed time if guided workout is enabled
        if (guidedWorkoutEnabled && WORKOUT_TYPES[exerciseType]) {
          updateWorkoutPhase(newTime);
        }
        
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
        
        // For guided workouts, adjust the heart rate based on current phase
        let baseRate = 60 + (timeModifier * 50); // Default: Base rate between 60-110
        
        if (guidedWorkoutEnabled && WORKOUT_TYPES[exerciseType]) {
          const workoutPlan = WORKOUT_TYPES[exerciseType];
          
          // Adjust heart rate based on workout phase
          switch (workoutPhase) {
            case 'warmup':
              // Gradually increasing heart rate during warmup
              baseRate = 70 + (timeModifier * 20);
              break;
            case 'main':
              // Steady cardio heart rate during main phase
              baseRate = 100 + (Math.random() * 10);
              break;
            case 'interval':
              // Oscillating heart rate during intervals
              const intervalInfo = workoutPlan.intervalStructure.intervals;
              const totalIntervalTime = (intervalInfo.highDuration + intervalInfo.lowDuration) * 60;
              const currentIntervalTime = intervalTimeRemaining % totalIntervalTime;
              const isHighIntensity = currentIntervalTime < intervalInfo.highDuration * 60;
              
              if (isHighIntensity) {
                // High intensity part of interval
                baseRate = 140 + (Math.random() * 20);
              } else {
                // Recovery part of interval
                baseRate = 90 + (Math.random() * 10);
              }
              break;
            case 'cooldown':
              // Gradually decreasing heart rate during cooldown
              baseRate = 100 - (timeModifier * 30);
              break;
          }
        }
        
        const variance = 5;
        const mockRate = generateMockHeartRate(baseRate, variance);
        
        processHeartRateData(mockRate);
      }, 1000);
    }
    
    // Initial voice feedback
    speakFeedback("Exercise session started. Let's get moving!");
  };
  
  // Update workout phase based on elapsed time
  const updateWorkoutPhase = (elapsedSeconds) => {
    let plan, elapsedMinutes;
    
    // First check if we're using a workout from today's plan
    if (todaysWorkout && todaysWorkout.structured) {
      plan = todaysWorkout.structured;
      elapsedMinutes = elapsedSeconds / 60;
    }
    // Fallback to the default workout types
    else if (WORKOUT_TYPES[exerciseType]) {
      plan = WORKOUT_TYPES[exerciseType].intervalStructure;
      elapsedMinutes = elapsedSeconds / 60;
    }
    else {
      // No valid plan found
      return;
    }
    
    // Calculate phase transition times
    const warmupEnd = plan.warmup ? plan.warmup.duration : 0;
    const mainEnd = plan.main ? warmupEnd + plan.main.duration : warmupEnd;
    const intervalEnd = plan.intervals ? mainEnd + (plan.intervals.sets * (plan.intervals.highDuration + plan.intervals.lowDuration)) : mainEnd;
    
    // Update workout phase
    let newPhase = workoutPhase;
    
    if (elapsedMinutes < warmupEnd) {
      newPhase = 'warmup';
    } else if (!plan.intervals && plan.main && elapsedMinutes < mainEnd) {
      newPhase = 'main';
    } else if (plan.intervals && elapsedMinutes < intervalEnd) {
      newPhase = 'interval';
      
      // Calculate current interval and time remaining
      const intervalElapsedMinutes = elapsedMinutes - warmupEnd;
      const intervalDuration = plan.intervals.highDuration + plan.intervals.lowDuration;
      const currentInterval = Math.floor(intervalElapsedMinutes / intervalDuration) + 1;
      const timeInCurrentInterval = (intervalElapsedMinutes % intervalDuration) * 60;
      const remainingInInterval = (intervalDuration * 60) - timeInCurrentInterval;
      
      // Update interval state if changed
      if (currentInterval !== currentIntervalNumber) {
        setCurrentIntervalNumber(currentInterval);
        
        // Announce new interval
        if (feedbackEnabled && currentInterval <= plan.intervals.sets) {
          speakFeedback(`Starting interval ${currentInterval} of ${plan.intervals.sets}.`);
        }
      }
      
      // Update interval time remaining
      setIntervalTimeRemaining(remainingInInterval);
      
      // Check if we're in high or low part of the interval
      const isHighIntensity = timeInCurrentInterval < (plan.intervals.highDuration * 60);
      
      // Provide audio cues for interval transitions
      if (feedbackEnabled && timeInCurrentInterval < 2 && currentInterval <= plan.intervals.sets) {
        if (isHighIntensity) {
          speakFeedback(`Push hard for ${plan.intervals.highDuration} minutes!`);
        } else {
          speakFeedback(`Recovery for ${plan.intervals.lowDuration} minutes.`);
        }
      }
    } else {
      newPhase = 'cooldown';
    }
    
    // If phase changed, update state and provide feedback
    if (newPhase !== workoutPhase) {
      setWorkoutPhase(newPhase);
      
      // Provide audio feedback on phase change
      if (feedbackEnabled) {
        switch (newPhase) {
          case 'main':
            speakFeedback(`Warm up complete. Moving into the main workout phase.`);
            break;
          case 'interval':
            speakFeedback(`Beginning interval training. Get ready for your first high intensity interval!`);
            break;
          case 'cooldown':
            if (plan.cooldown && plan.cooldown.duration) {
              speakFeedback(`Great work! Starting your ${plan.cooldown.duration} minute cooldown.`);
            } else {
              speakFeedback(`Great work! Starting your cooldown.`);
            }
            break;
        }
      }
    }
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
  
  // Advanced heart rate analysis
  const analyzeHeartRateRecovery = () => {
    if (hrHistory.length < 60) return null; // Need at least 60 seconds of data
    
    // Look at the last 60 seconds
    const recentData = hrHistory.slice(-60);
    const maxInPeriod = Math.max(...recentData.map(item => item.value));
    const minInPeriod = Math.min(...recentData.map(item => item.value));
    const recovery = maxInPeriod - minInPeriod;
    
    // Check if there's significant recovery after a peak
    const peakIndex = recentData.findIndex(item => item.value === maxInPeriod);
    if (peakIndex > 10 && peakIndex < recentData.length - 10) {
      const postPeakMin = Math.min(...recentData.slice(peakIndex).map(item => item.value));
      const dropAfterPeak = maxInPeriod - postPeakMin;
      
      if (dropAfterPeak > 15) {
        return {
          recovery: dropAfterPeak,
          message: `Good recovery! Your heart rate dropped by ${dropAfterPeak} BPM after that intense effort.`
        };
      }
    }
    
    return null;
  };
  
  // Analyze training effect based on heart rate data
  const analyzeTrainingEffect = () => {
    if (hrHistory.length < 120) return null; // Need at least 2 minutes of data
    
    // Calculate time spent in each zone
    let cardioMinutes = 0;
    let peakMinutes = 0;
    
    // Count seconds in each zone
    hrHistory.forEach(item => {
      const hrPercent = (item.value / estimatedMaxHeartRate) * 100;
      if (hrPercent >= 70 && hrPercent < 85) cardioMinutes += 1/60;
      if (hrPercent >= 85) peakMinutes += 1/60;
    });
    
    // Determine training effect
    if (peakMinutes > 5) {
      return "This workout is providing excellent high-intensity interval training effect, improving your VO2 max and anaerobic capacity.";
    } else if (cardioMinutes > 10) {
      return "You're getting a good cardio workout, improving your aerobic base and endurance.";
    } else if (elapsedTime > 300) { // 5+ minutes
      return "You're maintaining a steady pace that's building basic endurance.";
    }
    
    return null;
  };
  
  // Check hydration needs based on duration and intensity
  const checkHydration = () => {
    // Every 10 minutes, provide hydration reminder
    if (elapsedTime % 600 === 0 && elapsedTime > 0) {
      return "Remember to stay hydrated. Consider taking a quick water break.";
    }
    
    // More frequent reminders during high intensity
    if (currentZone?.name === 'Peak' && elapsedTime % 300 === 0 && elapsedTime > 0) {
      return "You're working at high intensity. Make sure to hydrate at your next opportunity.";
    }
    
    return null;
  };
  
  // Provide feedback based on heart rate zone
  const provideZoneFeedback = (newZone, oldZone) => {
    if (!newZone) return;
    
    // Only provide feedback if enough time has passed since last feedback
    const now = Date.now();
    if (now - lastFeedbackTime < 45000) return; // Minimum 45 seconds between feedback (increased from 15s)
    
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
    
    // Provide advanced feedback periodically
    if (elapsedTime > 300 && elapsedTime % 300 === 0) { // Every 5 minutes after first 5 minutes
      const trainingEffect = analyzeTrainingEffect();
      if (trainingEffect) {
        setTimeout(() => speakFeedback(trainingEffect), 6000);
      }
    }
    
    // Check recovery after intense effort
    const recoveryData = analyzeHeartRateRecovery();
    if (recoveryData && recoveryData.recovery > 15) {
      setTimeout(() => speakFeedback(recoveryData.message), 8000);
    }
    
    // Hydration reminders
    const hydrationMsg = checkHydration();
    if (hydrationMsg) {
      setTimeout(() => speakFeedback(hydrationMsg), 10000);
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
    
    // Provide random motivational messages - less frequently now
    if (seconds % 420 === 0 && Date.now() - lastMotivationTime > 240000) { // Every 7 minutes, but at least 4 min since last
      const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setTimeout(() => speakFeedback(message), 1500);
      setLastMotivationTime(Date.now());
    }
    
    // Pace guidance based on target zone vs current zone
    if (seconds % 240 === 0 && seconds > 120) { // Every 4 minutes after first 2 mins
      const hrPercent = (heartRate / estimatedMaxHeartRate) * 100;
      const targetZoneIndex = HR_ZONES.findIndex(zone => zone.min <= intensityTarget && zone.max > intensityTarget);
      const currentZoneIndex = HR_ZONES.findIndex(zone => zone.min <= hrPercent && zone.max > hrPercent);
      
      if (targetZoneIndex > currentZoneIndex) {
        speakFeedback("Try increasing your pace to reach your target intensity zone.");
      } else if (targetZoneIndex < currentZoneIndex && currentZoneIndex >= 3) { // Only suggest slowing if in Peak/Extreme
        speakFeedback("Consider slowing down slightly to maintain a more sustainable pace.");
      } else if (targetZoneIndex === currentZoneIndex && seconds > 300) {
        // If maintaining target zone for 5+ minutes, give positive feedback occasionally
        if (seconds % 360 === 0) { // Every 6 minutes
          speakFeedback("Excellent pacing! You're maintaining your target intensity zone perfectly.");
        }
      }
    }
  };
  
  // Feedback queue to prevent choppy audio
  const speechQueue = useRef([]);
  const isSpeaking = useRef(false);
  
  // Process the speech queue
  const processSpeechQueue = () => {
    if (speechQueue.current.length === 0 || isSpeaking.current || !speechSynthesis.current) {
      return;
    }
    
    // Get the next message in the queue
    const nextMessage = speechQueue.current.shift();
    isSpeaking.current = true;
    
    const utterance = new SpeechSynthesisUtterance(nextMessage);
    utterance.volume = 1.0;
    utterance.rate = 0.95; // Slightly slower for better clarity
    utterance.pitch = 1.0;
    utterance.lang = 'en-US'; // Ensure English language
    
    // Get available voices and set a good one if available
    const voices = speechSynthesis.current.getVoices();
    // Prioritize US English natural voices
    const preferredVoice = voices.find(voice => 
      (voice.name.includes('Google US English') || 
       voice.name.includes('Samantha') ||
       voice.name.includes('Natural') ||
       (voice.name.includes('Female') && voice.lang.includes('en-US')))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // When speech ends, process the next item in the queue
    utterance.onend = () => {
      isSpeaking.current = false;
      setTimeout(() => {
        processSpeechQueue();
      }, 500); // Small pause between messages for natural speech rhythm
    };
    
    speechSynthesis.current.speak(utterance);
  };
  
  // Text-to-speech function - adds to queue
  const speakFeedback = (text) => {
    if (!voiceEnabled || !text) return;
    
    // Add message to queue
    speechQueue.current.push(text);
    
    // Start processing if not already speaking
    if (!isSpeaking.current) {
      processSpeechQueue();
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
              
              {/* Interval workout timer - only show when in an active session */}
              {isSessionActive && WORKOUT_TYPES[exerciseType]?.intervalStructure && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Workout Plan: {WORKOUT_TYPES[exerciseType].name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {/* Workout phases visualization */}
                    <Chip 
                      label="Warm Up" 
                      size="small"
                      sx={{ 
                        bgcolor: '#2196f340',
                        fontWeight: workoutPhase === 'warmup' ? 'bold' : 'normal',
                        border: workoutPhase === 'warmup' ? '2px solid #2196f3' : 'none'
                      }}
                    />
                    <Chip 
                      label="Main" 
                      size="small"
                      sx={{ 
                        bgcolor: '#00968840',
                        fontWeight: workoutPhase === 'main' ? 'bold' : 'normal',
                        border: workoutPhase === 'main' ? '2px solid #009688' : 'none'
                      }}
                    />
                    <Chip 
                      label="Intervals" 
                      size="small"
                      sx={{ 
                        bgcolor: '#ff980040',
                        fontWeight: workoutPhase === 'interval' ? 'bold' : 'normal',
                        border: workoutPhase === 'interval' ? '2px solid #ff9800' : 'none'
                      }}
                    />
                    <Chip 
                      label="Cool Down" 
                      size="small"
                      sx={{ 
                        bgcolor: '#3f51b540',
                        fontWeight: workoutPhase === 'cooldown' ? 'bold' : 'normal',
                        border: workoutPhase === 'cooldown' ? '2px solid #3f51b5' : 'none'
                      }}
                    />
                  </Box>
                  
                  {/* Coach advice based on workout type */}
                  {WORKOUT_TYPES[exerciseType].tips && WORKOUT_TYPES[exerciseType].tips.length > 0 && (
                    <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <InfoIcon fontSize="inherit" /> Coach Tip: {WORKOUT_TYPES[exerciseType].tips[Math.floor(Math.random() * WORKOUT_TYPES[exerciseType].tips.length)]}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
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
                
                <Box>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={feedbackEnabled} 
                        onChange={(e) => setFeedbackEnabled(e.target.checked)}
                      />
                    }
                    label="Real-time Feedback"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={guidedWorkoutEnabled}
                        onChange={(e) => setGuidedWorkoutEnabled(e.target.checked)}
                        disabled={isSessionActive}
                      />
                    }
                    label="Guided Workout"
                  />
                </Box>
              </Box>
            </Paper>
            
            {/* Today's Workout Plan Display */}
            {!isSessionActive && todaysWorkout && (
              <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.light, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                    <DirectionsRunIcon /> Today's Workout: {todaysWorkout.name}
                  </Typography>
                  <Chip 
                    label={todaysWorkout.day} 
                    color="primary" 
                    variant="outlined" 
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Workout Type: <b>{todaysWorkout.type.charAt(0).toUpperCase() + todaysWorkout.type.slice(1)}</b> • 
                  Target HR: <b>{todaysWorkout.heartRateTarget}% of max</b>
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Exercises:
                </Typography>
                
                <Box sx={{ maxHeight: '200px', overflowY: 'auto', pr: 1 }}>
                  {todaysWorkout.exercises.map((exercise, index) => (
                    <Paper key={index} elevation={1} sx={{ p: 1.5, mb: 1, borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {exercise.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exercise.sets && exercise.reps 
                          ? `${exercise.sets} × ${exercise.reps}${exercise.perSide ? ' per side' : ''}` 
                          : exercise.duration
                            ? exercise.duration
                            : exercise.description || ''}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={startSession}
                  startIcon={<PlayArrowIcon />}
                >
                  Start Today's Workout
                </Button>
              </Paper>
            )}
            
            {/* Workout Plan Selection */}
            {!isSessionActive && !todaysWorkout && showPlanSelection && (
              <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Select a Workout Plan
                </Typography>
                
                <Typography variant="body2" paragraph color="text.secondary">
                  No workout is scheduled for today in your fitness plan. Select a workout plan below:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {Object.keys(predefinedPlans).map((planKey) => (
                    <Paper
                      key={planKey}
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: selectedPlan === planKey ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.light, 0.1)
                        }
                      }}
                      onClick={() => {
                        // We need to get the function from context
                        if (typeof selectPredefinedPlan === 'function') {
                          selectPredefinedPlan(planKey);
                        }
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {predefinedPlans[planKey].name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {predefinedPlans[planKey].description}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
                
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => setShowPlanSelection(false)}
                >
                  Hide Plan Selection
                </Button>
              </Paper>
            )}
            
            {/* Instructions */}
            {!isSessionActive && !showPlanSelection && (
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
                <Typography variant="body2" paragraph>
                  4. The coach will help you maintain the right intensity, warn you if your heart rate gets too high, and provide motivational cues.
                </Typography>
                
                {!todaysWorkout && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => setShowPlanSelection(true)}
                  >
                    Choose a Workout Plan
                  </Button>
                )}
              </Paper>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ExerciseCoach;