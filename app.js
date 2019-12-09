require('dotenv/config');

const express = require('express');
const load = require('express-load');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const error = require('./middlewares/error');

const KEY = process.env.KEY;
const SECRET = process.env.SECRET;
const MONGO_DB = process.env.MONGO_DB;
const PORT = process.env.PORT;
const HOSTNAME = process.env.HOSTNAME;

const app = express();
const cookie = cookieParser(SECRET);
const store = new expressSession.MemoryStore();

const server = require('http').Server(app);
const io = require('socket.io')(server);

mongoose.connect(MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true });

global.db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookie);
app.use(
  expressSession({
    secret: SECRET,
    name: KEY,
    resave: true,
    saveUninitialized: true,
    store: store,
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

io.use(function(socket, next) {
  let data = socket.request;

  cookie(data, {}, function(err) {
    let sessionID = data.signedCookies[KEY];

    store.get(sessionID, function(err, session) {
      if (err || !session) {
        return next(new Error('Denied access'));
      } else {
        socket.handshake.session = session;
        return next();
      }
    });
  });
});

load('models')
  .then('controllers')
  .then('routes')
  .into(app);

load('sockets').into(io);

app.use(error.notFound);
app.use(error.serverError);

server.listen(PORT, HOSTNAME, function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log(`[${HOSTNAME}] Ntalk listening to port: ${PORT}`);
  }
});
