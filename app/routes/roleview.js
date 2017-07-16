// Load isLoggedIn-Middleware
var isLoggedIn = require('../middleware/isLoggedIn');

// =====================================
// ROLEVIEW ============================
// =====================================
module.exports = function (app, passport, connection) {
    // show the admin config
    app.get('/roleview', isLoggedIn, function (req, res) {
        if (typeof req.query.role != 'undefined') {
            connection.query('SELECT * from sq_role where role_title = ?', req.query.role, function (err, rolerows) {
                connection.query('SELECT * from sq_user', function (err, userrows) {
                    connection.query('SELECT * FROM sq_events left join sq_event_details on sq_events.event_id = sq_event_details.event_id AND sq_events.event_max_version = sq_event_details.event_version WHERE sq_events.event_id IN (SELECT event_id FROM sq_riders)', function (err, eventrows) {
                        connection.query('SELECT * FROM sq_riders', function (err, riderrows) {
                            connection.query('SELECT * FROM sq_map_riders_to_roles where (event_id, role_id, version) in (select event_id, role_id, max(version) from sq_map_riders_to_roles where role_id = ? group by event_id) AND role_id = ?', [rolerows[0].role_id, rolerows[0].role_id], function (err, riderrolesrows) {
                                res.render('roleview.ejs', {
                                    riderroles: riderrolesrows,
                                    riders: riderrows,
                                    nav: 'role' + req.query.role,
                                    user: req.user,
                                    users: userrows,
                                    events: eventrows,
                                    role: rolerows[0]
                                });
                            });
                        });
                    });
                });
            });
        } else {
            res.redirect('/home');
        }
    });
};
