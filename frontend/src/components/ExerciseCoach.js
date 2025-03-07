import React from 'react';
import { Box } from '@mui/material';
import ExerciseCoachTab from '../pages/ExerciseCoachTab';

// This is a wrapper component to render the ExerciseCoachTab
// in the dashboard tab system
const ExerciseCoach = () => {
  return (
    <Box>
      <ExerciseCoachTab />
    </Box>
  );
};

export default ExerciseCoach;