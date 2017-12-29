// Database connection
var config = require('../config/config.js');
var connection = require('./lib/databaseConnection')(config.database);

// Telegram integration
var telegram = require('./telegram.js');
var notifier = require('./lib/notificationService')(telegram, connection);

module.exports = function(router, passport) {
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    router.get('/', function(req, res) {
        if (req.isAuthenticated) {
            res.redirect('/profile');
        } else {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        }
    });

    // =====================================
    // ROOTING FOR SUB-PAGES  ==============
    // =====================================
    require('./routes/admin')(router, passport, connection, notifier);
    require('./routes/convention')(router, passport, connection);
    require('./routes/create')(router, passport, connection, notifier);
    require('./routes/editcreate')(router, passport, connection);
    require('./routes/home')(router, passport, connection);
    require('./routes/login')(router, passport);
    require('./routes/logout')(router, passport);
    require('./routes/manage')(router, passport, connection);
    require('./routes/profile')(router, passport, connection, notifier);
    require('./routes/rider')(router, passport, connection, notifier);
    require('./routes/roleview')(router, passport, connection);
    require('./routes/signup')(router, passport, connection);
    require('./routes/stages')(router, passport, connection);
    require('./routes/surveys')(router, passport, connection);
};