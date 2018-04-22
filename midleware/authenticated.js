'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config');
var clave = config.SECRET_TOKEN;

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({ message: 'La peticion no tiene cabecera de autenticacion!'})
    }

    //quitamos las comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, clave);

        if(payload.exp <= moment().unix()){
            return req.status(401).send({ message: 'El token ha expirado'});
        }
    } catch (error) {
        return req.status(404).send({ message: 'El token es invalido'});
    }

    req.user = payload;

    next();
}