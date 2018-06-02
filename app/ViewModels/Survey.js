var util = require('util');

var DatabaseAwareBase = require('../lib/ViewModelBase/DatabaseAware');
var elementRowsToPanels = require('../lib/elementRowsToPanels');

// Construction
var Survey = function(connection, logger) {
    DatabaseAwareBase.call(this, connection, logger);
};
util.inherits(Survey, DatabaseAwareBase);

// Constants
Survey.GetActiveCreatorsQuery = 'SELECT * FROM sq_user u JOIN sq_map_user_to_role m ON u.user_id=m.user_id ' +
    'JOIN sq_role r ON m.role_id=r.role_id WHERE r.role_is_creator=1 AND u.user_active=1';

Survey.GetConventionQuery = 'SELECT * FROM sq_conventions WHERE convention_id=?';

Survey.GetConventionStagesQuery = 'SELECT s.* FROM sq_map_convention_to_stage m JOIN sq_stage s ON ' +
    'm.stage_id=s.stage_id WHERE m.convention_id=?';

Survey.GetEventCreatorQuery = 'SELECT creator_id FROM sq_event_details WHERE event_id=? AND event_version=1';
Survey.GetEventCustomsQuery = 'SELECT * FROM sq_event_customs WHERE event_id=? AND version=?';
Survey.GetEventDetailsQuery = 'SELECT * FROM sq_event_details WHERE event_id=? AND event_version=?';
Survey.GetEventQuery = 'SELECT * FROM sq_events WHERE event_id=?';

Survey.GetFormElementsQuery = 'SELECT * FROM sq_form_elements WHERE template_id=(SELECT template_id ' +
    'FROM sq_conventions WHERE convention_id=?)';

Survey.InserEventQuery = 'INSERT INTO sq_events (event_id, convention_id, event_max_version, ' +
    'event_confirmed_version_manager, event_confirmed_version_creator) VALUES (0, ?, 1, 0, 1)';

Survey.InserEventDetailsQuery = 'INSERT INTO sq_event_details (event_id, stage_id, creator_id, event_title, ' +
    'event_description, event_explaination, event_categories, event_day, event_created, event_time_pre, ' +
    'event_time_post, event_time_dur, event_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?)';

Survey.InsertEventCustomsQuery =
    'INSERT INTO sq_event_customs (event_id, custom_id, version, custom_value) VALUES (?, ?, ?, ?)';

Survey.UpdateCreatorConfirmationQuery = 'UPDATE sq_events SET event_confirmed_version_creator=? WHERE event_id=?';
Survey.UpdateEventMaxVersion = 'UPDATE sq_events SET event_max_version=? WHERE event_id=?';
Survey.UpdateManagerConfirmationQuery = 'UPDATE sq_events SET event_confirmed_version_manager=? WHERE event_id=?';

Survey.WeekDayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper
Survey.formatToIsoDate_ = function(dateTime) {
    if (dateTime == null) {
        return '';
    }
    return (dateTime.getFullYear() + '-' + (dateTime.getMonth() + 1) + '-' + dateTime.getDate());
};

Survey.buildEventData_ = function(creator, event, eventDetails) {
    var isCreationMode = (creator === undefined);
    return {
        id: isCreationMode ? 0 : eventDetails.event_id,
        name: isCreationMode ? '' : eventDetails.event_title,
        stageId: isCreationMode ? '' : eventDetails.stage_id,
        day: isCreationMode ? '' : Survey.formatToIsoDate_(eventDetails.event_day),
        timePre: isCreationMode ? '' : eventDetails.event_time_pre,
        timePost: isCreationMode ? '' : eventDetails.event_time_post,
        timeDur: isCreationMode ? '' : eventDetails.event_time_dur,
        type: isCreationMode ? 'Other' : eventDetails.event_categories,
        description: isCreationMode ? '' : eventDetails.event_description,
        explanation: isCreationMode ? '' : eventDetails.event_explaination,
        version: isCreationMode ? 1 : eventDetails.event_version,
        maxVersion: isCreationMode ? 1 : event.event_max_version,
        creatorId: isCreationMode ? 0 : creator.creator_id,
        versionConfirmedByCreator: isCreationMode ? undefined : event.event_confirmed_version_creator,
        versionConfirmedByManager: isCreationMode ? undefined : event.event_confirmed_version_manager,
    };
};

Survey.buildCustomDataMap_ = function(eventCustomData) {
    if (eventCustomData === undefined) {
        return [];
    }
    var map = [];
    for (var customData of eventCustomData) {
        var customId = '' + customData.custom_id;
        if (map[customId] === undefined) {
            map[customId] = [];
        }
        map[customId].push(customData.custom_value || '');
    }
    return map;
};

Survey.buildElementsData_ = function(elementRows, customDataMap) {
    return elementRowsToPanels(elementRows, customDataMap);
};

Survey.enrichConventionData_ = function(convention) {
    if (convention === undefined) {
        return undefined;
    }

    var end = new Date(convention.date_to);
    var enhanced = convention;
    var start = new Date(convention.date_from);

    enhanced.days = [];
    for (current = start; current <= end; current.setDate(current.getDate() + 1)) {
        var isoDate = Survey.formatToIsoDate_(current);
        var weekDay = Survey.WeekDayMap[current.getDay()] + ', ' + isoDate;
        enhanced.days.push({ isoDate: isoDate, weekDay: weekDay });
    }

    return enhanced;
};

Survey.buildEventDetailsFromSurveyDetails_ = function(surveyId, version, surveyDetails) {
    return [
        surveyId,
        surveyDetails.stageId,
        surveyDetails.creatorId,
        surveyDetails.name,
        surveyDetails.description,
        surveyDetails.explanation,
        surveyDetails.type,
        surveyDetails.date,
        surveyDetails.timeBefore,
        surveyDetails.timeAfter,
        surveyDetails.duration,
        version,
    ];
};

// Methods
Survey.prototype.getSurveyFormData = function(conventionId, surveyId, version, onSuccess, onFailure) {
    var that = this;
    var conId = conventionId || 0;
    var conEventId = surveyId || 0;
    that.multiQuery([
        Survey.GetFormElementsQuery,
        Survey.GetConventionQuery,
        Survey.GetConventionStagesQuery,
        Survey.GetEventQuery,
    ], [conId, conId, conId, conEventId], function(results) {
        var convention = Survey.enrichConventionData_(results[1][0]);
        if (results[3][0] === undefined) {
            var elements = elementRowsToPanels(results[0], []);
            var eventData = Survey.buildEventData_();
            return onSuccess(elements, convention, results[2] || [], eventData, []);
        }

        var versionNumber = (version || event.max_version || 0);
        var eventByVersion = [conEventId, versionNumber];
        that.multiQuery([
            Survey.GetEventDetailsQuery,
            Survey.GetEventCustomsQuery,
            Survey.GetEventCreatorQuery,
            Survey.GetActiveCreatorsQuery,
        ], [eventByVersion, eventByVersion, conEventId, undefined], function(details) {
            var customDataMap = Survey.buildCustomDataMap_(details[1]);
            var elements = elementRowsToPanels(results[0], customDataMap);
            var eventData = Survey.buildEventData_(details[2][0], results[3][0], details[0]);
            onSuccess(elements, convention, results[2] || [], eventData, details[3]);
        });
    }, onFailure);
};

Survey.prototype.updateConfirmation = function(id, version, isForCreator, isForManager, onSuccess, onFailure) {
    var queries = [];
    var params = [];

    if (isForCreator) {
        queries.push(Survey.UpdateCreatorConfirmationQuery);
        params.push([version, id]);
    }
    if (isForManager) {
        queries.push(Survey.UpdateManagerConfirmationQuery);
        params.push([version, id]);
    }

    this.multiQuery(queries, params, onSuccess, onFailure);
};

Survey.prototype.createSurvey = function(data, onSuccess, onFailure) {
    var that = this;
    that.beginTransaction(function(commit, rollback) {
        that.query(Survey.InserEventQuery, [data.conventionId], function(result) {
            var id = result.insertId;
            if (id <= 0) {
                rollback('Got inserted ID <= 0 for sq_events table');
                return;
            }

            var params = [Survey.buildEventDetailsFromSurveyDetails_(id, 1, data)];
            var queries = [Survey.InsertEventDetailsQuery];

            var elements = (data.customFields.length ? data.customFields : []);
            for (var element of elements) {
                params.push([id, 1, element.id, element.value]);
                queries.push(Survey.InsertEventCustomsQuery);
            }

            var onCommit = (function() { commit(function() { onSuccess(id); }); });
            that.multiQuery(queries, params, onCommit, rollback);
        }, rollback);
    }, onFailure);
};

Survey.prototype.updateSurvey = function(id, version, data, isForCreator, isForManager, onSuccess, onFailure) {
    var queries = [Survey.GetEventQuery, Survey.UpdateEventMaxVersion, Survey.InsertEventDetailsQuery];
    var params = [
        [id],
        [version, id],
        Survey.buildEventDetailsFromSurveyDetails_(id, version, data),
    ];

    if (isForCreator) {
        queries.push(Survey.UpdateCreatorConfirmationQuery);
        params.push([version, id]);
    }
    if (isForManager) {
        queries.push(Survey.UpdateManagerConfirmationQuery);
        params.push([version, id]);
    }

    var elements = (data.customFields.length ? data.customFields : []);
    for (var element in elements) {
        params.push([id, version, element.id, element.value]);
        queries.push(Survey.InsertEventCustomsQuery);
    }

    var that = this;
    that.beginTransaction(function(commit, rollback) {
        that.multiQuery(queries, params, function(results) {
            if (results[0].event_id != id) {
                rollback('There exists no survey with ID ' + id);
                return;
            }
            commit(onSuccess);
        }, rollback);
    }, onFailure);
};

module.exports = Survey;