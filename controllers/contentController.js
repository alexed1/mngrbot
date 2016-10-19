/**
 * Defines the content routes.
 *
 * @module slackController
 * @author Alex Edelstein
 * @version 0.1
 */

'use strict';

var express = require('express'),
    router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/index');
});

module.exports = router;