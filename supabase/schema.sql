-- LifeForge Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  weight FLOAT,
  height FLOAT,
  goal_calories INTEGER DEFAULT 2000,
  goal_protein INTEGER DEFAULT 150,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT '✨',
  color TEXT DEFAULT '#10b981',
  frequency habit_frequency DEFAULT 'daily',
  target_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6],
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Habit entries table
CREATE TABLE public.habit_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Nutrition logs table
CREATE TABLE public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  quantity FLOAT NOT NULL,
  calories INTEGER NOT NULL,
  protein FLOAT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premium users table
CREATE TABLE public.premium_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_nutrition_logs_user_date ON nutrition_logs(user_id, date);
CREATE INDEX idx_nutrition_logs_date ON nutrition_logs(date);
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_habit_entries_habit_date ON habit_entries(habit_id, date);
CREATE INDEX idx_habit_entries_date ON habit_entries(date);
CREATE INDEX idx_premium_users_user ON premium_users(user_id);
CREATE INDEX idx_premium_users_email ON premium_users(email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Habit entries policies
CREATE POLICY "Users can view own habit entries" ON habit_entries
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM habits WHERE id = habit_id)
  );

CREATE POLICY "Users can insert own habit entries" ON habit_entries
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM habits WHERE id = habit_id)
  );

CREATE POLICY "Users can update own habit entries" ON habit_entries
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM habits WHERE id = habit_id)
  );

CREATE POLICY "Users can delete own habit entries" ON habit_entries
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM habits WHERE id = habit_id)
  );

-- Nutrition logs policies
CREATE POLICY "Users can view own nutrition logs" ON nutrition_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" ON nutrition_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" ON nutrition_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" ON nutrition_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Premium users policies
-- Anyone can view if they are premium (to check own status)
CREATE POLICY "Premium users can view own status" ON premium_users
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can manage (use in edge functions)
-- For now, allow users to view their own premium status
CREATE POLICY "Users can view premium status" ON premium_users
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to create default habits for new user
CREATE OR REPLACE FUNCTION create_default_habits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO habits (user_id, name, slug, icon, color, is_default)
  VALUES 
    (NEW.id, 'No Smoking', 'no-smoking', '🚭', '#ef4444', TRUE),
    (NEW.id, 'Gym', 'gym', '🏋️', '#10b981', TRUE),
    (NEW.id, 'rezar', 'rezar', '🙏', '#3b82f6', TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default habits
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_habits();

-- Function to get habit streak
CREATE OR REPLACE FUNCTION get_habit_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_date DATE := CURRENT_DATE;
BEGIN
  LOOP
    IF EXISTS (
      SELECT 1 FROM habit_entries
      WHERE habit_id = p_habit_id
        AND date = v_date
        AND completed = TRUE
    ) THEN
      v_streak := v_streak + 1;
      v_date := v_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily nutrition totals
CREATE OR REPLACE FUNCTION get_daily_nutrition(p_user_id UUID, p_date DATE)
RETURNS TABLE(calories_total INT, protein_total FLOAT, entries_count INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(calories), 0)::INT,
    COALESCE(SUM(protein), 0)::FLOAT,
    COUNT(*)::INT
  FROM nutrition_logs
  WHERE user_id = p_user_id AND date = p_date;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_premium BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM premium_users
    WHERE user_id = p_user_id AND is_active = TRUE
  ) INTO v_is_premium;
  RETURN v_is_premium;
END;
$$ LANGUAGE plpgsql;

-- Function to grant premium access
CREATE OR REPLACE FUNCTION grant_premium_access(p_granted_user_id UUID, p_granted_by UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO premium_users (user_id, email, granted_by)
  SELECT p_granted_user_id, email, p_granted_by
  FROM auth.users
  WHERE id = p_granted_user_id
  ON CONFLICT (user_id) DO UPDATE SET 
    is_active = TRUE,
    granted_at = NOW(),
    granted_by = p_granted_by;
END;
$$ LANGUAGE plpgsql;

-- Function to revoke premium access
CREATE OR REPLACE FUNCTION revoke_premium_access(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE premium_users 
  SET is_active = FALSE 
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Admin check function (you as owner can manage)
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- You are the admin (replace with your user ID from auth.users)
  RETURN p_user_id = auth.users.id WHERE email = 'oussamablhbnz@gmail.com';
END;
$$ LANGUAGE plpgsql;