var mongoAPI = require('..');
var passportLocalMongoose = require('passport-local-mongoose');
//the `passport-local-mongoose` simplifies the following `User` operation when using passport local by inserting a plugin:
//```
//passport.use(new LocalStrategy(
//  function(username, password, done) {
//    User.findOne({ username: username }, function (err, user) {
//      if (err) { return done(err); }
//      if (!user) { return done(null, false); }
//      if (!user.verifyPassword(password)) { return done(null, false); }
//      return done(null, user);
//    });
//  }
//));
//```

var accountSchema = mongoAPI.Schema({
    username: { type: String },
    password: { type: String }
});

accountSchema.plugin(passportLocalMongoose);

var Account = mongoAPI.model("Account", accountSchema);

module.exports = Account;