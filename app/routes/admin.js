var adminGuard = require('../middleware/guard/admin');
var isLoggedIn = require('../middleware/isLoggedIn');
var ViewModel = require('../ViewModels/Admin');

// =====================================
// ADMIN ===============================
// =====================================
module.exports = function(app, passport, connection, notifier) {
    var viewModel = new ViewModel(connection);

    // show the admin config
    app.get('/admin', isLoggedIn, adminGuard, function(req, res) {
        viewModel.getSettingsAndUsers(function(data) {
            var context = data;
            context.nav = 'admin';
            context.user = req.user;
            res.render('admin.ejs', context);
        });
    });

    // process the settings form
    app.post('/admin/settings', isLoggedIn, adminGuard, function(req, res) {
        viewModel.updateSettings(req.body.settings, function() {
            res.redirect('/admin');
        });
    });

    // process the user-activation form
    app.post('/admin/user-activation', isLoggedIn, adminGuard, function(req, res) {
        var userId = (req.body.activation || req.body.deactivation);
        if (userId !== undefined) {
            var activate = (userId === req.body.activation);
            viewModel.updateUserActivation(userId, activate, function() {
                if (activate) {
                    notifier.notify(14, null, null, userId, null);
                }
                res.redirect('/admin');
            });
        }
    });
};