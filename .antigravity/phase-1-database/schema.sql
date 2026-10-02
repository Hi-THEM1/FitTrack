-- FitTrack Complete MySQL Schema
-- Created by Antigravity Database Agent
-- Charset: UTF8MB4

CREATE DATABASE IF NOT EXISTS fittrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fittrack_db;

-- 1. Authentication & Roles
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('user', 'admin', 'coach') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Body Metrics & Goals
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,
  birth_date DATE NULL,
  gender ENUM('male', 'female', 'other'),
  height_cm INT NOT NULL CHECK (height_cm > 0),
  current_weight_kg DECIMAL(5,2) NOT NULL CHECK (current_weight_kg > 0),
  goal_weight_kg DECIMAL(5,2) NULL,
  activity_level ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
  goal_type ENUM('lose_weight', 'gain_muscle', 'maintain', 'improve_endurance'),
  daily_calorie_target INT,
  experience_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  workout_days_per_week INT CHECK (workout_days_per_week BETWEEN 1 AND 7),
  workout_duration_min INT DEFAULT 45,
  available_equipment JSON,
  coach_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Settings
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INT PRIMARY KEY,
  theme ENUM('light', 'dark', 'system') DEFAULT 'system',
  language ENUM('fr', 'en') DEFAULT 'fr',
  email_weekly_summary BOOLEAN DEFAULT TRUE,
  email_reminders BOOLEAN DEFAULT TRUE,
  reduced_motion BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. XP & Levels
CREATE TABLE IF NOT EXISTS user_gamification (
  user_id INT PRIMARY KEY,
  total_xp INT DEFAULT 0,
  current_level INT DEFAULT 1,
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  streak_freezes INT DEFAULT 1,
  weekly_score INT DEFAULT 0,
  last_login_date DATE NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Daily Check-in
CREATE TABLE IF NOT EXISTS login_rewards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  login_date DATE NOT NULL,
  streak_day INT CHECK (streak_day BETWEEN 1 AND 7),
  xp_earned INT DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT FALSE,
  UNIQUE KEY unique_user_login (user_id, login_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Configuration (Reward Tiers)
CREATE TABLE IF NOT EXISTS reward_tiers (
  streak_day INT PRIMARY KEY CHECK (streak_day BETWEEN 1 AND 7),
  xp_bonus INT NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description_fr TEXT NOT NULL,
  badge_description_en TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Achievement Definitions
CREATE TABLE IF NOT EXISTS badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  description_fr TEXT NOT NULL,
  icon_url VARCHAR(255) NULL,
  requirement_type ENUM('workout_count', 'streak_days', 'calories_burned', 'meals_logged', 'pr_count', 'supplement_streak') NOT NULL,
  requirement_value INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. User Achievements
CREATE TABLE IF NOT EXISTS user_badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_badge (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Reference Table (Muscle Groups) -- Created before exercises to allow logical flow if needed
CREATE TABLE IF NOT EXISTS muscle_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  name_fr VARCHAR(50) NOT NULL,
  body_region ENUM('upper', 'lower', 'core', 'full_body') NOT NULL,
  icon_url VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. System Exercise Library
CREATE TABLE IF NOT EXISTS exercises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  description TEXT NULL,
  description_fr TEXT NULL,
  category ENUM('strength', 'cardio', 'flexibility', 'plyometric', 'sport'),
  muscle_group VARCHAR(100) NOT NULL,
  secondary_muscles JSON,
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  equipment_needed ENUM('none', 'dumbbell', 'barbell', 'machine', 'cable', 'kettlebell', 'band', 'bodyweight'),
  image_url VARCHAR(500) NULL,
  video_url VARCHAR(500) NULL,
  gif_url VARCHAR(500) NULL,
  default_sets INT DEFAULT 3,
  default_reps VARCHAR(20) DEFAULT '8-12',
  default_rest_seconds INT DEFAULT 90,
  calories_per_minute DECIMAL(4,1) NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_exercises_muscle_group (muscle_group),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Video & Form Cues
CREATE TABLE IF NOT EXISTS exercise_media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exercise_id INT UNIQUE NOT NULL,
  video_mp4_url VARCHAR(500) NULL,
  video_webm_url VARCHAR(500) NULL,
  video_duration_seconds DECIMAL(3,1) DEFAULT 5.0,
  poster_image_url VARCHAR(500) NOT NULL,
  form_cues JSON,
  form_cues_fr JSON,
  muscle_highlight_image VARCHAR(500) NULL,
  filmed_by VARCHAR(100) DEFAULT 'FitTrack Team',
  is_official BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. User Customizations
CREATE TABLE IF NOT EXISTS user_exercises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  custom_name VARCHAR(200) NULL,
  custom_notes TEXT NULL,
  personal_best_weight DECIMAL(6,2) DEFAULT 0,
  personal_best_reps INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  UNIQUE KEY unique_user_custom_exercise (user_id, exercise_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Generated AI Plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  description TEXT NULL,
  description_fr TEXT NULL,
  goal ENUM('lose_weight', 'gain_muscle', 'maintain', 'improve_endurance'),
  experience_level ENUM('beginner', 'intermediate', 'advanced'),
  split_type ENUM('full_body', 'upper_lower', 'push_pull_legs', 'bro_split', 'cardio'),
  workout_days_per_week INT NOT NULL,
  workout_duration_min INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Logged Workouts
CREATE TABLE IF NOT EXISTS workout_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_id INT NULL,
  exercise_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date TIMESTAMP NULL,
  duration_actual INT NULL,
  sets INT DEFAULT 0,
  reps VARCHAR(50) NULL,
  weight_kg DECIMAL(6,2) DEFAULT 0,
  calories_burned INT NULL,
  notes TEXT NULL,
  status ENUM('planned', 'completed', 'skipped', 'in_progress') DEFAULT 'planned',
  user_rating ENUM('easy', 'moderate', 'hard', 'too_hard') NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ws_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON DELETE SET NULL,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Reusable Plans
CREATE TABLE IF NOT EXISTS workout_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  category ENUM('push', 'pull', 'legs', 'upper', 'lower', 'full', 'cardio', 'custom'),
  exercises JSON NOT NULL,
  estimated_duration INT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. AI Predictions
CREATE TABLE IF NOT EXISTS workout_predictions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  predicted_date DATE NOT NULL,
  predicted_workout JSON NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0.00 AND 1.00),
  user_accepted BOOLEAN DEFAULT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_wp_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. AI Generated Text
CREATE TABLE IF NOT EXISTS workout_summaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workout_session_id INT UNIQUE NOT NULL,
  generated_text TEXT NOT NULL,
  generated_text_fr TEXT NOT NULL,
  highlights JSON NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workout_session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Nutrition Logging
CREATE TABLE IF NOT EXISTS meals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  meal_date DATE NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  food_name VARCHAR(200) NOT NULL,
  food_name_fr VARCHAR(200) NULL,
  calories INT NOT NULL CHECK (calories >= 0),
  protein_g DECIMAL(6,2) DEFAULT 0,
  carbs_g DECIMAL(6,2) DEFAULT 0,
  fat_g DECIMAL(6,2) DEFAULT 0,
  image_url VARCHAR(500) NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_meals_user_id (user_id),
  INDEX idx_meals_date (meal_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Recipe Database
CREATE TABLE IF NOT EXISTS recipes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  name_fr VARCHAR(200) NOT NULL,
  description TEXT NULL,
  description_fr TEXT NULL,
  calories INT NOT NULL,
  protein_g DECIMAL(6,2) NOT NULL,
  carbs_g DECIMAL(6,2) NOT NULL,
  fat_g DECIMAL(6,2) NOT NULL,
  prep_time_min INT NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard'),
  cuisine_type VARCHAR(50) NULL,
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack'),
  ingredients JSON NOT NULL,
  ingredients_fr JSON NOT NULL,
  instructions JSON NOT NULL,
  instructions_fr JSON NOT NULL,
  image_url VARCHAR(500) NULL,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. AI Recommendations
CREATE TABLE IF NOT EXISTS recipe_suggestions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  recipe_id INT NOT NULL,
  suggested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT NOT NULL,
  reason_fr TEXT NOT NULL,
  was_accepted BOOLEAN DEFAULT NULL,
  logged_meal_id INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (logged_meal_id) REFERENCES meals(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. User's Supplements
CREATE TABLE IF NOT EXISTS supplements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('protein', 'creatine', 'vitamin', 'mineral', 'preworkout', 'amino_acid', 'fish_oil', 'other'),
  dosage VARCHAR(50) NOT NULL,
  frequency ENUM('daily', 'workout_days', 'as_needed') NOT NULL,
  reminder_time TIME NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Daily Tracking (Supplements)
CREATE TABLE IF NOT EXISTS supplement_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplement_id INT NOT NULL,
  logged_date DATE NOT NULL,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  quantity VARCHAR(50) NULL,
  notes TEXT NULL,
  UNIQUE KEY unique_supp_log (supplement_id, logged_date),
  FOREIGN KEY (supplement_id) REFERENCES supplements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Body Measurements
CREATE TABLE IF NOT EXISTS progress_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  log_date DATE NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  body_fat_percent DECIMAL(5,2) NULL,
  chest_cm INT NULL,
  waist_cm INT NULL,
  arms_cm INT NULL,
  thighs_cm INT NULL,
  notes TEXT NULL,
  INDEX idx_pl_user_id (user_id),
  INDEX idx_pl_date (log_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Recovery Tracking
CREATE TABLE IF NOT EXISTS training_load (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  week_start DATE NOT NULL,
  total_volume INT DEFAULT 0,
  workout_count INT DEFAULT 0,
  avg_intensity DECIMAL(4,2) DEFAULT 0,
  fatigue_score INT GENERATED ALWAYS AS (CASE WHEN total_volume > 10000 THEN 8 ELSE 5 END) STORED, -- Note: Real calculation done in app layer, generated column simplified for schema.
  deload_recommended BOOLEAN GENERATED ALWAYS AS (fatigue_score >= 8) STORED,
  UNIQUE KEY unique_training_load (user_id, week_start),
  INDEX idx_tl_user_id (user_id),
  INDEX idx_tl_date (week_start),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. System Messages
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('reminder', 'motivation', 'achievement', 'coach_message', 'deload_warning', 'streak_risk') NOT NULL,
  title VARCHAR(200) NOT NULL,
  title_fr VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  message_fr TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Weekly Digest Scheduler
CREATE TABLE IF NOT EXISTS email_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email_type ENUM('weekly_summary', 'milestone', 'reminder') NOT NULL,
  scheduled_for DATETIME NOT NULL,
  sent_at TIMESTAMP NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  content JSON NOT NULL,
  error_message TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
