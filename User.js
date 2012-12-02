var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    files: Array,
    lastLoginTimestamp: Date,
});

User.plugin(passportLocalMongoose); //adds username, password to schema

module.exports = mongoose.model('User', User);
