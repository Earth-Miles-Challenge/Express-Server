const { getEnvVariable } = require('../utils/env.utils');
const { getActivityFromStrava, createActivityFromStravaActivity, deleteStravaConnection } = require('../services/strava.service');
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

						if (Object.keys(updates).length === 0) {
							res.send('Activity unchanged');
							return;
						}

						await updateActivity(req.body.object_id, updates, true);

						res.send('Activity updated');
					} catch (err) {
						next(err);
					}
					break;

				case 'create':
					try {
						const user = await getUserByPlatformId('strava', req.body.owner_id);

						if (!user) {
							res.send('Unknown user');
							return;
						}

						const stravaActivity = await getActivityFromStrava(req.body.object_id, user.id);
						const activity = await createActivityFromStravaActivity(user.id, stravaActivity);

						if (!activity) {
							res.send('Failed to create activity');
							return;
						}

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
			if (req.body.aspect_type === 'update' && req.body.updates['authorized'] && req.body.updates['authorized'] === 'false') {
				try {
					await deleteStravaConnection(req.body.owner_id, true);
					res.send('User Strava connection details removed')
				} catch (err) {
					next(err);
				}
			}
			break;
	}
}

module.exports = {
	stravaWebhookVerificationWebhook,
	stravaEventWebhook
}