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
  
  // Predefined suggestions for the chat
  const suggestions = [
    { id: 1, text: "What was my average heart rate yesterday?", category: "heart" },
    { id: 2, text: "How many steps have I taken this week?", category: "activity" },
    { id: 3, text: "What's my sleep quality trend?", category: "sleep" },
    { id: 4, text: "Give me meal suggestions based on my activity level", category: "nutrition" },
    { id: 5, text: "When did I have my highest heart rate today?", category: "heart" },
    { id: 6, text: "Recommend a workout based on my recent activity", category: "fitness" },
    { id: 7, text: "How does my step count compare to last week?", category: "activity" },
    { id: 8, text: "What's the nutritional breakdown of my diet?", category: "nutrition" },
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
    // that would process user questions and return relevant Fitbit data
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = "";
    
    // Simple keyword matching for demo purposes
    const messageLower = userMessage.toLowerCase();
    
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
  
  // Require authentication to see health assistant
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h5" color="primary" gutterBottom>
              <ChatIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Health Assistant
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Please connect your Fitbit account to use the Health Assistant.
            </Typography>
          </Paper>
        </Box>
      </motion.div>
    );
  }
  
  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 44,
                height: 44,
                mr: 2
              }}
            >
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Health Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask questions about your health data and get personalized insights
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          
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
            elevation={2} 
            sx={{ 
              mb: 3, 
              p: 2, 
              borderRadius: 3,
              height: 500,
              overflowY: 'auto',
              bgcolor: alpha(theme.palette.background.default, 0.8),
              backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.12)} 1px, transparent 0)`,
              backgroundSize: '18px 18px',
              position: 'relative'
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
            variant="outlined"
            sx={{
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 20,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${theme.palette.divider}`,
              gap: 1,
              bgcolor: theme.palette.background.paper,
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
              placeholder="Ask about your Fitbit data or health metrics..."
              variant="standard"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              inputRef={inputRef}
              InputProps={{
                disableUnderline: true,
                style: { fontSize: '14px' }
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
                  bgcolor: !message.trim() || isLoading ? alpha(theme.palette.primary.main, 0.1) : theme.palette.primary.main,
                  color: !message.trim() || isLoading ? theme.palette.text.disabled : 'white',
                  '&:hover': {
                    bgcolor: !message.trim() || isLoading ? alpha(theme.palette.primary.main, 0.15) : theme.palette.primary.dark,
                  },
                  transition: 'all 0.3s ease',
                  mr: 0.5
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        </Paper>
        
        {/* Feature explanation card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              <InfoOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              About Health Assistant
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              The Health Assistant is powered by AI and connected to your Fitbit data, providing personalized insights and recommendations based on your health metrics. You can ask questions about:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip icon={<DirectionsRunIcon />} label="Activity & Steps" size="small" />
              <Chip icon={<MonitorHeartIcon />} label="Heart Rate" size="small" />
              <Chip icon={<NightsStayIcon />} label="Sleep Quality" size="small" />
              <Chip icon={<LocalDiningIcon />} label="Nutrition" size="small" />
              <Chip icon={<FitnessCenterIcon />} label="Workout Recommendations" size="small" />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Your questions are analyzed to provide contextual answers based on your personal health data. This helps you understand your metrics and get actionable insights to improve your wellness.
            </Typography>
          </Paper>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default HealthAssistantTab;