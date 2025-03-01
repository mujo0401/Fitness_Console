import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Enhanced 3D body model with gender options and improved anatomical detail
export function BodyModel({ 
  state = { weight: 0.5, muscle: 0.5 }, 
  showSkeleton = false,
  gender = 'male' // Default to male if gender not specified
}) {
  const group = useRef();
  
  // Body parts with references
  const head = useRef();
  const neck = useRef();
  const torso = useRef();
  const shoulders = useRef();
  const hips = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const leftForearm = useRef();
  const rightForearm = useRef();
  const leftLeg = useRef();
  const rightLeg = useRef();
  const leftCalf = useRef();
  const rightCalf = useRef();
  
  // Generate skin color based on a natural tone
  const skinColor = useMemo(() => {
    // Mix of warm tones for realistic skin
    return new THREE.Color('#e8c39e');
  }, []);
  
  // Clothing colors
  const shirtColor = useMemo(() => 
    gender === 'female' ? new THREE.Color('#ff7eb3') : new THREE.Color('#3a86ff')
  , [gender]);
  
  const pantsColor = useMemo(() => 
    gender === 'female' ? new THREE.Color('#eb57a7') : new THREE.Color('#4361ee')
  , [gender]);
  
  // Create a breathing animation
  useFrame(({ clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      
      // Subtle breathing motion
      group.current.position.y = Math.sin(t * 0.5) * 0.02;
      
      if (torso.current) {
        // Chest expansion/contraction with breathing
        torso.current.scale.x = 1 + Math.sin(t * 0.8) * 0.01;
        torso.current.scale.z = 1 + Math.sin(t * 0.8) * 0.02;
      }
      
      // Very subtle arm swaying
      if (leftArm.current && rightArm.current) {
        leftArm.current.rotation.x = Math.sin(t * 0.3) * 0.05;
        rightArm.current.rotation.x = Math.sin(t * 0.3 + 0.4) * 0.05;
      }
    }
  });
  
  // Update body shape based on state and gender
  useEffect(() => {
    if (!group.current) return;
    
    const w = state.weight || 0.5;
    const m = state.muscle || 0.5;
    const isFemale = gender === 'female';
    
    // Gender-specific base proportions
    const genderBaseRatio = isFemale ? 0.9 : 1.0; // Females typically smaller frame
    const shoulderRatio = isFemale ? 0.85 : 1.05; // Males wider shoulders
    const hipRatio = isFemale ? 1.1 : 0.95; // Females wider hips
    const torsoHeightRatio = isFemale ? 0.95 : 1.0; // Males slightly longer torso
    
    // Head adjustments - slightly smaller for females
    if (head.current) {
      head.current.scale.x = genderBaseRatio * (0.95 + w * 0.1);
      head.current.scale.y = genderBaseRatio;
      head.current.scale.z = genderBaseRatio * (0.95 + w * 0.1);
    }
    
    // Torso shape based on weight, muscle and gender
    if (torso.current) {
      // Base dimensions from weight
      const baseWidth = 0.75 + w * 0.5;
      const muscleEffect = m * 0.3;
      
      // Gender specific adjustments
      torso.current.scale.x = baseWidth * shoulderRatio * (1 + muscleEffect * 0.6);
      torso.current.scale.y = torsoHeightRatio;
      torso.current.scale.z = (0.7 + w * 0.4) * (isFemale ? 1.15 : 1.0); // Females more chest depth
      
      // Position adjust to keep feet on ground
      torso.current.position.y = 1.0 * torsoHeightRatio;
    }
    
    // Shoulders - wider for males, especially with muscle
    if (shoulders.current) {
      const shoulderWidth = shoulderRatio * (1 + m * 0.4);
      shoulders.current.scale.x = shoulderWidth * (0.9 + w * 0.2);
    }
    
    // Hips - wider for females
    if (hips.current) {
      const hipWidth = hipRatio * (0.9 + w * 0.3);
      hips.current.scale.x = hipWidth;
    }
    
    // Arms based on weight, muscle and gender
    if (leftArm.current && rightArm.current) {
      const mArm = state.arms || m;
      // Males have thicker arms with muscle
      const armMuscleFactor = isFemale ? 0.75 : 1.2;
      const armWidth = genderBaseRatio * (0.25 + w * 0.1 + mArm * 0.25 * armMuscleFactor);
      
      leftArm.current.scale.x = armWidth;
      leftArm.current.scale.z = armWidth;
      rightArm.current.scale.x = armWidth;
      rightArm.current.scale.z = armWidth;
      
      // Position adjust for shoulder width
      leftArm.current.position.x = -0.35 * shoulderRatio;
      rightArm.current.position.x = 0.35 * shoulderRatio;
    }
    
    // Forearms
    if (leftForearm.current && rightForearm.current) {
      const mArm = state.arms || m;
      const forearmWidth = genderBaseRatio * (0.2 + w * 0.08 + mArm * 0.2);
      
      leftForearm.current.scale.x = forearmWidth;
      leftForearm.current.scale.z = forearmWidth;
      rightForearm.current.scale.x = forearmWidth;
      rightForearm.current.scale.z = forearmWidth;
      
      // Position adjust for arm position
      leftForearm.current.position.x = -0.38 * shoulderRatio;
      rightForearm.current.position.x = 0.38 * shoulderRatio;
    }
    
    // Legs based on weight, muscle and gender
    if (leftLeg.current && rightLeg.current) {
      const mLeg = state.legs || m;
      // Females typically have proportionally thicker thighs
      const legFactor = isFemale ? 1.1 : 1.0;
      const legWidth = genderBaseRatio * (0.25 + w * 0.15 + mLeg * 0.15) * legFactor;
      
      leftLeg.current.scale.x = legWidth;
      leftLeg.current.scale.z = legWidth;
      rightLeg.current.scale.x = legWidth;
      rightLeg.current.scale.z = legWidth;
      
      // Position adjust for hip width
      leftLeg.current.position.x = -0.22 * hipRatio;
      rightLeg.current.position.x = 0.22 * hipRatio;
    }
    
    // Calves
    if (leftCalf.current && rightCalf.current) {
      const mLeg = state.legs || m;
      const calfWidth = genderBaseRatio * (0.2 + w * 0.1 + mLeg * 0.2);
      
      leftCalf.current.scale.x = calfWidth;
      leftCalf.current.scale.z = calfWidth;
      rightCalf.current.scale.x = calfWidth;
      rightCalf.current.scale.z = calfWidth;
      
      // Position adjust for leg position
      leftCalf.current.position.x = -0.22 * hipRatio;
      rightCalf.current.position.x = 0.22 * hipRatio;
    }
    
  }, [state, gender]);
  
  return (
    <group ref={group} position={[0, 0, 0]} rotation={[0, Math.PI / 8, 0]}>
      {/* Head */}
      <mesh ref={head} position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.24, 32, 24]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.7} 
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Neck */}
      <mesh ref={neck} position={[0, 1.48, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.12, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.7}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Shoulders */}
      <mesh ref={shoulders} position={[0, 1.35, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.25]} />
        <meshStandardMaterial 
          color={shirtColor} 
          roughness={0.6}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Torso - more anatomical shape */}
      <mesh ref={torso} position={[0, 1.1, 0]}>
        {gender === 'female' ? (
          <cylinderGeometry args={[0.27, 0.32, 0.6, 16]} />
        ) : (
          <cylinderGeometry args={[0.28, 0.3, 0.6, 16]} />
        )}
        <meshStandardMaterial 
          color={shirtColor} 
          roughness={0.6}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Hips */}
      <mesh ref={hips} position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.32, 0.24, 0.2, 16]} />
        <meshStandardMaterial 
          color={pantsColor} 
          roughness={0.5}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Left Arm - Upper */}
      <mesh ref={leftArm} position={[-0.35, 1.25, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.08, 0.09, 0.25, 16]} />
        <meshStandardMaterial 
          color={shirtColor} 
          roughness={0.6}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Left Forearm */}
      <mesh ref={leftForearm} position={[-0.38, 1.0, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.07, 0.08, 0.25, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.7}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Right Arm - Upper */}
      <mesh ref={rightArm} position={[0.35, 1.25, 0]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.08, 0.09, 0.25, 16]} />
        <meshStandardMaterial 
          color={shirtColor} 
          roughness={0.6}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Right Forearm */}
      <mesh ref={rightForearm} position={[0.38, 1.0, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.07, 0.08, 0.25, 16]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={0.7}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Left Leg - Upper */}
      <mesh ref={leftLeg} position={[-0.22, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.11, 0.4, 16]} />
        <meshStandardMaterial 
          color={pantsColor} 
          roughness={0.5}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Left Calf */}
      <mesh ref={leftCalf} position={[-0.22, 0.2, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.4, 16]} />
        <meshStandardMaterial 
          color={pantsColor} 
          roughness={0.5}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Right Leg - Upper */}
      <mesh ref={rightLeg} position={[0.22, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.11, 0.4, 16]} />
        <meshStandardMaterial 
          color={pantsColor} 
          roughness={0.5}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Right Calf */}
      <mesh ref={rightCalf} position={[0.22, 0.2, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.4, 16]} />
        <meshStandardMaterial 
          color={pantsColor} 
          roughness={0.5}
          metalness={0.1}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Feet - Left */}
      <mesh position={[-0.22, -0.02, 0.06]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.05, 0.2]} />
        <meshStandardMaterial 
          color="#333333" 
          roughness={0.9}
          metalness={0.2}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Feet - Right */}
      <mesh position={[0.22, -0.02, 0.06]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.05, 0.2]} />
        <meshStandardMaterial 
          color="#333333" 
          roughness={0.9}
          metalness={0.2}
          wireframe={showSkeleton}
        />
      </mesh>
    </group>
  );
}