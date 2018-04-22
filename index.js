'use strict'

var mongoose = require('mongoose');
//servidor
var app = require('./app');
const http = require('http'); //modulo nativo http
const config = require('./config'); //variables de entorno

var db = config.db;
var server = http.createServer(app); //crear servidor

app.set('port', config.port); //setear el puerto de produccion o el default

//conexion con db
mongoose.Promise = global.Promise;
mongoose.connect(db, {useMongoClient: true})
        .then(()=>{
            console.log('La conexion ha sido creada correctamente');

            //creacion del servidor
           /* app.listen(port, ()=>{
                console.log('servidor basico corriendo en http://localhost:3800');
            });*/
            server.listen(app.get('port'), ()=>{
                console.log(`Servidor corriendo en el puerto: ${app.get('port')}`);
            })
        })
        .catch((error)=>{
            console.log('ha ocurrido un error'+error);
        });