'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middleware/authenticated');
var connectMultiparty = require('connect-multiparty');
var upload = connectMultiparty({ uploadDir: './uploads/users'});

var api = express.Router();

api.get('/prueba', [mdAuth.ensureAuth, mdAuth.validRol], userController.prueba);


api.post('/saveUser', userController.saveUser);
api.post('/login', userController.login);

//Uso de middleware en funciones
api.put('/updateUser/:id', mdAuth.ensureAuth, userController.updateUser);
api.put('/removeUser/:id', mdAuth.ensureAuth, userController.removeUser);
api.get('/getUsers', [mdAuth.ensureAuth, mdAuth.validRol], userController.getUsers);
api.post('/search', mdAuth.ensureAuthAdmin, userController.search);
api.put('/:id/uploadImage', [mdAuth.ensureAuth, upload], userController.uploadImage);
api.get('/getImage/:fileName', [upload], userController.getImage);
api.post('/saveUserOnlyAdmin/:id', [mdAuth.ensureAuth, mdAuth.validRol], userController.saveUserByAdmin);


module.exports = api;