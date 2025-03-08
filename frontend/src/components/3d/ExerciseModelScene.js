import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { 
  OrbitControls, 
  Environment, 
  useAnimations, 
  PerspectiveCamera, 
  useGLTF
} from '@react-three/drei';
import { Box, Typography, CircularProgress, Button, Stack, Paper, Alert } from '@mui/material';
import { AnimationMixer, LoopRepeat } from 'three';
import { LinearEncoding, compatibilityLayer } from './ThreeAdapter';

// Physics-based advanced model component with biomechanical animation
const ExerciseModel = ({ modelUrl, exerciseType, paused, onLoadComplete }) => {
  // Base model references
  const group = useRef();
  const headRef = useRef();
  const torsoRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftFootRef = useRef();
  const rightFootRef = useRef();
  const spotlightRef = useRef();
  
  // Detailed anatomical references
  const leftShoulderRef = useRef();
  const rightShoulderRef = useRef();
  const spineRef = useRef();
  const pelvisRef = useRef();
  const leftKneeRef = useRef();
  const rightKneeRef = useRef();
  const leftElbowRef = useRef();
  const rightElbowRef = useRef();
  
  // Physics and movement state
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [isInhalation, setIsInhalation] = useState(true);
  const [exercisePhase, setExercisePhase] = useState(0);
  const [repetitionCount, setRepetitionCount] = useState(0);
  const [fatigueFactor, setFatigueFactor] = useState(0);
  const [stabilityFactor, setStabilityFactor] = useState(1);
  const [momentumVector, setMomentumVector] = useState({ x: 0, y: 0, z: 0 });
  const [groundContactForce, setGroundContactForce] = useState(0);
  
  // Biomechanical simulation parameters
  const gravitationalConstant = 9.81; // m/s²
  const bodyMassDistribution = {
    head: 0.08,
    torso: 0.55,
    arms: 0.05,
    legs: 0.16
  };
  
  // Advanced muscle system with activation levels
  const [muscleActivation, setMuscleActivation] = useState({
    quads: 0,
    hamstrings: 0,
    glutes: 0,
    core: 0,
    chest: 0,
    shoulders: 0,
    biceps: 0,
    triceps: 0,
    calves: 0,
    lats: 0
  });

  // Define comprehensive exercise animation parameters with biomechanical data
  const exerciseParams = {
    squat: {
      duration: 3.0, // seconds per rep
      phases: ['preparation', 'eccentric', 'isometric_hold', 'concentric', 'recovery'],
      phaseDistribution: [0.1, 0.4, 0.1, 0.3, 0.1], // percentage of total duration
      breathingPattern: { inhalePhase: 'eccentric', exhalePhase: 'concentric' },
      primaryMuscles: ['quads', 'glutes', 'hamstrings', 'core'],
      secondaryMuscles: ['calves', 'lats', 'shoulders'],
      intensity: 0.8,
      energyExpenditure: 0.1, // kcal per rep per kg of bodyweight
      forceProfile: {
        peak: 2.5, // times bodyweight
        distribution: 'bell_curve',
        groundReaction: 1.2 // times bodyweight
      },
      jointBiomechanics: {
        knees: { 
          min: 80, max: 170, 
          torque: 40, // N·m per kg bodyweight
          rotationAxis: [0, 0, 1],
          stabilizers: ['vastus_medialis', 'vastus_lateralis']
        },
        hips: { 
          min: 70, max: 170, 
          torque: 48,
          rotationAxis: [0, 0, 1],
          stabilizers: ['gluteus_medius', 'adductors']
        },
        ankles: { 
          min: 70, max: 110, 
          torque: 15,
          rotationAxis: [0, 0, 1],
          stabilizers: ['tibialis_anterior', 'soleus']
        },
        spine: {
          flexion: 15, // max degrees
          extension: 5,
          torque: 40,
          stabilizers: ['erector_spinae', 'multifidus']
        }
      },
      formCriticalPoints: [
        { phase: 0.5, check: 'kneeAlignment', tolerance: 10 }, // degrees
        { phase: 0.5, check: 'spinalNeutrality', tolerance: 5 },
        { phase: 0.5, check: 'weightDistribution', tolerance: 0.2 }
      ],
      performanceVariables: {
        tempo: [2, 1, 2, 0], // seconds: eccentric, bottom, concentric, top
        pausePositions: [0.5], // normalized phase position for isometric hold
        rangeOfMotion: 0.9 // percentage of full anatomical ROM
      }
    },
    pushup: {
      duration: 2.5,
      phases: ['preparation', 'eccentric', 'isometric_hold', 'concentric', 'recovery'],
      phaseDistribution: [0.1, 0.3, 0.1, 0.4, 0.1],
      breathingPattern: { inhalePhase: 'eccentric', exhalePhase: 'concentric' },
      primaryMuscles: ['chest', 'triceps', 'shoulders', 'core'],
      secondaryMuscles: ['lats', 'biceps', 'serratus'],
      intensity: 0.9,
      energyExpenditure: 0.08,
      forceProfile: {
        peak: 0.7,
        distribution: 'plateau',
        groundReaction: 0.7
      },
      jointBiomechanics: {
        elbows: { 
          min: 70, max: 160, 
          torque: 25,
          rotationAxis: [1, 0, 0],
          stabilizers: ['triceps_lateral_head', 'anconeus']
        },
        shoulders: { 
          min: 30, max: 100, 
          torque: 35,
          rotationAxis: [1, 0, 0.2],
          stabilizers: ['rotator_cuff', 'deltoids']
        },
        wrists: { 
          min: 170, max: 190, 
          torque: 10,
          rotationAxis: [1, 0, 0],
          stabilizers: ['flexor_carpi', 'extensor_carpi']
        },
        spine: {
          flexion: 0,
          extension: 0,
          torque: 30,
          stabilizers: ['abdominals', 'multifidus']
        }
      },
      formCriticalPoints: [
        { phase: 0.5, check: 'elbowAlignment', tolerance: 15 },
        { phase: 0.1, check: 'spinalNeutrality', tolerance: 5 },
        { phase: 0.5, check: 'scapularRetraction', tolerance: 10 }
      ],
      performanceVariables: {
        tempo: [2, 0.5, 1.5, 0],
        pausePositions: [0.5],
        rangeOfMotion: 0.9
      }
    },
    plank: {
      duration: 5.0,
      phases: ['initiation', 'isometric_hold', 'stabilization', 'endurance', 'release'],
      phaseDistribution: [0.05, 0.4, 0.2, 0.3, 0.05],
      breathingPattern: { inhalePhase: 'continuous', exhalePhase: 'continuous', rhythm: 'steady' },
      primaryMuscles: ['core', 'shoulders', 'glutes'],
      secondaryMuscles: ['quads', 'chest', 'lats'],
      intensity: 0.7,
      energyExpenditure: 0.06,
      forceProfile: {
        peak: 0.6,
        distribution: 'constant',
        groundReaction: 0.6
      },
      jointBiomechanics: {
        elbows: { 
          min: 85, max: 95, 
          torque: 20,
          rotationAxis: [1, 0, 0],
          stabilizers: ['triceps', 'anconeus']
        },
        shoulders: { 
          min: 85, max: 95, 
          torque: 30,
          rotationAxis: [1, 0, 0],
          stabilizers: ['anterior_deltoid', 'serratus_anterior']
        },
        hips: { 
          min: 170, max: 180, 
          torque: 35,
          rotationAxis: [1, 0, 0],
          stabilizers: ['gluteus_maximus', 'iliopsoas']
        },
        spine: {
          flexion: 0,
          extension: 0,
          torque: 35,
          stabilizers: ['transverse_abdominis', 'internal_oblique']
        }
      },
      formCriticalPoints: [
        { phase: 0.5, check: 'hipAlignment', tolerance: 5 },
        { phase: 0.5, check: 'spinalNeutrality', tolerance: 5 },
        { phase: 0.5, check: 'shoulderStability', tolerance: 10 }
      ],
      performanceVariables: {
        microMovements: true,
        stabilityChallenge: 0.3,
        enduranceDecay: 0.01
      }
    },
    lunge: {
      duration: 3.5,
      phases: ['preparation', 'descent', 'isometric_hold', 'ascent', 'transition'],
      phaseDistribution: [0.1, 0.3, 0.1, 0.3, 0.2],
      breathingPattern: { inhalePhase: 'descent', exhalePhase: 'ascent' },
      primaryMuscles: ['quads', 'glutes', 'hamstrings'],
      secondaryMuscles: ['calves', 'core', 'hip_flexors'],
      intensity: 0.85,
      energyExpenditure: 0.09,
      forceProfile: {
        peak: 1.8,
        distribution: 'asymmetric',
        groundReaction: 1.5
      },
      jointBiomechanics: {
        frontKnee: { 
          min: 90, max: 170, 
          torque: 45,
          rotationAxis: [0, 0, 1],
          stabilizers: ['vastus_medialis', 'vastus_lateralis']
        },
        backKnee: { 
          min: 90, max: 170, 
          torque: 35,
          rotationAxis: [0, 0, 1],
          stabilizers: ['rectus_femoris', 'vastus_intermedius']
        },
        hips: { 
          min: 120, max: 170, 
          torque: 50,
          rotationAxis: [0, 0, 1],
          stabilizers: ['gluteus_medius', 'piriformis']
        },
        ankles: {
          min: 80, max: 110,
          torque: 25,
          rotationAxis: [0, 0, 1],
          stabilizers: ['gastrocnemius', 'tibialis_anterior']
        }
      },
      formCriticalPoints: [
        { phase: 0.5, check: 'frontKneeAlignment', tolerance: 10 },
        { phase: 0.5, check: 'hipStability', tolerance: 7 },
        { phase: 0.5, check: 'torsoUpright', tolerance: 5 }
      ],
      performanceVariables: {
        tempo: [1.5, 0.5, 1.5, 0],
        alternating: true,
        stepLength: 0.8 // proportion of leg length
      }
    },
    burpee: {
      duration: 2.0,
      phases: ['stand', 'squat', 'kickback', 'pushup', 'recovery', 'jump'],
      phaseDistribution: [0.1, 0.15, 0.15, 0.2, 0.2, 0.2],
      breathingPattern: { inhalePhase: 'recovery', exhalePhase: 'pushup_jump' },
      primaryMuscles: ['full_body', 'cardio'],
      secondaryMuscles: ['all'],
      intensity: 1.0,
      energyExpenditure: 0.15,
      forceProfile: {
        peak: 3.0,
        distribution: 'complex',
        groundReaction: 2.5
      },
      jointBiomechanics: {
        knees: { 
          min: 70, max: 180, 
          torque: 50,
          rotationAxis: [0, 0, 1],
          dynamics: 'rapid_transition'
        },
        hips: { 
          min: 60, max: 180, 
          torque: 60,
          rotationAxis: [0, 0, 1],
          dynamics: 'rapid_transition'
        },
        elbows: { 
          min: 80, max: 180, 
          torque: 30,
          rotationAxis: [1, 0, 0],
          dynamics: 'rapid_transition'
        },
        shoulders: {
          min: 30, max: 180,
          torque: 40,
          rotationAxis: [1, 0, 0.2],
          dynamics: 'multi_planar'
        },
        spine: {
          flexion: 30,
          extension: 10,
          torque: 45,
          dynamics: 'coordinated_sequence'
        }
      },
      formCriticalPoints: [
        { phase: 0.2, check: 'squatMechanics', tolerance: 15 },
        { phase: 0.4, check: 'plankAlignment', tolerance: 10 },
        { phase: 0.5, check: 'pushupForm', tolerance: 15 },
        { phase: 0.8, check: 'jumpMechanics', tolerance: 10 }
      ],
      performanceVariables: {
        explosiveness: 0.9,
        transitionSpeed: 0.8,
        complexityFactor: 0.9
      }
    }
  };

  // Load shader material for muscle highlighting
  const [muscleHighlightIntensity, setMuscleHighlightIntensity] = useState(0);
  
  // Notify when model is ready
  useEffect(() => {
    if (onLoadComplete) {
      // Simulate initialization time
      setTimeout(() => onLoadComplete(), 500);
    }
  }, [onLoadComplete]);

  // Breathing animation - independent of exercise
  useEffect(() => {
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => (prev + 0.1) % 1);
      if (breathingPhase > 0.9) {
        setIsInhalation(prev => !prev);
      }
    }, 100);

    return () => clearInterval(breathingInterval);
  }, [breathingPhase]);

  // Physics-based biomechanical animation system
  useFrame((state) => {
    if (!group.current || paused) return;

    const time = state.clock.getElapsedTime();
    const params = exerciseParams[exerciseType] || exerciseParams.squat;
    
    // Calculate precise phase timing based on current exercise parameters
    const cycleTime = time % params.duration;
    const cyclePhase = cycleTime / params.duration;
    
    // Determine which discrete phase of the movement we're in
    const phaseDistribution = params.phaseDistribution || [0.2, 0.3, 0.2, 0.3];
    let currentPhaseIndex = 0;
    let accumulatedPhaseTime = 0;
    
    for (let i = 0; i < phaseDistribution.length; i++) {
      accumulatedPhaseTime += phaseDistribution[i];
      if (cyclePhase <= accumulatedPhaseTime) {
        currentPhaseIndex = i;
        break;
      }
    }
    
    // Calculate phase progress within the current movement phase
    const phaseStart = currentPhaseIndex === 0 ? 0 : 
      phaseDistribution.slice(0, currentPhaseIndex).reduce((a, b) => a + b, 0);
    const phaseDuration = phaseDistribution[currentPhaseIndex];
    const phaseProgress = (cyclePhase - phaseStart) / phaseDuration;
    
    // Track when a repetition completes
    if (cyclePhase < 0.1 && exercisePhase > 0.9) {
      setRepetitionCount(prev => prev + 1);
      
      // Increment fatigue slightly with each rep
      setFatigueFactor(prev => Math.min(prev + 0.03, 0.3));
      
      // Calculate force output and energy expenditure
      const energyExpended = params.energyExpenditure || 0.1;
      const peakForce = params.forceProfile?.peak || 1.0;
      
      // Highlight active muscles during peak contraction
      setMuscleHighlightIntensity(0.8);
      setTimeout(() => setMuscleHighlightIntensity(0.3), 300);
      setTimeout(() => setMuscleHighlightIntensity(0.1), 600);
      
      // Update muscle activation levels
      if (params.primaryMuscles) {
        const newActivation = { ...muscleActivation };
        params.primaryMuscles.forEach(muscle => {
          if (newActivation[muscle] !== undefined) {
            newActivation[muscle] = 0.9; // High activation for primary muscles
          }
        });
        params.secondaryMuscles?.forEach(muscle => {
          if (newActivation[muscle] !== undefined) {
            newActivation[muscle] = 0.6; // Moderate activation for secondary muscles
          }
        });
        setMuscleActivation(newActivation);
        
        // Gradually decay muscle activation
        setTimeout(() => {
          setMuscleActivation(prev => {
            const decayed = { ...prev };
            Object.keys(decayed).forEach(key => {
              decayed[key] = Math.max(0, decayed[key] - 0.3);
            });
            return decayed;
          });
        }, params.duration * 500);
      }
      
      // Notify parent component of completed rep with biomechanical data
      if (typeof onRepComplete === 'function') {
        onRepComplete({
          energyExpended,
          peakForce,
          muscleActivation: { ...muscleActivation },
          formQuality: 1 - (fatigueFactor * 0.5)
        });
      }
    }
    
    setExercisePhase(cyclePhase);
    
    // Apply procedural animation to simulate natural micro-variations
    const microVariation = Math.sin(time * 10) * 0.002 * (1 + fatigueFactor * 2);
    const stabilityVariation = Math.cos(time * 5) * 0.004 * (1 + fatigueFactor * 3);
    
    // Synchronized breathing pattern based on exercise phase
    const breathingParams = params.breathingPattern || { 
      inhalePhase: 'eccentric', 
      exhalePhase: 'concentric' 
    };
    
    // Determine if this is an inhalation phase based on current movement
    const currentPhaseName = params.phases?.[currentPhaseIndex] || '';
    const shouldInhale = breathingParams.inhalePhase === currentPhaseName;
    const shouldExhale = breathingParams.exhalePhase === currentPhaseName;
    
    if (shouldInhale && !isInhalation) {
      setIsInhalation(true);
    } else if (shouldExhale && isInhalation) {
      setIsInhalation(false);
    }
    
    // Gradual breathing progress
    setBreathingPhase(prev => {
      if (isInhalation) {
        return Math.min(prev + 0.015, 1);
      } else {
        return Math.max(prev - 0.015, 0);
      }
    });
    
    // Apply realistic breathing to torso with biomechanical accuracy
    if (torsoRef.current) {
      // Chest expansion during inhalation
      const breathingScale = isInhalation 
        ? 1 + (breathingPhase * 0.045 * (1 - fatigueFactor * 0.5)) 
        : 1 + ((1 - breathingPhase) * 0.045 * (1 - fatigueFactor * 0.5));
      
      // More realistic expansion that affects different dimensions appropriately
      torsoRef.current.scale.x = breathingScale;
      torsoRef.current.scale.z = breathingScale * 1.2; // Greater front expansion
      
      // Subtle vertical movement for deep breathing
      const breathingLift = isInhalation 
        ? breathingPhase * 0.02 
        : (1 - breathingPhase) * 0.02;
      torsoRef.current.position.y = breathingLift;
    }
    
    // Apply realistic fatigue effects
    const fatigueWobble = fatigueFactor * Math.sin(time * 7) * 0.03;
    const fatigueSlowdown = 1 - (fatigueFactor * 0.2);

    // Physics-based biomechanical exercise animations with precise joint mechanics
    if (exerciseType === 'squat') {
      // Get biomechanical parameters for squats
      const biomechanics = params.jointBiomechanics || {};
      
      // Calculate dynamic squat depth based on phase and fatigue
      const eccentric = cyclePhase <= 0.5;
      const phaseAdjusted = eccentric ? cyclePhase * 2 : (1 - cyclePhase) * 2;
      
      // Apply tempo-based movement pattern for proper eccentric/concentric timing
      const tempo = params.performanceVariables?.tempo || [2, 1, 2, 0];  // Down, hold, up, rest
      const tempoFactor = eccentric ? (1/tempo[0]) : (1/tempo[2]);
      
      // Implement dynamic easing function for natural movement
      const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const squatPhase = easeInOut(phaseAdjusted);
      
      // Calculate precise depth based on biomechanical parameters
      const maxDepth = 0.5 * (1 - fatigueFactor * 0.15); // Fatigue reduces range slightly
      const squatDepth = squatPhase * maxDepth * (params.performanceVariables?.rangeOfMotion || 0.9);
      
      // Calculate ground reaction force based on movement phase
      const peakForce = params.forceProfile?.groundReaction || 1.2;
      let groundForce = 0;
      if (eccentric) {
        // Force increases as we descend
        groundForce = 1 + (squatPhase * (peakForce - 1));
      } else {
        // Peak force during initial concentric phase
        groundForce = peakForce - (squatPhase * (peakForce - 1));
      }
      setGroundContactForce(groundForce);
      
      // Apply micro-instability based on form critical points
      const kneeAlignmentVariation = microVariation * 3 * (1 + fatigueFactor * 5);
      const spinalNeutralityVariation = microVariation * 2 * (1 + fatigueFactor * 4);
      
      // Apply coordinated joint movements based on biomechanical model
      // Body vertical displacement
      group.current.position.y = -squatDepth + fatigueWobble;
      
      // Apply lateral stability variation to simulate real-world balance challenges
      group.current.position.x = microVariation;
      group.current.rotation.z = stabilityVariation * 0.2;
      
      // Precise joint articulation with anatomically accurate constraints
      if (leftLegRef.current && rightLegRef.current) {
        // Calculate knee angle based on biomechanical constraints
        const minKneeAngle = (biomechanics.knees?.min || 80) * Math.PI / 180;
        const maxKneeAngle = (biomechanics.knees?.max || 170) * Math.PI / 180;
        const kneeROM = maxKneeAngle - minKneeAngle;
        
        // Apply proper knee joint kinematics
        const kneeAngle = maxKneeAngle - (squatPhase * kneeROM);
        
        // Add fatigue-based asymmetry for realism
        const leftKneeAsymmetry = fatigueWobble * 0.3;
        const rightKneeAsymmetry = -leftKneeAsymmetry;
        
        // Apply angle conversions for Three.js rotation system
        const leftKneeRotation = ((Math.PI/2) - kneeAngle) + leftKneeAsymmetry + kneeAlignmentVariation;
        const rightKneeRotation = ((Math.PI/2) - kneeAngle) + rightKneeAsymmetry - kneeAlignmentVariation;
        
        // Apply to model
        leftLegRef.current.rotation.x = leftKneeRotation;
        rightLegRef.current.rotation.x = rightKneeRotation;
        
        // Apply valgus/varus stress based on fatigue (knees cave in or out under load)
        const kneeAdduction = fatigueFactor * 0.2 * squatPhase;
        leftLegRef.current.rotation.z = kneeAdduction;
        rightLegRef.current.rotation.z = -kneeAdduction;
        
        // Apply ankle dorsiflexion based on knee flexion
        if (leftKneeRef.current && rightKneeRef.current) {
          leftKneeRef.current.rotation.x = leftKneeRotation * 0.2;
          rightKneeRef.current.rotation.x = rightKneeRotation * 0.2;
        }
      }
      
      // Feet stay planted with ground reaction forces
      if (leftFootRef.current && rightFootRef.current) {
        leftFootRef.current.position.y = squatDepth * 0.7;
        rightFootRef.current.position.y = squatDepth * 0.7;
        
        // Weight shift based on fatigue and balance
        const weightShift = fatigueFactor * stabilityVariation * 0.1;
        leftFootRef.current.rotation.z = weightShift;
        rightFootRef.current.rotation.z = -weightShift;
      }
      
      // Spine mechanics - slight forward lean proportional to depth
      if (torsoRef.current) {
        // Calculate hip flexion based on squat depth
        const maxHipFlex = (biomechanics.spine?.flexion || 15) * Math.PI / 180;
        const hipFlexion = squatPhase * maxHipFlex;
        
        // Forward lean increases with depth but affected by fatigue
        torsoRef.current.rotation.x = hipFlexion + (fatigueFactor * squatPhase * 0.2) + spinalNeutralityVariation;
        
        // Lateral flexion from fatigue
        torsoRef.current.rotation.z = stabilityVariation;
      }
      
      // Simulate pelvis movement (posterior tilt at bottom of squat)
      if (pelvisRef.current) {
        pelvisRef.current.rotation.x = -squatPhase * 0.15;
      }
      
      // Arm positioning during squat (natural counterbalance)
      if (leftArmRef.current && rightArmRef.current) {
        const armCounter = squatPhase * 0.3;
        leftArmRef.current.rotation.x = armCounter;
        rightArmRef.current.rotation.x = armCounter;
      }
      
    } else if (exerciseType === 'pushup') {
      // Get specific biomechanics
      const biomechanics = params.jointBiomechanics || {};
      
      // Calculate pushup phase with proper timing
      const eccentric = cyclePhase <= 0.4; // Lowering phase
      const isometric = cyclePhase > 0.4 && cyclePhase <= 0.5; // Bottom hold
      const concentric = cyclePhase > 0.5; // Rising phase
      
      // Apply tempo-based movement with time under tension focus
      const tempo = params.performanceVariables?.tempo || [2, 0.5, 1.5, 0];
      
      // Different phase calculation based on movement portion
      let pushupProgress;
      if (eccentric) {
        // Downward movement
        pushupProgress = cyclePhase / 0.4;
      } else if (isometric) {
        // Hold at bottom
        pushupProgress = 1;
      } else {
        // Upward movement
        pushupProgress = 1 - ((cyclePhase - 0.5) / 0.5);
      }
      
      // Apply easing for natural movement
      const easing = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const pushupPhase = easing(pushupProgress);
      
      // Apply movement with realistic physics
      // Body maintains plank position but moves up and down
      group.current.position.y = 0.2 - (0.2 * pushupPhase * (params.performanceVariables?.rangeOfMotion || 0.9));
      group.current.rotation.x = -Math.PI * 0.25; // Angled pushup position
      
      // Add subtle instability based on fatigue and phase
      group.current.rotation.z = stabilityVariation * (1 + pushupPhase * 2);
      
      // Calculate biomechanically accurate elbow angles
      if (leftArmRef.current && rightArmRef.current) {
        // Get elbow ROM from parameters
        const minElbowAngle = (biomechanics.elbows?.min || 70) * Math.PI / 180;
        const maxElbowAngle = (biomechanics.elbows?.max || 160) * Math.PI / 180;
        const elbowROM = maxElbowAngle - minElbowAngle;
        
        // Calculate current angle with physiologically accurate positioning
        const elbowAngle = maxElbowAngle - (pushupPhase * elbowROM);
        
        // Add fatigue-based asymmetry and compensation
        const leftElbowFatigue = fatigueWobble * 0.4;
        const rightElbowFatigue = -leftElbowFatigue;
        
        // Apply to model with proper Three.js conversion
        const leftElbowRotation = -((Math.PI/2) - elbowAngle) - leftElbowFatigue;
        const rightElbowRotation = -((Math.PI/2) - elbowAngle) - rightElbowFatigue;
        
        leftArmRef.current.rotation.x = leftElbowRotation;
        rightArmRef.current.rotation.x = rightElbowRotation;
        
        // Add scapular movement (shoulders protract at bottom of pushup)
        if (leftShoulderRef.current && rightShoulderRef.current) {
          const scapRetraction = (1 - pushupPhase) * 0.1;
          leftShoulderRef.current.position.z = -scapRetraction;
          rightShoulderRef.current.position.z = -scapRetraction;
        }
      }
      
      // Simulate spinal stability during pushup
      if (spineRef.current) {
        // Slight spinal variation based on fatigue
        spineRef.current.rotation.x = fatigueWobble * 0.1;
      }
      
      // Apply ground reaction forces to hands
      const handPressure = 0.6 + (pushupPhase * 0.4);
      setGroundContactForce(handPressure);
      
    } else if (exerciseType === 'plank') {
      // Plank position with detailed stability challenges
      const biomechanics = params.jointBiomechanics || {};
      
      // Basic plank position
      group.current.rotation.x = -Math.PI * 0.25; // Body angled down for forearm plank
      
      // Get stability challenge level
      const stabilityChallenge = params.performanceVariables?.stabilityChallenge || 0.3;
      const enduranceDecay = params.performanceVariables?.enduranceDecay || 0.01;
      
      // Calculate increasing instability over time within rep
      const timeBasedFatigue = Math.min(cyclePhase * enduranceDecay * 2, 0.15);
      const totalInstability = (stabilityChallenge + timeBasedFatigue) * (1 + fatigueFactor * 3);
      
      // Apply complex multi-dimensional stability challenge
      const xWobble = Math.sin(time * 2.7) * 0.005 * totalInstability;
      const zWobble = Math.sin(time * 3.1) * 0.02 * totalInstability;
      const yDrift = Math.sin(time * 1.3) * 0.01 * totalInstability;
      
      // Apply to model with proper biomechanics
      group.current.rotation.z = zWobble;
      group.current.rotation.x = -Math.PI * 0.25 + xWobble;
      group.current.position.y = yDrift;
      
      // Arms supporting body with realistic tension
      if (leftArmRef.current && rightArmRef.current) {
        // Get proper elbow flexion for plank
        const elbowAngle = ((biomechanics.elbows?.min || 85) * Math.PI / 180);
        
        // Add micro-adjustments for stability
        const leftArmAdjust = stabilityVariation * 0.1;
        const rightArmAdjust = -leftArmAdjust;
        
        leftArmRef.current.rotation.x = -elbowAngle + leftArmAdjust;
        rightArmRef.current.rotation.x = -elbowAngle + rightArmAdjust;
        
        // Shoulder stabilization with fatigue effects
        if (leftShoulderRef.current && rightShoulderRef.current) {
          // Subtle drift in shoulder positioning
          const shoulderDrift = fatigueFactor * 0.05 * Math.sin(time * 4);
          leftShoulderRef.current.position.y = shoulderDrift;
          rightShoulderRef.current.position.y = -shoulderDrift;
        }
      }
      
      // Core engagement simulation
      if (pelvisRef.current && spineRef.current) {
        // Hip position with subtle changes based on core fatigue
        const hipDrift = fatigueFactor * 0.1 * Math.sin(time * 1.5);
        pelvisRef.current.rotation.x = -0.1 + hipDrift; // Slight posterior pelvic tilt
        
        // Spinal neutrality with micro-variations
        spineRef.current.rotation.x = stabilityVariation * 0.05; 
      }
      
      // Leg position with slight adjustments
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.z = zWobble * 0.5;
        rightLegRef.current.rotation.z = -zWobble * 0.5;
      }
      
    } else if (exerciseType === 'lunge') {
      // Advanced alternating lunge with precise biomechanics
      const biomechanics = params.jointBiomechanics || {};
      
      // Determine if we're in eccentric (down) or concentric (up) phase
      const eccentric = cyclePhase <= 0.4;
      const isometric = cyclePhase > 0.4 && cyclePhase <= 0.5;
      const concentric = cyclePhase > 0.5;
      
      // Calculate lunge depth with proper timing
      let lungeProgress;
      if (eccentric) {
        lungeProgress = cyclePhase / 0.4;
      } else if (isometric) {
        lungeProgress = 1;
      } else {
        lungeProgress = 1 - ((cyclePhase - 0.5) / 0.5);
      }
      
      // Apply easing for biomechanically accurate movement
      const easing = t => 1 - Math.pow(1 - t, 3);
      const lungePhase = easing(lungeProgress);
      
      // Determine which leg is forward (alternating)
      const isRightLeg = Math.floor(time / params.duration) % 2 === 0;
      
      // Calculate step length based on anthropometric proportions
      const stepLength = (params.performanceVariables?.stepLength || 0.8) * (1 - fatigueFactor * 0.2);
      
      // Position legs for lunge
      if (leftLegRef.current && rightLegRef.current) {
        // Get proper knee flexion angles
        const minKneeAngle = (biomechanics.frontKnee?.min || 90) * Math.PI / 180;
        const maxKneeAngle = (biomechanics.frontKnee?.max || 170) * Math.PI / 180;
        const kneeROM = maxKneeAngle - minKneeAngle;
        
        // Calculate front knee angle with biomechanical accuracy
        const frontKneeAngle = maxKneeAngle - (lungePhase * kneeROM);
        
        // Calculate rear knee angle (different biomechanics)
        const rearKneeAngle = maxKneeAngle - (lungePhase * kneeROM * 0.7);
        
        // Add stability challenges
        const kneeStability = stabilityVariation * (1 + fatigueFactor * 3);
        
        if (isRightLeg) {
          // Right leg forward
          rightLegRef.current.position.z = stepLength;
          leftLegRef.current.position.z = -stepLength;
          
          // Apply biomechanically correct knee flexion
          rightLegRef.current.rotation.x = -((Math.PI/2) - frontKneeAngle) + kneeStability;
          leftLegRef.current.rotation.x = ((Math.PI/2) - rearKneeAngle) - kneeStability;
          
          // Foot positioning
          if (rightFootRef.current && leftFootRef.current) {
            rightFootRef.current.rotation.x = 0.1; // Heel contact for front foot
            leftFootRef.current.rotation.x = 0.4; // Ball of foot contact for rear foot
          }
        } else {
          // Left leg forward
          leftLegRef.current.position.z = stepLength;
          rightLegRef.current.position.z = -stepLength;
          
          // Apply biomechanically correct knee flexion
          leftLegRef.current.rotation.x = -((Math.PI/2) - frontKneeAngle) + kneeStability;
          rightLegRef.current.rotation.x = ((Math.PI/2) - rearKneeAngle) - kneeStability;
          
          // Foot positioning
          if (leftFootRef.current && rightFootRef.current) {
            leftFootRef.current.rotation.x = 0.1; // Heel contact for front foot
            rightFootRef.current.rotation.x = 0.4; // Ball of foot contact for rear foot
          }
        }
      }
      
      // Body vertical displacement with proper mechanics
      const lungeDepth = lungePhase * 0.3 * (1 - fatigueFactor * 0.15);
      group.current.position.y = -lungeDepth + fatigueWobble;
      
      // Trunk position - slight forward lean
      if (torsoRef.current) {
        torsoRef.current.rotation.x = lungePhase * 0.15; // Forward lean increases with depth
        torsoRef.current.rotation.z = stabilityVariation * (1 + fatigueFactor * 2); // Lateral stability challenge
      }
      
      // Hip joint mechanics
      if (pelvisRef.current) {
        // Hip rotation based on which leg is forward
        pelvisRef.current.rotation.y = isRightLeg ? -0.1 : 0.1;
        
        // Hip drop from fatigue
        pelvisRef.current.rotation.z = stabilityVariation * fatigueFactor * 0.3;
      }
      
      // Arm coordination (opposite arm forward)
      if (leftArmRef.current && rightArmRef.current) {
        if (isRightLeg) {
          // Left arm forward with right leg
          leftArmRef.current.rotation.x = 0.4;
          rightArmRef.current.rotation.x = -0.2;
        } else {
          // Right arm forward with left leg
          rightArmRef.current.rotation.x = 0.4;
          leftArmRef.current.rotation.x = -0.2;
        }
      }
      
    } else if (exerciseType === 'burpee') {
      // Complex multi-phase burpee with advanced biomechanical simulation
      const biomechanics = params.jointBiomechanics || {};
      
      // Get phase information from parameters
      const phases = params.phases || ['stand', 'squat', 'kickback', 'pushup', 'recovery', 'jump'];
      const phaseDistribution = params.phaseDistribution || [0.1, 0.15, 0.15, 0.2, 0.2, 0.2];
      
      // Determine current discrete phase
      let phaseIndex = 0;
      let phaseStart = 0;
      let phaseEnd = phaseDistribution[0];
      
      for (let i = 0; i < phaseDistribution.length; i++) {
        if (cyclePhase >= phaseStart && cyclePhase < phaseEnd) {
          phaseIndex = i;
          break;
        }
        phaseStart = phaseEnd;
        phaseEnd += phaseDistribution[i + 1] || 0;
      }
      
      // Calculate progress within current phase
      const phaseLength = phaseDistribution[phaseIndex];
      const phaseProgress = (cyclePhase - phaseStart) / phaseLength;
      
      // Complex easing functions for explosive movements
      const easeOut = t => 1 - Math.pow(1 - t, 4);
      const easeIn = t => t * t * t;
      const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Reset positions for new cycle
      if (phaseIndex === 0 && phaseProgress < 0.1) {
        group.current.rotation.x = 0;
        group.current.position.y = 0;
        group.current.position.z = 0;
        
        // Reset all limbs
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = 0;
          rightArmRef.current.rotation.x = 0;
        }
        
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.x = 0;
        }
      }
      
      // Apply performance variables
      const explosiveness = params.performanceVariables?.explosiveness || 0.9;
      const transitionSpeed = params.performanceVariables?.transitionSpeed || 0.8;
      const complexity = params.performanceVariables?.complexityFactor || 0.9;
      
      // Apply movement with phase-specific adjustments
      switch (phaseIndex) {
        case 0: // Stand to squat (preparation)
          // Deep squat drop with explosive quality
          const squatEase = easeIn(phaseProgress);
          const squatDepth = squatEase * 0.5 * explosiveness;
          
          // Vertical descent
          group.current.position.y = -squatDepth;
          
          // Apply knee bend
          if (leftLegRef.current && rightLegRef.current) {
            const kneeAngle = squatEase * 0.8;
            leftLegRef.current.rotation.x = kneeAngle;
            rightLegRef.current.rotation.x = kneeAngle;
          }
          
          // Forward arm movement
          if (leftArmRef.current && rightArmRef.current) {
            const armSwing = squatEase * 0.3;
            leftArmRef.current.rotation.x = armSwing;
            rightArmRef.current.rotation.x = armSwing;
          }
          break;
          
        case 1: // Squat to plank (transition to ground)
          // Keep squat depth while transitioning to plank
          group.current.position.y = -0.5;
          
          // Forward rotation with proper timing
          const forwardRotation = easeInOut(phaseProgress) * Math.PI * 0.25;
          group.current.rotation.x = -forwardRotation;
          
          // Forward movement as hands reach ground
          const forwardMovement = easeInOut(phaseProgress) * 0.5 * transitionSpeed;
          group.current.position.z = forwardMovement;
          
          // Leg extension as transitioning to plank
          if (leftLegRef.current && rightLegRef.current) {
            const legExtension = 0.8 - (easeInOut(phaseProgress) * 0.4);
            leftLegRef.current.rotation.x = legExtension;
            rightLegRef.current.rotation.x = legExtension;
          }
          break;
          
        case 2: // Plank to pushup (lowering phase)
          // Maintain plank position but lower body
          group.current.position.y = -0.5 - (easeInOut(phaseProgress) * 0.2);
          group.current.rotation.x = -Math.PI * 0.25;
          group.current.position.z = 0.5;
          
          // Arms bend at elbows with proper biomechanics
          if (leftArmRef.current && rightArmRef.current) {
            const elbowAngle = easeInOut(phaseProgress) * 0.5;
            leftArmRef.current.rotation.x = -elbowAngle;
            rightArmRef.current.rotation.x = -elbowAngle;
          }
          
          // Core stabilization
          if (torsoRef.current) {
            torsoRef.current.rotation.z = stabilityVariation * (1 + fatigueFactor * 2);
          }
          break;
          
        case 3: // Pushup to squat (return movement)
          // Rise from pushup
          const riseProgress = easeOut(phaseProgress);
          group.current.position.y = -0.7 + (riseProgress * 0.2);
          
          // Rotate back to vertical
          const backRotation = riseProgress * Math.PI * 0.25;
          group.current.rotation.x = -Math.PI * 0.25 + backRotation;
          
          // Move back to center
          const backwardMovement = riseProgress * 0.5;
          group.current.position.z = 0.5 - backwardMovement;
          
          // Arms straighten
          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.rotation.x = -(0.5 - (riseProgress * 0.5));
            rightArmRef.current.rotation.x = -(0.5 - (riseProgress * 0.5));
          }
          
          // Legs begin to bend for jump preparation
          if (leftLegRef.current && rightLegRef.current) {
            const jumpPrep = riseProgress * 0.6;
            leftLegRef.current.rotation.x = jumpPrep;
            rightLegRef.current.rotation.x = jumpPrep;
          }
          break;
          
        case 4: // Jump preparation
          // Explosive movement sequence
          if (phaseProgress < 0.5) {
            // Gathering phase - deeper bend
            const gatherProgress = easeIn(phaseProgress * 2);
            group.current.position.y = -0.5 - (gatherProgress * 0.2);
            
            // Increasing knee bend
            if (leftLegRef.current && rightLegRef.current) {
              const deepKneeBend = 0.6 + (gatherProgress * 0.3);
              leftLegRef.current.rotation.x = deepKneeBend;
              rightLegRef.current.rotation.x = deepKneeBend;
            }
            
            // Arm swing back for jump
            if (leftArmRef.current && rightArmRef.current) {
              const armSwingBack = -gatherProgress * 0.4;
              leftArmRef.current.rotation.x = armSwingBack;
              rightArmRef.current.rotation.x = armSwingBack;
            }
          } else {
            // Explosive jump phase
            const jumpProgress = easeOut((phaseProgress - 0.5) * 2);
            
            // Rapid vertical movement
            const jumpHeight = jumpProgress * 1.2 * explosiveness;
            group.current.position.y = -0.6 + jumpHeight;
            
            // Leg extension
            if (leftLegRef.current && rightLegRef.current) {
              const legExtension = 0.9 - (jumpProgress * 0.8);
              leftLegRef.current.rotation.x = legExtension;
              rightLegRef.current.rotation.x = legExtension;
            }
            
            // Forward arm swing
            if (leftArmRef.current && rightArmRef.current) {
              const armSwingUp = jumpProgress * 0.8;
              leftArmRef.current.rotation.x = armSwingUp;
              rightArmRef.current.rotation.x = armSwingUp;
            }
            
            // Add slight body extension at peak
            if (torsoRef.current) {
              torsoRef.current.rotation.x = -jumpProgress * 0.1;
            }
          }
          break;
          
        case 5: // Landing and reset
          // Controlled landing with absorption
          const landProgress = easeOut(phaseProgress);
          
          // Body returns to standing position
          group.current.position.y = 0.6 - (landProgress * 0.6);
          
          // Legs absorb impact then straighten
          if (leftLegRef.current && rightLegRef.current) {
            // Initial absorption then straightening
            let legAngle;
            if (phaseProgress < 0.3) {
              // Impact absorption
              legAngle = (phaseProgress / 0.3) * 0.4;
            } else {
              // Return to straight
              legAngle = 0.4 - ((phaseProgress - 0.3) / 0.7) * 0.4;
            }
            
            leftLegRef.current.rotation.x = legAngle;
            rightLegRef.current.rotation.x = legAngle;
          }
          
          // Arms return to sides
          if (leftArmRef.current && rightArmRef.current) {
            const armReturn = 0.8 - (landProgress * 0.8);
            leftArmRef.current.rotation.x = armReturn;
            rightArmRef.current.rotation.x = armReturn;
          }
          break;
      }
    }

    // Update spotlight to follow model
    if (spotlightRef.current) {
      spotlightRef.current.position.x = group.current.position.x;
      spotlightRef.current.position.z = group.current.position.z;
    }
  });

  // Create a material with muscle highlights
  const getMuscleHighlightMaterial = (baseColor) => {
    return (
      <meshPhysicalMaterial
        color={baseColor}
        metalness={0.1}
        roughness={0.7}
        emissive={baseColor}
        emissiveIntensity={muscleHighlightIntensity}
      />
    );
  };

  return (
    <group ref={group}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#f9c9b6" />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#f9c9b6" />
      </mesh>
      
      {/* Torso */}
      <group ref={torsoRef} position={[0, 1.1, 0]}>
        {/* Upper Torso (Chest) */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.2]} />
          {getMuscleHighlightMaterial('#ff006e')}
        </mesh>
        
        {/* Lower Torso (Abs) */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.35, 0.3, 0.18]} />
          {getMuscleHighlightMaterial('#ff006e')}
        </mesh>
        
        {/* Shoulders */}
        <mesh position={[-0.2, 0.18, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          {getMuscleHighlightMaterial('#ff4e8c')}
        </mesh>
        <mesh position={[0.2, 0.18, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          {getMuscleHighlightMaterial('#ff4e8c')}
        </mesh>
      </group>
      
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.25, 1.28, 0]}>
        {/* Upper arm */}
        <mesh position={[-0.13, 0, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.06, 0.07, 0.26, 16]} rotation={[0, 0, Math.PI/2]} />
          {getMuscleHighlightMaterial('#ff4e8c')}
        </mesh>
        
        {/* Elbow */}
        <mesh position={[-0.25, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          {getMuscleHighlightMaterial('#ff4e8c')}
        </mesh>
        
        {/* Forearm */}
        <mesh position={[-0.37, 0, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.05, 0.06, 0.24, 16]} rotation={[0, 0, Math.PI/2]} />
          {getMuscleHighlightMaterial('#ff4e8c')}
        </mesh>
        
        {/* Hand */}
        <mesh position={[-0.5, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.04]} />
          <meshStandardMaterial color="#f9c9b6" />
        </mesh>
      </group>
      
      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.25, 1.28, 0]}>
        {/* Upper arm */}
        <mesh position={[0.13, 0, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.07, 0.06, 0.26, 16]} rotation={[0, 0, Math.PI/2]} />
          {getMuscleHighlightMaterial('#ff4e8c')}
        </mesh>
        
        {/* Elbow */}
        <mesh position={[0.25, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          {getMuscleHighlightMaterial('#ff4e8c')}
        </mesh>
        
        {/* Forearm */}
        <mesh position={[0.37, 0, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.06, 0.05, 0.24, 16]} rotation={[0, 0, Math.PI/2]} />
          {getMuscleHighlightMaterial('#ff4e8c')}
        </mesh>
        
        {/* Hand */}
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.04]} />
          <meshStandardMaterial color="#f9c9b6" />
        </mesh>
      </group>
      
      {/* Hip */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.2]} />
        {getMuscleHighlightMaterial('#cc0055')}
      </mesh>
      
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.5, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.4, 16]} />
          {getMuscleHighlightMaterial('#3a0ca3')}
        </mesh>
        
        {/* Knee */}
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          {getMuscleHighlightMaterial('#3a0ca3')}
        </mesh>
        
        {/* Calf */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.4, 16]} />
          {getMuscleHighlightMaterial('#3a0ca3')}
        </mesh>
        
        {/* Foot */}
        <mesh ref={leftFootRef} position={[0, -0.82, 0.05]}>
          <boxGeometry args={[0.1, 0.05, 0.2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
      
      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.5, 0]}>
        {/* Thigh */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.4, 16]} />
          {getMuscleHighlightMaterial('#3a0ca3')}
        </mesh>
        
        {/* Knee */}
        <mesh position={[0, -0.4, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          {getMuscleHighlightMaterial('#3a0ca3')}
        </mesh>
        
        {/* Calf */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.4, 16]} />
          {getMuscleHighlightMaterial('#3a0ca3')}
        </mesh>
        
        {/* Foot */}
        <mesh ref={rightFootRef} position={[0, -0.82, 0.05]}>
          <boxGeometry args={[0.1, 0.05, 0.2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
      
      {/* Movement tracking spotlight */}
      <spotLight
        ref={spotlightRef}
        position={[0, 5, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.6}
        color="#ffffff"
        castShadow
      />
      
      {/* Exercise tracking data - invisible but tracks exercise data */}
      <group position={[0, 0, 0]} visible={false}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
      </group>
    </group>
  );
};

// Model selector component
const ModelSelector = ({ onSelectModel, availableModels }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Select Model</Typography>
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
        {availableModels.map(model => (
          <Button 
            key={model.id}
            variant="outlined"
            onClick={() => onSelectModel(model.url)}
            sx={{ minWidth: '120px', textTransform: 'none' }}
          >
            {model.name}
          </Button>
        ))}
      </Stack>
    </Paper>
  );
};

// The main exercise model scene component
const ExerciseModelScene = ({ 
  exerciseType = 'squat', 
  paused = false,
  showControls = true,
  height = 400,
  modelUrl = 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/male-character-1/model.gltf',
  onLoadComplete,
  onRepComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [selectedModelUrl, setSelectedModelUrl] = useState(modelUrl);
  
  // Create basic models using shapes instead of external files
  const availableModels = [
    { 
      id: 1, 
      name: 'Simplified Model', 
      url: 'simplified' // Special value we'll handle
    },
    { 
      id: 2, 
      name: 'Basic Avatar', 
      url: 'basic'  // Special value we'll handle
    }
  ];
  
  const handleLoadComplete = () => {
    setLoading(false);
    if (onLoadComplete) onLoadComplete();
  };

  // Model selection handler
  const handleSelectModel = (modelUrl) => {
    setLoading(true);
    setSelectedModelUrl(modelUrl);
  };

  // Handle model load errors
  const [modelError, setModelError] = useState(null);
  
  // Create fallback content if we can't load models
  const handleModelError = (error) => {
    console.error("Error loading 3D model:", error);
    setModelError(`Unable to load 3D model. ${error?.message || ''}`);
    setLoading(false);
  };

  return (
    <Box sx={{ width: '100%', height, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      {loading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          bgcolor: 'rgba(0,0,0,0.1)',
          borderRadius: 2
        }}>
          <CircularProgress />
        </Box>
      )}
      
      {modelError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {modelError}
        </Alert>
      )}
      
      {showControls && (
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, maxWidth: 'calc(100% - 32px)' }}>
          <ModelSelector 
            onSelectModel={handleSelectModel} 
            availableModels={availableModels} 
          />
        </Box>
      )}
      
      <Box sx={{ width: '100%', height: '100%', bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Canvas shadows onCreated={({ gl }) => compatibilityLayer.adaptColorSpace(gl)}>
          <PerspectiveCamera makeDefault position={[0, 0, 3]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <ExerciseModel
            modelUrl={selectedModelUrl}
            exerciseType={exerciseType}
            paused={paused}
            onLoadComplete={handleLoadComplete}
          />
          
          <Environment preset="sunset" />
          <OrbitControls 
            enablePan={false}
            minDistance={2}
            maxDistance={5}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </Box>
      
      <Box sx={{ mt: 2, p: 2, borderTop: '1px solid #eee' }}>
        <Typography variant="subtitle2" gutterBottom>
          {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Form Tips:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {exerciseType === 'squat' ? 
            'Keep your back straight, weight in your heels, and knees tracking over toes.' : 
           exerciseType === 'pushup' ? 
            'Maintain a straight body line, hands under shoulders, and lower your chest to the ground.' :
           exerciseType === 'plank' ? 
            'Keep a straight line from head to heels, engage your core, and hold steady.' :
           exerciseType === 'lunge' ? 
            'Step forward with one leg, lowering your hips until both knees are bent at 90°.' :
            'Follow proper form to avoid injury and maximize effectiveness.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default ExerciseModelScene;