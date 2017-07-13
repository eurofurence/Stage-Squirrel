// =====================================
// LOGIN ===============================
// =====================================
module.exports = function(app, passport) {
    // show the login form
    app.get('/login', function(req, res) {
        if (req.isAuthenticated() && req.user.user_active) {
            res.redirect('/home');
        } else {
            console.log(req.session);
            // render the page and pass in any flash data if it exists
            res.render('login.ejs', { message: req.flash('loginMessage') });
        }
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successReturnToOrRedirect : '/home', // redirect to the secure home section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
};
