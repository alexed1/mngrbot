/**
 * Defines the routes to handle events from the Facebook bot.
 * 
 * @module facebookController
 * @author Alex Edelstein
 * @version 0.1
 */

'use strict';

var express = require('express'),
    router = express.Router();

/*
 * Handles the validation request from Facebook.
 */
router.get('/', (req, res) => {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

/*
 * Handles messaging-related events from Facebook.
 */
router.post('/', (req, res) => {
    var events = req.body.entry[0].messaging;
    var event = events[0]
    console.log('FB hook is invoked.', event);

    for (var i = 0; i < events.length; i++) {
        event = events[i];
        if (event.message && event.message.text) {
            sendMessage(event.sender.id, {
                text: "Echo: " + event.message.text
            });
        };
    };
    res.sendStatus(200);
});

/**
 * Sends response to User.
 * 
 * @param recipientId
 * Id of the recipient to send message to.
 * 
 * @param message
 * Message text.
 * 
 */
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: process.env.PAGE_ACCESS_TOKEN
        },
        method: 'POST',
        json: {
            recipient: {
                id: recipientId
            },
            message: message,
        },
        function (error, response, body) {
            if (error) {
                console.error('Error sending message: ', error);
            } else if (response.body.error) {
                console.error('Error: ', response.body.error);
            }
        }
    });
};

module.exports = router;