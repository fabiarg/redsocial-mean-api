'use strict'

var mongoose = require('mongoose');
//servidor
var app = require('./app');
const http = require('http'); //modulo nativo http

var server = http.createServer(app); //crear servidor

var db = process.env.MONGODB_URI || 'mongodb://localhost:27017/mean_social';//db produccion o local

app.set('port', process.env.PORT || 3800); //setear el puerto de produccion o el default

//conexion con db
mongoose.Promise = global.Promise;
mongoose.connect(db, {useMongoClient: true})
        .then(()=>{
            console.log('La conexion ha sido creada correctamente');

            //creacion del servidor
           /* app.listen(port, ()=>{
                console.log('servidor basico corriendo en http://localhost:3800');
            });*/
            app.listen(app.get('port'), ()=>{
                console.log(`Servidor corriendo en el puerto: ${app.get('port')}`);
            })
        })
        .catch((error)=>{
            console.log('ha ocurrido un error'+error);
        });