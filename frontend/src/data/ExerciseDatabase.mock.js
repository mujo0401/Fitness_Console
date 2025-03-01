// Exercise database with details on muscle groups, intensity, and calories burned
export const ExerciseDatabase = [
  // Cardio Exercises
  {
    id: 1,
    name: "Running",
    type: "cardio",
    targetMuscleGroups: ["legs", "cardio"],
    intensity: 8,
    duration: 30,
    caloriesBurned: 320
  },
  {
    id: 3,
    name: "Swimming",
    type: "cardio",
    targetMuscleGroups: ["arms", "shoulders", "back", "legs", "core", "cardio"],
    intensity: 6,
    duration: 30,
    caloriesBurned: 250
  },
  
  // Upper Body Exercises
  {
    id: 6,
    name: "Push-ups",
    type: "strength",
    targetMuscleGroups: ["chest", "shoulders", "arms", "core"],
    intensity: 5,
    duration: 10,
    caloriesBurned: 60
  },
  {
    id: 7,
    name: "Bench Press",
    type: "strength",
    targetMuscleGroups: ["chest", "shoulders", "arms"],
    intensity: 7,
    duration: 15,
    caloriesBurned: 120
  },
  {
    id: 10,
    name: "Bicep Curls",
    type: "strength",
    targetMuscleGroups: ["arms"],
    intensity: 4,
    duration: 12,
    caloriesBurned: 60
  },
  
  // Lower Body Exercises
  {
    id: 11,
    name: "Squats",
    type: "strength",
    targetMuscleGroups: ["legs", "core"],
    intensity: 7,
    duration: 15,
    caloriesBurned: 120
  },
  {
    id: 13,
    name: "Lunges",
    type: "strength",
    targetMuscleGroups: ["legs"],
    intensity: 6,
    duration: 12,
    caloriesBurned: 90
  },
  
  // Core Exercises
  {
    id: 16,
    name: "Planks",
    type: "core",
    targetMuscleGroups: ["core"],
    intensity: 5,
    duration: 5,
    caloriesBurned: 35
  },
  {
    id: 17,
    name: "Crunches",
    type: "core",
    targetMuscleGroups: ["core"],
    intensity: 4,
    duration: 10,
    caloriesBurned: 50
  },
  
  // Full Body Workouts
  {
    id: 26,
    name: "HIIT",
    type: "mixed",
    targetMuscleGroups: ["legs", "arms", "core", "cardio"],
    intensity: 9,
    duration: 20,
    caloriesBurned: 280
  }
];
