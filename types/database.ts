export type UserRole = "user" | "admin";
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type PrimaryGoal =
  | "lose_weight"
  | "gain_weight"
  | "build_muscle"
  | "maintain_weight"
  | "improve_fitness"
  | "improve_endurance"
  | "general_health";
export type UnitSystem = "metric" | "imperial";

export type GoalStatus = "active" | "completed" | "paused" | "abandoned";
export type GoalType = "weight" | "workouts" | "steps" | "water" | "habit" | "sleep" | "distance";

export type WorkoutCategory =
  | "strength"
  | "cardio"
  | "running"
  | "walking"
  | "cycling"
  | "hiit"
  | "yoga"
  | "stretching"
  | "mobility"
  | "sports"
  | "custom";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "full_body"
  | "cardio";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type SleepQuality = "poor" | "fair" | "good" | "excellent";

export type AchievementCategory =
  | "workout"
  | "weight"
  | "activity"
  | "hydration"
  | "consistency"
  | "goal"
  | "nutrition";

export type InsightType =
  | "daily"
  | "weekly"
  | "goal"
  | "workout"
  | "nutrition"
  | "hydration"
  | "activity"
  | "sleep";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  height_cm: number | null;
  unit_system: UnitSystem;
  fitness_level: FitnessLevel | null;
  activity_level: ActivityLevel | null;
  primary_goal: PrimaryGoal | null;
  onboarding_completed: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserPreferences = {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  unit_system: UnitSystem;
  water_target_ml: number;
  step_target: number;
  calorie_target: number | null;
  dietary_preferences: string[];
  notification_settings: {
    workout_reminders: boolean;
    water_reminders: boolean;
    weight_reminders: boolean;
    goal_notifications: boolean;
    achievement_notifications: boolean;
    weekly_reports: boolean;
  };
  created_at: string;
  updated_at: string;
}

export type WeightEntry = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  body_fat_percentage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type BodyMeasurement = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  muscle_mass_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arms_cm: number | null;
  thighs_cm: number | null;
  hips_cm: number | null;
  neck_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type FitnessGoal = {
  id: string;
  user_id: string;
  type: GoalType;
  title: string;
  target_value: number;
  start_value: number;
  unit: string;
  start_date: string;
  target_date: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export type Exercise = {
  id: string;
  name: string;
  description: string | null;
  muscle_group: MuscleGroup;
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment: string | null;
  instructions: string | null;
  duration_minutes: number | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export type Workout = {
  id: string;
  user_id: string;
  date: string;
  name: string;
  category: WorkoutCategory;
  duration_minutes: number;
  calories_burned: number | null;
  distance_km: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string | null;
  name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_minutes: number | null;
  notes: string | null;
}

export type NutritionFood = {
  id: string;
  name: string;
  serving_size: string;
  serving_unit: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  source: "manual" | "system";
  status: "active" | "inactive";
  created_at: string;
}

export type NutritionEntry = {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  food_id: string | null;
  food_name: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  created_at: string;
}

export type WaterLog = {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export type ActivityLog = {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  distance_km: number;
  active_minutes: number;
  calories_burned: number;
  source: "manual" | "device";
  created_at: string;
  updated_at: string;
}

export type SleepLog = {
  id: string;
  user_id: string;
  date: string;
  bedtime: string | null;
  wake_time: string | null;
  duration_minutes: number;
  quality: SleepQuality | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  target_per_week: number;
  created_at: string;
  updated_at: string;
}

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

export type Achievement = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  threshold_value: number;
  threshold_unit: string;
  created_at: string;
}

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress_value: number;
  achievement?: Achievement;
}

export type Notification = {
  id: string;
  user_id: string;
  type: "workout" | "water" | "weight" | "goal" | "achievement" | "weekly_report" | "system";
  title: string;
  body: string;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export type AiInsight = {
  id: string;
  user_id: string;
  type: InsightType;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type ProgressReport = {
  id: string;
  user_id: string;
  period: "weekly" | "monthly";
  period_start: string;
  period_end: string;
  data: Record<string, unknown>;
  created_at: string;
}

export type AuditLog = {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}
