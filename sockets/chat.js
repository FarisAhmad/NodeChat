module.exports = function(io) {
  var crypto = require('crypto'),
    sockets = io.sockets,
    redis = require('redis').createClient(),
    onlines = {};
  sockets.on('connection', function(client) {
    var session = client.handshake.session,
      usuario = session.usuario;

    redis.sadd('onlines', usuario.email, function(erro) {
      redis.smembers('onlines', function(erro, emails) {
        emails.forEach(function(email) {
          client.emit('notify-onlines', email);
          client.broadcast.emit('notify-onlines', email);
        });
      });
    });

    client.on('join', function(sala) {
      if (!sala) {
        var timestamp = new Date().toString(),
          md5 = crypto.createHash('md5');
        sala = md5.update(timestamp).digest('hex');
      }
      session.sala = sala;
      client.join(sala);

      var msg = '<b>-> ' + usuario.nome + '</b> entrou na sala.<br>';

      //redis.lpush(sala, msg, function(erro, res) {
      redis.lrange(sala, 0, -1, function(erro, msgs) {
        msgs.forEach(function(msg) {
          client.emit('send-client', msg);
        });
        redis.rpush(sala, msg); //n entendi
        sockets.in(sala).emit('send-client', msg);
      });
      //});
    });

    client.on('send-server', function(msg) {
      var sala = session.sala,
        data = { email: usuario.email, sala: sala };
      msg = '<b>' + usuario.nome + ':</b> ' + msg + '<br>';
      redis.rpush(sala, msg);
      client.broadcast.emit('new-message', data);
      sockets.in(sala).emit('send-client', msg);
    });

    client.on('disconnect', function() {
      var sala = session.sala,
        msg = '<b>-> ' + usuario.nome + '</b> saiu da sala.<br>';
      redis.rpush(sala, msg);
      //redis.lpush(sala, msg);
      client.broadcast.emit('notify-offlines', usuario.email);
      sockets.in(sala).emit('send-client', msg);
      redis.srem('onlines', usuario.email);
      client.leave(sala);
    });
  });
};
