'use strict';

var bodyParser = require("body-parser");
var express = require('express');
var request = require('request');
var app = express();

//==================================================
//SECTION basic http support
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//============================================================
//SECTION Slack integration

// Handler for Slack button click
app.post('/button', function(req, res) {
  res.status(200).send('Done');
});

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

//=========================================================
//SECTION FB MEssenger integration


app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'testbot_verify_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid verify token');
  }
});

app.post('/webhook', function (req, res) {
  var events = req.body.entry[0].messaging;
  var i = 0;
  for (i = 0; i < events.length; i++) {
    var event = events[i];
    if (event.message && event.message.text) {
      sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
    }
    res.sendStatus(200);
  }
});

function sendMessage(recipientId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      message: message,
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
      }
    });
};
