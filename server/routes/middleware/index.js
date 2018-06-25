// 1-
// Simple authorization middleware (tutorialpoint)
var checkSignIn = function(req, res, next) {
    if (req.session.user) {
        console.log('in checkSignIn', req.session.user);
        next(); //If session exists, proceed to page
    } else {
        var err = new Error("Not logged in!");
        console.log(req.session.user);
        next(err); //Error, trying to access unauthorized page!
    }
}

// 2-
// jwt+mongoDB+passport local strategy authorization middleware (Udemy's "API Development")
// a-

// instantiating the mounting of the strategy into mongoDB through 'Account' schema
//var passportApp = require('passport');
//var localStrategy = require('passport-local').Strategy;
//
//var Account = require('../../db/schemas/Account');
//passportApp.use(new localStrategy({
//        usernameField: 'id',
//        passwordField: 'password'
//    },
//    Account.authenticate()
//));


//b-
// serialization/deserialization
//passportApp.serializeUser(Account.serializeUser());
//passportApp.deserializeUser(Account.deserializeUser());


//c 
// jwt
var config = require('../../../config');
//var JWTSECRET = 'secret'; //make it work!!!
//console.log(config);
var JWTSECRET = config.jsonwebtoken.jwtSecret;
var TOKENTIME = config.jsonwebtoken.jwtExpireTime;


//c1-
// jwtsimple

var jwtSimple = require('jwt-simple');

//var passportApp = require('../../../index.js').passportApp;
//console.log(passportApp);



var generateSimpleJwtAccessToken = function(req, res, next) {
    //console.log(req.body);
    //console.log(req.body.id, JWTSECRET);
    var token = jwtSimple.encode({ id: req.body.id }, JWTSECRET);
    res.json(token);
};

//c2-
// jwt with passport
// passport initialization and configuration
var passportApp = require('passport');
var Account = require('../../db/schemas/Account');

// jwt packages
var jwt = require('jsonwebtoken'); //produce a token
var expressjwt = require('express-jwt'); //validates JsonWebTokens in Authorization header and sets req.user
var authenticate = expressjwt({ secret: JWTSECRET });

// functions
var generateJwtAccessToken = function(req, res, next) {
    console.log('in generateJwt');
    req.token = req.token || {};
    //req.token = jwt.sign({ id: req.body.id }, JWTSECRET, { expiresIN: TOKENTIME });
    req.token = jwt.sign({ username: req.body.username }, JWTSECRET);
    next();
    //res.json(req.token);
};

var jwtResponse = function(req, res, next) {
    res.status(200).json({
        user: req.body.id,
        token: req.token
    })
};





//why session set to `false`?
//var localMongoRegistration = passportApp.authenticate('local', { session: false }, function(req, res) { res.render('signup').status(200).send('Successfully created new account') });
//var localJWTGeneration = passportApp.authenticate('local', { session: false, scope: [] }, generateJwtAccessToken, jwtResponse)
//var localMongoJWTAuthentication = function(req, res, next) {
//        console.log(req);
//        next();
//    }
/////////////////////
//*** REVEALING ***//
/////////////////////

module.exports = {
    easymw: checkSignIn,
    passportAppconfig: {
        passportApp,
        Account
    },
    jwtlocalmw: {
        generateSimpleJwtAccessToken,
        generateJwtAccessToken,
        jwtResponse,
        authenticate
        //localMongoRegistration,
        //localJWTGeneration,
        //localMongoJWTAuthentication

    }
}