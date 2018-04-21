'use strict'

var express = require('express');
var api = express.Router();

var messageController = require('../controllers/message');
var userMiddleware = require('../midleware/authenticated');

api.get('/testMessage', userMiddleware.ensureAuth, messageController.test);
api.post('/message', userMiddleware.ensureAuth, messageController.saveMessage);
api.get('/messages-received/:page?', userMiddleware.ensureAuth, messageController.getMessagesReceived);
api.get('/message-emitter/:page?', userMiddleware.ensureAuth, messageController.getMessagesEmitter);
api.get('/message-count', userMiddleware.ensureAuth, messageController.countMessage);
api.get('/message-view', userMiddleware.ensureAuth, messageController.setMessageViewed);

module.exports = api;