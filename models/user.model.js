'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    image: String,
    phone: Number,
    rol: String,
    contacts: [{type: Schema.ObjectId, ref: 'contact'}]
});

module.exports = mongoose.model('user', userSchema);