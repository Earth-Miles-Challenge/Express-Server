const { logger } = require('../services/logger.service');
const {
	getActivity,
	getActivities
} = require('../services/activities.service');

/**
 * Get current user Strava activities.
 */
async function get(req, res, next) {
	try {
		const activities = await getActivities(req.user.id, req.query);
		res.json(activities);
	} catch (err) {
		// err.status = getErrorStatus(err);
		logger.debug(`Error when fetching activities`, err.message);
		next(err);
	}
}

module.exports = {
	get
};
