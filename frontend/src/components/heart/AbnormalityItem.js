import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, IconButton, Collapse, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * Component to display heart rate abnormalities with expandable details
 */
const AbnormalityItem = ({ abnormality, expanded = false }) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  const getSeverityColor = () => {
    switch (abnormality.severity) {
      case 'High': return theme.palette.error.main;
      case 'Medium': return theme.palette.warning.main;
      case 'Low': return theme.palette.info.main;
      default: return theme.palette.warning.main;
    }
  };
  
  const severityColor = getSeverityColor();
  
  return (
    <Paper 
      variant="outlined"
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        mb: 2,
        borderColor: alpha(severityColor, 0.3),
        bgcolor: alpha(severityColor, 0.03)
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          cursor: 'pointer',
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 2
        }}
        onClick={() => setIsExpanded(prev => !prev)}
      >
        <WarningAmberIcon sx={{ color: severityColor, mt: 0.5 }} />
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
              {abnormality.type}
            </Typography>
            <Chip 
              label={abnormality.severity} 
              size="small" 
              sx={{ 
                bgcolor: alpha(severityColor, 0.1), 
                color: severityColor,
                fontWeight: 'medium',
                fontSize: '0.7rem',
                height: 24
              }} 
            />
          </Box>
          
          <Typography variant="body2" color="text.primary">
            {abnormality.value}
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            {abnormality.date} {abnormality.time && `at ${abnormality.time}`}
          </Typography>
        </Box>
        
        <IconButton size="small">
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={isExpanded}>
        <Box sx={{ px: 2, pb: 2, pt: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Recommendation:</strong> {abnormality.recommendation || "Monitor for any symptoms and consult a healthcare provider if concerned."}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AbnormalityItem;