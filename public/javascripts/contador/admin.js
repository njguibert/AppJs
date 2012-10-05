$(function(){
  //var path="http://localhost";
  var path="http://192.168.0.16";
  var websocket = io.connect(path+":4000",{ 'connect timeout': 5000 });
  websocket.emit("setTipo","admin","Equipo de Jesus");
  var conectado=true;
  var SocketModel=Backbone.Model.extend({});

  var SocketCollection=Backbone.Collection.extend({model:SocketModel,});

  var visor_actual=new SocketModel();

  var VisorView=Backbone.View.extend({
    tagName: 'li',
    events:{
      'click a': 'setVisorActual',
    },
    initialize:function(){
      _.bindAll(this,'render','unrender','remove','setVisorActual');
      this.model.bind('destroy',this.unrender);
    },
    remove:function(){
      //this.model.destroy();
    },
    unrender:function(){
      $(this.el).remove();
    },
    render:function(){
      $(this.el).html("<a href='#'>" + this.model.get("Nombre")+ "</a>");
      return this;
    },
    setVisorActual:function(){
      $("li").removeClass("active");
      $(this.el).addClass("active");
      visor_actual=this.model;
    }
  });

  //Coleccion con los sockets visores del servidor
  var visores =new SocketCollection();
  visores.url="/contador/websockets/visores";

  var AppView= Backbone.View.extend({
    el: "#app",
    events: {
      "keydown #accion": "ejecutar_accion"
    },
    initialize:function(){
      _.bindAll(this,'loadvisores','renderOneVisor');
      contador=0;
      self=this;
      visores.fetch({success : self.loadvisores});
      websocket.on("nuevo_visor",function(id,nombre){  //AL notificar un nuevo visor, lo agrego a la vista
        var nuevovisor=new SocketModel({id:id,Nombre:nombre});
        self.renderOneVisor(nuevovisor);
        visores.add(nuevovisor);
      });
      websocket.on("editar_visor",function(id,nombre){  //AL notificar editar un visor, actualizo la vista
        _(visores.models).detect(function(p) {
          if (p.get("Nombre") == nombre){
            p.set({id:id});
          }
        });

      });
      websocket.on("disconnect",function(){ //Al surgir un problema con la conexion
        conectado=false;
      });
      websocket.on("connect",function(){ //Conectarse despues de un problema de conexion
        if (conectado==false) 
          {
            visor_actual=new SocketModel();
            websocket.emit("setTipo","admin","Equipo de Jesus");
            visores.fetch({success : self.loadvisores});
          }
      });   

    },
    loadvisores:function(){ //Callback de la coleccion visores
      $('#visores',this.el).html("");
      self=this;
      _(visores.models).each(function (p){
        self.renderOneVisor(p);
      },this);
    },
    renderOneVisor:function(p){
      var visorvista=new VisorView({model:p});
      $('#visores',this.el).append(visorvista.render().el);
    },
    ejecutar_accion:function(e){
      if(typeof(visor_actual.get("id")) == "undefined"){
        alert("Visor NO SELECCIONADO.");
      }else{
      switch(e.keyCode){
        case 49: //Incremento
          websocket.emit("emitir_valor","inc",visor_actual.get("id"));
          //$("#notificador label").text(contador);
        break;
        case 50: //Decremento       
          websocket.emit("emitir_valor","dec",visor_actual.get("id"));
          //$("#notificador label").text(contador);
        break;
        case 51: //Reseteo
          websocket.emit("emitir_valor","reset",visor_actual.get("id"));
          //$("#notificador label").text(contador);
        break;      
        case 52: //Cambiar Mensaje Subliminar
          websocket.emit("cambiar_msgsubliminar",prompt('Ingrese el mensaje subliminar:',''),visor_actual.get("id"));
        break;
        case 53: //Recargar Pagina
          websocket.emit("recargar_pagina",visor_actual.get("id"));
        break;
        case 54: //Resetear Terminal
          websocket.emit("borrar_terminal",visor_actual.get("id"));
          visor_actual.destroy();
          //alert("destroy");
        break;        
    }
    }
    $("#accion").val("");
  }
  });

  var Aplicacion=new AppView();
});
