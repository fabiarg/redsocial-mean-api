'use strict';

var express = require('express');
var userController = require('../controllers/user');
var userMiddleware = require('../midleware/authenticated');

//conectar con el directorio para subir imagenes
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
//var md_upload = multipart({uploadDir: './uploads/users'}) para subir en directorio del servidor

var api = express.Router();

api.get('/', userController.home);
api.get('/pruebas',userMiddleware.ensureAuth, userController.prueba);
api.post('/registerUser', userController.saveUser);
api.post('/login', userController.loginUser);
api.get('/showUser/:id', userMiddleware.ensureAuth, userController.showUser);
api.get('/getUsers/:page?', userMiddleware.ensureAuth, userController.getUsers);
api.get('/getUsersSearch/:search', userMiddleware.ensureAuth, userController.getUsersSearch);
api.get('/countFollows/:id?', userMiddleware.ensureAuth, userController.countUserFollowsPubli);
api.put('/updateUser/:id', userMiddleware.ensureAuth, userController.updateUser);
api.post('/uploadProfile/:id', [userMiddleware.ensureAuth, multipartMiddleware], userController.uploadProfile);
api.get('/getImage/:imageFile', userController.getImageProfile);

module.exports = api;