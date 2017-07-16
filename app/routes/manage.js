// Load isLoggedIn-Middleware
var isLoggedIn = require('../middleware/isLoggedIn');

// =====================================
// MANAGE EVENTS =======================
// =====================================
module.exports = function (app, passport, connection) {
    // show the admin config
    app.get('/manage', isLoggedIn, function (req, res) {
        if (req.user.isManager) {
            connection.query('SELECT * from sq_role where role_is_active = 1', function (err, rolerows) {
                connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function (err, userrows) {
                    connection.query('SELECT * FROM sq_events left join sq_event_details on sq_events.event_id = sq_event_details.event_id AND sq_events.event_max_version = sq_event_details.event_version', function (err, eventrows) {
                        connection.query('SELECT * FROM sq_riders', function (err, riderrows) {
                            connection.query('SELECT *, max(version) FROM stagesquirrel.sq_map_riders_to_roles group by event_id, role_id', function (err, riderrolesrows) {
                                res.render('manage.ejs', {
                                    riderroles: riderrolesrows,
                                    riders: riderrows,
                                    nav: 'manage',
                                    user: req.user,
                                    users: userrows,
                                    events: eventrows,
                                    roles: rolerows
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

    // show the admin config
    app.post('/manage', isLoggedIn, function (req, res) {
        if (req.user.isManager) {
            // Dunno why, but this is empty
        } else {
            res.redirect('/home');
        }
    });
};
