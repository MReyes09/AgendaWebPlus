'use strict'

var User = require('../models/user.model');
var Contact = require('../models/contact.model');

function setContact(req, res){
    var userId = req.params.id;
    var params = req.body;
    var contact = new Contact();

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar esta acción'});
    }else{
        User.findById(userId, (err, userFind) => {
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                contact.name = params.name;
                contact.lastname = params.lastname;
                contact.phone = params.phone;

                contact.save((err, contactSaved) => {
                    if(err){
                        return res.status(500).send({message: 'Error general'});
                    }else if(contactSaved){
                        User.findByIdAndUpdate(userId, {$push: {contacts: contactSaved._id}}, {new: true}, (err, save) => {
                            if(err){
                                return res.status(500).send({message: 'No se guardo el contacto'});
                            }else if(save){
                                return res.send({message:'El contacto fue guardado', saveContact:save});
                            }else{
                                return res.status(500).send({message: 'Error al agregar contacto'});
                            }
                        }).populate('contacts');
                    }else{
                        return res.status(500).send({message: 'Error al agregar contacto'});
                    }
                })
            }else{
                return res.status(404).send({message: 'El usuario que deseas agregar no existe'});
            }
        })
    }
}

function updateContact(req, res){
    let userId = req.params.idU;
    let contactId = req.params.idC;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para realizar esta accion'})
    }else{
        if(update.name && update.phone){
            Contact.findById(contactId, (err, contactFind) => {
                if(err){
                    return res.status(500).send({message:'Error al buscar'})
                }else if(contactFind){
                    User.findOne({_id: userId, contacts: contactId}, (err, find) => {
                        if(err){
                            return res.status(500).send({message:'Error en la busqueda Usuario'});
                        }else if(find){
                            Contact.findByIdAndUpdate(contactId, update, {new: true}, (err, contactUpdate) => {
                                if(err){
                                    return res.status(500).send({message:'Error en la actualizacion', err});
                                }else if(contactUpdate){
                                    return res.status(200).send({message:'contacto actualizado', contactUpdate});
                                }else{
                                    return res.status(404).send({message:'Contacto no actualizado'});
                                }
                            })
                        }else{
                            return res.status(404).send({message:'Usuario no encontrado'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'Contacto inexistente'});
                }
            })
        }else{
            return res.status(404).send({message:'Ingresa los datos minimos para actualizar'})
        }
    }
}

function removeContact(req, res){
    let userId = req.params.idU;
    let contactId = req.params.idC;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar la acción'});
    }else{
        User.findOneAndUpdate({_id: userId, contacts: contactId},
            {$pull: {contacts: contactId}}, {new: true}, (err, userFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intetar eliminar contacto'});
                }else if(userFind){
                    Contact.findByIdAndRemove(contactId, (err, contactRemoved) => {
                        if(err){
                            return res.status(500).send({message:'Error general al intetar eliminar contacto'});
                        }else if(contactRemoved){
                            return res.send({message:'Contacto eliminado', userFind});
                        }else{
                            return res.status(500).send({message:'Contacto ya encontrado o ya eliminado'});
                        }
                    })
                }else{
                    return res.status(500).send({message:'No se pudo eliminar el contacto del usuario'});
                }
        }).populate('contacts');
    }
}

module.exports = {
    setContact,
    updateContact,
    removeContact
}