CREATE DATABASE IF NOT EXISTS health;

USE health;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_name VARCHAR(100) NOT NULL,
    duration_minutes INT NOT NULL,
    calories_burned INT,
    workout_date DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS login_attempts (
    attemptId INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    attemptTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    PRIMARY KEY (attemptId)
);

CREATE TABLE IF NOT EXISTS excersize ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL UNIQUE, 
    category VARCHAR(50) NOT NULL,  
    base_calorie_rate_per_min DECIMAL(5, 2), 
    description TEXT
);