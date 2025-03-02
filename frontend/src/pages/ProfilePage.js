import React, { useState } from 'react';
import {
  Box,
  Container, 
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  Tab,
  Tabs,
  useTheme,
  alpha,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AppleIcon from '@mui/icons-material/Apple';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const theme = useTheme();
  const { user, connectedServices } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "User Name",
    email: user?.email || "user@example.com",
    age: user?.age || 30,
    height: user?.height || 175,
    weight: user?.weight || 70,
    gender: user?.gender || "Not specified",
    fitnessGoal: user?.fitnessGoal || "Stay active",
    location: user?.location || "New York, USA"
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form if canceling edit
      setProfileData({
        fullName: user?.fullName || "User Name",
        email: user?.email || "user@example.com",
        age: user?.age || 30,
        height: user?.height || 175,
        weight: user?.weight || 70,
        gender: user?.gender || "Not specified",
        fitnessGoal: user?.fitnessGoal || "Stay active",
        location: user?.location || "New York, USA"
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleSaveProfile = () => {
    // In a real implementation, this would call an API to update the user profile
    setSuccessMessage("Profile successfully updated!");
    setIsEditing(false);
    
    // Show success message for 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 130,
              background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
              opacity: 0.8,
              zIndex: 0
            }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: { xs: 'center', sm: 'flex-end' }, 
            position: 'relative', 
            zIndex: 1,
            mb: 2,
            mt: 5
          }}>
            <Avatar
              src={user?.avatar || null}
              alt={profileData.fullName}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                mb: { xs: 2, sm: 0 },
                mr: { xs: 0, sm: 3 },
                bgcolor: theme.palette.primary.main,
                fontSize: 40
              }}
            >
              {profileData.fullName.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {profileData.fullName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profileData.email}
              </Typography>
              
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                {connectedServices.fitbit && (
                  <Chip 
                    icon={<FitnessCenterIcon />} 
                    label="Fitbit Connected" 
                    color="primary" 
                    size="small" 
                    variant="outlined"
                  />
                )}
                {connectedServices.appleFitness && (
                  <Chip 
                    icon={<AppleIcon />} 
                    label="Apple Fitness Connected" 
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip 
                  icon={<BarChartIcon />} 
                  label={profileData.fitnessGoal}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              </Box>
            </Box>
            
            <Box sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 2, sm: 0 } }}>
              <Button
                variant={isEditing ? "outlined" : "contained"}
                color={isEditing ? "error" : "primary"}
                startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                onClick={handleEditToggle}
                sx={{ borderRadius: 30 }}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              
              {isEditing && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  sx={{ ml: 2, borderRadius: 30 }}
                >
                  Save
                </Button>
              )}
            </Box>
          </Box>
          
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<AccountCircleIcon />} iconPosition="start" label="Profile" />
            <Tab icon={<BarChartIcon />} iconPosition="start" label="Statistics" />
            <Tab icon={<LockIcon />} iconPosition="start" label="Privacy" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
          </Tabs>
        </Paper>
        
        {/* Success Message */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}
        
        {/* Profile Tab */}
        {activeTab === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardHeader 
                  title="Personal Information" 
                  action={
                    isEditing && (
                      <IconButton>
                        <PhotoCameraIcon />
                      </IconButton>
                    )
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Full Name"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        variant={isEditing ? "outlined" : "filled"}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        variant={isEditing ? "outlined" : "filled"}
                        type="email"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Location"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        variant={isEditing ? "outlined" : "filled"}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardHeader title="Physical Attributes" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Age"
                        name="age"
                        value={profileData.age}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        variant={isEditing ? "outlined" : "filled"}
                        type="number"
                        InputProps={{ inputProps: { min: 13, max: 120 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Gender"
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        variant={isEditing ? "outlined" : "filled"}
                        select
                        SelectProps={{
                          native: true
                        }}
                      >
                        <option value="Not specified">Not specified</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Height (cm)"
                        name="height"
                        value={profileData.height}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        variant={isEditing ? "outlined" : "filled"}
                        type="number"
                        InputProps={{ inputProps: { min: 50, max: 250 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Weight (kg)"
                        name="weight"
                        value={profileData.weight}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        variant={isEditing ? "outlined" : "filled"}
                        type="number"
                        InputProps={{ inputProps: { min: 20, max: 300 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Fitness Goal"
                        name="fitnessGoal"
                        value={profileData.fitnessGoal}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        variant={isEditing ? "outlined" : "filled"}
                        select
                        SelectProps={{
                          native: true
                        }}
                      >
                        <option value="Stay active">Stay active</option>
                        <option value="Lose weight">Lose weight</option>
                        <option value="Build muscle">Build muscle</option>
                        <option value="Improve endurance">Improve endurance</option>
                        <option value="Train for competition">Train for competition</option>
                        <option value="Maintain health">Maintain health</option>
                      </TextField>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3 }}>
                <CardHeader title="Connected Accounts" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2, 
                        borderRadius: 2, 
                        border: `1px solid ${theme.palette.divider}` 
                      }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: connectedServices.fitbit ? 'primary.light' : alpha(theme.palette.grey[500], 0.1),
                            color: connectedServices.fitbit ? 'white' : theme.palette.grey[500],
                            mr: 2
                          }}
                        >
                          <FitnessCenterIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">Fitbit</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {connectedServices.fitbit ? "Connected since 2023" : "Not connected"}
                          </Typography>
                        </Box>
                        <Chip 
                          label={connectedServices.fitbit ? "Connected" : "Connect"} 
                          color={connectedServices.fitbit ? "success" : "primary"} 
                          size="small"
                          variant={connectedServices.fitbit ? "filled" : "outlined"}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2, 
                        borderRadius: 2, 
                        border: `1px solid ${theme.palette.divider}` 
                      }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: connectedServices.appleFitness ? 'secondary.light' : alpha(theme.palette.grey[500], 0.1),
                            color: connectedServices.appleFitness ? 'white' : theme.palette.grey[500],
                            mr: 2
                          }}
                        >
                          <AppleIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">Apple Fitness</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {connectedServices.appleFitness ? "Connected since 2023" : "Not connected"}
                          </Typography>
                        </Box>
                        <Chip 
                          label={connectedServices.appleFitness ? "Connected" : "Connect"} 
                          color={connectedServices.appleFitness ? "success" : "secondary"} 
                          size="small"
                          variant={connectedServices.appleFitness ? "filled" : "outlined"}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Statistics Tab */}
        {activeTab === 1 && (
          <Card sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>Activity Statistics</Typography>
            <Typography variant="body1">
              Your fitness statistics and activity charts will be displayed here.
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Activity charts and analytics coming soon
              </Typography>
            </Box>
          </Card>
        )}
        
        {/* Privacy Tab */}
        {activeTab === 2 && (
          <Card sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
            <Typography variant="body1">
              Manage your privacy settings and data permissions.
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Privacy controls coming soon
              </Typography>
            </Box>
          </Card>
        )}
        
        {/* Settings Tab */}
        {activeTab === 3 && (
          <Card sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>Account Settings</Typography>
            <Typography variant="body1">
              Manage your account settings and preferences.
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Account settings coming soon
              </Typography>
            </Box>
          </Card>
        )}
      </motion.div>
    </Container>
  );
};

export default ProfilePage;