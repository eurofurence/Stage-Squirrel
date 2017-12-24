// Load isLoggedIn-Middleware
var isLoggedIn = require('../middleware/isLoggedIn');
var util = require('../lib/utilities');


// =====================================
// MANAGE RIDERS =======================
// =====================================
module.exports = function(app, passport, connection, notifier) {
    // show the admin config
    app.get('/rider', isLoggedIn, function(req, res) {
        if (typeof req.query.id != 'undefined') {
            connection.query('SELECT * FROM sq_events LEFT JOIN sq_event_details ON sq_events.event_id = sq_event_details.event_id AND (SELECT GREATEST(sq_events.event_confirmed_version_creator, sq_events.event_confirmed_version_manager) FROM sq_events WHERE sq_events.event_id = ?) >= sq_event_details.event_version WHERE sq_events.event_id = ?', [req.query.id, req.query.id], function(err, eventrows) {
                connection.query('SELECT * from sq_conventions WHERE convention_id = ?', eventrows[0].convention_id, function(err, conventionrows) {
                    connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function(err, userrows) {
                        connection.query('SELECT * FROM sq_stage', function(err, stagerows) {
                            connection.query('SELECT * from sq_role where role_is_active = 1', function(err, rolerows) {
                                connection.query('SELECT * from sq_map_user_to_role', function(err, mapuserrolerows) {
                                    connection.query('SELECT * from sq_riders WHERE event_id = ?', req.query.id, function(err, riderrows) {
                                        connection.query('SELECT * from sq_rider_contacts WHERE event_id = ?', req.query.id, function(err, contactrows) {
                                            connection.query('SELECT * from sq_rider_comments WHERE event_id = ? ORDER BY create_time DESC', req.query.id, function(err, commentrows) {
                                                connection.query('SELECT * from sq_map_riders_to_roles WHERE event_id = ?', req.query.id, function(err, ridertorolerows) {
                                                    connection.query('SELECT * from sq_rider_stagebox WHERE event_id = ?', req.query.id, function(err, stageboxrows) {
                                                        if (riderrows[0] != null) {
                                                            riderrows[0].role = ridertorolerows;
                                                        }
                                                        res.render('rider.ejs', {
                                                            nav: 'rider',
                                                            user: req.user,
                                                            users: userrows,
                                                            roles: rolerows,
                                                            mapuserrole: mapuserrolerows,
                                                            convention: conventionrows,
                                                            event: eventrows[0],
                                                            stages: stagerows,
                                                            rider: riderrows[0],
                                                            comments: commentrows,
                                                            contacts: contactrows,
                                                            rolerider: ridertorolerows,
                                                            stagebox: stageboxrows
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
                });
            });
        } else {
            res.redirect('/home');
        }
    });

    app.post('/rider', isLoggedIn, function(req, res) {
        if (req.body.actionType == "accept_responsible") {
            params = [1, req.body.event_id, req.body.role_id, req.body.version];
            connection.query("UPDATE sq_map_riders_to_roles SET confirmed_version_responsible = ? WHERE event_id = ? AND role_id = ? AND version = ?", params, function(err, state) {
                if (err) {
                    console.log(err);
                }
            });
            console.log(req.body);
            notifier.notify(7, req.body.event_id, req.body.version, req.user.user_id, req.body.role_id);
            res.redirect('/rider?id=' + req.body.event_id);
        }
        if (req.body.actionType == "accept_manager") {
            params = [1, req.body.event_id, req.body.role_id, req.body.version];
            connection.query("UPDATE sq_map_riders_to_roles SET confirmed_version_manager = ? WHERE event_id = ? AND role_id = ? AND version = ?", params, function(err, state) {
                if (err) {
                    console.log(err);
                }
            });
            console.log(req.body);
            notifier.notify(8, req.body.event_id, req.body.version, req.user.user_id, req.body.role_id);
            res.redirect('/rider?id=' + req.body.event_id);
        }
        if (req.body.actionType == "editGeneral") {
            params = [req.body.creator_id, req.body.eventmgr_mobile, req.user.user_id, req.body.stagemgr_mobile, req.body.crew_lxd, req.body.crew_lx1, req.body.crew_lx2, req.body.crew_a1, req.body.crew_a2, req.body.crew_a3, req.body.crew_stagedecktech, req.body.crew_bananassetup, req.body.crew_bananasshow, req.body.crew_bananasbreakdown, util.getTimeJStoSQL(req.body.starttime), req.body.event_id];
            connection.query("UPDATE sq_riders SET creator_id = ?, creator_mobile = ?, manager_id = ?, manager_mobile = ?, crew_lxd = ?, crew_lx1 = ?, crew_lx2 = ?, crew_a1 = ?, crew_a2 = ?, crew_a3 = ?, crew_stagedecktech = ?, crew_bananassetup = ?, crew_bananasshow = ?, crew_bananasbreakdown = ?, startdate = ? WHERE event_id = ?", params, function(err, state) {
                if (err) {
                    console.log(err);
                }
            });
            console.log(req.body);
            notifier.notify(11, req.body.event_id, null, req.user.user_id, null);
            res.redirect('/rider?id=' + req.body.event_id);
        }
        if (req.body.actionType == "editRole") {
            var conf_mgr = req.user.isManager ? 1 : 0;
            var conf_res = req.user.user_id == req.body.responsible_id ? 1 : 0;
            params = [req.body.event_id, req.body.role_id, req.body.role_content, req.body.responsible_id, conf_mgr, conf_res, (parseInt(req.body.version) + 1)];
            connection.query("INSERT INTO sq_map_riders_to_roles (event_id, role_id, content, responsible_id, confirmed_version_manager, confirmed_version_responsible, version) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err, state) {
                if (err) {
                    console.log(err);
                }
                if (req.user.isManager) {
                    notifier.notify(10, req.body.event_id, (parseInt(req.body.version) + 1), req.user.user_id, req.body.role_id);
                } else {
                    notifier.notify(9, req.body.event_id, (parseInt(req.body.version) + 1), req.user.user_id, req.body.role_id);
                }
                if (req.body.hasStagebox) {
                    for (var i = 0; i < req.body.sb_cha.length; i++) {
                        params = [req.body.event_id, (parseInt(req.body.version) + 1), req.body.sb_cha[i], req.body.sb_lab[i], req.body.sb_sub[i], req.body.sb_48v[i], req.body.sb_via[i]];
                        connection.query("INSERT INTO sq_rider_stagebox (event_id, event_version, stagebox_channel, stagebox_label, stagebox_subcore, stagebox_48v, stagebox_viadi) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err, state) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                }
            });
            console.log(req.body);
            res.redirect('/rider?id=' + req.body.event_id);
        }
        if (req.body.actionType == "create") {
            params = [req.body.event_id, req.body.creator_id, req.body.eventmgr_mobile, req.user.user_id, req.body.stagemgr_mobile, req.body.crew_lxd, req.body.crew_lx1, req.body.crew_lx2, req.body.crew_a1, req.body.crew_a2, req.body.crew_a3, req.body.crew_stagedecktech, req.body.crew_bananassetup, req.body.crew_bananasshow, req.body.crew_bananasbreakdown, util.getTimeJStoSQL(req.body.starttime)];
            connection.query("INSERT INTO sq_riders (event_id, creator_id, creator_mobile, manager_id, manager_mobile, crew_lxd, crew_lx1, crew_lx2, crew_a1, crew_a2, crew_a3, crew_stagedecktech, crew_bananassetup, crew_bananasshow, crew_bananasbreakdown, startdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", params, function(err, state) {
                if (err) {
                    console.log(err);
                }
                notifier.notify(6, req.body.event_id, 1, req.user.user_id, null);
                for (var i = 0; i < req.body.role_id.length; i++) {
                    params = [req.body.event_id, req.body.role_id[i], req.body.role_content[i], req.body.responsible_id[i], 1, 0, 1];
                    connection.query("INSERT INTO sq_map_riders_to_roles (event_id, role_id, content, responsible_id, confirmed_version_manager, confirmed_version_responsible, version) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err, state) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                for (var i = 0; i < req.body.sb_cha.length; i++) {
                    params = [req.body.event_id, 1, req.body.sb_cha[i], req.body.sb_lab[i], req.body.sb_sub[i], req.body.sb_48v[i], req.body.sb_via[i]];
                    connection.query("INSERT INTO sq_rider_stagebox (event_id, event_version, stagebox_channel, stagebox_label, stagebox_subcore, stagebox_48v, stagebox_viadi) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err, state) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                for (var i = 0; i < req.body.contact_nick.length; i++) {
                    params = [req.body.event_id, req.body.contact_function[i], req.body.contact_nick[i], req.body.contact_mobile[i]];
                    connection.query("INSERT INTO sq_rider_contacts (event_id, contact_function, contact_nick, contact_mobile) VALUES (?, ?, ?, ?)", params, function(err, state) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
            console.log(req.body);
            res.redirect('/rider?id=' + req.body.event_id);
        }
        if (req.body.actionType == "comment") {
            var rolestring = req.body.commentrole.toString().replace(/,/g, ';');
            connection.query("INSERT INTO sq_rider_comments (`event_id`, `user_id`, `create_time`, `comment_value`, `affected_roles`) VALUES (?, ?, ?, ?, ?)", [req.body.event_id, req.user.user_id, util.getTimeJStoSQL(new Date()), req.body.comment_content, rolestring]);
            res.redirect('/rider?id=' + req.body.event_id + '#comment-' + req.body.comment_no);
        }
    });
};