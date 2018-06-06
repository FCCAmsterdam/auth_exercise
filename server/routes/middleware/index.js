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
var passportApp = require('passport');
var localStrategy = require('passport-local').Strategy;

var Account = require('../../db/schemas/Account');
passportApp.use(new localStrategy({
        usernameField: 'accountID',
        passwordField: 'password'
    },
    Account.authenticate()
));


//b-
// serialization/deserialization
passportApp.serializeUser(Account.serializeUser());
passportApp.deserializeUser(Account.deserializeUser());

//c-
// jwt
var jwt = require('jsonwebtoken');
var expressjwt = require('express-jwt');

var TOKENTIME = 3600;
var JWTSECRET = "mysecretJWT"

var generateJwtAccessToken = function(req, res, next) {
    req.token = req.token || {};
    req.token = jwt.sign({ id: req.user.id }, JWTSECRET, { expiresIN: TOKENTIME });
    next();
}

var jwtResponse = function(req, res) {
    res.status(200).json({
        user: req.user.id,
        token: req.token
    })
}

var localMongoRegistration = passportApp.authenticate('local', { session: false }, function(req, res) { res.status(200).send('Successfully created new account') });
var localJWTGeneration = passportApp.authenticate('local', { session: false, scope: [] }, generateJwtAccessToken, jwtResponse)
var localMongoJWTAuthentication = function(req, res, next) { next() }
    /////////////////////
    //*** REVEALING ***//
    /////////////////////

module.exports = {
    easymw: checkSignIn,
    passportApp: passportApp,
    jwtlocalmw: {
        localMongoRegistration,
        localJWTGeneration,
        localMongoJWTAuthentication

    }
}