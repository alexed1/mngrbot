/**
 * Defines the routes to handle OAuth requests
 *
 * @module oauthController
 * @author Alex Edelstein
 * @version 0.1
 */

'use strict';

const express = require('express'),
    router = express.Router(),
    slackClientId = process.env.SLACK_CLIENT_ID,
    slackClientSecret = process.env.SLACK_CLIENT_SECRET;

// Handles clicking on the buttons within a Slack message.
router.get('/', (req, res) => {
    let pmBot = req.app.get('pmBot'),
        code = req.query.code; // auth code
    if (!code) {
        res.status(400).send('Authorization failed');
        return;
    };
    var params = {};
    params['client_id'] = slackClientId;
    params['client_secret'] = slackClientSecret;
    params['code'] = code;

    pmBot.api('oauth.access', params)
        .then(
            function (body) {
                var accessToken = body["access_token"];
                var botAccessToken = body.bot["bot_access_token"];
                var userId = body["user_id"];
                var teamId = body["team_id"];
                console.log('Token: ' + botAccessToken);
                res.status(200).send('Authorization succeeded!');
                return;
            },
            function (status) {
                console.log('Error has occurred:' + status.error);
                res.status(400).send('Authorization failed: ' + status.error);
            }   );
});

module.exports = router;