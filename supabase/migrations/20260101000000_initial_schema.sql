-- ============================================================================
-- BodyNova — Initial schema
-- ----------------------------------------------------------------------------
-- Tables, Row Level Security, triggers, and indexes.
-- Run with `supabase db push` or apply manually in the Supabase SQL editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: is the current user an admin?
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- Helper: write an audit log entry.
-- ----------------------------------------------------------------------------
create or replace function public.log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id text default null,
  p_metadata jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_metadata);
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm numeric(5, 1) check (height_cm > 0 and height_cm < 300),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  primary_goal text check (primary_goal in (
    'lose_weight', 'gain_weight', 'build_muscle', 'maintain_weight',
    'improve_fitness', 'improve_endurance', 'general_health'
  )),
  onboarding_completed boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'user');

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create index on public.profiles (role);

-- ----------------------------------------------------------------------------
-- user_preferences
-- ----------------------------------------------------------------------------
create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  water_target_ml integer not null default 2500 check (water_target_ml > 0),
  step_target integer not null default 8000 check (step_target > 0),
  calorie_target integer check (calorie_target > 0),
  dietary_preferences text[] not null default '{}',
  notification_settings jsonb not null default '{
    "workout_reminders": true,
    "water_reminders": true,
    "weight_reminders": true,
    "goal_notifications": true,
    "achievement_notifications": true,
    "weekly_reports": true
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can manage their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- weight_entries
-- ----------------------------------------------------------------------------
create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weight_kg numeric(5, 2) not null check (weight_kg > 0 and weight_kg < 500),
  body_fat_percentage numeric(4, 1) check (body_fat_percentage > 0 and body_fat_percentage < 80),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.weight_entries enable row level security;

create policy "Users can manage their own weight entries"
  on public.weight_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.weight_entries (user_id, date desc);

-- ----------------------------------------------------------------------------
-- body_measurements
-- ----------------------------------------------------------------------------
create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weight_kg numeric(5, 2) check (weight_kg > 0 and weight_kg < 500),
  body_fat_percentage numeric(4, 1) check (body_fat_percentage > 0 and body_fat_percentage < 80),
  muscle_mass_kg numeric(5, 2) check (muscle_mass_kg > 0 and muscle_mass_kg < 300),
  waist_cm numeric(5, 1) check (waist_cm > 0 and waist_cm < 300),
  chest_cm numeric(5, 1) check (chest_cm > 0 and chest_cm < 300),
  arms_cm numeric(5, 1) check (arms_cm > 0 and arms_cm < 200),
  thighs_cm numeric(5, 1) check (thighs_cm > 0 and thighs_cm < 200),
  hips_cm numeric(5, 1) check (hips_cm > 0 and hips_cm < 300),
  neck_cm numeric(5, 1) check (neck_cm > 0 and neck_cm < 200),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.body_measurements enable row level security;

create policy "Users can manage their own measurements"
  on public.body_measurements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.body_measurements (user_id, date desc);

-- ----------------------------------------------------------------------------
-- fitness_goals
-- ----------------------------------------------------------------------------
create table public.fitness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('weight', 'workouts', 'steps', 'water', 'habit', 'sleep', 'distance')),
  title text not null,
  target_value numeric(10, 2) not null,
  start_value numeric(10, 2) not null default 0,
  unit text not null default '',
  start_date date not null default current_date,
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'paused', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fitness_goals enable row level security;

create policy "Users can manage their own goals"
  on public.fitness_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.fitness_goals (user_id, status);

-- ----------------------------------------------------------------------------
-- exercises (global catalog, admin-managed)
-- ----------------------------------------------------------------------------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  muscle_group text not null check (muscle_group in ('chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body', 'cardio')),
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  equipment text,
  instructions text,
  duration_minutes integer check (duration_minutes > 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.exercises enable row level security;

create policy "Everyone can view active exercises"
  on public.exercises for select
  using (status = 'active');

create policy "Admins can manage exercises"
  on public.exercises for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- workouts
-- ----------------------------------------------------------------------------
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  name text not null,
  category text not null check (category in (
    'strength', 'cardio', 'running', 'walking', 'cycling', 'hiit',
    'yoga', 'stretching', 'mobility', 'sports', 'custom'
  )),
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes < 1440),
  calories_burned integer check (calories_burned > 0),
  distance_km numeric(6, 2) check (distance_km > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workouts enable row level security;

create policy "Users can manage their own workouts"
  on public.workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.workouts (user_id, date desc);

-- ----------------------------------------------------------------------------
-- workout_exercises
-- ----------------------------------------------------------------------------
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid references public.exercises (id) on delete set null,
  name text not null,
  sets integer check (sets > 0),
  reps integer check (reps > 0),
  weight_kg numeric(6, 2) check (weight_kg >= 0),
  duration_minutes integer check (duration_minutes > 0),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.workout_exercises enable row level security;

create policy "Users can manage their own workout exercises"
  on public.workout_exercises for all
  using (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_id and workouts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workouts
      where workouts.id = workout_id and workouts.user_id = auth.uid()
    )
  );

create index on public.workout_exercises (workout_id);

-- ----------------------------------------------------------------------------
-- nutrition_foods (catalog, admin + user-managed)
-- ----------------------------------------------------------------------------
create table public.nutrition_foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  serving_size text not null default '1 serving',
  serving_unit text not null default 'serving',
  calories_per_serving numeric(7, 1) not null check (calories_per_serving >= 0),
  protein_g numeric(6, 1) not null default 0 check (protein_g >= 0),
  carbs_g numeric(6, 1) not null default 0 check (carbs_g >= 0),
  fat_g numeric(6, 1) not null default 0 check (fat_g >= 0),
  fiber_g numeric(6, 1) not null default 0 check (fiber_g >= 0),
  source text not null default 'system' check (source in ('manual', 'system')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

alter table public.nutrition_foods enable row level security;

create policy "Everyone can view active foods"
  on public.nutrition_foods for select
  using (status = 'active');

create policy "Admins can manage foods"
  on public.nutrition_foods for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- nutrition_entries
-- ----------------------------------------------------------------------------
create table public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id uuid references public.nutrition_foods (id) on delete set null,
  food_name text not null,
  servings numeric(6, 2) not null default 1 check (servings > 0),
  calories numeric(7, 1) not null check (calories >= 0),
  protein_g numeric(6, 1) not null default 0 check (protein_g >= 0),
  carbs_g numeric(6, 1) not null default 0 check (carbs_g >= 0),
  fat_g numeric(6, 1) not null default 0 check (fat_g >= 0),
  fiber_g numeric(6, 1) not null default 0 check (fiber_g >= 0),
  created_at timestamptz not null default now()
);

alter table public.nutrition_entries enable row level security;

create policy "Users can manage their own nutrition entries"
  on public.nutrition_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.nutrition_entries (user_id, date);

-- ----------------------------------------------------------------------------
-- water_logs
-- ----------------------------------------------------------------------------
create table public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  amount_ml integer not null check (amount_ml > 0 and amount_ml < 10000),
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.water_logs enable row level security;

create policy "Users can manage their own water logs"
  on public.water_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.water_logs (user_id, date);

-- ----------------------------------------------------------------------------
-- activity_logs
-- ----------------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  steps integer not null default 0 check (steps >= 0),
  distance_km numeric(6, 2) not null default 0 check (distance_km >= 0),
  active_minutes integer not null default 0 check (active_minutes >= 0),
  calories_burned integer not null default 0 check (calories_burned >= 0),
  source text not null default 'manual' check (source in ('manual', 'device')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.activity_logs enable row level security;

create policy "Users can manage their own activity logs"
  on public.activity_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.activity_logs (user_id, date desc);

-- ----------------------------------------------------------------------------
-- sleep_logs
-- ----------------------------------------------------------------------------
create table public.sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  bedtime timestamptz,
  wake_time timestamptz,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes < 1440),
  quality text check (quality in ('poor', 'fair', 'good', 'excellent')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.sleep_logs enable row level security;

create policy "Users can manage their own sleep logs"
  on public.sleep_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.sleep_logs (user_id, date desc);

-- ----------------------------------------------------------------------------
-- habits
-- ----------------------------------------------------------------------------
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text not null default 'check',
  color text not null default '#10b981',
  target_per_week integer not null default 7 check (target_per_week > 0 and target_per_week <= 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Users can manage their own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- habit_logs
-- ----------------------------------------------------------------------------
create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

alter table public.habit_logs enable row level security;

create policy "Users can manage their own habit logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.habit_logs (user_id, date);

-- ----------------------------------------------------------------------------
-- achievements (global catalog, admin-managed)
-- ----------------------------------------------------------------------------
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  icon text not null default 'trophy',
  category text not null check (category in (
    'workout', 'weight', 'activity', 'hydration', 'consistency', 'goal', 'nutrition'
  )),
  threshold_value numeric(10, 2) not null default 1,
  threshold_unit text not null default '',
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;

create policy "Authenticated users can view achievements"
  on public.achievements for select
  to authenticated
  using (true);

create policy "Admins can manage achievements"
  on public.achievements for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- user_achievements
-- ----------------------------------------------------------------------------
create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  progress_value numeric(10, 2) not null default 0,
  unique (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users can manage their own achievements"
  on public.user_achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.user_achievements (user_id);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'system' check (type in (
    'workout', 'water', 'weight', 'goal', 'achievement', 'weekly_report', 'system'
  )),
  title text not null,
  body text not null,
  read boolean not null default false,
  data jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can manage their own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.notifications (user_id, read, created_at desc);

-- ----------------------------------------------------------------------------
-- ai_insights
-- ----------------------------------------------------------------------------
create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'daily' check (type in (
    'daily', 'weekly', 'goal', 'workout', 'nutrition', 'hydration', 'activity', 'sleep'
  )),
  title text not null,
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.ai_insights enable row level security;

create policy "Users can manage their own AI insights"
  on public.ai_insights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.ai_insights (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- progress_reports
-- ----------------------------------------------------------------------------
create table public.progress_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period text not null check (period in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.progress_reports enable row level security;

create policy "Users can manage their own progress reports"
  on public.progress_reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.progress_reports (user_id, period_start desc);

-- ----------------------------------------------------------------------------
-- audit_logs (admin only)
-- ----------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  ip text,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (public.is_admin());

create policy "Admins can write audit logs"
  on public.audit_logs for insert
  with check (public.is_admin());

create index on public.audit_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- Trigger: create profile + preferences when a user signs up
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Trigger: bump updated_at on key tables
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger user_preferences_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();
create trigger weight_entries_updated_at before update on public.weight_entries
  for each row execute function public.set_updated_at();
create trigger body_measurements_updated_at before update on public.body_measurements
  for each row execute function public.set_updated_at();
create trigger fitness_goals_updated_at before update on public.fitness_goals
  for each row execute function public.set_updated_at();
create trigger exercises_updated_at before update on public.exercises
  for each row execute function public.set_updated_at();
create trigger workouts_updated_at before update on public.workouts
  for each row execute function public.set_updated_at();
create trigger activity_logs_updated_at before update on public.activity_logs
  for each row execute function public.set_updated_at();
create trigger sleep_logs_updated_at before update on public.sleep_logs
  for each row execute function public.set_updated_at();
create trigger habits_updated_at before update on public.habits
  for each row execute function public.set_updated_at();
