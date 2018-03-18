var isLoggedIn = require('../middleware/isLoggedIn');
var managerGuard = require('../middleware/guard/manager');
var ViewModel = require('../ViewModels/Convention');

// =====================================
// MANAGE CONVENTIONS ==================
// =====================================
module.exports = function(app, passport, connection) {
    var viewModel = new ViewModel(connection);

    // show the admin config
    app.get('/convention', isLoggedIn, managerGuard, function(req, res) {
        viewModel.getConventionsInfo(function(activatedUsers, conventions, stages, templates) {
            res.render('convention.ejs', {
                nav: 'convention',
                user: req.user,
                users: activatedUsers,
                conventions: conventions,
                templates: templates,
                stages: stages,
            });
        }, function(error) {
            req.flashError(error);
            res.redirect('/home');
        });
    });

    app.post('/convention', isLoggedIn, managerGuard, function(req, res) {
        var conventionData = {
            description: req.body.convention_desc,
            end: req.body.end,
            id: req.body.convention_id,
            name: req.body.convention_name,
            stageIds: req.body.convention_stage,
            start: req.body.start,
            template: req.body.convention_template,
        };

        var onSuccess = function() { res.redirect('/convention'); };
        var onFailure = function(error) {
            req.flashError(error);
            res.redirect('/convention');
        };

        if (req.body.actionType == "create") {
            if (conventionData.id > 0) {
                return viewModel.updateConvention(conventionData, onSuccess, onFailure);
            }
            return viewModel.createConvention(conventionData, onSuccess, onFailure);
        } else if (req.body.actionType == "delete") {
            return viewModel.deleteConvention(conventionData.id, onSuccess, onFailure);
        }
    });
};