var util = require('util');

var creatorOrManagerGuard = require('../middleware/guard/creatorOrManager');
var isLoggedIn = require('../middleware/isLoggedIn');
var ViewModel = require('../ViewModels/Survey');

// =====================================
// CREATE ==============================
// =====================================
module.exports = function(app, passport, connection, notifier) {
    var viewModel = new ViewModel(connection);

    app.get('/create', isLoggedIn, creatorOrManagerGuard, function(req, res) {
        viewModel.getSurveyFormData(
            req.user.currentConvention.convention_id,
            req.query.id,
            req.query.version,
            function(elements, convention, stages, eventData, creators) {
                if (convention === undefined) {
                    req.flashInfo('There is no convention ahead, for which you could create a survey.');
                    res.redirect('/convention');
                    return;
                }
                var isCreationMode = (eventData.creatorId === 0);
                if (isCreationMode || eventData.creatorId === req.user.user_id || req.user.isManager) {
                    res.render('create.ejs', {
                        convention: convention,
                        creatorId: eventData.creatorId || req.user.user_id,
                        creatorsList: creators,
                        elements: elements,
                        event: eventData,
                        isCreationMode: isCreationMode,
                        nav: 'create',
                        stages: stages,
                        user: req.user,
                    });
                }
            },
            function(error) {
                req.flashError(error);
                res.redirect('/home');
            }
        );
    });

    app.post('/create', isLoggedIn, creatorOrManagerGuard, function(req, res) {
        // No convention ahead, let's get the hell outa here!
        var conventionId = parseInt(req.user.currentConvention.convention_id);
        if (conventionId < 1) {
            req.flashInfo('No convention lying ahead. You cannot add surveys for past events, though.');
            res.redirect('/convention');
            return;
        }

        var creatorId = parseInt(req.body.event_manager);
        var surveyId = parseInt(req.body.event_id);
        var userId = parseInt(req.user.user_id);
        var version = Math.max(1, parseInt(req.body.version));

        var isManager = req.user.isManager;
        var isCreator = (userId == creatorId);

        var onFailure = function(error) {
            req.flashError(error);
            var params = (surveyId > 0 ? ('?id=' + surveyId + '&version=' + version) : '');
            res.redirect('/create' + params);
        };

        // Check, if we got a confirmation request for a survey ...
        var acceptType = (req.body.accept || '');
        if (surveyId > 0 && ['creator', 'manager'].indexOf(acceptType) > -1) {
            var isForCreator = (acceptType == 'creator' && isCreator);
            var isForManager = (acceptType == 'manager' && isManager);

            if (!(isForCreator || isForManager)) {
                res.redirect('/create?id=' + surveyId + '&version=' + version);
                return;
            }

            // Update the respective confirmation settings and trigger the telegram bot on success
            viewModel.updateConfirmation(surveyId, version, isForCreator, isForManager, function() {
                if (isForCreator) {
                    notifier.notify(4, surveyId, version, userId, null);
                }
                if (isForManager) {
                    notifier.notify(5, surveyId, version, userId, null);
                }
                res.redirect('/create?id=' + surveyId + '&version=' + version);
            }, onFailure);
            return;
        }

        // Get the survey form data together, custom-fields from template, first.
        var customFields = [];
        for (var key in req.body) {
            if (key.startsWith('custom')) {
                var value = req.body[key];
                customFields.push({
                    id: key.replace('custom', ''),
                    value: (util.isArray(value) ? value.join("\r\n") : value),
                });
            }
        }
        var survey = {
            conventionId: conventionId,
            creatorId: creatorId,
            customFields: customFields,
            date: req.body.event_date,
            description: req.body.event_desc,
            duration: req.body.time_dur,
            explanation: req.body.event_expl,
            name: req.body.event_name,
            stageId: parseInt(req.body.stage_id),
            timeAfter: req.body.time_post,
            timeBefore: req.body.time_pre,
            type: req.body.event_type.toString().replace(',', ';'),
        };

        // Create survey, if we do not have a valid surveyId and return!
        if (surveyId < 1) {
            viewModel.createSurvey(survey, function(createdSurveyId) {
                notifier.notify(1, createdSurveyId, 1, userId, null);
                res.redirect('/create?id=' + createdSurveyId + '&version=1');
            }, onFailure);
            return;
        }

        // Update existing survey, if we have a valid surveyId; plus update its confirmation status, too!
        var nextVersion = (version + 1);
        viewModel.updateSurvey(surveyId, nextVersion, survey, isCreator, isManager, function() {
            if (isCreator) {
                notifier.notify(2, surveyId, nextVersion, userId, null);
            }
            if (isManager) {
                notifier.notify(3, surveyId, nextVersion, userId, null);
            }
            res.redirect('/create?id=' + surveyId + '&version=' + nextVersion);
        }, onFailure);
    });
};