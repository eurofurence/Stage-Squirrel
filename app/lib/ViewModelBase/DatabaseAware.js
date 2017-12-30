var util = require('util');
var LoggerAwareBase = require('./LoggerAware');

// Construction
var DatabaseAware = function(connection, logger) {
    LoggerAwareBase.call(this, logger);
    this.connection = connection;
};
util.inherits(DatabaseAware, LoggerAwareBase);

// Methods
DatabaseAware.prototype.query = function(query, values, successCallback, failureCallback) {
    var logger = this.logger;
    var failureCb, params, successCb;

    if (typeof failureCallback === 'function') {
        failureCb = failureCallback;
    }
    if (typeof values === 'function') {
        successCb = values;
    }
    if (typeof successCallback === 'function' && values !== undefined) {
        successCb = successCallback;
        params = values;
    }

    this.connection.query(query, params, function(error, results, fields) {
        if (error) {
            logger.log(error);
            if (failureCb !== undefined) {
                failureCb(error);
            }
        } else {
            if (successCb !== undefined) {
                successCb(results, fields);
            }
        }
    });
};

module.exports = DatabaseAware;