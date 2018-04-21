
'use strict'

var Message = require('../models/messages');
var User = require('../models/users');
var Follow = require('../models/follow');

var moment = require('moment');
var mongoose_paginate = require('mongoose-pagination');

function test(req, res){
    return res.status(200).send({ message: 'Controlador Message'});
}

//enviar un mensaje
function saveMessage(req, res){
    var params = req.body;
    if(!params.text|| params.receiver == null) return res.status(200).send({ message: 'Complete los campos necesarios'});

    var message = new Message();
    message.text = params.text;
    message.receiver = params.receiver;
    message.emitter = req.user.sub;
    message.created_at = moment().unix();
    message.viewed = null;

    message.save((err, messageStored)=>{
        if(err) return res.status(500).send({ message: 'Error interno del servidor'});
        if(!messageStored) return res.status(404).send({ message: 'No se pudo guardar el mensaje'});

        return res.status(200).send({ message: messageStored });
    })
}

//mostrar mensajes recibidos del usuario aut. (paginados)
function getMessagesReceived(req, res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({'receiver': req.user.sub}).populate('emitter', 'name surname nick image').paginate(page, itemsPerPage, (err, messages, total)=>{
        if(err) return res.status(500).send({ message: 'Error interno del servidor'});
        if(!messages) return res.status(200).send({ message: 'No se pudo obtener los mensajes correspondientes al usuario'});

        return res.status(200).send({
            page,
            pages: Math.ceil(total/itemsPerPage),
            total,
            messages
        });    
    });
}

//Listado de mensajes enviados del usuario aut.(paginados)
function getMessagesEmitter(req, res){
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 4;

    Message.find({'emitter': req.user.sub}).populate('emitter receiver', 'name surname nick image').paginate(page, itemsPerPage, (err, messages, total)=>{
        if(err) return res.status(500).send({ message: 'Error interno del servidor'});
        if(!messages) return res.status(200).send({ message: 'No se pudo obtener los mensajes correspondientes al usuario'});

        return res.status(200).send({
            page,
            pages: Math.ceil(total/itemsPerPage),
            total,
            messages
        });    
    });
}

//contar los mensajes recibidos sin leer del usuario aut.
function countMessage(req, res){
    let userId = req.user.sub;

    Message.count({'receiver':userId, 'viewed':null}).exec((err, messageCount)=>{
       if(err) return res.status(500).send({ message: 'Error interno del servidor'});
      // if(!messageCount) return res.status(404).send({ message: 'No se ha posido contar mensajes'});

       return res.status(200).send({
           countMessageUnViewed: messageCount
       });
    });
}

//funcion para actualizar la prop: viewed a true (mensaje leido)
function setMessageViewed(req, res){
    let userId = req.user.sub;

    //actualizar a todos los doc. con prop: viewed a true;
    Message.update({'receiver':userId, 'viewed': null}, {'viewed': 'true'}, {multi: true}, (err, updatedMessage)=>{
        if(err) return res.status(500).send({ message: 'Error interno del servidor' });

        return res.status(200).send({
            updatedMessage
        });
    });
}

module.exports = {
    test,
    saveMessage,
    getMessagesReceived,
    getMessagesEmitter,
    countMessage,
    setMessageViewed
}