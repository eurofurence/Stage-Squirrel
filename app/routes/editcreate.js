// Load isLoggedIn-Middleware
var isLoggedIn = require('../middleware/isLoggedIn');

// =====================================
// CREATE EDIT =========================
// =====================================
module.exports = function (app, passport, connection) {
    // show the admin config
    app.get('/editcreate', isLoggedIn, function (req, res) {
        if (true) { // Was this intended to be an "always-fallthrough"?
            connection.query('SELECT * from sq_role where role_is_admin = 0 and role_is_manager = 0 and role_is_default = 0 and role_is_active = 1', function (err, rows) {
                res.render('editcreate.ejs', {
                    nav: 'edittemplate',
                    user: req.user,
                    roles: rows
                });
            });
        } else {
            res.redirect('/home');
        }
    });
};
