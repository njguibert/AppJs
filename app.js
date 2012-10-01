
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , routes_reproductor= require('./routes/reproductor')
  , routes_contador= require('./routes/contador')
  , http = require('http')
  , path = require('path')
  , _ = require('underscore');

var app = express();
var servidor=require("socket.io").listen(4000);
var sockets={};
servidor.sockets.on("connection",arranque);
var visores=[];
var admins=[];

function arranque(usuario){
  console.log("Usuario ID:"+usuario.id);
  console.log("Usuario:" + usuario);
  sockets[usuario.id]=usuario;

  usuario.on("setTipo",function setTipo(tipo,nombre){
    console.log("En el Usuario ID:"+usuario.id);
    console.log("Nombre:"+nombre);
    console.log("Setie el tipo:" + tipo);

    switch(tipo){
      case 'visor':
        var v= _(visores).detect(function(p) {
          return p.Nombre == nombre;
        });

        if (typeof(v) == "undefined"){ //Si el visor no existe lo agrego a la coleccion
          console.log("El visor NO existe");
          visores.push({id:usuario.id,Nombre:nombre});
          //Notifico a todos los admin que entro un nuevo visor
          _(admins).each(function (adm){
            console.log("Notifico a:"+ adm.Nombre);
            sockets[adm.id].emit('nuevo_visor',usuario.id,nombre);
          });
        }else{ //Si el visor ya existe almaceno el ID del Socket
          v.id=usuario.id;
          //Notifico a todos los admin que cambien el id de un visor
          _(admins).each(function (adm){
            console.log("Notifico a:"+ adm.Nombre);
            sockets[adm.id].emit('editar_visor',usuario.id,nombre);
          });          
        }
      break;
      case 'admin':
        var a= _(admins).detect(function(p) {
          return p.Nombre == nombre;
        });      
        if (typeof(a) == "undefined"){ //Si el admin no existe lo agrego a la coleccion
          console.log("El admin no existe");
          admins.push({id:usuario.id,Nombre:nombre});
        }else{ //Si el admin ya existe almaceno el ID del Socket
          a.id=usuario.id;
        }
      break;
    }
  });

  usuario.on("emitir_valor",function emitir_valor(valor,socketId){
    var socket = sockets[socketId]; //Envio el mensaje solo al socket seleccionado
    socket.emit('emitir_valor', valor);
  });

  usuario.on("cambiar_msgsubliminar",function cambiar_msgsubliminar(msg,socketId){
    var socket = sockets[socketId]; //Envio el mensaje solo al socket seleccionado
    socket.emit("cambiar_msgsubliminar",msg);
  });

  usuario.on("recargar_pagina",function recargar_pagina(socketId){
    //servidor.sockets.emit("recargar_pagina");
    var socket = sockets[socketId]; //Envio el mensaje solo al socket seleccionado
    socket.emit("recargar_pagina");
  });

  usuario.on("borrar_terminal",function borrar_terminal(socketId){
    var socket = sockets[socketId]; //Envio el mensaje solo al socket seleccionado
    var i=_(visores).detect(function(p) {
      return p.id==socketId;
    });
    var c=_.indexOf(visores, i);
    visores.splice(c, 1);
    socket.emit("borrar_terminal");
  });
}

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/reproductor',routes_reproductor.index);
app.get('/reproductor/admin', routes_reproductor.admin);
app.get('/reproductor/collection/:nombre', routes_reproductor.getCollection);
app.get('/contador', routes_contador.index);
app.get('/contador/admin', routes_contador.admin);
app.get('/contador/collection/:nombre', routes_contador.getCollection);
app.get('/contador/websockets/visores', function(req, res){res.json(visores); 
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
