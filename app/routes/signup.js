// =====================================
// SIGNUP ==============================
// =====================================
module.exports = function(app, passport, connection) {
    // show the signup form
    app.get('/signup', function (req, res) {
        connection.query('SELECT * from sq_configuration', function (err, rows) {
            var cfg_key_value = [];
            for (var i=0; i<rows.length; i++) {
                var row = rows[i];
                cfg_key_value[row.configuration_key] = {
                    value: row.configuration_value
                };
            }
            connection.query('SELECT * from sq_role where role_is_admin = 0 and role_is_manager = 0 and role_is_default = 0 and role_is_active = 1', function (err, rows) {
                res.render('signup.ejs', {
                    message: req.flash('signupMessage'),
                    roles: rows,
                    cfg: cfg_key_value
                });
            });
        });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure home section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
};
