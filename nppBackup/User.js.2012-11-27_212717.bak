var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    msg: String,
    registeredTimestamp: Date,
    lastLoginTimestamp: Date,
    lastIp: String,
    lastHost: String,
    lastUserAgent: String,
    lastMsgTimestamp: Date,
    superuser: Boolean
});

User.plugin(passportLocalMongoose); //adds username, password to schema

module.exports = mongoose.model('User', User);
