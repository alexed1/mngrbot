'use strict';

var bodyParser = require("body-parser");
var express = require('express');
var request = require('request');
var Pmbot = require('./lib/pmbot');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var token = process.env.BOT_API_KEY;
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;
var initChannel = process.env.INIT_CHANNEL;
var slackClientId = process.env.SLACK_CLIENT_ID;
var slackClientSecret = process.env.SLACK_CLIENT_SECRET;

var Pmbot = new Pmbot({
  token: token,
  dbPath: dbPath,
  name: name,
  initChannel: initChannel
});

Pmbot.run();

// 
// ExpressJS routes
//
app.get('/', function(request, response) {
  response.render('pages/index');
});

// This route is called by Slack after the OAuth authorization is successfully completed  
// Here we acquire the OAuth token and save it somewhere
app.get('/authorized', function(request, response) {
  var code = request.query.code; // auth code
  if (!code) 
  {
    response.status(400).send('Authorization failed');
    return;
  }
  var params = {};
  params['client_id'] = slackClientId;
  params['client_secret'] = slackClientSecret;
  params['code'] = code;
  
  Pmbot.api('oauth.access', params)
  .then(
    function(body) {
      var accessToken = body["access_token"];
      var botAccessToken = body.bot["bot_access_token"];
      var userId = body["user_id"];
      var teamId = body["team_id"];
        Pmbot.saveOAuthToken(botAccessToken, teamId);
        response.status(200).send('Authorization succeeded!');
    },
    function(status){
      console.log('Error has occurred:' + status.error);
      response.status(400).send('Authorization failed: '  + status.error);
    });
});

// Handler for message button clicks 
app.post('/button', function(request, response) {
  var payloadStr = request.body.payload;
  if (payloadStr == null)
  {
      console.error("/button: No payload is found in the request body.");
      res.status(400).send();
      return;
  }
  var payload = JSON.parse(payloadStr),
      channel = payload.channel.name;
  
  if (!payload.actions || payload.actions.constructor !== Array || payload.actions.length === 0)
  {
      console.error("/button: The payload did not contain any actions.");
      res.status(400).send();
      return;  
  }
  var buttonClicked = payload.actions[0].value,
      msg = 'You clicked ' + buttonClicked,
      msgResponse = {};
      msgResponse.text = msg;

  response.status(200).send(msgResponse);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});