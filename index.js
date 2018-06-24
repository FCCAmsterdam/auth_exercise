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
var passportApp = require('passport');
var Account = require('./server/db/schemas/Account');

auth_exer_app.use(passportApp.initialize());

var localStrategy = require('passport-local').Strategy;
passportApp.use(new localStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    Account.authenticate()
));

// Configure Passport authenticated session persistence (from https://github.com/passport/express-4.x-local-example/blob/master/server.js).
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

passportApp.serializeUser(Account.serializeUser());
passportApp.deserializeUser(Account.deserializeUser());


// registering mongoDB for its use in the local strategy


//auth_exer_app.get('/', function(req, res) {
//    res.send("Hello world!");
//});

//mounting routes
auth_exer_app.use('/', routes);

//////////////////
//*** TEST AREA ***//
//////////////////
var jwt = require('jsonwebtoken'); //produce a token
var expressjwt = require('express-jwt'); //validates JsonWebTokens and sets req.user
var JWTSECRET = 'whatsup?';
var authenticate = expressjwt({ secret: JWTSECRET });

var generateJwtAccessToken = function(req, res, next) {
    req.token = req.token || {};
    //req.token = jwt.sign({ id: req.body.id }, JWTSECRET, { expiresIN: TOKENTIME });
    req.token = jwt.sign({ id: req.body.id }, JWTSECRET);
    next();
    //res.json(req.token);
};

var jwtResponse = function(req, res) {
    res.status(200).json({
        user: req.body.id,
        token: req.token
    })
}


//var localMongoRegistration = passportApp.authenticate('local', { session: false })(req, res,
//    function() {
//        res.render('signup').status(200).send('Successfully created new account');
//    });
//var localJWTGeneration = passportApp.authenticate('local', { session: false, scope: [] }, generateJwtAccessToken, jwtResponse)
//var localMongoJWTAuthentication = function(req, res, next) {
//    console.log(req);
//    next();
//};


//see that this router consists in several stages
auth_exer_app.post('/signup3', function(req, res, next) {
    //http://mherman.org/blog/2013/11/11/user-authentication-with-passport-dot-js/
    console.log(req.body);

    var newUser = new Account({ username: req.body.id });
    console.log(newUser);
    //registering the account for the first time

    //"if registering is successful, please apply passport strategy for registering"
    //Account.register(...) is a instance of the `passport-local-mongoose` plugin on the Account schema .
    // Its shape is so:
    //```
    // AccountModel.register(instance of AccountModel, password, callback)
    //```
    // where the callback function accept err and data; if no err then to implement an authentication (in this case with passportJS)
    //(OJO: a simple syntax error was not captured by the error handling and it was causing a DEBUGGING NIGHTMARE)

    Account.register(newUser, req.body.password, function(err, account) {
        if (err) {
            res.send(err);
        };

        //if not errors, AUTHENTICATE

        console.log('account ', account);

        var callback = function() {
            console.log('in callback of passportApp authentication');
            res.render('signup').status(200).send('Successfully created new account');
        };

        //see passport.authenticate(...) shape when used as Custom Callback (see passportJS docs):
        //```
        // passport.authenticate(Strategy, {options})(req,res,callback)
        //```
        //it can be extended as in this case to the following shape:
        //```
        // passport.authenticate(Strategy, {options}, callback(err,user,info))(req,res,next)
        //```
        //the most important to bear in mind is that when passport is embedded, it requires to be passed req and res and likely a callback as additional parameters
        //Also important here is, as in the docs, that "Note that when using a custom callback, it becomes the application's responsibility to establish a session (by calling `req.login()` and send a response."
        //
        //See than when called as direct middleware instead, password.authenticate won't need to be provided by parameters as they are sent from the application:
        //Addtionally, a callback into the method call will be in charge of the session
        //```
        // app.post(address, passport.authenticate(strategy, {options}), sessioncallback)
        //```
        passportApp.authenticate('local', { session: false, successFlash: 'Welcome!', failureFlash: true },
            function(err, user, info) {
                if (err) { return next(err); }
                console.log('in callback of passportApp authentication');
                res.render('signup').status(200).send('Successfully created new account');
            }
        )(req, res, next);
    })

});


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