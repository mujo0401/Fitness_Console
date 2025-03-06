import React from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton,
  Chip,
  Button,
  IconButton,
  Tooltip 
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InfoIcon from '@mui/icons-material/Info';
import { motion } from 'framer-motion';

/**
 * AnalysisControls component for AI analysis mode selection and related controls
 * 
 * @param {Object} props
 * @param {string} props.analysisMode - Current AI analysis mode
 * @param {Function} props.onAnalysisModeChange - Handler for analysis mode change
 * @param {Array} props.ANALYSIS_MODES - Available analysis modes data
 * @param {boolean} props.compareHistoricalData - Whether historical comparison is enabled
 * @param {Function} props.onToggleHistoricalComparison - Handler for toggling historical comparison
 * @param {Function} props.onOpenExplanation - Handler for opening the explanation dialog
 * @returns {JSX.Element} AnalysisControls component
 */
const AnalysisControls = ({ 
  analysisMode, 
  onAnalysisModeChange, 
  ANALYSIS_MODES,
  compareHistoricalData,
  onToggleHistoricalComparison,
  onOpenExplanation
}) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>Analysis Mode:</Typography>
          <ToggleButtonGroup
            value={analysisMode}
            exclusive
            onChange={onAnalysisModeChange}
            size="small"
            sx={{ 
              flexWrap: 'wrap',
              '& .MuiToggleButtonGroup-grouped': {
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 'bold'
                }
              }
            }}
          >
            {ANALYSIS_MODES.map((mode) => (
              <ToggleButton 
                key={mode.value} 
                value={mode.value}
                sx={{ 
                  display: 'flex', 
                  gap: 0.5,
                  py: 0.5,
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  minWidth: { xs: mode.value === 'personalized' || mode.value === 'research' ? 110 : 80, sm: 'auto' }
                }}
              >
                {mode.icon} {mode.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {compareHistoricalData ? (
            <Chip 
              icon={<CompareArrowsIcon />}
              label="Historical Comparison ON" 
              color="primary"
              variant="outlined"
              size="small"
              onClick={onToggleHistoricalComparison}
              onDelete={onToggleHistoricalComparison}
            />
          ) : (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<CompareArrowsIcon />}
              onClick={onToggleHistoricalComparison}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Compare with History
            </Button>
          )}
          
          <Tooltip title="Learn more about AI analysis modes and settings">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={onOpenExplanation}
              sx={{ 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default AnalysisControls;