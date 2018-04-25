'use strict'

var User = require('../models/users');
var Follow = require('../models/follow');
var mongoose_pagination = require('mongoose-pagination');

//TEST
function prueba(req, res){
    return res.status(200).send({ message: 'controlador Follow'});
}
//GUARDAR SEGUIMIENTO
function saveFollow(req, res){
    var UserId = req.user.sub;
    var params = req.body;
    var UserFollowed = params.followed;

    var follow = new Follow;
    
    //comprueba si ya esta siguiendo a ese usuario
    Follow.findOne({ $and: [
        { user:  UserId },
        { followed: UserFollowed }
    ]}).exec((err, result)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion' });
        if(result){
            return res.status(200).send({ message: 'Ya estas siguiendo a este usuario'});
        }
        else{
            follow.user = UserId;
            follow.followed = UserFollowed;
            follow.save((err, followStored)=>{
                if(err) return res.status(500).send({ message: 'Error en la peticion'});
                if(!followStored) return res.status(404).send({ message: 'No se pudo seguir al usuario'});
        
                res.status(200).send({ follow: followStored });
            });
        }
        
    });

    
}
//DEJAR DE SEGUIR
function deleteFollow(req, res){
    var UserId = req.user.sub;
    var UserFollowed = req.params.id;

    Follow.find({'user': UserId, 'followed': UserFollowed}).remove((err)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion'});

        res.status(200).send({ message: 'Seguimiento eliminado'});
    });
}

//MOSTRAR LISTADO PAGINADO DE USUARIOS QUE SIGUE  EL AUTENTICADO Y DEL QUE BUSQUE POR SU ID
function getFollowingUsers(req, res){
   var userId = req.user.sub;
   if(req.params.id && req.params.page){
       //si hay dos parametros, el primero hace referencia al id del usuario
       userId  = req.params.id;
   }
   var page = 1;
   if(req.params.page){
     page = req.params.page;
   }else{
       /*si no hay segundo parametro (ref: page), entiende que el primero es un paginado
       para el usuario autenticado*/
       page = req.params.id;
   }
   var itemsPerPage = 4;
   Follow.find({user: userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, function(err, following, total){
       if(err) return res.status(500).send({ message: 'Error en la peticion'});
       if(!following) return res.status(404).send({ message: 'No se ha podido listar los usuaro seguidos'});

       /*funcion asincrona para verificar si los ids de usuarios que sigue el usuario buscado 
       tambien sigue el autenticado */
       followUserId(req.user.sub).then(
           value =>{
                return res.status(200).send({ 
                    total: total,
                    pages: Math.ceil(total/itemsPerPage),
                    following,
                    users_following : value.following,
                    users_followed : value.followed
                });
           });
      
    });

}  

//MOSTRAR LISTADO PAGINADO DE USUARIOS QUE SIGUEN AL AUTENTICADO Y DEL QUE BUSQUE POR SU ID
function getFollowedUsers(req, res){
    var userId = req.user.sub;
    if(req.params.id && req.params.page){
        //si hay dos parametros, el primero hace referencia al id del usuario
        userId  = req.params.id;
    }
    var page = 1;
    if(req.params.page){
      page = req.params.page;
    }else{
        /*si no hay segundo parametro (ref: page), entiende que el primero es un paginado
        para el usuario autenticado*/
        page = req.params.id;
    }
    var itemsPerPage = 4;
    Follow.find({followed: userId}).populate({path: 'user'}).paginate(page, itemsPerPage, function(err, following, total){
        if(err) return res.status(500).send({ message: 'Error en la peticion'});
        if(!following) return res.status(404).send({ message: 'No se ha podido listar los usuarios seguidores'});
 
        /*funcion asincrona para verificar si esos los ids de usuarios que sigue el usuario buscado 
        tambien sigue el autenticado */
        followUserId(req.user.sub).then(
            value =>{
                 return res.status(200).send({ 
                     total: total,
                     pages: Math.ceil(total/itemsPerPage),
                     following,
                     users_following : value.following,
                     users_followed : value.followed
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

//MOSTRAR USUARIOS QUE SIGO Y QUE ME SIGUEN SIN PAGINAR (util para el envio de mensajes)
function getMyFollows(req, res){
    var userId = req.user.sub;

    var find = Follow.find({ user: userId });

    //mostrar usuarios que me siguen 
    if(req.params.followed){
        //si hay un param: followed en true por url: http://getMyFollow/true
        find = Follow.find({ followed: userId });
    }
    
    find.populate('user followed').exec((err, follows)=>{
        if(err) return res.status(500).send({ message: 'Error en la peticion'});
        if(!follows) return res.status(404).send({ message: 'No sigues a ningun usuario'});

        return res.status(200).send({ follows });
    });
}


module.exports = {
    prueba,
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}
