import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

/**
 * Realistic 2D SVG Body Model with dynamic muscle and body composition
 * This component renders a high-quality SVG human figure that adapts based on:
 * - Gender
 * - Weight/body composition
 * - Muscle development (overall and per body part)
 * - Skeletal structure visualization option
 */
export function BodySVG({
  state = { weight: 0.5, muscle: 0.5 },
  showSkeleton = false,
  gender = 'male',
  height = 500,
  showMuscleHighlight = false, // Highlight active muscle groups
  activeGroups = [], // Muscle groups to highlight
  frontView = true // Toggle between front and back view
}) {
  // Scale all dimensions proportionally based on container height
  const scale = height / 500;
  const width = 300 * scale;
  
  // Calculate body attributes based on state
  const isFemale = gender === 'female';
  const w = state.weight || 0.5; // 0 to 1, 0 = very thin, 1 = overweight
  const m = state.muscle || 0.5; // 0 to 1, 0 = minimal muscle, 1 = maximum muscle
  
  // Reference to SVG element
  const svgRef = useRef(null);
  
  // Define specific muscle development factors
  const shoulderDev = state.shoulders || m;
  const armDev = state.arms || m;
  const chestDev = state.chest || m;
  const backDev = state.back || m;
  const coreDev = state.core || m;
  const legDev = state.legs || m;
  
  // Gender-specific base dimensions
  const shoulderWidth = isFemale 
    ? 85 + (w * 10) + (shoulderDev * 15) 
    : 100 + (w * 15) + (shoulderDev * 25);
    
  const waistWidth = isFemale
    ? 70 + (w * 25) - (coreDev * 5)
    : 75 + (w * 25) - (coreDev * 8);
    
  const hipWidth = isFemale
    ? 90 + (w * 20) - (coreDev * 3)
    : 85 + (w * 18) - (coreDev * 5);
  
  const chestWidth = isFemale
    ? 88 + (w * 15) + (chestDev * 10)
    : 95 + (w * 12) + (chestDev * 20);
    
  const neckWidth = isFemale
    ? 20 + (w * 5)
    : 25 + (w * 5);
    
  const headWidth = isFemale
    ? 40 + (w * 5)
    : 45 + (w * 5);
    
  const armThickness = isFemale
    ? 18 + (w * 8) + (armDev * 12)
    : 22 + (w * 8) + (armDev * 16);
    
  const forearmThickness = isFemale
    ? 15 + (w * 5) + (armDev * 8)
    : 18 + (w * 5) + (armDev * 12);
    
  const thighThickness = isFemale
    ? 35 + (w * 15) + (legDev * 10)
    : 40 + (w * 15) + (legDev * 12);
    
  const calfThickness = isFemale
    ? 25 + (w * 8) + (legDev * 10)
    : 28 + (w * 10) + (legDev * 12);

  // Calculate muscle definition based on body fat
  const muscleDefinition = Math.max(0, m - (w * 0.7));
  
  // Get skin tone based on parameters
  const getSkinTone = () => {
    // Base skin tone - could be expanded with more options
    return '#e8c39e';
  };
  
  // Get clothing colors
  const getShirtColor = () => {
    return isFemale ? '#ff7eb3' : '#3a86ff';
  };
  
  const getPantsColor = () => {
    return isFemale ? '#eb57a7' : '#4361ee';
  };
  
  // Muscle highlight colors
  const getMuscleHighlightColor = (muscleGroup) => {
    if (!showMuscleHighlight || !activeGroups.includes(muscleGroup)) {
      return 'none';
    }
    
    // Different colors for different muscle groups
    switch (muscleGroup) {
      case 'shoulders': return 'rgba(255, 120, 120, 0.5)';
      case 'chest': return 'rgba(120, 255, 120, 0.5)';
      case 'back': return 'rgba(120, 120, 255, 0.5)';
      case 'arms': return 'rgba(255, 255, 120, 0.5)';
      case 'core': return 'rgba(255, 120, 255, 0.5)';
      case 'legs': return 'rgba(120, 255, 255, 0.5)';
      default: return 'none';
    }
  };
  
  // Define paths for front view body
  const getFrontBodyPaths = () => {
    // Head and neck coordinates
    const headCY = 40;
    const neckTopY = headCY + headWidth/2;
    const neckBottomY = neckTopY + 20;
    
    // Shoulder coordinates
    const shoulderY = neckBottomY + 10;
    const shoulderLeftX = width/2 - shoulderWidth/2;
    const shoulderRightX = width/2 + shoulderWidth/2;
    
    // Chest coordinates
    const chestY = shoulderY + 35;
    const chestLeftX = width/2 - chestWidth/2;
    const chestRightX = width/2 + chestWidth/2;
    
    // Waist coordinates
    const waistY = chestY + 60;
    const waistLeftX = width/2 - waistWidth/2;
    const waistRightX = width/2 + waistWidth/2;
    
    // Hip coordinates
    const hipY = waistY + 20;
    const hipLeftX = width/2 - hipWidth/2;
    const hipRightX = width/2 + hipWidth/2;
    
    // Arm coordinates
    const upperArmTopY = shoulderY + 5;
    const upperArmBottomY = chestY + 30;
    const forearmBottomY = waistY + 20;
    
    // Leg coordinates
    const thighBottomY = hipY + 100;
    const kneeY = thighBottomY;
    const calfBottomY = kneeY + 110;
    
    return {
      // Head path
      head: `M ${width/2 - headWidth/2} ${headCY} a ${headWidth/2} ${headWidth/2} 0 1 0 ${headWidth} 0 a ${headWidth/2} ${headWidth/2} 0 1 0 ${-headWidth} 0`,
      
      // Neck path
      neck: `M ${width/2 - neckWidth/2} ${neckTopY} 
             L ${width/2 + neckWidth/2} ${neckTopY} 
             L ${width/2 + neckWidth/2 + 2} ${neckBottomY} 
             L ${width/2 - neckWidth/2 - 2} ${neckBottomY} Z`,
             
      // Torso path - including shoulders, chest, waist, hips
      torso: `M ${shoulderLeftX} ${shoulderY}
              L ${shoulderRightX} ${shoulderY}
              C ${shoulderRightX + 5} ${shoulderY + 20}, ${chestRightX + 10} ${chestY - 10}, ${chestRightX} ${chestY}
              C ${chestRightX - 2} ${chestY + 30}, ${waistRightX + 5} ${waistY - 20}, ${waistRightX} ${waistY}
              C ${waistRightX - 2} ${waistY + 10}, ${hipRightX + 3} ${hipY - 5}, ${hipRightX} ${hipY}
              L ${hipLeftX} ${hipY}
              C ${hipLeftX - 3} ${hipY - 5}, ${waistLeftX + 2} ${waistY + 10}, ${waistLeftX} ${waistY}
              C ${waistLeftX - 5} ${waistY - 20}, ${chestLeftX + 2} ${chestY + 30}, ${chestLeftX} ${chestY}
              C ${chestLeftX - 10} ${chestY - 10}, ${shoulderLeftX - 5} ${shoulderY + 20}, ${shoulderLeftX} ${shoulderY}
              Z`,
              
      // Left arm (viewer's right)
      leftArm: `M ${shoulderRightX - 5} ${upperArmTopY}
                C ${shoulderRightX + 15} ${upperArmTopY + 10}, ${shoulderRightX + armThickness} ${upperArmTopY + 40}, ${shoulderRightX + armThickness - 2} ${upperArmBottomY}
                C ${shoulderRightX + armThickness - 5} ${upperArmBottomY + 10}, ${shoulderRightX + forearmThickness} ${upperArmBottomY + 30}, ${shoulderRightX + forearmThickness - 2} ${forearmBottomY}
                C ${shoulderRightX + forearmThickness - 10} ${forearmBottomY + 5}, ${shoulderRightX + 5} ${forearmBottomY + 10}, ${shoulderRightX - 2} ${forearmBottomY}
                C ${shoulderRightX - 5} ${upperArmBottomY + 20}, ${shoulderRightX - 10} ${upperArmBottomY + 10}, ${shoulderRightX - 8} ${upperArmBottomY}
                C ${shoulderRightX - 15} ${upperArmTopY + 40}, ${shoulderRightX - 15} ${upperArmTopY + 20}, ${shoulderRightX - 5} ${upperArmTopY}
                Z`,
                
      // Right arm (viewer's left)
      rightArm: `M ${shoulderLeftX + 5} ${upperArmTopY}
                 C ${shoulderLeftX - 15} ${upperArmTopY + 10}, ${shoulderLeftX - armThickness} ${upperArmTopY + 40}, ${shoulderLeftX - armThickness + 2} ${upperArmBottomY}
                 C ${shoulderLeftX - armThickness + 5} ${upperArmBottomY + 10}, ${shoulderLeftX - forearmThickness} ${upperArmBottomY + 30}, ${shoulderLeftX - forearmThickness + 2} ${forearmBottomY}
                 C ${shoulderLeftX - forearmThickness + 10} ${forearmBottomY + 5}, ${shoulderLeftX - 5} ${forearmBottomY + 10}, ${shoulderLeftX + 2} ${forearmBottomY}
                 C ${shoulderLeftX + 5} ${upperArmBottomY + 20}, ${shoulderLeftX + 10} ${upperArmBottomY + 10}, ${shoulderLeftX + 8} ${upperArmBottomY}
                 C ${shoulderLeftX + 15} ${upperArmTopY + 40}, ${shoulderLeftX + 15} ${upperArmTopY + 20}, ${shoulderLeftX + 5} ${upperArmTopY}
                 Z`,
                 
      // Left leg (viewer's right)
      leftLeg: `M ${width/2 + 5} ${hipY}
                C ${hipRightX - 10} ${hipY + 10}, ${hipRightX - 5} ${hipY + 20}, ${hipRightX - 2} ${hipY + 30}
                C ${hipRightX + 5} ${hipY + 50}, ${width/2 + thighThickness/2} ${hipY + 70}, ${width/2 + thighThickness/2} ${kneeY}
                C ${width/2 + calfThickness/2 + 5} ${kneeY + 20}, ${width/2 + calfThickness/2} ${kneeY + 50}, ${width/2 + calfThickness/2 - 2} ${calfBottomY}
                C ${width/2 + calfThickness/2 - 10} ${calfBottomY + 5}, ${width/2 + calfThickness/2 - 20} ${calfBottomY + 5}, ${width/2 + 3} ${calfBottomY}
                C ${width/2 - 5} ${kneeY + 40}, ${width/2 - 8} ${kneeY + 20}, ${width/2 - 5} ${kneeY}
                C ${width/2 - 8} ${hipY + 50}, ${width/2 - 5} ${hipY + 20}, ${width/2 - 5} ${hipY}
                Z`,
                
      // Right leg (viewer's left)
      rightLeg: `M ${width/2 - 5} ${hipY}
                 C ${hipLeftX + 10} ${hipY + 10}, ${hipLeftX + 5} ${hipY + 20}, ${hipLeftX + 2} ${hipY + 30}
                 C ${hipLeftX - 5} ${hipY + 50}, ${width/2 - thighThickness/2} ${hipY + 70}, ${width/2 - thighThickness/2} ${kneeY}
                 C ${width/2 - calfThickness/2 - 5} ${kneeY + 20}, ${width/2 - calfThickness/2} ${kneeY + 50}, ${width/2 - calfThickness/2 + 2} ${calfBottomY}
                 C ${width/2 - calfThickness/2 + 10} ${calfBottomY + 5}, ${width/2 - calfThickness/2 + 20} ${calfBottomY + 5}, ${width/2 - 3} ${calfBottomY}
                 C ${width/2 + 5} ${kneeY + 40}, ${width/2 + 8} ${kneeY + 20}, ${width/2 + 5} ${kneeY}
                 C ${width/2 + 8} ${hipY + 50}, ${width/2 + 5} ${hipY + 20}, ${width/2 + 5} ${hipY}
                 Z`,
      
      // Muscle definition lines - only show when low body fat and high muscle
      muscleDefinitionLines: {
        // Chest separation
        chestLine: muscleDefinition > 0.3 ? 
          `M ${width/2} ${neckBottomY + 15} 
           C ${width/2} ${chestY - 10}, ${width/2} ${chestY}, ${width/2} ${chestY + 15}` : '',
        
        // Abs definition
        absLines: muscleDefinition > 0.4 ? [
          // Top ab line
          `M ${width/2 - 15} ${chestY + 25} C ${width/2} ${chestY + 23}, ${width/2 + 15} ${chestY + 25}, ${width/2 + 15} ${chestY + 25}`,
          // Middle ab line
          `M ${width/2 - 15} ${chestY + 45} C ${width/2} ${chestY + 43}, ${width/2 + 15} ${chestY + 45}, ${width/2 + 15} ${chestY + 45}`,
          // Bottom ab line
          `M ${width/2 - 12} ${waistY - 10} C ${width/2} ${waistY - 12}, ${width/2 + 12} ${waistY - 10}, ${width/2 + 12} ${waistY - 10}`
        ] : [],
        
        // Arm muscle definition
        leftArmLines: muscleDefinition > 0.4 ? [
          // Bicep curve
          `M ${shoulderRightX + 5} ${upperArmTopY + 30} 
           C ${shoulderRightX + 10} ${upperArmTopY + 35}, ${shoulderRightX + 15} ${upperArmTopY + 40}, ${shoulderRightX + 10} ${upperArmTopY + 50}`
        ] : [],
        
        rightArmLines: muscleDefinition > 0.4 ? [
          // Bicep curve
          `M ${shoulderLeftX - 5} ${upperArmTopY + 30} 
           C ${shoulderLeftX - 10} ${upperArmTopY + 35}, ${shoulderLeftX - 15} ${upperArmTopY + 40}, ${shoulderLeftX - 10} ${upperArmTopY + 50}`
        ] : [],
        
        // Leg definition
        leftLegLines: muscleDefinition > 0.4 ? [
          // Quad separation
          `M ${width/2 + 10} ${hipY + 50} 
           C ${width/2 + 15} ${hipY + 70}, ${width/2 + 15} ${hipY + 85}, ${width/2 + 10} ${kneeY - 10}`
        ] : [],
        
        rightLegLines: muscleDefinition > 0.4 ? [
          // Quad separation
          `M ${width/2 - 10} ${hipY + 50} 
           C ${width/2 - 15} ${hipY + 70}, ${width/2 - 15} ${hipY + 85}, ${width/2 - 10} ${kneeY - 10}`
        ] : []
      }
    };
  };

  // Define paths for back view body
  const getBackBodyPaths = () => {
    // Head and neck coordinates
    const headCY = 40;
    const neckTopY = headCY + headWidth/2;
    const neckBottomY = neckTopY + 20;
    
    // Shoulder coordinates
    const shoulderY = neckBottomY + 10;
    const shoulderLeftX = width/2 - shoulderWidth/2;
    const shoulderRightX = width/2 + shoulderWidth/2;
    
    // Upper back coordinates
    const upperBackY = shoulderY + 35;
    const upperBackLeftX = width/2 - chestWidth/2;
    const upperBackRightX = width/2 + chestWidth/2;
    
    // Mid back coordinates
    const midBackY = upperBackY + 40;
    const midBackWidth = waistWidth + (backDev * 15);
    const midBackLeftX = width/2 - midBackWidth/2;
    const midBackRightX = width/2 + midBackWidth/2;
    
    // Waist coordinates
    const waistY = midBackY + 20;
    const waistLeftX = width/2 - waistWidth/2;
    const waistRightX = width/2 + waistWidth/2;
    
    // Hip coordinates
    const hipY = waistY + 20;
    const hipLeftX = width/2 - hipWidth/2;
    const hipRightX = width/2 + hipWidth/2;
    
    // Arm coordinates
    const upperArmTopY = shoulderY + 5;
    const upperArmBottomY = upperBackY + 30;
    const forearmBottomY = waistY + 20;
    
    // Leg coordinates
    const thighBottomY = hipY + 100;
    const kneeY = thighBottomY;
    const calfBottomY = kneeY + 110;
    
    return {
      // Head path
      head: `M ${width/2 - headWidth/2} ${headCY} a ${headWidth/2} ${headWidth/2} 0 1 0 ${headWidth} 0 a ${headWidth/2} ${headWidth/2} 0 1 0 ${-headWidth} 0`,
      
      // Neck path
      neck: `M ${width/2 - neckWidth/2} ${neckTopY} 
             L ${width/2 + neckWidth/2} ${neckTopY} 
             L ${width/2 + neckWidth/2 + 2} ${neckBottomY} 
             L ${width/2 - neckWidth/2 - 2} ${neckBottomY} Z`,
             
      // Back torso path
      torso: `M ${shoulderLeftX} ${shoulderY}
              L ${shoulderRightX} ${shoulderY}
              C ${shoulderRightX + 5} ${shoulderY + 20}, ${upperBackRightX + 5} ${upperBackY - 10}, ${upperBackRightX} ${upperBackY}
              C ${upperBackRightX - 2} ${upperBackY + 20}, ${midBackRightX + 3} ${midBackY - 10}, ${midBackRightX} ${midBackY}
              C ${midBackRightX - 2} ${midBackY + 10}, ${waistRightX + 5} ${waistY - 10}, ${waistRightX} ${waistY}
              C ${waistRightX - 2} ${waistY + 10}, ${hipRightX + 3} ${hipY - 5}, ${hipRightX} ${hipY}
              L ${hipLeftX} ${hipY}
              C ${hipLeftX - 3} ${hipY - 5}, ${waistLeftX + 2} ${waistY + 10}, ${waistLeftX} ${waistY}
              C ${waistLeftX - 5} ${waistY - 10}, ${midBackLeftX + 2} ${midBackY + 10}, ${midBackLeftX} ${midBackY}
              C ${midBackLeftX - 3} ${midBackY - 10}, ${upperBackLeftX + 2} ${upperBackY + 20}, ${upperBackLeftX} ${upperBackY}
              C ${upperBackLeftX - 5} ${upperBackY - 10}, ${shoulderLeftX - 5} ${shoulderY + 20}, ${shoulderLeftX} ${shoulderY}
              Z`,
              
      // Left arm (viewer's right)
      leftArm: `M ${shoulderRightX - 5} ${upperArmTopY}
                C ${shoulderRightX + 15} ${upperArmTopY + 10}, ${shoulderRightX + armThickness} ${upperArmTopY + 40}, ${shoulderRightX + armThickness - 2} ${upperArmBottomY}
                C ${shoulderRightX + armThickness - 5} ${upperArmBottomY + 10}, ${shoulderRightX + forearmThickness} ${upperArmBottomY + 30}, ${shoulderRightX + forearmThickness - 2} ${forearmBottomY}
                C ${shoulderRightX + forearmThickness - 10} ${forearmBottomY + 5}, ${shoulderRightX + 5} ${forearmBottomY + 10}, ${shoulderRightX - 2} ${forearmBottomY}
                C ${shoulderRightX - 5} ${upperArmBottomY + 20}, ${shoulderRightX - 10} ${upperArmBottomY + 10}, ${shoulderRightX - 8} ${upperArmBottomY}
                C ${shoulderRightX - 15} ${upperArmTopY + 40}, ${shoulderRightX - 15} ${upperArmTopY + 20}, ${shoulderRightX - 5} ${upperArmTopY}
                Z`,
                
      // Right arm (viewer's left)
      rightArm: `M ${shoulderLeftX + 5} ${upperArmTopY}
                 C ${shoulderLeftX - 15} ${upperArmTopY + 10}, ${shoulderLeftX - armThickness} ${upperArmTopY + 40}, ${shoulderLeftX - armThickness + 2} ${upperArmBottomY}
                 C ${shoulderLeftX - armThickness + 5} ${upperArmBottomY + 10}, ${shoulderLeftX - forearmThickness} ${upperArmBottomY + 30}, ${shoulderLeftX - forearmThickness + 2} ${forearmBottomY}
                 C ${shoulderLeftX - forearmThickness + 10} ${forearmBottomY + 5}, ${shoulderLeftX - 5} ${forearmBottomY + 10}, ${shoulderLeftX + 2} ${forearmBottomY}
                 C ${shoulderLeftX + 5} ${upperArmBottomY + 20}, ${shoulderLeftX + 10} ${upperArmBottomY + 10}, ${shoulderLeftX + 8} ${upperArmBottomY}
                 C ${shoulderLeftX + 15} ${upperArmTopY + 40}, ${shoulderLeftX + 15} ${upperArmTopY + 20}, ${shoulderLeftX + 5} ${upperArmTopY}
                 Z`,
                 
      // Left leg (viewer's right)
      leftLeg: `M ${width/2 + 5} ${hipY}
                C ${hipRightX - 10} ${hipY + 10}, ${hipRightX - 5} ${hipY + 20}, ${hipRightX - 2} ${hipY + 30}
                C ${hipRightX + 5} ${hipY + 50}, ${width/2 + thighThickness/2} ${hipY + 70}, ${width/2 + thighThickness/2} ${kneeY}
                C ${width/2 + calfThickness/2 + 5} ${kneeY + 20}, ${width/2 + calfThickness/2} ${kneeY + 50}, ${width/2 + calfThickness/2 - 2} ${calfBottomY}
                C ${width/2 + calfThickness/2 - 10} ${calfBottomY + 5}, ${width/2 + calfThickness/2 - 20} ${calfBottomY + 5}, ${width/2 + 3} ${calfBottomY}
                C ${width/2 - 5} ${kneeY + 40}, ${width/2 - 8} ${kneeY + 20}, ${width/2 - 5} ${kneeY}
                C ${width/2 - 8} ${hipY + 50}, ${width/2 - 5} ${hipY + 20}, ${width/2 - 5} ${hipY}
                Z`,
                
      // Right leg (viewer's left)
      rightLeg: `M ${width/2 - 5} ${hipY}
                 C ${hipLeftX + 10} ${hipY + 10}, ${hipLeftX + 5} ${hipY + 20}, ${hipLeftX + 2} ${hipY + 30}
                 C ${hipLeftX - 5} ${hipY + 50}, ${width/2 - thighThickness/2} ${hipY + 70}, ${width/2 - thighThickness/2} ${kneeY}
                 C ${width/2 - calfThickness/2 - 5} ${kneeY + 20}, ${width/2 - calfThickness/2} ${kneeY + 50}, ${width/2 - calfThickness/2 + 2} ${calfBottomY}
                 C ${width/2 - calfThickness/2 + 10} ${calfBottomY + 5}, ${width/2 - calfThickness/2 + 20} ${calfBottomY + 5}, ${width/2 - 3} ${calfBottomY}
                 C ${width/2 + 5} ${kneeY + 40}, ${width/2 + 8} ${kneeY + 20}, ${width/2 + 5} ${kneeY}
                 C ${width/2 + 8} ${hipY + 50}, ${width/2 + 5} ${hipY + 20}, ${width/2 + 5} ${hipY}
                 Z`,
      
      // Muscle definition lines - only show when low body fat and high muscle
      muscleDefinitionLines: {
        // Back definition
        backLines: muscleDefinition > 0.3 ? [
          // Upper back/trap line
          `M ${width/2} ${neckBottomY + 15} 
           C ${width/2} ${shoulderY + 10}, ${width/2} ${shoulderY + 20}, ${width/2} ${shoulderY + 30}`,
           
          // Middle back definition
          `M ${width/2 - 20 - (backDev * 10)} ${upperBackY + 15} 
           C ${width/2} ${upperBackY + 10}, ${width/2 + 20 + (backDev * 10)} ${upperBackY + 15}, ${width/2 + 20 + (backDev * 10)} ${upperBackY + 15}`,
           
          // Lower back curve
          `M ${width/2 - 15} ${midBackY + 10} 
           C ${width/2} ${midBackY + 5}, ${width/2 + 15} ${midBackY + 10}, ${width/2 + 15} ${midBackY + 10}`
        ] : [],
        
        // Arm muscle definition - triceps
        leftArmLines: muscleDefinition > 0.4 ? [
          // Tricep line 
          `M ${shoulderRightX + 10} ${upperArmTopY + 30} 
           C ${shoulderRightX + 18} ${upperArmTopY + 40}, ${shoulderRightX + 18} ${upperArmTopY + 55}, ${shoulderRightX + 12} ${upperArmBottomY - 10}`
        ] : [],
        
        rightArmLines: muscleDefinition > 0.4 ? [
          // Tricep line
          `M ${shoulderLeftX - 10} ${upperArmTopY + 30} 
           C ${shoulderLeftX - 18} ${upperArmTopY + 40}, ${shoulderLeftX - 18} ${upperArmTopY + 55}, ${shoulderLeftX - 12} ${upperArmBottomY - 10}`
        ] : [],
        
        // Leg definition - hamstrings & calves
        leftLegLines: muscleDefinition > 0.4 ? [
          // Hamstring separation
          `M ${width/2 + 10} ${hipY + 60} 
           C ${width/2 + 18} ${hipY + 80}, ${width/2 + 20} ${hipY + 100}, ${width/2 + 15} ${kneeY - 10}`,
           
          // Calf definition
          `M ${width/2 + 15} ${kneeY + 40} 
           C ${width/2 + 20} ${kneeY + 60}, ${width/2 + 18} ${kneeY + 80}, ${width/2 + 12} ${calfBottomY - 20}`
        ] : [],
        
        rightLegLines: muscleDefinition > 0.4 ? [
          // Hamstring separation
          `M ${width/2 - 10} ${hipY + 60} 
           C ${width/2 - 18} ${hipY + 80}, ${width/2 - 20} ${hipY + 100}, ${width/2 - 15} ${kneeY - 10}`,
           
          // Calf definition
          `M ${width/2 - 15} ${kneeY + 40} 
           C ${width/2 - 20} ${kneeY + 60}, ${width/2 - 18} ${kneeY + 80}, ${width/2 - 12} ${calfBottomY - 20}`
        ] : []
      }
    };
  };
  
  // Skeleton paths definition
  const getSkeletonPaths = () => {
    // Basic dimensions for skeleton
    const shoulderY = 70;
    const spineBottomY = 195;
    const ribEndY = 140;
    const pelvisTopY = 195;
    const pelvisBottomY = 220;
    const kneeY = 330;
    const ankleY = 440;
    
    return {
      // Skull
      skull: `M ${width/2 - 18} ${25} 
              a 18 22 0 1 0 36 0 
              a 18 22 0 1 0 -36 0`,
              
      // Spine
      spine: `M ${width/2} ${70} 
              L ${width/2} ${spineBottomY}`,
              
      // Ribcage - simplified version
      ribcage: [
        // Upper ribs
        `M ${width/2 - 30} ${90} L ${width/2 + 30} ${90}`, 
        `M ${width/2 - 35} ${105} L ${width/2 + 35} ${105}`,
        `M ${width/2 - 38} ${120} L ${width/2 + 38} ${120}`,
        `M ${width/2 - 35} ${135} L ${width/2 + 35} ${135}`,
        // Sternum
        `M ${width/2} ${70} L ${width/2} ${ribEndY}`
      ],
      
      // Shoulders
      shoulders: [
        `M ${width/2} ${shoulderY} L ${width/2 - 40} ${shoulderY - 5}`,
        `M ${width/2} ${shoulderY} L ${width/2 + 40} ${shoulderY - 5}`
      ],
      
      // Arms
      arms: [
        // Left upper arm
        `M ${width/2 + 40} ${shoulderY - 5} L ${width/2 + 60} ${shoulderY + 80}`,
        // Left forearm
        `M ${width/2 + 60} ${shoulderY + 80} L ${width/2 + 50} ${shoulderY + 150}`,
        // Right upper arm
        `M ${width/2 - 40} ${shoulderY - 5} L ${width/2 - 60} ${shoulderY + 80}`,
        // Right forearm
        `M ${width/2 - 60} ${shoulderY + 80} L ${width/2 - 50} ${shoulderY + 150}`
      ],
      
      // Hands (simplified)
      hands: [
        `M ${width/2 + 50} ${shoulderY + 150} L ${width/2 + 52} ${shoulderY + 170}`,
        `M ${width/2 - 50} ${shoulderY + 150} L ${width/2 - 52} ${shoulderY + 170}`
      ],
      
      // Pelvis 
      pelvis: [
        // Iliac crest
        `M ${width/2 - 35} ${pelvisTopY} L ${width/2 + 35} ${pelvisTopY}`,
        // Hip connections
        `M ${width/2 - 35} ${pelvisTopY} L ${width/2 - 40} ${pelvisTopY + 15} L ${width/2 - 25} ${pelvisBottomY}`,
        `M ${width/2 + 35} ${pelvisTopY} L ${width/2 + 40} ${pelvisTopY + 15} L ${width/2 + 25} ${pelvisBottomY}`,
        // Bottom connection
        `M ${width/2 - 25} ${pelvisBottomY} L ${width/2 + 25} ${pelvisBottomY}`
      ],
      
      // Legs
      legs: [
        // Left femur
        `M ${width/2 + 25} ${pelvisBottomY} L ${width/2 + 30} ${kneeY}`,
        // Left tibia/fibula
        `M ${width/2 + 30} ${kneeY} L ${width/2 + 25} ${ankleY}`,
        // Left foot
        `M ${width/2 + 25} ${ankleY} L ${width/2 + 40} ${ankleY + 10}`,
        
        // Right femur
        `M ${width/2 - 25} ${pelvisBottomY} L ${width/2 - 30} ${kneeY}`,
        // Right tibia/fibula
        `M ${width/2 - 30} ${kneeY} L ${width/2 - 25} ${ankleY}`,
        // Right foot
        `M ${width/2 - 25} ${ankleY} L ${width/2 - 40} ${ankleY + 10}`
      ],
      
      // Joints - represented as small circles
      joints: [
        // Shoulders
        { cx: width/2 - 40, cy: shoulderY - 5, r: 3 },
        { cx: width/2 + 40, cy: shoulderY - 5, r: 3 },
        // Elbows
        { cx: width/2 - 60, cy: shoulderY + 80, r: 3 },
        { cx: width/2 + 60, cy: shoulderY + 80, r: 3 },
        // Wrists
        { cx: width/2 - 50, cy: shoulderY + 150, r: 3 },
        { cx: width/2 + 50, cy: shoulderY + 150, r: 3 },
        // Hips
        { cx: width/2 - 25, cy: pelvisBottomY, r: 3 },
        { cx: width/2 + 25, cy: pelvisBottomY, r: 3 },
        // Knees
        { cx: width/2 - 30, cy: kneeY, r: 3 },
        { cx: width/2 + 30, cy: kneeY, r: 3 },
        // Ankles
        { cx: width/2 - 25, cy: ankleY, r: 3 },
        { cx: width/2 + 25, cy: ankleY, r: 3 }
      ]
    };
  };

  // Get appropriate paths based on view
  const bodyPaths = frontView ? getFrontBodyPaths() : getBackBodyPaths();
  const skeletonPaths = getSkeletonPaths();
  
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      p: 2
    }}>
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background effect */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#bodyGradient)" />
        
        {/* Render skeleton if enabled */}
        {showSkeleton && (
          <g className="skeleton" stroke="#888" strokeWidth="2" fill="none">
            <path d={skeletonPaths.skull} />
            <path d={skeletonPaths.spine} />
            {skeletonPaths.ribcage.map((path, i) => (
              <path key={`rib-${i}`} d={path} />
            ))}
            {skeletonPaths.shoulders.map((path, i) => (
              <path key={`shoulder-${i}`} d={path} />
            ))}
            {skeletonPaths.arms.map((path, i) => (
              <path key={`arm-${i}`} d={path} />
            ))}
            {skeletonPaths.hands.map((path, i) => (
              <path key={`hand-${i}`} d={path} />
            ))}
            {skeletonPaths.pelvis.map((path, i) => (
              <path key={`pelvis-${i}`} d={path} />
            ))}
            {skeletonPaths.legs.map((path, i) => (
              <path key={`leg-${i}`} d={path} />
            ))}
            {skeletonPaths.joints.map((joint, i) => (
              <circle 
                key={`joint-${i}`} 
                cx={joint.cx} 
                cy={joint.cy} 
                r={joint.r} 
                fill="white" 
                stroke="#888" 
              />
            ))}
          </g>
        )}
        
        {/* Render body parts in defined order - lowest z-index first */}
        <g className="body" style={{ opacity: showSkeleton ? 0.7 : 1 }}>
          {/* Legs */}
          <path 
            d={bodyPaths.leftLeg} 
            fill={getPantsColor()} 
            stroke="#00000020"
            strokeWidth="1"
          />
          <path 
            d={bodyPaths.rightLeg} 
            fill={getPantsColor()} 
            stroke="#00000020"
            strokeWidth="1"
          />
          
          {/* Torso */}
          <path 
            d={bodyPaths.torso} 
            fill={getShirtColor()} 
            stroke="#00000020"
            strokeWidth="1"
          />
          
          {/* Arms */}
          <path 
            d={bodyPaths.leftArm} 
            fill={frontView ? getShirtColor() : getSkinTone()} 
            stroke="#00000020"
            strokeWidth="1"
          />
          <path 
            d={bodyPaths.rightArm} 
            fill={frontView ? getShirtColor() : getSkinTone()} 
            stroke="#00000020"
            strokeWidth="1"
          />
          
          {/* Neck */}
          <path 
            d={bodyPaths.neck} 
            fill={getSkinTone()} 
            stroke="#00000020"
            strokeWidth="1"
          />
          
          {/* Head */}
          <path 
            d={bodyPaths.head} 
            fill={getSkinTone()} 
            stroke="#00000020"
            strokeWidth="1"
          />
          
          {/* Add muscle definition lines based on muscularity and body fat */}
          <g className="muscle-definition" stroke="#00000030" strokeWidth="1.5" fill="none">
            {/* Center chest/abs line */}
            {bodyPaths.muscleDefinitionLines.chestLine && frontView && (
              <path d={bodyPaths.muscleDefinitionLines.chestLine} />
            )}
            
            {/* Ab definition */}
            {bodyPaths.muscleDefinitionLines.absLines && frontView && 
              bodyPaths.muscleDefinitionLines.absLines.map((line, i) => (
                <path key={`abs-${i}`} d={line} />
              ))
            }
            
            {/* Back definition */}
            {bodyPaths.muscleDefinitionLines.backLines && !frontView && 
              bodyPaths.muscleDefinitionLines.backLines.map((line, i) => (
                <path key={`back-${i}`} d={line} />
              ))
            }
            
            {/* Arm definition */}
            {bodyPaths.muscleDefinitionLines.leftArmLines && 
              bodyPaths.muscleDefinitionLines.leftArmLines.map((line, i) => (
                <path key={`leftarm-${i}`} d={line} />
              ))
            }
            
            {bodyPaths.muscleDefinitionLines.rightArmLines && 
              bodyPaths.muscleDefinitionLines.rightArmLines.map((line, i) => (
                <path key={`rightarm-${i}`} d={line} />
              ))
            }
            
            {/* Leg definition */}
            {bodyPaths.muscleDefinitionLines.leftLegLines && 
              bodyPaths.muscleDefinitionLines.leftLegLines.map((line, i) => (
                <path key={`leftleg-${i}`} d={line} />
              ))
            }
            
            {bodyPaths.muscleDefinitionLines.rightLegLines && 
              bodyPaths.muscleDefinitionLines.rightLegLines.map((line, i) => (
                <path key={`rightleg-${i}`} d={line} />
              ))
            }
          </g>
          
          {/* Muscle group highlight overlays */}
          <g className="muscle-highlights">
            {/* Shoulders highlight */}
            <path 
              d={`M ${width/2 - shoulderWidth/2 - 5} ${shoulderY - 5}
                 L ${width/2 + shoulderWidth/2 + 5} ${shoulderY - 5}
                 L ${width/2 + shoulderWidth/2 + 10} ${shoulderY + 20}
                 C ${width/2 + chestWidth/2 + 5} ${shoulderY + 30}, ${width/2 + chestWidth/2} ${shoulderY + 30}, ${width/2 + chestWidth/2 - 5} ${shoulderY + 40}
                 L ${width/2 - chestWidth/2 + 5} ${shoulderY + 40}
                 C ${width/2 - chestWidth/2} ${shoulderY + 30}, ${width/2 - chestWidth/2 - 5} ${shoulderY + 30}, ${width/2 - shoulderWidth/2 - 10} ${shoulderY + 20}
                 Z`} 
              fill={getMuscleHighlightColor('shoulders')}
              stroke="none"
            />
            
            {/* Chest highlight - front view only */}
            {frontView && (
              <path 
                d={`M ${width/2 - chestWidth/2 + 5} ${shoulderY + 40}
                   L ${width/2 + chestWidth/2 - 5} ${shoulderY + 40}
                   C ${width/2 + chestWidth/2 - 15} ${shoulderY + 80}, ${width/2 + waistWidth/2 - 10} ${waistY - 20}, ${width/2 + waistWidth/2 - 15} ${waistY - 10}
                   L ${width/2 - waistWidth/2 + 15} ${waistY - 10}
                   C ${width/2 - waistWidth/2 + 10} ${waistY - 20}, ${width/2 - chestWidth/2 + 15} ${shoulderY + 80}, ${width/2 - chestWidth/2 + 5} ${shoulderY + 40}
                   Z`} 
                fill={getMuscleHighlightColor('chest')}
                stroke="none"
              />
            )}
            
            {/* Back highlight - back view only */}
            {!frontView && (
              <path 
                d={`M ${width/2 - chestWidth/2 + 5} ${shoulderY + 40}
                   L ${width/2 + chestWidth/2 - 5} ${shoulderY + 40}
                   C ${width/2 + chestWidth/2} ${shoulderY + 60}, ${width/2 + chestWidth/2 + 5} ${shoulderY + 80}, ${width/2 + waistWidth/2} ${waistY - 30}
                   C ${width/2 + waistWidth/2 - 5} ${waistY - 15}, ${width/2 + waistWidth/2 - 10} ${waistY - 10}, ${width/2 + waistWidth/2 - 15} ${waistY - 5}
                   L ${width/2 - waistWidth/2 + 15} ${waistY - 5}
                   C ${width/2 - waistWidth/2 + 10} ${waistY - 10}, ${width/2 - waistWidth/2 + 5} ${waistY - 15}, ${width/2 - waistWidth/2} ${waistY - 30}
                   C ${width/2 - chestWidth/2 - 5} ${shoulderY + 80}, ${width/2 - chestWidth/2} ${shoulderY + 60}, ${width/2 - chestWidth/2 + 5} ${shoulderY + 40}
                   Z`} 
                fill={getMuscleHighlightColor('back')}
                stroke="none"
              />
            )}
            
            {/* Arms highlight */}
            <path 
              d={bodyPaths.leftArm} 
              fill={getMuscleHighlightColor('arms')}
              stroke="none"
            />
            <path 
              d={bodyPaths.rightArm} 
              fill={getMuscleHighlightColor('arms')}
              stroke="none"
            />
            
            {/* Core highlight */}
            <path 
              d={`M ${width/2 - waistWidth/2 + 10} ${waistY - 10}
                 L ${width/2 + waistWidth/2 - 10} ${waistY - 10}
                 C ${width/2 + waistWidth/2 - 5} ${waistY}, ${width/2 + hipWidth/2 - 5} ${hipY - 5}, ${width/2 + hipWidth/2 - 10} ${hipY}
                 L ${width/2 - hipWidth/2 + 10} ${hipY}
                 C ${width/2 - hipWidth/2 + 5} ${hipY - 5}, ${width/2 - waistWidth/2 + 5} ${waistY}, ${width/2 - waistWidth/2 + 10} ${waistY - 10}
                 Z`} 
              fill={getMuscleHighlightColor('core')}
              stroke="none"
            />
            
            {/* Legs highlight */}
            <path 
              d={bodyPaths.leftLeg} 
              fill={getMuscleHighlightColor('legs')}
              stroke="none"
            />
            <path 
              d={bodyPaths.rightLeg} 
              fill={getMuscleHighlightColor('legs')}
              stroke="none"
            />
          </g>
        </g>
      </svg>
    </Box>
  );
}