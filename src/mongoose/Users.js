const Schema = require('mongoose').Schema;

const User = new Schema ({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    updated: { type: Date, default: Date.now },
});

module.exports =  User;