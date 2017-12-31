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
Admin.prototype.getSettingsAndUsers = function(onSuccess, onFailure) {
    this.multiQuery([Admin.GetSettingsQuery, Admin.GetUsersQuery], function(results) {
        onSuccess(results[0], results[1]);
    }, onFailure);
};

Admin.prototype.updateSettings = function(settingsByKey, onSuccess, onFailure) {
    var that = this;
    that.query(Admin.GetSettingsQuery, function(oldSettings) {
        var queries = [];
        var values = [];

        for (var oldSetting of oldSettings) {
            var key = oldSetting.configuration_key;
            var newValue = settingsByKey[key];
            if (newValue !== oldSetting.configuration_value) {
                queries.push(Admin.UpdateSettingsQuery);
                values.push([newValue, key]);
                //if (key == 'TELEGRAM_API_TOKEN') {
                //  telegram.readToken(oldSetting.configuration_value);
                //}
            }
        }

        that.beginTransaction(function(commit, rollback) {
            that.multiQuery(queries, values, function() { commit(onSuccess); }, rollback);
        }, onFailure);
    });
};

Admin.prototype.updateUserActivation = function(id, activate, onSuccess, onFailure) {
    this.query(Admin.UpdateUserActivation, [activate, id], onSuccess, onFailure);
};

module.exports = Admin;