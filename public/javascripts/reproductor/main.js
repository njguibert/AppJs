$(function(){

	var TemaModel=Backbone.Model.extend({});

	var TemaCollection=Backbone.Collection.extend({
		model:TemaModel,
	});

	var TemaView=Backbone.View.extend({
		tagName: 'li',
		events:{
		      'click' : 'getTema',
		    },
		initialize:function(){
			_.bindAll(this,'render','getTema','actual');
		 },
		render:function(){
		      $(this.el).html(this.model.get("Nombre"));
		      return this;
		    },
		getTema:function(){
			reproductor.cargarMP3Click(this.model,$(this.el).closest("div").attr("id"));
			$("li").removeClass("selected");
			$(this.el).addClass("selected");
		 },
		 actual:function(){
		 	$("li").removeClass("selected");
			$(this.el).addClass("selected");
		 }
	});

	var TemasView=Backbone.View.extend({
		initialize:function(){
			this.render();
			_.bindAll(this,'render');
		},
		render:function(){
			self=this;
			_.each(this.collection.models, function(tema){
				temaview=new TemaView({model:tema});
				$(self.el).append(temaview.render().el);
			});
		}	
	});

	//Coleccion con los temas de musica
	var temas=new TemaCollection();
	temas.url="/collection/temas";

	//Coleccion con los temas de propagandas
	var propagandas=new TemaCollection();
	propagandas.url="/collection/propagandas";

	var Reproductor= Backbone.View.extend({
		el: "#reproductor",
	    events: {
	      "click #siguiente": "siguiente",
	      "click #anterior": "anterior"
	    },		
		initialize:function(){ //Creo el reproductor
			selfthis=this;
			this.posicion=0; //Posicion del tema sonando
			this.posicion2=0; //Posicion de la propaganda
			this.cantidadR=0;//Numero de temas sonados
			this.cambio=3;//Cada cuantos temas se reproduce una propaganda
			temas.fetch({success : selfthis.respuesta});
			propagandas.fetch({success : selfthis.respuesta2});
			this.error=false;
			_.bindAll(this,'cargarMP3Click','cargartema','respuesta','respuesta2','esperar');
			$("audio").on("ended", function() {  //Cuando termine un tema para al siguiente
			     if(selfthis.error==true){
			     	selfthis.esperar();
			     }
			     else{
			     selfthis.posicion=selfthis.posicion+1;
			     selfthis.cargartema("temas");
			     }
			});
			$("audio").on("stalled", function() {  //Cuando termine un tema para al siguiente
			     //alert("se puede reproducir");
			     //alert("Ocurrio un error");
			     selfthis.error=true;
			     //selfthis.posicion=selfthis.posicion+1;
			     //selfthis.cargartema("temas");

			});
		},
		esperar:function(){
			//alert("espero");
			selfthis=this;
			     setTimeout(function(){
			     	alert("Error de conexion, reintento en 3 segundos...");
			     	$.get().error(function() { selfthis.esperar(); }).success(function() { 
				    	selfthis.error=false; 	
				     	selfthis.posicion=selfthis.posicion+1;
			     		selfthis.cargartema("temas");				     		
			     	});

			     	//selfthis.cargartema("temas");
			     	//selfthis.posicion=selfthis.posicion+1;
			     	//selfthis.cargartema("temas");			     	
			     	//$("audio")[0].load();
			     },5000)			
		},
		respuesta:function(){
			selff=this;
			ListaTemas=new TemasView({el:"#temas",collection:temas});
		},
		respuesta2:function(){
			ListaPropagandas=new TemasView({el:"#comerciales",collection:propagandas});
			this.cantidadPropagandas=propagandas.length;
		},
		render:function(){

		},
		siguiente:function(){
		this.cargartema("temas");
		},
		anterior:function(){
		this.posicion=this.posicion-1;
		this.cargartema("temas");
		},
		cargartema:function(tipo){
		var cambio=this.cambio+1;
		if(this.cantidadR%cambio!=0){
			if(this.posicion==temas.length-1){
				this.posicion=0;
			}
			$('source').attr('src', "../mp3/musica/" +temas.at(this.posicion).get("Nombre"));
			$("audio")[0].load();

			this.posicion=this.posicion+1;
			this.cantidadR=this.cantidadR+1;			
		}else{
			if(this.posicion2==propagandas.length-1){
				this.posicion2=0;
			}
			$('source').attr('src', "../mp3/comerciales/" +propagandas.at(this.posicion2).get("Nombre"));
			$("audio")[0].load();			
			this.posicion2=this.posicion2+1;
			this.cantidadR=this.cantidadR+1;			
		}
		},
		cargarMP3Click:function(m,tipo){
			if(tipo=="temas"){
				this.posicion=temas.indexOf(m);
				this.cargartema(tipo);
			}
			else{
				this.posicion=propagandas.indexOf(m);
				this.cargartema(tipo);				
			}
		}
	})
	var reproductor=new Reproductor();

});
