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
    if (!canvasRef.current || !dataArray || !isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      ctx.clearRect(0, 0, width, height);
      
      // For a mock visualization, we'll generate values based on time
      const mockAnalysis = () => {
        const time = currentTime * 10; // Scale time for faster variations
        for (let i = 0; i < dataArray.length; i++) {
          // Create a somewhat random but time-dependent pattern
          const frequency = i / 5;
          const amplitude = 50 + 30 * Math.sin(time / 30);
          dataArray[i] = 
            128 + amplitude * Math.sin(time / 10 + frequency) * 
            Math.sin(time / 20) * Math.cos(time / 15 + frequency / 2);
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
    }
  };
  
  // Circular visualization
  const drawCircular = (ctx, width, height, dataArray) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}33`;
    ctx.fill();
    
    const segments = Math.min(64, dataArray.length);
    const angleStep = (2 * Math.PI) / segments;
    
    for (let i = 0; i < segments; i++) {
      const percent = dataArray[i] / 255.0;
      const segmentLength = radius * 0.7 * percent;
      
      const angle = i * angleStep;
      const startX = centerX + Math.cos(angle) * radius * 0.3;
      const startY = centerY + Math.sin(angle) * radius * 0.3;
      const endX = centerX + Math.cos(angle) * (radius * 0.3 + segmentLength);
      const endY = centerY + Math.sin(angle) * (radius * 0.3 + segmentLength);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
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