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
    console.log (req.body.payload);
    res.status(200).send('Done');   
});

module.exports = router;