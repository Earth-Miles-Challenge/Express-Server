const db = require('./database.service');
const { logger } = require('./logger.service');

const getActivity = async (activityId) => {
	const result = await db.query(`
		SELECT
			id,
			user_id,
			activity_platform,
			activity_platform_activity_id,
			activity_type,
			description,
			start_date,
			timezone,
			distance,
			commute,
			start_latlng,
			end_latlng,
			co2_avoided_grams
		FROM activities
		WHERE id = $1`,
		[activityId]
	);

	return result.rows.length ? result.rows[0] : null;
}

const getMostRecentActivity = async(userId) => {
	const activities = await getActivities(userId, {number: 1});
	logger.info(activities[0]);
	return activities.length ? activities[0] : null;
}

const getActivities = async (userId, searchParams = {}) => {
	const {
		number = 30,
		page = 1
	} = searchParams;

	const pageOffset = page > 0 ? (page-1) * number : 0;
	const result = await db.query(`
		SELECT
			id,
			user_id,
			activity_platform,
			activity_platform_activity_id,
			activity_type,
			description,
			start_date,
			timezone,
			distance,
			commute,
			start_latlng,
			end_latlng,
			co2_avoided_grams
		FROM activities
		WHERE user_id = $1
		ORDER BY start_date DESC
		LIMIT $2
		OFFSET $3`,
		[userId, number, pageOffset]
	);

	return result.rows;
}

const createActivity = async (data) => {
	const {
		user_id,
		activity_platform,
		activity_platform_activity_id,
		activity_type,
		description,
		start_date,
		timezone,
		distance,
		commute,
		start_latlng,
		end_latlng,
		co2_avoided_grams
	} = data;

	const sql = `INSERT INTO public.activities(
		user_id,
		activity_platform,
		activity_platform_activity_id,
		activity_type,
		description,
		start_date,
		timezone,
		distance,
		commute,
		start_latlng,
		end_latlng,
		co2_avoided_grams
	)
	VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	RETURNING *`;
	const values = [
		user_id,
		activity_platform,
		activity_platform_activity_id,
		activity_type,
		description,
		start_date,
		timezone,
		distance,
		commute,
		start_latlng,
		end_latlng,
		co2_avoided_grams
	];

	// logger.info(`Values: ${values}`);

	const result = await db.query(sql, values);
	return result.rows[0];
}

const getSupportedActivityTypes = () => ['run', 'ride', 'walk'];
const getSupportedPlatforms = () => ['strava']

module.exports = {
	getActivity,
	getMostRecentActivity,
	getActivities,
	createActivity,
	getSupportedActivityTypes,
	getSupportedPlatforms
}