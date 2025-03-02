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
  Grid,
  Tooltip,
  Button,
  CircularProgress,
  Badge,
  Menu,
  MenuItem,
  Backdrop,
  Drawer,
  useMediaQuery,
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
import SettingsIcon from '@mui/icons-material/Settings';
import MicIcon from '@mui/icons-material/Mic';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimerIcon from '@mui/icons-material/Timer';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import FlareIcon from '@mui/icons-material/Flare';
import { useAuth } from '../context/AuthContext';

const HealthAssistantTab = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isDataPanelOpen, setIsDataPanelOpen] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);
  
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
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      id: Date.now(), // Use timestamp for unique ID
      sender: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };
    
    // Update with user message first
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    
    try {
      // Get AI response
      const response = await getAIResponse(messageToSend);
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1, // Another unique ID
        sender: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      // Update with AI response
      setChatHistory(prev => [...prev, aiMessage]);
      
      // Scroll to bottom after adding messages
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error in chat exchange:", error);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
      setTimeout(scrollToBottom, 100);
    }
  };
  
  // Handle sending a message with the Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Sample health insights to display in the data panel
  const healthInsights = [
    {
      id: "insight-1",
      title: "Heart Rate Zone Analysis",
      category: "heart",
      icon: <FavoriteIcon />,
      color: "#f44336",
      summary: "You spent 45 minutes in cardio zone yesterday",
      details: "Your heart rate data shows optimal training zones. Yesterday, you spent 45 minutes in the cardio zone (136-166 BPM), which is great for cardiovascular health. This is 20% more time than your weekly average.",
      chart: null, // Would contain chart data in a real implementation
      recommendation: "Try maintaining this level of cardio activity 3-4 times per week for optimal heart health."
    },
    {
      id: "insight-2",
      title: "Sleep Pattern Analysis",
      category: "sleep",
      icon: <NightsStayIcon />,
      color: "#673ab7",
      summary: "Your deep sleep is improving this week",
      details: "Your deep sleep has increased by 18% this week compared to last week. You're now averaging 1.8 hours of deep sleep per night, which is within the recommended range.",
      chart: null,
      recommendation: "Continue maintaining a consistent sleep schedule to further improve sleep quality."
    },
    {
      id: "insight-3",
      title: "Weekly Activity Progress",
      category: "activity",
      icon: <DirectionsRunIcon />,
      color: "#009688",
      summary: "You've reached 86% of your weekly step goal",
      details: "You've taken 56,214 steps this week, which is 86% of your 65,000 step weekly goal. You're also 8% more active than last week.",
      chart: null,
      recommendation: "You need about 8,786 more steps to reach your weekly goal. A 30-minute walk would help you achieve this."
    },
    {
      id: "insight-4",
      title: "Nutrition Balance",
      category: "nutrition",
      icon: <LocalDiningIcon />,
      color: "#ff9800",
      summary: "Your protein intake is below target",
      details: "Based on your activity levels, your protein intake should be around 100g daily, but your average is currently 75g. This may affect your muscle recovery and energy levels.",
      chart: null,
      recommendation: "Consider adding protein-rich foods like Greek yogurt, lean chicken, or plant-based proteins to your diet."
    },
  ];
  
  // Menu handling functions
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const toggleVoiceInput = () => {
    // In a real implementation, this would activate the browser's speech recognition API
    setIsVoiceActive(!isVoiceActive);
    if (!isVoiceActive) {
      // Simulate voice activation for 3 seconds
      setTimeout(() => {
        setIsVoiceActive(false);
        handleSendMessage("What's my heart rate trend this week?");
      }, 3000);
    }
  };

  const toggleDataPanel = () => {
    setIsDataPanelOpen(!isDataPanelOpen);
  };

  const handleInsightClick = (insight) => {
    setActiveInsight(insight);
    
    // Add a message from the assistant about this insight
    const insightMessage = {
      id: Date.now(), // Use timestamp for unique ID 
      sender: 'assistant',
      content: `📊 **${insight.title}**: ${insight.details}\n\n💡 **Recommendation**: ${insight.recommendation}`,
      timestamp: new Date().toISOString(),
      isInsight: true
    };
    
    setChatHistory(prev => [...prev, insightMessage]);
    setTimeout(scrollToBottom, 100);
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
    },
    {
      id: 3,
      sender: 'assistant',
      content: "I have some personalized health insights for you today. Click the 'View Insights' button to see them!",
      timestamp: new Date().toISOString(),
    }
  ];
  
  // Initialize chat with appropriate messages based on auth status
  useEffect(() => {
    setChatHistory(initialMessages);
    // Scroll to bottom on initial load
    setTimeout(scrollToBottom, 100);
  }, [isAuthenticated]);
  
  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, maxWidth: 1000, mx: 'auto' }}>
      {/* Header Section */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
          color: 'white',
          mb: 3
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: { xs: 'center', sm: 'flex-start' }, 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Avatar
            sx={{
              bgcolor: 'white',
              width: 60,
              height: 60,
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              border: '4px solid rgba(255,255,255,0.2)',
              padding: 0.5
            }}
          >
            <SmartToyIcon sx={{ color: '#1e3c72', fontSize: 35 }} />
          </Avatar>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
              AI Health Assistant
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
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
          
          {isAuthenticated && (
            <Box sx={{ ml: 'auto', display: { xs: 'none', sm: 'block' } }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<TrendingUpIcon />}
                onClick={toggleDataPanel}
                sx={{ borderRadius: 2 }}
              >
                View Health Insights
              </Button>
            </Box>
          )}
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
        />
        <Chip 
          icon={<DirectionsRunIcon />} 
          label="Activity" 
          onClick={() => setSelectedCategory('activity')}
          color={selectedCategory === 'activity' ? 'primary' : 'default'}
          variant={selectedCategory === 'activity' ? 'filled' : 'outlined'}
        />
        <Chip 
          icon={<MonitorHeartIcon />} 
          label="Heart Rate" 
          onClick={() => setSelectedCategory('heart')}
          color={selectedCategory === 'heart' ? 'primary' : 'default'}
          variant={selectedCategory === 'heart' ? 'filled' : 'outlined'}
        />
        <Chip 
          icon={<NightsStayIcon />} 
          label="Sleep" 
          onClick={() => setSelectedCategory('sleep')}
          color={selectedCategory === 'sleep' ? 'primary' : 'default'}
          variant={selectedCategory === 'sleep' ? 'filled' : 'outlined'}
        />
        <Chip 
          icon={<LocalDiningIcon />} 
          label="Nutrition" 
          onClick={() => setSelectedCategory('nutrition')}
          color={selectedCategory === 'nutrition' ? 'primary' : 'default'}
          variant={selectedCategory === 'nutrition' ? 'filled' : 'outlined'}
        />
      </Box>
      
      {/* Mobile View Insights Button */}
      {isAuthenticated && (
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<TrendingUpIcon />}
            onClick={toggleDataPanel}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            View Health Insights
          </Button>
        </Box>
      )}
      
      {/* Chat Container */}
      <Paper
        elevation={3}
        sx={{
          height: 450,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          mb: 3,
          overflow: 'hidden',
          boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
        }}
      >
        {/* Voice active overlay */}
        {isVoiceActive && (
          <Backdrop
            open={true}
            sx={{
              position: 'absolute',
              zIndex: 10,
              color: 'white',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <MicIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
            </motion.div>
            <Typography variant="h6">Listening...</Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 3, color: 'white', borderColor: 'white' }}
              onClick={() => setIsVoiceActive(false)}
            >
              Cancel
            </Button>
          </Backdrop>
        )}
        
        {/* Messages Container */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#f5f7fa',
          }}
        >
          {chatHistory.map((msg) => (
            <Box
              key={msg.id}
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
                      bgcolor: msg.isInsight ? '#ff9800' : theme.palette.primary.main,
                      width: 38,
                      height: 38,
                      mr: 1,
                      mt: 0.5
                    }}
                  >
                    {msg.isInsight ? <FlareIcon /> : <SmartToyIcon />}
                  </Avatar>
                )}
                
                <Box>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: msg.sender === 'user' 
                        ? theme.palette.primary.main 
                        : msg.isInsight 
                          ? alpha('#ff9800', 0.1)
                          : theme.palette.background.paper,
                      color: msg.sender === 'user' ? 'white' : 'inherit',
                      borderTopRightRadius: msg.sender === 'user' ? 0 : 2,
                      borderTopLeftRadius: msg.sender === 'assistant' ? 0 : 2,
                    }}
                  >
                    <Typography
                      variant="body1"
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
          ))}
          
          {/* Loading indicator */}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CircularProgress size={20} color="primary" />
                  <Typography variant="body2">Thinking...</Typography>
                </Paper>
              </Box>
            </Box>
          )}
          
          {/* This ref helps with scrolling to bottom */}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            component="form"
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 30,
              px: 2,
              py: 0.5
            }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ color: theme.palette.text.secondary }}
            >
              <MoreVertIcon />
            </IconButton>
            
            <TextField
              fullWidth
              placeholder="Type your health question..."
              variant="standard"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              inputRef={inputRef}
              InputProps={{
                disableUnderline: true,
                style: { padding: '10px 0' }
              }}
              sx={{ mx: 1 }}
            />
            
            <IconButton 
              onClick={toggleVoiceInput}
              sx={{ color: isVoiceActive ? 'error.main' : 'text.secondary' }}
            >
              <MicIcon />
            </IconButton>
            
            <IconButton
              color="primary"
              disabled={!message.trim() || isLoading}
              onClick={() => handleSendMessage()}
              type="submit"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
      
      {/* Suggestion chips */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ ml: 1 }}>
          Try asking:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filteredSuggestions.map((suggestion) => (
            <Chip
              key={suggestion.id}
              label={suggestion.text}
              onClick={() => handleSendMessage(suggestion.text)}
              variant="outlined"
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Health Insights Drawer */}
      {isAuthenticated && (
        <Drawer
          anchor={isMobile ? "bottom" : "right"}
          open={isDataPanelOpen}
          onClose={() => setIsDataPanelOpen(false)}
          PaperProps={{
            sx: {
              width: isMobile ? '100%' : 320,
              borderRadius: isMobile ? '16px 16px 0 0' : 0,
              maxHeight: isMobile ? '80vh' : '100vh',
              p: 2
            }
          }}
        >
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Your Health Insights</Typography>
              <IconButton onClick={() => setIsDataPanelOpen(false)}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {healthInsights.map((insight) => (
                <Paper
                  key={insight.id}
                  elevation={2}
                  sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                    borderLeft: `4px solid ${insight.color}`
                  }}
                  onClick={() => {
                    handleInsightClick(insight);
                    setIsDataPanelOpen(false);
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: alpha(insight.color, 0.15), color: insight.color, width: 32, height: 32 }}>
                      {insight.icon}
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {insight.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{insight.summary}</Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Drawer>
      )}
      
      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          setChatHistory(initialMessages);
          setTimeout(scrollToBottom, 100);
        }}>
          <ReplayIcon fontSize="small" sx={{ mr: 1 }} />
          Reset conversation
        </MenuItem>
        {isAuthenticated && (
          <MenuItem onClick={() => {
            handleMenuClose();
            toggleDataPanel();
          }}>
            <TrendingUpIcon fontSize="small" sx={{ mr: 1 }} />
            View health insights
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleMenuClose();
          toggleVoiceInput();
        }}>
          <MicIcon fontSize="small" sx={{ mr: 1 }} />
          Voice input
        </MenuItem>
      </Menu>
      
      {/* Feature Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1 }}>
                <MonitorHeartIcon />
              </Avatar>
              <Typography variant="h6">Health Tracking</Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
              Monitor your vital health metrics including heart rate, sleep quality, and activity levels.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSendMessage("What's my current heart rate?")}
            >
              Check Vitals
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 1 }}>
                <FitnessCenterIcon />
              </Avatar>
              <Typography variant="h6">Workout Plans</Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
              Get personalized workout recommendations based on your fitness level and goals.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSendMessage("Recommend a workout based on my activity level")}
            >
              Get Workout
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 1 }}>
                <LocalDiningIcon />
              </Avatar>
              <Typography variant="h6">Nutrition Advice</Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
              Receive dietary recommendations that complement your activity and health goals.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSendMessage("What should I eat based on my activity today?")}
            >
              Get Meal Ideas
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HealthAssistantTab;