import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

// This is a simplified body model component that creates a basic human figure from primitive shapes
export function BodyModel({ state = { weight: 0.5, muscle: 0.5 }, showSkeleton = false }) {
  const group = useRef();
  
  // Body parts with references
  const torso = useRef();
  const head = useRef();
  const leftArm = useRef();
  const rightArm = useRef();
  const leftLeg = useRef();
  const rightLeg = useRef();
  
  // Create a breathing animation
  useFrame(({ clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      group.current.position.y = Math.sin(t * 0.5) * 0.03;
    }
    
    if (torso.current) {
      const t = clock.getElapsedTime();
      torso.current.scale.x = 1 + Math.sin(t * 0.8) * 0.01;
      torso.current.scale.z = 1 + Math.sin(t * 0.8) * 0.01;
    }
  });
  
  // Update body shape based on state
  useEffect(() => {
    if (!group.current) return;
    
    // Torso shape based on weight and muscle
    if (torso.current) {
      const w = state.weight || 0.5;
      const m = state.muscle || 0.5;
      
      // Base width from weight
      torso.current.scale.x = 0.8 + w * 0.4;
      torso.current.scale.z = 0.8 + w * 0.4;
      
      // Muscle definition
      const muscleEffect = m * 0.2;
      torso.current.scale.x = torso.current.scale.x * (1 + muscleEffect);
    }
    
    // Arms based on weight and muscle
    if (leftArm.current && rightArm.current) {
      const w = state.weight || 0.5;
      const m = state.muscle || 0.5;
      const mArm = state.arms || m;
      
      const armWidth = 0.2 + w * 0.1 + mArm * 0.2;
      
      leftArm.current.scale.x = armWidth;
      leftArm.current.scale.z = armWidth;
      rightArm.current.scale.x = armWidth;
      rightArm.current.scale.z = armWidth;
    }
    
    // Legs based on weight and muscle
    if (leftLeg.current && rightLeg.current) {
      const w = state.weight || 0.5;
      const m = state.muscle || 0.5;
      const mLeg = state.legs || m;
      
      const legWidth = 0.25 + w * 0.15 + mLeg * 0.15;
      
      leftLeg.current.scale.x = legWidth;
      leftLeg.current.scale.z = legWidth;
      rightLeg.current.scale.x = legWidth;
      rightLeg.current.scale.z = legWidth;
    }
  }, [state]);
  
  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Head */}
      <mesh ref={head} position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color="#f5d0b9" 
          roughness={0.7} 
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Torso */}
      <mesh ref={torso} position={[0, 1.1, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.3]} />
        <meshStandardMaterial 
          color="#3a86ff" 
          roughness={0.5} 
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Left Arm */}
      <mesh ref={leftArm} position={[-0.35, 1.1, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial 
          color="#f5d0b9" 
          roughness={0.7}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Right Arm */}
      <mesh ref={rightArm} position={[0.35, 1.1, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial 
          color="#f5d0b9" 
          roughness={0.7}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Left Leg */}
      <mesh ref={leftLeg} position={[-0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshStandardMaterial 
          color="#4361ee" 
          roughness={0.5}
          wireframe={showSkeleton}
        />
      </mesh>
      
      {/* Right Leg */}
      <mesh ref={rightLeg} position={[0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 8]} />
        <meshStandardMaterial 
          color="#4361ee" 
          roughness={0.5}
          wireframe={showSkeleton}
        />
      </mesh>
    </group>
  );
}