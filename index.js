'use strict'

var mongoose = require('mongoose');
//servidor
var app = require('./app');
const http = require('http'); //modulo nativo http

var server = http.createServer(app); //crear servidor

app.set('port', process.env.PORT || 3800); //setear el puerto de produccion o el default

//conexion con db
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://red-social-mean-2018-sf:red-social-mean-2018-sf@ds247759.mlab.com:47759/red-soc-mean-2018', {useMongoClient: true})
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