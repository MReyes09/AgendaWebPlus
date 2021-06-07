'use strict'

var express = require('express');
var contactController = require('../controllers/contact.controller');
var mdAuth = require('../middleware/authenticated');

var api = express.Router();

api.put('/setContact/:id', mdAuth.ensureAuth, contactController.setContact);
api.put('/:idU/updateContact/:idC', mdAuth.ensureAuth, contactController.updateContact);
api.put('/:idU/removeContact/:idC', mdAuth.ensureAuth, contactController.removeContact);

module.exports = api;