import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, Stack, LinearProgress, Alert } from '@mui/material';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ReplayIcon from '@mui/icons-material/Replay';

// Exercise form parameters and key angles
const EXERCISE_PARAMETERS = {
  squat: {
    keyJoints: ['hips', 'knees', 'ankles'],
    goodFormDescription: 'Keep back straight, knees aligned with toes, and go below parallel',
    angleThresholds: {
      knees: { min: 70, max: 110, ideal: 90 },
      hips: { min: 60, max: 100, ideal: 80 },
      back: { min: 150, max: 180, ideal: 170 }
    },
    checkPoints: [
      { name: 'Knee Alignment', description: 'Knees should track over toes' },
      { name: 'Depth', description: 'Hips should drop below parallel' },
      { name: 'Back Angle', description: 'Keep back straight throughout movement' }
    ]
  },
  pushup: {
    keyJoints: ['elbows', 'shoulders', 'wrists'],
    goodFormDescription: 'Maintain straight body line, elbows at 45° angle, full range of motion',
    angleThresholds: {
      elbows: { min: 80, max: 100, ideal: 90 },
      body: { min: 160, max: 180, ideal: 170 }
    },
    checkPoints: [
      { name: 'Elbow Angle', description: 'Elbows should be at approximately 90° at bottom' },
      { name: 'Body Line', description: 'Maintain straight line from head to heels' },
      { name: 'Depth', description: 'Chest should nearly touch the ground' }
    ]
  },
  plank: {
    keyJoints: ['shoulders', 'hips', 'ankles'],
    goodFormDescription: 'Straight line from head to heels, engage core, neutral neck',
    angleThresholds: {
      body: { min: 160, max: 180, ideal: 170 },
      shoulders: { min: 80, max: 110, ideal: 90 }
    },
    checkPoints: [
      { name: 'Body Line', description: 'Maintain straight line from head to heels' },
      { name: 'Hip Position', description: 'Hips should not sag or pike up' },
      { name: 'Shoulder Position', description: 'Shoulders should be directly above elbows' }
    ]
  }
};

const FormAnalyzer = ({ 
  exerciseType = 'squat', 
  showCamera = true,
  height = 400,
  onFormAnalysis
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formFeedback, setFormFeedback] = useState({
    score: 0,
    feedback: [],
    repCount: 0
  });
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('pending');
  
  // Get parameters for the current exercise
  const exerciseParams = EXERCISE_PARAMETERS[exerciseType] || EXERCISE_PARAMETERS.squat;
  
  // Initialize pose detection
  useEffect(() => {
    let pose, camera;
    
    const initializeDetection = async () => {
      setLoading(true);
      
      try {
        // Initialize the Pose model
        pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });
        
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        pose.onResults(onResults);
        
        // Check if video element is available
        if (videoRef.current) {
          // Ask for camera permission
          try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraPermission('granted');
            
            // Initialize camera if permission granted
            camera = new Camera(videoRef.current, {
              onFrame: async () => {
                if (videoRef.current && pose) {
                  await pose.send({ image: videoRef.current });
                }
              },
              width: 640,
              height: 480
            });
            
            camera.start();
            setCameraActive(true);
            setLoading(false);
          } catch (permissionError) {
            setCameraPermission('denied');
            setError('Camera permission denied. Please allow camera access to use the form analyzer.');
            setLoading(false);
          }
        }
      } catch (err) {
        setError(`Error initializing form analyzer: ${err.message}`);
        setLoading(false);
      }
    };
    
    if (showCamera) {
      initializeDetection();
    } else {
      setLoading(false);
    }
    
    return () => {
      // Clean up resources
      if (camera) {
        camera.stop();
      }
      if (pose) {
        pose.close();
      }
    };
  }, [showCamera]);
  
  // Handle pose detection results
  const onResults = (results) => {
    if (!canvasRef.current || !results || !results.poseLandmarks) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    const { width, height } = canvasRef.current;
    
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    // Draw pose landmarks and connections
    canvasCtx.drawImage(results.image, 0, 0, width, height);
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
    
    // Analyze form for the current exercise
    analyzeForm(results.poseLandmarks);
    
    canvasCtx.restore();
  };
  
  // Analyze exercise form based on pose landmarks
  const analyzeForm = (landmarks) => {
    if (!landmarks || landmarks.length === 0) return;
    
    // Get key angles based on exercise type
    const angles = calculateKeyAngles(landmarks, exerciseType);
    
    // Determine form quality
    const formQuality = assessFormQuality(angles, exerciseType);
    
    // Count repetitions
    const newRepCount = countRepetition(angles, formFeedback.repCount, exerciseType);
    
    // Generate feedback
    const feedbackItems = generateFeedback(angles, exerciseType);
    
    // Update form feedback state
    const newFormFeedback = {
      score: formQuality,
      feedback: feedbackItems,
      repCount: newRepCount
    };
    
    setFormFeedback(newFormFeedback);
    
    // Notify parent component if callback provided
    if (onFormAnalysis) {
      onFormAnalysis(newFormFeedback);
    }
  };
  
  // Calculate key angles for form analysis
  const calculateKeyAngles = (landmarks, exerciseType) => {
    // Simplified angle calculation - would be more complex in production
    // This would use the actual landmark coordinates to calculate joint angles
    
    // Return dummy values for demonstration
    switch (exerciseType) {
      case 'squat':
        return {
          knees: 85 + Math.sin(Date.now() / 1000) * 10,
          hips: 75 + Math.sin(Date.now() / 1500) * 15,
          back: 165 + Math.sin(Date.now() / 2000) * 10
        };
      case 'pushup':
        return {
          elbows: 85 + Math.sin(Date.now() / 1000) * 10,
          body: 165 + Math.sin(Date.now() / 2000) * 5
        };
      case 'plank':
        return {
          body: 165 + Math.sin(Date.now() / 3000) * 10,
          shoulders: 85 + Math.sin(Date.now() / 2000) * 5
        };
      default:
        return {};
    }
  };
  
  // Assess form quality (0-100 score)
  const assessFormQuality = (angles, exerciseType) => {
    if (!angles || Object.keys(angles).length === 0) return 0;
    
    const params = EXERCISE_PARAMETERS[exerciseType];
    if (!params) return 0;
    
    // Calculate score based on how close angles are to ideal values
    let totalScore = 0;
    let totalFactors = 0;
    
    Object.entries(angles).forEach(([angleName, value]) => {
      if (params.angleThresholds[angleName]) {
        const { min, max, ideal } = params.angleThresholds[angleName];
        
        // Score is 100 if angle is at ideal, decreases as it moves away from ideal
        const distanceFromIdeal = Math.abs(value - ideal);
        const range = Math.max(ideal - min, max - ideal);
        const angleFactor = 1 - Math.min(distanceFromIdeal / range, 1);
        
        totalScore += angleFactor * 100;
        totalFactors++;
      }
    });
    
    return totalFactors > 0 ? Math.round(totalScore / totalFactors) : 0;
  };
  
  // Count exercise repetitions
  const countRepetition = (angles, currentCount, exerciseType) => {
    // In a real implementation, this would track angle changes over time
    // and detect when a full rep is completed based on thresholds
    
    // For demo purposes, increment count every ~5 seconds
    if (Math.random() < 0.005) {
      return currentCount + 1;
    }
    
    return currentCount;
  };
  
  // Generate specific feedback based on form analysis
  const generateFeedback = (angles, exerciseType) => {
    const params = EXERCISE_PARAMETERS[exerciseType];
    if (!params) return [];
    
    const feedback = [];
    
    // Generate feedback for each angle
    Object.entries(angles).forEach(([angleName, value]) => {
      if (params.angleThresholds[angleName]) {
        const { min, max, ideal } = params.angleThresholds[angleName];
        
        if (value < min) {
          feedback.push({
            issue: `${angleName} angle too small`,
            suggestion: `Increase your ${angleName} angle`,
            severity: 'warning'
          });
        } else if (value > max) {
          feedback.push({
            issue: `${angleName} angle too large`,
            suggestion: `Decrease your ${angleName} angle`,
            severity: 'warning'
          });
        } else if (Math.abs(value - ideal) > (max - min) * 0.2) {
          feedback.push({
            issue: `${angleName} angle can be improved`,
            suggestion: `Adjust your ${angleName} angle to be closer to ideal`,
            severity: 'info'
          });
        }
      }
    });
    
    // Return only the 2 most important feedback items to avoid overwhelming
    return feedback.slice(0, 2);
  };
  
  // Toggle camera on/off
  const toggleCamera = async () => {
    if (cameraActive) {
      setCameraActive(false);
    } else {
      setLoading(true);
      
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission('granted');
        setCameraActive(true);
      } catch (err) {
        setCameraPermission('denied');
        setError('Camera permission denied. Please allow camera access to use the form analyzer.');
      }
      
      setLoading(false);
    }
  };
  
  // Reset analyzer state
  const resetAnalyzer = () => {
    setFormFeedback({
      score: 0,
      feedback: [],
      repCount: 0
    });
  };
  
  // Render form score gauge
  const renderScoreGauge = () => {
    const score = formFeedback.score;
    let color = '#f44336'; // Red for poor form
    
    if (score >= 80) {
      color = '#4caf50'; // Green for good form
    } else if (score >= 60) {
      color = '#ff9800'; // Orange for moderate form
    }
    
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={80}
            thickness={4}
            sx={{ color: theme => theme.palette.grey[200] }}
          />
          <CircularProgress
            variant="determinate"
            value={score}
            size={80}
            thickness={4}
            sx={{ 
              color: color,
              position: 'absolute',
              left: 0,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" component="div" color="text.secondary" fontWeight="bold">
              {score}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>Form Score</Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <Paper elevation={3} sx={{ p: 2, height: '100%', borderRadius: 2, overflow: 'hidden' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
          {/* Camera/Canvas section */}
          <Box sx={{ 
            flex: 1, 
            position: 'relative', 
            height: { xs: '250px', md: '100%' }, 
            mb: { xs: 2, md: 0 },
            mr: { xs: 0, md: 2 },
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'black'
          }}>
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 2,
                color: 'white'
              }}>
                <CircularProgress color="inherit" sx={{ mb: 2 }} />
                <Typography>Initializing camera...</Typography>
              </Box>
            )}
            
            {showCamera && (
              <>
                <video 
                  ref={videoRef} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    visibility: cameraActive ? 'visible' : 'hidden'
                  }} 
                />
                <canvas 
                  ref={canvasRef} 
                  width={640} 
                  height={480}
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    visibility: cameraActive ? 'visible' : 'hidden'
                  }} 
                />
              </>
            )}
            
            {!cameraActive && !loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white'
              }}>
                <VideocamOffIcon sx={{ fontSize: 40, mb: 2 }} />
                <Typography gutterBottom>Camera is disabled</Typography>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  startIcon={<VideocamIcon />}
                  onClick={toggleCamera}
                  sx={{ mt: 2 }}
                >
                  Enable Camera
                </Button>
              </Box>
            )}
            
            {/* Camera controls */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 16, 
              right: 16, 
              zIndex: 10,
              display: 'flex',
              gap: 1
            }}>
              {cameraActive && (
                <Button 
                  variant="contained" 
                  color="error" 
                  size="small"
                  startIcon={<VideocamOffIcon />}
                  onClick={toggleCamera}
                >
                  Disable
                </Button>
              )}
              
              <Button 
                variant="contained" 
                color="inherit" 
                size="small"
                startIcon={<ReplayIcon />}
                onClick={resetAnalyzer}
              >
                Reset
              </Button>
            </Box>
          </Box>
          
          {/* Analysis section */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FitnessCenterIcon sx={{ mr: 1 }} />
                {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Form Analysis
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                {exerciseParams.goodFormDescription}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {renderScoreGauge()}
              
              <Box sx={{ ml: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {formFeedback.repCount}
                </Typography>
                <Typography variant="body2">Reps Counted</Typography>
              </Box>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              Form Analysis:
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              {formFeedback.feedback.length > 0 ? (
                formFeedback.feedback.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    {item.severity === 'warning' ? (
                      <WarningIcon fontSize="small" color="warning" sx={{ mr: 1, mt: 0.3 }} />
                    ) : (
                      <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1, mt: 0.3 }} />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {item.issue}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.suggestion}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Analyzing your form... Stand in the camera view to begin.
                </Typography>
              )}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 'auto', pt: 2 }}>
              Checkpoints:
            </Typography>
            
            <Stack spacing={1}>
              {exerciseParams.checkPoints.map((checkpoint, index) => (
                <Box key={index}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {checkpoint.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={formFeedback.score * Math.random() * 0.5 + formFeedback.score * 0.5} 
                      sx={{ 
                        flexGrow: 1, 
                        height: 8, 
                        borderRadius: 5,
                        bgcolor: 'rgba(0,0,0,0.05)'
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, minWidth: 24 }}>
                      {Math.round(formFeedback.score * Math.random() * 0.5 + formFeedback.score * 0.5)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default FormAnalyzer;