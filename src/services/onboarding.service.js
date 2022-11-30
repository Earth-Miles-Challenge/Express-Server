const { logger } = require('../utils/logger.utils');
const { getUser } = require('./users.service');
const {
	getAthleteActivities,
	createActivityFromStravaActivity } = require('./strava.service');

/**
 * Onboard a new Strava user, processing all their activities for the past 3 months.
 * @param {object} user User object.
 */
const onboardStravaUser = async (user) => {
	const perPage = 30;
	const startTime = (() => {
		const date = new Date();
		date.setMonth(date.getMonth() - 3);
		return Math.round(date / 1000);
	})();

	/**
	 * Process a batch of Strava activities, and set up next batch if more remain.
	 * @param {int} fromTime Timestamp from when to fetch Strava activities.
	 * @param {int} activitiesProcessed Number of activities processed so far.
	 * @param {array} activities Collection of activities created so far.
	 * @return {object}
	 */
	const processActivities = async (fromTime, activitiesProcessed = 0, activities = []) => {
		logger.info(`Processing Strava activities starting from ${fromTime}`);

		const stravaActivities = await getAthleteActivities(user.id, fromTime, perPage);
		const batchActivities = await Promise.all(stravaActivities.map((activity) => {
			return createActivityFromStravaActivity(user.id, activity);
		}));

		const allActivities = [...activities, ...batchActivities];
		const allActivitiesProcessed = activitiesProcessed + stravaActivities.length;

		logger.info(`Processed ${allActivitiesProcessed} Strava activities (${stravaActivities.length} this batch)`);

		// Last batch, less than 30 activities returned.
		if (stravaActivities.length < perPage) {
			return {
				activitiesProcessed: allActivitiesProcessed,
				activities: allActivities.filter(activity => activity !== null)
			};
		}

		// Process next batch of activities, starting with time of most recently processed activity.
		return processActivities(
			Math.round((new Date(stravaActivities[perPage-1].start_date).getTime() / 1000)),
			allActivitiesProcessed,
			allActivities
		);
	}

	try {
		const { activitiesProcessed, activities } = await processActivities(startTime);
		return {
			user,
			activities,
			activitiesProcessed
		};
	} catch (error) {
		logger.debug(error);
		return null;
	}


	// Get activities from the past 3 months

	// Add all activities to database

	// For each commute activity, calculate the distance of the
	// alternative route via car and calculate emissions avoided
	// based on this distance. Store in separate table.

	/** @todo Later on, also save user clubs */
}

const onboardUser = async (userId) => {
	const user = await getUser(userId);
	if ('strava' === user.activity_platform) return onboardStravaUser(user);
}


module.exports = {
	onboardStravaUser,
	onboardUser
}