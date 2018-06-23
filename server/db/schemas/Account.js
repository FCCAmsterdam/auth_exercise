var mongoAPI = require('..');
var passportLocalMongoose = require('passport-local-mongoose');

var accountSchema = mongoAPI.Schema({
    username: { type: String },
    password: { type: String }
});

accountSchema.plugin(passportLocalMongoose);

var Account = mongoAPI.model("Account", accountSchema);

module.exports = Account;