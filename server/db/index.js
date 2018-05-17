var mongoAPI = require('mongoose');
var dbURI = require('../../config').db.dbURI;

//why this can be here and not in the main express app? IT IS A DIFFERENT SERVER!
//And the connection between the app and mongo is made THROUGH THE SCHEMAS!!!
//which are the ones which interact in the routers 
mongoAPI.connect(dbURI);
console.log(mongoAPI.connection.readyState);
mongoAPI.connection.on('connected', function() {
    console.log('Mongoose default connection open to ');
});

module.exports = mongoAPI;