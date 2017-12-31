var LoggerAwareBase = require('./LoggerAware');
var util = require('util');
var waterfall = require('async/waterfall');

// Construction
var DatabaseAware = function(connection, logger) {
    LoggerAwareBase.call(this, logger);
    this.connection = connection;
};
util.inherits(DatabaseAware, LoggerAwareBase);

// Helper
DatabaseAware.prepareQueryArguments_ = function(values, successCallback, failureCallback) {
    var queryArgs = { onFailure: function() {}, onSuccess: function() {} };

    if (util.isFunction(values)) {
        queryArgs.onSuccess = values;
        if (util.isFunction(successCallback)) {
            queryArgs.onFailure = successCallback;
        }
        return queryArgs;
    }

    if (values !== undefined) {
        queryArgs.values = values;
    }
    if (util.isFunction(successCallback)) {
        queryArgs.onSuccess = successCallback;
    }
    if (util.isFunction(failureCallback)) {
        queryArgs.onFailure = failureCallback;
    }
    return queryArgs;
};

DatabaseAware.prepareOnFailureCall_ = function(logger, callback) {
    var onFailure = (util.isFunction(callback) ? callback : function() {});
    return function(error) {
        logger.log(error);
        onFailure(error);
    };
};

DatabaseAware.prepareWaterfallQuery_ = function(connection, query, params) {
    return function(resultLists, fieldLists, callback) {
        connection.query(query, params, function(error, results, fields) {
            if (error) {
                return callback(error, resultLists, fieldLists);
            }
            resultLists.push(results);
            fieldLists.push(fields);
            callback(null, resultLists, fieldLists);
        });
    };
};

// Methods
DatabaseAware.prototype.query = function(query, values, successCallback, failureCallback) {
    var args = DatabaseAware.prepareQueryArguments_(values, successCallback, failureCallback);
    var onFailure = DatabaseAware.prepareOnFailureCall_(this.logger, args.onFailure);

    this.connection.query(query, args.values, function(error, results, fields) {
        if (error) {
            return onFailure(error);
        }
        args.onSuccess(results, fields);
    });
};

DatabaseAware.prototype.multiQuery = function(queries, values, successCallback, failureCallback) {
    var args = DatabaseAware.prepareQueryArguments_(values, successCallback, failureCallback);
    var onFailure = DatabaseAware.prepareOnFailureCall_(this.logger, args.onFailure);

    var queryCalls = [function(callback) {
        callback(null, [], []);
    }];
    args.values = (util.isArray(args.values) ? args.values : []);
    for (var i = 0; i < queries.length; i++) {
        queryCalls.push(DatabaseAware.prepareWaterfallQuery_(this.connection, queries[i], args.values[i]));
    }
    waterfall(queryCalls, function(error, resultLists, fieldLists) {
        if (error) {
            return onFailure(error);
        }
        args.onSuccess(resultLists, fieldLists);
    });
};

DatabaseAware.prototype.beginTransaction = function(successCallback, failureCallback) {
    var connection = this.connection;
    var onFailure = (util.isFunction(failureCallback) ? failureCallback : function() {});
    var onSuccess = (util.isFunction(successCallback) ? successCallback : function() {});
    var onError = DatabaseAware.prepareOnFailureCall_(this.logger, onFailure);

    var rollback = function(error) {
        connection.rollback(function() {
            onFailure(error);
        });
    };
    var commit = function(onCommit) {
        connection.commit(function(error) {
            if (error) {
                return onError(error);
            }
            if (typeof onCommit === 'function') {
                onCommit();
            }
        });
    };

    this.connection.beginTransaction(function(error) {
        if (error) {
            return onError(error);
        }
        onSuccess(commit, rollback);
    });
};

module.exports = DatabaseAware;