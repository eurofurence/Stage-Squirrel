var isLoggedIn = require('../middleware/isLoggedIn');
var managerGuard = require('../middleware/guard/manager');

// =====================================
// MANAGE EVENTS =======================
// =====================================
module.exports = function(app, passport, connection) {
    app.get('/manage', isLoggedIn, managerGuard, function(req, res) {
        connection.query('SELECT * from sq_role where role_is_active = 1', function(err, rolerows) {
            connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function(err, userrows) {
                connection.query('SELECT * FROM sq_events left join sq_event_details on sq_events.event_id = sq_event_details.event_id AND sq_events.event_max_version = sq_event_details.event_version', function(err, eventrows) {
                    connection.query('SELECT * FROM sq_riders', function(err, riderrows) {
                        connection.query('SELECT *, max(version) FROM stagesquirrel.sq_map_riders_to_roles group by event_id, role_id', function(err, riderrolesrows) {
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
    });
};