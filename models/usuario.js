module.exports = function(app) {
	var mongoose = require('mongoose');
	var contato = mongoose.Schema({
		nome: String
		, email: String
	});
	var usuario = mongoose.Schema({
		nome: {type: String, required: true}
		, email: {type: String, required: true
			, index: {unique: true}}
			, contatos: [contato]
		});
	return mongoose.model('usuarios', usuario);
};