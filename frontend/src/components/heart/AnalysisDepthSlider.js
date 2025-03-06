import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Slider,
  Chip 
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

/**
 * AnalysisDepthSlider component for controlling AI analysis depth
 * 
 * @param {Object} props
 * @param {number} props.aiAnalysisDepth - Current analysis depth value (1-5)
 * @param {Function} props.onDepthChange - Handler for depth change
 * @returns {JSX.Element} AnalysisDepthSlider component
 */
const AnalysisDepthSlider = ({ aiAnalysisDepth, onDepthChange }) => {
  const theme = useTheme();

  const getDepthLabel = () => {
    switch (aiAnalysisDepth) {
      case 1: return "Basic";
      case 2: return "Standard";
      case 3: return "Enhanced";
      case 4: return "Advanced";
      case 5: return "Comprehensive";
      default: return "Standard";
    }
  };

  const getChipColor = () => {
    switch (aiAnalysisDepth) {
      case 1:
      case 2: return "primary";
      case 3: return "info";
      case 4: return "success";
      case 5: return "warning";
      default: return "primary";
    }
  };

  const getDepthDescription = () => {
    switch (aiAnalysisDepth) {
      case 1: return 'Basic analysis focusing on essential heart rate metrics only';
      case 2: return 'Standard analysis with general health insights and zone information';
      case 3: return 'Enhanced analysis with HRV, recovery metrics, and personalized recommendations';
      case 4: return 'Advanced analysis with detailed patterns, anomaly detection, and physiological explanations';
      case 5: return 'Research-grade comprehensive analysis with scientific context and longitudinal patterns';
      default: return 'Standard analysis with general health insights and zone information';
    }
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.grey[100], 0.7),
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
      }}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight="medium">Analysis Depth</Typography>
        <Chip 
          label={getDepthLabel()} 
          size="small"
          color={getChipColor()}
          sx={{ fontWeight: 'medium' }}
        />
      </Box>
      
      <Box sx={{ px: 1 }}>
        <Slider
          value={aiAnalysisDepth}
          onChange={onDepthChange}
          step={1}
          marks={[
            { value: 1, label: 'Basic' },
            { value: 2, label: 'Standard' },
            { value: 3, label: 'Enhanced' },
            { value: 4, label: 'Advanced' },
            { value: 5, label: 'Research' }
          ]}
          min={1}
          max={5}
          sx={{ 
            '& .MuiSlider-markLabel': {
              fontSize: '0.7rem'
            }
          }}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {getDepthDescription()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AnalysisDepthSlider;