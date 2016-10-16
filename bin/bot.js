//# bin/bot.js
'use strict';

var Pmbot = require('../lib/pmbot');

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
