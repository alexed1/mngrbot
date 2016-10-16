var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

'use strict';

var Pmbot = require('./lib/pmbot');

var token = process.env.BOT_API_KEY;
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;
var initChannel = process.env.INIT_CHANNEL;

var Pmbot = new Pmbot({
  token: token,
  dbPath: dbPath,
  name: name,
  initChannel: initChannel
});

Pmbot.run();
