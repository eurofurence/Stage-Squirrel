var config = require('../config/config.js');
var connection = require('./lib/databaseConnection')(config.database);
var util = require('./lib/utilities');
var url = require('url');

// Telegram Bot Options
var bot = require('node-telegram-bot-api');
try {
    var locale = require('../config/locale_' + config.locale);
} catch (ex) {
    var locale = require('../config/locale_en');
}
var api_token = "";

var urlParsed = url.parse(config.baseurl);
var baseUrl = (urlParsed.protocol + '//' + urlParsed.host + urlParsed.pathname);

var feedbackid = config.telegramfeedbackid;
var telegram = null;
connection.query("SELECT configuration_value FROM sq_configuration WHERE configuration_key = 'TELEGRAM_API_TOKEN'", function(err, result) {
    api_token = result[0].configuration_value;
    startBot();
});
refreshDBs();

//DBs for fast access
var userdb = [];
var roledb = [];

function refreshDBs() {
    connection.query('SELECT * from sq_user where user_active = 1', function(err, userrows) {
        connection.query('SELECT * from sq_role where role_is_active = 1', function(err, rolerows) {
            connection.query('SELECT * from sq_map_user_to_role', function(err, mapuserrolerows) {
                userdb = [];
                roledb = [];
                eventdb = [];
                for (role of rolerows) {
                    roledb[role.role_id] = role;
                }
                for (one_user of userrows) {
                    userdb[one_user.user_id] = one_user;
                    userdb[one_user.user_id].roles = [];
                    for (mappings of mapuserrolerows) {
                        if (mappings.user_id == one_user.user_id) {
                            var role = roledb[mappings.role_id];
                            role.notification = mappings.notification;
                            role.notification_creator_only = mappings.notification_creator_only;
                            if (role.role_is_admin == 1) { userdb[one_user.user_id].isAdmin = 1; }
                            if (role.role_is_manager == 1) { userdb[one_user.user_id].isManager = 1; }
                            if (role.role_is_creator == 1) { userdb[one_user.user_id].isCreator = 1; }
                            userdb[one_user.user_id].roles.push(role);
                        }
                    }
                }
            });
        });
    });
}

function startBot() {
    if (api_token == "") {
        console.log("No Telegram API Key provided. Bot is disabled.")
    } else {
        telegram = new bot(
            api_token, { polling: true }
        );

        // handle incoming messages
        telegram.on('message', (message) => {
            console.log(message);
            if (message.text.substring(0, 6) === "/start") {
                connection.query('select * from sq_user where user_telegram_id = ?', message.chat.id, function(err, rows) {
                    if (rows.length == 0) {
                        telegram.sendMessage(message.chat.id, locale.telegram_start);
                    } else {
                        if (rows[0].user_telegram_linked == '0') {
                            telegram.sendMessage(message.chat.id, locale.telegram_start_activate);
                        } else {
                            if (rows[0].user_telegram_active == '0') {
                                connection.query('UPDATE sq_user SET user_telegram_active = 1 WHERE user_telegram_id = ?', message.chat.id, function(err, rows) {
                                    telegram.sendMessage(message.chat.id, locale.telegram_start_reactivate);
                                });
                            } else {
                                telegram.sendMessage(message.chat.id, 'The StageSquirrel-Bot is already activated.');
                            }
                        }
                    }

                });
            } else if (message.text.substring(0, 5) === "/stop") {
                connection.query('select * from sq_user where user_telegram_id = ?', message.chat.id, function(err, rows) {
                    if (rows.length == 0) {
                        telegram.sendMessage(message.chat.id, 'You can not stop that bot when your account is not linked, because we do not know you.');
                    } else {
                        if (rows[0].user_telegram_linked == '0') {
                            telegram.sendMessage(message.chat.id, 'You need to successfully link Telegram and the Stagesquirrel Bot first.');
                        } else {
                            if (rows[0].user_telegram_active == '1') {
                                connection.query('UPDATE sq_user SET user_telegram_active = 0 WHERE user_telegram_id = ?', message.chat.id, function(err, rows) {
                                    telegram.sendMessage(message.chat.id, 'You deactivated the StageSquirrel-Bot.');
                                });
                            } else {
                                telegram.sendMessage(message.chat.id, 'The StageSquirrel-Bot is already deactivated.');
                            }
                        }
                    }

                });
            } else if (message.text.substring(0, 5) === "/link") {
                if (message.text.length < 7) {
                    telegram.sendMessage(message.chat.id, 'You need to specify a username with /link username.');
                } else {
                    if (message.text.substring(5, 6) != " ") {
                        telegram.sendMessage(message.chat.id, 'There must be a space between /link and your username.');
                    } else {
                        connection.query('select * from sq_user where user_telegram_id = ?', message.chat.id, function(err, rows) {
                            if (rows.length == 0 || rows[0].user_telegram_linked == '0') {
                                var now = new Date();
                                var validThru = new Date(now.getTime() + (60000 * 10));
                                var varifyCode = util.generateCode(6);
                                connection.query('UPDATE sq_user SET user_telegram_id = ?, user_telegram_confirmation_key = ?, user_telegram_confirmation_valid_to = ? WHERE user_name = ?', [message.chat.id, varifyCode, util.getTimeJStoSQL(validThru), message.text.substring(6)], function(err, rows) {
                                    telegram.sendMessage(message.chat.id, 'The username ' + message.text.substring(6) + ' can now link Telegram and StageSquirrel by using the following code on the StageSquirrel Profile Settings: ' + varifyCode + ' (This code will only be valid till ' + validThru.toLocaleTimeString() + ')');
                                });
                            } else {
                                telegram.sendMessage(message.chat.id, 'Telegram and the StageSquirrel-Bot are already linked.');
                            }

                        });
                    }
                }
            } else if (message.text.substring(0, 7) === "/unlink") {
                connection.query('select * from sq_user where user_telegram_id = ?', message.chat.id, function(err, rows) {
                    if (rows.length == 0 || rows[0].user_telegram_linked == '0') {
                        telegram.sendMessage(message.chat.id, 'Telegram and the StageSquirrel-Bot are not linked.');
                    } else {
                        connection.query('UPDATE sq_user SET user_telegram_id = null, user_telegram_linked = 0 WHERE user_telegram_id = ?', message.chat.id, function(err, rows) {
                            telegram.sendMessage(message.chat.id, 'You successfully unlinked Telegram and the StageSquirrel-Bot.');
                        });
                    }
                });
            } else if (message.text.substring(0, 9) === "/feedback" && message.text.length > 10 && feedbackid != '') {
                connection.query('select * from sq_user where user_telegram_id = ?', message.chat.id, function(err, rows) {
                    if (rows.length > 0 && rows[0].user_telegram_linked == '1') {
                        telegram.sendMessage(feedbackid, 'You got a feedback message: ' + message.text.substring(10));
                        telegram.sendMessage(message.chat.id, 'Thanks for your feedback.');
                    }
                });
            }
        });
    }
}

// notifications
module.exports = {
    notifyById: function(id, content) {
        telegram.sendMessage(id, content);
    },
    notify: function(typeId, eventId, versionId, senderId, roleId) {
        refreshDBs();
        console.log(typeId + " / " + eventId + " / " + versionId + " / " + senderId + " / " + roleId);
        connection.query('SELECT * FROM sq_user WHERE user_telegram_id IS NOT null AND user_telegram_linked = 1 AND user_telegram_active = 1 AND user_active = 1', function(err, userrows) {
            // 1 Event Manager creates Event / inform Stage Managers
            if (typeId == 1) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = ?', [eventId, versionId], function(err, eventrows) {
                    for (one_user of userrows) {
                        if (userdb[one_user.user_id].isManager) {
                            telegram.sendMessage(one_user.user_telegram_id, "User *" + userdb[senderId].user_name + "* created the new event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nPlease change or confirm the Stage Survey under [this link](" + baseUrl + "create?id=" + eventId + ").", { parse_mode: "markdown" });
                        }
                    }
                });
            }

            // 2 Event Manager changes Event / inform Stage Managers of new version
            else if (typeId == 2) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = ?', [eventId, versionId], function(err, eventrows) {
                    for (one_user of userrows) {
                        if (userdb[one_user.user_id].isManager) {
                            telegram.sendMessage(one_user.user_telegram_id, "User *" + userdb[senderId].user_name + "* made changes to the event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nPlease confirm the new version " + versionId + " of the Stage Survey under [this link](" + baseUrl + "create?id=" + eventId + ").", { parse_mode: "markdown" });
                        }
                    }
                });
            }

            // 3 Stage Manager changes Event / inform Event Manager of new version
            else if (typeId == 3) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = ?', [eventId, versionId], function(err, eventrows) {
                    telegram.sendMessage(userdb[eventrows[0].creator_id].user_telegram_id, "Manager *" + userdb[senderId].user_name + "* made changes to your event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nPlease confirm the new version " + versionId + " of the Stage Survey under [this link](" + baseUrl + "create?id=" + eventId + ").", { parse_mode: "markdown" });
                });
            }

            // 4 EventMgr accepted Event / inform Stage Manager
            else if (typeId == 4) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = ?', [eventId, versionId], function(err, eventrows) {
                    for (one_user of userrows) {
                        if (userdb[one_user.user_id].isManager) {
                            telegram.sendMessage(one_user.user_telegram_id, "User *" + userdb[senderId].user_name + "* confirmed version " + versionId + " for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nYou can find the Stage Survey under [this link](" + baseUrl + "create?id=" + eventId + ").", { parse_mode: "markdown" });
                        }
                    }
                });
            }

            // 5 StageMgr accepted Event / inform Event Manager
            else if (typeId == 5) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = ?', [eventId, versionId], function(err, eventrows) {
                    telegram.sendMessage(userdb[eventrows[0].creator_id].user_telegram_id, "Manager *" + userdb[senderId].user_name + "* confirmed version " + versionId + " for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nYou can find the Stage Survey under [this link](" + baseUrl + "create?id=" + eventId + ").", { parse_mode: "markdown" });
                });
            }

            // 6 Stage Manager creates Rider / inform Responsible / inform Event Manager with time
            else if (typeId == 6) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = sq_events.event_max_version', eventId, function(err, eventrows) {
                    connection.query('SELECT * FROM sq_map_riders_to_roles WHERE event_id = ? AND version = ?', [eventId, versionId], function(err, rolerows) {
                        for (role of rolerows) {
                            if (userdb[role.responsible_id].user_telegram_id != null && userdb[role.responsible_id].user_telegram_linked == 1 && userdb[role.responsible_id].user_telegram_active == 1) {
                                telegram.sendMessage(userdb[role.responsible_id].user_telegram_id, "Manager *" + userdb[senderId].user_name + "* created the Stage Rider for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nYou are responsible for the role " + roledb[role.role_id].role_title + ". Please confirm your role under [this link](" + baseUrl + "rider?id=" + eventId + "#" + roledb[role.role_id].role_title.toLowerCase() + ").", { parse_mode: "markdown" });
                            }
                        }
                        connection.query('SELECT * FROM sq_riders WHERE event_id = ?', eventId, function(err, riderrows) {
                            var startdate = riderrows[0].startdate;
                            if (userdb[riderrows[0].manager_id].user_telegram_id != null && userdb[riderrows[0].manager_id].user_telegram_linked == 1 && userdb[riderrows[0].manager_id].user_telegram_active == 1) {
                                telegram.sendMessage(userdb[riderrows[0].manager_id].user_telegram_id, "Manager *" + userdb[senderId].user_name + "* created the Stage Rider for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\n The event will start at " + startdate.getHours() + ":" + startdate.getMinutes() + ".", { parse_mode: "markdown" });
                            }
                        });
                    });
                });
            }

            // 7 Responsible confirms Rider / inform Role
            else if (typeId == 7) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = sq_events.event_max_version', eventId, function(err, eventrows) {
                    for (one_user of userrows) {
                        for (one_role of userdb[one_user.user_id].roles) {
                            if (one_role.role_id == roleId && one_user.user_id != senderId) {
                                telegram.sendMessage(userdb[one_user.user_id].user_telegram_id, "Responsible for " + roledb[roleId].role_title + " *" + userdb[senderId].user_name + "* confirmed version " + versionId + " for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nYou can find the Stage Rider under [this link](" + baseUrl + "rider?id=" + eventId + "#" + roledb[roleId].role_title.toLowerCase() + ").", { parse_mode: "markdown" });
                            }
                        }
                    }
                });
            }

            // 8 Stage Manager confirms Rider / inform all
            else if (typeId == 8) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = sq_events.event_max_version', eventId, function(err, eventrows) {
                    connection.query('SELECT * FROM sq_map_riders_to_roles WHERE event_id = ? AND version = ?', [eventId, versionId], function(err, rolerows) {
                        var confirmed = true;
                        for (role of rolerows) {
                            if (role.confirmed_version_responsible == 0) {
                                confirmed = false;
                            }
                        }
                        if (confirmed) {
                            for (one_user of userrows) {
                                if (!userdb[one_user.user_id].isCreator && one_user.user_id != senderId) {
                                    telegram.sendMessage(userdb[one_user.user_id].user_telegram_id, "Manager *" + userdb[senderId].user_name + "* confirmed version " + versionId + " for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nYou can find the Stage Rider under [this link](" + baseUrl + "rider?id=" + eventId + ").", { parse_mode: "markdown" });
                                }
                            }
                        }
                    });
                });
            }

            // 9 Responsible change Rider / inform Stage Manager
            else if (typeId == 9) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = sq_events.event_max_version', eventId, function(err, eventrows) {
                    for (one_user of userrows) {
                        if (userdb[one_user.user_id].isManager) {
                            telegram.sendMessage(userdb[one_user.user_id].user_telegram_id, "Responsible for " + roledb[roleId].role_title + " *" + userdb[senderId].user_name + "* changed the Stage Rider to version " + versionId + " for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nPlease confirm the changes of the Stage Rider under [this link](" + baseUrl + "rider?id=" + eventId + "#" + roledb[roleId].role_title.toLowerCase() + ").", { parse_mode: "markdown" });
                        }
                    }
                });
            }

            // 10 Stage Manager change Role of Rider / inform role
            else if (typeId == 10) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = sq_events.event_max_version', eventId, function(err, eventrows) {
                    for (one_user of userrows) {
                        for (one_role of userdb[one_user.user_id].roles) {
                            if (one_role.role_id == roleId && one_user.user_id != senderId) {
                                telegram.sendMessage(userdb[one_user.user_id].user_telegram_id, "Manager *" + userdb[senderId].user_name + "* changed information for role " + roledb[roleId].role_title + " to version " + versionId + " for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nYou can find the Stage Rider under [this link](" + baseUrl + "rider?id=" + eventId + "#" + roledb[roleId].role_title.toLowerCase() + ").", { parse_mode: "markdown" });
                            }
                        }
                    }
                });
            }

            // 11 Stage Manager change General Rider / inform all
            else if (typeId == 11) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = sq_events.event_max_version', eventId, function(err, eventrows) {
                    for (one_user of userrows) {
                        if (!userdb[one_user.user_id].isCreator && one_user.user_id != senderId) {
                            telegram.sendMessage(userdb[one_user.user_id].user_telegram_id, "Manager *" + userdb[senderId].user_name + "* changed information for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nYou can find the Stage Rider under [this link](" + baseUrl + "rider?id=" + eventId + "#" + roledb[roleId].role_title.toLowerCase() + ").", { parse_mode: "markdown" });
                        }
                    }
                });
            }

            // 12 anybody writes commentary / inform roles
            else if (typeId == 12) {
                connection.query('SELECT * FROM sq_events join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id = ? and sq_event_details.event_version = sq_events.event_max_version', eventId, function(err, eventrows) {
                    telegram.sendMessage(userdb[eventrows[0].creator_id].user_telegram_id, "Manager *" + userdb[senderId].user_name + "* confirmed version " + versionId + " for event \n``` " + eventId + ": " + eventrows[0].event_title + " ```\nYou can find the Stage Survey under [this link](" + baseUrl + "create?id=" + eventId + ").", { parse_mode: "markdown" });
                });
            }

            // 13 User registers  / inform admin
            else if (typeId == 13) {
                for (one_user of userrows) {
                    if (userdb[one_user.user_id].isAdmin) {
                        telegram.sendMessage(userdb[one_user.user_id].user_telegram_id, "The new user *" + userdb[senderId].user_name + "* registered recently and waits for confirmation. You can activate users in the Admin Control Panel under [this link](" + baseUrl + "admin).", { parse_mode: "markdown" });
                    }
                }
            }

            // 14 User account is confirmed
            else if (typeId == 14) {
                // we will not send a message for every registered user.
            }

            // 15 IP Ban / inform admin
            else if (typeId == 15) {
                for (one_user of userrows) {
                    if (userdb[one_user.user_id].isAdmin) {
                        telegram.sendMessage(userdb[one_user.user_id].user_telegram_id, "Stage Squirrel registered a new ip ban. You can get further information in hte log file.", { parse_mode: "markdown" });
                    }
                }
            }
        });
    },
    readToken: function(newToken) {
        api_token = newToken;
        startBot();
    }
}