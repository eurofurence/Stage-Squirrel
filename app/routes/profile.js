// Load isLoggedIn-Middleware
var isLoggedIn = require('../middleware/isLoggedIn');

// =====================================
// PROFILE SECTION =====================
// =====================================
module.exports = function (app, passport, connection, notifier) {
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function (req, res) {
        connection.query("SELECT configuration_value FROM sq_configuration WHERE configuration_key = 'TELEGRAM_BOT_NAME'", function (err, result) {
            res.render('profile.ejs', {
                nav: 'profile',
                user: req.user, // get the user out of session and pass to template
                telegram:  notifier.active,
                telegrambotname: result[0].configuration_value
            });
        });
    });

    app.post('/profile', isLoggedIn, function (req, res) {
        console.log(req.body);
        var errorMsg = "";
        if (typeof req.body.action != 'undefined') {
            if (req.body.action == 'telegram-confirmation') {
                if (req.user.user_telegram_confirmation_key == req.body.telegram_code) {
                    console.log('Telegram Linking with correct code.');
                    var now = new Date();
                    var validThru = new Date(req.user.user_telegram_confirmation_valid_to);
                    console.log(now);
                    console.log(validThru);
                    if (now.getTime() > validThru.getTime()) {
                        console.log('Telegram Code was not valid anymore.');
                        errorMsg = "Your entered key was wrong or not valid anymore.";
                    } else {
                        req.user.user_telegram_linked = 1;
                        notifier.telegram.notifyById(
                            req.user.user_telegram_id,
                            "You are now sucessfully linked."
                        );
                        connection.query(
                            "UPDATE sq_user SET user_telegram_linked = '1' WHERE `user_id` = ?",
                            req.user.user_id
                        );
                    }
                } else {
                    console.log('Telegram Linking failed with incorrect code.');
                    errorMsg = "Your entered key was wrong or not valid anymore.";
                }
            } else if (
                req.body.action == 'telegram-unlink' &&
                req.user.user_telegram_id.length > 0
            ) {
                req.user.user_telegram_linked = 0;
                notifier.telegram.notifyById(
                    req.user.user_telegram_id,
                    "You are not linked to Stagesquirrel anymore."
                );
                connection.query(
                    "UPDATE sq_user SET user_telegram_linked = '0', user_telegram_id = null WHERE `user_id` = ?",
                    req.user.user_id
                );
            } else if (req.body.action == 'telegram-activate') {
                req.user.user_telegram_active = 1;
                notifier.telegram.notifyById(
                    req.user.user_telegram_id,
                    "Bot activated. You will get notifications."
                );
                connection.query(
                    "UPDATE sq_user SET user_telegram_active = '1' WHERE `user_id` = ?",
                    req.user.user_id
                );
            } else if (req.body.action == 'telegram-deactivate') {
                req.user.user_telegram_active = 0;
                notifier.telegram.notifyById(
                    req.user.user_telegram_id,
                    "Bot deactivated. You will not get any notification."
                );
                connection.query(
                    "UPDATE sq_user SET user_telegram_active = '0' WHERE `user_id` = ?",
                    req.user.user_id
                );
            }
        }
        res.render('profile.ejs', {
            nav: 'profile',
            error: errorMsg,
            user: req.user, // get the user out of session and pass to template
            telegram:  notifier.active
        });
    });
};
