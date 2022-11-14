const { logger } = require('../services/logger.service');
const {
	getActivity,
	getActivities
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
		// err.status = getErrorStatus(err);
		logger.debug(`Error when getting activities`, err.message);
		next(err);
	}
}

async function getOne(req, res, next) {
	res.json(req.activity);
}

async function fetchLatest(req, res, next) {
	try {
		const mostRecent = await getActivities(req.user.id, {number: 1})
	 	const stravaActivities = await stravaService.getAthleteActivities(req.user.id, mostRecent.start_date);
		const activities = stravaActivities.map(async (activity) => {
			return await stravaService.createActivityFromStravaActivity(activity, req.user.id);
		});
		return activities;
	} catch (err) {
		// err.status = getErrorStatus(err);
		logger.debug(`Error when fetching latest activities`, err.message);
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
	activityExists
};
