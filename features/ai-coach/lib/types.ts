export type GoalProgressValue = {
  id: string;
  type: string;
  title: string;
  current: number | null;
  target: number;
  percent: number;
  status: string;
};

export type HabitProgressValue = {
  id: string;
  name: string;
  targetPerWeek: number;
  completionRate: number;
};

export type WorkoutSummaryRow = {
  date: string;
  name: string;
  category: string;
  durationMinutes: number;
  caloriesBurned: number | null;
};

/**
 * Normalized, privacy-minimized snapshot of a user's fitness journey that is
 * safe to hand to an external AI provider. Only fields needed for coaching are
 * included, never raw email addresses or other unnecessary personal data.
 */
export type FitnessContext = {
  generatedAt: string;
  user: {
    firstName: string;
    heightCm: number | null;
    age: number | null;
    gender: string | null;
    fitnessLevel: string | null;
    activityLevel: string | null;
    primaryGoal: string | null;
    waterTargetMl: number;
    stepTarget: number;
    calorieTarget: number | null;
  };
  weight: {
    currentKg: number | null;
    change7dKg: number | null;
    change30dKg: number | null;
    bmi: number | null;
    bmiCategory: string | null;
    lastRecordedDate: string | null;
  };
  workouts: {
    last7d: number;
    last30d: number;
    perWeek: number;
    minutesLast30d: number;
    categories: Record<string, number>;
    recent: WorkoutSummaryRow[];
  };
  activity: {
    avgSteps7d: number;
    activeMinutes7d: number;
    daysLogged7d: number;
    daysLogged30d: number;
  };
  sleep: {
    avgMinutes7d: number | null;
    avgQuality: string | null;
    daysLogged7d: number;
  };
  water: {
    todayMl: number;
    avgPerDay7d: number;
    daysLogged7d: number;
    daysHitTarget7d: number;
    targetMl: number;
  };
  nutrition: {
    avgCalories7d: number;
    avgProteinG7d: number;
    daysLogged7d: number;
  };
  habits: HabitProgressValue[];
  goals: GoalProgressValue[];
  consistency: number;
  hasData: boolean;
};
