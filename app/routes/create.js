// Load isLoggedIn-Middleware
var isLoggedIn = require('../middleware/isLoggedIn');

// =====================================
// CREATE ==============================
// =====================================
module.exports = function (app, passport, connection, notifier) {
    // show the admin config
    app.get('/create', isLoggedIn, function(req, res) {
        console.log("get id:" + req.query.id);
        console.log("get version:" + req.query.version);
        if (req.user.isCreator) {
            connection.query('SELECT * from sq_configuration', function (err, cfgrows) {
                connection.query('SELECT * from sq_form_elements where template_id = (SELECT template_id FROM sq_conventions WHERE convention_id = ?);', req.user.currentConvention.convention_id, function (err, elementrows) {
                    connection.query('SELECT * from sq_role where role_is_admin = 0 and role_is_manager = 0 and role_is_default = 0 and role_is_active = 1', function (err, rolesrows) {
                        connection.query('SELECT * from sq_conventions where convention_id = ?', req.user.currentConvention.convention_id, function (err, conventionrows) {
                            connection.query('SELECT sq_stage.stage_id, sq_stage.stage_name, sq_stage.stage_description FROM sq_map_convention_to_stage join sq_stage on sq_map_convention_to_stage.stage_id = sq_stage.stage_id WHERE convention_id = ?', req.user.currentConvention.convention_id, function (err, stagerows) {
                                connection.query('SELECT * from sq_events where event_id = ?', req.query.id, function (err, eventrows) {
                                    console.log("-----");
                                    console.log(eventrows);

                                    var version = 1;
                                    if (eventrows != null) {
                                        version = eventrows[0].event_max_version;
                                        if (typeof req.query.version != 'undefined' &&
                                            req.query.version > 0 &&
                                            req.query.version <= eventrows[0].event_max_version
                                        ) {
                                            version = req.query.version;
                                        }
                                    }
                                    console.log("Shall load version " + version);
                                    console.log(eventrows != null);
                                    console.log(typeof req.query.version);
                                    connection.query('SELECT * from sq_event_details where event_id = ' + req.query.id + ' AND event_version = ?', version, function (err, eventdetailrows) {
                                        connection.query('SELECT * from sq_event_customs where event_id = ? AND version = ?', [req.query.id, version], function (err, customrows) {
                                            connection.query('SELECT creator_id from sq_event_details where event_id = ? AND event_version = 1', req.query.id, function (err, creatorresult) {
                                                connection.query('SELECT * FROM sq_user join sq_map_user_to_role on sq_user.user_id = sq_map_user_to_role.user_id join sq_role on sq_map_user_to_role.role_id = sq_role.role_id where sq_role.role_is_creator = 1 and sq_user.user_active = 1 GROUP BY sq_user.user_id', function (err, managerrows) {
                                                    if (typeof eventrows == 'undefined' ||
                                                        creatorresult[0].creator_id == req.user.user_id ||
                                                        req.user.isManager
                                                    ) {
                                                        res.render('create.ejs', {
                                                            nav: 'create',
                                                            user: req.user,
                                                            stages: stagerows,
                                                            elements: elementrows,
                                                            roles: rolesrows,
                                                            convention: conventionrows,
                                                            configurations: cfgrows,
                                                            event: eventdetailrows,
                                                            eventinfo: eventrows,
                                                            customfields: customrows,
                                                            creator: creatorresult,
                                                            managerlist: managerrows
                                                        });
                                                    } else {
                                                        console.log("User has no rights to access event.");
                                                    }
                                                });
                                            });
                                        });
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

    app.post('/create', isLoggedIn, function (req, res) {
        if (req.user.isCreator || req.user.isManager) {
            var event_id = req.body.event_id;
            if (typeof req.body.accept != 'undefined') {
                var version = parseInt(req.body.version);
                if (req.body.accept == "creator" && req.user.user_id == req.body.event_manager) {
                    notifier.notify(4, event_id, version, req.user.user_id, null);
                    connection.query("UPDATE sq_events SET event_confirmed_version_creator = ? WHERE event_id = ?", [req.body.version, event_id], function(err,state){ if(err) { console.log(err); }});
                }
                if (req.body.accept == "manager" && req.user.isManager) {
                    notifier.notify(5, event_id, version, req.user.user_id, null);
                    connection.query("UPDATE sq_events SET event_confirmed_version_manager = ? WHERE event_id = ?", [req.body.version, event_id], function(err,state){ if(err) { console.log(err); }});
                }
                res.redirect('/create?id=' + event_id+ '&version=' + req.body.version);
            } else {
                var version = 1;
                if (event_id == 0) {
                    connection.query("INSERT INTO sq_events (`event_id`, `convention_id`, `event_max_version`, `event_confirmed_version_manager`, `event_confirmed_version_creator`) VALUES (0, ?, 1, 0, 1)", req.user.currentConvention.convention_id, function (err, state) {
                        if (err) {
                            console.log(err);
                        } else {
                            event_id = state.insertId;
                            notifier.notify(1, event_id, 1, req.user.user_id, null);
                            /* completely redundant start */
                            var params = [event_id, req.body.stage_id, req.body.event_manager, req.body.event_name, req.body.event_desc, req.body.event_expl, req.body.event_type.toString().replace(',',';'), req.body.event_date, req.body.time_pre, req.body.time_post, req.body.time_dur, version];
                            connection.query("INSERT INTO sq_event_details (`event_id`, `stage_id`, `creator_id`, `event_title`, `event_description`, `event_explaination`, `event_categories`, `event_day`, `event_created`, `event_time_pre`, `event_time_post`, `event_time_dur`, `event_version`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?)", params, function (err, state) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    for (var key in req.body) {
                                        if (req.body.hasOwnProperty(key) &&
                                            key.startsWith("custom")
                                        ){
                                            if (req.body[key].constructor === Array) {
                                                for (var i = 0; i < req.body[key].length; i++) {
                                                    console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom','') + ", " + version + ", " + req.body[key][i] + ")");
                                                    var params = [event_id, key.replace('custom',''), version, req.body[key][i]];
                                                    connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
                                                }
                                            } else {
                                                console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom','') + ", " + version + ", " + req.body[key] + ")");
                                                var params = [event_id, key.replace('custom',''), version, req.body[key]];
                                                connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
                                            }
                                        }
                                    }
                                }
                            });
                            /* completely redundant end */
                        }
                    });
                } else {
                    version = (parseInt(req.body.version) + 1);
                    var setConfirmation = "";
                    if (req.user.isManager) {
                        setConfirmation += ", event_confirmed_version_manager = " + version;
                        notifier.notify(3, event_id, version, req.user.user_id, null);
                    }
                    if (req.body.event_manager == req.user.user_id) {
                        setConfirmation += ", event_confirmed_version_creator = " + version;
                        notifier.notify(2, event_id, version, req.user.user_id, null);
                    }
                    connection.query("UPDATE sq_events SET event_max_version = ?" + setConfirmation + " WHERE event_id = ?", [version, event_id], function (err, state) {
                        if (err) {
                            console.log(err);
                        } else {
                            /* completely redundant start */
                            var params = [event_id, req.body.stage_id, req.user.user_id, req.body.event_name, req.body.event_desc, req.body.event_expl, req.body.event_type, req.body.event_date, req.body.time_pre, req.body.time_post, req.body.time_dur, version];
                            connection.query("INSERT INTO sq_event_details (`event_id`, `stage_id`, `creator_id`, `event_title`, `event_description`, `event_explaination`, `event_categories`, `event_day`, `event_created`, `event_time_pre`, `event_time_post`, `event_time_dur`, `event_version`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?)", params, function (err, state) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    for (var key in req.body) {
                                        if (req.body.hasOwnProperty(key) &&
                                            key.startsWith("custom")
                                        ) {
                                            if (req.body[key].constructor === Array) {
                                                for (var i = 0; i < req.body[key].length; i++) {
                                                    console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom','') + ", " + version + ", " + req.body[key][i] + ")");
                                                    var params = [event_id, key.replace('custom',''), version, req.body[key][i]];
                                                    connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
                                                }
                                            } else {
                                                console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom','') + ", " + version + ", " + req.body[key] + ")");
                                                var params = [event_id, key.replace('custom',''), version, req.body[key]];
                                                connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
                                            }
                                        }
                                    }
                                }
                            });
                            /* completely redundant end */
                        }
                    });
                }
                res.redirect('/home');
            }
        } else {
            res.redirect('/home');
        }
    });
};
