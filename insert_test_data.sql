-- insert_test_data.sql
-- Password: 'smiths' (for example, assuming it is plain text for the marker)

INSERT INTO users (username, password_hash, email ) VALUES ('gold','$2b$10$5tu9sR.m0O4HwwiU0p64yueb7IRgfc7gHMkixy0dm7PWWsFUbSa5C','placeholder@gmail.com');


-- Insert some test workout data
INSERT INTO workouts (user_id, activity_name, duration_minutes, calories_burned)
VALUES 
(1, 'Running', 30, 350),
(1, 'Swimming', 60, 600),
(1, 'Weight Lifting', 45, 250);

CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON health_app.* TO 'health_app'@'localhost';