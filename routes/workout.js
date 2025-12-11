const express = require("express")
const router = express.Router()

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) { 
      res.redirect('./login') 
    } else { 
        next (); 
    } 
}

// Display Individual User's Workouts
router.get('/workout', redirectLogin, (req, res) => {
    // 1. Get the user ID from the session
    const current_user_id = req.session.userId; 

    //Check if the id exists before querying
    if (!current_user_id) {
        return res.status(401).send("User ID not found in session. Please log in again.");
    }
    
    // 2. Modify the SQL query 
    const sql = `
        SELECT w.activity_name, w.duration_minutes, w.calories_burned, w.workout_date
        FROM workouts w
        WHERE w.user_id = ?  
        
        ORDER BY w.workout_date DESC, w.id DESC
    `;

    // 3. Pass the user id as a parameter to the query
    db.query(sql, [current_user_id], (err, rows) => { 
        if (err) {
            console.error('Error fetching workouts:', err);
            return res.status(500).send("Error loading workout data.");
        }
        res.render('workout', { 
            title: 'Your Logged Workouts', 
            workouts: rows 
        });
    });
});

// 1. GET /workout-log (Display the data entry form)
router.get('/workout-log', redirectLogin, (req, res) => {
    // Pass the username from the session into the data object
    res.render('log_workout', { 
        title: 'Log a New Workout',
        error: null, 
        currentUsername: req.session.username
    });
});

// 2. POST /workout-log (Handle form submission and database insert)
router.post('/workout-log', redirectLogin, (req, res) => {
    const { activity, duration, calories } = req.body;
    
    // Get the user_id securely from the active session
    const user_id = req.session.userId; 

    // Input validation
    if (!activity || !duration || !calories) {
        return res.render('log_workout', { 
            title: 'Log a New Workout', 
            error: 'All fields are required.' ,
            currentUsername: req.session.username
        });
    }

    const sql = `
        INSERT INTO workouts 
        (user_id, activity_name, duration_minutes, calories_burned) 
        VALUES (?, ?, ?, ?)
    `;
    
    // Use prepared statements to prevent SQL injection
    db.query(sql, [user_id, activity, duration, calories], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            // Re-render the form with a specific error message
            return res.render('log_workout', { 
                title: 'Log a New Workout', 
                error: 'Database error occurred while logging workout.' ,
                currentUsername: req.session.username
            });
        }
        
        // Success
        res.redirect('/');
    });
});
module.exports = router