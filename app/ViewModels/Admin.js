var util = require('util');
var DatabaseAwareBase = require('../lib/ViewModelBase/DatabaseAware');

// Construction
var Admin = function(connection, logger) {
    DatabaseAwareBase.call(this, connection, logger);
};
util.inherits(Admin, DatabaseAwareBase);

// Constants
Admin.GetSettingsQuery = 'SELECT * FROM sq_configuration;';
Admin.GetUsersQuery = 'SELECT * FROM sq_user ORDER BY user_active;';
Admin.UpdateSettingsQuery = 'UPDATE sq_configuration SET configuration_value=? WHERE configuration_key=?;';
Admin.UpdateUserActivation = 'UPDATE sq_user SET user_active=? WHERE user_id=?;';

// Methods
Admin.prototype.getSettingsAndUsers = function(callback) {
    var that = this;
    that.query(Admin.GetSettingsQuery, function(settings) {
        that.query(Admin.GetUsersQuery, function(users) {
            callback({ settings: settings, users: users });
        });
    });
};

Admin.prototype.updateSettings = function(settingsByKey, callback) {
    var that = this;
    that.query(Admin.GetSettingsQuery, function(oldSettings) {
        oldSettings.forEach(function(oldSetting) {
            var key = oldSetting.configuration_key;
            var newValue = settingsByKey[key];
            if (newValue !== oldSetting.configuration_value) {
                that.query(Admin.UpdateSettingsQuery, [newValue, key], callback);
                //if (oldSetting.configuration_key == 'TELEGRAM_API_TOKEN') {
                //  telegram.readToken(oldSetting.configuration_value);
                //}
            }
        });
    });
};

Admin.prototype.updateUserActivation = function(id, activate, callback) {
    this.query(Admin.UpdateUserActivation, [activate, id], callback);
};

module.exports = Admin;