import express from 'express';
import webhooksController from '../controllers/webhooks.controller';

const router = express.Router();

// Strava
router.get('/strava', webhooksController.stravaWebhookVerificationWebhook);
router.post('/strava', webhooksController.stravaEventWebhook);

export default router;
