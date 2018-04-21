'use strict'

//configurar express
var express = require('express');
var bodyParser = require('body-parser');

//crear app express
var app = express();

//cargar rutas
var user_routes = require('./route/user');
var follow_routes = require('./route/follow');
var publications_routers = require('./route/publications');
var message_routers = require('./route/message');

//cors
// config cabeceras http
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); //verificar dominio del cliente
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

	next();
});

//middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publications_routers);
app.use('/api', message_routers);

//exportacion
module.exports = app;