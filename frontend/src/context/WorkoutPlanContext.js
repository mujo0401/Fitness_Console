import React, { createContext, useContext, useState, useEffect } from 'react';

// Predefined workout plans for different fitness levels
export const WORKOUT_PLANS = {
  beginner: {
    name: "Beginner's Fitness Program",
    description: "A gentle introduction to fitness for those new to regular exercise.",
    dietType: "Balanced",
    recommendedFoods: ["Lean Proteins", "Whole Grains", "Fresh Fruits", "Vegetables"],
    avoidFoods: ["Processed Foods", "Sugary Drinks", "Excessive Alcohol", "High-Fat Foods"],
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
    dietType: "High-Protein",
    recommendedFoods: ["Lean Proteins", "Complex Carbohydrates", "Healthy Fats", "Fruits and Vegetables"],
    avoidFoods: ["Highly Processed Foods", "Added Sugars", "Refined Carbohydrates", "Excessive Alcohol"],
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
    dietType: "Athletic Performance",
    recommendedFoods: ["High-Quality Proteins", "Complex Carbohydrates", "Healthy Fats", "Nutrient-Dense Produce"],
    avoidFoods: ["Processed Foods", "Refined Sugars", "Fried Foods", "Empty Calories"],
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

// Diet recommendations based on goals and preferences
export const DIET_TYPES = {
  weight_loss: {
    name: "Weight Loss Diet",
    type: "Caloric Deficit",
    description: "Focuses on nutrient-dense, low-calorie foods to create a moderate caloric deficit.",
    macros: { protein: "30-35%", carbs: "40-45%", fat: "20-25%" },
    recommended: ["Lean proteins", "Fibrous vegetables", "Complex carbohydrates", "Low-fat dairy", "Berries", "Leafy greens"],
    avoid: ["Refined sugars", "Processed foods", "High-calorie beverages", "Fried foods", "Excessive alcohol"]
  },
  muscle_gain: {
    name: "Muscle Building Diet",
    type: "High-Protein",
    description: "Higher protein and moderate carbohydrate intake to support muscle recovery and growth.",
    macros: { protein: "25-35%", carbs: "40-50%", fat: "20-30%" },
    recommended: ["Lean proteins", "Eggs", "Greek yogurt", "Quinoa", "Sweet potatoes", "Nuts and seeds", "Avocados"],
    avoid: ["Low quality processed foods", "Excessive alcohol", "High-sugar foods", "Trans fats"]
  },
  endurance: {
    name: "Endurance Training Diet",
    type: "Carb-Focused",
    description: "Higher carbohydrate intake to fuel longer training sessions with adequate protein for recovery.",
    macros: { protein: "15-20%", carbs: "55-65%", fat: "20-30%" },
    recommended: ["Complex carbohydrates", "Oats", "Brown rice", "Fruit", "Lean proteins", "Hydrating foods"],
    avoid: ["High-fat meals before workouts", "Simple sugars", "Heavy meals", "Fried foods"]
  },
  vegan: {
    name: "Plant-Based Diet",
    type: "Vegan",
    description: "Focuses on high-quality plant proteins and varied nutrients from plant sources.",
    macros: { protein: "15-20%", carbs: "50-60%", fat: "25-30%" },
    recommended: ["Legumes", "Tofu", "Tempeh", "Nuts and seeds", "Whole grains", "Plant-based proteins"],
    avoid: ["All animal products", "Processed vegan foods", "High-sugar items", "Refined grains"]
  },
  balanced: {
    name: "Balanced Nutrition Plan",
    type: "Balanced",
    description: "Evenly distributed macronutrients with focus on whole foods and variety.",
    macros: { protein: "20-25%", carbs: "45-55%", fat: "25-35%" },
    recommended: ["Lean proteins", "Whole grains", "Fruits", "Vegetables", "Healthy fats", "Legumes"],
    avoid: ["Processed foods", "Excessive sugar", "Artificial ingredients", "Trans fats"]
  },
  keto: {
    name: "Ketogenic Diet",
    type: "Keto",
    description: "Very low carbohydrate, high fat diet that shifts the body's metabolism to fat-burning.",
    macros: { protein: "20-25%", carbs: "5-10%", fat: "70-75%" },
    recommended: ["Healthy fats", "Avocados", "Nuts", "Low-carb vegetables", "Eggs", "Fatty fish"],
    avoid: ["Sugars", "Grains", "Starchy vegetables", "Most fruits", "High-carb foods"]
  },
  paleo: {
    name: "Paleo Diet",
    type: "Paleo",
    description: "Based on foods presumed to have been available to ancestral humans, avoiding processed foods.",
    macros: { protein: "25-35%", carbs: "30-40%", fat: "30-40%" },
    recommended: ["Lean meats", "Fish", "Fruits", "Vegetables", "Nuts and seeds", "Eggs"],
    avoid: ["Grains", "Dairy", "Legumes", "Processed foods", "Refined sugar", "Vegetable oils"]
  },
  mediterranean: {
    name: "Mediterranean Diet",
    type: "Mediterranean",
    description: "Rich in plant foods, healthy fats, and lean proteins, modeled after Mediterranean eating patterns.",
    macros: { protein: "15-20%", carbs: "40-50%", fat: "30-40%" },
    recommended: ["Olive oil", "Fish", "Whole grains", "Vegetables", "Fruits", "Legumes", "Nuts"],
    avoid: ["Red meat", "Processed foods", "Added sugars", "Refined grains"]
  },
  athletic: {
    name: "Athletic Performance Diet",
    type: "Performance",
    description: "Optimized for athletic performance with timed nutrient intake and balanced macros.",
    macros: { protein: "20-30%", carbs: "45-55%", fat: "20-30%" },
    recommended: ["Lean proteins", "Complex carbs", "Whole grains", "Fruits", "Vegetables", "Pre/post workout nutrition"],
    avoid: ["Processed foods", "Alcohol", "Excessive sugar", "Dehydration"]
  }
};

// Food category mapping to grocery items
export const FOOD_CATEGORIES = {
  "Lean Proteins": [
    { name: "Chicken Breast", category: "Protein" },
    { name: "Turkey", category: "Protein" },
    { name: "Lean Beef", category: "Protein" },
    { name: "Fish (Salmon, Tuna)", category: "Protein" },
    { name: "Greek Yogurt", category: "Dairy" },
    { name: "Tofu", category: "Protein" },
    { name: "Eggs", category: "Protein" }
  ],
  "Whole Grains": [
    { name: "Brown Rice", category: "Grains" },
    { name: "Quinoa", category: "Grains" },
    { name: "Oats", category: "Grains" },
    { name: "Whole Grain Bread", category: "Grains" },
    { name: "Barley", category: "Grains" }
  ],
  "Vegetables": [
    { name: "Spinach", category: "Produce" },
    { name: "Broccoli", category: "Produce" },
    { name: "Kale", category: "Produce" },
    { name: "Bell Peppers", category: "Produce" },
    { name: "Carrots", category: "Produce" },
    { name: "Cauliflower", category: "Produce" }
  ],
  "Fruits": [
    { name: "Apples", category: "Produce" },
    { name: "Bananas", category: "Produce" },
    { name: "Berries", category: "Produce" },
    { name: "Oranges", category: "Produce" },
    { name: "Avocados", category: "Produce" }
  ],
  "Healthy Fats": [
    { name: "Olive Oil", category: "Oils" },
    { name: "Avocados", category: "Produce" },
    { name: "Nuts (Almonds, Walnuts)", category: "Nuts & Seeds" },
    { name: "Seeds (Chia, Flax)", category: "Nuts & Seeds" }
  ],
  "Dairy and Alternatives": [
    { name: "Greek Yogurt", category: "Dairy" },
    { name: "Cottage Cheese", category: "Dairy" },
    { name: "Almond Milk", category: "Dairy Alternative" },
    { name: "Oat Milk", category: "Dairy Alternative" }
  ]
};

// Create the context
const WorkoutPlanContext = createContext();

// Context provider component
export const WorkoutPlanProvider = ({ children }) => {
  const [customWorkoutPlan, setCustomWorkoutPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('beginner');
  const [todaysWorkout, setTodaysWorkout] = useState(null);
  const [fitnessProfile, setFitnessProfile] = useState(null);
  const [dietaryPreferences, setDietaryPreferences] = useState(null);
  const [recommendedGroceries, setRecommendedGroceries] = useState([]);
  
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
    return true;
  };
  
  // Select a predefined workout plan
  const selectPredefinedPlan = (planKey) => {
    if (WORKOUT_PLANS[planKey]) {
      setSelectedPlan(planKey);
      return true;
    }
    return false;
  };
  
  // Save fitness profile from questionnaire
  const saveFitnessProfile = (profile) => {
    setFitnessProfile(profile);
    
    // Extract dietary preferences
    const dietPrefs = {
      primaryDiet: profile.preferredDiet || 'balanced',
      restrictions: profile.dietaryRestrictions ? profile.dietaryRestrictions.split(',') : [],
      mealsPerDay: profile.mealsPerDay || 3,
      currentDiet: profile.currentDiet || '',
      primaryGoal: profile.primaryGoal || 'weight_loss'
    };
    
    setDietaryPreferences(dietPrefs);
    
    // Generate recommended groceries based on profile
    const groceryList = generateGroceryList(profile);
    setRecommendedGroceries(groceryList);
    
    return true;
  };
  
  // Get diet recommendations based on fitness profile
  const getDietRecommendations = () => {
    if (!fitnessProfile) return null;
    
    // Determine the recommended diet type based on primary goal
    const goalType = fitnessProfile.primaryGoal;
    let recommendedDiet = DIET_TYPES.balanced;
    
    if (DIET_TYPES[goalType]) {
      recommendedDiet = DIET_TYPES[goalType];
    } else if (fitnessProfile.preferredDiet && DIET_TYPES[fitnessProfile.preferredDiet]) {
      recommendedDiet = DIET_TYPES[fitnessProfile.preferredDiet];
    }
    
    // Factor in dietary restrictions
    let restrictions = [];
    if (fitnessProfile.dietaryRestrictions) {
      restrictions = fitnessProfile.dietaryRestrictions.split(',');
    }
    
    // Create customized diet recommendations
    const customizedDiet = {...recommendedDiet};
    
    // Adjust recommendations based on dietary restrictions
    if (restrictions.includes('vegetarian')) {
      customizedDiet.recommended = customizedDiet.recommended.filter(item => 
        !['meat', 'poultry', 'fish', 'seafood'].some(meat => item.toLowerCase().includes(meat)));
      customizedDiet.avoid = [...customizedDiet.avoid, 'Meat', 'Poultry', 'Fish', 'Seafood'];
    }
    
    if (restrictions.includes('vegan')) {
      customizedDiet.recommended = customizedDiet.recommended.filter(item => 
        !['meat', 'poultry', 'fish', 'seafood', 'dairy', 'egg'].some(animal => item.toLowerCase().includes(animal)));
      customizedDiet.avoid = [...customizedDiet.avoid, 'All animal products'];
    }
    
    if (restrictions.includes('gluten_free')) {
      customizedDiet.recommended = customizedDiet.recommended.filter(item => 
        !['wheat', 'gluten'].some(gluten => item.toLowerCase().includes(gluten)));
      customizedDiet.avoid = [...customizedDiet.avoid, 'Gluten-containing foods', 'Wheat', 'Barley', 'Rye'];
    }
    
    return customizedDiet;
  };
  
  // Generate grocery list based on fitness profile and diet recommendations
  const generateGroceryList = (profile) => {
    // If no profile, use current fitness profile
    if (!profile) {
      if (!fitnessProfile) return [];
      profile = fitnessProfile;
    }
    
    // Determine which diet type to use based on goals and preferences
    let dietType = 'balanced';
    if (profile.primaryGoal) {
      if (profile.primaryGoal === 'weight_loss') dietType = 'weight_loss';
      else if (profile.primaryGoal === 'muscle_gain') dietType = 'muscle_gain';
      else if (profile.primaryGoal === 'endurance') dietType = 'endurance';
    }
    
    // Override with preferred diet if specified
    if (profile.preferredDiet) {
      dietType = profile.preferredDiet;
    }
    
    // Get diet recommendations
    const dietRecs = DIET_TYPES[dietType] || DIET_TYPES.balanced;
    
    // Container for grocery items
    let groceryList = [];
    
    // Add recommended foods to grocery list
    if (dietRecs.recommended && dietRecs.recommended.length > 0) {
      dietRecs.recommended.forEach(food => {
        // Map food categories to specific grocery items
        const mappedItems = mapFoodToGroceryItems(food);
        if (mappedItems.length > 0) {
          groceryList = [...groceryList, ...mappedItems];
        }
      });
    }
    
    // If vegetarian, remove meat products
    if (profile.dietaryRestrictions && profile.dietaryRestrictions.includes('vegetarian')) {
      groceryList = groceryList.filter(item => 
        !['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna'].some(
          meat => item.name.toLowerCase().includes(meat)
        )
      );
    }
    
    // If vegan, remove all animal products
    if (profile.dietaryRestrictions && profile.dietaryRestrictions.includes('vegan')) {
      groceryList = groceryList.filter(item => 
        !['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna', 'egg', 'yogurt', 'milk', 'cheese'].some(
          animal => item.name.toLowerCase().includes(animal)
        )
      );
      
      // Add vegan alternatives
      groceryList.push(
        { name: "Tofu", category: "Protein" },
        { name: "Tempeh", category: "Protein" },
        { name: "Plant-based Protein", category: "Protein" },
        { name: "Almond Milk", category: "Dairy Alternative" }
      );
    }
    
    // If gluten-free, remove gluten-containing foods
    if (profile.dietaryRestrictions && profile.dietaryRestrictions.includes('gluten_free')) {
      groceryList = groceryList.filter(item => 
        !['wheat', 'bread', 'pasta', 'barley', 'rye'].some(
          gluten => item.name.toLowerCase().includes(gluten)
        )
      );
      
      // Add gluten-free alternatives
      groceryList.push(
        { name: "Gluten-free Bread", category: "Grains" },
        { name: "Rice Noodles", category: "Grains" },
        { name: "Quinoa", category: "Grains" }
      );
    }
    
    // Remove duplicates
    const uniqueList = [];
    const seen = new Set();
    groceryList.forEach(item => {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        uniqueList.push(item);
      }
    });
    
    return uniqueList;
  };
  
  // Helper to map food items to specific grocery items
  const mapFoodToGroceryItems = (food) => {
    // Look for exact match in food categories
    for (const [category, items] of Object.entries(FOOD_CATEGORIES)) {
      if (food.toLowerCase().includes(category.toLowerCase())) {
        return items;
      }
    }
    
    // Look for specific food mentions
    const specificFoods = {
      'lean protein': FOOD_CATEGORIES['Lean Proteins'],
      'protein': FOOD_CATEGORIES['Lean Proteins'],
      'whole grain': FOOD_CATEGORIES['Whole Grains'],
      'grain': FOOD_CATEGORIES['Whole Grains'],
      'vegetable': FOOD_CATEGORIES['Vegetables'],
      'fruit': FOOD_CATEGORIES['Fruits'],
      'healthy fat': FOOD_CATEGORIES['Healthy Fats'],
      'dairy': FOOD_CATEGORIES['Dairy and Alternatives']
    };
    
    for (const [term, items] of Object.entries(specificFoods)) {
      if (food.toLowerCase().includes(term)) {
        return items;
      }
    }
    
    // If no match found, return empty array
    return [];
  };
  
  return (
    <WorkoutPlanContext.Provider
      value={{
        customWorkoutPlan,
        selectedPlan,
        todaysWorkout,
        saveCustomPlan,
        selectPredefinedPlan,
        predefinedPlans: WORKOUT_PLANS,
        fitnessProfile,
        saveFitnessProfile,
        dietaryPreferences,
        dietTypes: DIET_TYPES,
        getDietRecommendations,
        recommendedGroceries,
        generateGroceryList
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