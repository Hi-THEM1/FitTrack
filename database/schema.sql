-- FitTrack PostgreSQL Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  goal TEXT,
  fitness_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  category TEXT NOT NULL,
  equipment TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  muscles JSONB DEFAULT '[]',
  instructions_en TEXT[] DEFAULT '{}',
  instructions_fr TEXT[] DEFAULT '{}',
  media_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  template_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER NOT NULL,
  total_volume DECIMAL(10,2) NOT NULL,
  xp_earned INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set Logs table
CREATE TABLE IF NOT EXISTS set_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  reps INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_pr BOOLEAN DEFAULT FALSE,
  previous_weight_kg DECIMAL(5,2),
  previous_reps INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food Items table
CREATE TABLE IF NOT EXISTS food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  calories DECIMAL(6,2) NOT NULL,
  protein DECIMAL(5,2) NOT NULL,
  carbs DECIMAL(5,2) NOT NULL,
  fats DECIMAL(5,2) NOT NULL,
  serving_size DECIMAL(5,2) NOT NULL,
  unit TEXT CHECK (unit IN ('g', 'ml', 'piece')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Entries table
CREATE TABLE IF NOT EXISTS meal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  food_id UUID REFERENCES food_items(id) NOT NULL,
  quantity DECIMAL(5,2) NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')) NOT NULL,
  logged_date DATE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_id ON meal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_entries_logged_date ON meal_entries(logged_date);

-- Row Level Security (RLS) - Enable and set policies as needed
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust as needed)
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view public exercises and own" ON exercises FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can view own workouts" ON workout_sessions FOR SELECT USING (auth.uid() = user_id);
-- Add more policies for INSERT, UPDATE, DELETE as required
