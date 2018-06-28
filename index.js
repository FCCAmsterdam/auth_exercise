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

//https://developer.twitter.com/en/docs/twitter-for-websites/log-in-with-twitter/guides/implementing-sign-in-with-twitter
var twitterStrategy = require('passport-twitter').Strategy;
console.log(config.twitterOAuth.consumer_key, config.ngrokcallback.callback);

mw.passportAppconfig.passportApp.use(new twitterStrategy({
        consumerKey: config.twitterOAuth.consumer_key,
        consumerSecret: config.twitterOAuth.consumer_secret,
        callbackURL: config.ngrokcallback.callback
    },
    function(token, tokenSecret, profile, done) {
        console.log("ök!!")
    }));


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

// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
auth_exer_app.get('/auth/twitter', mw.passportAppconfig.passportApp.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
// in order to see this working:
// 1) set your Twitter App settings (currently using one I called "amsterdamfcctest01") for local development test
//    see this: https://stackoverflow.com/a/31716180
// 2) verify that the following requirements are correct in your config file:
//  -- consumer key
//  -- consumer secret
//  -- updated (random) forwarding link from ngrok as callback link
// 3) after that is verified, use the ngrok callback instead to get into twitter by using the params to get there, not your application
// 4) if effectively redirected to Twitter, you will see the following:
//    -- https://api.twitter.com/oauth/authorize?oauth_token=h9Xi3QAAAAAAudmNAAABZEXYcy8 //see there is an oauth_token for a requested authorization
// 5) if authorization is given:
//    -- 
// The following errors are possible:
// - URL considered malware: this is probably because you put the ngrok in the settings but you are not using the ngrok callback to get into twitter but trying to get there through the application instead; this error is POORLY documented!!!
// - the URL is not recognised: probably you are using standard links in the settings but trying to get in contact with twitter through your app; this error is POORLY documented
// - Callback URL not approved for this client application: there is a mismatch between the callbacks you have in config and the one you set in the App settings; your ngrok callback in config should match the one you provided as callback in twitter app settings
// - twitter failed to authorize: if you are trying to link to twitter through ngrok link as recommended, it is probably the keys are incorrect: https://www.quora.com/Why-am-I-getting-the-Could-not-authenticate-you-message-from-Twitters-API
// - failed to find request token in session: again, all the previous connecting procedure are ok but you don't have a session available; check this link: https://stackoverflow.com/questions/11075629/passport-twitter-failed-to-find-request-token-in-session  
auth_exer_app.get('/request-token',
    mw.passportAppconfig.passportApp.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/'
    }));


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