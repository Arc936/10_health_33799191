const express = require("express")
const router = express.Router()

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) { 
      res.redirect('/login') 
    } else { 
        next (); 
    } 
}

router.get('/chart', redirectLogin, (req, res) => {
    const current_user_id = req.session.userId;
    
    // SQL to fetch weight and date, ordered chronologically
    const sql = `
        SELECT measurement_date, weight_kg 
        FROM body_metrics
        WHERE user_id = ?
        ORDER BY measurement_date ASC
    `;

    db.query(sql, [current_user_id], (err, rows) => {
        if (err) {
            console.error('Error fetching body metrics:', err);
            return res.status(500).send("Error loading progress data.");
        }

        // Prepare data for Chart.js
        const chartLabels = rows.map(row => row.measurement_date.toISOString().split('T')[0]);
        const chartData = rows.map(row => row.weight_kg);

        res.render('progress_chart', { 
            title: 'Your Weight Progress',
            labels: JSON.stringify(chartLabels), // Pass arrays as JSON strings
            data: JSON.stringify(chartData),
            recordCount: rows.length
        });
    });
});
module.exports = router