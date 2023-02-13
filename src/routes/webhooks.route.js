const express = require('express');
const router = express.Router();
const webhooksController = require('../controllers/webhooks.controller');

// Strava
router.get('/strava', webhooksController.stravaWebhookVerificationWebhook);
router.post('/strava', webhooksController.stravaEventWebhook);

module.exports = router;
