var isLoggedIn = require('../middleware/isLoggedIn');
var managerGuard = require('../middleware/guard/manager');

// =====================================
// MANAGE STAGES =======================
// =====================================
module.exports = function(app, passport, connection) {
    // show the admin config
    app.get('/stages', isLoggedIn, managerGuard, function(req, res) {
        connection.query('SELECT sq_stage.*, count(sq_conventions.convention_id) AS qty from sq_stage left join sq_map_convention_to_stage on sq_stage.stage_id = sq_map_convention_to_stage.stage_id left join sq_conventions on sq_conventions.convention_id = sq_map_convention_to_stage.convention_id group by sq_stage.stage_id', function(err, stagerows) {
            res.render('stages.ejs', {
                nav: 'stages',
                user: req.user,
                stages: stagerows,
            });
        });
    });

    app.post('/stages', isLoggedIn, managerGuard, function(req, res) {
        if (req.body.actionType == "create") {
            var params = [req.body.stage_name, req.body.stage_desc];
            if (req.body.stage_id == 0) {
                connection.query("INSERT INTO sq_stage (stage_name, stage_description) VALUES (?, ?)", params, function(err, state) {
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                connection.query("UPDATE sq_stage SET stage_name = ?, stage_description = ? WHERE `stage_id` = '" + req.body.stage_id + "'", params, function(err, state) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        } else if (req.body.actionType == "delete") {
            connection.query("SELECT count(*) AS qty from sq_map_convention_to_stage WHERE stage_id = '" + req.body.stage_id + "'", function(err, events) {
                if (events[0].qty == 0) {
                    connection.query("DELETE FROM sq_stage WHERE `stage_id` = '" + req.body.stage_id + "'", function(err, state) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        }
        res.redirect('/stages');
    });
};