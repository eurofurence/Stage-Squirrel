var util = require('util');
var DatabaseAwareBase = require('../lib/ViewModelBase/DatabaseAware');

// Construction
var Convention = function(connection, logger) {
    DatabaseAwareBase.call(this, connection, logger);
};
util.inherits(Convention, DatabaseAwareBase);

// Constants
Convention.CountEventsForConventionQuery = 'SELECT COUNT(*) AS "qty" FROM sq_events WHERE convention_id=?';
Convention.DeleteConventionQuery = 'DELETE FROM sq_conventions WHERE convention_id=?';
Convention.DeleteStageMappingQuery = 'DELETE FROM sq_map_convention_to_stage WHERE convention_id=?';
Convention.GetActivatedUsersQuery = 'SELECT * FROM sq_user WHERE user_active=1 ORDER BY user_name';
Convention.GetConventionsQuery = 'SELECT * FROM sq_conventions ORDER BY date_from ASC';
Convention.GetConventionToStageMapQuery = 'SELECT * FROM sq_map_convention_to_stage';
Convention.GetStagesQuery = 'SELECT * FROM sq_stage';
Convention.GetTemplatesQuery = 'SELECT * FROM sq_form_templates ORDER BY template_created DESC';
Convention.InsertConventionQuery = 'INSERT INTO sq_conventions (template_id, convention_name, convention_description, date_from, date_to) VALUES (?,?,?,?,?)';
Convention.InsertStageMappingQuery = 'INSERT INTO sq_map_convention_to_stage (convention_id, stage_id) VALUES (?,?)';
Convention.UpdateConventionQuery = 'UPDATE sq_conventions SET template_id=?, convention_name=?, convention_description=?, date_from=?, date_to=? WHERE convention_id=?';

// Helper
function formatConventionDate(dateTime) {
    if (dateTime == null) {
        return '-';
    }
    return (dateTime.getFullYear() + '-' + (dateTime.getMonth() + 1) + '-' + dateTime.getDate());
}

function buildConventionsData(conventionRows, conventionToStageMap) {
    var conventionStageIds = [];
    for (var mapping of conventionToStageMap) {
        if (conventionStageIds[mapping.convention_id] === undefined) {
            conventionStageIds[mapping.convention_id] = [];
        }
        conventionStageIds[mapping.convention_id].push(mapping.stage_id);
    }
    var conventions = [];
    for (var row of conventionRows) {
        var convention = Object.create(row);
        convention.date_from = formatConventionDate(row.date_from);
        convention.date_to = formatConventionDate(row.date_to);
        convention.stage_ids = conventionStageIds[row.convention_id] || [];
        conventions.push(convention);
    }
    return conventions;
}

// Methods
Convention.prototype.getConventionsInfo = function(onSuccess, onFailure) {
    var that = this;
    that.multiQuery([
        Convention.GetActivatedUsersQuery,
        Convention.GetConventionsQuery,
        Convention.GetConventionToStageMapQuery,
        Convention.GetStagesQuery,
        Convention.GetTemplatesQuery,
    ], function(results) {
        var conventions = buildConventionsData(results[1], results[2]);
        onSuccess(results[0], conventions, results[3], results[4]);
    }, onFailure);
};

Convention.prototype.createConvention = function(conventionData, onSuccess, onFailure) {
    var that = this;
    var params = [
        conventionData.template,
        conventionData.name,
        conventionData.description,
        new Date(conventionData.start),
        new Date(conventionData.end),
    ];
    that.beginTransaction(function(commit, rollback) {
        that.query(Convention.InsertConventionQuery, params, function(result) {
            if (result.insertId <= 0) {
                rollback('Got inserted ID <= 0 for sq_conventions table');
                return;
            }
            var queries = [];
            var values = [];
            for (var stageId of conventionData.stageIds) {
                queries.push(Convention.InsertStageMappingQuery);
                values.push([result.insertId, stageId]);
            }
            that.multiQuery(queries, values, function() { commit(onSuccess); }, rollback);
        }, rollback);
    }, onFailure);
};

Convention.prototype.updateConvention = function(conventionData, onSuccess, onFailure) {
    var that = this;
    var queries = [Convention.UpdateConventionQuery, Convention.DeleteStageMappingQuery];
    var values = [
        [
            conventionData.template,
            conventionData.name,
            conventionData.description,
            new Date(conventionData.start),
            new Date(conventionData.end),
            conventionData.id,
        ],
        [conventionData.id],
    ];

    for (var stageId of conventionData.stageIds) {
        queries.push(Convention.InsertStageMappingQuery);
        values.push([conventionData.id, stageId]);
    }

    that.beginTransaction(function(commit, rollback) {
        that.multiQuery(queries, values, function() { commit(onSuccess); }, rollback);
    }, onFailure);
};

Convention.prototype.deleteConvention = function(conventionId, onSuccess, onFailure) {
    var that = this;
    that.query(Convention.CountEventsForConventionQuery, [conventionId], function(result) {
        if (result.qty > 0) {
            return onFailure('Delete all connected events, before deleting this convention.');
        }

        var queries = [Convention.DeleteStageMappingQuery, Convention.DeleteConventionQuery];
        var values = [[conventionId], [conventionId];

        that.beginTransaction(function(commit, rollback) {
            that.multiQuery(queries, values, function() { commit(onSuccess); }, rollback);
        }, onFailure);
    }, onFailure);
};

module.exports = Convention;