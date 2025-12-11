const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) { 
      res.redirect('./login') 
    } else { 
        next (); 
    } 
}

router.get('/', (req, res) => {
    db.query('SELECT COUNT(*) AS total_records FROM workouts', (err, results) => {
        const count = results ? results[0].total_records : 'N/A';
        res.render('home', {
            title: 'Health & Fitness Tracker Home',
            recordCount: count
        });
    });
});

router.get('/login', function (req, res, next) {
    res.render('login.ejs', {
        title: 'User Login' // Define the title variable here
    }); 
});

function logLoginAttempt(username, success, callback) {
    const sqlquery = "INSERT INTO login_attempts (username, success) VALUES (?, ?)";
    db.query(sqlquery, [username, success], callback);
}

router.post('/loggedin', function (req, res, next) {
    const { username, password } = req.body;

    const sqlquery = "SELECT id, password_hash FROM users WHERE username = ?";
    
    db.query(sqlquery, [username], (err, results) => {
        if (err) return next(err);

        // Case 1: User NOT Found (Immediate Failure)
        if (results.length === 0) {
            logLoginAttempt(username, false, (logErr) => {
                if (logErr) console.error('Audit log failed:', logErr);
                res.send(`<h1>Login Failed</h1><p>User **${username}** not found.</p>`);
            });
            return;
        }

        const userDbId = results[0].id; // <<< Get the database ID
        const storedpassword_hash = results[0].password_hash;

        // 2. Compare the password
        bcrypt.compare(password, storedpassword_hash, (compareErr, isMatch) => {
            if (compareErr) return next(compareErr);

            let successStatus = isMatch;

            if (successStatus) {
                req.session.userId = userDbId; // Store the database ID
                req.session.username = username; // Store the username
            }

            // 3. Log the audit attempt
            logLoginAttempt(username, successStatus, (logErr) => {
                if (logErr) console.error('Audit log failed:', logErr);
                
                // 4. Send the final response
                if (successStatus) {
                    res.send(`<h1>Login Successful!</h1><p>Welcome back, **${username}**.</p> <a href="/">Home</a>`);
                } else {
                    res.send(`<h1>Login Failed</h1><p>Incorrect password for user **${username}**.</p>`);
                }
            });
        });
    });
});

router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
        return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    })
});

router.get('/audit',redirectLogin, function(req, res, next) {
    // Select all fields from the audit table, ordered by time (most recent first)
    const sqlquery = "SELECT username, attemptTime, success FROM login_attempts ORDER BY attemptTime DESC";
    
    db.query(sqlquery, (err, attempts) => {
        if (err) {
            console.error('Database error in /users/audit:', err);
            return next(err);
        }
        
        // Render the new view/template page, passing the list of attempts
        res.render("audit.ejs", { attempts: attempts });
    });
});

router.get('/register', function (req, res, next) {
    res.render('register.ejs', { title: 'Register for Health & Fitness Tracker' })
})

// Ensure you have imported 'bcrypt' and 'express-validator' (check, validationResult)

router.post('/registered',
    // 1. Validation and Sanitization Middleware Array
    [
        check('email').isEmail().withMessage('Invalid email address.').normalizeEmail(), 
        
        check('username')
            .isLength({ min: 5, max: 20}).withMessage('Username must be 5 to 20 characters.')
            .trim().escape(), 
            
        check('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must include uppercase, lowercase, number, and symbol.'),
    ],
    // 2. Main Route Handler
    function (req, res, next) {
        const errors = validationResult(req);
        
        // --- A. Handle Validation Errors ---
        if (!errors.isEmpty()) {
            console.log('Validation failed:', errors.array());
            
            // Pass the errors and title back to the register page for display
            return res.render('./register', { 
                title: 'Registration', 
                errors: errors.array()
            }); 
        }

        // --- B. Execute Registration Logic ---
        else { 
            const saltRounds = 10;
            const plainPassword = req.body.password;
            
            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                if (err) {
                    console.error('Password hashing failed:', err);
                    return next(err);
                }

                // 3. Store the user in the database.
                // SQL is updated to only include the columns that exist: 
                // username, email, and password_hash
                const sqlquery = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
                
                const userDetails = [
                    req.body.username,
                    req.body.email, 
                    hashedPassword
                ];
                
                db.query(sqlquery, userDetails, (dbError, result) => {
                    if (dbError) {
                        console.error('Database insertion error:', dbError);
                        
                        // Check for duplicate entry error (username or email already exists)
                        if (dbError.code === 'ER_DUP_ENTRY') {
                            // Render the register page with an error message
                            return res.render('./register', {
                                title: 'Registration Failed',
                                customError: 'Username or email already exists. Please choose another.'
                            });
                        }
                        return next(dbError); 
                    }
                    
                    // 4. Success Response: Redirect to login page
                    return res.redirect('./login'); 
                });
            });
        }
    }
);

router.get('/list', redirectLogin, function(req, res, next) {
    // 💡 IMPORTANT: Explicitly select the columns you need, 
    // omitting the sensitive 'hashedPassword' column.
    let sqlquery = "SELECT id, username, email FROM users";
    
    // Execute the SQL query
    db.query(sqlquery, (err, users) => {
        if (err) {
            console.error('Database error in /list:', err);
            // Pass the error to the Express error handler
            return next(err);
        }

        res.render("users_list", { users: users });
    });
});
module.exports = router