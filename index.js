var express = require('express');
var routes = require('./server/routes').routes;
var auth_exer_app = express();

///////////////////
//*** SETTERS ***//
///////////////////
auth_exer_app.set('view engine', 'pug');
auth_exer_app.set('views', './client');

/////////////////////////////////
//*** APP MIDDLEWARE (+ ROUTES) ***//
////////////////////////////////

//mounting public static data; adding a prefix to indicate type
auth_exer_app.use('/static', express.static('data'));

//auth_exer_app.get('/', function(req, res) {
//    res.send("Hello world!");
//});

//mounting routes
auth_exer_app.use('/', routes);



//////////////////
//*** SERVER ***//
//////////////////
auth_exer_app.listen(3000);