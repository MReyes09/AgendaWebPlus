'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var userRoute = require('./routes/user.route');
var contactRoute = require('./routes/contact.route');
var cors = require('cors');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

app.use('/v1', userRoute);
app.use('/v1', contactRoute);

module.exports = app;