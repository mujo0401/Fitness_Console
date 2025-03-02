import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Chip,
  alpha,
  useTheme,
  Zoom,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReplayIcon from '@mui/icons-material/Replay';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAuth } from '../context/AuthContext';

const HealthAssistantTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 1, 
      sender: 'assistant', 
      content: "👋 Hello! I'm your Health Assistant. I can help answer questions about your health data, nutrition, and fitness metrics. Try asking me about:",
      timestamp: new Date().toISOString(),
    },
    { 
      id: 2, 
      sender: 'assistant', 
      content: "• Your step count and activity trends\n• Heart rate patterns and zones\n• Sleep quality metrics\n• Nutrition information\n• Workout suggestions based on your data",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Predefined suggestions for the chat - different suggestions based on auth status
  const suggestions = isAuthenticated ? [
    { id: 1, text: "What was my average heart rate yesterday?", category: "heart" },
    { id: 2, text: "How many steps have I taken this week?", category: "activity" },
    { id: 3, text: "What's my sleep quality trend?", category: "sleep" },
    { id: 4, text: "Give me meal suggestions based on my activity level", category: "nutrition" },
    { id: 5, text: "When did I have my highest heart rate today?", category: "heart" },
    { id: 6, text: "Recommend a workout based on my recent activity", category: "fitness" },
    { id: 7, text: "How does my step count compare to last week?", category: "activity" },
    { id: 8, text: "What's the nutritional breakdown of my diet?", category: "nutrition" },
  ] : [
    { id: 1, text: "What are the recommended heart rate zones for exercise?", category: "heart" },
    { id: 2, text: "How many steps should I aim for each day?", category: "activity" },
    { id: 3, text: "What can I do to improve my sleep quality?", category: "sleep" },
    { id: 4, text: "How much protein should I eat daily?", category: "nutrition" },
    { id: 5, text: "What's a good cardio workout for beginners?", category: "fitness" },
    { id: 6, text: "How do I start strength training?", category: "fitness" },
    { id: 7, text: "What are the benefits of meditation?", category: "wellness" },
    { id: 8, text: "What should I eat before and after workouts?", category: "nutrition" },
  ];
  
  // Filtered suggestions based on selected category
  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);
  
  // Mock Fitbit data that would come from the actual Fitbit API
  const mockFitbitData = {
    steps: {
      today: 8432,
      yesterday: 9781,
      thisWeek: 56214,
      lastWeek: 52109,
      average: 8030
    },
    heartRate: {
      current: 72,
      resting: 68,
      zones: {
        fatBurn: { min: 97, max: 135, minutes: 103 },
        cardio: { min: 136, max: 166, minutes: 45 },
        peak: { min: 167, max: 220, minutes: 12 }
      },
      yesterday: {
        average: 76,
        max: { value: 142, time: "18:45" },
        min: { value: 62, time: "03:22" }
      }
    },
    sleep: {
      lastNight: {
        duration: 7.4,
        quality: "Good",
        deepSleep: 1.8,
        remSleep: 2.2,
        lightSleep: 3.1,
        awake: 0.3
      },
      weekAverage: 7.2,
      efficiency: 89
    },
    caloriesBurned: {
      today: 2145,
      goal: 2500,
      average: 2267
    },
    exercise: {
      lastSession: {
        type: "Running",
        duration: 32,
        caloriesBurned: 387,
        date: "2023-06-12"
      },
      weeklyActive: 182 // minutes
    }
  };
  
  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // Function to get response from "AI"
  const getAIResponse = async (userMessage) => {
    // This would be replaced with an actual API call to a backend service
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = "";
    const messageLower = userMessage.toLowerCase();
    
    // For non-authenticated users, provide general health information
    if (!isAuthenticated) {
      // General health and fitness responses
      if (messageLower.includes('workout') || messageLower.includes('exercise') || messageLower.includes('training')) {
        response = "Based on general fitness guidelines, a balanced workout routine should include 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, plus strength training 2+ days per week. For personalized recommendations based on your actual fitness data, please connect your fitness account.";
      }
      else if (messageLower.includes('nutrition') || messageLower.includes('food') || messageLower.includes('meal') || messageLower.includes('diet')) {
        response = "As a general nutrition guideline, a balanced diet should include plenty of fruits and vegetables, lean proteins, whole grains, and healthy fats. Most adults need between 1,800-2,400 calories per day depending on activity level. For personalized recommendations based on your actual activity data, please connect your fitness account.";
      }
      else if (messageLower.includes('sleep') || messageLower.includes('slept')) {
        response = "The National Sleep Foundation recommends adults get 7-9 hours of quality sleep per night. Good sleep hygiene includes consistent sleep/wake times, limiting screen time before bed, and keeping your bedroom cool and dark. For personalized insights based on your actual sleep data, please connect your fitness account.";
      }
      else if (messageLower.includes('heart') || messageLower.includes('cardio')) {
        response = "For heart health, guidelines recommend moderate-intensity exercise that raises your heart rate to 50-70% of your maximum heart rate (roughly 220 minus your age) for at least 150 minutes weekly. To see your actual heart rate data and get personalized recommendations, please connect your fitness account.";
      }
      else if (messageLower.includes('steps') || messageLower.includes('walking')) {
        response = "The general recommendation is to aim for 8,000-10,000 steps daily for overall health benefits. Regular walking can improve cardiovascular fitness, strengthen bones, reduce excess body fat, and boost muscle power and endurance. To track your actual step count and get personalized insights, please connect your fitness account.";
      }
      else if (messageLower.includes('muscle') || messageLower.includes('strength') || messageLower.includes('weight training')) {
        response = "Strength training guidelines recommend training each major muscle group 2-3 times per week with 48 hours of recovery between sessions for the same muscle group. For beginners, 1-2 sets of 8-12 repetitions is recommended, while more advanced lifters might benefit from 3-6 sets.";
      }
      else if (messageLower.includes('stress') || messageLower.includes('meditation') || messageLower.includes('mindfulness')) {
        response = "Regular stress management practices like meditation, deep breathing, or yoga can significantly improve both mental and physical health. Even short 5-10 minute sessions of mindfulness can activate your body's relaxation response and reduce stress hormones like cortisol.";
      }
      else {
        response = "I can provide general health and wellness information, but for personalized insights based on your actual fitness data, please connect your fitness account. You can ask me about nutrition, exercise recommendations, sleep guidelines, and other health topics.";
      }
    } 
    // For authenticated users, provide personalized responses using their fitness data
    else {
      if (messageLower.includes('steps') || messageLower.includes('walk')) {
        if (messageLower.includes('today')) {
          response = `You've taken ${mockFitbitData.steps.today.toLocaleString()} steps today! That's ${Math.round((mockFitbitData.steps.today / 10000) * 100)}% of your daily goal.`;
        } else if (messageLower.includes('yesterday')) {
          response = `Yesterday, you took ${mockFitbitData.steps.yesterday.toLocaleString()} steps. That's ${mockFitbitData.steps.yesterday > mockFitbitData.steps.average ? 'above' : 'below'} your average of ${mockFitbitData.steps.average.toLocaleString()} steps.`;
        } else if (messageLower.includes('week')) {
          const comparison = mockFitbitData.steps.thisWeek - mockFitbitData.steps.lastWeek;
          const percentChange = Math.abs(Math.round((comparison / mockFitbitData.steps.lastWeek) * 100));
          
          response = `This week, you've taken ${mockFitbitData.steps.thisWeek.toLocaleString()} steps, which is ${comparison > 0 ? 'up' : 'down'} ${percentChange}% compared to last week (${mockFitbitData.steps.lastWeek.toLocaleString()} steps).`;
        } else {
          response = `Your average daily step count is ${mockFitbitData.steps.average.toLocaleString()} steps. Today, you've taken ${mockFitbitData.steps.today.toLocaleString()} steps so far.`;
        }
      } 
      else if (messageLower.includes('heart') || messageLower.includes('bpm') || messageLower.includes('pulse')) {
        if (messageLower.includes('highest') || messageLower.includes('max')) {
          response = `Your highest heart rate today was ${mockFitbitData.heartRate.yesterday.max.value} BPM at ${mockFitbitData.heartRate.yesterday.max.time}.`;
        } else if (messageLower.includes('average') || messageLower.includes('mean')) {
          response = `Your average heart rate yesterday was ${mockFitbitData.heartRate.yesterday.average} BPM. Your resting heart rate is ${mockFitbitData.heartRate.resting} BPM.`;
        } else if (messageLower.includes('zone')) {
          response = `Yesterday, you spent:\n• ${mockFitbitData.heartRate.zones.fatBurn.minutes} minutes in the Fat Burn zone (${mockFitbitData.heartRate.zones.fatBurn.min}-${mockFitbitData.heartRate.zones.fatBurn.max} BPM)\n• ${mockFitbitData.heartRate.zones.cardio.minutes} minutes in the Cardio zone (${mockFitbitData.heartRate.zones.cardio.min}-${mockFitbitData.heartRate.zones.cardio.max} BPM)\n• ${mockFitbitData.heartRate.zones.peak.minutes} minutes in the Peak zone (${mockFitbitData.heartRate.zones.peak.min}+ BPM)`;
        } else {
          response = `Your current heart rate is ${mockFitbitData.heartRate.current} BPM, and your resting heart rate is ${mockFitbitData.heartRate.resting} BPM.`;
        }
      }
      else if (messageLower.includes('sleep') || messageLower.includes('slept')) {
        if (messageLower.includes('quality') || messageLower.includes('good')) {
          response = `Last night's sleep quality was rated as "${mockFitbitData.sleep.lastNight.quality}" with a sleep efficiency of ${mockFitbitData.sleep.efficiency}%.`;
        } else if (messageLower.includes('deep')) {
          response = `Last night, you had ${mockFitbitData.sleep.lastNight.deepSleep} hours of deep sleep, which is ${mockFitbitData.sleep.lastNight.deepSleep >= 1.5 ? 'good' : 'below recommended levels'}.`;
        } else if (messageLower.includes('trend') || messageLower.includes('average')) {
          response = `Your average sleep duration over the past week is ${mockFitbitData.sleep.weekAverage} hours. The recommended amount is 7-9 hours for adults.`;
        } else {
          response = `Last night, you slept for ${mockFitbitData.sleep.lastNight.duration} hours total:\n• ${mockFitbitData.sleep.lastNight.deepSleep} hours of deep sleep\n• ${mockFitbitData.sleep.lastNight.remSleep} hours of REM sleep\n• ${mockFitbitData.sleep.lastNight.lightSleep} hours of light sleep\n• ${mockFitbitData.sleep.lastNight.awake} hours awake`;
        }
      }
      else if (messageLower.includes('calories') || messageLower.includes('burn')) {
        response = `Today, you've burned ${mockFitbitData.caloriesBurned.today} calories out of your daily goal of ${mockFitbitData.caloriesBurned.goal} calories (${Math.round((mockFitbitData.caloriesBurned.today / mockFitbitData.caloriesBurned.goal) * 100)}% complete).`;
      }
      else if (messageLower.includes('workout') || messageLower.includes('exercise') || messageLower.includes('training') || messageLower.includes('recommend')) {
        response = `Based on your recent activity patterns and heart rate data, I'd recommend a ${mockFitbitData.heartRate.zones.cardio.minutes < 30 ? 'cardio workout like a 30-minute run or bike ride' : 'recovery day with light yoga or a gentle walk'}. Your last workout was ${mockFitbitData.exercise.lastSession.type} for ${mockFitbitData.exercise.lastSession.duration} minutes.`;
      }
      else if (messageLower.includes('nutrition') || messageLower.includes('food') || messageLower.includes('meal') || messageLower.includes('diet')) {
        response = `Based on your activity level and calories burned (${mockFitbitData.caloriesBurned.today} today), I'd recommend focusing on protein-rich foods like lean meats, legumes, and dairy. Aim for about 2,300 calories today with at least 100g of protein to support your activity level.`;
      }
      else {
        response = "I'm not sure I understand that question. Could you rephrase it or ask me about your steps, heart rate, sleep quality, calories burned, or workout recommendations?";
      }
    }
    
    setIsLoading(false);
    return response;
  };
  
  // Handle sending a new message
  const handleSendMessage = async (inputMessage = null) => {
    const messageToSend = inputMessage || message;
    if (!messageToSend.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: chatHistory.length + 1,
      sender: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    
    // Get AI response
    const response = await getAIResponse(messageToSend);
    
    // Add AI response to chat
    const aiMessage = {
      id: chatHistory.length + 2,
      sender: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
    
    setChatHistory(prev => [...prev, aiMessage]);
  };
  
  // Handle sending a message with the Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // For non-authenticated users, still show the assistant but with limited functionality
  const initialMessages = !isAuthenticated ? [
    { 
      id: 1, 
      sender: 'assistant', 
      content: "👋 Hello! I'm your AI Health Assistant. I can answer general health questions and provide wellness tips. For personalized insights based on your fitness data, please connect your fitness account.",
      timestamp: new Date().toISOString(),
    },
    { 
      id: 2, 
      sender: 'assistant', 
      content: "I can help with:\n• General nutrition advice\n• Fitness information\n• Wellness tips\n• Health recommendations\n\nConnect your fitness account for personalized insights based on your actual data!",
      timestamp: new Date().toISOString(),
    }
  ] : [
    { 
      id: 1, 
      sender: 'assistant', 
      content: "👋 Hello! I'm your Health Assistant. I can help answer questions about your health data, nutrition, and fitness metrics. Try asking me about:",
      timestamp: new Date().toISOString(),
    },
    { 
      id: 2, 
      sender: 'assistant', 
      content: "• Your step count and activity trends\n• Heart rate patterns and zones\n• Sleep quality metrics\n• Nutrition information\n• Workout suggestions based on your data",
      timestamp: new Date().toISOString(),
    }
  ];
  
  // Initialize chat with appropriate messages based on auth status
  useEffect(() => {
    setChatHistory(initialMessages);
  }, [isAuthenticated, initialMessages]);
  
  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 4,
            background: 'linear-gradient(125deg, #1e3c72, #2a5298)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            mb: 4,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Abstract geometric background elements */}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            opacity: 0.1,
            background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.4) 0%, transparent 40%)'
          }} />
          
          <Box sx={{ 
            position: 'absolute', 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            bottom: -100,
            right: -50
          }} />
          
          <Box sx={{ 
            position: 'absolute', 
            width: 150, 
            height: 150, 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            top: -50,
            left: 80
          }} />
          
          <Box sx={{ position: 'relative', p: 4, zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'white',
                  width: 70,
                  height: 70,
                  mr: 3,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  border: '4px solid rgba(255,255,255,0.2)',
                  padding: 0.5
                }}
              >
                <SmartToyIcon sx={{ color: '#1e3c72', fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" color="white" sx={{ mb: 0.5 }}>
                  AI Health Assistant
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Powered by advanced AI and health data analytics
                </Typography>
                
                {!isAuthenticated && (
                  <Chip 
                    label="Connect Fitness Account for Personalized Insights" 
                    size="small"
                    color="warning"
                    sx={{ mt: 1, fontWeight: 'medium' }}
                  />
                )}
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                flexWrap: 'wrap', 
                justifyContent: { xs: 'center', sm: 'flex-start' },
                mb: 1
              }}
            >
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: 3, 
                p: 2,
                minWidth: 110,
                textAlign: 'center'
              }}>
                <Typography variant="h6" color="white" fontWeight="bold">
                  24/7
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Always Available
                </Typography>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: 3, 
                p: 2,
                minWidth: 110,
                textAlign: 'center'
              }}>
                <Typography variant="h6" color="white" fontWeight="bold">
                  100%
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Private & Secure
                </Typography>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                borderRadius: 3, 
                p: 2,
                minWidth: 110,
                textAlign: 'center'
              }}>
                <Typography variant="h6" color="white" fontWeight="bold">
                  10+
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Health Metrics
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.2)', 
              p: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="subtitle2" color="rgba(255,255,255,0.9)">
              {isAuthenticated 
                ? "Ask me anything about your health data and fitness metrics for personalized insights" 
                : "Ask me general health questions or connect your fitness account for personalized insights"}
            </Typography>
          </Box>
        </Paper>
          
          {/* Chat Category Filters */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<InfoOutlinedIcon />} 
              label="All" 
              onClick={() => setSelectedCategory('all')}
              color={selectedCategory === 'all' ? 'primary' : 'default'}
              variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
              sx={{ fontWeight: selectedCategory === 'all' ? 'bold' : 'normal' }}
            />
            <Chip 
              icon={<DirectionsRunIcon />} 
              label="Activity" 
              onClick={() => setSelectedCategory('activity')}
              color={selectedCategory === 'activity' ? 'primary' : 'default'}
              variant={selectedCategory === 'activity' ? 'filled' : 'outlined'}
              sx={{ fontWeight: selectedCategory === 'activity' ? 'bold' : 'normal' }}
            />
            <Chip 
              icon={<MonitorHeartIcon />} 
              label="Heart Rate" 
              onClick={() => setSelectedCategory('heart')}
              color={selectedCategory === 'heart' ? 'primary' : 'default'}
              variant={selectedCategory === 'heart' ? 'filled' : 'outlined'}
              sx={{ fontWeight: selectedCategory === 'heart' ? 'bold' : 'normal' }}
            />
            <Chip 
              icon={<NightsStayIcon />} 
              label="Sleep" 
              onClick={() => setSelectedCategory('sleep')}
              color={selectedCategory === 'sleep' ? 'primary' : 'default'}
              variant={selectedCategory === 'sleep' ? 'filled' : 'outlined'}
              sx={{ fontWeight: selectedCategory === 'sleep' ? 'bold' : 'normal' }}
            />
            <Chip 
              icon={<LocalDiningIcon />} 
              label="Nutrition" 
              onClick={() => setSelectedCategory('nutrition')}
              color={selectedCategory === 'nutrition' ? 'primary' : 'default'}
              variant={selectedCategory === 'nutrition' ? 'filled' : 'outlined'}
              sx={{ fontWeight: selectedCategory === 'nutrition' ? 'bold' : 'normal' }}
            />
            <Chip 
              icon={<FitnessCenterIcon />} 
              label="Fitness" 
              onClick={() => setSelectedCategory('fitness')}
              color={selectedCategory === 'fitness' ? 'primary' : 'default'}
              variant={selectedCategory === 'fitness' ? 'filled' : 'outlined'}
              sx={{ fontWeight: selectedCategory === 'fitness' ? 'bold' : 'normal' }}
            />
          </Box>
          
          {/* Chat messages container */}
          <Paper 
            elevation={3} 
            sx={{ 
              mb: 3, 
              p: 3, 
              borderRadius: 3,
              height: 500,
              overflowY: 'auto',
              bgcolor: '#f8f9fa',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%233f51b5\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1.5\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1.5\'/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '20px 20px',
              position: 'relative',
              boxShadow: '0 12px 24px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)'
            }}
          >
            {/* Message bubbles */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {chatHistory.map((msg) => (
                <Zoom 
                  key={msg.id} 
                  in={true} 
                  style={{ 
                    transformOrigin: msg.sender === 'user' ? 'right' : 'left'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', maxWidth: '80%' }}>
                      {msg.sender === 'assistant' && (
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 38,
                            height: 38,
                            mr: 1,
                            mt: 0.5
                          }}
                        >
                          <SmartToyIcon />
                        </Avatar>
                      )}
                      
                      <Box>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            borderRadius: 3,
                            bgcolor: msg.sender === 'user' ? theme.palette.primary.main : theme.palette.background.paper,
                            color: msg.sender === 'user' ? 'white' : 'inherit',
                            borderTopRightRadius: msg.sender === 'user' ? 0 : 3,
                            borderTopLeftRadius: msg.sender === 'assistant' ? 0 : 3,
                            position: 'relative',
                            maxWidth: '100%',
                            boxShadow: msg.sender === 'user' 
                              ? '0 2px 8px rgba(0,0,0,0.15)' 
                              : '0 2px 5px rgba(0,0,0,0.08)',
                          }}
                        >
                          <Typography
                            variant="body1"
                            component="div"
                            sx={{ 
                              whiteSpace: 'pre-line', 
                              overflowWrap: 'break-word'
                            }}
                          >
                            {msg.content}
                          </Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            color: 'text.secondary',
                            display: 'block',
                            textAlign: msg.sender === 'user' ? 'right' : 'left',
                            ml: 1,
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      
                      {msg.sender === 'user' && (
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.info.dark,
                            width: 38,
                            height: 38,
                            ml: 1,
                            mt: 0.5
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                      )}
                    </Box>
                  </Box>
                </Zoom>
              ))}
              
              {/* Loading animation */}
              {isLoading && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 38,
                        height: 38,
                        mr: 1,
                        mt: 0.5
                      }}
                    >
                      <SmartToyIcon />
                    </Avatar>
                    
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: theme.palette.background.paper,
                        borderTopLeftRadius: 0,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          alignItems: 'center',
                        }}
                      >
                        <motion.div
                          animate={{
                            scale: [0.8, 1, 0.8],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.2,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: theme.palette.primary.main,
                              borderRadius: '50%',
                            }}
                          />
                        </motion.div>
                        <motion.div
                          animate={{
                            scale: [0.8, 1, 0.8],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.2,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: theme.palette.primary.main,
                              borderRadius: '50%',
                            }}
                          />
                        </motion.div>
                        <motion.div
                          animate={{
                            scale: [0.8, 1, 0.8],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.2,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: theme.palette.primary.main,
                              borderRadius: '50%',
                            }}
                          />
                        </motion.div>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>
          </Paper>
          
          {/* Suggestion chips */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ ml: 1 }}>
              Suggested questions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: '100%', pb: 1 }}>
              {filteredSuggestions.map((suggestion) => (
                <Chip
                  key={suggestion.id}
                  label={suggestion.text}
                  onClick={() => handleSendMessage(suggestion.text)}
                  sx={{ 
                    borderRadius: 4,
                    px: 1,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                    },
                    transition: 'all 0.2s ease',
                    fontWeight: 'normal',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Box>
          </Box>
          
          {/* Input area */}
          <Paper
            component="form"
            elevation={5}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 30,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)',
              gap: 1.5,
              bgcolor: 'white',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.08)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #3f51b5, #2196f3, #00bcd4)',
                zIndex: 1
              }
            }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={isAuthenticated ? 
                "Ask about your health data or fitness metrics..." : 
                "Ask me anything about health and wellness..."
              }
              variant="standard"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              inputRef={inputRef}
              InputProps={{
                disableUnderline: true,
                style: { fontSize: '16px', lineHeight: '1.5' }
              }}
              sx={{ ml: 2, flex: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="refresh"
                onClick={() => {
                  setChatHistory([
                    { 
                      id: 1, 
                      sender: 'assistant', 
                      content: "👋 Hello! I'm your Fitbit Health Assistant. I can help answer questions about your health data, nutrition, and fitness metrics. Try asking me about:",
                      timestamp: new Date().toISOString(),
                    },
                    { 
                      id: 2, 
                      sender: 'assistant', 
                      content: "• Your step count and activity trends\n• Heart rate patterns and zones\n• Sleep quality metrics\n• Nutrition information\n• Workout suggestions based on your data",
                      timestamp: new Date().toISOString(),
                    }
                  ]);
                }}
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                <ReplayIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="primary"
                aria-label="send message"
                onClick={() => handleSendMessage()}
                disabled={!message.trim() || isLoading}
                sx={{
                  width: 50,
                  height: 50,
                  bgcolor: !message.trim() || isLoading 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : 'linear-gradient(45deg, #3f51b5, #2196f3)',
                  color: !message.trim() || isLoading ? theme.palette.text.disabled : 'white',
                  '&:hover': {
                    bgcolor: !message.trim() || isLoading 
                      ? alpha(theme.palette.primary.main, 0.15) 
                      : 'linear-gradient(45deg, #3949ab, #1e88e5)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease',
                  boxShadow: !message.trim() || isLoading 
                    ? 'none' 
                    : '0 4px 10px rgba(33, 150, 243, 0.3)',
                  mr: 0.5
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Paper>
        
        {/* Feature explanation cards - more visually stunning design */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom align="center" 
            sx={{ 
              mb: 3,
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}
          >
            Advanced AI Health Assistant Features
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ 
                    height: 120, 
                    background: 'linear-gradient(120deg, #3f51b5, #1a237e)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: 0.1,
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'white\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")'
                    }} />
                    <MonitorHeartIcon sx={{ fontSize: 60, color: 'white' }} />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="#3f51b5">
                      Personalized Health Insights
                    </Typography>
                    <Typography variant="body2">
                      Get detailed analysis of your heart rate patterns, activity levels, and sleep quality trends. Our AI analyzes your historical data to identify patterns and provide actionable recommendations.
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={isAuthenticated ? "Available Now" : "Connect Account"} 
                        size="small"
                        color={isAuthenticated ? "success" : "primary"}
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ 
                    height: 120, 
                    background: 'linear-gradient(120deg, #2196f3, #0d47a1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: 0.1,
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'white\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")'
                    }} />
                    <FitnessCenterIcon sx={{ fontSize: 60, color: 'white' }} />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="#2196f3">
                      AI Workout Recommendations
                    </Typography>
                    <Typography variant="body2">
                      Receive customized workout suggestions based on your recent activity levels, recovery status, and fitness goals. Our system adapts recommendations as your fitness progresses.
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label="Available For Everyone" 
                        size="small"
                        color="success"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ 
                    height: 120, 
                    background: 'linear-gradient(120deg, #00bcd4, #006064)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: 0.1,
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'white\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")'
                    }} />
                    <LocalDiningIcon sx={{ fontSize: 60, color: 'white' }} />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="#00bcd4">
                      Nutritional Intelligence
                    </Typography>
                    <Typography variant="body2">
                      Get personalized nutrition advice based on your activity levels and metabolic patterns. Our AI can suggest optimal meal timing, macronutrient ratios, and specific foods to enhance performance.
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={isAuthenticated ? "Enhanced with Your Data" : "Basic Version Available"} 
                        size="small"
                        color={isAuthenticated ? "success" : "warning"}
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
};

export default HealthAssistantTab;