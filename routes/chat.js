module.exports = function(app) {
	var autenticar = require('./../middlewares/autentificador')
	, chat = app.controllers.chat;
	app.get('/chat', autenticar, chat.index);
};