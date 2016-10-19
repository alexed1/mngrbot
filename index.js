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
var botPageId = process.env.BOT_PAGE_ID || '1783203511961256';

var Pmbot = new Pmbot({
  token: token,
  dbPath: dbPath,
  name: name,
  initChannel: initChannel
});

Pmbot.run();

//=========================================================
//SECTION FB Messenger integration


app.get('/webhook', function (req, res) {
    console.log('FB hook is invoked.');
  if (req.query['hub.verify_token'] === 'testbot_verify_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid verify token');
  }
});

  app.post('/webhook', function (req, res) {
  console.log('FB hook is invoked.');
  var events = req.body.entry[0].messaging;
  if (events[0].sender.id == process.env.BOT_PAGE_ID)
  {
    return; //this is a bot-submitted message
  }
  sendMessage(events[0].sender.id, {text: "post received"});

  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    console.log(event);
    if (event.message && event.message.text) {
      if (!kittenMessage(event.sender.id, event.message.text)) {
        sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
      };

    };
  };
  res.sendStatus(200);
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
            console.error('Error sending message: ', error);
        } else if (response.body.error) {
            console.error('Error: ', response.body.error);
        }
      }
    });
  };

  function kittenMessage(recipientId, text) {
    text = text || "";
    var values  = text.split(' ');

    if (values.length === 3 && values[0] === 'kitten') {
      if (Number(values[1]) > 0 && Number(values[2]) > 0) {
        var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);

        var message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };

        sendMessage(recipientId, message);
        return true;
      }
    }
      return false;
  };
