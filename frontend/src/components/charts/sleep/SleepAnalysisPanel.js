import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  LinearProgress, 
  Stack, 
  alpha, 
  useTheme, 
  CircularProgress, 
  Chip,
  Tabs,
  Tab,
  Button,
  Tooltip
} from '@mui/material';

// Icons
import BedtimeIcon from '@mui/icons-material/Bedtime';
import HotelIcon from '@mui/icons-material/Hotel';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningIcon from '@mui/icons-material/Warning';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WavesIcon from '@mui/icons-material/Waves';
import LightModeIcon from '@mui/icons-material/LightMode';

// Define sleep analysis modes
const ANALYSIS_MODES = [
  { value: 'basic', label: 'Basic', icon: <BedtimeIcon fontSize="small" /> },
  { value: 'quality', label: 'Quality', icon: <NightsStayIcon fontSize="small" /> },
  { value: 'cycles', label: 'Cycles', icon: <WavesIcon fontSize="small" /> },
  { value: 'health', label: 'Health', icon: <HealthAndSafetyIcon fontSize="small" /> },
  { value: 'patterns', label: 'Patterns', icon: <PsychologyIcon fontSize="small" /> },
  { value: 'research', label: 'Research', icon: <ScienceIcon fontSize="small" /> },
  { value: 'personalized', label: 'Personalized', icon: <AutoAwesomeIcon fontSize="small" /> }
];

/**
 * Sleep analysis panel component
 * Displays comprehensive analysis of sleep data including metrics,
 * sleep stages, recommendations, and insights
 * 
 * @param {Object} props 
 * @param {Array} props.data - Sleep data points
 * @param {string} props.period - Time period ('day', 'week', 'month')
 * @returns {JSX.Element}
 */
const SleepAnalysisPanel = ({ data, period }) => {
  const theme = useTheme();
  const [analysisMode, setAnalysisMode] = useState('basic');
  
  // Calculate metrics using actual data from the chart
  const sleepMetrics = useMemo(() => 
    calculateAdvancedSleepMetrics(data), [data]
  );
  
  // Calculate average sleep stats
  const avgSleepScore = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.score || 0) > 0)
      .map(item => item.score);
    if (validValues.length === 0) return 0;
    return Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length);
  }, [data]);
  
  const avgSleepDuration = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.durationMinutes || 0) > 0)
      .map(item => item.durationMinutes);
    if (validValues.length === 0) return 0;
    return Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length);
  }, [data]);
  
  const avgEfficiency = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.efficiency || 0) > 0)
      .map(item => item.efficiency);
    if (validValues.length === 0) return 0;
    return Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length);
  }, [data]);
  
  // Calculate sleep stage percentages
  const sleepStages = useMemo(() => {
    const stages = [
      { 
        name: 'Deep Sleep',
        value: calculateAverage(data, 'deepPercent') || 20,
        color: theme.palette.primary.main,
        icon: <WavesIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />,
        description: 'Restorative sleep that helps memory and learning'
      },
      { 
        name: 'REM Sleep',
        value: calculateAverage(data, 'remPercent') || 25,
        color: theme.palette.secondary.main,
        icon: <PsychologyIcon fontSize="small" sx={{ color: theme.palette.secondary.main }} />,
        description: 'Dreaming sleep important for cognitive function'
      },
      { 
        name: 'Light Sleep',
        value: calculateAverage(data, 'lightPercent') || 55,
        color: theme.palette.info.main,
        icon: <NightsStayIcon fontSize="small" sx={{ color: theme.palette.info.main }} />,
        description: 'Transitional sleep stage'
      }
    ];
    
    return stages;
  }, [data, theme]);
  
  // Calculate sleep quality score
  const sleepQualityScore = useMemo(() => {
    if (!data || data.length === 0) return 70; // Default score with insufficient data
    
    // Start with base score
    let score = avgSleepScore;
    if (score === 0) score = 70; // Default if no explicit score
    
    // Adjust for sleep duration (7-9 hours optimal)
    if (avgSleepDuration > 0) {
      if (avgSleepDuration >= 420 && avgSleepDuration <= 540) score += 10;
      else if (avgSleepDuration >= 360 && avgSleepDuration < 420) score += 5;
      else if (avgSleepDuration > 540) score -= 5; // Too much sleep
      else if (avgSleepDuration < 360) score -= 10; // Too little sleep
    }
    
    // Adjust for sleep efficiency
    if (avgEfficiency > 0) {
      if (avgEfficiency >= 90) score += 10;
      else if (avgEfficiency >= 85) score += 5;
      else if (avgEfficiency < 75) score -= 10;
    }
    
    // Adjust for sleep stages
    const deepSleepPercent = sleepStages[0].value;
    const remSleepPercent = sleepStages[1].value;
    
    if (deepSleepPercent >= 20) score += 5;
    if (deepSleepPercent < 10) score -= 5;
    
    if (remSleepPercent >= 20) score += 5;
    if (remSleepPercent < 15) score -= 5;
    
    // Ensure score is between 0 and 100
    return Math.max(10, Math.min(100, score));
  }, [avgSleepScore, avgSleepDuration, avgEfficiency, sleepStages]);
  
  // Sleep quality assessment
  const sleepQualityAssessment = useMemo(() => {
    if (sleepQualityScore >= 90) return { status: "Excellent", color: theme.palette.success.main };
    if (sleepQualityScore >= 80) return { status: "Very Good", color: theme.palette.info.main };
    if (sleepQualityScore >= 70) return { status: "Good", color: theme.palette.primary.main };
    if (sleepQualityScore >= 60) return { status: "Fair", color: theme.palette.warning.main };
    return { status: "Poor", color: theme.palette.error.main };
  }, [sleepQualityScore, theme]);
  
  // Sleep pattern abnormalities
  const sleepAbnormalities = useMemo(() => {
    return detectSleepAbnormalities(data) || [];
  }, [data]);
  
  // Generate data-driven insights based on mode
  const getInsights = () => {
    // Extract sleep patterns
    const avgDeepSleep = sleepStages[0].value;
    const avgRemSleep = sleepStages[1].value;
    const avgLightSleep = sleepStages[2].value;
    
    switch (analysisMode) {
      case 'quality':
        return {
          title: "Sleep Quality Analysis",
          insights: [
            {
              point: "Sleep Architecture",
              detail: avgDeepSleep >= 20 
                ? "Healthy deep sleep percentage indicates good physical recovery." 
                : "Lower deep sleep percentage may reduce physical recovery benefits."
            },
            {
              point: "Sleep Efficiency",
              detail: avgEfficiency >= 85 
                ? "Good sleep efficiency indicates minimal sleep disruptions." 
                : "Lower sleep efficiency suggests sleep continuity issues."
            },
            {
              point: "Overall Quality",
              detail: avgSleepScore >= 80 
                ? "Metrics suggest high-quality restorative sleep." 
                : avgSleepScore >= 70 
                  ? "Moderate quality sleep with room for improvement." 
                  : "Sleep quality could benefit from improvement strategies."
            }
          ]
        };
        
      case 'cycles':
        return {
          title: "Sleep Cycles Analysis",
          insights: [
            {
              point: "Deep Sleep Distribution",
              detail: `${avgDeepSleep}% of sleep in deep stage. ${avgDeepSleep >= 20 ? "This is optimal for physical recovery." : "This is below optimal levels for physical recovery."}`
            },
            {
              point: "REM Sleep Patterns",
              detail: `${avgRemSleep}% of sleep in REM stage. ${avgRemSleep >= 20 ? "This is good for cognitive processing and memory consolidation." : "This is below optimal levels for cognitive function."}`
            },
            {
              point: "Sleep Cycle Balance",
              detail: (avgDeepSleep >= 15 && avgRemSleep >= 20) 
                ? "Well-balanced sleep cycle distribution supporting both physical and mental recovery." 
                : "Sleep cycle distribution shows room for improvement to better support recovery needs."
            }
          ]
        };
        
      case 'health':
        return {
          title: "Health Impact Analysis",
          insights: [
            {
              point: "Recovery Potential",
              detail: avgSleepDuration >= 420 
                ? "Sleep duration supports adequate recovery for most physiological processes." 
                : "Sleep duration may be insufficient for optimal physiological recovery."
            },
            {
              point: "Immune Support",
              detail: (avgDeepSleep >= 20 && avgSleepDuration >= 420) 
                ? "Sleep pattern supports immune function through sufficient deep sleep." 
                : "Sleep metrics suggest potential for reduced immune support."
            },
            {
              point: "Cognitive Function",
              detail: (avgRemSleep >= 20 && avgSleepDuration >= 420) 
                ? "Sleep pattern supports optimal cognitive function and memory consolidation." 
                : "Sleep metrics suggest potential for reduced cognitive benefits."
            }
          ]
        };
        
      case 'patterns':
        return {
          title: "Sleep Pattern Analysis",
          insights: [
            {
              point: "Sleep Consistency",
              detail: sleepAbnormalities.length === 0 
                ? "Consistent sleep patterns detected, supporting circadian rhythm health." 
                : `${sleepAbnormalities.length} sleep pattern irregularities detected, which may affect circadian health.`
            },
            {
              point: "Sleep Duration Stability",
              detail: calculateDurationVariability(data) < 60 
                ? "Consistent sleep duration helps maintain regular sleep-wake cycles." 
                : "Variable sleep duration may disrupt regular sleep-wake cycles."
            },
            {
              point: "Sleep-Wake Transition",
              detail: avgEfficiency >= 85 
                ? "Smooth sleep-wake transitions indicated by high sleep efficiency." 
                : "Potential sleep-wake transition disruptions indicated by lower efficiency."
            }
          ]
        };
        
      case 'research':
        return {
          title: "Advanced Sleep Metrics",
          insights: [
            {
              point: "Sleep Architecture Analysis",
              detail: `Deep: ${avgDeepSleep}%, REM: ${avgRemSleep}%, Light: ${avgLightSleep}%. This distribution is ${isOptimalSleepDistribution(avgDeepSleep, avgRemSleep, avgLightSleep) ? "within" : "outside"} optimal research parameters.`
            },
            {
              point: "Sleep Continuity Index",
              detail: `${avgEfficiency}% efficiency with ${calculateWakeEpisodes(data)} wake episodes. Research indicates ${avgEfficiency >= 85 ? "good" : "compromised"} sleep continuity.`
            },
            {
              point: "Chronotype Alignment",
              detail: "Sleep timing data suggests alignment with natural chronotype. Consistent timing supports circadian health."
            }
          ]
        };
        
      case 'personalized':
        return {
          title: "Personalized Sleep Assessment",
          insights: [
            {
              point: "Your Sleep Profile",
              detail: `Based on your patterns, your sleep profile shows ${sleepQualityScore > 80 ? "excellent" : sleepQualityScore > 70 ? "good" : "moderate"} quality with ${avgDeepSleep > 20 ? "good" : "developing"} deep sleep architecture.`
            },
            {
              point: "Recovery Pattern",
              detail: avgSleepDuration >= 480 
                ? "Your extended sleep duration suggests prioritization of recovery." 
                : avgSleepDuration >= 420 
                  ? "Your sleep duration supports baseline recovery needs." 
                  : "Your shorter sleep duration may limit optimal recovery."
            },
            {
              point: "Personal Trend",
              detail: "This assessment represents your current sleep patterns. Regular monitoring will help identify personal trends and progress."
            }
          ]
        };
        
      case 'basic':
      default:
        return {
          title: "Basic Sleep Analysis",
          insights: [
            {
              point: "Overview",
              detail: `Your sleep averaged ${formatDuration(avgSleepDuration)} with ${avgEfficiency}% efficiency. ${avgSleepDuration >= 420 ? "This supports healthy recovery." : "More sleep might improve recovery."}`
            },
            {
              point: "Sleep Stage Distribution",
              detail: `Deep sleep: ${avgDeepSleep}%, REM: ${avgRemSleep}%, Light: ${avgLightSleep}%. ${(avgDeepSleep >= 20 && avgRemSleep >= 20) ? "Good balance of sleep stages detected." : "Sleep stage distribution could be improved."}`
            },
            {
              point: "Sleep Quality",
              detail: sleepQualityAssessment.status === "Excellent" || sleepQualityAssessment.status === "Very Good"
                ? "Your metrics indicate high-quality sleep." 
                : sleepQualityAssessment.status === "Good"
                  ? "Your metrics indicate good quality sleep with room for improvement." 
                  : "Your metrics suggest opportunities to improve sleep quality."
            }
          ]
        };
    }
  };
  
  // Personalized recommendations based on data analysis and selected mode
  const getRecommendations = () => {
    const recommendations = [];
    
    // Base recommendations on sleep quality and duration
    if (avgSleepDuration < 360 || sleepQualityScore < 60) {
      recommendations.push({
        title: "Prioritize Sleep Duration",
        description: "Your sleep metrics indicate insufficient rest. Aim to increase sleep duration by 30-60 minutes.",
        icon: <HotelIcon fontSize="small" color="warning" />
      });
    } else if (avgSleepDuration < 420 || sleepQualityScore < 70) {
      recommendations.push({
        title: "Optimize Sleep Schedule",
        description: "Your metrics indicate adequate but not optimal sleep. Consistent sleep/wake times may help improve quality.",
        icon: <BedtimeIcon fontSize="small" color="info" />
      });
    } else {
      recommendations.push({
        title: "Maintain Sleep Habits",
        description: "Your metrics indicate good sleep quality and duration. Continue your current sleep hygiene practices.",
        icon: <NightsStayIcon fontSize="small" color="success" />
      });
    }
    
    // Based on abnormalities
    if (sleepAbnormalities.length > 0) {
      recommendations.push({
        title: "Address Sleep Disruptions",
        description: `${sleepAbnormalities.length} sleep pattern abnormalit${sleepAbnormalities.length > 1 ? 'ies' : 'y'} detected. Consider environment and pre-sleep routine improvements.`,
        icon: <WarningIcon fontSize="small" color="warning" />
      });
    }
    
    // Mode-specific recommendations
    switch(analysisMode) {
      case 'quality':
        if (sleepStages[0].value < 20) {
          recommendations.push({
            title: "Improve Deep Sleep",
            description: "Your deep sleep percentage is below optimal. Regular exercise and reducing alcohol consumption may help increase deep sleep.",
            icon: <WavesIcon fontSize="small" color="primary" />
          });
        } else if (sleepStages[1].value < 20) {
          recommendations.push({
            title: "Support REM Sleep",
            description: "Your REM sleep percentage is below optimal. Regular sleep schedule and stress management may help improve REM sleep.",
            icon: <PsychologyIcon fontSize="small" color="secondary" />
          });
        }
        break;
        
      case 'health':
        if (avgEfficiency < 85) {
          recommendations.push({
            title: "Address Sleep Continuity",
            description: "Your sleep efficiency suggests frequent awakenings. Consider environmental factors and avoid stimulants before bed.",
            icon: <HealthAndSafetyIcon fontSize="small" color="warning" />
          });
        }
        break;
        
      case 'cycles':
        recommendations.push({
          title: sleepStages[0].value >= 20 ? "Maintain Sleep Architecture" : "Improve Sleep Architecture",
          description: sleepStages[0].value >= 20 
            ? "Your sleep cycle distribution is healthy. Continue with consistent sleep schedule to maintain it." 
            : "To improve sleep architecture, consider earlier bedtime and limiting evening blue light exposure.",
          icon: <WavesIcon fontSize="small" color={sleepStages[0].value >= 20 ? "success" : "info"} />
        });
        break;
        
      case 'patterns':
        recommendations.push({
          title: "Strengthen Circadian Rhythm",
          description: "For optimal sleep patterns, maintain consistent sleep-wake times, get morning sunlight exposure, and limit evening blue light.",
          icon: <LightModeIcon fontSize="small" color="info" />
        });
        break;
        
      case 'research':
        // More technical recommendations
        recommendations.push({
          title: "Optimize Sleep Environment",
          description: `Based on your sleep efficiency (${avgEfficiency}%), optimizing bedroom temperature (65-68°F/18-20°C) and reducing noise may improve sleep architecture.`,
          icon: <SchoolIcon fontSize="small" color="info" />
        });
        break;
        
      case 'personalized':
        // Unique personalized recommendation based on overall profile
        recommendations.push({
          title: sleepQualityScore > 80 ? "Maintain Your Edge" : "Build Sleep Quality",
          description: sleepQualityScore > 80 
            ? "Your sleep profile is excellent. Focus on maintaining this quality while ensuring consistent duration." 
            : "Your metrics suggest focusing on sleep consistency and pre-sleep routine to build better sleep quality.",
          icon: <AutoAwesomeIcon fontSize="small" color={sleepQualityScore > 80 ? "success" : "info"} />
        });
        break;
        
      case 'basic':
      default:
        // Nutrition recommendation for basic mode
        recommendations.push({
          title: "Support Sleep Nutrition",
          description: "Consider limiting caffeine after noon and avoiding heavy meals within 3 hours of bedtime. Magnesium-rich foods may support sleep quality.",
          icon: <RestaurantIcon fontSize="small" color="info" />
        });
    }
    
    return recommendations;
  };
  
  const insightsData = getInsights();
  const recommendations = getRecommendations();
  
  return (
    <Box sx={{ mt: 3 }}>
      {/* Analysis Mode Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={analysisMode} 
          onChange={(e, newValue) => setAnalysisMode(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="sleep analysis mode tabs"
        >
          {ANALYSIS_MODES.map(mode => (
            <Tab 
              key={mode.value}
              label={mode.label} 
              value={mode.value} 
              icon={mode.icon} 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          ))}
        </Tabs>
      </Box>
      
      {/* Main analysis panels */}
      <Grid container spacing={3}>
        {/* Sleep Quality Score */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
              <BedtimeIcon color="primary" /> Sleep Quality Score
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1, position: 'relative' }}>
              <Box sx={{ position: 'relative', width: 150, height: 150 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={150}
                  thickness={5}
                  sx={{ color: alpha(theme.palette.grey[200], 0.5), position: 'absolute' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={sleepQualityScore}
                  size={150}
                  thickness={5}
                  sx={{ 
                    color: sleepQualityScore > 80 ? theme.palette.success.main : 
                           sleepQualityScore > 70 ? theme.palette.info.main : 
                           sleepQualityScore > 60 ? theme.palette.warning.main : 
                           theme.palette.error.main,
                    position: 'absolute'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h3" component="div" color="text.primary" fontWeight="bold">
                    {sleepQualityScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    out of 100
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Based on your sleep duration, efficiency, and sleep stage distribution.
              </Typography>
              
              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip 
                  label={`Quality: ${sleepQualityAssessment.status}`} 
                  size="small" 
                  color={
                    sleepQualityAssessment.status === "Excellent" ? "success" : 
                    sleepQualityAssessment.status === "Very Good" ? "success" : 
                    sleepQualityAssessment.status === "Good" ? "info" : 
                    sleepQualityAssessment.status === "Fair" ? "warning" : "error"
                  }
                  sx={{ fontWeight: 'medium' }}
                />
                <Chip 
                  label={`Duration: ${formatDuration(avgSleepDuration)}`} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Sleep Stages Distribution */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
              <WavesIcon color="primary" /> Sleep Stages
            </Typography>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {sleepStages.map((stage) => (
                <Box key={stage.name} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {stage.icon} {stage.name}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {stage.value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stage.value} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(stage.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: stage.color,
                        borderRadius: 4
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {stage.description}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Distribution of sleep stages during your average sleep cycle.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Key Metrics */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%', 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff, #f9f9f9)'
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
              <NightsStayIcon color="primary" /> Sleep Metrics
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {Math.floor(avgSleepDuration / 60)}h {avgSleepDuration % 60}m
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Average</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Efficiency</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {avgEfficiency}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Sleep Quality</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.secondary.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Deep Sleep</Typography>
                  <Typography variant="h5" fontWeight="bold" color="secondary.main">
                    {formatDuration(avgSleepDuration * sleepStages[0].value / 100)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Average</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">REM Sleep</Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {formatDuration(avgSleepDuration * sleepStages[1].value / 100)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Average</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Sleep Abnormalities */}
            {sleepAbnormalities.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <WarningIcon fontSize="small" /> Sleep Pattern Anomalies
                </Typography>
                
                <Stack spacing={1}>
                  {sleepAbnormalities.map((abnormality, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: alpha(theme.palette.warning.light, 0.1),
                        border: `1px dashed ${theme.palette.warning.light}`,
                        fontSize: '0.8rem'
                      }}
                    >
                      {abnormality.type}: {abnormality.detail}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Mode-specific insights */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mt: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f8f9fa, #f1f3f5)'
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
          <ScienceIcon color="primary" /> {insightsData.title}
        </Typography>
        
        <Grid container spacing={2}>
          {insightsData.insights.map((insight, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  {insight.point}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {insight.detail}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* AI Recommendations */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mt: 3, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f5f9ff, #f0f4fa)'
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
          <AutoAwesomeIcon color="primary" /> Sleep Recommendations
        </Typography>
        
        <Grid container spacing={2}>
          {recommendations.map((rec, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {rec.icon}
                  <Typography variant="subtitle2" fontWeight="bold">
                    {rec.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {rec.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          Recommendations based on sleep metrics, patterns, and quality analysis.
          This is not medical advice. Consult with a healthcare professional for personalized guidance.
        </Typography>
      </Paper>
    </Box>
  );
};

// Helper functions for sleep analysis

// Calculate average value from data array for a specific property
function calculateAverage(data, property) {
  if (!data || !Array.isArray(data) || data.length === 0) return 0;
  
  const validValues = data
    .filter(item => item[property] !== undefined && item[property] !== null)
    .map(item => item[property]);
    
  if (validValues.length === 0) return 0;
  return Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length);
}

// Calculate advanced sleep metrics from raw data
function calculateAdvancedSleepMetrics(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      avgDuration: 0,
      avgEfficiency: 0,
      avgScore: 0,
      avgDeepSleep: 0,
      avgRemSleep: 0,
      avgLightSleep: 0,
      avgAwakeTime: 0,
      consistency: 0
    };
  }
  
  // Calculate various metrics
  const avgDuration = calculateAverage(data, 'durationMinutes');
  const avgEfficiency = calculateAverage(data, 'efficiency');
  const avgScore = calculateAverage(data, 'score');
  const avgDeepSleep = calculateAverage(data, 'deepSleepMinutes');
  const avgRemSleep = calculateAverage(data, 'remSleepMinutes');
  const avgLightSleep = calculateAverage(data, 'lightSleepMinutes');
  const avgAwakeTime = calculateAverage(data, 'awakeDuringNight');
  
  // Calculate sleep consistency (lower standard deviation is better)
  const durationConsistency = calculateDurationVariability(data);
  
  return {
    avgDuration,
    avgEfficiency,
    avgScore,
    avgDeepSleep,
    avgRemSleep,
    avgLightSleep,
    avgAwakeTime,
    durationConsistency
  };
}

// Calculate duration variability (standard deviation)
function calculateDurationVariability(data) {
  if (!data || !Array.isArray(data) || data.length < 2) return 0;
  
  const durations = data
    .filter(item => (item.durationMinutes || 0) > 0)
    .map(item => item.durationMinutes);
    
  if (durations.length < 2) return 0;
  
  const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
  
  return Math.round(Math.sqrt(variance));
}

// Count wake episodes during sleep
function calculateWakeEpisodes(data) {
  if (!data || !Array.isArray(data) || data.length === 0) return 0;
  
  // Sum the awake episodes across all days
  const totalEpisodes = data.reduce((sum, item) => sum + (item.awakeDuringNight || 0), 0);
  
  // Return average episodes per night
  return Math.round(totalEpisodes / data.length);
}

// Check if sleep stage distribution is optimal
function isOptimalSleepDistribution(deepPercent, remPercent, lightPercent) {
  return (
    deepPercent >= 20 && deepPercent <= 25 &&
    remPercent >= 20 && remPercent <= 25 &&
    lightPercent >= 50 && lightPercent <= 60
  );
}

// Format duration as hours and minutes
function formatDuration(minutes) {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Detect sleep pattern abnormalities
function detectSleepAbnormalities(data) {
  if (!data || !Array.isArray(data) || data.length < 3) return [];
  
  const abnormalities = [];
  
  // Check for insufficient deep sleep
  const avgDeepSleep = calculateAverage(data, 'deepPercent');
  if (avgDeepSleep < 15) {
    abnormalities.push({
      type: 'Insufficient Deep Sleep',
      detail: `Average ${avgDeepSleep}% is below recommended 15-20%`,
      severity: 'Medium'
    });
  }
  
  // Check for insufficient REM sleep
  const avgRemSleep = calculateAverage(data, 'remPercent');
  if (avgRemSleep < 15) {
    abnormalities.push({
      type: 'Low REM Sleep',
      detail: `Average ${avgRemSleep}% is below recommended 20-25%`,
      severity: 'Medium'
    });
  }
  
  // Check for low sleep efficiency
  const avgEfficiency = calculateAverage(data, 'efficiency');
  if (avgEfficiency < 80) {
    abnormalities.push({
      type: 'Poor Sleep Efficiency',
      detail: `${avgEfficiency}% efficiency indicates disrupted sleep`,
      severity: avgEfficiency < 70 ? 'High' : 'Medium'
    });
  }
  
  // Check for high sleep duration variability
  const durationVariability = calculateDurationVariability(data);
  if (durationVariability > 90) {
    abnormalities.push({
      type: 'Inconsistent Sleep Duration',
      detail: `Variability of ${durationVariability}min suggests irregular schedule`,
      severity: durationVariability > 120 ? 'High' : 'Medium'
    });
  }
  
  // Check for excessive awakenings
  const avgAwakenings = calculateWakeEpisodes(data);
  if (avgAwakenings > 3) {
    abnormalities.push({
      type: 'Frequent Awakenings',
      detail: `Average ${avgAwakenings} awakenings per night`,
      severity: avgAwakenings > 5 ? 'High' : 'Medium'
    });
  }
  
  // Limit to top 3 abnormalities
  return abnormalities.sort((a, b) => {
    // Sort by severity first
    const severityScore = { High: 3, Medium: 2, Low: 1 };
    return severityScore[b.severity] - severityScore[a.severity];
  }).slice(0, 3);
}

export default SleepAnalysisPanel;