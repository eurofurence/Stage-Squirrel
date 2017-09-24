// server.js

// set up ======================================================================
// get all the tools we need

var express = require('express');
var app = express();
// choose on which interface and port stage-squirrel will listen.
// Set ip to '0.0.0.0' for all interfaces
var ip = process.env.IP || '127.0.0.1';
//  var mongoose = require('mongoose');
var mysql = require('mysql');
var sqcfg = require('./config/config.js');
var passport = require('passport');
var flash = require('connect-flash');

//var morgan       = require('morgan');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var url = require('url');

var initAppRouting = require('./app/routes.js');
var addBaseUrlInfoToView = require('./app/middleware/addBaseUrlInfoToView');
var redirectHack = require('./app/middleware/redirectHack');

//var configDB = require('./config/database.js');


// configuration ===============================================================
// mongoose.connect(configDB.url); // connect to our database
//var connection = mysql.createConnection(configDB.params);

//connection.connect();


require('./config/passport')(passport); // pass passport for configuration

// set up our express application
//app.use(morgan('dev')); // log every request to the console

// create a write stream (in append mode)
//var accessLogStream = fs.createWriteStream(__dirname + '/access.log',{flags: 'a'});


// setup the logger
//app.use(morgan('combined', {stream: accessLogStream}))
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating
//app.locals.compileDebug = true;
//app.locals.debug = true;

// required for passport
app.use(session({ secret: sqcfg.sessionsecret })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Add additional middleware
var baseUrl = url.parse(sqcfg.baseurl);
app.use(addBaseUrlInfoToView(baseUrl));
app.use(redirectHack());

// Add static content
app.use(express.static(__dirname + '/public'));
app.use(baseUrl.pathname + 'favicon.ico', express.static('favicon.ico'));

app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
var appRouter = express.Router();
initAppRouting(appRouter, passport); // load our routes and pass in our app and fully configured passport
app.use(appRouter);

// launch ======================================================================
app.listen(sqcfg.listenport, ip);
console.log('The magic happens at ' + ip + ':' + sqcfg.listenport);