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
    res.status(200).send(req.body.payload.actions[0].value);   
});

module.exports = router;