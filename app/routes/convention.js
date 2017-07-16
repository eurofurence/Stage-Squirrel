// Load isLoggedIn-Middleware
var isLoggedIn = require('../middleware/isLoggedIn');

// =====================================
// MANAGE CONVENTIONS ==================
// =====================================
module.exports = function (app, passport, connection) {
    // show the admin config
    app.get('/convention', isLoggedIn, function (req, res) {
        if (req.user.isManager) {
            connection.query('SELECT * from sq_conventions order by date_from ASC', function (err, conventionrows) {
                connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function (err, userrows) {
                    connection.query('SELECT * from sq_events order by event_created DESC', function (err, eventrows) {
                        connection.query('SELECT * from sq_form_templates order by template_created DESC', function (err, templaterows) {
                            connection.query('SELECT * FROM sq_map_convention_to_stage', function (err, mapstagerows) {
                                connection.query('SELECT * FROM sq_stage', function (err, stagerows) {
                                    res.render('convention.ejs', {
                                        nav: 'convention',
                                        user: req.user,
                                        users: userrows,
                                        conventions: conventionrows,
                                        templates: templaterows,
                                        events: eventrows,
                                        stages: stagerows,
                                        mapstages: mapstagerows
                                    });
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


    app.post('/convention', isLoggedIn, function (req, res) {
        if (req.user.isManager) {
            console.log(req.body);
            if (req.body.actionType == "create") {
                var params = [req.body.convention_template, req.body.convention_name, req.body.convention_desc, new Date(req.body.start), new Date(req.body.end)];
                if (req.body.convention_id == 0) {
                    connection.query("INSERT INTO sq_conventions (template_id, convention_name, convention_description, date_from, date_to) VALUES (?, ?, ?, ?, ?)", params, function (err, state) {
                        if (err) {
                            console.log(err);
                        }
                        for (stage_id of req.body.convention_stage) {
                            connection.query("INSERT INTO sq_map_convention_to_stage (convention_id, stage_id) VALUES ('" + req.body.convention_id + "', '" + stage_id + "')", function (err, state) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                } else {
                    connection.query("UPDATE sq_conventions SET template_id = ?, convention_name = ?, convention_description = ?, date_from = ?, date_to = ? WHERE `convention_id` = '" + req.body.convention_id + "'", params, function (err, state) {
                        if (err) {
                            console.log(err);
                        }
                        connection.query("DELETE FROM sq_map_convention_to_stage WHERE `convention_id` = '" + req.body.convention_id + "'", function (err, state) {
                            if (err) {
                                console.log(err);
                            }
                            for (stage_id of req.body.convention_stage) {
                                connection.query("INSERT INTO sq_map_convention_to_stage (convention_id, stage_id) VALUES ('" + req.body.convention_id + "', '" + stage_id + "')", function (err, state) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            }
                        });
                    });
                }
            } else if (req.body.actionType == "delete") {
                connection.query("SELECT count(*) AS qty from sq_events WHERE convention_id = '" + req.body.convention_id + "'", function (err, events) {
                    if (events[0].qty == 0) {
                        connection.query("DELETE FROM sq_conventions WHERE `convention_id` = '" + req.body.convention_id + "'", function (err, state) {
                            if (err) {
                                console.log(err);
                            }
                            connection.query("DELETE FROM sq_map_convention_to_stage WHERE `convention_id` = '" + req.body.convention_id + "'", function (err, state) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    }
                });
            }
            res.redirect('/convention');
        } else {
            res.redirect('/home');
        }
    });
};
