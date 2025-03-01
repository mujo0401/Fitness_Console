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
    caloriesBurned: 320,
    description: "High-impact cardio exercise that primarily works the legs and cardiovascular system"
  },
  {
    id: 2,
    name: "Cycling",
    type: "cardio",
    targetMuscleGroups: ["legs", "cardio"],
    intensity: 6,
    duration: 45,
    caloriesBurned: 300,
    description: "Low-impact cardio exercise that primarily targets the lower body"
  },
  {
    id: 3,
    name: "Swimming",
    type: "cardio",
    targetMuscleGroups: ["arms", "shoulders", "back", "legs", "core", "cardio"],
    intensity: 6,
    duration: 30,
    caloriesBurned: 250,
    description: "Full-body cardio exercise that works all major muscle groups"
  },
  {
    id: 4,
    name: "Jump Rope",
    type: "cardio",
    targetMuscleGroups: ["legs", "cardio"],
    intensity: 8,
    duration: 15,
    caloriesBurned: 200,
    description: "High-intensity cardio that improves coordination and burns calories efficiently"
  },
  {
    id: 5,
    name: "Rowing",
    type: "cardio",
    targetMuscleGroups: ["back", "arms", "legs", "core", "cardio"],
    intensity: 7,
    duration: 20,
    caloriesBurned: 280,
    description: "Full-body cardio exercise that particularly targets the back and arms"
  },
  
  // Upper Body Exercises
  {
    id: 6,
    name: "Push-ups",
    type: "strength",
    targetMuscleGroups: ["chest", "shoulders", "arms", "core"],
    intensity: 5,
    duration: 10,
    caloriesBurned: 60,
    description: "Bodyweight exercise that targets the chest, shoulders, and triceps"
  },
  {
    id: 7,
    name: "Bench Press",
    type: "strength",
    targetMuscleGroups: ["chest", "shoulders", "arms"],
    intensity: 7,
    duration: 15,
    caloriesBurned: 120,
    description: "Strength exercise that primarily targets the chest muscles"
  },
  {
    id: 8,
    name: "Pull-ups",
    type: "strength",
    targetMuscleGroups: ["back", "arms", "shoulders"],
    intensity: 8,
    duration: 10,
    caloriesBurned: 90,
    description: "Challenging bodyweight exercise that works the back and biceps"
  },
  {
    id: 9,
    name: "Shoulder Press",
    type: "strength",
    targetMuscleGroups: ["shoulders", "arms"],
    intensity: 6,
    duration: 15,
    caloriesBurned: 100,
    description: "Strength exercise targeting the deltoid muscles"
  },
  {
    id: 10,
    name: "Bicep Curls",
    type: "strength",
    targetMuscleGroups: ["arms"],
    intensity: 4,
    duration: 12,
    caloriesBurned: 60,
    description: "Isolation exercise specifically targeting the bicep muscles"
  },
  
  // Lower Body Exercises
  {
    id: 11,
    name: "Squats",
    type: "strength",
    targetMuscleGroups: ["legs", "core"],
    intensity: 7,
    duration: 15,
    caloriesBurned: 120,
    description: "Compound lower body exercise that primarily targets the quadriceps and glutes"
  },
  {
    id: 12,
    name: "Deadlifts",
    type: "strength",
    targetMuscleGroups: ["back", "legs", "core"],
    intensity: 9,
    duration: 15,
    caloriesBurned: 150,
    description: "Powerful compound exercise that works the posterior chain"
  },
  {
    id: 13,
    name: "Lunges",
    type: "strength",
    targetMuscleGroups: ["legs"],
    intensity: 6,
    duration: 12,
    caloriesBurned: 90,
    description: "Unilateral exercise that targets the quadriceps, hamstrings, and glutes"
  },
  {
    id: 14,
    name: "Leg Press",
    type: "strength",
    targetMuscleGroups: ["legs"],
    intensity: 7,
    duration: 15,
    caloriesBurned: 100,
    description: "Machine-based exercise that primarily works the quadriceps"
  },
  {
    id: 15,
    name: "Calf Raises",
    type: "strength",
    targetMuscleGroups: ["legs"],
    intensity: 4,
    duration: 10,
    caloriesBurned: 50,
    description: "Isolation exercise targeting the calf muscles"
  },
  
  // Core Exercises
  {
    id: 16,
    name: "Planks",
    type: "core",
    targetMuscleGroups: ["core"],
    intensity: 5,
    duration: 5,
    caloriesBurned: 35,
    description: "Isometric core exercise that builds abdominal endurance and stability"
  },
  {
    id: 17,
    name: "Crunches",
    type: "core",
    targetMuscleGroups: ["core"],
    intensity: 4,
    duration: 10,
    caloriesBurned: 50,
    description: "Classic abdominal exercise targeting the rectus abdominis"
  },
  {
    id: 18,
    name: "Russian Twists",
    type: "core",
    targetMuscleGroups: ["core"],
    intensity: 5,
    duration: 8,
    caloriesBurned: 55,
    description: "Rotational core exercise that works the obliques"
  },
  {
    id: 19,
    name: "Leg Raises",
    type: "core",
    targetMuscleGroups: ["core"],
    intensity: 6,
    duration: 8,
    caloriesBurned: 60,
    description: "Lower abdominal exercise that also engages the hip flexors"
  },
  {
    id: 20,
    name: "Mountain Climbers",
    type: "core",
    targetMuscleGroups: ["core", "cardio"],
    intensity: 7,
    duration: 5,
    caloriesBurned: 50,
    description: "Dynamic core exercise that also provides cardiovascular benefits"
  },
  
  // Flexibility & Recovery
  {
    id: 21,
    name: "Yoga",
    type: "flexibility",
    targetMuscleGroups: ["core", "back", "legs", "arms", "shoulders"],
    intensity: 3,
    duration: 60,
    caloriesBurned: 180,
    description: "Mind-body practice that improves flexibility, strength, and mental well-being"
  },
  {
    id: 22,
    name: "Pilates",
    type: "flexibility",
    targetMuscleGroups: ["core", "back", "legs"],
    intensity: 4,
    duration: 45,
    caloriesBurned: 170,
    description: "Low-impact exercise method focusing on core strength and precise movements"
  },
  {
    id: 23,
    name: "Stretching",
    type: "flexibility",
    targetMuscleGroups: ["back", "legs", "arms", "shoulders"],
    intensity: 2,
    duration: 20,
    caloriesBurned: 40,
    description: "Improves flexibility and range of motion while reducing injury risk"
  },
  {
    id: 24,
    name: "Foam Rolling",
    type: "recovery",
    targetMuscleGroups: ["back", "legs", "arms", "shoulders"],
    intensity: 2,
    duration: 15,
    caloriesBurned: 30,
    description: "Self-myofascial release technique that helps with recovery and mobility"
  },
  
  // Full Body Workouts
  {
    id: 25,
    name: "Circuit Training",
    type: "mixed",
    targetMuscleGroups: ["arms", "legs", "core", "chest", "back", "shoulders", "cardio"],
    intensity: 8,
    duration: 30,
    caloriesBurned: 300,
    description: "Fast-paced workout combining strength and cardio exercises with minimal rest"
  },
  {
    id: 26,
    name: "HIIT",
    type: "mixed",
    targetMuscleGroups: ["legs", "arms", "core", "cardio"],
    intensity: 9,
    duration: 20,
    caloriesBurned: 280,
    description: "High-intensity interval training alternating between intense bursts and rest periods"
  },
  {
    id: 27,
    name: "CrossFit WOD",
    type: "mixed",
    targetMuscleGroups: ["legs", "arms", "core", "back", "chest", "shoulders", "cardio"],
    intensity: 10,
    duration: 20,
    caloriesBurned: 300,
    description: "High-intensity functional training combining weightlifting, gymnastics, and cardio"
  },
  {
    id: 28,
    name: "Kettlebell Workout",
    type: "mixed",
    targetMuscleGroups: ["legs", "arms", "core", "back", "shoulders"],
    intensity: 7,
    duration: 25,
    caloriesBurned: 250,
    description: "Full-body workout using kettlebells to build strength, power, and endurance"
  },
  {
    id: 29,
    name: "Burpees",
    type: "mixed",
    targetMuscleGroups: ["legs", "arms", "chest", "core", "cardio"],
    intensity: 9,
    duration: 10,
    caloriesBurned: 120,
    description: "Full-body exercise combining a squat, push-up, and jump into one movement"
  },
  {
    id: 30,
    name: "Boxing",
    type: "mixed",
    targetMuscleGroups: ["arms", "shoulders", "core", "legs", "cardio"],
    intensity: 8,
    duration: 45,
    caloriesBurned: 350,
    description: "High-energy workout combining punching combinations with footwork and conditioning"
  }
];