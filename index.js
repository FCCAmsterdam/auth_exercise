///////////////////
//*** LIBRARIES, LIBRARY METHODS, and CONFIG ***//
///////////////////
var express = require('express');
var routes = require('./server/routes').routes;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash'); //required to use flash for messaging with node.js (see I will use it for passportJS success/failure messages)
var multer = require('multer'); //middleware for handling multipart/form-data, which is primarily used for uploading file
var upload = multer();
var helmet = require('helmet');
var config = require('./config');

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
// security and privacy: helmet
// https://www.twilio.com/blog/2017/11/securing-your-express-app.html
auth_exer_app.use(helmet());

// cookies
auth_exer_app.use(cookieParser());

// flash
auth_exer_app.use(flash()); //MUST be set after cookies

// sessions
auth_exer_app.use(session({ secret: config.session.sessionSecret }));

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
//var passportApp = require('./server/routes/middleware').passportApp;

// a-
// instantiating the mounting of the strategy into mongoDB through 'Account' schema
var mw = require('./server/routes/middleware');

auth_exer_app.use(mw.passportAppconfig.passportApp.initialize());

var localStrategy = require('passport-local').Strategy;
mw.passportAppconfig.passportApp.use(new localStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    mw.passportAppconfig.Account.authenticate()
));

// Configure Passport authenticated session persistence (from https://github.com/passport/express-4.x-local-example/blob/master/server.js).
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

mw.passportAppconfig.passportApp.serializeUser(mw.passportAppconfig.Account.serializeUser());
mw.passportAppconfig.passportApp.deserializeUser(mw.passportAppconfig.Account.deserializeUser());


// registering mongoDB for its use in the local strategy


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
    hola: 1
}

//////////////////
//*** SERVER ***//
//////////////////
auth_exer_app.listen(3000);