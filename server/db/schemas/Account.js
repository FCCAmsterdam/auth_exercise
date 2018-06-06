var mongoAPI = require('..');
var passportLocalMongoose = require('passport-local-mongoose');

var accountSchema = mongoAPI.Schema({
    accountID: String,
    pasword: String
});

accountSchema.plugin(passportLocalMongoose);

var Account = mongoAPI.model("Account", accountSchema);

module.exports = Account;