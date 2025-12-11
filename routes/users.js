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
    res.render('login.ejs'); 
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
})
module.exports = router