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
  Stack, 
  LinearProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

/**
 * ZoneDetailDialog component for displaying detailed information about a heart rate zone
 * 
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Handler for dialog close
 * @param {Object} props.zone - Zone data to display
 * @param {Array} props.zoneDistribution - Zone distribution data
 * @returns {JSX.Element} ZoneDetailDialog component
 */
const ZoneDetailDialog = ({ open, onClose, zone, zoneDistribution }) => {
  if (!zone) return null;
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundImage: zone.gradient || 'none',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        py: 3
      }}>
        <Avatar 
          sx={{ 
            width: 48, 
            height: 48,
            bgcolor: alpha('#fff', 0.2)
          }}
        >
          {zone.icon}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold">{zone.name} Zone</Typography>
          <Typography variant="subtitle1">{zone.intensity} Intensity ({zone.min}-{zone.max} BPM)</Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ ml: 'auto', color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pb: 4 }}>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Typography variant="body1" paragraph>
            {zone.description}
          </Typography>
          
          <Typography variant="h6" gutterBottom>Benefits</Typography>
          <Typography variant="body1" paragraph>
            {zone.benefits}
          </Typography>
          
          <Typography variant="h6" gutterBottom>Training Recommendation</Typography>
          <Typography variant="body1">
            {zone.recommendation}
          </Typography>
          
          <Box sx={{ mt: 4, p: 3, bgcolor: alpha('#000', 0.1), borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Time Spent in This Zone:
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              {zoneDistribution?.find(z => z.name === zone.name)?.value || 0}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={zoneDistribution?.find(z => z.name === zone.name)?.value || 0} 
              sx={{ 
                mt: 2,
                height: 12, 
                borderRadius: 2,
                bgcolor: alpha('#fff', 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: alpha('#fff', 0.8)
                }
              }} 
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          variant="contained"
          onClick={onClose}
          sx={{ 
            bgcolor: alpha('#fff', 0.3),
            color: 'white',
            '&:hover': {
              bgcolor: alpha('#fff', 0.4)
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ZoneDetailDialog;