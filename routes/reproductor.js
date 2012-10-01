
/*
 * GET home page.
 */
var fs = require('fs');
exports.index = function(req, res){
  res.render('./reproductor/index', { title: 'Express' });
};

exports.admin = function(req, res){
  res.render('./reproductor/admin', { title: 'Express' })
};
exports.getCollection = function(req, res){
	console.log("Retorno la coleccion:"+req.params.nombre);

	if(req.params.nombre=="temas"){
		var lista_temas=fs.readdirSync('./public/reproductor/mp3/musica');
		res.json(parsearDIRECTORIO(lista_temas));
	}else{
		var lista_temas=fs.readdirSync('./public/reproductor/mp3/comerciales');
		res.json(parsearDIRECTORIO(lista_temas));		
	}
};
function parsearDIRECTORIO(array){
	json=[];
	for (tema in array){
		//console.log("Tema:"+ array[tema]);
		json.push({Nombre:array[tema]});
	}
	return json;

}