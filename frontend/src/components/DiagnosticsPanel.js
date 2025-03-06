import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  useTheme,
  alpha,
  IconButton,
  Switch,
  FormControlLabel,
  Stack,
  Tabs,
  Tab,
  LinearProgress,
  TextField,
  Tooltip,
  Collapse,
  Fade
} from '@mui/material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyIcon from '@mui/icons-material/Key';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HotelIcon from '@mui/icons-material/Hotel';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';

/**
 * DiagnosticsPanel Component
 * 
 * A reusable diagnostics panel for debugging fitness data across different tabs
 */
const DiagnosticsPanel = ({ 
  isOpen, 
  onClose, 
  tokenScopes = [], 
  isAuthenticated = false, 
  currentTab = 'heart',
  period = 'day',
  date = new Date(),
  useMockData = false,
  setUseMockData = () => {},
  onRefresh = () => {},
  dataSource = 'auto',
  connectedServices = { fitbit: false, appleFitness: false, googleFit: false },
  // Optional custom props
  additionalDebugInfo = {},
  endpoints = {},
  customActions = []
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [showJsonOutput, setShowJsonOutput] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  
  const tabInfo = {
    heart: {
      name: 'Heart Rate',
      icon: <MonitorHeartIcon />,
      color: theme.palette.error.main,
      gradientColor: theme.palette.error.light,
      requiredScope: 'heartrate',
      endpoint: endpoints.heart || '/api/fitbit/heart-rate'
    },
    activity: {
      name: 'Activity',
      icon: <LocalFireDepartmentIcon />,
      color: theme.palette.success.main,
      gradientColor: theme.palette.success.light,
      requiredScope: 'activity',
      endpoint: endpoints.activity || '/api/fitbit/activity'
    },
    sleep: {
      name: 'Sleep',
      icon: <HotelIcon />,
      color: theme.palette.info.main,
      gradientColor: theme.palette.info.light,
      requiredScope: 'sleep',
      endpoint: endpoints.sleep || '/api/fitbit/sleep'
    }
  };

  const currentTabInfo = tabInfo[currentTab] || tabInfo.heart;
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleToggleMockData = () => {
    setUseMockData(!useMockData);
  };
  
  const handleRefresh = () => {
    onRefresh();
  };

  const handleDebugAction = async (action) => {
    if (!action.handler) return;
    
    setIsPerformingAction(true);
    try {
      await action.handler();
    } catch (error) {
      console.error(`Error executing debug action ${action.name}:`, error);
    } finally {
      setIsPerformingAction(false);
    }
  };
  
  const hasRequiredScope = tokenScopes.includes(currentTabInfo.requiredScope);
  
  // Sample debug actions that can be overridden or extended with customActions
  const defaultDebugActions = [
    {
      name: 'Debug Session',
      description: 'Check session cookies and authentication state',
      icon: <InfoIcon />,
      color: 'info',
      handler: async () => {
        try {
          const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
          const response = await fetch(`${apiBaseUrl}/api/auth/debug-session`, { credentials: 'include' });
          const data = await response.json();
          console.log('Session debug:', data);
          alert('Session info logged to console - check browser console (F12)');
        } catch (e) {
          console.error('Error debugging session:', e);
          alert('Error debugging session: ' + e.message);
        }
      }
    },
    {
      name: `Test ${currentTabInfo.name} API`,
      description: `Verify ${currentTabInfo.name} API connectivity`,
      icon: currentTabInfo.icon,
      color: 'primary',
      handler: async () => {
        try {
          const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
          const endpoint = currentTabInfo.endpoint.replace('{period}', period).replace('{date}', format(date, 'yyyy-MM-dd'));
          const response = await fetch(`${apiBaseUrl}${endpoint}?debug=true`, { credentials: 'include' });
          const data = await response.json();
          console.log(`${currentTabInfo.name} debug data:`, data);
          const message = `
            Status: ${data.status_code || 'Unknown'}
            Scopes: ${data.scopes ? data.scopes.join(', ') : 'No scopes found'}
            Has '${currentTabInfo.requiredScope}' scope: ${data.scopes && data.scopes.includes(currentTabInfo.requiredScope) ? 'Yes' : 'No (required)'}
          `;
          alert(`${currentTabInfo.name} API debug info:\n` + message + '\n\nFull details logged to console (F12)');
        } catch (e) {
          console.error('Error calling debug endpoint:', e);
          alert('Error calling debug endpoint: ' + e.message);
        }
      }
    }
  ];
  
  // Combine default actions with custom actions
  const debugActions = [...defaultDebugActions, ...customActions];
  
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: alpha(currentTabInfo.color, 0.1),
        borderBottom: `1px solid ${alpha(currentTabInfo.color, 0.2)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon sx={{ color: currentTabInfo.color }} />
          <Typography variant="h6">
            {currentTabInfo.name} Diagnostics Panel
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: '48px'
              }
            }}
          >
            <Tab 
              icon={<SecurityIcon />} 
              label="Authentication" 
              iconPosition="start"
              sx={{ py: 1.5 }}
            />
            <Tab 
              icon={<DataUsageIcon />} 
              label="Data Source" 
              iconPosition="start"
              sx={{ py: 1.5 }}
            />
            <Tab 
              icon={<BugReportIcon />} 
              label="Debug Tools" 
              iconPosition="start"
              sx={{ py: 1.5 }}
            />
            <Tab 
              icon={<CodeIcon />} 
              label="API Details" 
              iconPosition="start"
              sx={{ py: 1.5 }}
            />
          </Tabs>
        </Box>

        {/* Authentication Tab */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: activeTab === 0 ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: activeTab === 0 ? 'block' : 'none' }}
        >
          <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.light, 0.1), border: `1px dashed ${theme.palette.info.main}` }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <InfoIcon color="info" /> Authentication Status
            </Typography>
            
            <Box sx={{ p: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1, bgcolor: 'background.paper' }}>
              <Typography variant="body2" align="left">
                Authenticated: <strong>{isAuthenticated ? 'Yes' : 'No'}</strong>
              </Typography>
              <Typography variant="body2" align="left">
                Current scopes: {tokenScopes.length > 0 ? tokenScopes.join(', ') : 'No scopes found'}
              </Typography>
              <Typography 
                variant="body2" 
                color={hasRequiredScope ? 'success.main' : 'error.main'} 
                sx={{ mt: 1 }} 
                align="left"
              >
                Has '{currentTabInfo.requiredScope}' scope: <strong>{hasRequiredScope ? 'Yes' : `No - this is required for ${currentTabInfo.name.toLowerCase()} data`}</strong>
              </Typography>
            </Box>
          </Paper>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Available Scopes Explanation:</Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <MonitorHeartIcon color={tokenScopes.includes('heartrate') ? 'success' : 'disabled'} />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    heartrate scope
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allows reading heart rate data from Fitbit
                  </Typography>
                </Box>
                <Chip 
                  size="small" 
                  label={tokenScopes.includes('heartrate') ? 'Available' : 'Not Available'} 
                  color={tokenScopes.includes('heartrate') ? 'success' : 'default'}
                  variant={tokenScopes.includes('heartrate') ? 'filled' : 'outlined'}
                  sx={{ ml: 'auto' }}
                />
              </Paper>
              
              <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocalFireDepartmentIcon color={tokenScopes.includes('activity') ? 'success' : 'disabled'} />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    activity scope
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allows reading activity and exercise data from Fitbit
                  </Typography>
                </Box>
                <Chip 
                  size="small" 
                  label={tokenScopes.includes('activity') ? 'Available' : 'Not Available'} 
                  color={tokenScopes.includes('activity') ? 'success' : 'default'}
                  variant={tokenScopes.includes('activity') ? 'filled' : 'outlined'}
                  sx={{ ml: 'auto' }}
                />
              </Paper>
              
              <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <HotelIcon color={tokenScopes.includes('sleep') ? 'success' : 'disabled'} />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    sleep scope
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allows reading sleep data from Fitbit
                  </Typography>
                </Box>
                <Chip 
                  size="small" 
                  label={tokenScopes.includes('sleep') ? 'Available' : 'Not Available'} 
                  color={tokenScopes.includes('sleep') ? 'success' : 'default'}
                  variant={tokenScopes.includes('sleep') ? 'filled' : 'outlined'}
                  sx={{ ml: 'auto' }}
                />
              </Paper>
            </Stack>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2">Token Information:</Typography>
            <Paper sx={{ mt: 1, p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ flex: '0 0 150px' }}>
                    Authentication Type:
                  </Typography>
                  <Typography variant="body2">
                    OAuth 2.0 (Fitbit API)
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ flex: '0 0 150px' }}>
                    Scopes Count:
                  </Typography>
                  <Typography variant="body2">
                    {tokenScopes.length} scope(s)
                  </Typography>
                </Box>
                
                <Box display="flex">
                  <Typography variant="body2" color="text.secondary" sx={{ flex: '0 0 150px' }}>
                    Misconfigurations:
                  </Typography>
                  <Typography variant="body2" color={hasRequiredScope ? 'success.main' : 'error.main'}>
                    {hasRequiredScope 
                      ? 'None detected' 
                      : `Missing '${currentTabInfo.requiredScope}' scope required for ${currentTabInfo.name.toLowerCase()} data`}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </motion.div>

        {/* Data Source Tab */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: activeTab === 1 ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: activeTab === 1 ? 'block' : 'none' }}
        >
          <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.light, 0.1), border: `1px dashed ${theme.palette.primary.main}` }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <DataUsageIcon color="primary" /> Data Source Controls
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={!useMockData}
                  onChange={handleToggleMockData}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {useMockData ? "Using Mock Data" : "Using Real Data"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {useMockData 
                      ? "Currently using generated sample data for demonstration" 
                      : `Currently fetching actual data from ${dataSource === 'auto' ? 'all available APIs' : dataSource === 'fitbit' ? 'Fitbit API' : dataSource === 'apple' ? 'Apple Fitness API' : 'Google Fit API'}`}
                  </Typography>
                </Box>
              }
              sx={{ 
                border: `1px solid ${alpha(useMockData ? theme.palette.warning.main : theme.palette.success.main, 0.5)}`,
                p: 1,
                pl: 2,
                borderRadius: 1,
                width: '100%',
                bgcolor: alpha(useMockData ? theme.palette.warning.main : theme.palette.success.main, 0.05),
                my: 0
              }}
            />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Connected Services:</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Chip 
                  icon={<FitnessCenterIcon />} 
                  label="Fitbit" 
                  variant={connectedServices.fitbit ? "filled" : "outlined"}
                  color={connectedServices.fitbit ? "success" : "default"}
                  size="small"
                />
                <Chip 
                  icon={<AppleIcon />} 
                  label="Apple Fitness" 
                  variant={connectedServices.appleFitness ? "filled" : "outlined"}
                  color={connectedServices.appleFitness ? "success" : "default"}
                  size="small"
                />
                <Chip 
                  icon={<AndroidIcon />} 
                  label="Google Fit" 
                  variant={connectedServices.googleFit ? "filled" : "outlined"} 
                  color={connectedServices.googleFit ? "success" : "default"}
                  size="small"
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Current data source: <strong>{dataSource.toUpperCase()}</strong> 
                {dataSource === 'auto' && " - Will automatically use data from all connected services"}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Current Request Parameters:</Typography>
              <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center">
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: '0 0 100px' }}>
                      Period:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {period}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: '0 0 100px' }}>
                      Date:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {format(date, 'yyyy-MM-dd')}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ flex: '0 0 100px' }}>
                      API Endpoint:
                    </Typography>
                    <Box 
                      component="code" 
                      sx={{ 
                        overflow: 'auto', 
                        maxWidth: '100%', 
                        display: 'block',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.grey[900], 0.05),
                        color: theme.palette.grey[800],
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                      }}
                    >
                      {`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}${currentTabInfo.endpoint}?period=${period}&date=${format(date, 'yyyy-MM-dd')}`}
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Storage & Cache:</Typography>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Browser Storage:</strong> Current data source preference (mock/real) is stored in memory only.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cache TTL:</strong> API responses are typically cached on the backend for 5-15 minutes.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Clear Cache:</strong> To force fresh data from Fitbit, refresh from this panel or log out and back in.
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Paper>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color={useMockData ? "warning" : "primary"}
              startIcon={useMockData ? <DataUsageIcon /> : <RefreshIcon />}
              onClick={handleToggleMockData}
            >
              {useMockData ? "Switch to Real Data" : "Switch to Mock Data"}
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
          </Box>
        </motion.div>

        {/* Debug Tools Tab */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: activeTab === 2 ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: activeTab === 2 ? 'block' : 'none' }}
        >
          <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.light, 0.1), border: `1px dashed ${theme.palette.warning.main}` }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BugReportIcon color="warning" /> Advanced Debugging Tools
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                These tools provide deeper insights into the current data and API connectivity status.
              </Typography>
              
              {/* Debug Actions */}
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
                {debugActions.map((action, idx) => (
                  <Button 
                    key={idx}
                    variant="outlined" 
                    color={action.color || "info"}
                    size="small"
                    disabled={isPerformingAction}
                    startIcon={action.icon || <BugReportIcon />}
                    onClick={() => handleDebugAction(action)}
                    sx={{ minWidth: 140 }}
                  >
                    {action.name}
                  </Button>
                ))}
              </Stack>
            </Box>
            
            {/* JSON Output Section */}
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                onClick={() => setShowJsonOutput(!showJsonOutput)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                <CodeIcon fontSize="small" />
                {showJsonOutput ? "Hide Debug Information" : "Show Debug Information"}
              </Typography>
              
              <Collapse in={showJsonOutput}>
                <TextField
                  multiline
                  fullWidth
                  rows={8}
                  value={JSON.stringify({
                    tab: currentTab,
                    period: period,
                    date: format(date, 'yyyy-MM-dd'),
                    authenticated: isAuthenticated,
                    tokenScopes: tokenScopes,
                    hasRequiredScope: hasRequiredScope,
                    usingMockData: useMockData,
                    dataSource: dataSource,
                    connectedServices: connectedServices,
                    endpoint: `${currentTabInfo.endpoint}?period=${period}&date=${format(date, 'yyyy-MM-dd')}`,
                    environment: process.env.NODE_ENV,
                    ...additionalDebugInfo
                  }, null, 2)}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      bgcolor: alpha(theme.palette.grey[900], 0.05)
                    }
                  }}
                  sx={{ mt: 1 }}
                />
              </Collapse>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2, mt: 3, bgcolor: alpha(theme.palette.error.light, 0.05), border: `1px dashed ${theme.palette.error.main}` }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <KeyIcon color="error" /> Common Authentication Issues
            </Typography>
            
            <Stack spacing={1.5}>
              <Typography variant="body2">
                <strong>Missing Scopes:</strong> If the required scope for {currentTabInfo.name.toLowerCase()} data is missing, you'll need to re-authenticate with the correct permissions.
              </Typography>
              
              <Typography variant="body2">
                <strong>Token Expiration:</strong> Fitbit OAuth tokens expire after 8 hours. If your session is older, you may need to log in again.
              </Typography>
              
              <Typography variant="body2">
                <strong>API Rate Limits:</strong> Fitbit imposes strict rate limits. If you receive a 429 error, you'll need to wait before making more requests.
              </Typography>
              
              <Typography variant="body2">
                <strong>Cookie Storage:</strong> Ensure your browser is accepting cookies. This application stores tokens in HTTP-only cookies.
              </Typography>
            </Stack>
          </Paper>
        </motion.div>

        {/* API Details Tab */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: activeTab === 3 ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: activeTab === 3 ? 'block' : 'none' }}
        >
          <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.1), border: `1px dashed ${theme.palette.grey[400]}` }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CodeIcon color="default" /> API Reference
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.8), borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.primary.main }}>
                {currentTabInfo.name} API Endpoints
              </Typography>
              
              <Box
                component="pre"
                sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.grey[900], 0.05), 
                  borderRadius: 1, 
                  overflow: 'auto',
                  fontSize: '0.8125rem',
                  fontFamily: 'monospace',
                  mt: 1
                }}
              >
                {/* Endpoint details */}
                GET {currentTabInfo.endpoint} <br />
                <br />
                Query Parameters:
                <br />
                - period: The time period (day, week, month, etc.)
                <br />
                - date: The date in YYYY-MM-DD format
                <br />
                <br />
                Required scope: {currentTabInfo.requiredScope}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.primary.main }}>
                Authentication Endpoints
              </Typography>
              
              <Box
                component="pre"
                sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.grey[900], 0.05), 
                  borderRadius: 1, 
                  overflow: 'auto',
                  fontSize: '0.8125rem',
                  fontFamily: 'monospace',
                  mt: 1
                }}
              >
                {/* Auth endpoint details */}
                GET /api/auth/login <br />
                - Initiates OAuth flow with Fitbit
                <br />
                <br />
                GET /api/auth/callback <br />
                - OAuth callback from Fitbit
                <br />
                <br />
                GET /api/auth/logout <br />
                - Logs out and invalidates tokens
                <br />
                <br />
                GET /api/auth/status <br />
                - Returns current authentication status
                <br />
                <br />
                GET /api/auth/debug-session <br />
                - Returns debug information about the current session
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Response Format:
              </Typography>
              
              <Box
                component="pre"
                sx={{ 
                  p: 1.5, 
                  bgcolor: alpha(theme.palette.grey[900], 0.05), 
                  borderRadius: 1, 
                  overflow: 'auto',
                  fontSize: '0.8125rem',
                  fontFamily: 'monospace',
                  mt: 1
                }}
              >
                {`{
  "data": [ /* Array of data points */ ],
  "period": "${period}",
  "start_date": "${format(date, 'yyyy-MM-dd')}",
  "end_date": "${format(date, 'yyyy-MM-dd')}"
}`}
              </Box>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Fitbit API Documentation:
              </Typography>
              
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                  component="a"
                  href="https://dev.fitbit.com/build/reference/web-api/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official Fitbit API Docs
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary"
                  size="small"
                  component="a"
                  href="https://dev.fitbit.com/build/reference/web-api/developer-guide/application-design/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OAuth Implementation Guide
                </Button>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          Refresh Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosticsPanel;