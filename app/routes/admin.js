// Load isLoggedIn-Middleware
var isLoggedIn = require('../middleware/isLoggedIn');

// =====================================
// ADMIN ===============================
// =====================================
module.exports = function (app, passport, connection, notifier) {
    // show the admin config
    app.get('/admin', isLoggedIn, function(req, res) {
        if (req.user.isAdmin) {
            connection.query('SELECT * from sq_configuration', function (err, cfgrows) {
                connection.query('SELECT * from sq_user order by user_active;', function (err, userrows) {
                    res.render('admin.ejs', {
                        nav: 'admin',
                        user : req.user,
                        allusers: userrows,
                        configurations: cfgrows
                    });
                });
            });
        } else {
            res.redirect('/home');
        }
    });

    // process the signup form
    app.post('/admin', isLoggedIn, function(req, res) {
        if (req.user.isAdmin) {
            if (req.body.actionType == "global") {
                connection.query('SELECT configuration_key, configuration_value from sq_configuration', function (err, cfgrows) {
                    for(var i=0; i<cfgrows.length; i++) {
                        connection.query(
                            "UPDATE sq_configuration SET configuration_value = '" +
                            req.body[cfgrows[i].configuration_key] +
                            "' WHERE `configuration_key` = '" +
                            cfgrows[i].configuration_key + "'"
                        );
                        //if (cfgrows[i].configuration_key == "TELEGRAM_API_TOKEN" && cfgrows[i].configuration_value != req.body[cfgrows[i].configuration_key]) {
                        //	telegram.readToken(cfgrows[i].configuration_value);
                        //}
                    }
                });
            } else if (req.body.actionType == "user") {
                if (req.body.activation != undefined) {
                    console.log(
                        "UPDATE sq_user SET user_active = '1' WHERE `user_id` = '" +
                        req.body.activation +
                        "'"
                    );
                    connection.query(
                        "UPDATE sq_user SET user_active = '1' WHERE `user_id` = '" +
                        req.body.activation +
                        "'"
                    );
                    notifier.notify(14, null, null, req.body.activation, null);
                }
                if (req.body.deactivation != undefined) {
                    console.log(
                        "UPDATE sq_user SET user_active = '0' WHERE `user_id` = '" +
                        req.body.deactivation +
                        "'"
                    );
                    connection.query(
                        "UPDATE sq_user SET user_active = '0' WHERE `user_id` = '" +
                        req.body.deactivation +
                        "'"
                    );
                }
            }
        }
        res.redirect('/admin');
    });
};
