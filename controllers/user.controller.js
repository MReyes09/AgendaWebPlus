'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

//Modulos ya obtenidos
var fs = require('fs');
var path = require('path');

function saveUserByAdmin(req, res) {
    var userId = req.params.id;
    var user = new User();
    var params = req.body;

    if(userId != req.user.sub){
        res.status(401).send({message: 'No tienes permiso para crear usuarios en esta ruta'})
    }else{
        if(params.name && params.username && params.email && params.password && params.rol){
            User.findOne({username: params.username}, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general en el servidor'});
                }else if(userFind){
                    return res.send({message: 'Nombre de usuario ya en uso'});
                }else{
                    bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en la encriptación'});
                        }else if(passwordHash){
                            user.password = passwordHash;
                            user.name = params.name;
                            user.lastname = params.lastname;
                            user.rol = params.rol;
                            user.username = params.username.toLowerCase();
                            user.email = params.email.toLowerCase();
    
                            user.save((err, userSaved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar'});
                                }else if(userSaved){
                                    return res.send({message: 'Usuario guardado', userSaved});
                                }else{
                                    return res.status(500).send({message: 'No se guardó el usuario'});
                                }
                            })
                        }else{
                            return res.status(401).send({message: 'Contraseña no encriptada'});
                        }
                    })
                }
            })
        }else{
            return res.send({message: 'Por favor ingresa los datos obligatorios'});
        }
    }
}

function prueba(req, res){
    return res.send({message:'Correcto'});
    console.log(req.user);
}

function uploadImage(req, res){
    var userId = req.params.id;
    var update = req.body;
    var fileName;

    if(userId != req.user.sub){
        res.status(401).send({message:'No tienes permisos'});
    }else{
        // Identifica si vienen archivos
        if(req.files){
            
            //ruta en la que llega la imagen
            var filePath = req.files.image.path;

            //fileSplit separa palabras, direcciones, etc
            // Separar en jerarquia la ruta de la imagen alt + 92 "\\   alt + 124 ||"
            var fileSplit = filePath.split('\\');
            //filePath: document/image/mi-imagen.jpg   0/1/2
            var fileName = fileSplit[2];

            var extension = fileName.split('\.');
            var fileExt = extension[1];
            if( fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
                User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdate) => {
                    if(err){
                        res.status(500).send({message:'Error general en imagen'});
                    }else if(userUpdate){
                        res.send({user: userUpdate, userImage: userUpdate.image});
                    }else{
                        res.status(401).send({message:'No se ha podido actualizar'});
                    }
                });
            }else{
                fs.unlink(filePath, (err) =>{
                    if(err){
                        res.status(500).send({message:'Extension no valida y error al eliminar el archivo'});
                    }else{
                        res.send({message:'Extension no valida'});
                    }
                })
            }
        }else{
            res.status(404).send({message:'No has enviado una imagen a subir'});
        }
    }
}

function getImage(req, res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/users/' + fileName;

    fs.exists(pathFile, (exists) => {
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message:'Imagen inexistente'})
        }
    })
}

function saveUser(req, res){
    var user = new User()
    var params = req.body;

    if(params.name && params.username && params.password && params.email){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind) => {
            if(err){
                return res.status(500).send({message:'Error al buscar al usuario'});
            }else if(userFind){
                return res.send({message:'Nombre de usuario ya existente'});
            }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                    if(err){
                        return res.status(500).send({message:'Error al encriptar la contraseña'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username.toLowerCase();
                        user.phone = params.phone;
                        user.rol = 'USUARIO';
                        user.email = params.email.toLowerCase();

                        user.save((err, userSaved) => {
                            if(err){
                                return res.status(500).send({message:'Error al intentar guardar'});
                            }else if(userSaved){
                                return res.send({message:'Usuario guardado', userSaved});
                            }else{
                                return res.status(401).send({message:'No se guardo el usuario'});
                            }
                        })
                    }else{
                        return res.status(401).send({message:'Password no encriptada'});
                    }
                })
            }
        })
    }else{
        return res.send({message:'Ingresa todos los parametros minimos'});
    }
}

function login(req, res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind) => {
            if(err){
                return res.status(500).send({message:'Error al buscar usuario'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, equalsPassword) => {
                    if(err){
                        return res.status(500).send({message:'Error al comparar contraseñas'});
                    }else if(equalsPassword){
                        if(params.gettoken){
                            delete userFind.password;
                            return res.send({ token: jwt.createToken(userFind), user:userFind});
                        }else{
                            return res.send({message:'Usuario logeado'});
                        }
                        //return res.send({message:'Usuario logeado'});
                    }else{
                        return res.status(404).send({message:'No hay coincidencias en la password'});
                    }
                })
            }else{
                return res.status(404).send({message:'Usuario no encontrado'});
            }
        }).populate('contacts');
    }else{
        return res.status(404).send({message:'Por favor ingresa los datos obligatorios'});
    }
}

function updateUser(req, res){
    let userId = req.params.id;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(404).send({message:'No tienes permiso para actualizar esta cuenta'});
    }else{
        if(update.password){
            return res.status(404).send({message:'No se puede actualizar la password'});
        }else{
            if(update.username){
                User.findOne({username: update.username.toLowerCase()}, (err, userFind) => {
                    if(err){
                        return res.status(500).send({message:'Error al buscar usuario'});
                    }else if(userFind){
                        if(userFind._id == req.user.sub){
                            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(userUpdated){
                                    return res.send({message: 'Usuario actualizado', userUpdated});
                                }else{
                                    return res.send({message: 'No se pudo actualizar al usuario'});
                                }
                            })
                        }else{
                            return res.send({message: 'Nombre de usuario ya en uso'});
                        }
                    }else{
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdate) => {
                            if(err){
                                return res.status(500).send({message:'Error al intentar actualizar'});
                            }else if(userUpdate){
                                return res.send({message:'Usuario actualizado', userUpdate});
                            }else{
                                return res.status(500).send({message:'No se puede actualizar'});
                            }
                        });                
                    }
                })
            }else{
                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdate) => {
                    if(err){
                        return res.status(500).send({message:'Error al intentar actualizar'});
                    }else if(userUpdate){
                        return res.send({message:'Usuario actualizado', userUpdate});
                    }else{
                        return res.status(500).send({message:'No se puede actualizar'});
                    }
                })
            }
        }
    }        
}

function removeUser(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(401).send({message:'No tienes permiso para eliminar'});
    }else{
        User.findOne({_id: userId}, (err, userFind) => {
            if(err){
                return res.status(500).send({message:'Error al buscar usuario'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPas) => {
                    if(err){
                        return res.status(500).send({message:'Error al buscar password, no olvides colocar la contraseña'});
                    }else if(checkPas){
                        User.findByIdAndRemove(userId, (err, userRemoved) => {
                            if(err){
                                return res.status(500).send({message:'Error al buscar usuario'});
                            }else if(userRemoved){
                                return res.send({message: 'Usuario eliminado', userRemoved});
                            }else{
                                return res.status(404).send({message:'No se pudo eliminar al usuario o ya no fue eliminado'});
                            }
                        })
                    }else{
                        return res.status(500).send({message:'Password incorrecta'});
                    }
                })
            }else{
                return res.status(404).send({message:'El usuario no existe'});
            }
        })        
    }
}

function getUsers(req, res){
    User.find({}).populate('contacts').exec((err, usersFind) => {
        if(err){
            return res.status(500).send({message:'Error al buscar usuarios'});
        }else if(usersFind){
            return res.send({message:'Usuarios encontrados', users: usersFind});   
        }else{
            return res.status(404).send({message:'No se encontraron usuarios'});
        }
    })
}

function search(req, res){
    let params = req.body;

    if(params.search){
        User.find({$or: [{name: params.search},
                        {lastname: params.search},
                        {username: params.search}]}, (err, resultSearch) => {
                            if(err){
                                return res.status(500).send({message:'Error general'})
                            }else if(resultSearch){
                                return res.send({message:'Coincidencias encontradas', resultSearch});
                            }else{
                                return res.status(404).send({message:'Busqueda sin coincidencias'})
                            }
                        })
    }else{
        return res.status(400).send({message:'Envia algun dato para buscar'})
    }
}

module.exports = {
    prueba,
    saveUser,
    login,
    updateUser,
    removeUser,
    getUsers,
    search,
    uploadImage,
    getImage,
    saveUserByAdmin
}