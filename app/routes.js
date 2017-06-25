// mySQL Integration
var mysql = require('mysql');
var config = require('../config/config.js');
var util = require('./utils.js');
var connection;

function handleDisconnect() {
  connection = mysql.createConnection(config.database); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 		// We introduce a delay before attempting to reconnect,
    }                                     		// to avoid a hot loop, and to allow our node script to
  });                                     		// process asynchronous requests in the meantime.
                                          		// If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}
handleDisconnect();

// Telegram Integration 
var telegram = require('./telegram.js');
var telegramintegration = 'false';
if (typeof telegram != 'undefined') {
	connection.query("SELECT configuration_value FROM sq_configuration WHERE configuration_key = 'TELEGRAM_API_TOKEN'", function (err, result) {
		if (result[0].configuration_value) { telegramintegration = 'true'; }
	});
} 

// NotificationService
function notificationService(typeId, eventId, versionId, senderId, roleId) {
	var now = new Date();
	var params = [typeId, eventId, eventId, versionId, senderId, roleId, util.getTimeJStoSQL(now)];
	connection.query("INSERT INTO sq_notifications (`type_id`, `event_id`, `convention_id`, `version_id`, `sender_id`, `role_id`, `created_on`) VALUES (?, ?, (SELECT convention_id from sq_events where sq_events.event_id = ?), ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); }});
	if (telegramintegration == 'true') {
		telegram.notify(typeId, eventId, versionId, senderId, roleId);
	}
}

// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
		//if (req.isAuthenticated) res.redirect('/profile');
		//res.redirect('/login');
        res.render('login.ejs', { message: req.flash('loginMessage') }); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
		if (req.isAuthenticated() && req.user.user_active) {
			res.redirect('/home');
		} else {
			console.log(req.session)
        	  	// render the page and pass in any flash data if it exists
        	  	res.render('login.ejs', { message: req.flash('loginMessage') });
	   	} 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successReturnToOrRedirect : '/home', // redirect to the secure home section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
		connection.query('SELECT * from sq_configuration',function(err,rows){ 
			var cfg_key_value = [];
	        for(var i=0; i<rows.length; i++) {
				var row = rows[i];
	          	cfg_key_value[row.configuration_key] = {
	            	value: row.configuration_value
	          	}
	        } 
			connection.query('SELECT * from sq_role where role_is_admin = 0 and role_is_manager = 0 and role_is_default = 0 and role_is_active = 1', function (err, rows) {
			  res.render('signup.ejs', {
				message: req.flash('signupMessage'),
			    roles: rows,
				  cfg: cfg_key_value
			  });
			});
		});

    });

    // process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
	    successRedirect : '/home', // redirect to the secure home section
	    failureRedirect : '/signup', // redirect back to the signup page if there is an error
	    failureFlash : true // allow flash messages
	}));

    // =====================================
    // home SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/home', isLoggedIn, function(req, res) {
		connection.query('SELECT * FROM sq_events LEFT JOIN sq_event_details ON sq_events.event_id = sq_event_details.event_id', function (err, eventrows) {
			connection.query('SELECT * from sq_user', function (err, userrows) {
				connection.query('SELECT * FROM sq_stage', function (err, stagerows) {
					connection.query('SELECT * from sq_role', function (err, rolerows) {
						connection.query('SELECT * from sq_notifications where convention_id = ? order by created_on desc limit 20', req.user.currentConvention.convention_id, function (err, notificationrows) {
							res.render('home.ejs', {
								notifications: notificationrows,
								events: eventrows,
								users: userrows,
								stages: stagerows,
								roles: rolerows,
								nav: 'home',
								user : req.user // get the user out of session and pass to template
							});
						});
					});
				});
			});
		});
    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
    		connection.query("SELECT configuration_value FROM sq_configuration WHERE configuration_key = 'TELEGRAM_BOT_NAME'", function (err, result) {
          	res.render('profile.ejs', {
  				nav: 'profile',
              		user : req.user,
  		   		telegram:  telegramintegration, // get the user out of session and pass to template
				telegrambotname: result[0].configuration_value
          	});
    		});
    });
    
    app.post('/profile', isLoggedIn, function(req, res) {
	    console.log(req.body);
	    var errorMsg = "";
	    if (typeof req.body.action != 'undefined') {
		    if (req.body.action == 'telegram-confirmation') {
			    if (req.user.user_telegram_confirmation_key == req.body.telegram_code) {
				    console.log('Telegram Linking with correct code.');
				    var now = new Date();
				    var validThru = new Date(req.user.user_telegram_confirmation_valid_to);
				    console.log(now);
				    console.log(validThru);
				    if (now.getTime() > validThru.getTime()) {
				    		console.log('Telegram Code was not valid anymore.');
						errorMsg = "Your entered key was wrong or not valid anymore.";
				    } else {
					    req.user.user_telegram_linked = 1;
						telegram.notifyById(req.user.user_telegram_id, "You are now sucessfully linked.");
				    		connection.query("UPDATE sq_user SET user_telegram_linked = '1' WHERE `user_id` = ?", req.user.user_id);
				    }
			    } else {
			    		console.log('Telegram Linking failed with incorrect code.');
					errorMsg = "Your entered key was wrong or not valid anymore.";
			    }
				
		    } else if (req.body.action == 'telegram-unlink' && req.user.user_telegram_id.length > 0) {
			     req.user.user_telegram_linked = 0;
				telegram.notifyById(req.user.user_telegram_id, "You are not linked to Stagesquirrel anymore.");
		    		connection.query("UPDATE sq_user SET user_telegram_linked = '0', user_telegram_id = null WHERE `user_id` = ?", req.user.user_id);
		    } else if (req.body.action == 'telegram-activate') {
			     req.user.user_telegram_active = 1;
				telegram.notifyById(req.user.user_telegram_id, "Bot activated. You will get notifications.");
		    		connection.query("UPDATE sq_user SET user_telegram_active = '1' WHERE `user_id` = ?", req.user.user_id);
		    } else if (req.body.action == 'telegram-deactivate') {
			     req.user.user_telegram_active = 0;
				telegram.notifyById(req.user.user_telegram_id, "Bot deactivated. You will not get any notification.");
		    		connection.query("UPDATE sq_user SET user_telegram_active = '0' WHERE `user_id` = ?", req.user.user_id);
		    }
		
	    }
        res.render('profile.ejs', {
			nav: 'profile',
		   error: errorMsg,
            	user : req.user,
		   telegram:  telegramintegration // get the user out of session and pass to template
        });
    });

    // =====================================
    // ADMIN ==============================
    // =====================================
    // show the admin config
    app.get('/admin', isLoggedIn, function(req, res) {
		if (req.user.isAdmin) {
			connection.query('SELECT * from sq_configuration', function (err, cfgrows) {
		    	connection.query('SELECT * from sq_user order by user_active;', function (err, userrows) {
					res.render('admin.ejs', {
					nav: 'admin',
	            		user : req.user, 
				    	allusers: userrows, 
				    	configurations: cfgrows	
					});
				});
			});
		} else {
			res.redirect('/home');
		}
    });

    // process the signup form
	app.post('/admin', isLoggedIn, function(req, res) {
		if (req.user.isAdmin) {
			if (req.body.actionType == "global") {
				connection.query('SELECT configuration_key, configuration_value from sq_configuration', function (err, cfgrows) {
			        for(var i=0; i<cfgrows.length; i++) {
						connection.query("UPDATE sq_configuration SET configuration_value = '" + req.body[cfgrows[i].configuration_key] + "' WHERE `configuration_key` = '" + cfgrows[i].configuration_key + "'");
						//if (cfgrows[i].configuration_key == "TELEGRAM_API_TOKEN" && cfgrows[i].configuration_value != req.body[cfgrows[i].configuration_key]) {
						//	telegram.readToken(cfgrows[i].configuration_value);
						//}
					}
				});
			} else if (req.body.actionType == "user") {
				if (req.body.activation != undefined) {
					console.log("UPDATE sq_user SET user_active = '1' WHERE `user_id` = '" + req.body.activation + "'");
					connection.query("UPDATE sq_user SET user_active = '1' WHERE `user_id` = '" + req.body.activation + "'");
					notificationService(14, null, null, req.body.activation, null);
				}
				if (req.body.deactivation != undefined) {
					console.log("UPDATE sq_user SET user_active = '0' WHERE `user_id` = '" + req.body.deactivation + "'");
					connection.query("UPDATE sq_user SET user_active = '0' WHERE `user_id` = '" + req.body.deactivation + "'");
				}
			}
		}
        res.redirect('/admin');
	});
	

    // =====================================
    // CREATE ==============================
    // =====================================
    // show the admin config
    app.get('/create', isLoggedIn, function(req, res) {
		console.log("get id:" + req.query.id);
		console.log("get version:" + req.query.version);
		if (req.user.isCreator) {
			connection.query('SELECT * from sq_configuration', function (err, cfgrows) {
				connection.query('SELECT * from sq_form_elements where template_id = (SELECT template_id FROM sq_conventions WHERE convention_id = ?);', req.user.currentConvention.convention_id, function (err, elementrows) {
					connection.query('SELECT * from sq_role where role_is_admin = 0 and role_is_manager = 0 and role_is_default = 0 and role_is_active = 1', function (err, rolesrows) {
						connection.query('SELECT * from sq_conventions where convention_id = ?', req.user.currentConvention.convention_id, function (err, conventionrows) {
							connection.query('SELECT sq_stage.stage_id, sq_stage.stage_name, sq_stage.stage_description FROM sq_map_convention_to_stage join sq_stage on sq_map_convention_to_stage.stage_id = sq_stage.stage_id WHERE convention_id = ?', req.user.currentConvention.convention_id, function (err, stagerows) {
								connection.query('SELECT * from sq_events where event_id = ?', req.query.id, function (err, eventrows) {
									console.log("-----");
									console.log(eventrows);
								
									var version = 1; 
									if (eventrows != null) {
										version = eventrows[0].event_max_version;
										if (typeof req.query.version != 'undefined' && req.query.version > 0 && req.query.version <= eventrows[0].event_max_version) {
											version = req.query.version;
										}
									}
									console.log("Shall load version " + version);
									console.log(eventrows != null);
									console.log(typeof req.query.version);
									connection.query('SELECT * from sq_event_details where event_id = ' + req.query.id + ' AND event_version = ?', version, function (err, eventdetailrows) {
										connection.query('SELECT * from sq_event_customs where event_id = ? AND version = ?', [req.query.id, version], function (err, customrows) {
											connection.query('SELECT creator_id from sq_event_details where event_id = ? AND event_version = 1', req.query.id, function (err, creatorresult) {
												connection.query('SELECT * FROM sq_user join sq_map_user_to_role on sq_user.user_id = sq_map_user_to_role.user_id join sq_role on sq_map_user_to_role.role_id = sq_role.role_id where sq_role.role_is_creator = 1 and sq_user.user_active = 1 GROUP BY sq_user.user_id', function (err, managerrows) {
													if (typeof eventrows == 'undefined' || creatorresult[0].creator_id == req.user.user_id || req.user.isManager) {
														res.render('create.ejs', {
															nav: 'create',
															user: req.user, 
															stages: stagerows,
															elements: elementrows, 
															roles: rolesrows,
															convention: conventionrows,
															configurations: cfgrows,
															event: eventdetailrows,
															eventinfo: eventrows,
															customfields: customrows,
															creator: creatorresult,
															managerlist: managerrows
														});	
													} else {
														console.log("User has no rights to access event.");
													}
												});
											});
										});
									});
								});
							});	
						});
					});
				});
			});
		} else {
			res.redirect('/home');
		}
    });
	
	
	app.post('/create', isLoggedIn, function(req, res) {
		if (req.user.isCreator || req.user.isManager) {
		    var event_id = req.body.event_id;
	 	    if (typeof req.body.accept != 'undefined') {
			    var version = parseInt(req.body.version);
	 		    if (req.body.accept == "creator" && req.user.user_id == req.body.event_manager) {
				    notificationService(4, event_id, version, req.user.user_id, null);
		    		    connection.query("UPDATE sq_events SET event_confirmed_version_creator = ? WHERE event_id = ?", [req.body.version, event_id], function(err,state){ if(err) { console.log(err); }});
	 		    }
	 		    if (req.body.accept == "manager" && req.user.isManager) {
				    notificationService(5, event_id, version, req.user.user_id, null);
		    		    connection.query("UPDATE sq_events SET event_confirmed_version_manager = ? WHERE event_id = ?", [req.body.version, event_id], function(err,state){ if(err) { console.log(err); }});
	 		    }
			    res.redirect('/create?id=' + event_id+ '&version=' + req.body.version); 
	 	    } else {
				var version = 1;
				if (event_id == 0) {
					connection.query("INSERT INTO sq_events (`event_id`, `convention_id`, `event_max_version`, `event_confirmed_version_manager`, `event_confirmed_version_creator`) VALUES (0, ?, 1, 0, 1)", req.user.currentConvention.convention_id, function(err,state){ if(err) { console.log(err); } else {
						event_id = state.insertId;
						notificationService(1, event_id, 1, req.user.user_id, null);					
						/* completely redundant start */
						var params = [event_id, req.body.stage_id, req.body.event_manager, req.body.event_name, req.body.event_desc, req.body.event_expl, req.body.event_type.toString().replace(',',';'), req.body.event_date, req.body.time_pre, req.body.time_post, req.body.time_dur, version];					
						connection.query("INSERT INTO sq_event_details (`event_id`, `stage_id`, `creator_id`, `event_title`, `event_description`, `event_explaination`, `event_categories`, `event_day`, `event_created`, `event_time_pre`, `event_time_post`, `event_time_dur`, `event_version`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } else {
							for(var key in req.body) {
						  	   	if(req.body.hasOwnProperty(key) && key.startsWith("custom")){
							  	   	if (req.body[key].constructor === Array) {
								  	   	for (var i = 0; i < req.body[key].length; i++) {
							  				console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom','') + ", " + version + ", " + req.body[key][i] + ")");
											var params = [event_id, key.replace('custom',''), version, req.body[key][i]];
											connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
								  	   	}
							  	   	} else {
							  			console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom','') + ", " + version + ", " + req.body[key] + ")");
										var params = [event_id, key.replace('custom',''), version, req.body[key]];
										connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
						  	  	   	}
						  	   	}
							}
						}});
						/* completely redundant end */
					}});
				} else {
					version = (parseInt(req.body.version) + 1);
					var setConfirmation = "";
					if (req.user.isManager) { 
						setConfirmation += ", event_confirmed_version_manager = " + version; 
						notificationService(3, event_id, version, req.user.user_id, null);
					}
					if (req.body.event_manager == req.user.user_id) { 
						setConfirmation += ", event_confirmed_version_creator = " + version; 
						notificationService(2, event_id, version, req.user.user_id, null);
					}
					connection.query("UPDATE sq_events SET event_max_version = ?" + setConfirmation + " WHERE event_id = ?", [version, event_id], function(err,state){ if(err) { console.log(err); } else { 				
							
						/* completely redundant start */
						var params = [event_id, req.body.stage_id, req.user.user_id, req.body.event_name, req.body.event_desc, req.body.event_expl, req.body.event_type, req.body.event_date, req.body.time_pre, req.body.time_post, req.body.time_dur, version];					
						connection.query("INSERT INTO sq_event_details (`event_id`, `stage_id`, `creator_id`, `event_title`, `event_description`, `event_explaination`, `event_categories`, `event_day`, `event_created`, `event_time_pre`, `event_time_post`, `event_time_dur`, `event_version`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } else {
							for(var key in req.body) {
						  	   	if(req.body.hasOwnProperty(key) && key.startsWith("custom")){
							  	   	if (req.body[key].constructor === Array) {
								  	   	for (var i = 0; i < req.body[key].length; i++) {
							  				console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom','') + ", " + version + ", " + req.body[key][i] + ")");
											var params = [event_id, key.replace('custom',''), version, req.body[key][i]];
											connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
								  	   	}
							  	   	} else {
							  			console.log("\"INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (" + event_id + ", " + key.replace('custom','') + ", " + version + ", " + req.body[key] + ")");
										var params = [event_id, key.replace('custom',''), version, req.body[key]];
										connection.query("INSERT INTO `sq_event_customs` (`event_id`, `custom_id`, `version`, `custom_value`) VALUES (?, ?, ?, ?)", params);
						  	  	   	}
						  	   	}
							}
						}});
						/* completely redundant end */
					}});
				}
        			res.redirect('/home');
			}
		} else {
   			res.redirect('/home');
		}
	});

    // =====================================
    // MANAGE EVENTS =======================
    // =====================================
    // show the admin config
    app.get('/manage', isLoggedIn, function(req, res) {
		if (req.user.isManager) {
				connection.query('SELECT * from sq_role where role_is_active = 1', function (err, rolerows) {
					connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function (err, userrows) {
						connection.query('SELECT * FROM sq_events left join sq_event_details on sq_events.event_id = sq_event_details.event_id AND sq_events.event_max_version = sq_event_details.event_version', function (err, eventrows) {
							connection.query('SELECT * FROM sq_riders', function (err, riderrows) {
								connection.query('SELECT *, max(version) FROM stagesquirrel.sq_map_riders_to_roles group by event_id, role_id', function (err, riderrolesrows) {
								res.render('manage.ejs', {
									riderroles: riderrolesrows,
									riders: riderrows,
								nav: 'manage',
				            		user  : req.user,
									users : userrows,
									events: eventrows,
								    roles : rolerows
									});
								});
							});
						});
					});
				});	
					
		} else {
			res.redirect('/home');
		}
    });
    

    // =====================================
    // MY SURVEYS =======================
    // =====================================
    // show the admin config
    app.get('/surveys', isLoggedIn, function(req, res) {
		if (req.user.isCreator) {
			connection.query('SELECT * FROM sq_events left join sq_event_details on sq_events.event_id = sq_event_details.event_id WHERE sq_events.event_id IN (SELECT DISTINCT event_id FROM sq_event_details WHERE creator_id = ?) AND sq_events.event_max_version = sq_event_details.event_version;', req.user.user_id, function (err, eventrows) {
				connection.query('SELECT * FROM sq_riders', function (err, riderrows) {
					res.render('surveys.ejs', {
						nav: 'surveys',
		            		user  : req.user,
						events: eventrows,
						riders: riderrows
					})	
				})
			})	
					
		} else {
			res.redirect('/home');
		}
    });
    
    // =====================================
    // MANAGE EVENTS =======================
    // =====================================
    // show the admin config
    app.get('/roleview', isLoggedIn, function(req, res) {
		if (typeof req.query.role != 'undefined') {
				connection.query('SELECT * from sq_role where role_title = ?', req.query.role, function (err, rolerows) {
					connection.query('SELECT * from sq_user', function (err, userrows) {
						connection.query('SELECT * FROM sq_events left join sq_event_details on sq_events.event_id = sq_event_details.event_id AND sq_events.event_max_version = sq_event_details.event_version WHERE sq_events.event_id IN (SELECT event_id FROM sq_riders)', function (err, eventrows) {
							connection.query('SELECT * FROM sq_riders', function (err, riderrows) {
								connection.query('SELECT * FROM sq_map_riders_to_roles where (event_id, role_id, version) in (select event_id, role_id, max(version) from sq_map_riders_to_roles where role_id = ? group by event_id) AND role_id = ?', [rolerows[0].role_id, rolerows[0].role_id], function (err, riderrolesrows) {
								res.render('roleview.ejs', {
									riderroles: riderrolesrows,
									riders: riderrows,
								nav: 'role' + req.query.role,
				            		user  : req.user,
									users : userrows,
									events: eventrows,
								    role : rolerows[0]
									});
								});
							});
						});
					});
				});	
					
		} else {
			res.redirect('/home');
		}
    });

    // =====================================
    // MANAGE RIDERS =======================
    // =====================================
    // show the admin config
    app.get('/rider', isLoggedIn, function(req, res) {
		if (typeof req.query.id != 'undefined') {
			connection.query('SELECT * FROM sq_events LEFT JOIN sq_event_details ON sq_events.event_id = sq_event_details.event_id AND (SELECT GREATEST(sq_events.event_confirmed_version_creator, sq_events.event_confirmed_version_manager) FROM sq_events WHERE sq_events.event_id = ?) = sq_event_details.event_version WHERE sq_events.event_id = ?', [req.query.id, req.query.id], function (err, eventrows) {
				connection.query('SELECT * from sq_conventions WHERE convention_id = ?', eventrows[0].convention_id, function (err, conventionrows) {
					connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function (err, userrows) {
						connection.query('SELECT * FROM sq_stage', function (err, stagerows) {
							connection.query('SELECT * from sq_role where role_is_active = 1', function (err, rolerows) {
								connection.query('SELECT * from sq_map_user_to_role', function (err, mapuserrolerows) {
									connection.query('SELECT * from sq_riders WHERE event_id = ?', req.query.id, function (err, riderrows) {
										connection.query('SELECT * from sq_rider_contacts WHERE event_id = ?', req.query.id, function (err, contactrows) {
											connection.query('SELECT * from sq_rider_comments WHERE event_id = ? ORDER BY create_time DESC', req.query.id, function (err, commentrows) {
												connection.query('SELECT * from sq_map_riders_to_roles WHERE event_id = ?', req.query.id, function (err, ridertorolerows) {
													connection.query('SELECT * from sq_rider_stagebox WHERE event_id = ?', req.query.id, function (err, stageboxrows) {
														if (riderrows[0] != null) { riderrows[0].role = ridertorolerows; }
														res.render('rider.ejs', {
															nav: 'rider',
															user  : req.user,
															users : userrows,
															roles : rolerows,
															mapuserrole: mapuserrolerows,
															convention: conventionrows,
															event: eventrows[0],
															stages: stagerows,
															rider: riderrows[0],
															comments: commentrows,
															contacts: contactrows,
															rolerider: ridertorolerows,
															stagebox: stageboxrows
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		} else {
			res.redirect('/home');
		}
    });

    app.post('/rider', isLoggedIn, function(req, res) {
		if (req.body.actionType == "accept_responsible") {
			params = [1, req.body.event_id, req.body.role_id, req.body.version];
			connection.query("UPDATE sq_map_riders_to_roles SET confirmed_version_responsible = ? WHERE event_id = ? AND role_id = ? AND version = ?", params, function(err,state){ if(err) { console.log(err); } } );
			
			console.log(req.body);
			notificationService(7, req.body.event_id, req.body.version, req.user.user_id, req.body.role_id);
			res.redirect('/rider?id=' + req.body.event_id);
		}
		if (req.body.actionType == "accept_manager") {
			params = [1, req.body.event_id, req.body.role_id, req.body.version];
			connection.query("UPDATE sq_map_riders_to_roles SET confirmed_version_manager = ? WHERE event_id = ? AND role_id = ? AND version = ?", params, function(err,state){ if(err) { console.log(err); } } );
			
			console.log(req.body);
			notificationService(8, req.body.event_id, req.body.version, req.user.user_id, req.body.role_id);
			res.redirect('/rider?id=' + req.body.event_id);
		}
		if (req.body.actionType == "editGeneral") {
			params = [req.body.creator_id, req.body.eventmgr_mobile, req.user.user_id, req.body.stagemgr_mobile, req.body.crew_lxd, req.body.crew_lx1, req.body.crew_lx2, req.body.crew_a1, req.body.crew_a2, req.body.crew_a3, req.body.crew_stagedecktech, req.body.crew_bananassetup, req.body.crew_bananasshow, req.body.crew_bananasbreakdown, util.getTimeJStoSQL(req.body.starttime), req.body.event_id];
			connection.query("UPDATE sq_riders SET creator_id = ?, creator_mobile = ?, manager_id = ?, manager_mobile = ?, crew_lxd = ?, crew_lx1 = ?, crew_lx2 = ?, crew_a1 = ?, crew_a2 = ?, crew_a3 = ?, crew_stagedecktech = ?, crew_bananassetup = ?, crew_bananasshow = ?, crew_bananasbreakdown = ?, startdate = ? WHERE event_id = ?", params, function(err,state){ if(err) { console.log(err); } } );
			console.log(req.body);

			notificationService(11, req.body.event_id, null, req.user.user_id, null);
			res.redirect('/rider?id=' + req.body.event_id);
		}
		if (req.body.actionType == "editRole") {
			var conf_mgr = req.user.isManager ? 1 : 0;
			var conf_res = req.user.user_id == req.body.responsible_id ? 1 : 0;
			params = [req.body.event_id, req.body.role_id, req.body.role_content, req.body.responsible_id, conf_mgr, conf_res, (parseInt(req.body.version) + 1)];
			connection.query("INSERT INTO sq_map_riders_to_roles (event_id, role_id, content, responsible_id, confirmed_version_manager, confirmed_version_responsible, version) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } 
				if (req.user.isManager) {
					notificationService(10, req.body.event_id, (parseInt(req.body.version) + 1), req.user.user_id, req.body.role_id);
				} else {
					notificationService(9, req.body.event_id, (parseInt(req.body.version) + 1), req.user.user_id, req.body.role_id);
				}
				if (req.body.hasStagebox) {
					for (var i = 0; i < req.body.sb_cha.length; i++) {
						params = [req.body.event_id, (parseInt(req.body.version) + 1), req.body.sb_cha[i], req.body.sb_lab[i], req.body.sb_sub[i], req.body.sb_48v[i], req.body.sb_via[i]];
						connection.query("INSERT INTO sq_rider_stagebox (event_id, event_version, stagebox_channel, stagebox_label, stagebox_subcore, stagebox_48v, stagebox_viadi) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } 
						}); 
					}
				}
			}); 
			console.log(req.body);
			res.redirect('/rider?id=' + req.body.event_id);
		}
		if (req.body.actionType == "create") {
			
			params = [req.body.event_id, req.body.creator_id, req.body.eventmgr_mobile, req.user.user_id, req.body.stagemgr_mobile, req.body.crew_lxd, req.body.crew_lx1, req.body.crew_lx2, req.body.crew_a1, req.body.crew_a2, req.body.crew_a3, req.body.crew_stagedecktech, req.body.crew_bananassetup, req.body.crew_bananasshow, req.body.crew_bananasbreakdown, util.getTimeJStoSQL(req.body.starttime)];
			connection.query("INSERT INTO sq_riders (event_id, creator_id, creator_mobile, manager_id, manager_mobile, crew_lxd, crew_lx1, crew_lx2, crew_a1, crew_a2, crew_a3, crew_stagedecktech, crew_bananassetup, crew_bananasshow, crew_bananasbreakdown, startdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } 
				notificationService(6, req.body.event_id, 1, req.user.user_id, null);
				for (var i = 0; i < req.body.role_id.length; i++) {
					params = [req.body.event_id, req.body.role_id[i], req.body.role_content[i], req.body.responsible_id[i], 1, 0, 1];
					connection.query("INSERT INTO sq_map_riders_to_roles (event_id, role_id, content, responsible_id, confirmed_version_manager, confirmed_version_responsible, version) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } 
					}); 
				}
				for (var i = 0; i < req.body.sb_cha.length; i++) {
					params = [req.body.event_id, 1, req.body.sb_cha[i], req.body.sb_lab[i], req.body.sb_sub[i], req.body.sb_48v[i], req.body.sb_via[i]];
					connection.query("INSERT INTO sq_rider_stagebox (event_id, event_version, stagebox_channel, stagebox_label, stagebox_subcore, stagebox_48v, stagebox_viadi) VALUES (?, ?, ?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } 
					}); 
				}
				for (var i = 0; i < req.body.contact_nick.length; i++) {
					params = [req.body.event_id, req.body.contact_function[i], req.body.contact_nick[i], req.body.contact_mobile[i]];
					connection.query("INSERT INTO sq_rider_contacts (event_id, contact_function, contact_nick, contact_mobile) VALUES (?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } 
					}); 
				}
			}); 
			console.log(req.body);
			res.redirect('/rider?id=' + req.body.event_id);
		}
		if (req.body.actionType == "comment") {
			var rolestring = req.body.commentrole.toString().replace(/,/g,';');
			connection.query("INSERT INTO sq_rider_comments (`event_id`, `user_id`, `create_time`, `comment_value`, `affected_roles`) VALUES (?, ?, ?, ?, ?)", [req.body.event_id, req.user.user_id, util.getTimeJStoSQL(new Date()), req.body.comment_content, rolestring]);
			res.redirect('/rider?id=' + req.body.event_id + '#comment-' + req.body.comment_no);
		} 
});

    // =====================================
    // MANAGE CONVENTIONS ==================
    // =====================================
    // show the admin config
    app.get('/convention', isLoggedIn, function(req, res) {
		if (req.user.isManager) {
			connection.query('SELECT * from sq_conventions order by date_from ASC', function (err, conventionrows) {
				connection.query('SELECT * from sq_user where user_active = 1 order by user_name', function (err, userrows) {
					connection.query('SELECT * from sq_events order by event_created DESC', function (err, eventrows) {
						connection.query('SELECT * from sq_form_templates order by template_created DESC', function (err, templaterows) {
							connection.query('SELECT * FROM sq_map_convention_to_stage', function (err, mapstagerows) {
								connection.query('SELECT * FROM sq_stage', function (err, stagerows) {
									res.render('convention.ejs', {
										nav: 'convention',
					            			user  : req.user,
										users : userrows,
										conventions: conventionrows,
										templates: templaterows,
										events: eventrows,
										stages: stagerows,
										mapstages: mapstagerows
									});
								});
							});
						});
					});
				});
			});
		} else {
			res.redirect('/home');
		}
    });
    

    app.post('/convention', isLoggedIn, function(req, res) {
		if (req.user.isManager) {
			console.log(req.body);
			if (req.body.actionType == "create") {
				var params = [req.body.convention_template, req.body.convention_name, req.body.convention_desc, new Date(req.body.start), new Date(req.body.end)];
				if (req.body.convention_id == 0) {
					connection.query("INSERT INTO sq_conventions (template_id, convention_name, convention_description, date_from, date_to) VALUES (?, ?, ?, ?, ?)", params, function(err,state){ if(err) { console.log(err); } 
						for (stage_id of req.body.convention_stage) {
							connection.query("INSERT INTO sq_map_convention_to_stage (convention_id, stage_id) VALUES ('" + req.body.convention_id + "', '" + stage_id + "')", function(err,state){ if(err) { console.log(err); } });
						}
					});
				} else {
					connection.query("UPDATE sq_conventions SET template_id = ?, convention_name = ?, convention_description = ?, date_from = ?, date_to = ? WHERE `convention_id` = '" + req.body.convention_id + "'", params, function(err,state){ if(err) { console.log(err); }  
						connection.query("DELETE FROM sq_map_convention_to_stage WHERE `convention_id` = '" + req.body.convention_id + "'", function(err,state){ if(err) { console.log(err); } 
							for (stage_id of req.body.convention_stage) {
								connection.query("INSERT INTO sq_map_convention_to_stage (convention_id, stage_id) VALUES ('" + req.body.convention_id + "', '" + stage_id + "')", function(err,state){ if(err) { console.log(err); } });
							}
						});
					});
				}
			} else if (req.body.actionType == "delete") {
				connection.query("SELECT count(*) AS qty from sq_events WHERE convention_id = '" + req.body.convention_id + "'", function (err, events) {
					if (events[0].qty == 0) {
						connection.query("DELETE FROM sq_conventions WHERE `convention_id` = '" + req.body.convention_id + "'", function(err,state){ if(err) { console.log(err); } 
							connection.query("DELETE FROM sq_map_convention_to_stage WHERE `convention_id` = '" + req.body.convention_id + "'", function(err,state){ if(err) { console.log(err); } });
						});
					}
				});
			}	

			res.redirect('/convention');
		} else {
			res.redirect('/home');
		}
    });

    // =====================================
    // MANAGE STAGES =======================
    // =====================================
    // show the admin config
    app.get('/stages', isLoggedIn, function(req, res) {
		if (req.user.isManager) {
				connection.query('SELECT sq_stage.*, count(sq_conventions.convention_id) AS qty from sq_stage left join sq_map_convention_to_stage on sq_stage.stage_id = sq_map_convention_to_stage.stage_id left join sq_conventions on sq_conventions.convention_id = sq_map_convention_to_stage.convention_id group by sq_stage.stage_id', function (err, stagerows) {
					res.render('stages.ejs', {
						nav: 'stages',
	            			user  : req.user,
						stages: stagerows,
					});
				});
		} else {
			res.redirect('/home');
		}
    });
    

    app.post('/stages', isLoggedIn, function(req, res) {
		if (req.user.isManager) {
			console.log(req.body);
			if (req.body.actionType == "create") {
				var params = [req.body.stage_name, req.body.stage_desc];
				if (req.body.stage_id == 0) {
					connection.query("INSERT INTO sq_stage (stage_name, stage_description) VALUES (?, ?)", params, function(err,state){ if(err) { console.log(err); } });
				} else {
					connection.query("UPDATE sq_stage SET stage_name = ?, stage_description = ? WHERE `stage_id` = '" + req.body.stage_id + "'", params, function(err,state){ if(err) { console.log(err); } });
				}
			} else if (req.body.actionType == "delete") {
				connection.query("SELECT count(*) AS qty from sq_map_convention_to_stage WHERE stage_id = '" + req.body.stage_id + "'", function (err, events) {
					if (events[0].qty == 0) {
						connection.query("DELETE FROM sq_stage WHERE `stage_id` = '" + req.body.stage_id + "'", function(err,state){ if(err) { console.log(err); } });
					}
				});
			}	

			res.redirect('/stages');
		} else {
			res.redirect('/home');
		}
    });

    // =====================================
    // MANAGE EVENTS =======================
    // =====================================
    // show the admin config
    app.post('/manage', isLoggedIn, function(req, res) {
		if (req.user.isManager) {

					
		} else {
			res.redirect('/home');
		}
    });

    // =====================================
    // CREATE EDIT =========================
    // =====================================
    // show the admin config
    app.get('/editcreate', isLoggedIn, function(req, res) {
		if (true) {
				connection.query('SELECT * from sq_role where role_is_admin = 0 and role_is_manager = 0 and role_is_default = 0 and role_is_active = 1', function (err, rows) {
					res.render('editcreate.ejs', {
						nav: 'edittemplate',
	            		user : req.user,
					    roles: rows
					});
				});	
					
		} else {
			res.redirect('/home');
		}
    });
	

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	if (req.body.hash) { req.url += req.body.hash; }
	if (req.user != undefined) {
		for (var role of req.user.user_roles) { 
			if (role.role_is_admin == 1) { req.user.isAdmin = 1; req.user.isManager = 1; req.user.isCreator = 1; }
			else if (role.role_is_manager == 1) { req.user.isManager = 1; req.user.isCreator = 1; }
			else if (role.role_is_creator == 1) { req.user.isCreator = 1; }
		} 
	}

	nav: req.path;
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
		if (req.user.user_active) {
        		return next();
		} else {
			res.render('login.ejs', { message: req.flash('loginMessage', 'This account is inactive. An administrator must activate your account first.') });
		}
	}
		req.session.returnTo = req.url;
		console.log(req.url);
    	 	res.redirect('/login');
	
	
}