var routes = require('express').Router();
var Person = require('../db/schemas/Person');
var mw = require('./middleware');
console.log(mw.easymw);


// 1-
// first simple route: main
routes.get('/', function(req, res) {
    res.send("Hello world!");
});

// 2-
// a route into a new page
routes.get('/routes', function(req, res) {
    res.send('GET route on things.');
});

// 3-
// a route into a static page
routes.get('/views', function(req, res) {
    res.render('main');
});

// 4-
// a route into a form; post method
routes.get('/forms', function(req, res) {
    res.render('forms');
});

routes.post('/forms', function(req, res) { //will overwrite the rendering of the page in the previous get!
    console.log(req.body);
    res.send("recieved your request!");
});


// 5-
// mongoDB: get form and Create (post) and Read all (get)
routes.get('/person', function(req, res) {
    res.render('person');
});

routes.post('/person', function(req, res) {
    var personInfo = req.body; //Get the parsed information

    if (!personInfo.name || !personInfo.age || !personInfo.nationality) {
        res.render('show_message', {
            message: "Sorry, you provided wrong info",
            type: "error"
        });
    } else {
        var newPerson = new Person({
            name: personInfo.name,
            age: personInfo.age,
            nationality: personInfo.nationality
        });

        newPerson.save(function(err, Person) {
            if (err)
                res.render('show_message', { message: "Database error", type: "error" });
            else
                res.render('show_message', {
                    message: "New person added",
                    type: "success",
                    person: personInfo
                });
        });
    }
});

routes.get('/people', function(req, res) {
    Person.find(function(err, response) {
        res.json(response);
    });
});



// 6-
// cookies (example only creating and retrieving one)
routes.get('/cookie', function(req, res) {
    res.cookie('name', 'express').send('cookie set'); //Sets name = express; find at console : console.log(document.cookie);
    console.log('Cookies: ', req.cookies);
});


// 7-
// sessions
routes.get('/session', function(req, res) {
    if (req.session.page_views) {
        req.session.page_views++;
        res.send("You visited this page " + req.session.page_views + " times");
    } else {
        req.session.page_views = 1; //setting first value; page_views is an attribute we are declaring
        res.send("Welcome to this page for the first time!");
    }
});

// 8-
// Authentication 1: simple authentication with no third party middleware and simple checking (tutorialpoint)
var Users = [
    { id: "test01", password: "test01" }
];

routes.get('/signup1', function(req, res) {
    res.render('signup');
});

routes.post('/signup1', function(req, res) {
    if (!req.body.id || !req.body.password) {
        res.status("400");
        res.send("Invalid details!");
    } else {
        Users.filter(function(user) {
            if (user.id === req.body.id) {
                res.render('signup', {
                    message: "User Already Exists! Login or choose another user id"
                });
            }
        });
        var newUser = { id: req.body.id, password: req.body.password };
        Users.push(newUser);
        console.log('These are all my current users after a new push', Users);
        req.session.user = newUser;
        res.redirect('/protected_page');
    }
});


routes.get('/protected_page', mw.easymw, function(req, res) {
    res.render('protected_page', { id: req.session.user.id, sessiondetails: req.session })
});

routes.get('/login1', function(req, res) {
    res.render('login1');
});

routes.post('/login1', function(req, res) {
    console.log('These are all my current users before login1', Users);
    if (!req.body.id || !req.body.password) {
        res.render('login1', { message: "Please enter both id and password" });
    } else {
        Users.filter(function(user) {
            if (user.id === req.body.id && user.password === req.body.password) {
                req.session.user = user;
                res.redirect('/protected_page');
            }
        });
        res.render('login1', { message: "Invalid credentials!" });
    }
});

routes.get('/logout1', function(req, res) {
    req.session.destroy(function() {
        console.log("user logged out.")
    });
    res.redirect('/login1');
});

routes.use('/protected_page', function(err, req, res, next) {
    console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/login1');
});

// 9-
// Authentication 2a: authentication with simple jsonwebtoken
// based on "Write Modern Web Apps..." by Jeff Dickey
//for this example, I registered names as numbers (1,2); ids are those in the database

routes.get('/signup2', function(req, res) {
    res.render('signup');
});

routes.post('/signup2', function(req, res, next) {
    //var user = req.body.id;
    //mw.jwtlocalmw.generateSimpleJwtAccessToken(req, res, next);
    mw.jwtlocalmw.generateJwtAccessToken(req, res, next);
})

// 10-
// Authentication 2b: authentication with jsonwebtoken, third party middleware: passport local strategy, 
//using mongo to keep token safe (lecture 33, Udemy's "API Development" course)
routes.get('/signup3', function(req, res, next) {
    res.render('signup');
});

routes.post('/signup3', function(req, res, next) {
    //http://mherman.org/blog/2013/11/11/user-authentication-with-passport-dot-js/
    console.log(req.body);

    var newUser = new mw.passportAppconfig.Account({ username: req.body.id });
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

    mw.passportAppconfig.Account.register(newUser, req.body.password, function(err, account) {
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
        mw.passportAppconfig.passportApp.authenticate('local', { session: false, successFlash: 'Welcome!', failureFlash: true },
            function(err, user, info) {
                if (err) { return next(err); }
                console.log('in callback of passportApp authentication');
                res.render('signup').status(200).send('Successfully created new account');
            }
        )(req, res, next);
    })

});

routes.get('/login3', function(req, res) {
    res.render('login3');
});

//login3.pug will point out to /login3
//also check that for passportJS authenticate to work it will try to find 'username' and 'passport' in the req.body, because those were the names we gave them in the settings 
routes.post('/login3', mw.passportAppconfig.passportApp.authenticate('local', { session: false, scope: [], successFlash: 'Welcome!', failureFlash: true }), mw.jwtlocalmw.generateJwtAccessToken, mw.jwtlocalmw.jwtResponse);

//the `authenticate` can be only tested using Postman or curl
//in order to get the real response we need to pass the JWT through the `Authorization` header, like so
//```
//Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QwMyIsImlhdCI6MTUyOTg4MDEzMH0.AT_VvdxY2ak6Rrl0r2BmbBTuswc8aWcTdjrBRAQ-sBE
//```
//otherwise, we get an Authorization error
//
//Trying this directly from the browser will always get an error because there is no way to set the Header
routes.get('/logout3',
    function(req, res, next) {
        console.log(req.body);
        //console.log(mw.jwtlocalmw.authenticate);
        next();
    },
    mw.jwtlocalmw.authenticate,
    function(req, res) {
        req.logout();
        res.redirect('/login3');
    });



//routes.get('/signup3', function(req, res) {
//    res.render('signup');
//});

//var Account = require('../db/schemas/Account');
//routes.post('/signup3', function(req, res) {
//    //`Account` is just mounted in passport, which is mounted in main app - see middleware
//    //http://mherman.org/blog/2013/11/11/user-authentication-with-passport-dot-js/
//    console.log(req.body);
//    Account.register(new Account({ username: req.body.id }, req.body.password, function(err) {
//        if (err) {
//            res.send(err);
//        };
//        //mw.jwtlocalmw.localMongoRegistration;
//    }))
//});



//routes.get('/login2', function(req, res) {
//    res.render('login1');
//});

//routes.post('/login2', mw.jwtlocalmw.localJWTGeneration);

//routes.get('/protected_page', mw.jwtlocalmw.localMongoJWTAuthentication, function(req, res) {
//    res.render('protected_page', { id: req.user.id, sessiondetails: req.token }) //'user' is defined as part of the generateJwtAccessToken and eventually made persistent and accessible through jwtResponse
//});


//routes.get('/logout2', mw.jwtlocalmw.localMongoJWTAuthentication, function(req, res) {
//    res.logout();
//    res.status(200).send('Successfully logged out');
//})


module.exports = {
    routes: routes,
}