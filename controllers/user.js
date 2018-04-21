"use strict";

const asyncify = require('express-asyncify');//para funciones asincronas
//const async = require('async--await');
//models
var User = require('../models/users');
const Follow = require('../models/follow');
const Publication = require('../models/publications');

var bycript = require('bcrypt-node');
var _jwt = require('../services/jwt');
var mongoose_pagination = require('mongoose-pagination');

//filesystem y path de node
var fs = require('fs');
var path = require('path');


function home(req, res){
    res.status(200).send({
        message: 'welcome to Home'
    });
}
function prueba(req, res){
    res.status(200).send({
         message: 'seccion prueba'
    });
}

//metodo para registrar/guardar un nuevo usuario
function saveUser(req, res){
    var params = req.body;
    var user = new User();
    console.log(params)
    if(params.name && params.surname && params.nick && params.email && params.password){
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'USER_ROLE';
        user.image = null;

        //controlar usuario duplicado
        User.find({ $or: [
                             { email: user.email.toLowerCase() },
                             { nick: user.nick.toLowerCase() }
                        ]})
                    .exec((err, users)=>{
                    if(err) return res.status(200).send({ message: 'Error en la peticion de usuarios'});
                    if(users && users.length >= 1){
                        return res.status(200).send({ message: 'El usuario que intenta registrar, ya existe'});
                    }else{

                    //esncriptar password
                    bycript.hash(params.password, null, null, (err, hash)=>{
                        user.password = hash;
            
                        user.save((err, userStored)=>{
                            if(err) return res.status(500).send({ message: 'error al intentar guardar los datos'});
            
                            if(userStored){
                                return res.status(200).send({ user: userStored });
                            }
                            else{
                                return res.status(404).send({ message: 'No se ha registrado el usuario'});
                            }
                        });
                    });

                    }
                 }); 
    }
    else{
        res.status(200).send({ message: 'completa los datos necesarios!' + params});
    }
}

function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;
    //identificar al usuario
    User.findOne({email: email}, (err, user)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion'});
        if(user){
            bycript.compare(password, user.password, (err, check)=>{
                if(check){
                    if(params.gettoken){
                        //si es 'true', genera y devuelve token
                        return res.status(200).send({ createToken: _jwt.createToken(user) })
                    }
                    //datos de usuario
                    user.password = undefined;//no muestro contraseñas
                    return res.status(200).send({ user: user });
                }else{
                    return res.status(404).send({ message: 'contraseña de usuario incorrecta'});
                }
            });
        }else{
            return res.status(404).send({ message: 'No se ha podido identificar al usuario!'});
        }
    });
}


//mostrar usuario por su id; verificar si sigue a un usuario
function showUser(req, res){
    var userId = req.params.id; //recibe parametro por url
    
    //busqueda del usuario, excluyendo contraseña y rol
    User.findById(userId, {password : 0, role :0}, (err, user)=>{
        if(err) return res.status(500).send({ message: 'Error al intentar obtener los datos del usuario' });
        if(!user) return res.status(404).send({ message: 'El usuario no existe' });

          
        //funcion asincronica
        followThisUser(req.user.sub, userId).then((value)=>{
            return res.status(200).send({user, following: value.following, followed: value.followed});
        });

    });
}

//funcion asincrona para verificar si el usuario buscado sigue al autenticado y este lo siguee
const followThisUser = async function(user_auth, userId){
        // el usuario logeado sigue al usuario buscado
        var following = await Follow.findOne({'user':user_auth, 'followed':userId}, (err, follow)=>{
            if(err) return handleError(err);
             return  follow;    
        });

        //usuario buscado sigue al usuario logueado
        var followed = await Follow.findOne({'user':userId, 'followed':user_auth}, (err, follow)=>{
            if(err) return handleError(err);
             return  follow;    
        });;
       return {
           following: following,
           followed: followed
       }
};


//Usuarios paginados
function getUsers(req, res){
    var identity_user = req.user.sub;

    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 2;

    User.find().sort('_id').paginate(page, itemsPerPage, function(err, users, total) {
        if(err) return res.status(500).send({ message: 'Error en la peticion'});
        if(!users || users.length < 0) return res.status(404).send({ message: 'No se ha encontrado usuarios'});
            
        
        followUserId(identity_user).then((value)=>{
            return res.status(200).send({
                users,
                total,
                pages: Math.ceil(total/itemsPerPage),
                users_following: value.following,
                users_follow_me: value.followed
            });
        });

       
    });
}
        //obtener ids de usuarios que sigue el autentificado y los que siguen a este
        async function followUserId(user_auth){
            //buscar usuarios que sigue el autenticado find(conditon, select, callback)
            var following = await Follow.find({'user': user_auth}, followed, (err, follows)=>{
                if(err) return handleError(err);
                return follows;
            });

            //buscar usuarios que siguen al auntenticado
            var followed = await Follow.find({'followed': user_auth}, {'_id':0, '__v':0, 'followed':0}, (err, follows)=>{
                if(err) return handleError(err);
                return follows;
            })

            //lista de ids de usuarios que sigue el autenticado
            var following_clear = [];
            following.forEach((follow)=>{
                    following_clear.push(follow.followed);
            });
            //lista de ids de usuarios que siguen al autenticado
            var followed_clear = [];
            followed.forEach((follow)=>{
                    followed_clear.push(follow.user);
            });

            return {
                following: following_clear,
                followed: followed_clear
            }
        }


//USUARIOS BUSCADOS
function getUsersSearch(req, res){
    if(req.params.search){
        let q = req.params.search;
        const regex = new RegExp(escapeRegex(q), 'gi');

        /*alternativa
         User.find({ name : {$regex: new RegExp(q)} }, { _v:0, _id:0}, callback(err, data)...
        */
        //Buscar usuario por nombre para traer sus datos
        User.find({$or: [{ name : regex }, { surname : regex }]}, { name: 1, surname: 1, nick:1, image:1 }, (err, data)=>{
            if(err) return res.status(500).send({ message: 'Error interno del servidor'});
            if(!data) return res.status(404).send({ message: 'No se pudo encontrar el usuario buscado...'});

            res.status(200).send({ users : data });
        }).limit(10);
    }else{
        res.status(500).send({ message: 'Error interno del servidor'});
    }
}
        //escape regex
        function escapeRegex(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        };

        //CONTAR CANTIDAD DE USUARIO QUE SIGUE, SEGUIDOS Y PUBLICACIONES
function countUserFollowsPubli(req, res){
    var userId = req.user.sub;
    if(req.params.id){
        userId = req.params.id;
    }

    countFollowsPubli(userId).then((value)=>{
        return res.status(200).send({ value });
    });

}

        //contar usuarios que sigue el autenticado y los usuarios que siguen a este
        async function countFollowsPubli(userId){
            var c_following = await Follow.count({'user': userId}, (err, c_follows)=>{
                return c_follows;
            });

            var c_followed = await Follow.count({'followed': userId}, (err, c_follows)=>{
                return c_follows;
            });

            var c_publication = await Publication.count({'user' : userId}, (err, c_publication)=>{
                return c_publication;
            });

            return {
                c_following,
                c_followed,
                c_publication
            }
        }

function updateUser(req, res){
    var updateUser = req.body;
    var userId = req.params.id;

    //se elimina la prop. password antes de actualizar (recibida por put)
    delete updateUser.password;

    //coincidir el id del usuario que se actualiza con su token (cada usuario modifica su perfil)
    if(userId != req.user.sub){
        return res.status(403).send({ message: 'No tiene permisos para realizar esta accion'});
    }

    User.find({ $or:[
                    { email : updateUser.email.toLowerCase() },
                    { nick : updateUser.nick.toLowerCase()}
                ]}).exec((err, users)=>
                {
                    if(err) return res.status(200).send({ message: 'Error en la peticion de usuarios'});
                   
                     let user_iseset = false;
                     users.forEach(user => {
                         if(user && user._id != userId) user_iseset  = true;
                     });

                     
                   
                    if(user_iseset){
                        return res.status(200).send({ message: 'Los datos (email o apodo) ya estan en uso'});
                    }else{
                        User.findByIdAndUpdate(userId, updateUser, {new: true}, (err, updateU)=>{
                            if(err) return res.status(500).send({ message: 'Error en la peticion'});
                            if(!updateU) return res.status(404).send({ message: 'No se ha podido actualizar el usuario'});
                    
                                return res.status(200).send({ user: updateU });
                        });
                    }  
                });
}

//subir imagen
function uploadProfile(req, res){
    var userId = req.params.id;
    if(req.files){
        //si existe el archivo buscamos por la prop. image (parametro)
        var file_path = req.files.image.path;
            var file_split = file_path.split('\\');
        var file_name = file_split[2]; //ej: nameimage.jpg
        var file_ext = file_name.split('.')[1]; //jpg, png..

        if(userId != req.user.sub){
            removeProfileUploads(res, file_path, 'No tienes permisos para realizar esta accion');
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg'){
            //se busca la imagen anterior, se borra y se actualiza la imagen
            var before_image = beforeImage(req.user.sub)
             .then((value)=>{
                console.log(value)
                 if(value.image == null){
                     //actualizar en db y directorio
                    User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, updateUser)=>{
                        if(err) return res.status(500).send({ message: 'Error en la peticion' });
                        if(!updateUser) return res.status(404).send({ message: 'No se pudo actualizar usuario'});

                        return res.status(200).send({ user: updateUser });
                    });
                 }else{
                     //si existe imagen anterior, entoncs la elimina y luego actualiza
                    fs.unlink('uploads/users/'+value.image, (err)=>{
                        if (err) return res.status(500).send({ message: 'Error interno del servidor' + 'unlink' +  err});
                        console.log('File deleted!');  
                    });

                     //actualizar en db y directorio
                     User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, updateUser)=>{
                        if(err) return res.status(500).send({ message: 'Error en la peticion' });
                        if(!updateUser) return res.status(404).send({ message: 'No se pudo actualizar usuario'});

                        return res.status(200).send({ user: updateUser });
                     });
                 }
                             
            })
            .catch(
                (error)=>{
                    //actualizar en db y directorio
                    User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, updateUser)=>{
                        if(err) return res.status(500).send({ message: 'Error en la peticion' });
                        if(!updateUser) return res.status(404).send({ message: 'No se pudo actualizar usuario'});

                        return res.status(200).send({ user: updateUser });
                    }); 
                }); 
        }
        else{
            removeProfileUploads(res, file_path, 'extension de archivo invalido')
        } 
    }
    function removeProfileUploads(res, file_path, message){
        fs.unlink(file_path, (err)=>{
            return res.status(200).send({ message: message });
        });
    }
}

//function para obtener la imagen anterior
async function beforeImage(userId){
    var path = await User.findOne({'_id': userId}, 'image', (err, file)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion'});
        if(!file) return res.status(404).send({ message: 'sin imagen'});
        return file; // {_id:000.., image: loremipsum.jpg}
    });

    return path;
}

//obtener imagen por su url
function getImageProfile(req, res){
    var image_file = req.params.imageFile;
    var image_path = './uploads/users/'+image_file;

    fs.exists(image_path, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(image_path));
        }
        else{
            res.status(404).send({ message: 'No existe la imagen indicada'});
        }
    });
}

module.exports  = {
    home,
    prueba,
    saveUser,
    loginUser,
    showUser,
    getUsers,
    getUsersSearch,
    countUserFollowsPubli,
    updateUser,
    uploadProfile,
    getImageProfile
}