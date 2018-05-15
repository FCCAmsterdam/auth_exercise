var routes = require('express').Router();

routes.get('/', function(req, res) {
    res.send("Hello world!");
});


routes.get('/routes', function(req, res) {
    res.send('GET route on things.');
});

routes.get('/views', function(req, res) {
    res.render('main');
});

module.exports = {
    routes: routes,
}