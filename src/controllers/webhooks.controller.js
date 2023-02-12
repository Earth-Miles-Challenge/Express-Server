import { getEnvVariable } from '../utils/env.utils';

async function stravaWebhook(req, res, next) {
	if (req.query.hub.challenge && req.query.hub.verify_token === getEnvVariable('strava_webhook_verification_token')) {
		res.send({'hub.challenge': req.query.hub.challenge});
	}
}

module.exports = {
	stravaWebhook
}