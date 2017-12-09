var config = require('../config/config.js');
var connection = require('./lib/databaseConnection')(config.database);
var crypt = require('bcrypt');
var util = require('./lib/utilities');

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;


// expose this function to our app using module.exports
module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.user_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("select * from sq_user where user_id = " + id, function(err, rows) {
            rows[0].user_roles = [];
            connection.query("SELECT role_id FROM sq_map_user_to_role WHERE user_id = " + id, function(err2, maprolerows) {
                connection.query("SELECT * FROM sq_conventions where date_from > now() order by date_from ASC limit 1", function(err2, conrows) {
                    rows[0].currentConvention = conrows.length ? conrows[0] : {};
                    connection.query("select * from sq_role", function(err2, rolerows) {
                        for (var i = 0; i < maprolerows.length; i++) {
                            for (var j = 0; j < rolerows.length; j++) {
                                if (maprolerows[i].role_id == rolerows[j].role_id) {
                                    rows[0].user_roles.push(rolerows[j]);
                                }
                            }
                        }
                        done(err, rows[0]);
                    });
                });

            });
        });

    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    var next_event_query = "SELECT * FROM sq_conventions WHERE convention_id=(SELECT IFNULL((SELECT convention_id FROM sq_conventions where date_to > DATE_ADD(curdate(),INTERVAL -1 WEEK) order by date_from ASC limit 1), (SELECT convention_id FROM sq_conventions where date_from <= curdate() order by date_from DESC limit 1)))";

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            connection.query('SELECT * from sq_configuration', function(err, rows) {
                var cfg = [];
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    cfg[row.configuration_key] = {
                        value: row.configuration_value
                    }
                }
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                connection.query("select * from sq_user where user_mail = '" + email + "'", function(err, rows) {
                    if (err) { return done(err); }
                    if (rows.length) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {
                        connection.query("select * from sq_user where user_name = '" + req.body.user_name + "'", function(err, rows) {
                            if (err) { return done(err); }
                            if (rows.length) {
                                return done(null, false, req.flash('signupMessage', 'This username already exists.'));
                            } else {

                                // if there is no user with that email
                                // create the user
                                var newUserMysql = new Object();
                                newUserMysql.user_mail = email;
                                newUserMysql.user_password = crypt.hashSync(password, 10); // use the generateHash function in our user model

                                var user_is_active_after_registration = 1;

                                if (cfg["AUTH_CONFIRMATION"].value == 1) { user_is_active_after_registration = 0; }

                                var insertQuery = "INSERT INTO sq_user ( user_mail, user_password, user_name, user_active ) values ('" + newUserMysql.user_mail + "','" + newUserMysql.user_password + "','" + req.body.user_name + "','" + user_is_active_after_registration + "')";
                                console.log(insertQuery);
                                connection.query(insertQuery, function(err, userrows) {
                                    newUserMysql.user_id = userrows.insertId;
                                    newUserMysql.user_roles = [];
                                    if (typeof req.body.userrole != 'object') { req.body.userrole = [req.body.userrole]; }
                                    console.log(req.body.userrole);
                                    for (var role of req.body.userrole) {
                                        var insertQuery = "INSERT INTO sq_map_user_to_role ( user_id, role_id ) values ('" + userrows.insertId + "','" + role + "')";
                                        console.log(insertQuery);
                                        connection.query(insertQuery);
                                        connection.query("select * from sq_role where role_id = '" + role + "'", function(err2, rolerows) {
                                            newUserMysql.user_roles.push(rolerows[0]);
                                        });
                                    }
                                    connection.query(next_event_query, function(err2, conrows) {
                                        newUserMysql.currentConvention = conrows[0];
                                        return done(null, newUserMysql);
                                    });
                                });
                            }
                        });
                    }
                });
            });
        }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            connection.query('SELECT * from sq_configuration', function(err, rows) {
                var cfg = [];
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    cfg[row.configuration_key] = {
                        value: row.configuration_value
                    }
                }

                connection.query("SELECT * FROM `sq_user` WHERE `user_mail` = '" + email + "'", function(err, rows) {
                    if (err)
                        return done(err);
                    var now = new Date();
                    var banned = null;
                    var min_since_last_try = 0;
                    connection.query("SELECT * FROM `sq_login_attempts` WHERE `attempt_ip` = '" + req.connection.remoteAddress + "'", function(err2, rows_attempts) {
                        var try_count = 0;
                        if (!err2 && rows_attempts.length) {
                            try_count = rows_attempts[0].attempt_count;
                            var last_try = new Date(rows_attempts[0].attempt_last_try);
                            min_since_last_try = parseInt((now.getTime() - last_try.getTime()) / 60000);
                            if (rows_attempts[0].attempt_banned_until != null || min_since_last_try > cfg["TIME_IP_ATTEMPT"].value) {
                                banned = new Date(rows_attempts[0].attempt_banned_until);
                                var min_till_unban = parseInt((banned.getTime() - now.getTime()) / 60000);
                                console.log("IP " + req.connection.remoteAddress + " had " + try_count + "x wrong credentials. Reset counter in " + (cfg["TIME_IP_ATTEMPT"].value - min_since_last_try) + " min. Automatically unban in " + min_till_unban + "min.");
                                if (banned.getTime() < now.getTime() || min_since_last_try > cfg["TIME_IP_ATTEMPT"].value) {
                                    console.log("IP " + req.connection.remoteAddress + " is now unbanned and free of failed attempts.");
                                    connection.query("DELETE FROM sq_login_attempts WHERE `attempt_ip` = '" + req.connection.remoteAddress + "'");
                                    try_count = 0;
                                    banned = null;
                                }
                            }

                        }

                        if (banned) return done(null, false, req.flash('loginMessage', 'Sorry, your ip address has been banned for the next ' + parseInt((banned.getTime() - now.getTime()) / 60000) + " minutes because of to many login attempts."));
                        if (!rows.length || !(crypt.compareSync(password, rows[0].user_password)) && !banned) {
                            try_count++;
                            if (rows_attempts.length) {
                                var strBanned = "";
                                console.log("IP " + req.connection.remoteAddress + " used " + try_count + "x wrong credentials.");
                                banned = null;
                                if (try_count >= (cfg["MAX_LOGIN_ATTEMPTS"].value) && banned == null) {
                                    console.log("IP " + req.connection.remoteAddress + " will now be banned for " + cfg["TIME_IP_BAN"].value + " min.");
                                    banned = new Date();
                                    banned.setTime(banned.getTime() + 1000 * 60 * cfg["TIME_IP_BAN"].value);
                                    strBanned = "', attempt_banned_until = '" + util.getTimeJStoSQL(banned);
                                }
                                connection.query("UPDATE sq_login_attempts SET attempt_count = '" + try_count + "', attempt_last_try = '" + util.getTimeJStoSQL(now) + strBanned + "' WHERE `attempt_ip` = '" + req.connection.remoteAddress + "'");
                                if (banned) return done(null, false, req.flash('loginMessage', 'Sorry, your ip address has been banned for the next ' + parseInt((banned.getTime() - now.getTime()) / 60000) + " minutes because of to many login attempts."));
                            } else {
                                connection.query("INSERT INTO sq_login_attempts (`attempt_id`, `attempt_ip`, `attempt_count`, `attempt_last_try`) VALUES (NULL, '" + req.connection.remoteAddress + "', '1', '" + util.getTimeJStoSQL(now) + "')");
                            }
                            return done(null, false, req.flash('loginMessage', 'Wrong account. Try #' + try_count)); // req.flash is the way to set flashdata using connect-flash
                        }

                        if (rows[0].user_active == 1) connection.query("UPDATE sq_user SET user_last_login = '" + util.getTimeJStoSQL(now) + "' WHERE user_id = " + rows[0].user_id);

                        rows[0].user_roles = [];
                        console.log("SELECT role_id FROM sq_map_user_to_role WHERE user_id = " + rows[0].user_id);
                        connection.query("SELECT role_id FROM sq_map_user_to_role WHERE user_id = " + rows[0].user_id, function(err2, maprolerows) {
                            connection.query(next_event_query, function(err2, conrows) {
                                rows[0].currentConvention = conrows[0];
                                for (var i = 0; i < maprolerows.length; i++) {
                                    connection.query("select * from sq_role where role_id = '" + maprolerows[i].role_id + "'", function(err2, rolerows) {
                                        rows[0].user_roles.push(rolerows[0]);
                                        if (i == maprolerows.length) {
                                            return done(null, rows[0]);
                                        }
                                    });
                                }
                            });
                        });
                    })
                });
            });
        }));
};