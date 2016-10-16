//# lib/Pmbot.js

'use strict';
var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');


var Pmbot = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'pmbot';
  this.settings.initChannel = this.settings.initChannel || 'pmbots';
  this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'norrisbot.db');

  this.user = null;
  this.db = null;

};

util.inherits(Pmbot, Bot);

module.exports = Pmbot

Pmbot.prototype.run = function () {
  Pmbot.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);

};

Pmbot.prototype._onStart = function() {

  this._loadBotUser();
  this._connectDb();
  this._firstRunCheck();
  this._welcomeMessage();
};

//Check if the event represents a chat message
//Check if the message has been sent to a channel
//Check if the message come from a user that is different from the NorrisBot (to avoid loops)
//Check if the message mentions Chuck Norris

Pmbot.prototype._onMessage = function (message){
  console.log('New message received ' + JSON.stringify(message));
  if (this._isChatMessage(message) &&
      //this._isChannelConversation(message) &&   enable direct convo too
      !this._isFromPmbot(message) &&
      this._relatedToSoftware(message)
    ) {
      this._replyWithRandomJoke(message);
    }
};


// filter through users list to find matching one
Pmbot.prototype._loadBotUser = function () {
  var self = this;
  this.user = this.users.filter(function (user) {
    return user.name === self.name;
  })[0];

//conncet to the the sqlite db
Pmbot.prototype._connectDb = function () {
  if (!fs.existsSync(this.dbPath)) {
    console.error('Database path ' + '"' + this.dbPath + '" does not exist or is not readable');
    process.exit(1);
  }

  this.db = new SQLite.Database(this.dbPath);
};

//see if it's the first run, and if so provide a welcome message
Pmbot.prototype._firstRunCheck = function () {
  var self = this;
  self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function(err, record) {
    if (err) {
      return console.error('DATABASE ERROR:', err)
    }
    var currentTime = (new Date()).toJSON();

    //this is a first run
    if (!record) {
      self._welcomeMessage();
      return self.db .run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
    }

    //updates with new last running time
    self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
  } );
};

Pmbot.prototype._welcomeMessage = function() {

  this.postMessageToChannel(this.channels[0].name, "Hi, I'm PMbot, capable of providing automated product manager services 24/7. " +
          "\n I can do the following: " +
          "\n provide a morale `boost` ," +
          "\n `decide` an issue (make sure you provide two features to decide between, such as `decide whether to add threaded messages or video calling`)," +
          "\n or carry out a `gcr` (gratuitous code review). (make sure you paste a piece of code)",
          {as_user: true});
};



Pmbot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text);
};

//kludgy way to detect that we're dealing with a chat channel
Pmbot.prototype._isChannelConversation = function (message) {

    return typeof message.channel === 'string' &&
    message.channel[0] === 'C';
};

//avoid infinite loops by filtering out messages generated by us
Pmbot.prototype._isFromPmbot = function (message) {
  return message.user === this.user.id;
};

Pmbot.prototype._relatedToSoftware = function (message) {
  var result = /^(boost|decide|gcr)(\s)*/i.test(message.text);
  return result;
};

Pmbot.prototype._getFirstWord = function (str) {
        if (str.indexOf(' ') === -1)
            return str;
        else
            return str.substr(0, str.indexOf(' '));
    };

Pmbot.prototype._replyWithRandomJoke = function (originalMessage) {
  var self = this;
  var firstWord = this._getFirstWord(originalMessage.text).toLowerCase();
  self.db.get("SELECT id, joke FROM jokes WHERE type = '" + firstWord + "' ORDER BY used ASC, RANDOM() LIMIT 1", function (err, record) {
    if (err) {
      return console.error('DATABASE ERROR: ', err);
    }

    var channel = self._getChannelById(originalMessage.channel);
    self.postMessageToChannel(channel.name, record.joke, {as_user: true});
    self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
  });
};

Pmbot.prototype._getChannelById = function (channelId) {
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};
}