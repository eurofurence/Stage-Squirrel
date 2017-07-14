var config = require('../config/config.js');
var connection = require('./lib/databaseConnection')(config.database);
var util = require('./lib/utilities');

// Telegram Integration
var telegram = require('./telegram.js');
var notifier = require('./lib/notificationService')(telegram, connection);

var notificationService = notifier.notify;
var telegramintegration = notifier.active;

// Load isLoggedIn-Middleware
var isLoggedIn = require('./middleware/isLoggedIn');

// app/routes.js
module.exports = function(app, passport) {
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
    //if (req.isAuthenticated) res.redirect('/profile');
    //res.redirect('/login');
        res.render('login.ejs', { message: req.flash('loginMessage') }); // load the index.ejs file
    });

    require('./routes/admin')(app, passport, connection, notifier);
    require('./routes/create')(app, passport, connection, notifier);
    require('./routes/home')(app, passport, connection);
    require('./routes/login')(app, passport);
    require('./routes/manage')(app, passport, connection);
    require('./routes/profile')(app, passport, connection, notifier);
    require('./routes/signup')(app, passport, connection);


    // =====================================
    // MY SURVEYS =======================
    // =====================================
    // show the admin config
    app.get('/surveys', isLoggedIn, function(req, res) {
    if (req.user.isCreator) {
      connection.query('SELECT * FROM sq_events left join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id IN (SELECT DISTINCT event_id FROM sq_event_details WHERE creator_id = ?) AND sq_events.event_max_version = sq_event_details.event_version;', req.user.user_id, function (err, eventrows) {
        connection.query('SELECT * FROM sq_riders', function (err, riderrows) {
          res.render('surveys.ejs', {
            nav: 'surveys',
                    user  : req.user,
            events: eventrows,
            riders: riderrows
          })
        })
      })

    } else {
      res.redirect('/home');
    }
    });

    // =====================================
    // MANAGE EVENTS =======================
    // =====================================
    // show the admin config
    app.get('/roleview', isLoggedIn, function(req, res) {
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
                        user  : req.user,
                  users : userrows,
                  events: eventrows,
                    role : rolerows[0]
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

    // =====================================
    // MANAGE RIDERS =======================
    // =====================================
    // show the admin config
    app.get('/rider', isLoggedIn, function(req, res) {
    if (typeof req.query.id != 'undefined') {
      connection.query('SELECT * FROM sq_events LEFT JOIN sq_event_details ON sq_events.event_id = sq_event_details.event_id AND (SELECT GREATEST(sq_events.event_confirmed_version_creator, sq_events.event_confirmed_version_manager) FROM sq_events WHERE sq_events.event_id = ?) = sq_event_details.event_version WHERE sq_events.event_id = ?', [req.query.id, req.query.id], function (err, eventrows) {
        connection.query('SELECT * from sq_conventions WHERE convention_id = ?', eventrows[0].convention_id, function (err, conventionrows) {
          connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function (err, userrows) {
            connection.query('SELECT * FROM sq_stage', function (err, stagerows) {
              connection.query('SELECT * from sq_role where role_is_active = 1', function (err, rolerows) {
                connection.query('SELECT * from sq_map_user_to_role', function (err, mapuserrolerows) {
                  connection.query('SELECT * from sq_riders WHERE event_id = ?', req.query.id, function (err, riderrows) {
                    connection.query('SELECT * from sq_rider_contacts WHERE event_id = ?', req.query.id, function (err, contactrows) {
                      connection.query('SELECT * from sq_rider_comments WHERE event_id = ? ORDER BY create_time DESC', req.query.id, function (err, commentrows) {
                        connection.query('SELECT * from sq_map_riders_to_roles WHERE event_id = ?', req.query.id, function (err, ridertorolerows) {
                          connection.query('SELECT * from sq_rider_stagebox WHERE event_id = ?', req.query.id, function (err, stageboxrows) {
                            if (riderrows[0] != null) { riderrows[0].role = ridertorolerows; }
                            res.render('rider.ejs', {
                              nav: 'rider',
                              user  : req.user,
                              users : userrows,
                              roles : rolerows,
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
      connection.query("UPDATE sq_map_riders_to_roles SET confirmed_version_responsible = ? WHERE event_id = ? AND role_id = ? AND version = ?", params, function(err,state){ if(err) { console.log(err); } } );

      console.log(req.body);
      notificationService(7, req.body.event_id, req.body.version, req.user.user_id, req.body.role_id);
      res.redirect('/rider?id=' + req.body.event_id);
    }
    if (req.body.actionType == "accept_manager") {
      params = [1, req.body.event_id, req.body.role_id, req.body.version];
      connection.query("UPDATE sq_map_riders_to_roles SET confirmed_version_manager = ? WHERE event_id = ? AND role_id = ? AND version = ?", params, function(err,state){ if(err) { console.log(err); } } );

      console.log(req.body);
      notificationService(8, req.body.event_id, req.body.version, req.user.user_id, req.body.role_id);
      res.redirect('/rider?id=' + req.body.event_id);
    }
    if (req.body.actionType == "editGeneral") {
      params = [req.body.creator_id, req.body.eventmgr_mobile, req.user.user_id, req.body.stagemgr_mobile, req.body.crew_lxd, req.body.crew_lx1, req.body.crew_lx2, req.body.crew_a1, req.body.crew_a2, req.body.crew_a3, req.body.crew_stagedecktech, req.body.crew_bananassetup, req.body.crew_bananasshow, req.body.crew_bananasbreakdown, util.getTimeJStoSQL(req.body.starttime), req.body.event_id];
      connection.query("UPDATE sq_riders SET creator_id = ?, creator_mobile = ?, manager_id = ?, manager_mobile = ?, crew_lxd = ?, crew_lx1 = ?, crew_lx2 = ?, crew_a1 = ?, crew_a2 = ?, crew_a3 = ?, crew_stagedecktech = ?, crew_bananassetup = ?, crew_bananasshow = ?, crew_bananasbreakdown = ?, startdate = ? WHERE event_id = ?", params, function(err,state){ if(err) { console.log(err); } } );
      console.log(req.body);

      notificationService(11, req.body.event_id, null, req.user.user_id, null);
      res.redirect('/rider?id=' + req.body.event_id);
    }
    if (req.body.actionType == "editRole") {
      var conf_mgr = req.user.isManager ? 1 : 0;
      var conf_res = req.user.user_id == req.body.responsible_id ? 1 : 0;
      params = [req.body.event_id, req.body.role_id, req.body.role_content, req.body.responsible_id, conf_mgr, conf_res, (parseInt(req.body.version) + 1)];
      connection.query("INSERT INTO sq_map_riders_to_roles (event_id, role_id, content, responsible_id, confirmed_version_manager, confirmed_version_responsible, version) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); }
        if (req.user.isManager) {
          notificationService(10, req.body.event_id, (parseInt(req.body.version) + 1), req.user.user_id, req.body.role_id);
        } else {
          notificationService(9, req.body.event_id, (parseInt(req.body.version) + 1), req.user.user_id, req.body.role_id);
        }
        if (req.body.hasStagebox) {
          for (var i = 0; i < req.body.sb_cha.length; i++) {
            params = [req.body.event_id, (parseInt(req.body.version) + 1), req.body.sb_cha[i], req.body.sb_lab[i], req.body.sb_sub[i], req.body.sb_48v[i], req.body.sb_via[i]];
            connection.query("INSERT INTO sq_rider_stagebox (event_id, event_version, stagebox_channel, stagebox_label, stagebox_subcore, stagebox_48v, stagebox_viadi) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); }
            });
          }
        }
      });
      console.log(req.body);
      res.redirect('/rider?id=' + req.body.event_id);
    }
    if (req.body.actionType == "create") {

      params = [req.body.event_id, req.body.creator_id, req.body.eventmgr_mobile, req.user.user_id, req.body.stagemgr_mobile, req.body.crew_lxd, req.body.crew_lx1, req.body.crew_lx2, req.body.crew_a1, req.body.crew_a2, req.body.crew_a3, req.body.crew_stagedecktech, req.body.crew_bananassetup, req.body.crew_bananasshow, req.body.crew_bananasbreakdown, util.getTimeJStoSQL(req.body.starttime)];
      connection.query("INSERT INTO sq_riders (event_id, creator_id, creator_mobile, manager_id, manager_mobile, crew_lxd, crew_lx1, crew_lx2, crew_a1, crew_a2, crew_a3, crew_stagedecktech, crew_bananassetup, crew_bananasshow, crew_bananasbreakdown, startdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); }
        notificationService(6, req.body.event_id, 1, req.user.user_id, null);
        for (var i = 0; i < req.body.role_id.length; i++) {
          params = [req.body.event_id, req.body.role_id[i], req.body.role_content[i], req.body.responsible_id[i], 1, 0, 1];
          connection.query("INSERT INTO sq_map_riders_to_roles (event_id, role_id, content, responsible_id, confirmed_version_manager, confirmed_version_responsible, version) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); }
          });
        }
        for (var i = 0; i < req.body.sb_cha.length; i++) {
          params = [req.body.event_id, 1, req.body.sb_cha[i], req.body.sb_lab[i], req.body.sb_sub[i], req.body.sb_48v[i], req.body.sb_via[i]];
          connection.query("INSERT INTO sq_rider_stagebox (event_id, event_version, stagebox_channel, stagebox_label, stagebox_subcore, stagebox_48v, stagebox_viadi) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); }
          });
        }
        for (var i = 0; i < req.body.contact_nick.length; i++) {
          params = [req.body.event_id, req.body.contact_function[i], req.body.contact_nick[i], req.body.contact_mobile[i]];
          connection.query("INSERT INTO sq_rider_contacts (event_id, contact_function, contact_nick, contact_mobile) VALUES (?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); }
          });
        }
      });
      console.log(req.body);
      res.redirect('/rider?id=' + req.body.event_id);
    }
    if (req.body.actionType == "comment") {
      var rolestring = req.body.commentrole.toString().replace(/,/g,';');
      connection.query("INSERT INTO sq_rider_comments (`event_id`, `user_id`, `create_time`, `comment_value`, `affected_roles`) VALUES (?, ?, ?, ?, ?)", [req.body.event_id, req.user.user_id, util.getTimeJStoSQL(new Date()), req.body.comment_content, rolestring]);
      res.redirect('/rider?id=' + req.body.event_id + '#comment-' + req.body.comment_no);
    }
});

    // =====================================
    // MANAGE CONVENTIONS ==================
    // =====================================
    // show the admin config
    app.get('/convention', isLoggedIn, function(req, res) {
    if (req.user.isManager) {
      connection.query('SELECT * from sq_conventions order by date_from ASC', function (err, conventionrows) {
        connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function (err, userrows) {
          connection.query('SELECT * from sq_events order by event_created DESC', function (err, eventrows) {
            connection.query('SELECT * from sq_form_templates order by template_created DESC', function (err, templaterows) {
              connection.query('SELECT * FROM sq_map_convention_to_stage', function (err, mapstagerows) {
                connection.query('SELECT * FROM sq_stage', function (err, stagerows) {
                  res.render('convention.ejs', {
                    nav: 'convention',
                            user  : req.user,
                    users : userrows,
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


    app.post('/convention', isLoggedIn, function(req, res) {
    if (req.user.isManager) {
      console.log(req.body);
      if (req.body.actionType == "create") {
        var params = [req.body.convention_template, req.body.convention_name, req.body.convention_desc, new Date(req.body.start), new Date(req.body.end)];
        if (req.body.convention_id == 0) {
          connection.query("INSERT INTO sq_conventions (template_id, convention_name, convention_description, date_from, date_to) VALUES (?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); }
            for (stage_id of req.body.convention_stage) {
              connection.query("INSERT INTO sq_map_convention_to_stage (convention_id, stage_id) VALUES ('" + req.body.convention_id + "', '" + stage_id + "')", function(err,state){ if(err) { console.log(err); } });
            }
          });
        } else {
          connection.query("UPDATE sq_conventions SET template_id = ?, convention_name = ?, convention_description = ?, date_from = ?, date_to = ? WHERE `convention_id` = '" + req.body.convention_id + "'", params, function(err,state){ if(err) { console.log(err); }
            connection.query("DELETE FROM sq_map_convention_to_stage WHERE `convention_id` = '" + req.body.convention_id + "'", function(err,state){ if(err) { console.log(err); }
              for (stage_id of req.body.convention_stage) {
                connection.query("INSERT INTO sq_map_convention_to_stage (convention_id, stage_id) VALUES ('" + req.body.convention_id + "', '" + stage_id + "')", function(err,state){ if(err) { console.log(err); } });
              }
            });
          });
        }
      } else if (req.body.actionType == "delete") {
        connection.query("SELECT count(*) AS qty from sq_events WHERE convention_id = '" + req.body.convention_id + "'", function (err, events) {
          if (events[0].qty == 0) {
            connection.query("DELETE FROM sq_conventions WHERE `convention_id` = '" + req.body.convention_id + "'", function(err,state){ if(err) { console.log(err); }
              connection.query("DELETE FROM sq_map_convention_to_stage WHERE `convention_id` = '" + req.body.convention_id + "'", function(err,state){ if(err) { console.log(err); } });
            });
          }
        });
      }

      res.redirect('/convention');
    } else {
      res.redirect('/home');
    }
    });

    // =====================================
    // MANAGE STAGES =======================
    // =====================================
    // show the admin config
    app.get('/stages', isLoggedIn, function(req, res) {
    if (req.user.isManager) {
        connection.query('SELECT sq_stage.*, count(sq_conventions.convention_id) AS qty from sq_stage left join sq_map_convention_to_stage on sq_stage.stage_id = sq_map_convention_to_stage.stage_id left join sq_conventions on sq_conventions.convention_id = sq_map_convention_to_stage.convention_id group by sq_stage.stage_id', function (err, stagerows) {
          res.render('stages.ejs', {
            nav: 'stages',
                    user  : req.user,
            stages: stagerows,
          });
        });
    } else {
      res.redirect('/home');
    }
    });


    app.post('/stages', isLoggedIn, function(req, res) {
    if (req.user.isManager) {
      console.log(req.body);
      if (req.body.actionType == "create") {
        var params = [req.body.stage_name, req.body.stage_desc];
        if (req.body.stage_id == 0) {
          connection.query("INSERT INTO sq_stage (stage_name, stage_description) VALUES (?, ?)", params, function(err,state){ if(err) { console.log(err); } });
        } else {
          connection.query("UPDATE sq_stage SET stage_name = ?, stage_description = ? WHERE `stage_id` = '" + req.body.stage_id + "'", params, function(err,state){ if(err) { console.log(err); } });
        }
      } else if (req.body.actionType == "delete") {
        connection.query("SELECT count(*) AS qty from sq_map_convention_to_stage WHERE stage_id = '" + req.body.stage_id + "'", function (err, events) {
          if (events[0].qty == 0) {
            connection.query("DELETE FROM sq_stage WHERE `stage_id` = '" + req.body.stage_id + "'", function(err,state){ if(err) { console.log(err); } });
          }
        });
      }

      res.redirect('/stages');
    } else {
      res.redirect('/home');
    }
    });

    // =====================================
    // CREATE EDIT =========================
    // =====================================
    // show the admin config
    app.get('/editcreate', isLoggedIn, function(req, res) {
    if (true) {
        connection.query('SELECT * from sq_role where role_is_admin = 0 and role_is_manager = 0 and role_is_default = 0 and role_is_active = 1', function (err, rows) {
          res.render('editcreate.ejs', {
            nav: 'edittemplate',
                  user : req.user,
              roles: rows
          });
        });

    } else {
      res.redirect('/home');
    }
    });


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });
};
