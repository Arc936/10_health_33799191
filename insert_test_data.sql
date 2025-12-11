-- insert_test_data.sql
-- Password: 'smiths' (for example, assuming it is plain text for the marker)
USE health;

INSERT INTO users (username, password_hash, email ) VALUES ('gold','$2b$10$5tu9sR.m0O4HwwiU0p64yueb7IRgfc7gHMkixy0dm7PWWsFUbSa5C','placeholder@gmail.com');


-- Insert some test workout data
INSERT INTO workouts (user_id, activity_name, duration_minutes, calories_burned)
VALUES 
(1, 'Running', 30, 350),
(1, 'Swimming', 60, 600),
(1, 'Weight Lifting', 45, 250);

INSERT INTO excersize (type_name, category, base_calorie_rate_per_min, description)
VALUES 
('Running', 'Cardio', 10.0, 'Continuous motion for cardiovascular health.'),
('Weightlifting', 'Strength', 5.5, 'Resistance training to build muscle mass.'),
('Cycling', 'Cardio', 8.5, 'Pedaling exercise, indoors or outdoors.'),
('Yoga', 'Flexibility', 3.0, 'Body control and stretching exercises.');

INSERT INTO excersize (type_name, category, base_calorie_rate_per_min, description)
VALUES 
-- Additional Cardio
('Swimming', 'Cardio', 9.0, 'Full-body, low-impact aquatic exercise.'),
('Elliptical', 'Cardio', 7.5, 'Stationary exercise mimicking running motion.'),
('Rowing', 'Cardio', 11.0, 'Intense full-body workout using a rowing machine.'),
('Jump Rope', 'Cardio', 12.0, 'High-impact rhythmic jumping exercise.'),

-- Additional Strength & Resistance
('Bodyweight Training', 'Strength', 4.5, 'Using the body’s own weight for resistance (e.g., Push-ups, Squats).'),
('Plyometrics', 'Strength', 8.0, 'Jumping and explosive movements for power and strength.'),
('Kettlebell Swing', 'Strength', 10.5, 'Dynamic, full-body exercise using a kettlebell.'),
('Machine Circuit', 'Strength', 6.0, 'Quick rotation through various gym machines.'),

-- Additional Flexibility & Low-Impact
('Pilates', 'Flexibility', 3.5, 'Focuses on core strength, posture, and body awareness.'),
('Stretching (Static)', 'Flexibility', 1.5, 'Holding positions to increase muscle length and range of motion.'),
('Tai Chi', 'Flexibility', 2.0, 'Gentle series of movements and postures.'),

-- Hybrid & Sport
('Hiking', 'Hybrid', 5.0, 'Walking outdoors, often on trails with elevation changes.'),
('HIIT', 'Hybrid', 13.0, 'High-Intensity Interval Training: alternating max effort with short recovery.'),
('Boxing/Kickboxing', 'Sport', 9.5, 'Full-body combat sport movements.'),
('Team Sports (General)', 'Sport', 6.5, 'Participation in organized group sports like basketball or soccer.'),
('Functional Training', 'Hybrid', 7.0, 'Exercises that mimic real-life movements.');



CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON health_app.* TO 'health_app'@'localhost';