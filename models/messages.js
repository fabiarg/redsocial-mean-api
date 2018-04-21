'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = Schema({
    emitter: { type: Schema.ObjectId, ref: 'User' },
    receiver: { type: Schema.ObjectId, ref: 'User' },
    viewed: String,
    text: String,
    created_at: String
});

module.exports = mongoose.model('Message', messageSchema);