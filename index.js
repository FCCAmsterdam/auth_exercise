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
// think about the configuration suggested in this tutorial: https://scotch.io/tutorials/easy-node-authentication-setup-and-local


// a-
// instantiating the mounting of the strategy into mongoDB through 'Account' schema
var mw = require('./server/routes/middleware');

auth_exer_app.use(mw.passportAppconfig.passportApp.initialize());
auth_exer_app.use(mw.passportAppconfig.passportApp.session()); // persistent login sessions

var localStrategy = require('passport-local').Strategy;
mw.passportAppconfig.passportApp.use(new localStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    mw.passportAppconfig.Account.authenticate()
));


var SchemaObject = require('node-schema-object');

//https://developer.twitter.com/en/docs/twitter-for-websites/log-in-with-twitter/guides/implementing-sign-in-with-twitter
var twitterStrategy = require('passport-twitter').Strategy;
//console.log(config.twitterOAuth.consumer_key, config.ngrokcallback.callback);
mw.passportAppconfig.passportApp.use(new twitterStrategy({
        consumerKey: config.twitterOAuth.consumer_key,
        consumerSecret: config.twitterOAuth.consumer_secret,
        callbackURL: config.twittercallback.callback
    },
    function(token, tokenSecret, profile, done) { //validation function
        console.log("You are in the Twitter STRATEGY function.\nIf you are here it means that you reached the Twitter page through the callback you gave, and that you successfully gave authorization to use Twitter data.\nHowever, you might want to validate the Twitter records with those in your database, and create a new user if it doesn't exists.\nThis function is used to validate the user in the database comparing to records in the Twitter user's profile.\nFor this example I am not comparing: just creating a fake username ('whatever').\nThe validated user and profile and then passed to serialization/deserialization for its use in the app.\n\n\n");
        done(null, { 'username': 'whatever' });
        //var newUser = new SchemaObject({
        //    name: String
        //});
        //var user = newUser({ name: "iamanuser" });
        //done(null, user);
        //user.get = function() {
        //    return { username: "iamanuser" }
        //};
        //mw.passportAppconfig.Account.find({}, function(err, doc) {
        //    done(null, doc);
        //});
    }
));


// Configure Passport authenticated session persistence (from https://github.com/passport/express-4.x-local-example/blob/master/server.js).
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.

// mw.passportAppconfig.passportApp.serializeUser(mw.passportAppconfig.Account.serializeUser());
// mw.passportAppconfig.passportApp.deserializeUser(mw.passportAppconfig.Account.deserializeUser());

// the following hack is for all the projects to work
mw.passportAppconfig.passportApp.serializeUser(function(user, done) {
    console.log("If you are using sessions, you get into this SERIALIZATION function after validating the user.\nHere we got the validated data of our user " + user + ".\nThe serialization will attach a user identifier to a session cookie in the req (req.session.passport.user = {id:'..'}). Keep in mind that sessions are ALWAYS saved on the server side unless you pass them to client (OBS: passport.session does save into client as a cookie called `connect.sid`).\nYou need that value to make further requests.\nMy example is a simple custom function: there are packages that offer a shipped function you can use for your convenience, but they are hard to modify (eg. mongoose-passport-local package).\n\n\n");
    if (user.username) {
        user.id = user.username;
    }
    done(null, user.id); //saved to session req.session.passport.user = {id:'..'}
});

mw.passportAppconfig.passportApp.deserializeUser(function(id, done) { //take req.session.passport.user and extract key (in this case id)
    console.log("After serialization, you enter into the DESERIALIZATION functionality.\nThis is the last step before leaving the authentication procedure.\nOnce you have validated and serialized the user, you can get an identifier from the serialized user to search additional data in your database, eg a username/id (" + id + ").\nWhen successful, this data goes to the redirected page of your choice after completing the authentication procedure attached to the request object as `req.user`.\nAgain, there are packages that offer a shipped functionality for your convenience.\nIn my example I am not searching anything and just passing a fake id directly.\n\n\n");
    //do something with the id to find data from database about a user
    done(null, id); //user object attaches to the request as req.user
});

// registering mongoDB for its use in the local strategy


//auth_exer_app.get('/', function(req, res) {
//    res.send("Hello world!");
//});

//mounting routes
auth_exer_app.use('/', routes);

//////////////////
//*** TEST AREA ***//
//////////////////
// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
// in order to see this working:
// 1) set your Twitter App settings (currently using one I called "amsterdamfcctest01") for local development test
//    see this: https://stackoverflow.com/a/31716180
// 2) verify that the following requirements are correct in your config file AND your app settings:
//  -- consumer key
//  -- consumer secret
//  -- set web and callback using IP address for localhost instead of alias
// 3) after that is verified, use the IP address instead of the alias to call the page from browser

// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
auth_exer_app.get('/auth/twitter', //from here we call Twitter and set it on in the corresponding callback link
    mw.passportAppconfig.passportApp.authenticate('twitter')
);

//here is where authorization is asked; if the requirements for the authentication are available, it runs the Twitter Strategy callback function
auth_exer_app.get('/request-token',
    mw.passportAppconfig.passportApp.authenticate('twitter', {
        'session': true,
        successRedirect: '/',
        failureRedirect: '/failure',
    })
);

// The following errors are possible:
// - I was using a proxy in ngrok: it is apparently not working and even considered malware
// - URL considered malware: this is probably because you put the ngrok in the settings but you are not using the ngrok callback to get into twitter but trying to get there through the application instead; this error is POORLY documented!!!
// - the URL is not recognised: probably you are using standard links in the settings but trying to get in contact with twitter through your app; this error is POORLY documented
// - Callback URL not approved for this client application: there is a mismatch between the callbacks you have in config and the one you set in the App settings; your ngrok callback in config should match the one you provided as callback in twitter app settings
// - twitter failed to authorize: if you are trying to link to twitter through ngrok link as recommended, it is probably the keys are incorrect: https://www.quora.com/Why-am-I-getting-the-Could-not-authenticate-you-message-from-Twitters-API
// - failed to find request token in session: again, all the previous connecting procedure are ok but you don't have a session available; check this link: https://stackoverflow.com/questions/11075629/passport-twitter-failed-to-find-request-token-in-session  
// ---- mounting passport.session() into the application will help
// ---- see also more about securing passport to work at: https://github.com/expressjs/session/issues/281#issuecomment-191327863


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