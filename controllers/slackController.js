/**
 * Defines the routes to handle events from the Slack bot.
 *
 * @module slackController
 * @author Alex Edelstein
 * @version 0.1
 */

'use strict';

var express = require('express'),
    router = express.Router();

// Handles clicking on the buttons within a Slack message.
router.post('/', (req, res) => {
    let pmBot = req.app.get('pmBot')
    var payload = JSON.parse(req.body.payload);
    pmBot.emit('buttonClicked', payload);
    res.status(200).send("   ");
});

module.exports = router;
