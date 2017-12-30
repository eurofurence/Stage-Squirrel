var creatorGuard = require('../middleware/guard/creator');
var isLoggedIn = require('../middleware/isLoggedIn');

// =====================================
// MY SURVEYS ==========================
// =====================================
module.exports = function(app, passport, connection) {
    // show the admin config
    app.get('/surveys', isLoggedIn, creatorGuard, function(req, res) {
        connection.query('SELECT * FROM sq_events left join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id IN (SELECT DISTINCT event_id FROM sq_event_details WHERE creator_id = ?) AND sq_events.event_max_version = sq_event_details.event_version;', req.user.user_id, function(err, eventrows) {
            connection.query('SELECT * FROM sq_riders', function(err, riderrows) {
                res.render('surveys.ejs', {
                    nav: 'surveys',
                    user: req.user,
                    events: eventrows,
                    riders: riderrows
                });
            });
        });
    });
};