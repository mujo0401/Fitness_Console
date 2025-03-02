import React, { createContext, useContext, useState, useEffect } from 'react';

// Predefined workout plans for different fitness levels
export const WORKOUT_PLANS = {
  beginner: {
    name: "Beginner's Fitness Program",
    description: "A gentle introduction to fitness for those new to regular exercise.",
    workouts: [
      {
        day: "Monday",
        name: "Beginner Cardio & Core",
        type: "cardio",
        exercises: [
          { name: "Walking", duration: "15 min", intensity: "moderate" },
          { name: "Bodyweight Squats", sets: 2, reps: 10 },
          { name: "Modified Push-ups", sets: 2, reps: 5 },
          { name: "Plank", sets: 2, duration: "15 sec" },
          { name: "Bicycle Crunches", sets: 2, reps: 10 }
        ],
        heartRateTarget: 60, // % of max heart rate
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          main: { duration: 15, zone: "Fat Burn" },
          cooldown: { duration: 5, zone: "Rest" }
        },
        tips: [
          "Focus on proper form rather than speed",
          "Take breaks as needed",
          "Stay hydrated throughout your workout",
          "Breathe deeply with each movement"
        ]
      },
      {
        day: "Tuesday",
        name: "Active Recovery",
        type: "recovery",
        exercises: [
          { name: "Light Walking", duration: "10 min", intensity: "light" },
          { name: "Gentle Stretching", duration: "10 min" }
        ],
        heartRateTarget: 50,
        structured: {
          warmup: { duration: 2, zone: "Rest" },
          main: { duration: 16, zone: "Rest" },
          cooldown: { duration: 2, zone: "Rest" }
        },
        tips: [
          "Move slowly and gently",
          "Focus on releasing tension",
          "Listen to your body and avoid strain",
          "Deep breathing helps reduce stress"
        ]
      },
      {
        day: "Wednesday",
        name: "Beginner Strength",
        type: "strength",
        exercises: [
          { name: "Bodyweight Squats", sets: 2, reps: 12 },
          { name: "Wall Push-ups", sets: 2, reps: 8 },
          { name: "Standing Calf Raises", sets: 2, reps: 12 },
          { name: "Seated Dumbbell Curls", sets: 2, reps: 8, weight: "light" },
          { name: "Bird Dogs", sets: 2, reps: 8 }
        ],
        heartRateTarget: 65,
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          main: { duration: 20, zone: "Fat Burn" },
          cooldown: { duration: 5, zone: "Rest" }
        },
        tips: [
          "Use very light weights to start",
          "Perfect your form before adding weight",
          "Rest 60-90 seconds between sets",
          "Don't rush through repetitions"
        ]
      },
      {
        day: "Thursday",
        name: "Active Recovery",
        type: "recovery",
        exercises: [
          { name: "Light Walking", duration: "10 min", intensity: "light" },
          { name: "Gentle Stretching", duration: "10 min" }
        ],
        heartRateTarget: 50,
        structured: {
          warmup: { duration: 2, zone: "Rest" },
          main: { duration: 16, zone: "Rest" },
          cooldown: { duration: 2, zone: "Rest" }
        },
        tips: [
          "Focus on deep relaxation",
          "Stretch any tight muscles from yesterday",
          "Take your time with each stretch",
          "Maintain good posture while walking"
        ]
      },
      {
        day: "Friday",
        name: "Beginner Cardio & Mobility",
        type: "cardio",
        exercises: [
          { name: "Walking with Short Jog Intervals", duration: "15 min", intensity: "moderate" },
          { name: "Leg Swings", sets: 2, reps: 10 },
          { name: "Arm Circles", sets: 2, reps: 10 },
          { name: "Seated Twists", sets: 2, reps: 10 },
          { name: "Cat-Cow Stretch", sets: 2, reps: 8 }
        ],
        heartRateTarget: 65,
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          main: { duration: 15, zone: "Fat Burn" },
          cooldown: { duration: 5, zone: "Rest" }
        },
        tips: [
          "Move at a comfortable pace",
          "Jog only as long as comfortable",
          "Focus on increasing range of motion",
          "Keep movements controlled"
        ]
      },
      {
        day: "Saturday",
        name: "Beginner Flexibility & Balance",
        type: "flexibility",
        exercises: [
          { name: "Hamstring Stretch", duration: "30 sec", sets: 2 },
          { name: "Quad Stretch", duration: "30 sec", sets: 2 },
          { name: "Standing Calf Stretch", duration: "30 sec", sets: 2 },
          { name: "One-Leg Balance", duration: "20 sec", sets: 2 },
          { name: "Seated Spinal Twist", duration: "30 sec", sets: 2 }
        ],
        heartRateTarget: 50,
        structured: {
          warmup: { duration: 5, zone: "Rest" },
          main: { duration: 20, zone: "Rest" },
          cooldown: { duration: 5, zone: "Rest" }
        },
        tips: [
          "Hold each stretch to the point of tension, not pain",
          "Breathe deeply during stretches",
          "Use a wall or chair for balance if needed",
          "Focus on mind-muscle connection"
        ]
      },
      {
        day: "Sunday",
        name: "Rest Day",
        type: "rest",
        exercises: [
          { name: "Complete Rest", description: "Focus on recovery" }
        ],
        heartRateTarget: 40,
        structured: {
          main: { duration: 0, zone: "Rest" }
        },
        tips: [
          "Use this day for complete recovery",
          "Stay hydrated",
          "Get adequate sleep",
          "Gentle walking is fine if desired"
        ]
      }
    ]
  },
  intermediate: {
    name: "Intermediate Fitness Program",
    description: "For those with some exercise experience looking to progress.",
    workouts: [
      {
        day: "Monday",
        name: "Intermediate Strength - Lower Body",
        type: "strength",
        exercises: [
          { name: "Goblet Squats", sets: 3, reps: 12, weight: "moderate" },
          { name: "Romanian Deadlifts", sets: 3, reps: 10, weight: "moderate" },
          { name: "Reverse Lunges", sets: 3, reps: 10, perSide: true },
          { name: "Calf Raises", sets: 3, reps: 15 },
          { name: "Plank", sets: 3, duration: "40 sec" }
        ],
        heartRateTarget: 70,
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          main: { duration: 30, zone: "Cardio" },
          cooldown: { duration: 5, zone: "Fat Burn" }
        },
        tips: [
          "Maintain proper form throughout",
          "Choose weights that challenge you by the last few reps",
          "Focus on control rather than speed",
          "Breathe out during exertion"
        ]
      },
      {
        day: "Tuesday",
        name: "Intermediate Cardio",
        type: "cardio",
        exercises: [
          { name: "Jogging/Running", duration: "25 min", intensity: "moderate-high" },
          { name: "Jumping Jacks", sets: 3, reps: 20 },
          { name: "Mountain Climbers", sets: 3, reps: 20 },
          { name: "High Knees", sets: 3, duration: "30 sec" }
        ],
        heartRateTarget: 75,
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          main: { duration: 25, zone: "Cardio" },
          cooldown: { duration: 5, zone: "Fat Burn" }
        },
        tips: [
          "Pace yourself for sustained effort",
          "Focus on consistent breathing",
          "Push through challenging moments",
          "Maintain good running form"
        ]
      },
      {
        day: "Wednesday",
        name: "Intermediate Strength - Upper Body",
        type: "strength",
        exercises: [
          { name: "Push-ups", sets: 3, reps: 12 },
          { name: "Dumbbell Rows", sets: 3, reps: 12, weight: "moderate" },
          { name: "Overhead Press", sets: 3, reps: 10, weight: "moderate" },
          { name: "Bicep Curls", sets: 3, reps: 12, weight: "moderate" },
          { name: "Tricep Dips", sets: 3, reps: 12 }
        ],
        heartRateTarget: 70,
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          main: { duration: 30, zone: "Cardio" },
          cooldown: { duration: 5, zone: "Fat Burn" }
        },
        tips: [
          "Keep core engaged throughout all exercises",
          "Full range of motion is better than more reps",
          "Balance pushing and pulling movements",
          "Adjust weight if form starts to break down"
        ]
      },
      {
        day: "Thursday",
        name: "HIIT Training",
        type: "hiit",
        exercises: [
          { name: "Warm-up", duration: "5 min", intensity: "light" },
          { name: "Burpees", duration: "30 sec", rest: "30 sec", sets: 4 },
          { name: "Mountain Climbers", duration: "30 sec", rest: "30 sec", sets: 4 },
          { name: "Squat Jumps", duration: "30 sec", rest: "30 sec", sets: 4 },
          { name: "Plank to Push-up", duration: "30 sec", rest: "30 sec", sets: 4 },
          { name: "Cool-down", duration: "5 min", intensity: "light" }
        ],
        heartRateTarget: 85,
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          intervals: { 
            high: "Peak", 
            low: "Fat Burn", 
            highDuration: 0.5, 
            lowDuration: 0.5, 
            sets: 16
          },
          cooldown: { duration: 5, zone: "Fat Burn" }
        },
        tips: [
          "Maximum effort during work intervals",
          "Complete recovery during rest periods",
          "Modify exercises if needed, but maintain intensity",
          "Focus on quality movements even when tired"
        ]
      },
      {
        day: "Friday",
        name: "Intermediate Strength - Full Body",
        type: "strength",
        exercises: [
          { name: "Dumbbell Squats", sets: 3, reps: 12, weight: "moderate" },
          { name: "Bent-Over Rows", sets: 3, reps: 12, weight: "moderate" },
          { name: "Dumbbell Chest Press", sets: 3, reps: 12, weight: "moderate" },
          { name: "Lunges", sets: 3, reps: 10, perSide: true },
          { name: "Plank Variations", sets: 3, duration: "45 sec" }
        ],
        heartRateTarget: 70,
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          main: { duration: 30, zone: "Cardio" },
          cooldown: { duration: 5, zone: "Fat Burn" }
        },
        tips: [
          "Alternate between upper and lower body exercises",
          "Keep rest periods consistent (60-90 seconds)",
          "Focus on muscle contraction during each rep",
          "Increase weight gradually as you progress"
        ]
      },
      {
        day: "Saturday",
        name: "Endurance & Mobility",
        type: "cardio",
        exercises: [
          { name: "Light Jog/Brisk Walk", duration: "30 min", intensity: "moderate" },
          { name: "Dynamic Stretching", duration: "15 min" },
          { name: "Foam Rolling", duration: "10 min" }
        ],
        heartRateTarget: 65,
        structured: {
          warmup: { duration: 5, zone: "Fat Burn" },
          main: { duration: 35, zone: "Fat Burn" },
          cooldown: { duration: 10, zone: "Rest" }
        },
        tips: [
          "Maintain a conversational pace",
          "Focus on proper running/walking technique",
          "Pay attention to areas of tightness during stretching",
          "Use foam roller on tight muscles"
        ]
      },
      {
        day: "Sunday",
        name: "Active Recovery",
        type: "recovery",
        exercises: [
          { name: "Light Walking", duration: "20 min", intensity: "light" },
          { name: "Gentle Yoga", duration: "20 min" }
        ],
        heartRateTarget: 50,
        structured: {
          warmup: { duration: 5, zone: "Rest" },
          main: { duration: 30, zone: "Rest" },
          cooldown: { duration: 5, zone: "Rest" }
        },
        tips: [
          "Keep intensity very low",
          "Focus on releasing tension",
          "Use this time to mentally prepare for next week",
          "Gentle movement promotes recovery"
        ]
      }
    ]
  },
  advanced: {
    name: "Advanced Fitness Program",
    description: "For experienced fitness enthusiasts looking for a challenge.",
    workouts: [
      {
        day: "Monday",
        name: "Advanced Strength - Lower Body",
        type: "strength",
        exercises: [
          { name: "Barbell Squats", sets: 4, reps: 10, weight: "heavy" },
          { name: "Deadlifts", sets: 4, reps: 8, weight: "heavy" },
          { name: "Walking Lunges", sets: 3, reps: 12, perSide: true, weight: "moderate" },
          { name: "Bulgarian Split Squats", sets: 3, reps: 10, perSide: true, weight: "moderate" },
          { name: "Weighted Calf Raises", sets: 3, reps: 15, weight: "moderate" },
          { name: "Hanging Leg Raises", sets: 3, reps: 12 }
        ],
        heartRateTarget: 75,
        structured: {
          warmup: { duration: 7, zone: "Fat Burn" },
          main: { duration: 40, zone: "Cardio" },
          cooldown: { duration: 8, zone: "Fat Burn" }
        },
        tips: [
          "Focus on proper form with heavier weights",
          "Brace core throughout all lifts",
          "Use a spotter for challenging sets",
          "Control the eccentric (lowering) portion of each lift"
        ]
      },
      {
        day: "Tuesday",
        name: "Advanced HIIT",
        type: "hiit",
        exercises: [
          { name: "Dynamic Warm-up", duration: "7 min" },
          { name: "Sprint Intervals", description: "30 sec sprint, 30 sec rest", sets: 8 },
          { name: "Kettlebell Swings", duration: "40 sec", rest: "20 sec", sets: 5 },
          { name: "Box Jumps", duration: "40 sec", rest: "20 sec", sets: 5 },
          { name: "Battle Ropes", duration: "40 sec", rest: "20 sec", sets: 5 },
          { name: "Cool-down", duration: "5 min" }
        ],
        heartRateTarget: 90,
        structured: {
          warmup: { duration: 7, zone: "Fat Burn" },
          intervals: { 
            high: "Peak", 
            low: "Fat Burn", 
            highDuration: 0.67, 
            lowDuration: 0.33, 
            sets: 23
          },
          cooldown: { duration: 5, zone: "Fat Burn" }
        },
        tips: [
          "Push to maximum intensity during work periods",
          "Maintain proper form even at high intensity",
          "Adjust work/rest ratios as needed",
          "Track heart rate recovery between intervals"
        ]
      },
      {
        day: "Wednesday",
        name: "Advanced Strength - Upper Body Push",
        type: "strength",
        exercises: [
          { name: "Bench Press", sets: 4, reps: 8, weight: "heavy" },
          { name: "Overhead Press", sets: 4, reps: 8, weight: "heavy" },
          { name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: "moderate" },
          { name: "Dips", sets: 3, reps: 12 },
          { name: "Lateral Raises", sets: 3, reps: 12, weight: "light" },
          { name: "Tricep Extensions", sets: 3, reps: 12, weight: "moderate" }
        ],
        heartRateTarget: 75,
        structured: {
          warmup: { duration: 7, zone: "Fat Burn" },
          main: { duration: 40, zone: "Cardio" },
          cooldown: { duration: 8, zone: "Fat Burn" }
        },
        tips: [
          "Focus on full range of motion",
          "Progressive overload by adding weight or reps",
          "Maintain tension throughout each rep",
          "Control breathing - exhale during exertion"
        ]
      },
      {
        day: "Thursday",
        name: "Advanced Cardio - Interval Running",
        type: "cardio",
        exercises: [
          { name: "Warm-up Jog", duration: "7 min", intensity: "light" },
          { name: "Tempo Run", duration: "10 min", intensity: "moderate-high" },
          { name: "Hill Sprints", description: "30 sec sprint, 90 sec recovery", sets: 8 },
          { name: "Cool-down Jog", duration: "5 min", intensity: "light" }
        ],
        heartRateTarget: 85,
        structured: {
          warmup: { duration: 7, zone: "Fat Burn" },
          main: { duration: 10, zone: "Cardio" },
          intervals: {
            high: "Peak",
            low: "Cardio",
            highDuration: 0.5,
            lowDuration: 1.5,
            sets: 8
          },
          cooldown: { duration: 5, zone: "Fat Burn" }
        },
        tips: [
          "Maintain proper running form even when fatigued",
          "Focus on powerful hill sprints with good technique",
          "Pay attention to foot strike and posture",
          "Control breathing rhythm throughout"
        ]
      },
      {
        day: "Friday",
        name: "Advanced Strength - Upper Body Pull",
        type: "strength",
        exercises: [
          { name: "Pull-ups", sets: 4, reps: "max (8-12 target)" },
          { name: "Barbell Rows", sets: 4, reps: 10, weight: "heavy" },
          { name: "Lat Pulldowns", sets: 3, reps: 12, weight: "moderate" },
          { name: "Face Pulls", sets: 3, reps: 15, weight: "light" },
          { name: "Bicep Curls", sets: 3, reps: 12, weight: "moderate" },
          { name: "Reverse Flyes", sets: 3, reps: 12, weight: "light" }
        ],
        heartRateTarget: 75,
        structured: {
          warmup: { duration: 7, zone: "Fat Burn" },
          main: { duration: 40, zone: "Cardio" },
          cooldown: { duration: 8, zone: "Fat Burn" }
        },
        tips: [
          "Focus on shoulder blade retraction during pulls",
          "Vary grip width for different muscle activation",
          "Maintain strict form - no swinging or momentum",
          "Control the eccentric (lowering) portion"
        ]
      },
      {
        day: "Saturday",
        name: "Advanced Athletic Conditioning",
        type: "conditioning",
        exercises: [
          { name: "Dynamic Warm-up", duration: "8 min" },
          { name: "Circuit: Kettlebell Clean & Press", sets: 4, reps: 8, perSide: true },
          { name: "Circuit: Box Jumps", sets: 4, reps: 10 },
          { name: "Circuit: TRX Rows", sets: 4, reps: 12 },
          { name: "Circuit: Medicine Ball Slams", sets: 4, reps: 15 },
          { name: "Circuit: Battle Rope Waves", sets: 4, duration: "30 sec" },
          { name: "Cool-down", duration: "7 min" }
        ],
        heartRateTarget: 80,
        structured: {
          warmup: { duration: 8, zone: "Fat Burn" },
          intervals: {
            high: "Cardio",
            low: "Fat Burn",
            highDuration: 0.75,
            lowDuration: 0.25,
            sets: 20
          },
          cooldown: { duration: 7, zone: "Fat Burn" }
        },
        tips: [
          "Minimal rest between exercises, 1-2 min between circuits",
          "Focus on explosive but controlled movements",
          "Maintain tension through core during all exercises",
          "Scale intensity to maintain good form"
        ]
      },
      {
        day: "Sunday",
        name: "Active Recovery & Mobility",
        type: "recovery",
        exercises: [
          { name: "Light Swimming or Cycling", duration: "20 min", intensity: "light" },
          { name: "Yoga Flow", duration: "20 min" },
          { name: "Foam Rolling", duration: "15 min" }
        ],
        heartRateTarget: 60,
        structured: {
          warmup: { duration: 5, zone: "Rest" },
          main: { duration: 45, zone: "Fat Burn" },
          cooldown: { duration: 5, zone: "Rest" }
        },
        tips: [
          "Focus on quality movement and recovery",
          "Address any tight areas with extra foam rolling",
          "Practice mindful breathing during yoga",
          "Prepare mentally for next week's training"
        ]
      }
    ]
  }
};

// Create the context
const WorkoutPlanContext = createContext();

// Context provider component
export const WorkoutPlanProvider = ({ children }) => {
  const [customWorkoutPlan, setCustomWorkoutPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('beginner');
  const [todaysWorkout, setTodaysWorkout] = useState(null);
  
  // Get today's workout based on the day of the week
  useEffect(() => {
    const getCurrentDayWorkout = () => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      
      // First check if there's a custom plan
      if (customWorkoutPlan) {
        const workout = customWorkoutPlan.workouts.find(w => w.day === today);
        return workout || null;
      }
      
      // Otherwise use the selected predefined plan
      const plan = WORKOUT_PLANS[selectedPlan];
      if (plan) {
        const workout = plan.workouts.find(w => w.day === today);
        return workout || null;
      }
      
      return null;
    };
    
    setTodaysWorkout(getCurrentDayWorkout());
  }, [customWorkoutPlan, selectedPlan]);
  
  // Save a custom workout plan from the Fitness Planner
  const saveCustomPlan = (plan) => {
    setCustomWorkoutPlan(plan);
  };
  
  // Select a predefined workout plan
  const selectPredefinedPlan = (planKey) => {
    if (WORKOUT_PLANS[planKey]) {
      setSelectedPlan(planKey);
    }
  };
  
  return (
    <WorkoutPlanContext.Provider
      value={{
        customWorkoutPlan,
        selectedPlan,
        todaysWorkout,
        saveCustomPlan,
        selectPredefinedPlan,
        predefinedPlans: WORKOUT_PLANS
      }}
    >
      {children}
    </WorkoutPlanContext.Provider>
  );
};

// Custom hook to use the workout plan context
export const useWorkoutPlan = () => {
  const context = useContext(WorkoutPlanContext);
  if (!context) {
    throw new Error('useWorkoutPlan must be used within a WorkoutPlanProvider');
  }
  return context;
};