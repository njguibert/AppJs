$(function(){
	//var path="http://localhost";
	var path="http://192.168.0.16";
	var websocket = io.connect(path+":4000",{ 'connect timeout': 5000 });
	//var websocket = io.connect(path+":4000");
	var terminal;
	var conectado=true;
	if(localStorage.getItem('terminal')){
		terminal=localStorage.getItem('terminal');

	}
	else{
		terminal=prompt('Ingrese el nombre de esta terminal:','');
		localStorage.setItem('terminal',terminal);
	}
	
	websocket.emit("setTipo","visor",terminal);
	var valor_actual=parseInt($("#contador label").text());
	$("#visor").carousel();
	
	var TemaModel=Backbone.Model.extend({});

	var TemaCollection=Backbone.Collection.extend({model:TemaModel,});

	//Coleccion con los temas de videos
	var temas=new TemaCollection();
	temas.url="/contador/collection/videos";
	
	//Coleccion con los temas de fotos
	var fotos=new TemaCollection();
	fotos.url="/contador/collection/fotos";

	var Reproductor= Backbone.View.extend({
		el: "#app",
	initialize:function(){
		_.bindAll(this,'respuesta','cargarvideo','cargarfotos');
		this.posicion=0; //Posicion del video reproduciendose
		self=this;
		fotos.fetch({success : self.cargarfotos});
		temas.fetch({success : self.respuesta});
		$("video").on("ended", function() {
			//alert("paso al siguiente");
			self.posicion=self.posicion+1;
			self.cargarvideo();
		});
		$(document).bind('click', function(){
			valor_actual++;
			controlador.emitir_valor(valor_actual);
		});

		$(document).keypress(function(event){
		event.preventDefault();
		switch(event.which){
			case 49:
			    if (valor_actual>=99) valor_actual=0
				else valor_actual++;
				controlador.emitir_valor(valor_actual);
			break;
			case 50:
			  if (valor_actual<=0) valor_actual=99
			  else valor_actual--;
			  controlador.emitir_valor(valor_actual);
			break;
		}
		});		
	},
	cargarfotos:function(){ //Cargo las fotos en el visor
		fotos.each(function(f){
			$("#visor.carousel.slide .carousel-inner").append("<div class='item'><img src='/contador/fotos/" +f.get("Nombre")+ "' /></div>");
		});
	},
	respuesta:function(){
      setTimeout(function(){
        $("video")[0].play();
              },3000);		
	},
	cargarvideo:function(){
		if(this.posicion==temas.length){
				this.posicion=0;
		}
		$('video').attr('src',  "../contador/videos/" +temas.at(this.posicion).get("Nombre"));
		$("video")[0].play();
	}
	});

  var Controlador = Backbone.Router.extend({
  	  initialize:function(){
  	  	_.bindAll(this,'emitir_valor','cambiar_msgsubliminar','recargar_pagina','borrar_terminal');//,'disconnect','connect');
		websocket.on("emitir_valor",this.emitir_valor);
		websocket.on("cambiar_msgsubliminar",this.cambiar_msgsubliminar);
		websocket.on("recargar_pagina",this.recargar_pagina);
		websocket.on("borrar_terminal",this.borrar_terminal);
		websocket.on("disconnect",this.disconnect);//Se perdio la conexion
		websocket.on("connect",this.connect);//Se establecio conexion
  	  },
      routes:{
        '':'loadpage',
      },
      loadpage:function(){ //Carga de pagina
        //alert("Load Complete");
      },  	  
      emitir_valor:function(valor){
      	$("audio")[0].play();
      	if(valor=="inc") {
			    if (valor_actual>=99) valor_actual=0
				else valor_actual++;
      	}
      	if (valor=="dec"){
			  if (valor_actual<=0) valor_actual=99
			  else valor_actual--;
      	}
      	if (valor=="reset"){
			  valor_actual=0;
      	}

      	if(! $('#contenidosecundario').is(':visible') ) {
	      	$('#contenido').fadeOut('slow', function() { 		
	      		$('#contenidosecundario').fadeIn('slow', function() {


  /*$("body").animate({
  	 backgroundColor: "#FF2020",
  }, 1000 );
  $("body").animate({
  	 backgroundColor: "#3F003F",
  }, 1000 );  
    $("body").animate({
  	 backgroundColor: "white",
  }, 1000 );  
  $("#contenidosecundario label").animate({
    marginLeft: "300px",
  }, 1000 );
  $("#contenidosecundario label").animate({
    marginLeft: "-300px",
  }, 1000 ); 
  $("#contenidosecundario label").animate({
    marginLeft: "300px",
  }, 1000 ); */
				
	      			setTimeout(function(){
	      				$('#contenidosecundario').fadeOut('slow', function() {
	      					$('#contenido').fadeIn('slow', function() {
								//$("#visor").carousel('next');
								$("#visor").carousel('pause');
								//$("video")[0].play();

	      					});
	      				});
	      			},3000);
	      		});
	      	});
		}



      	$("label").text(valor_actual);
      },
      cambiar_msgsubliminar:function(mensaje){
      	$("marquee p").text(mensaje);
      },
      recargar_pagina:function(){
      	window.location.reload();
      },
      borrar_terminal:function(){
      	localStorage.removeItem('terminal');
      },
      disconnect:function(){
      	conectado=false;
      },
      connect:function(){
      	if (conectado==false) websocket.emit("setTipo","visor",terminal);
      }
  });

  var controlador=new Controlador();

  var reproductor=new Reproductor();
  Backbone.history.start();
});