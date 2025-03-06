import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Button,
  Divider,
  Slider,
  Stack,
  Rating,
  Chip 
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BiotechIcon from '@mui/icons-material/Biotech';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

/**
 * AIExplanationDialog component for explaining AI analysis functionality
 * 
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Handler for dialog close
 * @param {string} props.analysisMode - Current AI analysis mode
 * @param {number} props.aiAnalysisDepth - Current analysis depth level (1-5)
 * @param {Function} props.onDepthChange - Handler for depth change
 * @param {Object} props.userFeedback - User feedback data
 * @param {Function} props.onFeedbackSubmit - Handler for feedback submission
 * @returns {JSX.Element} AIExplanationDialog component
 */
const AIExplanationDialog = ({ 
  open, 
  onClose, 
  analysisMode = 'basic', 
  aiAnalysisDepth = 2,
  onDepthChange,
  userFeedback,
  onFeedbackSubmit
}) => {
  // Handle depth slider change
  const handleDepthChange = (event, newValue) => {
    if (onDepthChange) {
      onDepthChange(event, newValue);
    }
  };
  
  // Handle feedback rating change
  const handleRatingChange = (event, newValue) => {
    if (onFeedbackSubmit) {
      onFeedbackSubmit(newValue, userFeedback?.comment || "");
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha('#3f51b5', 0.2)}`,
        background: alpha('#3f51b5', 0.05)
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#3f51b5' }}>
            <AutoFixHighIcon />
          </Avatar>
          <Typography variant="h6">AI-Powered Heart Rate Analysis</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            About {analysisMode === 'research' ? 'Research Mode' : analysisMode === 'personalized' ? 'Personalized Analysis' : 'AI Analysis'}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {analysisMode === 'research' ? (
              <>Our advanced research-grade algorithms analyze your heart rate patterns using scientific methods derived from peer-reviewed cardiac research. This mode provides the most detailed analysis with physiological explanations and evidence-based insights.</>
            ) : analysisMode === 'personalized' ? (
              <>The personalized analysis mode tailors insights specifically to your historical data, activity preferences, and physical profile. This creates a more relevant analysis that considers your unique cardiovascular patterns and health goals.</>
            ) : (
              <>Our AI algorithms analyze your heart rate data to identify patterns, anomalies, and trends. The analysis provides insights into your cardiovascular health, recovery status, and training effectiveness.</>
            )}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Analysis Depth
          </Typography>
          
          <Box sx={{ px: 2, mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: 80 }}>Basic</Typography>
              <Slider
                value={aiAnalysisDepth}
                onChange={handleDepthChange}
                step={1}
                marks
                min={1}
                max={5}
                sx={{ mx: 1 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: 120 }}>Comprehensive</Typography>
            </Stack>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {aiAnalysisDepth === 1 && 'Basic analysis focusing on essential heart rate metrics only'}
              {aiAnalysisDepth === 2 && 'Standard analysis with general health insights and basic zone analysis'}
              {aiAnalysisDepth === 3 && 'Enhanced analysis including heart rate variability and recovery assessment'}
              {aiAnalysisDepth === 4 && 'Advanced analysis with detailed cardiac efficiency and personalized recommendations'}
              {aiAnalysisDepth === 5 && 'Comprehensive research-grade analysis with all available metrics and scientific context'}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Data Usage
          </Typography>
          
          <Typography variant="body2" paragraph>
            The analysis is performed using your heart rate data from the selected time period. It may include:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Resting heart rate and heart rate variability metrics
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Heart rate zone distribution analysis
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Recovery pattern assessment
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Sleep quality indicators (when sleep data is available)
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Circadian rhythm patterns
            </Typography>
            {analysisMode === 'personalized' && (
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                Comparison with your historical data patterns
              </Typography>
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Feedback
          </Typography>
          
          <Typography variant="body2" paragraph>
            Your feedback helps us improve our analysis algorithms. Please rate the usefulness of the insights provided:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 2 }}>
            <Rating
              name="ai-feedback"
              value={userFeedback?.rating || 0}
              onChange={handleRatingChange}
              size="large"
              icon={<SentimentVerySatisfiedIcon fontSize="inherit" />}
              emptyIcon={<SentimentVerySatisfiedIcon fontSize="inherit" />}
            />
            
            <Typography variant="caption" color="text.secondary">
              {userFeedback?.rating ? 'Thank you for your feedback!' : 'Tap to rate'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AutoFixHighIcon />}
          onClick={onClose}
        >
          Return to Analysis
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIExplanationDialog;