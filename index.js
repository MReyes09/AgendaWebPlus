'use strict'

var mongoose = require('mongoose');
var port = process.env.PORT || 3200;
var app = require('./app');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/AgendaWebPlus', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Conectado a la DB');
        app.listen(port, () => {
            console.log('Servidor de express activado');
        })
    }).catch((err) => {
        console.log('Error al conectar a la DB', err);
    })    