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
    require('./routes/convention')(app, passport, connection);
    require('./routes/create')(app, passport, connection, notifier);
    require('./routes/home')(app, passport, connection);
    require('./routes/login')(app, passport);
    require('./routes/manage')(app, passport, connection);
    require('./routes/profile')(app, passport, connection, notifier);
    require('./routes/rider')(app, passport, connection, notifier);
    require('./routes/roleview')(app, passport, connection);
    require('./routes/signup')(app, passport, connection);
    require('./routes/surveys')(app, passport, connection);

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
