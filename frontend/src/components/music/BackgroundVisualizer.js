import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

/**
 * BackgroundVisualizer component - Creates a beautiful animated background effect
 * that responds to music playback
 * 
 * @param {Object} props
 * @param {string} props.baseColor - Primary color for the visualizer
 * @param {string} props.accentColor - Secondary/accent color
 * @param {number} props.intensity - Intensity of the visualization (0-1)
 * @param {string} props.type - Type of visualization (waves, particles, grid, etc.)
 * @returns {JSX.Element}
 */
const BackgroundVisualizer = ({
  baseColor = '#7B1FA2',
  accentColor = '#3F51B5',
  intensity = 0.7,
  type = 'waves'
}) => {
  const canvasRef = useRef(null);
  const { isPlaying, currentTime } = useMusicPlayer();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef(null);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { clientWidth, clientHeight } = canvasRef.current.parentElement;
        setDimensions({
          width: clientWidth,
          height: clientHeight
        });
      }
    };
    
    // Set initial dimensions
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  // Draw visualizations
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;
    
    const canvas = canvasRef.current;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    const ctx = canvas.getContext('2d');
    
    // Animation function
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Animation base speed affected by playing state
      const playingMultiplier = isPlaying ? 1.0 : 0.2;
      const animationIntensity = intensity * playingMultiplier;
      
      // Choose visualization type
      if (type === 'waves') {
        drawWaves(ctx, dimensions.width, dimensions.height, currentTime, animationIntensity);
      } else if (type === 'particles') {
        drawParticles(ctx, dimensions.width, dimensions.height, currentTime, animationIntensity);
      } else if (type === 'grid') {
        drawGrid(ctx, dimensions.width, dimensions.height, currentTime, animationIntensity);
      } else if (type === 'radial') {
        drawRadial(ctx, dimensions.width, dimensions.height, currentTime, animationIntensity);
      }
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, isPlaying, currentTime, type, intensity, baseColor, accentColor]);
  
  // Wave visualization
  const drawWaves = (ctx, width, height, time, intensity) => {
    // Convert hex to rgba for transparency
    const baseColorRGBA = hexToRgba(baseColor, 0.4 * intensity);
    const accentColorRGBA = hexToRgba(accentColor, 0.3 * intensity);
    
    // Time-based variables for animation
    const now = time * 2;
    
    // Draw multiple wave layers
    for (let i = 0; i < 3; i++) {
      const layerOpacity = (3 - i) / 3 * intensity;
      
      // Wave parameters
      const amplitude = height * 0.05 * (3 - i) / 3 * intensity;
      const frequency = 0.01 * (i + 1);
      const speed = now * (0.2 + i * 0.05);
      
      // Color for this layer
      const color = i % 2 === 0 ? baseColorRGBA : accentColorRGBA;
      ctx.fillStyle = color;
      
      // Draw wave
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      // Draw wave points
      for (let x = 0; x <= width; x += 5) {
        const y = height * 0.5 + 
                 amplitude * Math.sin(x * frequency + speed) +
                 amplitude * 0.5 * Math.sin(x * frequency * 2 + speed * 1.5);
        ctx.lineTo(x, y);
      }
      
      // Complete the path and fill
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    }
    
    // Add some floating particles for texture
    const particleCount = Math.floor(20 * intensity);
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(now / 10 + i) + 1) * width / 2;
      const y = height * 0.3 + (Math.cos(now / 8 + i * 2) + 1) * height * 0.3;
      const radius = 1 + Math.sin(now / 5 + i) * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? baseColorRGBA : accentColorRGBA;
      ctx.globalAlpha = 0.3 * intensity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };
  
  // Particle visualization
  const drawParticles = (ctx, width, height, time, intensity) => {
    // Time-based variables for animation
    const now = time * 3;
    
    // Particle parameters
    const particleCount = Math.floor(50 * intensity);
    const baseRadius = 2 * intensity;
    
    // Create gradient for particles
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, hexToRgba(baseColor, 0.5 * intensity));
    gradient.addColorStop(1, hexToRgba(accentColor, 0.5 * intensity));
    
    // Draw particles
    for (let i = 0; i < particleCount; i++) {
      // Use sine/cosine with different frequencies for natural movement
      const xOffset = Math.sin(now / 10 + i * 0.3) * width * 0.2;
      const yOffset = Math.cos(now / 12 + i * 0.4) * height * 0.2;
      
      // Position the particle
      const x = width * ((i % 10) / 10) + xOffset;
      const y = height * ((Math.floor(i / 10)) / 10) + yOffset;
      
      // Size variation based on time
      const size = baseRadius * (1 + Math.sin(now / 5 + i) * 0.5);
      
      // Draw with glow effect
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add glow
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      const glowGradient = ctx.createRadialGradient(x, y, size, x, y, size * 3);
      glowGradient.addColorStop(0, hexToRgba(baseColor, 0.3 * intensity));
      glowGradient.addColorStop(1, hexToRgba(baseColor, 0));
      ctx.fillStyle = glowGradient;
      ctx.fill();
      
      // Add connecting lines between some particles
      if (i > 0 && i % 3 === 0) {
        const prevI = i - 3;
        const prevXOffset = Math.sin(now / 10 + prevI * 0.3) * width * 0.2;
        const prevYOffset = Math.cos(now / 12 + prevI * 0.4) * height * 0.2;
        const prevX = width * ((prevI % 10) / 10) + prevXOffset;
        const prevY = height * ((Math.floor(prevI / 10)) / 10) + prevYOffset;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(prevX, prevY);
        ctx.strokeStyle = hexToRgba(accentColor, 0.2 * intensity);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  };
  
  // Grid visualization
  const drawGrid = (ctx, width, height, time, intensity) => {
    // Time-based animation
    const now = time * 2;
    
    // Grid parameters
    const cellSize = 40;
    const rows = Math.ceil(height / cellSize);
    const cols = Math.ceil(width / cellSize);
    
    // Draw grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculate position with slight wave effect
        const x = col * cellSize + Math.sin(now / 10 + row * 0.2) * 5 * intensity;
        const y = row * cellSize + Math.cos(now / 12 + col * 0.2) * 5 * intensity;
        
        // Determine cell size with ripple effect
        const distance = Math.sqrt(
          Math.pow((x - width/2) / width, 2) + 
          Math.pow((y - height/2) / height, 2)
        );
        
        // Size and opacity based on distance and time
        const sizeMultiplier = 0.8 + Math.sin(distance * 10 + now / 5) * 0.2 * intensity;
        const size = cellSize * 0.3 * sizeMultiplier;
        const opacity = 0.1 + Math.sin(distance * 8 + now / 4) * 0.1 * intensity;
        
        // Draw cell
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        
        // Alternate colors
        const color = (row + col) % 2 === 0 ? baseColor : accentColor;
        ctx.fillStyle = hexToRgba(color, opacity);
        ctx.fill();
      }
    }
    
    // Add pulsing highlight
    const pulseSize = width * 0.5 * (1 + Math.sin(now / 10) * 0.2 * intensity);
    const pulseX = width / 2;
    const pulseY = height / 2;
    
    const pulseGradient = ctx.createRadialGradient(
      pulseX, pulseY, 0,
      pulseX, pulseY, pulseSize
    );
    pulseGradient.addColorStop(0, hexToRgba(accentColor, 0.1 * intensity));
    pulseGradient.addColorStop(1, hexToRgba(accentColor, 0));
    
    ctx.beginPath();
    ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = pulseGradient;
    ctx.fill();
  };
  
  // Radial visualization
  const drawRadial = (ctx, width, height, time, intensity) => {
    // Constants
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    
    // Time-based animation
    const now = time * 3;
    
    // Draw background glow
    const bgGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxRadius * 1.5
    );
    bgGradient.addColorStop(0, hexToRgba(baseColor, 0.1 * intensity));
    bgGradient.addColorStop(0.6, hexToRgba(accentColor, 0.05 * intensity));
    bgGradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = bgGradient;
    ctx.fill();
    
    // Draw concentric circles
    const circleCount = 5;
    for (let i = 0; i < circleCount; i++) {
      const radius = maxRadius * ((i + 1) / circleCount);
      const thickness = 1 + Math.sin(now / 10 + i * 0.5) * 2 * intensity;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 === 0 
        ? hexToRgba(baseColor, 0.2 * intensity) 
        : hexToRgba(accentColor, 0.2 * intensity);
      ctx.lineWidth = thickness;
      ctx.stroke();
    }
    
    // Draw radiating lines
    const lineCount = 12;
    const angleStep = (Math.PI * 2) / lineCount;
    
    for (let i = 0; i < lineCount; i++) {
      const angle = i * angleStep + now / 20;
      const startRadius = maxRadius * 0.2;
      const endRadius = maxRadius * (0.8 + Math.sin(now / 15 + i * 0.5) * 0.2 * intensity);
      
      const startX = centerX + Math.cos(angle) * startRadius;
      const startY = centerY + Math.sin(angle) * startRadius;
      const endX = centerX + Math.cos(angle) * endRadius;
      const endY = centerY + Math.sin(angle) * endRadius;
      
      // Line with gradient
      const lineGradient = ctx.createLinearGradient(startX, startY, endX, endY);
      lineGradient.addColorStop(0, hexToRgba(baseColor, 0.3 * intensity));
      lineGradient.addColorStop(1, hexToRgba(accentColor, 0.1 * intensity));
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Add small circle at the end of each line
      ctx.beginPath();
      ctx.arc(endX, endY, 2 + Math.sin(now / 5 + i) * 1 * intensity, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(accentColor, 0.5 * intensity);
      ctx.fill();
    }
  };
  
  // Utility function to convert hex to rgba
  const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        opacity: isPlaying ? 1 : 0.5,
        transition: 'opacity 1s ease',
      }}
    >
      {/* Animated moving background texture */}
      <Box
        component={motion.div}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.2,
          background: `radial-gradient(circle at 30% 40%, ${hexToRgba(baseColor, 0.4)} 0%, transparent 40%),
                       radial-gradient(circle at 70% 60%, ${hexToRgba(accentColor, 0.4)} 0%, transparent 40%)`,
        }}
      />
      
      {/* Canvas for main visualization */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
        }}
      />
    </Box>
  );
};

export default BackgroundVisualizer;