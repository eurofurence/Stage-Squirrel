var util = require('util');

var DatabaseAwareBase = require('../lib/ViewModelBase/DatabaseAware');
var elementRowsToPanels = require('../lib/elementRowsToPanels');

// Construction
var Create = function(connection, logger) {
    DatabaseAwareBase.call(this, connection, logger);
};
util.inherits(Create, DatabaseAwareBase);

// Constants
Create.GetActiveCreatorsQuery = 'SELECT * FROM sq_user u JOIN sq_map_user_to_role m ON u.user_id=m.user_id JOIN sq_role r ON m.role_id=r.role_id WHERE r.role_is_creator=1 AND u.user_active=1';
Create.GetConventionQuery = 'SELECT * FROM sq_conventions WHERE convention_id=?';
Create.GetConventionStagesQuery = 'SELECT s.* FROM sq_map_convention_to_stage m JOIN sq_stage s ON m.stage_id=s.stage_id WHERE m.convention_id=?';
Create.GetEventCreatorQuery = 'SELECT creator_id FROM sq_event_details WHERE event_id=? AND event_version=1';
Create.GetEventCustomsQuery = 'SELECT * FROM sq_event_customs WHERE event_id=? AND version=?';
Create.GetEventDetailsQuery = 'SELECT * FROM sq_event_details WHERE event_id=? AND event_version=?';
Create.GetEventQuery = 'SELECT * FROM sq_events WHERE event_id=?';
Create.GetFormElementsQuery = 'SELECT * FROM sq_form_elements WHERE template_id=(SELECT template_id FROM sq_conventions WHERE convention_id=?)';
Create.WeekDayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper
Create.formatToIsoDate_ = function(dateTime) {
    if (dateTime == null) {
        return '';
    }
    return (dateTime.getFullYear() + '-' + (dateTime.getMonth() + 1) + '-' + dateTime.getDate());
};

Create.buildEventData_ = function(creator, event, eventDetails) {
    var isCreationMode = (creator === undefined);
    return {
        id: isCreationMode ? 0 : eventDetails.event_id,
        name: isCreationMode ? '' : eventDetails.event_title,
        stageId: isCreationMode ? '' : eventDetails.stage_id,
        day: isCreationMode ? '' : Create.formatToIsoDate_(eventDetails.event_day),
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

Create.buildCustomDataMap_ = function(eventCustomData) {
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

Create.buildElementsData_ = function(elementRows, customDataMap) {
    return elementRowsToPanels(elementRows, customDataMap);
};

Create.enrichConventionData_ = function(convention) {
    if (convention === undefined) {
        return undefined;
    }

    var end = new Date(convention.date_to);
    var enhanced = convention;
    var start = new Date(convention.date_from);

    enhanced.days = [];
    for (current = start; current <= end; current.setDate(current.getDate() + 1)) {
        var isoDate = Create.formatToIsoDate_(current);
        var weekDay = Create.WeekDayMap[current.getDay()] + ', ' + isoDate;
        enhanced.days.push({ isoDate: isoDate, weekDay: weekDay });
    }

    return enhanced;
};

// Methods
Create.prototype.getEventFormInfo = function(conventionId, eventId, version, onSuccess, onFailure) {
    var that = this;
    var conId = conventionId || 0;
    var conEventId = eventId || 0;
    that.multiQuery([
        Create.GetFormElementsQuery,
        Create.GetConventionQuery,
        Create.GetConventionStagesQuery,
        Create.GetEventQuery,
    ], [conId, conId, conId, conEventId], function(results) {
        var convention = Create.enrichConventionData_(results[1][0]);
        if (results[3][0] === undefined) {
            var customDataMap = Create.buildCustomDataMap_();
            var elements = Create.buildElementsData_(results[0], customDataMap);
            var eventData = Create.buildEventData_();
            return onSuccess(elements, convention, results[2] || [], eventData, customDataMap, []);
        }

        var versionNumber = version || event.max_version || 0;
        var eventByVersion = [conEventId, versionNumber];
        that.multiQuery([
            Create.GetEventDetailsQuery,
            Create.GetEventCustomsQuery,
            Create.GetEventCreatorQuery,
            Create.GetActiveCreatorsQuery,
        ], [eventByVersion, eventByVersion, conEventId, undefined], function(details) {
            var customDataMap = Create.buildCustomDataMap_(details[1]);
            var elements = Create.buildElementsData_(results[0], customDataMap);
            var eventData = Create.buildEventData_(details[2][0], results[3][0], details[0]);
            onSuccess(elements, convention, results[2] || [], eventData, customDataMap, details[3]);
        });
    }, onFailure);
};

module.exports = Create;