const { logger } = require('../utils/logger.utils');
const {
	getActivity,
	getActivities,
	getMostRecentActivity,
	updateActivity
} = require('../services/activities.service');

const stravaService = require('../services/strava.service');

/**
 * Get current user Strava activities.
 */
async function get(req, res, next) {
	try {
		const activities = await getActivities(req.user.id, req.query);
		res.json(activities);
	} catch (err) {
		logger.debug(`Error when getting activities`, err.message);
		next(err);
	}
}

async function getOne(req, res, next) {
	res.json(req.activity);
}

async function fetchLatest(req, res, next) {
	try {
		const mostRecent = await getMostRecentActivity(req.user.id);
		const fromTime = mostRecent ? (new Date(mostRecent.start_date).getTime() / 1000) + 1 : 0;
	 	const stravaActivities = await stravaService.getAthleteActivities(req.user.id, fromTime);

		const activities = await Promise.all(stravaActivities.map((activity) => {
			return stravaService.createActivityFromStravaActivity(req.user.id, activity);
		}));

		res.json(activities);
	} catch (err) {
		// err.status = getErrorStatus(err);
		logger.debug(`Error when fetching latest activities`, err.message);
		next(err);
	}
}

async function update(req, res, next) {
	try {
		const { activityId } = req.params;
		const activity = await updateActivity(activityId, req.body);

		res.json(activity);
	} catch (err) {
		logger.debug(`Error when updating an activity`, err.message);
		next(err);
	}
}

async function activityExists(req, res, next) {
	const activityId = parseInt(req.params.activityId);
	const activity = await getActivity(activityId);

	if (activity) {
		req.activity = activity;
		next();
	} else {
		const err = new Error('Activity does not exist.');
		err.name = 'invalidActivity';
		err.status = 404;
		next(err);
	}
}

module.exports = {
	get,
	getOne,
	fetchLatest,
	update,
	activityExists
};
