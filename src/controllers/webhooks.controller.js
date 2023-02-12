const { getEnvVariable } = require('../utils/env.utils');

async function stravaWebhook(req, res, next) {
	// Verify webhook subscription
	if (req.query['hub.challenge']) {
		if (req.query['hub.verify_token'] === getEnvVariable('STRAVA_WEBHOOK_VERIFICATION_TOKEN')) {
			res.send({'hub.challenge': req.query['hub.challenge']});
		} else {
			res.send('incorrect verification token')
		}
	}

	

}

module.exports = {
	stravaWebhook
}