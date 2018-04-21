'use strict'


var followController = require('../controllers/follow');
var userMiddleware = require('../midleware/authenticated'); //para obtener datos del token

var express = require('express');
var api = express.Router();

api.get('/prueba-follow', followController.prueba);
api.post('/follow', userMiddleware.ensureAuth, followController.saveFollow); 
api.delete('/delete-follow/:id', userMiddleware.ensureAuth, followController.deleteFollow); 
api.get('/following/:id?/:page?', userMiddleware.ensureAuth, followController.getFollowingUsers);
api.get('/followed/:id?/:page?', userMiddleware.ensureAuth, followController.getFollowedUsers);

api.get('/getMyFollows/:followed?', userMiddleware.ensureAuth, followController.getMyFollows);


module.exports = api;

