// Food database with nutrition information and health scores
export const FoodDatabase = [
  // Healthy Foods - High Health Scores (70-100)
  {
    id: 1,
    name: "Grilled Chicken Breast",
    calories: 165,
    protein: 31,
    fat: 3.6,
    carbs: 0,
    healthScore: 90,
    category: "protein"
  },
  {
    id: 2,
    name: "Salmon Fillet",
    calories: 208,
    protein: 22.5,
    fat: 13,
    carbs: 0,
    healthScore: 95,
    category: "protein"
  },
  {
    id: 3,
    name: "Quinoa",
    calories: 222,
    protein: 8.1,
    fat: 3.6,
    carbs: 39.4,
    healthScore: 85,
    category: "grain"
  },
  {
    id: 4,
    name: "Spinach",
    calories: 23,
    protein: 2.9,
    fat: 0.4,
    carbs: 3.6,
    healthScore: 98,
    category: "vegetable"
  },
  {
    id: 5,
    name: "Greek Yogurt",
    calories: 59,
    protein: 10,
    fat: 0.4,
    carbs: 3.6,
    healthScore: 82,
    category: "dairy"
  },
  {
    id: 6,
    name: "Avocado",
    calories: 160,
    protein: 2,
    fat: 15,
    carbs: 9,
    healthScore: 88,
    category: "fruit"
  },
  {
    id: 7,
    name: "Blueberries",
    calories: 57,
    protein: 0.7,
    fat: 0.3,
    carbs: 14.5,
    healthScore: 92,
    category: "fruit"
  },
  {
    id: 8,
    name: "Sweet Potato",
    calories: 86,
    protein: 1.6,
    fat: 0.1,
    carbs: 20.1,
    healthScore: 85,
    category: "vegetable"
  },
  {
    id: 9,
    name: "Broccoli",
    calories: 34,
    protein: 2.8,
    fat: 0.4,
    carbs: 6.6,
    healthScore: 96,
    category: "vegetable"
  },
  {
    id: 10,
    name: "Almonds",
    calories: 161,
    protein: 6,
    fat: 14,
    carbs: 6,
    healthScore: 84,
    category: "nuts"
  },
  
  // Moderate Foods - Medium Health Scores (40-69)
  {
    id: 11,
    name: "Brown Rice",
    calories: 111,
    protein: 2.6,
    fat: 0.9,
    carbs: 23,
    healthScore: 69,
    category: "grain"
  },
  {
    id: 12,
    name: "Whole Wheat Bread",
    calories: 81,
    protein: 4,
    fat: 1.1,
    carbs: 13.8,
    healthScore: 62,
    category: "grain"
  },
  {
    id: 13,
    name: "Eggs",
    calories: 78,
    protein: 6.3,
    fat: 5.3,
    carbs: 0.6,
    healthScore: 67,
    category: "protein"
  },
  {
    id: 14,
    name: "Banana",
    calories: 89,
    protein: 1.1,
    fat: 0.3,
    carbs: 22.8,
    healthScore: 60,
    category: "fruit"
  },
  {
    id: 15,
    name: "Lean Beef",
    calories: 250,
    protein: 26,
    fat: 15,
    carbs: 0,
    healthScore: 58,
    category: "protein"
  },
  {
    id: 16,
    name: "Turkey Sandwich",
    calories: 320,
    protein: 22,
    fat: 7,
    carbs: 41,
    healthScore: 55,
    category: "mixed"
  },
  {
    id: 17,
    name: "Granola",
    calories: 120,
    protein: 3,
    fat: 6,
    carbs: 14,
    healthScore: 53,
    category: "grain"
  },
  {
    id: 18,
    name: "Hummus",
    calories: 27,
    protein: 1.2,
    fat: 1.4,
    carbs: 2.9,
    healthScore: 64,
    category: "protein"
  },
  {
    id: 19,
    name: "Orange Juice",
    calories: 45,
    protein: 0.7,
    fat: 0.2,
    carbs: 10.4,
    healthScore: 50,
    category: "beverage"
  },
  {
    id: 20,
    name: "Pasta",
    calories: 131,
    protein: 5.1,
    fat: 1.1,
    carbs: 26,
    healthScore: 45,
    category: "grain"
  },
  
  // Unhealthy Foods - Low Health Scores (0-39)
  {
    id: 21,
    name: "Cheeseburger",
    calories: 535,
    protein: 25,
    fat: 28,
    carbs: 46,
    healthScore: 20,
    category: "fast food"
  },
  {
    id: 22,
    name: "French Fries",
    calories: 365,
    protein: 4,
    fat: 17,
    carbs: 48,
    healthScore: 15,
    category: "fast food"
  },
  {
    id: 23,
    name: "Pizza Slice",
    calories: 285,
    protein: 12,
    fat: 10,
    carbs: 36,
    healthScore: 25,
    category: "fast food"
  },
  {
    id: 24,
    name: "Soda",
    calories: 140,
    protein: 0,
    fat: 0,
    carbs: 39,
    healthScore: 5,
    category: "beverage"
  },
  {
    id: 25,
    name: "Ice Cream",
    calories: 207,
    protein: 3.5,
    fat: 11,
    carbs: 23,
    healthScore: 18,
    category: "dessert"
  },
  {
    id: 26,
    name: "Potato Chips",
    calories: 150,
    protein: 2,
    fat: 10,
    carbs: 15,
    healthScore: 12,
    category: "snack"
  },
  {
    id: 27,
    name: "Chocolate Bar",
    calories: 235,
    protein: 3.4,
    fat: 13,
    carbs: 26,
    healthScore: 15,
    category: "dessert"
  },
  {
    id: 28,
    name: "Fried Chicken",
    calories: 320,
    protein: 24,
    fat: 21,
    carbs: 12,
    healthScore: 22,
    category: "fast food"
  },
  {
    id: 29,
    name: "Cinnamon Roll",
    calories: 309,
    protein: 5,
    fat: 14,
    carbs: 44,
    healthScore: 10,
    category: "dessert"
  },
  {
    id: 30,
    name: "Hot Dog",
    calories: 242,
    protein: 10.4,
    fat: 15,
    carbs: 18,
    healthScore: 8,
    category: "fast food"
  }
];