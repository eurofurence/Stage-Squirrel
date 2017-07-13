// route middleware to make sure a user is logged in
module.exports = function (req, res, next) {
    if (req.body.hash) {
        req.url += req.body.hash;
    }
    if (req.user != undefined) {
        for (var role of req.user.user_roles) {
            if (role.role_is_admin == 1) {
                req.user.isAdmin = 1;
                req.user.isManager = 1;
                req.user.isCreator = 1;
            } else if (role.role_is_manager == 1) {
                req.user.isManager = 1;
                req.user.isCreator = 1;
            } else if (role.role_is_creator == 1) {
                req.user.isCreator = 1;
            }
        }
    }
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        if (req.user.user_active) {
            return next();
        } else {
            res.render('login.ejs', {
                message: req.flash(
                    'loginMessage',
                    'This account is inactive. An administrator must activate your account first.'
                )
            });
        }
    }
    req.session.returnTo = req.url;
    console.log(req.url);
    res.redirect('/login');
};
