// index.js

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2'); // <<< Import mysql2 directly here
const session = require('express-session');
require('dotenv').config(); // <<< Load environment variables

// --- DATABASE CONNECTION SETUP ---
const connection = mysql.createConnection({
    // Get credentials from .env
    host: process.env.HEALTH_HOST,
    user: process.env.HEALTH_USER,
    password: process.env.HEALTH_PASSWORD,
    database: process.env.HEALTH_DATABASE
});

connection.connect(err => {
    if (err) {
        // If connection fails, log error and exit/prevent server start
        console.error('Error connecting to MySQL:', err.stack);
        // In a real scenario, you might want to stop the server here
        return; 
    }
    console.log(' Connected to MySQL as id ' + connection.threadId);
});
global.db = connection;

const db = connection; 



// Configuration
const APP_PORT = process.env.APP_PORT || 8000;
const app = express();

// Middleware Setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // For CSS/JS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))

// --- ROUTES ---

const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

const workoutRoutes = require("./routes/workout")
app.use('/', workoutRoutes)

const userRoutes = require("./routes/users")
app.use('/', userRoutes)

const apiRoutes = require("./routes/api")
app.use('/api', apiRoutes)

// In index.js


// 2. About Page
app.get('/about', (req, res) => {
    res.render('about', { title: 'About Our App' });
});

app.get('/search', (req, res) => {
    // Get the search term from the query parameter 'q'
    const query = req.query.q || '';
    
    // Base SQL: Select all relevant columns from the exercise types table
    let sql = `SELECT id, type_name, category, base_calorie_rate_per_min, description FROM excersize`;
    
    let queryParams = [];

    // Check if a specific search term was provided
    if (query) {
        // Append a WHERE clause to filter results by name or category
        sql += ` WHERE type_name LIKE ? OR category LIKE ?`;
        
        // Add the search term as parameters for filtering (using wildcards)
        queryParams = [`%${query}%`, `%${query}%`];
    }
    
    // Optional: Add sorting
    sql += ` ORDER BY type_name ASC`;

    // Execute the final query
    db.query(sql, queryParams, (err, rows) => {
        if (err) {
            console.error('Search Error:', err);
            // Handle error gracefully
            return res.status(500).send("Error loading exercise data.");
        }
        
        // Send the results to the EJS template
        res.render('search', { 
            title: 'Search Exercise Library', 
            query: query, 
            results: rows 
        });
    });
});


// Start Server
app.listen(APP_PORT, () => {
    console.log(`✅ App running at http://localhost:${APP_PORT}`);
});