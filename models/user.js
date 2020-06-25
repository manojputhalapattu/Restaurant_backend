const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
    firstname: {
      type: String,
        default: ''
    },
    lastname: {
      type: String,
        default: ''
    },
    facebookId :String,
    admin:   {
        type: Boolean,
        default: false
    }
},{timestamps :true});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User',User)
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTk1YTY0MDgxYjhkODcxNDgzNWVlZjkiLCJpYXQiOjE1ODY4NjU3NDQsImV4cCI6MTU4Njg2OTM0NH0.1UXY__HnbE9QbTqtW8-_K6BxlED_wu8wtnk4BYDU-EY