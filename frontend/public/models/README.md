# 3D Models for Exercise Coach

This directory contains 3D models used in the Exercise Coach feature of the Fitness Console application.

## Model Requirements

- Format: GLB (Binary GL Transmission Format)
- Animations: Each model should include animations for common exercises:
  - squat
  - pushup
  - plank
  - lunge
  - burpee

## Adding Models

1. Place GLB model files in this directory
2. Models should be named descriptively, for example:
   - fitness_coach.glb
   - male_avatar.glb
   - female_avatar.glb

## Models to Download

Please download the following free 3D models to enable the Exercise Coach feature:

1. **Fitness Coach**: https://sketchfab.com/3d-models/fitness-coach-f5e58965c9574a9eb9a69488b6f8e5f4
2. **Male Avatar**: https://sketchfab.com/3d-models/male-character-base-mesh-486a95596bdd4e35a9cdf7c94ba8bd46
3. **Female Avatar**: https://sketchfab.com/3d-models/female-character-base-mesh-cc675ae9a2b7435c94c0f8f4b89b1c9e

After downloading, convert to GLB format if necessary using Blender or other 3D modeling software.

## Notes

- The application automatically loads models from this directory
- Models should be optimized for web use (reduced polygon count, texture sizes, etc.)
- Make sure animations are properly rigged and named for the application to identify them correctly