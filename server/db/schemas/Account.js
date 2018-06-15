var mongoAPI = require('..');
var passportLocalMongoose = require('passport-local-mongoose');

var accountSchema = mongoAPI.Schema({
    //username: String,
    //password: String
});

accountSchema.plugin(passportLocalMongoose);

var Account = mongoAPI.model("Account", accountSchema);

module.exports = Account;