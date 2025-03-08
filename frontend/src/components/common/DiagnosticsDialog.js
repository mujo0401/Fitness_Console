import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  useTheme,
  alpha
} from '@mui/material';

const DiagnosticsDialog = ({ 
  open, 
  onClose, 
  title = "Diagnostics", 
  data = {}, 
  rawData = [],
  dataQuality = {}
}) => {
  const theme = useTheme();
  const [showRawData, setShowRawData] = useState(false);

  const renderDataProperty = (label, value, important = false) => {
    return (
      <ListItem divider>
        <ListItemText
          primary={
            <Typography 
              variant={important ? "subtitle1" : "body2"} 
              fontWeight={important ? "bold" : "normal"}
            >
              {label}
            </Typography>
          }
          secondary={
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace', 
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                padding: 0.5,
                borderRadius: 1,
                maxWidth: '100%',
                overflow: 'auto'
              }}
            >
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </Typography>
          }
        />
      </ListItem>
    );
  };

  const renderDataQuality = () => {
    if (!dataQuality || Object.keys(dataQuality).length === 0) {
      return <Typography variant="body2">No data quality information available</Typography>;
    }

    return (
      <List dense sx={{ bgcolor: 'background.paper' }}>
        {Object.entries(dataQuality).map(([key, value], index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={key}
              secondary={
                typeof value === 'number' 
                  ? value.toFixed(2) 
                  : typeof value === 'object' 
                    ? JSON.stringify(value, null, 2)
                    : String(value)
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderRawData = () => {
    if (!rawData || rawData.length === 0) {
      return <Typography variant="body2">No raw data available</Typography>;
    }

    return (
      <Box 
        sx={{ 
          maxHeight: 400, 
          overflow: 'auto',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          padding: 1,
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          whiteSpace: 'pre-wrap'
        }}
      >
        {JSON.stringify(rawData.slice(0, 100), null, 2)}
        {rawData.length > 100 && (
          <Typography variant="caption" color="text.secondary">
            (showing first 100 items of {rawData.length})
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.default,
        }
      }}
    >
      <DialogTitle>
        {title}
        <Chip
          label={`${rawData?.length || 0} data points`}
          size="small"
          color="primary"
          sx={{ ml: 1 }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="h6" gutterBottom>Data Summary</Typography>
          <List dense sx={{ bgcolor: 'background.paper' }}>
            {Object.entries(data).map(([key, value], index) => (
              renderDataProperty(key, value, index < 3)
            ))}
          </List>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Data Quality Metrics</Typography>
          {renderDataQuality()}

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Raw Data
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setShowRawData(!showRawData)}
              sx={{ ml: 2 }}
            >
              {showRawData ? 'Hide' : 'Show'}
            </Button>
          </Typography>
          {showRawData && renderRawData()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosticsDialog;