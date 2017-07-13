// =====================================
// HOME ================================
// =====================================
module.exports = function (app, passport, connection) {
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/home', isLoggedIn, function(req, res) {
        connection.query('SELECT * FROM sq_events LEFT JOIN sq_event_details ON sq_events.event_id = sq_event_details.event_id', function (err, eventrows) {
            connection.query('SELECT * from sq_user', function (err, userrows) {
                connection.query('SELECT * FROM sq_stage', function (err, stagerows) {
                    connection.query('SELECT * from sq_role', function (err, rolerows) {
                        connection.query('SELECT * from sq_notifications where convention_id = ? order by created_on desc limit 20', req.user.currentConvention.convention_id, function (err, notificationrows) {
                            res.render('home.ejs', {
                                notifications: notificationrows,
                                events: eventrows,
                                users: userrows,
                                stages: stagerows,
                                roles: rolerows,
                                nav: 'home',
                                user : req.user // get the user out of session and pass to template
                            });
                        });
                    });
                });
            });
        });
    });
}
