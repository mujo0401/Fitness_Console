import React from 'react';
import { 
  Grid, 
  Box, 
  Typography 
} from '@mui/material';
import { motion } from 'framer-motion';
import MetricGaugeCard from './MetricGaugeCard';

// Icons
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import WavesIcon from '@mui/icons-material/Waves';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

/**
 * AdvancedMetrics component for displaying comprehensive heart rate metrics
 * 
 * @param {Object} props
 * @param {Object} props.advancedMetrics - Advanced heart rate metrics data
 * @returns {JSX.Element} AdvancedMetrics component
 */
const AdvancedMetrics = ({ advancedMetrics }) => {
  // Animation container for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      <Grid container spacing={3}>
        {/* Recovery Score Card */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={item}>
            <MetricGaugeCard
              title="Recovery Score"
              value={advancedMetrics?.recoveryScore || 0}
              maxValue={100}
              icon={<BatteryChargingFullIcon />}
              color="auto"
              thresholds={[30, 50, 70]}
              thresholdColors={['error', 'warning', 'info', 'success']}
              status={advancedMetrics?.recoveryScore > 70 ? "Excellent" : 
                     advancedMetrics?.recoveryScore > 50 ? "Good" : 
                     advancedMetrics?.recoveryScore > 30 ? "Fair" : "Poor"}
              description="Overall recovery status based on heart metrics"
            />
          </motion.div>
        </Grid>
        
        {/* HRV Score Card */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={item}>
            <MetricGaugeCard
              title="HRV Score"
              value={advancedMetrics?.hrvScore || 0}
              maxValue={100}
              icon={<WavesIcon />}
              color="auto"
              thresholds={[20, 40, 60]}
              thresholdColors={['error', 'warning', 'info', 'success']}
              status={advancedMetrics?.hrvStatus || "Unknown"}
              description="Heart rate variability - key indicator of nervous system balance"
            />
          </motion.div>
        </Grid>
        
        {/* Stress Level Card */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={item}>
            <MetricGaugeCard
              title="Stress Level"
              value={advancedMetrics?.stressLevel || 0}
              maxValue={100}
              icon={<PsychologyIcon />}
              color="auto"
              thresholds={[30, 50, 70]}
              thresholdColors={['success', 'info', 'warning', 'error']}
              status={advancedMetrics?.stressLevel < 30 ? "Low" : 
                     advancedMetrics?.stressLevel < 50 ? "Moderate" : 
                     advancedMetrics?.stressLevel < 70 ? "High" : "Very High"}
              description="Estimated physiological stress based on HRV and HR patterns"
            />
          </motion.div>
        </Grid>
        
        {/* Cardio Fitness Card */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={item}>
            <MetricGaugeCard
              title="Cardio Fitness"
              value={advancedMetrics?.cardioFitnessScore || 0}
              maxValue={100}
              icon={<DirectionsRunIcon />}
              color="auto"
              thresholds={[30, 50, 70]}
              thresholdColors={['error', 'warning', 'info', 'success']}
              status={advancedMetrics?.cardioFitnessScore > 70 ? "Excellent" : 
                     advancedMetrics?.cardioFitnessScore > 50 ? "Good" : 
                     advancedMetrics?.cardioFitnessScore > 30 ? "Fair" : "Poor"}
              description={`Estimated VO2 Max: ${advancedMetrics?.vo2Max || 0} ml/kg/min`}
            />
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default AdvancedMetrics;