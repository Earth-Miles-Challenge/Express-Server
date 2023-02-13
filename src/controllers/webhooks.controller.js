const { getEnvVariable } = require('../utils/env.utils');
const { getActivityFromStrava, createActivityFromStravaActivity } = require('../services/strava.service');
const { getUserByPlatformId } = require('../services/users.service');
const { deleteActivity, updateActivity } = require('../services/activities.service');

function stravaWebhookVerificationWebhook(req, res) {
	if (req.query['hub.challenge'] && req.query['hub.verify_token'] === getEnvVariable('STRAVA_WEBHOOK_VERIFICATION_TOKEN')) {
		res.send({'hub.challenge': req.query['hub.challenge']});
	} else {
		res.status(400).send();
	}
}

async function stravaEventWebhook(req, res, next) {
	console.log(req.body);
	switch (req.body.object_type) {
		case 'activity':
			switch (req.body.aspect_type) {
				case 'update':
					try {
						let updates = {};
						if (req.body.updates['title']) {
							updates.description = req.body.updates['title'];
						}

						if (req.body.updates['type']) {
							updates.activity_type = req.body.updates['type'];
						}

						if (Object.keys(updates).length) {
							await updateActivity(req.body.object_id, updates, true);
							res.send('Activity updated');
						} else {
							res.send('Activity unchanged');
						}
					} catch (err) {
						next(err);
					}
					break;

				case 'create':
					try {
						const user = await getUserByPlatformId('strava', req.body.owner_id);

						if (!user) res.send('Unknown user');

						const stravaActivity = await getActivityFromStrava(req.body.object_id, user.id);
						const activity = await createActivityFromStravaActivity(user.id, stravaActivity);

						if (!activity) res.send('Failed to create activity');

						res.send('Created activity');
					} catch (err) {
						next(err);
					}
					break;

				case 'delete':
					try {
						const deleted = await deleteActivity(req.body.object_id, true);
						res.send(deleted ? 'Activity deleted' : 'Activity not deleted');
					} catch (err) {
						next(err);
					}
					break;
			}
			break;

		case 'athlete':
			switch (req.body.aspect_type) {
				case 'update':
					break;
				case 'create':
					break;
				case 'delete':
					break;
			}
			break;
	}
}

module.exports = {
	stravaWebhookVerificationWebhook,
	stravaEventWebhook
}