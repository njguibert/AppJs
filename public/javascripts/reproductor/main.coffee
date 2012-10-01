$ ->
  websocket =io.connect("http://192.168.0.130:4000",{ 'connect timeout': 5000 ,'reconnection delay': 500})
  conectado=true
  class TemaModel extends Backbone.Model

  class TemaCollection extends Backbone.Collection
    model: TemaModel

  class TemaView extends Backbone.View
    tagName: 'li'
    events:
      'click' : 'getTema'
    initialize: ->
      _.bindAll(this,'render','getTema','change')
      this.model.bind("change",this.change)
    render: ->
      $(this.el).html(this.model.get("Nombre"))
      return this
    getTema: ->
      reproductor.cargarMP3Click(this.model)
      $("li").removeClass("selected")
      $(this.el).addClass("selected")
    change: ->
      $("li").removeClass("selected")
      $(this.el).addClass("selected")

  class TemasView extends Backbone.View
    initialize: ->
      this.render()
      _.bindAll(this,'render')
    render: ->
      self=this
      _.each (this.collection.models), (tema) ->
        temaview= new TemaView({model:tema})
        $(self.el).append(temaview.render().el)
  
  #Coleccion con los temas de musica
  temas=new TemaCollection()
  temas.url="/reproductor/collection/temas"

  #Coleccion con los temas de propagandas
  propagandas=new TemaCollection
  propagandas.url="/reproductor/collection/propagandas"

  class Reproductor extends Backbone.View
    el: '#reproductor'
    events:
      'click #siguiente': 'siguiente'
      'click #anterior': 'anterior'
    initialize: -> #Creo el reproductor
      self=this
      this.posicion=0; #Posicion del tema sonando
      this.posicion2=0; #Posicion de la propaganda
      this.cantidadR=0;#Numero de temas sonados
      this.cambio=3;#Cada cuantos temas se reproduce una propaganda
      temas.fetch({success : self.respuesta})
      propagandas.fetch({success : self.respuesta2})
      _.bindAll(this,'cargarMP3Click','cargartema','respuesta','respuesta2')
      $("audio").on "ended", ->
        self.posicion=self.posicion+1
        self.cargartema("temas")

      websocket.on "disconnect", -> #Al surgir un problema con la conexion
        conectado=false
      websocket.on "connect", -> #Conectarse despues de un problema de conexion
        if (conectado==false)
          self.posicion=self.posicion+1
          self.cargartema("temas")        

    respuesta: ->
      self=this
      ListaTemas=new TemasView({el:"#temas",collection:temas})
    respuesta2: ->
      ListaPropagandas=new TemasView({el:"#comerciales",collection:propagandas})
      this.cantidadPropagandas=propagandas.length
    siguiente: ->
      this.cargartema("temas")
    anterior: ->
      this.posicion=this.posicion-1
      this.cargartema("temas")
    cargartema:  ->
      cambio=this.cambio+1
      if(this.cantidadR%cambio!=0)
        if(this.posicion==temas.length)
          this.posicion=0
        $('source').attr('src', "../reproductor/mp3/musica/" +temas.at(this.posicion).get("Nombre"))
        $("audio")[0].load()
        temas.at(this.posicion).trigger('change')
        $("marquee p").text(temas.at(this.posicion).get("Nombre"))
        this.posicion=this.posicion+1
      else
        if(this.posicion2==propagandas.length)
          this.posicion2=0
        $('source').attr('src', "../reproductor/mp3/comerciales/" +propagandas.at(this.posicion2).get("Nombre"))
        $("audio")[0].load()
        propagandas.at(this.posicion2).trigger('change')
        $("marquee p").text(propagandas.at(this.posicion2).get("Nombre"))
        this.posicion2=this.posicion2+1
      this.cantidadR=this.cantidadR+1
    cargarMP3Click: (m) ->
      if(temas.indexOf(m)!=-1)
        this.posicion=temas.indexOf(m)
        this.cargartema()
      else
        this.posicion=propagandas.indexOf(m)
        this.cargartema()

  reproductor = new Reproductor()