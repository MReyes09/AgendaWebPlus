'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-gendaWeb@';

exports.createToken = (user) => {
    var payload = {
        sub: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        rol: user.rol,
        phone: user.phone,
        iat: moment().unix(),
        exp: moment().add(3600, 'seconds').unix()        
    }
    return jwt.encode(payload, secretKey);
}

