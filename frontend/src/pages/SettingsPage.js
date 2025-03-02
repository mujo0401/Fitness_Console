import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Slider,
  TextField,
  MenuItem,
  Collapse,
  Alert,
  IconButton,
  Select,
  Chip,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseIcon from '@mui/icons-material/Close';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import MapIcon from '@mui/icons-material/Map';
import LanguageIcon from '@mui/icons-material/Language';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Units and formats
    units: {
      distance: 'km',
      weight: 'kg',
      temperature: 'celsius',
      timeFormat: '24h'
    },
    // Theme and display
    theme: {
      mode: 'system',
      primaryColor: 'blue',
      fontSize: 'medium',
      compactMode: false
    },
    // Notifications
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      activityReminders: true,
      weeklyReports: true,
      healthAlerts: true,
      achievementAlerts: true
    },
    // Privacy
    privacy: {
      profileVisibility: 'friends',
      shareActivityData: true,
      allowDataAnalysis: true,
      locationTracking: true
    },
    // Device sync
    deviceSync: {
      syncFrequency: 'auto',
      syncOnWifi: true,
      backgroundSync: true,
      autoDetectActivity: true
    },
    // Security
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      rememberDevices: true
    },
    // Language
    language: 'english'
  });
  
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  const handleSwitchChange = (category, setting) => (event) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: event.target.checked
      }
    });
  };
  
  const handleRadioChange = (category, setting) => (event) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: event.target.value
      }
    });
  };
  
  const handleSelectChange = (category, setting) => (event) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: event.target.value
      }
    });
  };
  
  const handleDirectChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.value
    });
  };
  
  const handleSliderChange = (category, setting) => (event, newValue) => {
    const fontSizeMap = {
      0: 'small',
      1: 'medium',
      2: 'large'
    };
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: fontSizeMap[newValue]
      }
    });
  };
  
  const getFontSizeValue = (fontSize) => {
    const fontSizeMap = {
      'small': 0,
      'medium': 1,
      'large': 2
    };
    return fontSizeMap[fontSize] || 1;
  };

  const saveSettings = () => {
    // In a real implementation, this would call an API to save user settings
    setAlertMessage("Settings saved successfully!");
    setAlertOpen(true);
    
    // Automatically close the alert after 3 seconds
    setTimeout(() => {
      setAlertOpen(false);
    }, 3000);
  };
  
  const resetToDefaults = () => {
    // Reset settings to default values
    setSettings({
      units: {
        distance: 'km',
        weight: 'kg',
        temperature: 'celsius',
        timeFormat: '24h'
      },
      theme: {
        mode: 'system',
        primaryColor: 'blue',
        fontSize: 'medium',
        compactMode: false
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        activityReminders: true,
        weeklyReports: true,
        healthAlerts: true,
        achievementAlerts: true
      },
      privacy: {
        profileVisibility: 'friends',
        shareActivityData: true,
        allowDataAnalysis: true,
        locationTracking: true
      },
      deviceSync: {
        syncFrequency: 'auto',
        syncOnWifi: true,
        backgroundSync: true,
        autoDetectActivity: true
      },
      security: {
        twoFactorAuth: false,
        loginAlerts: true,
        rememberDevices: true
      },
      language: 'english'
    });
    
    setAlertMessage("Settings reset to defaults!");
    setAlertOpen(true);
    
    setTimeout(() => {
      setAlertOpen(false);
    }, 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Settings Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #3f51b5, #2196f3)',
            color: 'white',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Settings
            </Typography>
            <Typography variant="subtitle1">
              Customize your app preferences and account settings
            </Typography>
          </Box>
          
          <Box sx={{ mt: { xs: 2, sm: 0 }, display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="inherit" 
              startIcon={<SettingsBackupRestoreIcon />}
              onClick={resetToDefaults}
              sx={{ borderRadius: 10 }}
            >
              Reset to Defaults
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<SaveIcon />}
              onClick={saveSettings}
              sx={{ borderRadius: 10 }}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
        
        {/* Save Success Alert */}
        <Collapse in={alertOpen}>
          <Alert
            severity="success"
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setAlertOpen(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {alertMessage}
          </Alert>
        </Collapse>
        
        <Grid container spacing={3}>
          {/* Units and Formats */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader 
                title="Units & Formats" 
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <DataUsageIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <FormLabel id="distance-unit-label">Distance Unit</FormLabel>
                      <Select
                        labelId="distance-unit-label"
                        value={settings.units.distance}
                        onChange={handleSelectChange('units', 'distance')}
                        size="small"
                      >
                        <MenuItem value="km">Kilometers (km)</MenuItem>
                        <MenuItem value="miles">Miles (mi)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <FormLabel id="weight-unit-label">Weight Unit</FormLabel>
                      <Select
                        labelId="weight-unit-label"
                        value={settings.units.weight}
                        onChange={handleSelectChange('units', 'weight')}
                        size="small"
                      >
                        <MenuItem value="kg">Kilograms (kg)</MenuItem>
                        <MenuItem value="lb">Pounds (lb)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <FormLabel id="temperature-unit-label">Temperature</FormLabel>
                      <Select
                        labelId="temperature-unit-label"
                        value={settings.units.temperature}
                        onChange={handleSelectChange('units', 'temperature')}
                        size="small"
                      >
                        <MenuItem value="celsius">Celsius (°C)</MenuItem>
                        <MenuItem value="fahrenheit">Fahrenheit (°F)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <FormLabel id="time-format-label">Time Format</FormLabel>
                      <Select
                        labelId="time-format-label"
                        value={settings.units.timeFormat}
                        onChange={handleSelectChange('units', 'timeFormat')}
                        size="small"
                      >
                        <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                        <MenuItem value="24h">24-hour</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Theme and Display */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader 
                title="Theme & Display" 
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    <ColorLensIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <FormControl component="fieldset" margin="normal">
                  <FormLabel component="legend">Theme Mode</FormLabel>
                  <RadioGroup
                    row
                    value={settings.theme.mode}
                    onChange={handleRadioChange('theme', 'mode')}
                  >
                    <FormControlLabel value="light" control={<Radio />} label="Light" />
                    <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                    <FormControlLabel value="system" control={<Radio />} label="System Default" />
                  </RadioGroup>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <FormLabel id="primary-color-label">Primary Color</FormLabel>
                  <Box sx={{ display: 'flex', mt: 1, mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    {['blue', 'purple', 'green', 'orange', 'pink', 'teal'].map((color) => (
                      <Box
                        key={color}
                        onClick={() => setSettings({
                          ...settings,
                          theme: { ...settings.theme, primaryColor: color }
                        })}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: `${color}.500`,
                          cursor: 'pointer',
                          border: settings.theme.primaryColor === color ? '2px solid white' : 'none',
                          boxShadow: settings.theme.primaryColor === color 
                            ? `0 0 0 2px ${theme.palette.primary.main}` 
                            : 'none',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <FormLabel>Font Size</FormLabel>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={getFontSizeValue(settings.theme.fontSize)}
                      onChange={handleSliderChange('theme', 'fontSize')}
                      step={1}
                      marks={[
                        { value: 0, label: 'Small' },
                        { value: 1, label: 'Medium' },
                        { value: 2, label: 'Large' }
                      ]}
                      min={0}
                      max={2}
                    />
                  </Box>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.theme.compactMode}
                      onChange={handleSwitchChange('theme', 'compactMode')}
                      color="primary"
                    />
                  }
                  label="Compact Mode"
                />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader 
                title="Notifications" 
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                    <NotificationsIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <List disablePadding>
                  <ListItem>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary="Receive updates and summaries via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.emailNotifications}
                        onChange={handleSwitchChange('notifications', 'emailNotifications')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Push Notifications" 
                      secondary="Receive alerts on your device"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.pushNotifications}
                        onChange={handleSwitchChange('notifications', 'pushNotifications')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Activity Reminders" 
                      secondary="Remind you to move when inactive"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.activityReminders}
                        onChange={handleSwitchChange('notifications', 'activityReminders')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Weekly Reports" 
                      secondary="Get a summary of your weekly activity"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.weeklyReports}
                        onChange={handleSwitchChange('notifications', 'weeklyReports')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Health Alerts" 
                      secondary="Important alerts about your health metrics"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.healthAlerts}
                        onChange={handleSwitchChange('notifications', 'healthAlerts')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Achievement Alerts" 
                      secondary="Get notified about achieved goals"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.achievementAlerts}
                        onChange={handleSwitchChange('notifications', 'achievementAlerts')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Privacy Settings */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader 
                title="Privacy" 
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                    <VisibilityIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <FormControl fullWidth margin="normal">
                  <FormLabel id="profile-visibility-label">Profile Visibility</FormLabel>
                  <Select
                    labelId="profile-visibility-label"
                    value={settings.privacy.profileVisibility}
                    onChange={handleSelectChange('privacy', 'profileVisibility')}
                    size="small"
                  >
                    <MenuItem value="public">Public - Visible to everyone</MenuItem>
                    <MenuItem value="friends">Friends Only</MenuItem>
                    <MenuItem value="private">Private - Only visible to you</MenuItem>
                  </Select>
                </FormControl>
                
                <List disablePadding sx={{ mt: 2 }}>
                  <ListItem>
                    <ListItemText 
                      primary="Share Activity Data" 
                      secondary="Allow sharing your activity in the app"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.privacy.shareActivityData}
                        onChange={handleSwitchChange('privacy', 'shareActivityData')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Allow Data Analysis" 
                      secondary="Let us improve your experience with data insights"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.privacy.allowDataAnalysis}
                        onChange={handleSwitchChange('privacy', 'allowDataAnalysis')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Location Tracking" 
                      secondary="Track location during workouts"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.privacy.locationTracking}
                        onChange={handleSwitchChange('privacy', 'locationTracking')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Device Sync */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader 
                title="Device Synchronization" 
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                    <DevicesIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <FormControl fullWidth margin="normal">
                  <FormLabel id="sync-frequency-label">Sync Frequency</FormLabel>
                  <Select
                    labelId="sync-frequency-label"
                    value={settings.deviceSync.syncFrequency}
                    onChange={handleSelectChange('deviceSync', 'syncFrequency')}
                    size="small"
                  >
                    <MenuItem value="manual">Manual Only</MenuItem>
                    <MenuItem value="hourly">Every Hour</MenuItem>
                    <MenuItem value="auto">Automatic (Battery Optimized)</MenuItem>
                    <MenuItem value="realtime">Real-time (Higher battery usage)</MenuItem>
                  </Select>
                </FormControl>
                
                <List disablePadding sx={{ mt: 2 }}>
                  <ListItem>
                    <ListItemText 
                      primary="Sync on Wi-Fi Only" 
                      secondary="Save mobile data by syncing only on Wi-Fi"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.deviceSync.syncOnWifi}
                        onChange={handleSwitchChange('deviceSync', 'syncOnWifi')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Background Sync" 
                      secondary="Allow syncing when app is in background"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.deviceSync.backgroundSync}
                        onChange={handleSwitchChange('deviceSync', 'backgroundSync')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Auto-detect Activities" 
                      secondary="Automatically detect and record activities"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.deviceSync.autoDetectActivity}
                        onChange={handleSwitchChange('deviceSync', 'autoDetectActivity')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Security */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader 
                title="Security" 
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                    <SecurityIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <List disablePadding>
                  <ListItem>
                    <ListItemText 
                      primary="Two-Factor Authentication" 
                      secondary="Add an extra layer of security to your account"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.security.twoFactorAuth}
                        onChange={handleSwitchChange('security', 'twoFactorAuth')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Login Alerts" 
                      secondary="Get notified of new logins to your account"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.security.loginAlerts}
                        onChange={handleSwitchChange('security', 'loginAlerts')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Remember Devices" 
                      secondary="Stay logged in on trusted devices"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.security.rememberDevices}
                        onChange={handleSwitchChange('security', 'rememberDevices')}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                  >
                    Change Password
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Language and Region */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader 
                title="Language & Region" 
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <LanguageIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormLabel id="language-label">Language</FormLabel>
                      <Select
                        labelId="language-label"
                        value={settings.language}
                        onChange={handleDirectChange('language')}
                        size="small"
                      >
                        <MenuItem value="english">English</MenuItem>
                        <MenuItem value="spanish">Spanish</MenuItem>
                        <MenuItem value="french">French</MenuItem>
                        <MenuItem value="german">German</MenuItem>
                        <MenuItem value="chinese">Chinese</MenuItem>
                        <MenuItem value="japanese">Japanese</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">
                        Language settings will apply across the entire application
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={saveSettings}
            size="large"
            sx={{ 
              borderRadius: 30,
              px: 4,
              py: 1.5,
              boxShadow: theme.shadows[8]
            }}
          >
            Save All Settings
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default SettingsPage;