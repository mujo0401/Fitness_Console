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
import { 
  HR_ZONES, 
  ANALYSIS_MODES 
} from '../../../constants/heartRateConstants';
import { 
  calculateHRV, 
  calculateAdvancedHeartMetrics, 
  calculateZoneDistribution 
} from '../../../utils/heartRateUtils';

// Icons
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningIcon from '@mui/icons-material/Warning';
import ScienceIcon from '@mui/icons-material/Science';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

/**
 * Heart rate analysis panel component
 * Displays comprehensive analysis of heart rate data including metrics,
 * zone distribution, recommendations, and insights
 * 
 * @param {Object} props 
 * @param {Array} props.data - Heart rate data points
 * @param {string} props.period - Time period ('day', 'week', 'month')
 * @returns {JSX.Element}
 */
const HeartRateAnalysisPanel = ({ data, period }) => {
  const theme = useTheme();
  const [analysisMode, setAnalysisMode] = useState('basic');
  
  // Calculate metrics using actual data from the chart
  const heartMetrics = useMemo(() => 
    calculateAdvancedHeartMetrics(data), [data]
  );
  
  const hrvValue = useMemo(() => calculateHRV(data), [data]);
  const hrRecovery = useMemo(() => calculateHRRecovery(data), [data]);
  const abnormalPatterns = useMemo(() => detectAbnormalPatterns(data), [data]);
  
  // Calculate average, min, max heart rates
  const avgHR = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.avg || 0) > 0)
      .map(item => item.avg);
    if (validValues.length === 0) return 0;
    return Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length);
  }, [data]);
  
  const maxHR = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.max || item.avg || 0) > 0)
      .map(item => item.max || item.avg);
    if (validValues.length === 0) return 0;
    return Math.max(...validValues);
  }, [data]);
  
  const minHR = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.min || item.avg || 0) > 0)
      .map(item => item.min || item.avg);
    if (validValues.length === 0) return 0;
    return Math.min(...validValues);
  }, [data]);
  
  const restingHR = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validValues = data
      .filter(item => (item.restingHeartRate || 0) > 0)
      .map(item => item.restingHeartRate);
    if (validValues.length === 0) {
      // If no explicit resting HR, estimate from lowest 10% of values
      const sortedValues = [...data]
        .filter(item => (item.avg || item.value || 0) > 30) // Filter out likely errors
        .map(item => item.avg || item.value)
        .sort((a, b) => a - b);
      
      if (sortedValues.length > 0) {
        // Average the lowest 10% of values as an estimation
        const lowestIndex = Math.floor(sortedValues.length * 0.1);
        const lowestValues = sortedValues.slice(0, Math.max(1, lowestIndex));
        return Math.round(lowestValues.reduce((sum, val) => sum + val, 0) / lowestValues.length);
      }
      return 0;
    }
    return Math.round(validValues.reduce((sum, val) => sum + val, 0) / validValues.length);
  }, [data]);
  
  // Calculate time in each zone - dynamically from actual data
  const zoneDistribution = useMemo(() => {
    return calculateZoneDistribution(data);
  }, [data]);
  
  // Calculate score based on heart rate metrics (0-100)
  const cardioFitnessScore = useMemo(() => {
    if (!data || data.length < 10) return 70; // Default score with insufficient data
    
    // Start with base score of 70
    let score = 70;
    
    // Adjust for resting heart rate (lower is better)
    if (restingHR > 0) {
      if (restingHR < 50) score += 15;
      else if (restingHR < 60) score += 10;
      else if (restingHR < 70) score += 5;
      else if (restingHR > 80) score -= 5;
      else if (restingHR > 90) score -= 10;
    }
    
    // Adjust for HRV (higher is better)
    if (hrvValue > 0) {
      if (hrvValue > 50) score += 15;
      else if (hrvValue > 30) score += 10;
      else if (hrvValue > 20) score += 5;
      else if (hrvValue < 10) score -= 5;
    }
    
    // Adjust for recovery rate (higher is better)
    if (hrRecovery > 0) {
      if (hrRecovery > 30) score += 10;
      else if (hrRecovery > 20) score += 5;
    }
    
    // Penalize for abnormal patterns
    score -= abnormalPatterns.length * 5;
    
    // Data quality adjustments
    const dataPoints = data.length;
    if (dataPoints < 50) score -= 10; // Penalize for limited data
    else if (dataPoints > 300) score += 5; // Bonus for rich data
    
    // Zone distribution - reward balanced activity
    const zoneSum = zoneDistribution.reduce((sum, zone) => 
      sum + (zone.name === 'Rest' ? 0 : zone.value), 0);
    
    if (zoneSum > 30) score += 5; // Decent amount of activity
    
    // Ensure score is between 0 and 100
    return Math.max(10, Math.min(100, score));
  }, [restingHR, hrvValue, hrRecovery, abnormalPatterns, data, zoneDistribution]);
  
  // Get recovery status based on HRV and abnormal patterns
  const recoveryStatus = useMemo(() => {
    if (hrvValue < 10 || abnormalPatterns.length > 1) return "Needs Recovery";
    if (hrvValue < 20 || abnormalPatterns.length > 0) return "Moderate";
    if (hrvValue >= 30) return "Well Recovered";
    return "Good";
  }, [hrvValue, abnormalPatterns]);
  
  // Generate data-driven insights based on mode
  const getInsights = () => {
    // Extract activity patterns
    const activeZones = zoneDistribution
      .filter(z => z.name !== 'Rest' && z.name !== 'Fat Burn')
      .reduce((sum, zone) => sum + zone.value, 0);
      
    const timeInPeak = zoneDistribution
      .filter(z => z.name === 'Peak' || z.name === 'Extreme')
      .reduce((sum, zone) => sum + zone.value, 0);
    
    const timeInRest = zoneDistribution
      .find(z => z.name === 'Rest')?.value || 0;
      
    switch (analysisMode) {
      case 'athletic':
        return {
          title: "Athletic Performance",
          insights: [
            {
              point: "Training Load",
              detail: timeInPeak > 20 
                ? "High intensity training detected, watch for signs of overtraining" 
                : "Moderate training load detected, good for consistent progress"
            },
            {
              point: "Recovery Quality",
              detail: hrvValue > 25 
                ? "Good HRV indicates effective recovery between sessions" 
                : "Lower HRV suggests you may need more recovery time"
            },
            {
              point: "Training Readiness",
              detail: recoveryStatus === "Well Recovered" 
                ? "Metrics suggest you're ready for a high intensity session" 
                : recoveryStatus === "Good" 
                  ? "Ready for moderate intensity training" 
                  : "Consider an active recovery or rest day"
            }
          ]
        };
        
      case 'medical':
        return {
          title: "Health Metrics",
          insights: [
            {
              point: "Cardiac Workload",
              detail: `Your heart worked at ${activeZones > 30 ? "significant" : "moderate"} intensity. ${activeZones > 50 ? "Consider more recovery time." : ""}`
            },
            {
              point: "Rhythm Patterns",
              detail: abnormalPatterns.length > 0 
                ? `${abnormalPatterns.length} potential rhythm anomalies detected. Consider monitoring if persistent.` 
                : "No significant rhythm irregularities detected in this data set."
            },
            {
              point: "Resting Heart Rate",
              detail: restingHR < 60 
                ? "Below 60 BPM suggests good cardiovascular efficiency." 
                : restingHR < 70 
                  ? "Within normal range." 
                  : "Slightly elevated. Consider factors like stress, caffeine, or medication."
            }
          ]
        };
        
      case 'stress':
        return {
          title: "Stress Analysis",
          insights: [
            {
              point: "Stress Indicators",
              detail: hrvValue < 20 
                ? "Lower HRV suggests elevated sympathetic nervous system activity, a marker of stress." 
                : "HRV within expected range suggests manageable stress levels."
            },
            {
              point: "Recovery Capability",
              detail: recoveryStatus === "Needs Recovery" 
                ? "Limited recovery capacity detected. Consider stress reduction techniques." 
                : "Adequate stress resilience based on current metrics."
            },
            {
              point: "Autonomic Balance",
              detail: timeInRest > 60 
                ? "High percentage of time in resting zone suggests good parasympathetic tone." 
                : "Consider activities that promote parasympathetic activation like deep breathing."
            }
          ]
        };
        
      case 'sleep':
        return {
          title: "Sleep Quality Indicators",
          insights: [
            {
              point: "Nocturnal Recovery",
              detail: hrvValue > 30 
                ? "Higher HRV suggests effective nocturnal recovery and good sleep quality." 
                : "Lower HRV may indicate disrupted sleep architecture or insufficient deep sleep."
            },
            {
              point: "Resting Patterns",
              detail: restingHR < 60 
                ? "Lower resting heart rate suggests efficient cardiac function during rest." 
                : "Higher resting heart rate may indicate factors affecting sleep quality."
            },
            {
              point: "Overnight Variability",
              detail: abnormalPatterns.length > 0 
                ? "Detected variations may suggest disrupted sleep cycles or breathing patterns." 
                : "Consistent patterns suggest stable sleep architecture."
            }
          ]
        };
        
      case 'recovery':
        return {
          title: "Recovery Assessment",
          insights: [
            {
              point: "Cardiovascular Recovery",
              detail: hrRecovery > 25 
                ? "Excellent heart rate recovery suggests good cardiovascular fitness." 
                : hrRecovery > 15 
                  ? "Moderate recovery rate is within expected range." 
                  : "Limited recovery rate may indicate fatigue or overtraining."
            },
            {
              point: "Autonomic Nervous System",
              detail: hrvValue > 25 
                ? "Good heart rate variability indicates parasympathetic recovery." 
                : "Room for improvement in nervous system recovery."
            },
            {
              point: "Readiness Score",
              detail: cardioFitnessScore > 80 
                ? "Metrics suggest optimal recovery status." 
                : cardioFitnessScore > 60 
                  ? "Moderate recovery status, proceed with caution." 
                  : "Limited recovery, consider prioritizing rest."
            }
          ]
        };
        
      case 'research':
        return {
          title: "Advanced Metrics Analysis",
          insights: [
            {
              point: "Heart Rate Variability",
              detail: `RMSSD: ${hrvValue}ms. ${hrvValue > 30 ? "Above average variability suggesting good autonomic function." : "Lower variability suggests increased sympathetic activation."}`
            },
            {
              point: "Zone Distribution Analysis",
              detail: `${zoneDistribution.map(z => `${z.name}: ${z.value}%`).join(', ')}. This pattern indicates ${timeInPeak > 20 ? "significant cardiac strain" : "moderate cardiovascular demand"}.`
            },
            {
              point: "Cardiac Efficiency Ratio",
              detail: `Ratio of ${(maxHR/restingHR).toFixed(1)} (max/resting HR). ${(maxHR/restingHR) > 2.2 ? "Indicates good cardiac reserve capacity." : "Suggests room for cardiac efficiency improvement."}`
            }
          ]
        };
        
      case 'personalized':
        return {
          title: "Personalized Assessment",
          insights: [
            {
              point: "Your Fitness Fingerprint",
              detail: `Based on your unique patterns, your cardiovascular profile shows ${cardioFitnessScore > 75 ? "excellent" : cardioFitnessScore > 60 ? "good" : "moderate"} efficiency with ${hrvValue > 30 ? "good" : "developing"} recovery capacity.`
            },
            {
              point: "Activity Pattern",
              detail: activeZones > 40 
                ? "Your data shows significant time in active zones, suggesting an intense activity profile." 
                : activeZones > 20 
                  ? "Your data shows a balanced distribution between rest and activity." 
                  : "Your data suggests predominantly low-intensity activity patterns."
            },
            {
              point: "Personal Trend",
              detail: "This snapshot represents your current cardiovascular state. Regular monitoring will help identify personal trends and progress over time."
            }
          ]
        };
        
      case 'basic':
      default:
        return {
          title: "Basic Heart Rate Analysis",
          insights: [
            {
              point: "Overview",
              detail: `Your heart rate averaged ${avgHR} BPM with peaks at ${maxHR} BPM. ${avgHR < 70 ? "This suggests good cardiac efficiency." : ""}`
            },
            {
              point: "Zone Distribution",
              detail: `You spent ${timeInRest}% in rest, ${100-timeInRest}% in active zones. ${activeZones > 30 ? "Good activity level detected." : "Consider more time in active zones for cardiovascular benefits."}`
            },
            {
              point: "Recovery Status",
              detail: recoveryStatus === "Well Recovered" 
                ? "Your metrics indicate good recovery status." 
                : recoveryStatus === "Good" 
                  ? "Reasonable recovery detected." 
                  : "Your metrics suggest you may need more recovery time."
            }
          ]
        };
    }
  };
  
  // Personalized recommendations based on data analysis and selected mode
  const getRecommendations = () => {
    const recommendations = [];
    
    // Base recommendations on HRV and recovery status
    if (hrvValue < 10 || recoveryStatus === "Needs Recovery") {
      recommendations.push({
        title: "Prioritize Recovery",
        description: "Your heart rate metrics indicate you need rest. Focus on sleep and gentle movement today.",
        icon: <NightsStayIcon fontSize="small" color="primary" />
      });
    } else if (hrvValue < 20 || recoveryStatus === "Moderate") {
      recommendations.push({
        title: "Light to Moderate Activity",
        description: "Your metrics indicate moderate recovery. Keep intensity lower today and focus on technique.",
        icon: <DirectionsRunIcon fontSize="small" color="info" />
      });
    } else {
      recommendations.push({
        title: "Ready for Intensity",
        description: "Your metrics indicate good recovery. High intensity training would be well tolerated today.",
        icon: <LocalFireDepartmentIcon fontSize="small" color="success" />
      });
    }
    
    // Based on abnormal patterns
    if (abnormalPatterns.length > 0) {
      recommendations.push({
        title: "Monitor Heart Rhythm",
        description: `${abnormalPatterns.length} unusual heart rate pattern${abnormalPatterns.length > 1 ? 's' : ''} detected. Consider monitoring more closely.`,
        icon: <WarningIcon fontSize="small" color="warning" />
      });
    }
    
    // Mode-specific recommendations
    switch(analysisMode) {
      case 'athletic':
        if (zoneDistribution.find(z => z.name === 'Peak')?.value > 15) {
          recommendations.push({
            title: "Balance Training Load",
            description: "You've spent significant time in high intensity zones. Consider incorporating more zone 2 training for aerobic development.",
            icon: <HealthAndSafetyIcon fontSize="small" color="info" />
          });
        } else if (zoneDistribution.find(z => z.name === 'Cardio')?.value > 40) {
          recommendations.push({
            title: "Add High Intensity Intervals",
            description: "Your cardio zone work is solid. Adding short peak intervals could improve power and VO2 max.",
            icon: <DirectionsRunIcon fontSize="small" color="success" />
          });
        }
        break;
        
      case 'medical':
        if (avgHR > 80) {
          recommendations.push({
            title: "Consider Heart Health Factors",
            description: "Your average heart rate is elevated. Review factors like caffeine, stress, medication, or consult a healthcare professional.",
            icon: <HealthAndSafetyIcon fontSize="small" color="warning" />
          });
        }
        if (restingHR > 80) {
          recommendations.push({
            title: "Focus on Lowering Resting HR",
            description: "Your resting heart rate is elevated. Regular aerobic exercise and stress management can help reduce it over time.",
            icon: <MonitorHeartIcon fontSize="small" color="info" />
          });
        }
        break;
        
      case 'stress':
        recommendations.push({
          title: hrvValue < 20 ? "Incorporate Stress Reduction" : "Maintain Stress Management",
          description: hrvValue < 20 
            ? "Your HRV suggests elevated stress. Consider meditation, deep breathing, or nature time." 
            : "Your heart rate metrics suggest manageable stress levels. Continue your current practices.",
          icon: <PsychologyIcon fontSize="small" color={hrvValue < 20 ? "warning" : "success"} />
        });
        break;
        
      case 'sleep':
        recommendations.push({
          title: hrvValue < 20 ? "Improve Sleep Quality" : "Maintain Sleep Habits",
          description: hrvValue < 20 
            ? "Your heart metrics suggest room for sleep quality improvement. Consider a consistent sleep schedule and evening wind-down routine." 
            : "Your heart metrics suggest good sleep quality. Maintain your current sleep hygiene practices.",
          icon: <NightsStayIcon fontSize="small" color={hrvValue < 20 ? "warning" : "success"} />
        });
        break;
        
      case 'recovery':
        // Special recommendations for recovery mode
        if (hrRecovery < 15) {
          recommendations.push({
            title: "Focus on Active Recovery",
            description: "Your recovery rate is lower than optimal. Consider light movement, hydration, and proper nutrition to enhance recovery.",
            icon: <HealthAndSafetyIcon fontSize="small" color="warning" />
          });
        }
        break;
        
      case 'research':
        // More technical recommendations
        recommendations.push({
          title: "Optimize Training Variables",
          description: `Based on your metrics (HRV: ${hrvValue}ms, Recovery Rate: ${hrRecovery}bpm), adjusting training intensity by ${hrvValue < 20 ? "-10" : "+5"}% may optimize adaptation.`,
          icon: <SchoolIcon fontSize="small" color="info" />
        });
        break;
        
      case 'personalized':
        // Unique personalized recommendation based on overall profile
        recommendations.push({
          title: cardioFitnessScore > 75 ? "Maintain Your Edge" : "Focus on Consistency",
          description: cardioFitnessScore > 75 
            ? "Your cardiovascular profile is excellent. Focus on maintaining this balance while progressively challenging yourself." 
            : "Your metrics suggest focusing on consistent training at moderate intensity to build cardiovascular efficiency.",
          icon: <AutoAwesomeIcon fontSize="small" color={cardioFitnessScore > 75 ? "success" : "info"} />
        });
        break;
        
      case 'basic':
      default:
        // Calculate active zones percentage for the recommendation
        const activeZonesTotal = zoneDistribution
          .filter(z => z.name !== 'Rest' && z.name !== 'Fat Burn')
          .reduce((sum, zone) => sum + zone.value, 0);
          
        // Nutrition recommendation for basic mode
        recommendations.push({
          title: "Nutrition Support",
          description: activeZonesTotal > 30 
            ? "Consider adequate protein and carbohydrate intake to support your activity level and recovery." 
            : "Focus on balanced nutrition with plenty of whole foods to support your heart health.",
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
          aria-label="analysis mode tabs"
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
        {/* Fitness Score */}
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
              <HealthAndSafetyIcon color="primary" /> Cardio Fitness Score
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
                  value={cardioFitnessScore}
                  size={150}
                  thickness={5}
                  sx={{ 
                    color: cardioFitnessScore > 80 ? theme.palette.success.main : 
                           cardioFitnessScore > 60 ? theme.palette.info.main : 
                           cardioFitnessScore > 40 ? theme.palette.warning.main : 
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
                    {cardioFitnessScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    out of 100
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Based on your heart rate metrics, recovery patterns, and variability analysis.
              </Typography>
              
              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                <Chip 
                  label={`Recovery: ${recoveryStatus}`} 
                  size="small" 
                  color={
                    recoveryStatus === "Well Recovered" ? "success" : 
                    recoveryStatus === "Good" ? "info" : 
                    recoveryStatus === "Moderate" ? "warning" : "error"
                  }
                  sx={{ fontWeight: 'medium' }}
                />
                <Chip 
                  label={`HRV: ${hrvValue} ms`} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Zone Distribution */}
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
              <LocalFireDepartmentIcon color="primary" /> Heart Rate Zones
            </Typography>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {zoneDistribution.map((zone) => (
                <Box key={zone.name} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {zone.icon} {zone.name}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({zone.intensity})
                      </Typography>
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {zone.value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={zone.value} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(zone.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: zone.color,
                        borderRadius: 4
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Time spent in each heart rate zone during the recorded period.
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
              <MonitorHeartIcon color="primary" /> Cardiac Metrics
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
                  <Typography variant="body2" color="text.secondary">Resting HR</Typography>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {restingHR || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">BPM</Typography>
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
                  <Typography variant="body2" color="text.secondary">Variability</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {hrvValue || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">ms</Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.light, 0.1)
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Max HR</Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    {maxHR || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">BPM</Typography>
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
                  <Typography variant="body2" color="text.secondary">Recovery</Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {hrRecovery || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">BPM</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Abnormal Patterns */}
            {abnormalPatterns.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <WarningIcon fontSize="small" /> Pattern Anomalies Detected
                </Typography>
                
                <Stack spacing={1}>
                  {abnormalPatterns.map((pattern, idx) => (
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
                      {pattern.type}: {pattern.value} {pattern.time && `(at ${pattern.time})`}
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
          <ScienceIcon color="primary" /> AI-Powered Recommendations
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
          Recommendations based on heart rate metrics, patterns, and recovery analysis.
          This is not medical advice. Consult with a healthcare professional for personalized guidance.
        </Typography>
      </Paper>
    </Box>
  );
};

// Helper functions for heart rate analysis
// Calculate heart rate recovery rate
export function calculateHRRecovery(heartRateData) {
  if (!heartRateData || heartRateData.length < 10) return 0;
  
  // Find peak heart rate and the following min
  const values = heartRateData.map(item => item.avg || item.value || 0);
  
  let maxHR = Math.max(...values.filter(v => v > 0));
  let maxIndex = values.indexOf(maxHR);
  
  // Need to have data after the peak
  if (maxIndex >= values.length - 5) {
    maxIndex = Math.floor(values.length / 2);
    maxHR = values[maxIndex];
  }
  
  // Look at 5 minutes after peak
  const recoveryWindow = Math.min(5, values.length - maxIndex - 1);
  const recoveryValue = maxHR - values[maxIndex + recoveryWindow];
  
  return Math.max(0, Math.round(recoveryValue));
}

// Detect abnormal patterns in heart rate data
export function detectAbnormalPatterns(heartRateData) {
  if (!heartRateData || heartRateData.length < 10) return [];
  
  const abnormalities = [];
  const values = heartRateData.map(item => item.avg || item.value || 0).filter(v => v > 0);
  
  if (values.length < 10) return [];
  
  // Calculate mean and standard deviation
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Threshold for abnormal values (2 standard deviations)
  const highThreshold = mean + (stdDev * 2);
  const lowThreshold = Math.max(40, mean - (stdDev * 2)); // Not lower than 40 BPM
  
  // Detect sudden changes (more than 20 BPM in consecutive readings)
  for (let i = 1; i < values.length; i++) {
    const change = Math.abs(values[i] - values[i-1]);
    if (change > 20) {
      abnormalities.push({
        type: 'Sudden change',
        value: `Change of ${Math.round(change)} BPM`,
        index: i,
        severity: change > 35 ? 'High' : 'Medium',
        time: heartRateData[i].formattedTime || heartRateData[i].time || ''
      });
    }
  }
  
  // Detect sustained high heart rate (>100 BPM for multiple readings)
  let highHRCount = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > 100) {
      highHRCount++;
      if (highHRCount === 5) {
        abnormalities.push({
          type: 'Sustained high heart rate',
          value: `${Math.round(values[i])} BPM sustained`,
          index: i,
          severity: values[i] > 120 ? 'High' : 'Medium',
          time: heartRateData[i].formattedTime || heartRateData[i].time || ''
        });
        highHRCount = 0;
      }
    } else {
      highHRCount = 0;
    }
  }
  
  // Detect unusual low heart rates (when below 45 BPM)
  for (let i = 0; i < values.length; i++) {
    if (values[i] < 45 && values[i] > 0) {
      abnormalities.push({
        type: 'Low heart rate',
        value: `${Math.round(values[i])} BPM detected`,
        index: i,
        severity: values[i] < 40 ? 'High' : 'Medium',
        time: heartRateData[i].formattedTime || heartRateData[i].time || ''
      });
      // Skip a few points to avoid multiple alerts for the same period
      i += 5;
    }
  }
  
  // Detect unusual high values (outside expected range)
  for (let i = 0; i < values.length; i++) {
    if (values[i] > highThreshold) {
      abnormalities.push({
        type: 'Unusually high HR',
        value: `${Math.round(values[i])} BPM (>${Math.round(highThreshold)})`,
        index: i,
        severity: 'Medium',
        time: heartRateData[i].formattedTime || heartRateData[i].time || ''
      });
      // Skip a few points to avoid multiple alerts for the same period
      i += 5;
    }
  }
  
  // Limit to top abnormalities
  return abnormalities
    .sort((a, b) => {
      // Sort by severity first
      const severityScore = { High: 3, Medium: 2, Low: 1 };
      const severityDiff = severityScore[b.severity] - severityScore[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Then by type (prioritize unusual patterns)
      if (a.type !== b.type) {
        if (a.type === 'Sustained high heart rate') return -1;
        if (b.type === 'Sustained high heart rate') return 1;
      }
      
      // Then by value (higher values first for same type)
      return parseInt(b.value) - parseInt(a.value);
    })
    .slice(0, 3);
}

export default HeartRateAnalysisPanel;