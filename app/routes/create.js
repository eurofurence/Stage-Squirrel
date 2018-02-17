var creatorOrManagerGuard = require('../middleware/guard/creatorOrManager');
var isLoggedIn = require('../middleware/isLoggedIn');
var ViewModel = require('../ViewModels/Create');

// =====================================
// CREATE ==============================
// =====================================
module.exports = function(app, passport, connection, notifier) {
    var viewModel = new ViewModel(connection);

    app.get('/create', isLoggedIn, creatorOrManagerGuard, function(req, res) {
        viewModel.getEventFormInfo(
            req.user.currentConvention.convention_id,
            req.query.id,
            req.query.version,
            function(elements, convention, stages, eventData, customsMap, creators) {
                if (convention === undefined) {
                    req.flash('warning', 'There is no convention ahead, for which you could create a survey.');
                    res.redirect('/convention');
                    return;
                }
                var isCreationMode = (eventData.creatorId === 0);
                if (isCreationMode || eventData.creatorId === req.user.user_id || req.user.isManager) {
                    res.render('create.ejs', {
                        convention: convention,
                        customs: customsMap,
                        creatorId: eventData.creatorId || req.user.user_id,
                        creatorsList: creators,
                        elements: elements,
                        event: eventData,
                        isCreationMode: isCreationMode,
                        nav: 'create',
                        stages: stages,
                        user: req.user,
                    });
                }
            },
            function(error) {
                req.flash('error', error);
                res.redirect('/home');
            }
        );
    });

    app.post('/create', isLoggedIn, creatorOrManagerGuard, function(req, res) {
        if (req.body.event_date === '') {
            res.redirect('/create');
            return;
        }
        var event_id = req.body.event_id;
        if (typeof req.body.accept != 'undefined') {
            var version = parseInt(req.body.version);
            if (req.body.accept == "creator" && req.user.user_id == req.body.event_manager) {
                notifier.notify(4, event_id, version, req.user.user_id, null);
                connection.query("UPDATE sq_events SET event_confirmed_version_creator = ? WHERE event_id = ?", [req.body.version, event_id], function(err, state) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            if (req.body.accept == "manager" && req.user.isManager) {
                notifier.notify(5, event_id, version, req.user.user_id, null);
                connection.query("UPDATE sq_events SET event_confirmed_version_manager = ? WHERE event_id = ?", [req.body.version, event_id], function(err, state) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            res.redirect('/create?id=' + event_id + '&version=' + req.body.version);
        } else {
            var version = 1;
            if (event_id == 0) {
                connection.query("INSERT INTO sq_events (`event_id`, `convention_id`, `event_max_version`, `event_confirmed_version_manager`, `event_confirmed_version_creator`) VALUES (0, ?, 1, 0, 1)", req.user.currentConvention.convention_id, function(err, state) {
                    if (err) {
                        console.log(err);
                    } else {
                        event_id = state.insertId;
                        notifier.notify(1, event_id, 1, req.user.user_id, null);
                        /* completely redundant start */
                        var params = [event_id, req.body.stage_id, req.body.event_manager, req.body.event_name, req.body.event_desc, req.body.event_expl, req.body.event_type.toString().replace(',', ';'), req.body.event_date, req.body.time_pre, req.body.time_post, req.body.time_dur, version];
                        connection.query("INSERT INTO sq_event_details (`event_id`, `stage_id`, `creator_id`, `event_title`, `event_description`, `event_explaination`, `event_categories`, `event_day`, `event_created`, `event_time_pre`, `event_time_post`, `event_time_dur`, `event_version`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?)", params, function(err, state) {
                            if (err) {
                                console.log(err);
                            } else {
                                for (var key in req.body) {
                                    if (req.body.hasOwnProperty(key) &&
                                        key.startsWith("custom")
                                    ) {
                                        if (req.body[key].constructor === Array) {
                                            for (var i = 0; i < req.body[key].length; i++) {
                                                console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom', '') + ", " + version + ", " + req.body[key][i] + ")");
                                                var params = [event_id, key.replace('custom', ''), version, req.body[key][i]];
                                                connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
                                            }
                                        } else {
                                            console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom', '') + ", " + version + ", " + req.body[key] + ")");
                                            var params = [event_id, key.replace('custom', ''), version, req.body[key]];
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
                connection.query("UPDATE sq_events SET event_max_version = ?" + setConfirmation + " WHERE event_id = ?", [version, event_id], function(err, state) {
                    if (err) {
                        console.log(err);
                    } else {
                        /* completely redundant start */
                        var params = [event_id, req.body.stage_id, req.user.user_id, req.body.event_name, req.body.event_desc, req.body.event_expl, req.body.event_type, req.body.event_date, req.body.time_pre, req.body.time_post, req.body.time_dur, version];
                        connection.query("INSERT INTO sq_event_details (`event_id`, `stage_id`, `creator_id`, `event_title`, `event_description`, `event_explaination`, `event_categories`, `event_day`, `event_created`, `event_time_pre`, `event_time_post`, `event_time_dur`, `event_version`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?)", params, function(err, state) {
                            if (err) {
                                console.log(err);
                            } else {
                                for (var key in req.body) {
                                    if (req.body.hasOwnProperty(key) &&
                                        key.startsWith("custom")
                                    ) {
                                        if (req.body[key].constructor === Array) {
                                            for (var i = 0; i < req.body[key].length; i++) {
                                                console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom', '') + ", " + version + ", " + req.body[key][i] + ")");
                                                var params = [event_id, key.replace('custom', ''), version, req.body[key][i]];
                                                connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
                                            }
                                        } else {
                                            console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom', '') + ", " + version + ", " + req.body[key] + ")");
                                            var params = [event_id, key.replace('custom', ''), version, req.body[key]];
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
    });
};