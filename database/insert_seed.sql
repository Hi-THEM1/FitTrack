-- FitTrack Seed Data
-- 20 Exercises with French and English names, plus gamification configs
USE fittrack_db;

-- 1. Reward Tiers
INSERT IGNORE INTO reward_tiers (streak_day, xp_bonus, badge_name, badge_description_fr, badge_description_en) VALUES
(1, 10, 'Premier Pas', 'Votre première connexion!', 'Your first login!'),
(2, 15, 'De Retour', 'Vous revenez pour plus!', 'Back for more!'),
(3, 20, 'Habitude', 'Ça devient une routine!', 'Becoming a habit!'),
(4, 25, 'Engagé', 'Vous êtes sérieux!', 'You are committed!'),
(5, 30, 'Dévoué', 'La discipline paie!', 'Discipline pays off!'),
(6, 40, 'Inarrêtable', 'Rien ne vous arrête!', 'Nothing stops you!'),
(7, 100, 'Guerrier de la Semaine', 'Une semaine complète!', 'Full week warrior!');

-- 2. Muscle Groups
INSERT IGNORE INTO muscle_groups (id, name, name_fr, body_region, icon_url) VALUES
(1, 'chest', 'pectoraux', 'upper', NULL),
(2, 'back', 'dos', 'upper', NULL),
(3, 'shoulders', 'epaules', 'upper', NULL),
(4, 'biceps', 'biceps', 'upper', NULL),
(5, 'triceps', 'triceps', 'upper', NULL),
(6, 'quadriceps', 'quadriceps', 'lower', NULL),
(7, 'hamstrings', 'ischio-jambiers', 'lower', NULL),
(8, 'glutes', 'fessiers', 'lower', NULL),
(9, 'calves', 'mollets', 'lower', NULL),
(10, 'core', 'abdominaux', 'core', NULL),
(11, 'full_body', 'corps_entier', 'full_body', NULL);

-- 3. Exercises (20 items)
INSERT IGNORE INTO exercises (id, name, name_fr, category, muscle_group, secondary_muscles, difficulty, equipment_needed) VALUES
(1, 'Barbell Bench Press', 'Développé Couché Barre', 'strength', 'chest', '["triceps", "shoulders"]', 'intermediate', 'barbell'),
(2, 'Dumbbell Bench Press', 'Développé Couché Haltères', 'strength', 'chest', '["triceps", "shoulders"]', 'beginner', 'dumbbell'),
(3, 'Push-up', 'Pompes', 'strength', 'chest', '["triceps", "shoulders", "core"]', 'beginner', 'bodyweight'),
(4, 'Barbell Squat', 'Squat Barre', 'strength', 'quadriceps', '["glutes", "hamstrings", "core"]', 'intermediate', 'barbell'),
(5, 'Leg Press', 'Presse à Cuisses', 'strength', 'quadriceps', '["glutes", "calves"]', 'beginner', 'machine'),
(6, 'Romanian Deadlift', 'Soulevé de Terre Roumain', 'strength', 'hamstrings', '["glutes", "back"]', 'intermediate', 'barbell'),
(7, 'Pull-up', 'Tractions', 'strength', 'back', '["biceps", "core"]', 'intermediate', 'bodyweight'),
(8, 'Lat Pulldown', 'Tirage Poitrine', 'strength', 'back', '["biceps"]', 'beginner', 'machine'),
(9, 'Barbell Row', 'Tirage Buste Penché Barre', 'strength', 'back', '["biceps", "core"]', 'intermediate', 'barbell'),
(10, 'Overhead Press', 'Développé Militaire', 'strength', 'shoulders', '["triceps", "core"]', 'intermediate', 'barbell'),
(11, 'Lateral Raise', 'Élévations Latérales', 'strength', 'shoulders', '[]', 'beginner', 'dumbbell'),
(12, 'Bicep Curl', 'Curl Biceps Haltères', 'strength', 'biceps', '[]', 'beginner', 'dumbbell'),
(13, 'Tricep Extension', 'Extension Triceps Poulie', 'strength', 'triceps', '[]', 'beginner', 'cable'),
(14, 'Walking Lunges', 'Fentes Marchées', 'strength', 'quadriceps', '["glutes", "core"]', 'beginner', 'dumbbell'),
(15, 'Plank', 'Planche', 'strength', 'core', '["shoulders"]', 'beginner', 'bodyweight'),
(16, 'Crunch', 'Crunch', 'strength', 'core', '[]', 'beginner', 'bodyweight'),
(17, 'Deadlift', 'Soulevé de Terre', 'strength', 'back', '["hamstrings", "glutes", "core"]', 'advanced', 'barbell'),
(18, 'Leg Extension', 'Leg Extension', 'strength', 'quadriceps', '[]', 'beginner', 'machine'),
(19, 'Leg Curl', 'Leg Curl', 'strength', 'hamstrings', '[]', 'beginner', 'machine'),
(20, 'Calf Raise', 'Extensions Mollets', 'strength', 'calves', '[]', 'beginner', 'machine');

-- 4. Exercise Media (associated to the 20 exercises)
INSERT IGNORE INTO exercise_media (exercise_id, poster_image_url, form_cues, form_cues_fr) VALUES
(1, '/images/exercises/bench_press.jpg', '["Keep feet flat", "Retract shoulder blades"]', '["Gardez les pieds plats", "Rentrez les omoplates"]'),
(2, '/images/exercises/db_bench.jpg', '["Don''t flare elbows", "Full range of motion"]', '["N''écartez pas trop les coudes", "Amplitude complète"]'),
(3, '/images/exercises/pushup.jpg', '["Keep body straight", "Core tight"]', '["Gardez le corps droit", "Gainez les abdos"]'),
(4, '/images/exercises/squat.jpg', '["Chest up", "Drive through heels"]', '["Poitrine sortie", "Poussez sur les talons"]'),
(5, '/images/exercises/leg_press.jpg', '["Don''t lock knees", "Controlled descent"]', '["Ne verrouillez pas les genoux", "Descente contrôlée"]'),
(6, '/images/exercises/rdl.jpg', '["Keep back straight", "Hinge at hips"]', '["Gardez le dos droit", "Pliez au niveau des hanches"]'),
(7, '/images/exercises/pullup.jpg', '["Pull chest to bar", "Control descent"]', '["Tirez la poitrine vers la barre", "Contrôlez la descente"]'),
(8, '/images/exercises/lat_pulldown.jpg', '["Don''t lean back too far", "Pull with lats"]', '["Ne vous penchez pas trop en arrière", "Tirez avec les dorsaux"]'),
(9, '/images/exercises/bb_row.jpg', '["Keep back flat", "Pull to stomach"]', '["Gardez le dos plat", "Tirez vers le ventre"]'),
(10, '/images/exercises/ohp.jpg', '["Core tight", "Don''t overextend back"]', '["Gainez", "Ne cambrez pas trop le dos"]'),
(11, '/images/exercises/lat_raise.jpg', '["Slight bend in elbows", "Pour the pitcher"]', '["Légère flexion des coudes", "Versez la cruche"]'),
(12, '/images/exercises/bicep_curl.jpg', '["Keep elbows fixed", "Don''t swing"]', '["Gardez les coudes fixes", "Ne balancez pas"]'),
(13, '/images/exercises/tricep_ext.jpg', '["Elbows pinned to sides", "Full extension"]', '["Coudes collés au corps", "Extension complète"]'),
(14, '/images/exercises/lunges.jpg', '["Keep torso upright", "Don''t let knee pass toe"]', '["Gardez le torse droit", "Le genou ne doit pas dépasser le pied"]'),
(15, '/images/exercises/plank.jpg', '["Straight line from head to heels", "Breathe"]', '["Ligne droite de la tête aux talons", "Respirez"]'),
(16, '/images/exercises/crunch.jpg', '["Don''t pull neck", "Squeeze abs"]', '["Ne tirez pas sur le cou", "Contractez les abdos"]'),
(17, '/images/exercises/deadlift.jpg', '["Keep bar close to legs", "Neutral spine"]', '["Gardez la barre près des jambes", "Colonne neutre"]'),
(18, '/images/exercises/leg_ext.jpg', '["Squeeze at top", "Control weight"]', '["Contractez en haut", "Contrôlez le poids"]'),
(19, '/images/exercises/leg_curl.jpg', '["Don''t lift hips", "Full stretch"]', '["Ne levez pas les hanches", "Étirement complet"]'),
(20, '/images/exercises/calf_raise.jpg', '["Full stretch at bottom", "Squeeze at top"]', '["Étirement complet en bas", "Contractez en haut"]');

-- 5. Demo Admin User (password is 'password123' using bcrypt)
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
('demo@fittrack.com', '$2b$12$R.O5A.N61h/x839u1wS2/.L81X216A6O.8L/GqB5e/34kI1gPzWjW', 'Demo', 'User', 'admin', 1, 1);
