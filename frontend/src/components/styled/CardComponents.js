import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { Card, Paper, Typography } from '@mui/material';

// Styled Card Components

// Glass-like card with hover effect
export const GlassCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: alpha(theme.palette[color].main, 0.08),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette[color].main, 0.08)}`,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: `0 12px 48px ${alpha(theme.palette[color].main, 0.12)}`,
    transform: 'translateY(-4px)',
  }
}));

// Card with gradient background
export const GradientCard = styled(Card)(({ theme, startColor, endColor }) => ({
  background: `linear-gradient(135deg, ${startColor || theme.palette.primary.light} 0%, ${endColor || theme.palette.primary.dark} 100%)`,
  borderRadius: theme.spacing(3),
  boxShadow: `0 8px 32px ${alpha(startColor || theme.palette.primary.main, 0.2)}`,
  color: '#fff',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: `0 12px 48px ${alpha(startColor || theme.palette.primary.main, 0.3)}`,
    transform: 'translateY(-4px)',
  }
}));

// Neumorphic style card
export const NeuCard = styled(Card)(({ theme, color = 'default' }) => ({
  backgroundColor: color === 'default' ? theme.palette.background.paper : theme.palette[color].light,
  borderRadius: theme.spacing(3),
  boxShadow: color === 'default'
    ? '9px 9px 18px #d1d1d1, -9px -9px 18px #ffffff'
    : `9px 9px 18px ${alpha(theme.palette[color].main, 0.2)}, -9px -9px 18px ${alpha('#ffffff', 0.8)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  }
}));

// Feature highlight card
export const FeatureCard = styled(Paper)(({ theme, color = 'primary', gradient }) => ({
  borderRadius: theme.spacing(2.5),
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  background: gradient || `linear-gradient(135deg, ${alpha(theme.palette[color].light, 0.9)} 0%, ${alpha(theme.palette[color].main, 0.9)} 100%)`,
  color: theme.palette.getContrastText(theme.palette[color].main),
  boxShadow: `0 10px 40px ${alpha(theme.palette[color].main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 15px 50px ${alpha(theme.palette[color].main, 0.4)}`,
  }
}));

// Card with hover glow effect
export const HoverGlowCard = styled(Paper)(({ theme, color = 'primary', glowColor }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: alpha(theme.palette[color].light, 0.05),
  border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 0 20px ${glowColor || alpha(theme.palette[color].main, 0.5)}`,
    borderColor: alpha(theme.palette[color].main, 0.3),
  }
}));

// Animated pulse effect component
export const AnimatedPulse = styled('div')(({ theme, color = 'primary', size = 40, speed = 1.5 }) => ({
  position: 'relative',
  width: size,
  height: size,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette[color].main, 0.4),
    width: '100%',
    height: '100%',
    animation: `pulse ${speed}s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite`,
  },
  '&::after': {
    animationDelay: `${speed * 0.5}s`,
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.5)',
      opacity: 0,
    },
    '50%': {
      opacity: 0.5,
    },
    '100%': {
      transform: 'scale(1.8)',
      opacity: 0,
    },
  },
}));

// Animated gradient text
export const AnimatedGradientText = styled(Typography)(({ theme, gradient }) => ({
  backgroundImage: gradient || 'linear-gradient(90deg, #3f51b5, #2196f3, #00bcd4, #2196f3, #3f51b5)',
  backgroundSize: '200% auto',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'gradientText 8s linear infinite',
  display: 'inline-block',
  '@keyframes gradientText': {
    to: {
      backgroundPosition: '200% center',
    },
  },
}));