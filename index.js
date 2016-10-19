/**
 * Entry point to the app.
 *
 * @author Alex Edelstein
 * @version 0.1
 */

'use strict';

var bodyParser = require("body-parser"),
    express = require('express'),
    app = express();

//==================================================
//SECTION basic http support

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Reference the Facebook controller 
app.use('/webhook', require('./controllers/facebookController'));

// Reference the Slack controller
app.use('/button', require('./controllers/slackController'));

// Referenc the content file controller
app.use('/', require('./controllers/contentController'));

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

/*
 * Run the RTM bot for Slack
 */
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

Pmbot.run()