import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Collapse
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * InsightCard component for displaying AI-generated health insights
 * 
 * @param {Object} props
 * @param {string} props.title - Insight title
 * @param {string} props.detail - Detailed insight content
 * @param {string} props.type - Insight type (excellent, good, average, warning, alert, info)
 * @param {JSX.Element} props.icon - Icon element to display
 * @param {Array} props.actions - Optional array of action buttons
 * @param {boolean} props.expanded - Whether the card is initially expanded
 * @returns {JSX.Element} InsightCard component
 */
const InsightCard = ({ 
  title, 
  detail, 
  type = 'info', 
  icon, 
  actions,
  expanded = false
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  const getColor = () => {
    switch (type) {
      case 'excellent': return theme.palette.success;
      case 'good': return theme.palette.primary;
      case 'average': return theme.palette.info;
      case 'warning': return theme.palette.warning;
      case 'alert': return theme.palette.error;
      default: return theme.palette.info;
    }
  };
  
  const color = getColor();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={1}
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          border: `1px solid ${alpha(color.main, 0.2)}`,
          transition: 'all 0.2s ease',
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            cursor: 'pointer',
          }}
          onClick={() => setIsExpanded(prev => !prev)}
        >
          <Avatar 
            sx={{ 
              bgcolor: alpha(color.main, 0.1), 
              color: color.main,
              width: 40,
              height: 40
            }}
          >
            {icon}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
              {title}
            </Typography>
            
            <Collapse in={isExpanded} collapsedSize={36}>
              <Typography variant="body2" color="text.secondary" sx={{ 
                mb: isExpanded ? 2 : 0,
                maxHeight: isExpanded ? 'none' : '1.5em',
                overflow: 'hidden',
                textOverflow: isExpanded ? 'none' : 'ellipsis',
                whiteSpace: isExpanded ? 'normal' : 'nowrap'
              }}>
                {detail}
              </Typography>
            </Collapse>
          </Box>
          
          <IconButton size="small" sx={{ ml: 'auto' }}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        {isExpanded && actions && (
          <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

export default InsightCard;