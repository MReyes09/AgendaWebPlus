'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-IN6AM@';

exports.ensureAuth = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(403).send({message:'La peticion no lleva cabecera de autenticacion'});
    }else{
        var token = req.headers.authorization.replace(/['"']+/g,'');
        try{
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'El token a expirado'});
            }
        }catch(err){
            return res.status(401).send({message: 'Token invalido'});
        }
        
        req.user = payload;        
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next) =>{
    if(!req.headers.authorization){
        return res.status(403).send({message:'La peticion no lleva cabecera de autenticacion'});
    }else{
        var token = req.headers.authorization.replace(/['"']+/g,'');
        try{
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'El token a expirado'});
            }
            if(payload.rol != 'ROL_ADMIN'){
                return res.status(401).send({message: 'No tienes permiso para acceder a ese rol'});
            }
        }catch(err){
            return res.status(401).send({message: 'Token invalido'});
        }
        req.user = payload;        
        next();
    }
}