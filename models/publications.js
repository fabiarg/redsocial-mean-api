'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var publicationsSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    text: String,
    file: String,
    likes: Number,
    created_at : String
});

module.exports = mongoose.model('Publication', publicationsSchema);