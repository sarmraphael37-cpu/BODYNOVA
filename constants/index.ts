import type {
  ActivityLevel,
  FitnessLevel,
  Gender,
  GoalType,
  MealType,
  MuscleGroup,
  PrimaryGoal,
  SleepQuality,
  WorkoutCategory,
} from "@/types/database";

export const APP_NAME = "BodyNova";
export const APP_TAGLINE = "Track Your Body. Understand Your Progress. Become Your Best Self.";

export const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const fitnessLevelOptions: { value: FitnessLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const activityLevelOptions: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "light", label: "Lightly active", description: "Exercise 1–3 days/week" },
  { value: "moderate", label: "Moderately active", description: "Exercise 3–5 days/week" },
  { value: "active", label: "Active", description: "Hard exercise 6–7 days/week" },
  { value: "very_active", label: "Very active", description: "Hard daily exercise + physical job" },
];

export const fitnessGoalOptions: { value: PrimaryGoal; label: string; description: string }[] = [
  { value: "lose_weight", label: "Lose Weight", description: "Shed body fat sustainably" },
  { value: "build_muscle", label: "Build Muscle", description: "Gain lean muscle mass" },
  { value: "maintain_weight", label: "Maintain Weight", description: "Keep your current weight" },
  { value: "improve_fitness", label: "Improve Fitness", description: "Get fitter overall" },
  { value: "improve_endurance", label: "Improve Endurance", description: "Boost stamina and cardio" },
  { value: "general_health", label: "Improve General Health", description: "Feel better every day" },
  { value: "gain_weight", label: "Gain Weight", description: "Increase body weight" },
];

export const workoutCategoryOptions: { value: WorkoutCategory; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "running", label: "Running" },
  { value: "walking", label: "Walking" },
  { value: "cycling", label: "Cycling" },
  { value: "hiit", label: "HIIT" },
  { value: "yoga", label: "Yoga" },
  { value: "stretching", label: "Stretching" },
  { value: "mobility", label: "Mobility" },
  { value: "sports", label: "Sports" },
  { value: "custom", label: "Custom" },
];

export const muscleGroupOptions: { value: MuscleGroup; label: string }[] = [
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "full_body", label: "Full Body" },
  { value: "cardio", label: "Cardio" },
];

export const mealTypeOptions: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snacks" },
];

export const sleepQualityOptions: { value: SleepQuality; label: string }[] = [
  { value: "poor", label: "Poor" },
  { value: "fair", label: "Fair" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
];

export const goalTypeOptions: { value: GoalType; label: string; unit: string }[] = [
  { value: "weight", label: "Weight", unit: "kg" },
  { value: "workouts", label: "Workouts", unit: "workouts" },
  { value: "steps", label: "Daily steps", unit: "steps" },
  { value: "water", label: "Daily water", unit: "ml" },
  { value: "sleep", label: "Sleep", unit: "hours" },
  { value: "distance", label: "Distance", unit: "km" },
  { value: "habit", label: "Habit", unit: "days" },
];

export const waterQuickAmounts = [250, 500, 750];

export const defaultHabitSuggestions = [
  { name: "Drink Water", icon: "droplets", color: "#0ea5e9" },
  { name: "Workout", icon: "dumbbell", color: "#10b981" },
  { name: "Walk", icon: "footprints", color: "#f59e0b" },
  { name: "Eat Healthy", icon: "apple", color: "#84cc16" },
  { name: "Stretch", icon: "stretch", color: "#8b5cf6" },
  { name: "Sleep", icon: "moon", color: "#6366f1" },
  { name: "Meditation", icon: "sparkles", color: "#ec4899" },
];

export const stepTargetDefault = 8000;
export const waterTargetDefault = 2500;

export const timeRangeOptions = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

export const analyticsPeriodOptions = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
  { value: "all", label: "All Time" },
];
