import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

const MusicVisualizer = ({ color = '#ffffff', height = 60, type = 'waveform' }) => {
  const canvasRef = useRef(null);
  const { isPlaying, currentTime } = useMusicPlayer();
  const animationRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Initialize Audio API
  useEffect(() => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 256;
      
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      setDataArray(dataArray);
    } catch (error) {
      console.error("Web Audio API is not supported:", error);
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
        } catch (error) {
          console.error("Error closing audio context:", error);
        }
      }
    };
  }, []);
  
  // Connect to audio source when available
  useEffect(() => {
    const connectToSource = () => {
      if (!audioContext || !analyser) return;
      
      // Try to find the YouTube iframe
      const iframe = document.querySelector('iframe[src*="youtube"]');
      if (!iframe) {
        // If no iframe, create a mock oscillator for visualization
        if (!connected) {
          const oscillator = audioContext.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.connect(analyser);
          oscillator.start();
          setConnected(true);
        }
        return;
      }
      
      try {
        // This is a mock connection since we can't directly access YouTube audio
        // Instead we'll use animation timing to simulate audio visualization
        setConnected(true);
      } catch (error) {
        console.error("Error connecting to audio source:", error);
      }
    };
    
    if (isPlaying && !connected) {
      connectToSource();
    }
  }, [isPlaying, audioContext, analyser, connected]);
  
  // Draw visualization
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Initialize data array if needed
    if (!dataArray) {
      const tempArray = new Uint8Array(128);
      for (let i = 0; i < 128; i++) {
        tempArray[i] = 128;
      }
      setDataArray(tempArray);
      return;
    }
    
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      ctx.clearRect(0, 0, width, height);
      
      // For a sophisticated visualization, we'll generate values based on time and make it responsive to music
      const mockAnalysis = () => {
        const time = currentTime * 10; // Scale time for faster variations
        const beatModulation = Math.sin(time / 4) * 0.5 + 0.5; // Create a beat-like effect
        
        for (let i = 0; i < dataArray.length; i++) {
          // Create a complex, music-like pattern with multiple frequencies
          const frequency = i / 3;
          
          // Base amplitude modulated by the "beat"
          const baseAmplitude = 40 + 40 * beatModulation;
          
          // Create a more complex waveform with multiple harmonics
          const harmonics = 
            Math.sin(time / 8 + frequency / 2) * 0.6 +
            Math.sin(time / 4 + frequency) * 0.3 +
            Math.sin(time / 2 + frequency * 2) * 0.1;
          
          // Add some randomness for organic movement
          const noise = Math.random() * 5;
          
          // If playing, make the visualization more active
          const playingMultiplier = isPlaying ? 1.0 : 0.3;
          
          // Combine all effects
          dataArray[i] = 128 + (baseAmplitude * harmonics + noise) * playingMultiplier;
        }
      };
      
      // Generate mock data
      mockAnalysis();
      
      if (type === 'waveform') {
        drawWaveform(ctx, width, height, dataArray);
      } else if (type === 'bars') {
        drawBars(ctx, width, height, dataArray);
      } else if (type === 'circular') {
        drawCircular(ctx, width, height, dataArray);
      } else if (type === 'particles') {
        drawParticles(ctx, width, height, dataArray, currentTime);
      } else if (type === 'spectrum') {
        drawSpectrum(ctx, width, height, dataArray);
      }
    };
    
    renderFrame();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, dataArray, currentTime, type]);
  
  // Waveform visualization
  const drawWaveform = (ctx, width, height, dataArray) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    
    const sliceWidth = width / dataArray.length;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255.0;
      const y = height / 2 * (1 - v);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Add glow effect
    ctx.save();
    ctx.filter = `blur(4px)`;
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };
  
  // Bar visualization
  const drawBars = (ctx, width, height, dataArray) => {
    const barCount = Math.min(64, dataArray.length);
    const barWidth = width / barCount;
    const barGap = Math.max(1, barWidth * 0.2);
    
    for (let i = 0; i < barCount; i++) {
      const percent = dataArray[i] / 255.0;
      const barHeight = height * percent;
      
      // Create a gradient effect
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, `${color}99`);
      gradient.addColorStop(1, color);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        i * barWidth + barGap/2, 
        height - barHeight, 
        barWidth - barGap, 
        barHeight
      );
      
      // Add subtle reflection
      ctx.fillStyle = `${color}30`;
      ctx.fillRect(
        i * barWidth + barGap/2, 
        height, 
        barWidth - barGap, 
        Math.min(10, barHeight * 0.2)
      );
    }
  };
  
  // Circular visualization
  const drawCircular = (ctx, width, height, dataArray) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Draw background circle with gradient
    const bgGradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.1,
      centerX, centerY, radius * 0.4
    );
    bgGradient.addColorStop(0, `${color}33`);
    bgGradient.addColorStop(1, `${color}05`);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = bgGradient;
    ctx.fill();
    
    const segments = Math.min(64, dataArray.length);
    const angleStep = (2 * Math.PI) / segments;
    
    // Draw outer lines
    for (let i = 0; i < segments; i++) {
      const percent = dataArray[i] / 255.0;
      const segmentLength = radius * 0.6 * percent;
      
      const angle = i * angleStep;
      const startX = centerX + Math.cos(angle) * radius * 0.4;
      const startY = centerY + Math.sin(angle) * radius * 0.4;
      const endX = centerX + Math.cos(angle) * (radius * 0.4 + segmentLength);
      const endY = centerY + Math.sin(angle) * (radius * 0.4 + segmentLength);
      
      // Line with gradient
      const lineGradient = ctx.createLinearGradient(startX, startY, endX, endY);
      lineGradient.addColorStop(0, `${color}99`);
      lineGradient.addColorStop(1, color);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineWidth = 2;
      ctx.strokeStyle = lineGradient;
      ctx.stroke();
      
      // Add a small circle at the end of each line
      ctx.beginPath();
      ctx.arc(endX, endY, 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
    
    // Add subtle glow
    ctx.save();
    ctx.filter = 'blur(8px)';
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };
  
  // Particle visualization
  const drawParticles = (ctx, width, height, dataArray, time) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const particleCount = Math.min(40, dataArray.length);
    
    const baseRadius = Math.min(width, height) * 0.3;
    
    // Draw background glow
    ctx.save();
    ctx.filter = 'blur(20px)';
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    
    // Draw particles
    for (let i = 0; i < particleCount; i++) {
      const freq = i / particleCount;
      const amplitude = dataArray[i] / 255.0;
      
      // Calculate particle properties based on time and data
      const angle = (time / 1000 + freq * 10) % (2 * Math.PI);
      const distance = baseRadius * (0.2 + amplitude * 0.8);
      const size = 1 + amplitude * 6;
      
      // Calculate position with some randomness
      const x = centerX + Math.cos(angle) * distance + (Math.random() - 0.5) * 5;
      const y = centerY + Math.sin(angle) * distance + (Math.random() - 0.5) * 5;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      
      // Create gradient fill for each particle
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, `${color}00`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Draw connecting lines between some particles
      if (i > 0 && i % 3 === 0) {
        const prevAngle = (time / 1000 + (i - 3) / particleCount * 10) % (2 * Math.PI);
        const prevDist = baseRadius * (0.2 + (dataArray[i - 3] / 255.0) * 0.8);
        const prevX = centerX + Math.cos(prevAngle) * prevDist;
        const prevY = centerY + Math.sin(prevAngle) * prevDist;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(prevX, prevY);
        ctx.strokeStyle = `${color}40`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  };
  
  // Spectrum visualization
  const drawSpectrum = (ctx, width, height, dataArray) => {
    // Create a smooth curve through the data points
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    const points = [];
    const pointCount = Math.min(20, dataArray.length / 4);
    
    // Get a subset of points from the data array
    for (let i = 0; i < pointCount; i++) {
      const index = Math.floor(i * (dataArray.length / pointCount));
      const x = (i / (pointCount - 1)) * width;
      const y = height - (dataArray[index] / 255.0) * height;
      points.push({ x, y });
    }
    
    // Ensure the curve starts and ends at the bottom
    points.unshift({ x: 0, y: height });
    points.push({ x: width, y: height });
    
    // Draw a smooth curve through the points
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    // Fill the area under the curve
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add a subtle stroke on top
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Add glow effect
    ctx.save();
    ctx.filter = 'blur(10px)';
    ctx.globalAlpha = 0.2;
    ctx.stroke();
    ctx.restore();
  };
  
  return (
    <Box sx={{ width: '100%', height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={height}
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: isPlaying ? 1 : 0.3,
          transition: 'opacity 0.5s ease'
        }}
      />
    </Box>
  );
};

export default MusicVisualizer;