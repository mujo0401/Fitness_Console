import React from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';

// Icons
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import AnalyticsIcon from '@mui/icons-material/Analytics';

/**
 * AnalysisTabs component for tab navigation in the heart rate analysis
 * 
 * @param {Object} props
 * @param {number} props.activeTab - Index of the active tab
 * @param {Function} props.onTabChange - Handler for tab change
 * @returns {JSX.Element} AnalysisTabs component
 */
const AnalysisTabs = ({ activeTab, onTabChange }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Tabs 
      value={activeTab} 
      onChange={onTabChange}
      variant="fullWidth"
      TabIndicatorProps={{
        style: {
          height: 4,
          borderRadius: '4px 4px 0 0'
        }
      }}
      sx={{ 
        mb: 2,
        '& .MuiTab-root': { 
          fontWeight: 'bold',
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          textTransform: 'none',
          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
        }
      }}
    >
      <Tab icon={<ShowChartIcon />} label={isExtraSmallScreen ? "Chart" : "Interactive Chart"} />
      <Tab icon={<AutoFixHighIcon />} label={isExtraSmallScreen ? "AI Analysis" : "AI-Powered Analysis"} />
      <Tab icon={<DataThresholdingIcon />} label={isExtraSmallScreen ? "Zones" : "Heart Rate Zones"} />
      {!isSmallScreen && <Tab icon={<AnalyticsIcon />} label="Compare" />}
    </Tabs>
  );
};

export default AnalysisTabs;