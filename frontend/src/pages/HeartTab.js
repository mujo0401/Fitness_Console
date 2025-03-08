import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress,
  Button,
  Paper,
  useTheme,
  alpha,
  LinearProgress,
  Avatar,
  Snackbar,
  Alert,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { isValid, format, subDays, addDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

// Icons
import FavoriteIcon from '@mui/icons-material/Favorite';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DevicesIcon from '@mui/icons-material/Devices';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

// Services
import { heartRateService, fitbitService, appleFitnessService, googleFitService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Components
import HeartRateChart from '../components/charts/HeartRateChart';
import DiagnosticsPanel from '../components/DiagnosticsPanel.js';
import { GlassCard, AnimatedGradientText } from '../components/styled/CardComponents';

// Refactored heart rate components
import HeartStats from '../components/heart/HeartStats';
import DateNavigator from '../components/heart/DateNavigator';
import DataSourceDialog from '../components/heart/DataSourceDialog';
import AbnormalityDrawer from '../components/heart/AbnormalityDrawer';
import ZoneDistribution from '../components/heart/ZoneDistribution';
import ZoneDetailDialog from '../components/heart/ZoneDetailDialog';
import AnalysisTabs from '../components/heart/AnalysisTabs';
import AdvancedMetrics from '../components/heart/AdvancedMetrics';
import InsightCard from '../components/heart/InsightCard';
import MetricGaugeCard from '../components/heart/MetricGaugeCard';
import AnalysisControls from '../components/heart/AnalysisControls';
import AnalysisDepthSlider from '../components/heart/AnalysisDepthSlider';
import AIExplanationDialog from '../components/heart/AIExplanationDialog';

// Constants
import { 
  TIME_INTERVALS, 
  ANALYSIS_MODES, 
  VISUALIZATION_MODES,
  HR_ZONES 
} from '../constants/heartRateConstants';

// Utils
import { 
  calculateZoneDistribution,
  calculateAdvancedHeartMetrics,
  detectAbnormalPatterns,
  getHeartRateZone,
  findHighStressPeriods,
  calculateHRV,
  calculateDataQuality
} from '../utils/heartRateUtils';
import { generateMockHeartRateData } from '../utils/mockDataGenerator';

/**
 * HeartTab component for heart rate analysis and visualization
 * 
 * @param {Object} props
 * @param {boolean} props.showAdvancedAnalysis - Whether to show advanced analysis section
 * @returns {JSX.Element} HeartTab component
 */
const HeartTab = ({ showAdvancedAnalysis = true }) => {
  const theme = useTheme();
  const { isAuthenticated, tokenScopes } = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Core state
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [heartData, setHeartData] = useState(null);
  const [fitbitData, setFitbitData] = useState(null);
  const [googleFitData, setGoogleFitData] = useState(null);
  const [appleHealthData, setAppleHealthData] = useState(null);
  const [activeDataSource, setActiveDataSource] = useState('auto');
  const [dataSourcesAvailable, setDataSourcesAvailable] = useState({
    fitbit: false,
    googleFit: false,
    appleHealth: false
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAbnormalitiesDrawer, setShowAbnormalitiesDrawer] = useState(false);
  const [showZoneDetail, setShowZoneDetail] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showDiagnosticsPanel, setShowDiagnosticsPanel] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showAiExplanation, setShowAiExplanation] = useState(false);
  
  // Analysis state
  const [abnormalEvents, setAbnormalEvents] = useState([]);
  const [zoneDistribution, setZoneDistribution] = useState([]);
  const [advancedMetrics, setAdvancedMetrics] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('basic');
  const [aiAnalysisDepth, setAiAnalysisDepth] = useState(2);
  const [userFeedback, setUserFeedback] = useState(null);
  const [compareHistoricalData, setCompareHistoricalData] = useState(false);
  
  // Effect to fetch data when parameters change
  useEffect(() => {
    console.log('HeartTab useEffect triggered, fetching data...');
    console.log(`Current date object: ${date}, ISO string: ${date.toISOString()}`);
    fetchAllHeartData();
  }, [period, formattedDate, isAuthenticated, activeDataSource]);
  
  // Add debugging effect to log data state changes and ensure data is displayed
  useEffect(() => {
    console.log("Google Fit data updated:", googleFitData ? googleFitData.length : 0);
    if (googleFitData && googleFitData.length > 0) {
      console.log("Sample Google Fit data:", googleFitData[0]);
      
      // Always force set heart data to Google Fit data if we have it
      // This ensures the chart always shows data when available
      console.log("FORCE SETTING HEART DATA to Google Fit data");
      setHeartData([...googleFitData]);
      
      // Clear any error message since we have data
      setError('');
      
      // Explicitly update the activeDataSource to ensure rendering with Google Fit data
      if (activeDataSource === 'auto') {
        console.log("Setting active data source to googleFit");
        setActiveDataSource('googleFit');
      }
    }
  }, [googleFitData]);
  
  // Add debugging effect to log heart data changes
  useEffect(() => {
    console.log("Heart data updated:", heartData ? heartData.length : 0);
    if (heartData && heartData.length > 0) {
      console.log("Sample heart data:", heartData[0]);
      
      // Now the heart data is actually updated, call determineHeartRateDataToUse
      // to ensure correct data source selection based on updated state
      if (googleFitData && googleFitData.length > 0) {
        console.log("Heart data updated with Google Fit data available, ensuring data source");
        setActiveDataSource('googleFit');
      }
    }
  }, [heartData, googleFitData]);

  // Effect to calculate advanced metrics and AI insights when heart data changes
  useEffect(() => {
    if (heartData && heartData.length > 0) {
      // Calculate zone distribution
      const newZoneDistribution = calculateZoneDistribution(heartData);
      setZoneDistribution(newZoneDistribution);
      
      // Calculate advanced heart metrics
      const metrics = calculateAdvancedHeartMetrics(heartData);
      setAdvancedMetrics(metrics);
      setAbnormalEvents(metrics.abnormalEvents);
      
      // Generate AI insights (only when on the analysis tab)
      if (activeTab === 1) {
        setAiLoading(true);
        // Add slight delay to show loading state for better UX
        setTimeout(() => {
          const insights = generateAIInsights(heartData, metrics, newZoneDistribution, period, analysisMode, aiAnalysisDepth);
          setAiInsights(insights);
          setAiLoading(false);
        }, 800);
      }
    }
  }, [heartData, activeTab, period]);
  
  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // When switching to analysis tab, generate insights if we haven't already
    if (newValue === 1 && heartData && heartData.length > 0 && !aiInsights) {
      setAiLoading(true);
      setTimeout(() => {
        const insights = generateAIInsights(heartData, advancedMetrics, zoneDistribution, period, analysisMode, aiAnalysisDepth);
        setAiInsights(insights);
        setAiLoading(false);
      }, 600);
    }
    
    // Show alert for new tabs with beta features
    if (newValue === 3) { // Assuming tab index 3 is a new feature
      setAlertMessage({
        type: 'info',
        text: 'This feature is in beta. Try our new AI-powered heart rate pattern analysis!'
      });
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };
  
  // Handle diagnostics panel
  const handleOpenDiagnosticsPanel = () => {
    setShowDiagnosticsPanel(true);
  };
  
  const handleCloseDiagnosticsPanel = () => {
    setShowDiagnosticsPanel(false);
  };
  
  // Handle AI analysis depth change
  const handleAiAnalysisDepthChange = (event, newValue) => {
    setAiAnalysisDepth(newValue);
    // Regenerate insights with new depth
    if (heartData && heartData.length > 0) {
      setAiLoading(true);
      setTimeout(() => {
        const insights = generateAIInsights(heartData, advancedMetrics, zoneDistribution, period, analysisMode, newValue);
        setAiInsights(insights);
        setAiLoading(false);
      }, 600);
    }
  };
  
  // Handle user feedback submission
  const handleFeedbackSubmit = (rating, comment) => {
    setUserFeedback({ rating, comment, timestamp: new Date() });
    setAlertMessage({
      type: 'success',
      text: 'Thank you for your feedback! We use this to improve our AI analysis.'
    });
    setTimeout(() => setAlertMessage(null), 3000);
  };
  
  // Handle date change with proper formatting
  const handleDateChange = (newDate) => {
    if (newDate && isValid(newDate)) {
      // Fix timezone issues by using the date parts directly
      setDate(newDate);
      setFormattedDate(format(newDate, 'yyyy-MM-dd'));
    }
  };
  
  // Handle data source change
  const handleDataSourceChange = (source) => {
    console.log(`Changing data source to: ${source}`);
    setActiveDataSource(source);
    
    // After changing data source, refresh processed data
    determineHeartRateDataToUse();
  };
  
  // Handle period change
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };
  
  // Handle analysis mode change
  const handleAnalysisModeChange = (event, newValue) => {
    if (newValue !== null) {
      setAnalysisMode(newValue);
      
      // Regenerate insights with new analysis mode
      if (heartData && heartData.length > 0) {
        setAiLoading(true);
        setTimeout(() => {
          const insights = generateAIInsights(heartData, advancedMetrics, zoneDistribution, period, newValue, aiAnalysisDepth);
          setAiInsights(insights);
          setAiLoading(false);
        }, 600);
      }
      
      // Special handling for research mode (show explanation dialog)
      if (newValue === 'research' || newValue === 'personalized') {
        setShowAiExplanation(true);
        // If research mode requires specific permissions or setup, show information
        if (newValue === 'research' && !userFeedback) {
          setAlertMessage({
            type: 'info',
            text: 'Research mode uses advanced algorithms to analyze patterns in your heart data. Your feedback helps improve the analysis.'
          });
          setTimeout(() => setAlertMessage(null), 5000);
        }
      }
    }
  };
  
  // Toggle historical data comparison 
  const handleToggleHistoricalComparison = () => {
    setCompareHistoricalData(prev => !prev);
    if (!compareHistoricalData) {
      // Logic to load historical data for comparison would go here
      setAlertMessage({
        type: 'info',
        text: 'Loading historical comparison data...'
      });
      // For demo, just show the alert briefly
      setTimeout(() => setAlertMessage(null), 2000);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllHeartData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };
  
  // Open/close dialogs
  const handleOpenDataSourceDialog = () => setShowDataSourceDialog(true);
  const handleCloseDataSourceDialog = () => setShowDataSourceDialog(false);
  const handleToggleAbnormalitiesDrawer = () => setShowAbnormalitiesDrawer(prev => !prev);
  
  // Handle zone click
  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setShowZoneDetail(true);
  };
  
  // Close zone detail
  const handleCloseZoneDetail = () => {
    setShowZoneDetail(false);
  };
  
  // Fetch data from all available sources
  const fetchAllHeartData = async () => {
    setLoading(true);
    setError(null);
    
    // Check which services are connected
    try {
      const [fitbitStatus, googleFitStatus, appleHealthStatus] = await Promise.allSettled([
        fitbitService.checkStatus(),
        googleFitService.checkStatus(),
        appleFitnessService.checkStatus()
      ]);
      
      const availableSources = {
        fitbit: fitbitStatus.status === 'fulfilled' && fitbitStatus.value?.connected,
        googleFit: googleFitStatus.status === 'fulfilled' && googleFitStatus.value?.connected,
        appleHealth: appleHealthStatus.status === 'fulfilled' && appleHealthStatus.value?.connected
      };
      
      console.log('Available heart rate data sources:', availableSources);
      setDataSourcesAvailable(availableSources);
      
      // Helper function to fetch heart rate data from a specific source
      const fetchHeartData = async (source) => {
        try {
          console.log(`Fetching heart rate data from ${source} for ${period} on ${formattedDate}`);
          let response;
          
          switch (source) {
            case 'fitbit':
              response = await heartRateService.getHeartRateData(period, formattedDate);
              break;
            case 'googleFit':
              response = await googleFitService.getHeartRateData(period, formattedDate);
              break;
            case 'appleHealth':
              response = await appleFitnessService.getHeartRateData(period, formattedDate);
              break;
            default:
              throw new Error(`Unknown data source: ${source}`);
          }
          
          console.log(`Successfully fetched ${source} heart rate data:`, response);
          
          // Format the data consistently
          if (source === 'googleFit' && Array.isArray(response)) {
            // Google Fit returns an array directly - ensure the data is formatted correctly for our app
            console.log(`Formatting Google Fit data array of length ${response.length}`);
            console.log("Sample Google Fit data points:", response.slice(0, 3));
            return response.map(item => {
              // Check for missing or zero value and log it
              if (!item.value && item.value !== 0) {
                console.warn("Found Google Fit data item without value:", item);
              }
              
              // Convert Google Fit format to match our app's expected format
              return {
                ...item,
                // Add any missing fields Google Fit might not provide
                value: item.value || 0,
                avg: item.value || 0,
                // Add default fields if they don't exist
                min: item.min || item.value || 0,
                max: item.max || item.value || 0,
                timestamp: item.timestamp || Date.now() / 1000
              };
            });
          }
          
          return response;
        } catch (error) {
          console.error(`Error fetching ${source} heart rate data:`, error);
          return null;
        }
      };
      
      // Fetch data from all connected sources in parallel
      let promises = [];
      let promiseLabels = [];
      
      if (availableSources.fitbit) {
        promises.push(fetchHeartData('fitbit'));
        promiseLabels.push('fitbit');
      }
      
      if (availableSources.googleFit) {
        promises.push(fetchHeartData('googleFit'));
        promiseLabels.push('googleFit');
      }
      
      if (availableSources.appleHealth) {
        promises.push(fetchHeartData('appleHealth'));
        promiseLabels.push('appleHealth');
      }
      
      // If no service is connected, use mock data
      if (promises.length === 0) {
        console.log('No fitness services connected. Using mock data.');
        const mockData = generateMockHeartRateData(period);
        setHeartData(mockData.data);
        setFitbitData(mockData.data);
        setLoading(false);
        return;
      }
      
      // Create object to store the processed data
      const processedData = {
        fitbit: null,
        googleFit: null,
        appleHealth: null
      };
      
      // Wait for all promises to settle
      const results = await Promise.allSettled(promises);
      
      // Process results
      results.forEach((result, index) => {
        const source = promiseLabels[index];
        if (result.status === 'fulfilled') {
          console.log(`Processing ${source} result:`, {
            isArray: Array.isArray(result.value),
            length: Array.isArray(result.value) ? result.value.length : 'N/A',
            hasData: result.value?.data ? "Yes" : "No",
            dataLength: result.value?.data?.length || 0
          });
          
          // Handle Google Fit data which is now pre-formatted in fetchHeartData
          if (source === 'googleFit') {
            if (Array.isArray(result.value) && result.value.length > 0) {
              console.log(`Setting Google Fit data of length ${result.value.length}`);
              processedData.googleFit = result.value;
            } else if (result.value?.data?.length > 0) {
              console.log(`Setting Google Fit data from data field of length ${result.value.data.length}`);
              processedData.googleFit = result.value.data;
            } else {
              console.warn(`No data received from ${source}`);
            }
          }
          // Handle Fitbit and Apple Health
          else if (source === 'fitbit' || source === 'appleHealth') {
            if (result.value?.data?.length > 0) {
              console.log(`Successfully fetched ${source} data:`, result.value.data.length);
              if (source === 'fitbit') processedData.fitbit = result.value.data;
              if (source === 'appleHealth') processedData.appleHealth = result.value.data;
            } else if (Array.isArray(result.value) && result.value.length > 0) {
              console.log(`Successfully fetched ${source} data (array):`, result.value.length);
              if (source === 'fitbit') processedData.fitbit = result.value;
              if (source === 'appleHealth') processedData.appleHealth = result.value;
            } else {
              console.warn(`No data received from ${source}`);
            }
          }
        } else {
          console.error(`Failed to fetch data from ${source}:`, result.reason || 'Unknown error');
        }
      });
      
      // Now update state with the processed data
      if (processedData.fitbit) {
        console.log("Setting Fitbit data state:", processedData.fitbit.length);
        setFitbitData(processedData.fitbit);
      }
      
      if (processedData.googleFit) {
        console.log("Setting Google Fit data state:", processedData.googleFit.length);
        setGoogleFitData(processedData.googleFit);
        
        // If we have Google Fit data, immediately use it (especially for debugging)
        if (activeDataSource === 'auto' || activeDataSource === 'googleFit') {
          console.log("Immediately using Google Fit data:", processedData.googleFit.length);
          setHeartData(processedData.googleFit);
        }
      }
      
      if (processedData.appleHealth) {
        console.log("Setting Apple Health data state:", processedData.appleHealth.length);
        setAppleHealthData(processedData.appleHealth);
      }
      
      // Skip the timeout and directly use available data
      // The data appears in logs but the timeout causes issues with the data selection
      determineHeartRateDataToUse();
      
      // Double-check after small delay to ensure we're catching any async updates
      setTimeout(() => {
        if ((!heartData || heartData.length === 0) && googleFitData && googleFitData.length > 0) {
          console.log('Fallback: Setting heart data to Google Fit data');
          setHeartData([...googleFitData]);
          setError(''); // Clear any error message
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching heart rate data:', error);
      setError('Failed to fetch heart rate data. Please try again.');
      
      // Use mock data as fallback
      const mockData = generateMockHeartRateData(period);
      setHeartData(mockData.data);
      setFitbitData(mockData.data);
    } finally {
      setLoading(false);
    }
  };
  
  // Determine which heart rate data to use based on settings and availability
  const determineHeartRateDataToUse = () => {
    // Log the current state for debugging
    console.log("Determining heart rate data source:", {
      activeDataSource,
      googleFitDataLength: googleFitData ? googleFitData.length : 0,
      fitbitDataLength: fitbitData ? fitbitData.length : 0,
      appleHealthLength: appleHealthData ? appleHealthData.length : 0
    });
    
    // Prioritize Google Fit data if available, regardless of activeDataSource
    // This ensures we always use Google Fit data when it exists to fix the rendering issue
    if (googleFitData && googleFitData.length > 0) {
      console.log('Found Google Fit data in state with length:', googleFitData.length);
      console.log('Prioritizing Google Fit data for chart rendering');
      
      // The critical fix: set the active data source to Google Fit
      // This addresses the race condition by explicitly making Google Fit the priority
      if (activeDataSource === 'auto') {
        console.log('Auto-selecting Google Fit data source');
        setActiveDataSource('googleFit');
      }
      
      // Force update the heart data with Google Fit data when available
      // This ensures the chart gets the data regardless of timing issues
      if (activeDataSource === 'googleFit' || activeDataSource === 'auto') {
        // Use a new array to ensure React detects the change
        console.log('Setting heart data with Google Fit data, length:', googleFitData.length);
        setHeartData([...googleFitData]);
        setError(''); // Clear any error since we have data
        return; // Exit early - we've set the data
      }
    }
    
    // If we get here, either Google Fit data is not available or user explicitly chose another source
    switch (activeDataSource) {
      case 'fitbit':
        if (fitbitData && fitbitData.length > 0) {
          setHeartData([...fitbitData]);
          console.log('Using Fitbit data, length:', fitbitData.length);
          setError('');
        } else {
          setError('Fitbit data is not available. Please select another data source.');
          setHeartData([]);
        }
        break;
        
      case 'googleFit':
        // This case should have been handled above, but keeping for completeness
        if (googleFitData && googleFitData.length > 0) {
          console.log('Setting heart data to Google Fit data, length:', googleFitData.length);
          setHeartData([...googleFitData]);
          setError('');
        } else {
          setError('Google Fit data is not available. Please select another data source.');
          setHeartData([]);
        }
        break;
        
      case 'appleHealth':
        if (appleHealthData && appleHealthData.length > 0) {
          setHeartData([...appleHealthData]);
          console.log('Using Apple Health data, length:', appleHealthData.length);
          setError('');
        } else {
          setError('Apple Health data is not available. Please select another data source.');
          setHeartData([]);
        }
        break;
        
      case 'combined':
        // Combine all available data and sort by timestamp
        const combinedData = [
          ...(fitbitData || []),
          ...(googleFitData || []),
          ...(appleHealthData || [])
        ].sort((a, b) => {
          const aTime = a.timestamp || new Date(a.date + ' ' + (a.time || '00:00')).getTime();
          const bTime = b.timestamp || new Date(b.date + ' ' + (b.time || '00:00')).getTime();
          return aTime - bTime;
        });
        
        if (combinedData.length > 0) {
          setHeartData(combinedData);
          console.log('Using combined data, length:', combinedData.length);
          setError('');
        } else {
          setError('No heart rate data available from any source.');
          setHeartData([]);
        }
        break;
        
      case 'auto':
      default:
        // Auto-select the best dataset based on data quality and completeness
        const fitbitQuality = calculateDataQuality(fitbitData);
        const googleFitQuality = calculateDataQuality(googleFitData);
        const appleHealthQuality = calculateDataQuality(appleHealthData);
        
        console.log('Data quality scores:', {
          fitbit: fitbitQuality,
          googleFit: googleFitQuality,
          appleHealth: appleHealthQuality
        });
        
        // Always prioritize Google Fit data if available
        if (googleFitData && googleFitData.length > 0) {
          console.log('Auto-selected Google Fit data with length:', googleFitData.length);
          // Set active data source to Google Fit to ensure consistency
          setActiveDataSource('googleFit');
          setHeartData([...googleFitData]); 
          setError('');
        } else if (fitbitQuality > appleHealthQuality && fitbitData && fitbitData.length > 0) {
          setHeartData([...fitbitData]);
          console.log('Auto-selected Fitbit data as highest quality');
          setActiveDataSource('fitbit');
          setError('');
        } else if (appleHealthData && appleHealthData.length > 0) {
          setHeartData([...appleHealthData]);
          console.log('Auto-selected Apple Health data');
          setActiveDataSource('appleHealth');
          setError('');
        } else if (fitbitData && fitbitData.length > 0) {
          setHeartData([...fitbitData]);
          console.log('Defaulting to Fitbit data');
          setActiveDataSource('fitbit');
          setError('');
        } else {
          // No data available from any source
          console.log('No heart rate data available from any source.');
          setError('No heart rate data available from any source.');
          setHeartData([]);
        }
        break;
    }
  };
  
  // Generate AI insights for heart data
  const generateAIInsights = (heartRateData, advancedMetrics, zoneDistribution, period, mode = 'basic', depth = 2) => {
    if (!heartRateData || heartRateData.length === 0) {
      return {
        summary: "Insufficient data to generate insights.",
        insights: [],
        recommendations: []
      };
    }
    
    const insights = [];
    const recommendations = [];
    const researchFindings = [];
    
    // Get metrics from the advanced metrics
    const {
      restingHR, hrvStatus, recoveryScore, stressLevel, cardioFitnessScore, 
      maxHR, avgHR, vo2Max, heartAgeEstimate, cardiacEfficiency,
      abnormalEvents
    } = advancedMetrics;
    
    // ====== COMMON INSIGHTS ACROSS ALL MODES ======
    
    // Resting heart rate insights
    if (restingHR < 50) {
      insights.push({
        type: 'excellent',
        icon: <FavoriteIcon color="primary" />,
        title: 'Athletic Resting Heart Rate',
        detail: `Your resting heart rate of ${Math.round(restingHR)} BPM indicates excellent cardiovascular fitness, similar to trained athletes.`
      });
    } else if (restingHR < 60) {
      insights.push({
        type: 'good',
        icon: <FavoriteIcon color="success" />,
        title: 'Very Good Resting Heart Rate',
        detail: `Your resting heart rate of ${Math.round(restingHR)} BPM is well below average, indicating good cardiovascular health.`
      });
    } else if (restingHR < 70) {
      insights.push({
        type: 'good',
        icon: <FavoriteIcon color="info" />,
        title: 'Good Resting Heart Rate',
        detail: `Your resting heart rate of ${Math.round(restingHR)} BPM is within the healthy range.`
      });
    } else if (restingHR < 80) {
      insights.push({
        type: 'average',
        icon: <FavoriteIcon color="warning" />,
        title: 'Average Resting Heart Rate',
        detail: `Your resting heart rate of ${Math.round(restingHR)} BPM is within normal range but could be improved.`
      });
    } else {
      insights.push({
        type: 'warning',
        icon: <FavoriteIcon color="error" />,
        title: 'Elevated Resting Heart Rate',
        detail: `Your resting heart rate of ${Math.round(restingHR)} BPM is higher than ideal. This could be due to stress, dehydration, or lack of physical activity.`
      });
      recommendations.push({
        icon: <DirectionsRunIcon />,
        title: 'Consider Regular Cardio Exercise',
        detail: 'Regular aerobic exercise can help lower your resting heart rate over time.',
        priority: 'high'
      });
    }
    
    // Add more insights and recommendations based on mode and depth...
    
    // Summary generation based on insights
    const positiveInsights = insights.filter(i => i.type === 'excellent' || i.type === 'good').length;
    const warningInsights = insights.filter(i => i.type === 'warning').length;
    
    let summary;
    if (positiveInsights > warningInsights + 1) {
      summary = "Your heart metrics indicate excellent cardiovascular health. Keep up your current habits.";
    } else if (positiveInsights > warningInsights) {
      summary = "Your heart metrics are generally positive with some areas for potential improvement.";
    } else if (warningInsights > positiveInsights) {
      summary = "Several areas for improvement identified. Consider the recommendations to improve your heart health metrics.";
    } else {
      summary = "Your heart metrics provide a mixed picture. Focus on the recommendations to improve your cardiovascular health.";
    }
    
    // Sort recommendations by priority
    const sortedRecommendations = recommendations.sort((a, b) => {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return (priorityValues[b.priority] || 0) - (priorityValues[a.priority] || 0);
    });
    
    return {
      summary,
      insights: insights.slice(0, Math.min(5 + depth, 8)), // Increase insights with depth
      recommendations: sortedRecommendations.slice(0, Math.min(3 + Math.floor(depth/2), 5)), // Limit to top recommendations
      researchFindings: mode === 'research' ? researchFindings : [],
      analysisDepth: depth,
      analysisMode: mode
    };
  };
  
  // Core heart rate statistics calculation
  const { avgHR, maxHR, minHR, restingHR } = useMemo(() => {
    if (!heartData || heartData.length === 0) {
      return { avgHR: 0, maxHR: 0, minHR: 0, restingHR: 0 };
    }
    
    // Check if we only have placeholder data for today
    const hasOnlyPlaceholder = heartData.length === 1 && heartData[0].placeholder === true;
    if (hasOnlyPlaceholder) {
      console.log("Only placeholder data available for today");
      return { avgHR: 0, maxHR: 0, minHR: 0, restingHR: 0 };
    }
    
    const values = heartData
      .filter(item => (item.avg || item.value || 0) > 0 && !item.placeholder)
      .map(item => item.avg || item.value);
    
    if (values.length === 0) return { avgHR: 0, maxHR: 0, minHR: 0, restingHR: 0 };
    
    const avg = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
    
    // Handle both max field and calculating max from values
    const maxFromField = Math.max(...heartData.filter(item => (item.max || 0) > 0).map(item => item.max || 0));
    const maxFromValues = Math.max(...values);
    const max = Math.max(maxFromField, maxFromValues);
    
    // Handle both min field and calculating min from values
    const validMinRates = heartData.filter(item => (item.min || 0) > 0).map(item => item.min);
    const minFromField = validMinRates.length > 0 ? Math.min(...validMinRates) : 0;
    const minFromValues = Math.min(...values);
    const min = minFromField > 0 ? minFromField : minFromValues;
    
    // Get resting heart rate or estimate it from lowest values
    const validRestingRates = heartData.filter(item => item.restingHeartRate);
    let resting = 0;
    
    if (validRestingRates.length > 0) {
      resting = Math.round(validRestingRates.reduce((sum, item) => sum + item.restingHeartRate, 0) / validRestingRates.length);
    } else {
      // Estimate resting heart rate as the 10th percentile of all values
      const sortedValues = [...values].sort((a, b) => a - b);
      const percentileIndex = Math.floor(sortedValues.length * 0.1);
      resting = sortedValues[percentileIndex] || sortedValues[0];
    }
    
    return { avgHR: avg, maxHR: max, minHR: min, restingHR: resting };
  }, [heartData]);
  
  // Check if we're using mock data
  const isMockData = heartData && heartData.length > 0 && 
                     (heartData[0].time?.includes('AM') || heartData[0].time?.includes('PM'));
  
  // Get zone for average heart rate
  const currentZone = getHeartRateZone(avgHR);
    
  // Render date label based on period - keeping this for reference
  const renderDateLabel = useMemo(() => {
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
  }, [date, period]);
  
  // Rendering main UI
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Data Source Dialog */}
      <DataSourceDialog
        open={showDataSourceDialog}
        onClose={handleCloseDataSourceDialog}
        dataSourcesAvailable={dataSourcesAvailable}
        activeDataSource={activeDataSource}
        onDataSourceChange={handleDataSourceChange}
      />
      
      {/* Zone Detail Dialog */}
      <ZoneDetailDialog
        open={showZoneDetail}
        onClose={handleCloseZoneDetail}
        zone={selectedZone}
        zoneDistribution={zoneDistribution}
      />
      
      {/* Abnormalities Drawer */}
      <AbnormalityDrawer
        open={showAbnormalitiesDrawer}
        onClose={() => setShowAbnormalitiesDrawer(false)}
        abnormalEvents={abnormalEvents}
      />
      
      {/* AI Explanation Dialog */}
      <AIExplanationDialog
        open={showAiExplanation}
        onClose={() => setShowAiExplanation(false)}
        analysisMode={analysisMode}
        aiAnalysisDepth={aiAnalysisDepth}
        onDepthChange={handleAiAnalysisDepthChange}
        userFeedback={userFeedback}
        onFeedbackSubmit={handleFeedbackSubmit}
      />
      
      {/* Main content */}
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header section with title and controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard sx={{ 
            mb: 3,
            overflow: 'visible'
          }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #3f51b5, #2196f3, #00bcd4)', 
              py: { xs: 2, md: 2.5 }, 
              px: { xs: 2, md: 3 },
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <Box sx={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                top: '-150px',
                right: '-100px',
                zIndex: 0
              }} />
              
              <Box sx={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
                bottom: '-100px',
                left: '10%',
                zIndex: 0
              }} />
            
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, position: 'relative', zIndex: 1 }}>
                    <Avatar
                      sx={{
                        width: { xs: 48, md: 56 },
                        height: { xs: 48, md: 56 },
                        background: 'linear-gradient(135deg, #E91E63, #FF5722)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                      }}
                    >
                      <FavoriteIcon fontSize="large" />
                    </Avatar>
                    
                    <Box>
                      <AnimatedGradientText 
                        variant={isSmallScreen ? "h5" : "h4"} 
                        gradient="linear-gradient(90deg, #fff, #E0F7FA, #fff)"
                        fontWeight="bold"
                      >
                        Heart Rate Analytics
                      </AnimatedGradientText>
                      
                      <DateNavigator
                        date={date}
                        onDateChange={handleDateChange}
                        period={period}
                        onPeriodChange={handlePeriodChange}
                        TIME_INTERVALS={TIME_INTERVALS}
                        showDatePicker={showDatePicker}
                        setShowDatePicker={setShowDatePicker}
                      />
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    {/* Data source button */}
                    <Button
                      variant="contained"
                      startIcon={<DevicesIcon />}
                      onClick={handleOpenDataSourceDialog}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                      }}
                    >
                      {activeDataSource === 'auto' && 'Auto'}
                      {activeDataSource === 'fitbit' && 'Fitbit'}
                      {activeDataSource === 'googleFit' && 'Google Fit'}
                      {activeDataSource === 'appleHealth' && 'Apple Health'}
                      {activeDataSource === 'combined' && 'All Sources'}
                    </Button>
                    
                    {/* Refresh button */}
                    <Button
                      variant="contained"
                      startIcon={isRefreshing ? <RefreshIcon className="rotating-icon" /> : <RefreshIcon />}
                      onClick={handleRefresh}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                      }}
                    >
                      Refresh
                    </Button>
                    
                    {/* Abnormalities button with notification badge */}
                    <Button
                      variant="contained"
                      startIcon={<WarningAmberIcon />}
                      onClick={handleToggleAbnormalitiesDrawer}
                      size="small"
                      disabled={!abnormalEvents || abnormalEvents.length === 0}
                      sx={{ 
                        bgcolor: abnormalEvents?.length ? 'rgba(255,152,0,0.8)' : 'rgba(255,255,255,0.15)',
                        color: 'white',
                        borderRadius: 2,
                        '&:hover': { bgcolor: abnormalEvents?.length ? 'rgba(255,152,0,0.9)' : 'rgba(255,255,255,0.25)' }
                      }}
                    >
                      {abnormalEvents?.length || 0} Abnormalities
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </GlassCard>
        </motion.div>
        
        {/* Tab navigation */}
        <AnalysisTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
        
        {/* AI Analysis Mode Controls - Only show when on AI Analysis tab */}
        {activeTab === 1 && (
          <>
            <AnalysisControls
              analysisMode={analysisMode}
              onAnalysisModeChange={handleAnalysisModeChange}
              ANALYSIS_MODES={ANALYSIS_MODES}
              compareHistoricalData={compareHistoricalData}
              onToggleHistoricalComparison={handleToggleHistoricalComparison}
              onOpenExplanation={() => setShowAiExplanation(true)}
            />
            
            <AnalysisDepthSlider
              aiAnalysisDepth={aiAnalysisDepth}
              onDepthChange={handleAiAnalysisDepthChange}
            />
          </>
        )}
        
        {/* Main content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="chart-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8, flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={60} thickness={4} />
                      <Typography variant="body2" color="text.secondary">
                        Loading heart rate data...
                      </Typography>
                    </Box>
                  ) : error || !heartData || heartData.length === 0 ? (
                    <Box>
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color={error ? "error" : "text.secondary"} variant="h6" gutterBottom>
                          {error || "No heart rate data available for the selected period."}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ px: 3, py: 2 }}>
                        <HeartStats 
                          avgHR={0}
                          maxHR={0}
                          minHR={0}
                          restingHR={0}
                          currentZone={null}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ px: 3, py: 2 }}>
                        <HeartStats 
                          avgHR={avgHR}
                          maxHR={maxHR}
                          minHR={minHR}
                          restingHR={restingHR}
                          currentZone={currentZone}
                        />
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        {/* Chart rendering with key to force a complete re-render */}
                        <HeartRateChart 
                          key={`heart-chart-${activeDataSource}-${period}-${date}`}
                          data={heartData}
                          fitbitData={fitbitData}
                          googleFitData={googleFitData}
                          appleHealthData={appleHealthData}
                          dataSource={activeDataSource}
                          period={period}
                          tokenScopes={tokenScopes}
                          isAuthenticated={isAuthenticated}
                          date={date}
                          availableSources={dataSourcesAvailable}
                          onDataSourceChange={handleDataSourceChange}
                        />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {activeTab === 1 && (
            <motion.div
              key="analysis-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card elevation={3} sx={{ borderRadius: 3, height: '100%', overflow: 'visible' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {aiLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
                      <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
                      <Typography variant="h6" color="text.secondary">
                        Analyzing heart rate patterns...
                      </Typography>
                      <LinearProgress 
                        variant="indeterminate" 
                        sx={{ 
                          width: '50%', 
                          mt: 2, 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }} 
                      />
                    </Box>
                  ) : aiInsights ? (
                    <Box>
                      {/* AI Analysis Header */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                          color: 'white',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>
                            {aiInsights.summary}
                          </Typography>
                        </Box>
                      </Paper>
                      
                      {/* Core metrics row */}
                      <AdvancedMetrics advancedMetrics={advancedMetrics} />
                      
                      {/* Main content grid with insights and recommendations */}
                      <Grid container spacing={3} sx={{ mt: 2 }}>
                        {/* Left column - Insights */}
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Key Insights
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {aiInsights.insights.map((insight, index) => (
                              <InsightCard
                                key={index}
                                title={insight.title}
                                detail={insight.detail}
                                type={insight.type}
                                icon={insight.icon}
                                expanded={index === 0}
                              />
                            ))}
                          </Box>
                        </Grid>
                        
                        {/* Right column - Recommendations */}
                        <Grid item xs={12} md={4}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Recommendations
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {aiInsights.recommendations.map((recommendation, index) => (
                              <Paper 
                                key={index} 
                                elevation={1}
                                sx={{ 
                                  p: 2, 
                                  borderRadius: 3, 
                                  borderLeft: `4px solid ${recommendation.priority === 'high' ? 
                                    theme.palette.error.main : 
                                    recommendation.priority === 'medium' ? 
                                    theme.palette.warning.main : 
                                    theme.palette.info.main}`,
                                  bgcolor: alpha(recommendation.priority === 'high' ? 
                                    theme.palette.error.main : 
                                    recommendation.priority === 'medium' ? 
                                    theme.palette.warning.main : 
                                    theme.palette.info.main, 0.05)
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                  <Avatar
                                    sx={{ 
                                      bgcolor: alpha(recommendation.priority === 'high' ? 
                                        theme.palette.error.main : 
                                        recommendation.priority === 'medium' ? 
                                        theme.palette.warning.main : 
                                        theme.palette.info.main, 0.1),
                                      color: recommendation.priority === 'high' ? 
                                        theme.palette.error.main : 
                                        recommendation.priority === 'medium' ? 
                                        theme.palette.warning.main : 
                                        theme.palette.info.main,
                                      width: 36,
                                      height: 36
                                    }}
                                  >
                                    {recommendation.icon}
                                  </Avatar>
                                  
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                      {recommendation.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {recommendation.detail}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            ))}
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary" variant="h6" gutterBottom>
                        No heart rate data available for AI analysis.
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={handleRefresh}
                        startIcon={<RefreshIcon />}
                      >
                        Refresh Data
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {activeTab === 2 && (
            <motion.div
              key="zones-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Heart Rate Zone Distribution
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <ZoneDistribution 
                      zoneDistribution={zoneDistribution} 
                      onZoneClick={handleZoneClick} 
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      
      {/* DiagnosticsPanel component */}
      <DiagnosticsPanel
        isOpen={showDiagnosticsPanel}
        onClose={handleCloseDiagnosticsPanel}
        tokenScopes={tokenScopes}
        isAuthenticated={isAuthenticated}
        currentTab="heart"
        period={period}
        date={date}
        useMockData={isMockData}
        dataSource={activeDataSource}
        connectedServices={dataSourcesAvailable}
        onRefresh={handleRefresh}
      />
      
      {/* Snackbar for alerts */}
      <Snackbar
        open={alertMessage !== null}
        autoHideDuration={6000}
        onClose={() => setAlertMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAlertMessage(null)} 
          severity={alertMessage?.type || 'info'} 
          sx={{ width: '100%' }}
        >
          {alertMessage?.text}
        </Alert>
      </Snackbar>
  
      {/* Add CSS for the rotating icon */}
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating-icon {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Box>
  );
};

export default HeartTab;