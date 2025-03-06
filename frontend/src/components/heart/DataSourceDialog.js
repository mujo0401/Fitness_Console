import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Stack, 
  Radio, 
  Divider,
  alpha
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import { useTheme } from '@mui/material/styles';

/**
 * DataSourceDialog component for selecting and managing heart rate data sources
 * Shows available data sources and allows the user to choose which data to display
 */
const DataSourceDialog = ({ 
  open, 
  onClose, 
  dataSourcesAvailable, 
  activeDataSource, 
  onDataSourceChange 
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="data-source-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: 'md'
        }
      }}
    >
      <DialogTitle id="data-source-dialog-title" sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: alpha(theme.palette.primary.main, 0.05)
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DevicesIcon color="primary" />
          <Typography variant="h6">Data Source Settings</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select which fitness tracking data source to use for heart rate data.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Active Data Sources
            </Typography>
            <Stack spacing={1} sx={{ ml: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  icon={<FitnessCenterIcon />} 
                  label="Fitbit" 
                  color={dataSourcesAvailable.fitbit ? "primary" : "default"}
                  variant={dataSourcesAvailable.fitbit ? "filled" : "outlined"}
                />
                <Typography variant="body2">
                  {dataSourcesAvailable.fitbit ? "Connected" : "Not connected"}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  icon={<GoogleIcon />} 
                  label="Google Fit" 
                  color={dataSourcesAvailable.googleFit ? "primary" : "default"}
                  variant={dataSourcesAvailable.googleFit ? "filled" : "outlined"}
                />
                <Typography variant="body2">
                  {dataSourcesAvailable.googleFit ? "Connected" : "Not connected"}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  icon={<AppleIcon />} 
                  label="Apple Health" 
                  color={dataSourcesAvailable.appleHealth ? "primary" : "default"}
                  variant={dataSourcesAvailable.appleHealth ? "filled" : "outlined"}
                />
                <Typography variant="body2">
                  {dataSourcesAvailable.appleHealth ? "Connected" : "Not connected"}
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Data Source Selection Strategy
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Radio 
                checked={activeDataSource === 'auto'} 
                onChange={() => onDataSourceChange('auto')} 
              />
              <Box>
                <Typography variant="body2">Automatic (Best Quality)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Automatically select the highest quality data from available sources
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Radio 
                checked={activeDataSource === 'fitbit'} 
                onChange={() => onDataSourceChange('fitbit')}
                disabled={!dataSourcesAvailable.fitbit}
              />
              <Box>
                <Typography variant="body2">Fitbit Only</Typography>
                <Typography variant="caption" color="text.secondary">
                  Only use Fitbit data regardless of quality
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Radio 
                checked={activeDataSource === 'googleFit'} 
                onChange={() => onDataSourceChange('googleFit')}
                disabled={!dataSourcesAvailable.googleFit}
              />
              <Box>
                <Typography variant="body2">Google Fit Only</Typography>
                <Typography variant="caption" color="text.secondary">
                  Only use Google Fit data regardless of quality
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Radio 
                checked={activeDataSource === 'appleHealth'} 
                onChange={() => onDataSourceChange('appleHealth')}
                disabled={!dataSourcesAvailable.appleHealth}
              />
              <Box>
                <Typography variant="body2">Apple Health Only</Typography>
                <Typography variant="caption" color="text.secondary">
                  Only use Apple Health data regardless of quality
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Radio 
                checked={activeDataSource === 'combined'} 
                onChange={() => onDataSourceChange('combined')}
                disabled={Object.values(dataSourcesAvailable).filter(Boolean).length < 2}
              />
              <Box>
                <Typography variant="body2">Combine All Data</Typography>
                <Typography variant="caption" color="text.secondary">
                  Merge data from all available sources (may contain duplicates)
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataSourceDialog;