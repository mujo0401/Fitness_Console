// TabNav.js - Sticky tab navigation component
import React from 'react';
import { 
  Box, 
  Paper, 
  Tabs,
  Tab,
  Divider,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SportsIcon from '@mui/icons-material/Sports';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ChatIcon from '@mui/icons-material/Chat';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InfoIcon from '@mui/icons-material/Info';

const TabNav = ({ currentTab, handleTabChange, isAuthenticated }) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        width: '100%', 
        position: 'fixed',
        top: 64, // Position right below the app bar
        left: 0,
        right: 0,
        zIndex: 9999, // Increase z-index to ensure it's on top
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={8} 
          sx={{ 
            borderRadius: { xs: '16px', sm: '20px' }, 
            mb: { xs: 2, sm: 3, md: 4 }, 
            mx: 'auto',
            maxWidth: 'xl',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 245, 255, 0.9))',
            overflow: 'visible',
            boxShadow: '0 10px 30px rgba(33, 150, 243, 0.2), 0 -5px 15px rgba(63, 81, 181, 0.1)',
            border: '1px solid rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%233f51b5\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              borderRadius: '20px'
            }
          }}
        >
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            variant="scrollable" // Always scrollable
            scrollButtons="auto"
            centered={false}
            allowScrollButtonsMobile={true}
            TabIndicatorProps={{
              sx: { display: 'none' }
            }}
            sx={{ 
              px: { xs: 1, sm: 2 },
              pt: 1.5,
              pb: 1,
              width: '100%',
              maxWidth: '100%',
              position: 'relative',
              '& .MuiTabs-flexContainer': {
                gap: 1, // Consistent spacing
              },
              // Style for scroll buttons
              '& .MuiTabs-scrollButtons': {
                opacity: 1,
                color: '#5C6BC0',
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                '&.Mui-disabled': {
                  opacity: 0.3,
                }
              },
              '& .MuiTab-root': {
                color: '#5C6BC0', // Indigo color for tabs
                px: { xs: 1.5, sm: 2 }, 
                py: { xs: 1, sm: 1.2 },
                minWidth: { xs: 100, sm: 110 }, // Fixed width for consistency
                minHeight: 40,
                margin: '0 2px',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 600,
                border: '1px solid rgba(92, 107, 192, 0.1)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,249,255,0.8))',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                backdropFilter: 'blur(8px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                '&:hover': {
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 3px 6px rgba(92, 107, 192, 0.15)'
                }
              },
              '& .MuiTabs-indicator': {
                height: 0, // Hide default indicator
              }
            }}
          >
            {/* Heart Rate tab */}
            <Tab 
              icon={<FavoriteIcon />}
              label="Heart Rate"
              disabled={!isAuthenticated}
              sx={{
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #F44336, #FF5252)',
                  border: '1px solid rgba(244, 67, 54, 0.8)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.3)'
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                }
              }}
            />
            <Tab 
              icon={<DirectionsRunIcon />}
              label="Activity"
              disabled={!isAuthenticated}
              sx={{
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 700,
                  backgroundColor: 'rgba(0, 150, 136, 0.6)',
                  border: '1px solid rgba(0, 150, 136, 0.8)',
                  boxShadow: '0 4px 20px rgba(0, 150, 136, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                }
              }}
            />
            <Tab 
              icon={<BedtimeIcon />}
              label="Sleep"
              disabled={!isAuthenticated}
              sx={{
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 700,
                  backgroundColor: 'rgba(103, 58, 183, 0.6)',
                  border: '1px solid rgba(103, 58, 183, 0.8)',
                  boxShadow: '0 4px 20px rgba(103, 58, 183, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                }
              }}
            />
            <Tab 
              icon={<PersonOutlineIcon />}
              label="ABM"
              disabled={!isAuthenticated}
              sx={{
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 700,
                  backgroundColor: 'rgba(156, 39, 176, 0.6)',
                  border: '1px solid rgba(156, 39, 176, 0.8)',
                  boxShadow: '0 4px 20px rgba(156, 39, 176, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2)'
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                }
              }}
            />
            {/* Always accessible tabs */}
            <Tab 
              icon={<SportsIcon />}
              label="Fitness Plan"
              sx={{
                minHeight: 60,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#4caf50',
                  fontWeight: 700,
                  backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  boxShadow: '0 4px 10px rgba(76, 175, 80, 0.15)'
                },
                '&:hover': {
                  bgcolor: 'rgba(76, 175, 80, 0.04)',
                  color: '#4caf50'
                }
              }}
            />
            <Tab 
              icon={<HeadsetMicIcon />}
              label="Exercise Coach"
              sx={{
                minHeight: 60,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#2196f3',
                  fontWeight: 700,
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                  boxShadow: '0 4px 10px rgba(33, 150, 243, 0.15)'
                },
                '&:hover': {
                  bgcolor: 'rgba(33, 150, 243, 0.04)',
                  color: '#2196f3'
                }
              }}
            />
            <Tab 
              icon={<MusicNoteIcon />}
              label="Music"
              sx={{
                minHeight: 60,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #9c27b0, #ba68c8)',
                  border: '1px solid rgba(156, 39, 176, 0.7)',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3), inset 0 0 6px rgba(255, 255, 255, 0.3)'
                },
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.05)',
                  boxShadow: '0 6px 15px rgba(156, 39, 176, 0.2)'
                }
              }}
            />
            <Tab 
              icon={<ShoppingCartIcon />}
              label="Grocery Shop"
              sx={{
                minHeight: 60,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#43a047',
                  fontWeight: 700,
                  backgroundColor: 'rgba(67, 160, 71, 0.05)',
                  boxShadow: '0 4px 10px rgba(67, 160, 71, 0.15)'
                },
                '&:hover': {
                  bgcolor: 'rgba(67, 160, 71, 0.04)',
                  color: '#43a047'
                }
              }}
            />
            <Tab 
              icon={<AutoGraphIcon />}
              label="Trends"
              disabled={!isAuthenticated}
              sx={{
                minHeight: 60,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#ff9800',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 152, 0, 0.05)',
                  boxShadow: '0 4px 10px rgba(255, 152, 0, 0.15)'
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 152, 0, 0.04)',
                  color: '#ff9800'
                },
                '&.Mui-disabled': {
                  opacity: 0.6,
                }
              }}
            />
            <Tab 
              icon={<ChatIcon />}
              label="Assistant"
              sx={{
                minHeight: 60,
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#2196f3',
                  fontWeight: 700,
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                  boxShadow: '0 4px 10px rgba(33, 150, 243, 0.15)'
                },
                '&:hover': {
                  bgcolor: 'rgba(33, 150, 243, 0.04)',
                  color: '#2196f3'
                }
              }}
            />
            
            {/* Information tab - moved to the end */}
            <Tab 
              icon={<InfoIcon />}
              label="Information"
              sx={{
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'white',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #607D8B, #90A4AE)',
                  border: '1px solid rgba(96, 125, 139, 0.8)',
                  boxShadow: '0 4px 12px rgba(96, 125, 139, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.3)'
                }
              }}
            />
          </Tabs>
          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.08)' }} />
        </Paper>
      </motion.div>
    </Box>
  );
};

export default TabNav;