///////////////////
//*** LIBRARIES, LIBRARY METHODS, and CONFIG ***//
///////////////////
var express = require('express');
var routes = require('./server/routes').routes;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var multer = require('multer');
var upload = multer();
var dbURI = require('./config').data.bodyLimit;

///////////////////
//*** APP INSTANTIATION ***//
///////////////////
var auth_exer_app = express();

///////////////////
//*** SETTERS ***//
///////////////////
auth_exer_app.set('view engine', 'pug');
auth_exer_app.set('views', './client');

/////////////////////////////////
//*** APP THIRD PARTY MIDDLEWARE (+ ROUTES) ***//
////////////////////////////////

// cookies
auth_exer_app.use(cookieParser());

// sessions
auth_exer_app.use(session({ secret: "Shh, its a secret!" }));

// for parsing application/json
auth_exer_app.use(bodyParser.json());

// for parsing application/xwww-
auth_exer_app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded

// for parsing multipart/form-data
auth_exer_app.use(upload.array());

//mounting public static data; adding a prefix to indicate type
auth_exer_app.use('/static', express.static('data'));

// passport config
var passportApp = require('./server/routes/middleware').passportApp;
auth_exer_app.use(passportApp.initialize());


//auth_exer_app.get('/', function(req, res) {
//    res.send("Hello world!");
//});

//mounting routes
auth_exer_app.use('/', routes);

//////////////////
//*** TEST AREA ***//
//////////////////

/////////////////////
//*** REVEALING ***//
/////////////////////

module.exports = {
    hola: 1,
}

//////////////////
//*** SERVER ***//
//////////////////
auth_exer_app.listen(3000);