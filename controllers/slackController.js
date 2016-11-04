/**
 * Defines the routes to handle events from the Slack bot.
 *
 * @module slackController
 * @author Alex Edelstein
 * @version 0.1
 */

'use strict';

const express = require('express'),
    router = express.Router(),
    empty_line = "   ";


// Handles clicking on the buttons within a Slack message.
router.post('/', (req, res) => {
    let pmBot = req.app.get('pmBot'),
    payload = JSON.parse(req.body.payload);
    pmBot.emit('buttonClicked', payload);
    res.status(200).send(empty_line);
});

module.exports = router;
