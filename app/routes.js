// Database connection
var config = require('../config/config.js');
var connection = require('./lib/databaseConnection')(config.database);

// Telegram integration
var telegram = require('./telegram.js');
var notifier = require('./lib/notificationService')(telegram, connection);

module.exports = function(app, passport) {
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        if (req.isAuthenticated) {
            res.redirect('/profile');
        } else {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        }
    });

    // =====================================
    // ROOTING FOR SUB-PAGES  ==============
    // =====================================
    require('./routes/admin')(app, passport, connection, notifier);
    require('./routes/convention')(app, passport, connection);
    require('./routes/create')(app, passport, connection, notifier);
    require('./routes/editcreate')(app, passport, connection);
    require('./routes/home')(app, passport, connection);
    require('./routes/login')(app, passport);
    require('./routes/logout')(app, passport);
    require('./routes/manage')(app, passport, connection);
    require('./routes/profile')(app, passport, connection, notifier);
    require('./routes/rider')(app, passport, connection, notifier);
    require('./routes/roleview')(app, passport, connection);
    require('./routes/signup')(app, passport, connection);
    require('./routes/stages')(app, passport, connection);
    require('./routes/surveys')(app, passport, connection);
};
