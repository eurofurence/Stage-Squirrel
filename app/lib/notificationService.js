var util = require('./utilities');

var CHECK_TELEGRAM_ACTIVE_QUERY = [
    "SELECT configuration_value ",
    "FROM sq_configuration ",
    "WHERE configuration_key = 'TELEGRAM_API_TOKEN'"
].join('');
var INSERT_NOTIFICATION_QUERY = [
    "INSERT INTO sq_notifications",
        "(`type_id`, `event_id`, `convention_id`, `version_id`, `sender_id`, `role_id`, `created_on`)",
    " VALUES ",
        "(?, ?, (SELECT convention_id from sq_events where sq_events.event_id = ?), ?, ?, ?, ?)",
    ";"
].join('');

var connection;
var isTelegramActive = false;
var telegram;

// NotificationService
var addNotification = function(typeId, eventId, versionId, senderId, roleId) {
    var now = new Date();
    var params = [
        typeId,
        eventId,
        eventId,
        versionId,
        senderId,
        roleId,
        util.getTimeJStoSQL(now)
    ];
    connection.query(INSERT_NOTIFICATION_QUERY, params, function(err,state){
        if(err) {
            console.log(err);
        }
    });
    if (isTelegramActive) {
        telegram.notify(typeId, eventId, versionId, senderId, roleId);
    }
};

module.exports = function(telegramIntegration, databaseConnection) {
    connection = databaseConnection || {};
    telegram = telegramIntegration;

    if (connection.query &&
        typeof connection.query !== 'function'
    ) {
        connection.query = function () {};
        console.warn('WARNING: No valid "database connection" available for "notificationService".');
    }

    if (typeof telegram !== 'undefined') {
        connection.query(CHECK_TELEGRAM_ACTIVE_QUERY, function (err, result) {
            if (result &&
                result.length &&
                result[0].configuration_value
            ) {
                isTelegramActive = true;
            }
        });
    }

    return {
        active: isTelegramActive,
        notify: addNotification
    };
};