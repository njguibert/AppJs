
/*
 * GET home page.
 */

var fs = require('fs');
exports.index = function(req, res){
  res.render('./contador/index', { title: 'Express' });
};
exports.admin = function(req, res){
  res.render('./contador/admin',{ title: 'Consola de Administracion' });
};

exports.getCollection = function(req, res){
	console.log("Retorno la coleccion:"+req.params.nombre);
	switch(req.params.nombre){
		case 'videos':
			var lista_temas=fs.readdirSync('./public/contador/videos');
			res.json(parsearDIRECTORIO(lista_temas));
		break;
		case 'fotos':
			var lista_temas=fs.readdirSync('./public/contador/fotos');
			res.json(parsearDIRECTORIO(lista_temas));
		break;		
	}
};
function parsearDIRECTORIO(array){
	json=[];
	for (tema in array){
		console.log("Tema:"+ array[tema]);
		json.push({Nombre:array[tema]});
	}
	return json;

}