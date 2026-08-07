-- ============================================================================
-- BodyNova — Seed data
-- ----------------------------------------------------------------------------
-- Global catalog rows: exercises, nutrition foods, achievements.
-- Idempotent via ON CONFLICT DO NOTHING.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Exercises
-- ----------------------------------------------------------------------------
insert into public.exercises (name, description, muscle_group, difficulty, equipment, duration_minutes) values
  ('Push-ups', 'Classic bodyweight chest press.', 'chest', 'beginner', 'bodyweight', 5),
  ('Bench Press', 'Barbell chest press on a flat bench.', 'chest', 'intermediate', 'barbell', 20),
  ('Incline Dumbbell Press', 'Dumbbell press on an incline bench.', 'chest', 'intermediate', 'dumbbell', 20),
  ('Chest Fly', 'Cable or dumbbell chest fly.', 'chest', 'intermediate', 'dumbbell', 15),
  ('Pull-ups', 'Bodyweight vertical pull.', 'back', 'intermediate', 'bodyweight', 15),
  ('Lat Pulldown', 'Cable lat pulldown.', 'back', 'beginner', 'cable', 15),
  ('Barbell Row', 'Barbell bent-over row.', 'back', 'intermediate', 'barbell', 20),
  ('Seated Cable Row', 'Seated horizontal pull with cable.', 'back', 'beginner', 'cable', 15),
  ('Deadlift', 'Barbell hip hinge lift.', 'back', 'advanced', 'barbell', 30),
  ('Overhead Press', 'Standing barbell shoulder press.', 'shoulders', 'intermediate', 'barbell', 20),
  ('Dumbbell Shoulder Press', 'Seated dumbbell shoulder press.', 'shoulders', 'beginner', 'dumbbell', 20),
  ('Lateral Raise', 'Dumbbell lateral raise.', 'shoulders', 'beginner', 'dumbbell', 10),
  ('Face Pull', 'Cable face pull for rear delts.', 'shoulders', 'beginner', 'cable', 10),
  ('Bicep Curl', 'Dumbbell or barbell bicep curl.', 'arms', 'beginner', 'dumbbell', 10),
  ('Tricep Dip', 'Bodyweight tricep dips.', 'arms', 'beginner', 'bodyweight', 10),
  ('Tricep Pushdown', 'Cable tricep pushdown.', 'arms', 'beginner', 'cable', 10),
  ('Hammer Curl', 'Neutral-grip dumbbell curl.', 'arms', 'beginner', 'dumbbell', 10),
  ('Squat', 'Bodyweight or barbell squat.', 'legs', 'beginner', 'bodyweight', 20),
  ('Barbell Back Squat', 'Barbell back squat.', 'legs', 'intermediate', 'barbell', 30),
  ('Lunges', 'Alternating walking lunges.', 'legs', 'beginner', 'dumbbell', 15),
  ('Leg Press', 'Machine leg press.', 'legs', 'beginner', 'machine', 20),
  ('Romanian Deadlift', 'Barbell hip hinge emphasis on hamstrings.', 'legs', 'intermediate', 'barbell', 20),
  ('Calf Raise', 'Standing or seated calf raise.', 'legs', 'beginner', 'machine', 10),
  ('Plank', 'Isometric core hold.', 'core', 'beginner', 'bodyweight', 5),
  ('Russian Twist', 'Rotational core exercise.', 'core', 'beginner', 'bodyweight', 10),
  ('Leg Raise', 'Hanging or lying leg raise.', 'core', 'intermediate', 'bodyweight', 10),
  ('Mountain Climbers', 'Dynamic core and cardio move.', 'core', 'beginner', 'bodyweight', 5),
  ('Burpees', 'Full body explosive movement.', 'full_body', 'intermediate', 'bodyweight', 10),
  ('Jumping Jacks', 'Full body cardio move.', 'full_body', 'beginner', 'bodyweight', 5),
  ('Kettlebell Swing', 'Full body hinge swing.', 'full_body', 'intermediate', 'kettlebell', 15),
  ('Running', 'Steady state outdoor or treadmill run.', 'cardio', 'beginner', 'none', 30),
  ('Cycling', 'Outdoor or stationary cycling.', 'cardio', 'beginner', 'bike', 30),
  ('Jump Rope', 'Skipping rope cardio.', 'cardio', 'beginner', 'jump_rope', 10),
  ('Rowing Machine', 'Full body cardio on rower.', 'cardio', 'beginner', 'machine', 20),
  ('Walking', 'Brisk walking for base activity.', 'cardio', 'beginner', 'none', 30)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Nutrition foods (common basics)
-- ----------------------------------------------------------------------------
insert into public.nutrition_foods (name, serving_size, serving_unit, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g) values
  ('Chicken Breast', '100g', 'grams', 165, 31, 0, 3.6, 0),
  ('Salmon Fillet', '100g', 'grams', 208, 20, 0, 13, 0),
  ('Ground Beef (90%)', '100g', 'grams', 176, 21, 0, 10, 0),
  ('Egg', '1 large (50g)', 'serving', 72, 6.3, 0.4, 4.8, 0),
  ('Greek Yogurt', '1 cup', 'cup', 149, 20, 9, 4, 0),
  ('Cottage Cheese', '100g', 'grams', 98, 11, 3.4, 4.3, 0),
  ('Tofu', '100g', 'grams', 76, 8, 1.9, 4.8, 0.3),
  ('Brown Rice', '1 cup cooked', 'cup', 216, 5, 45, 1.8, 3.5),
  ('White Rice', '1 cup cooked', 'cup', 205, 4.3, 45, 0.4, 0.6),
  ('Oats', '1 cup dry', 'cup', 307, 10.7, 55, 5.3, 8.2),
  ('Quinoa', '1 cup cooked', 'cup', 222, 8.1, 39, 3.6, 5.2),
  ('Sweet Potato', '1 medium', 'serving', 103, 2.3, 24, 0.2, 3.8),
  ('Banana', '1 medium', 'serving', 105, 1.3, 27, 0.4, 3.1),
  ('Apple', '1 medium', 'serving', 95, 0.5, 25, 0.3, 4.4),
  ('Blueberries', '1 cup', 'cup', 84, 1.1, 21, 0.5, 3.6),
  ('Spinach', '1 cup raw', 'cup', 7, 0.9, 1.1, 0.1, 0.7),
  ('Broccoli', '1 cup chopped', 'cup', 31, 2.5, 6, 0.3, 2.4),
  ('Almonds', '1 oz (23)', 'serving', 164, 6, 6.1, 14.2, 3.5),
  ('Peanut Butter', '2 tbsp', 'tablespoon', 188, 8, 7, 16, 2),
  ('Avocado', '1/2 medium', 'serving', 120, 1.5, 6.4, 11, 5),
  ('Olive Oil', '1 tbsp', 'tablespoon', 119, 0, 0, 13.5, 0),
  ('Whole Wheat Bread', '1 slice', 'slice', 81, 4, 14, 1.1, 1.9),
  ('Milk (2%)', '1 cup', 'cup', 122, 8.1, 11.7, 4.8, 0),
  ('Whey Protein', '1 scoop', 'scoop', 120, 24, 3, 1.5, 0.5),
  ('Tuna (canned)', '1 can', 'serving', 179, 39, 0, 2, 0)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Achievements
-- ----------------------------------------------------------------------------
insert into public.achievements (code, name, description, icon, category, threshold_value, threshold_unit) values
  ('first_workout', 'First Step', 'Log your first workout.', 'flame', 'workout', 1, 'workouts'),
  ('workout_5', 'Getting Started', 'Complete 5 workouts.', 'flame', 'workout', 5, 'workouts'),
  ('workout_25', 'In the Zone', 'Complete 25 workouts.', 'zap', 'workout', 25, 'workouts'),
  ('workout_100', 'Century Club', 'Complete 100 workouts.', 'trophy', 'workout', 100, 'workouts'),
  ('weight_first', 'Baseline Set', 'Log your first weight entry.', 'scale', 'weight', 1, 'entries'),
  ('weight_streak_30', 'On Track', 'Log weight for 30 consecutive days.', 'calendar', 'weight', 30, 'days'),
  ('steps_10k', '10k Club', 'Hit 10,000 steps in a day.', 'footprints', 'activity', 10000, 'steps'),
  ('steps_streak_7', 'Daily Driver', 'Meet your step goal 7 days in a row.', 'activity', 'activity', 7, 'days'),
  ('water_2l', 'Hydrated', 'Log 2L of water in a day.', 'droplets', 'hydration', 2000, 'ml'),
  ('water_streak_14', 'Hydration Hero', 'Hit your water goal 14 days in a row.', 'droplets', 'hydration', 14, 'days'),
  ('streak_7', 'One Week Strong', 'Complete 7 active days in a row.', 'calendar', 'consistency', 7, 'days'),
  ('streak_30', 'Monthly Grinder', 'Complete 30 active days in a row.', 'calendar', 'consistency', 30, 'days'),
  ('streak_100', 'Century Streak', 'Complete 100 active days in a row.', 'trophy', 'consistency', 100, 'days'),
  ('goal_completed', 'Goal Crusher', 'Complete your first goal.', 'target', 'goal', 1, 'goals'),
  ('nutrition_logged', 'Fueled Up', 'Log your first meal.', 'utensils', 'nutrition', 1, 'entries'),
  ('habit_streak_21', 'Habit Forged', 'Complete a habit 21 days in a row.', 'repeat', 'consistency', 21, 'days')
on conflict (code) do nothing;
