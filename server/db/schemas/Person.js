var mongoAPI = require('..');

var personSchema = mongoAPI.Schema({
    name: String,
    age: Number,
    nationality: String
});
var Person = mongoAPI.model("Person", personSchema);

module.exports = Person;