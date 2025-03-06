import React from 'react';
import { 
  IconButton, 
  Tooltip, 
  Badge, 
  useTheme, 
  alpha
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import BugReportIcon from '@mui/icons-material/BugReport';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import HotelIcon from '@mui/icons-material/Hotel';

/**
 * A small, subtle button component that opens the diagnostics panel
 * 
 * @param {Object} props
 * @param {boolean} props.hasIssues - Whether there are any issues (missing scopes, etc.)
 * @param {boolean} props.useMockData - Whether mock data is being used
 * @param {function} props.onClick - Function to call when the button is clicked
 * @param {string} props.currentTab - Current tab ('heart', 'activity', or 'sleep')
 */
const DiagnosticsButton = ({ 
  hasIssues = false, 
  useMockData = false, 
  onClick, 
  currentTab = 'heart' 
}) => {
  const theme = useTheme();
  
  // Determine icon based on current tab
  const getTabIcon = () => {
    switch(currentTab) {
      case 'heart':
        return <MonitorHeartIcon fontSize="small" />;
      case 'activity':
        return <DirectionsRunIcon fontSize="small" />;
      case 'sleep':
        return <HotelIcon fontSize="small" />;
      default:
        return <BugReportIcon fontSize="small" />;
    }
  };

  // Determine color based on status
  const getButtonColor = () => {
    if (hasIssues) return theme.palette.error.main;
    if (useMockData) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  return (
    <Tooltip 
      title={
        hasIssues 
          ? "Issues detected with API or permissions - Click for diagnostics" 
          : useMockData 
            ? "Using mock data - Click for diagnostics" 
            : "Click to open diagnostics panel"
      }
      arrow
      placement="top"
    >
      <Badge
        variant="dot"
        invisible={!hasIssues && !useMockData}
        color={hasIssues ? "error" : "warning"}
        overlap="circular"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <IconButton
          size="small"
          onClick={onClick}
          sx={{
            opacity: 0.6,
            transition: 'all 0.2s ease',
            '&:hover': { 
              opacity: 1,
              transform: 'scale(1.05)',
              bgcolor: alpha(getButtonColor(), 0.1),
            },
            bgcolor: alpha(getButtonColor(), 0.05),
            color: getButtonColor(),
            border: hasIssues ? `1px dashed ${theme.palette.error.main}` : 
                   useMockData ? `1px dashed ${theme.palette.warning.main}` : 
                   'none',
            width: 28,
            height: 28,
          }}
        >
          {getTabIcon()}
        </IconButton>
      </Badge>
    </Tooltip>
  );
};

export default DiagnosticsButton;