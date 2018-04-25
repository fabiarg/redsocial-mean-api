'use strict'

var express = require('express');
var api = express.Router();

var userMiddleware = require('../midleware/authenticated');
var publicationsController = require('../controllers/publications');

//conectar con el directorio para subir imagenes
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
//var md_upload = multipart({uploadDir: './uploads/publications'}); para directorio del servidor

api.get('/testPublications', userMiddleware.ensureAuth, publicationsController.test);
api.post('/savePublication', userMiddleware.ensureAuth, publicationsController.savePublication);
api.get('/getPublications/:page?', userMiddleware.ensureAuth, publicationsController.getPublicationsTimeline);
api.get('/getPublication/:id', userMiddleware.ensureAuth, publicationsController.getPublication);
api.get('/getPublicationUser/:user?/:page?', userMiddleware.ensureAuth, publicationsController.getPublicationUser);
api.delete('/deletePublication/:id', userMiddleware.ensureAuth, publicationsController.deletePublication);
api.post('/uploadFilePublication/:id', [userMiddleware.ensureAuth, multipartMiddleware], publicationsController.uploadFilePublication);
api.get('/get-file-publication/:imageFile', publicationsController.getImagePublication);
api.get('/addLikePublication/:id', userMiddleware.ensureAuth, publicationsController.addLikePublication);
api.get('/getLikesPublication/:id', userMiddleware.ensureAuth, publicationsController.getLikePublication);
api.get('/getLikesAllPublications', userMiddleware.ensureAuth, publicationsController.getLikeAllPublications);
api.delete('/deslikePublication/:id', userMiddleware.ensureAuth, publicationsController.deleteLikePublication);


module.exports = api;

