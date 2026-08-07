import type {
  Profile,
  UserPreferences,
  WeightEntry,
  BodyMeasurement,
  FitnessGoal,
  Exercise,
  Workout,
  WorkoutExercise,
  NutritionFood,
  NutritionEntry,
  WaterLog,
  ActivityLog,
  SleepLog,
  Habit,
  HabitLog,
  Achievement,
  UserAchievement,
  Notification,
  AiInsight,
  AiConversation,
  AiMessage,
  AiUsage,
  ProgressReport,
  AuditLog,
  PasswordReset,
  AuthUser,
} from "./database";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Row<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      profiles: Row<Profile>;
      user_preferences: Row<UserPreferences>;
      weight_entries: Row<WeightEntry>;
      body_measurements: Row<BodyMeasurement>;
      fitness_goals: Row<FitnessGoal>;
      exercises: Row<Exercise>;
      workouts: Row<Workout>;
      workout_exercises: Row<WorkoutExercise>;
      nutrition_foods: Row<NutritionFood>;
      nutrition_entries: Row<NutritionEntry>;
      water_logs: Row<WaterLog>;
      activity_logs: Row<ActivityLog>;
      sleep_logs: Row<SleepLog>;
      habits: Row<Habit>;
      habit_logs: Row<HabitLog>;
      achievements: Row<Achievement>;
      user_achievements: Row<UserAchievement>;
      notifications: Row<Notification>;
      ai_insights: Row<AiInsight>;
      ai_conversations: Row<AiConversation>;
      ai_messages: Row<AiMessage>;
      ai_usage: Row<AiUsage>;
      progress_reports: Row<ProgressReport>;
      audit_logs: Row<AuditLog>;
      password_resets: Row<PasswordReset>;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  auth: {
    Tables: {
      users: Row<AuthUser>;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
