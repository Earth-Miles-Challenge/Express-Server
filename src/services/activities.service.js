const db = require('./database.service');
const { logger } = require('./logger.service');


const getActivity = async (activityId) => {
	const result = await db.query(`
		SELECT * FROM activities
		WHERE id = $1`,
		[activityId]
	);
	return result.rows[0];
}

const getActivities = async (userId, searchParams = {}) => {
	const {
		number = 20,
		page = 1
	} = searchParams;

	const pageOffset = page > 0 ? (page-1) * number : 0;
	const result = await db.query(`
		SELECT * FROM activities
		WHERE user_id = $1
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
		start_date_local,
		timezone,
		utc_offset,
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
		start_date_local,
		timezone,
		utc_offset,
		distance,
		commute,
		start_latlng,
		end_latlng,
		co2_avoided_grams
	)
	VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	RETURNING *`;
	const values = [
		user_id,
		activity_platform,
		activity_platform_activity_id,
		activity_type,
		description,
		start_date,
		start_date_local,
		timezone,
		utc_offset,
		distance,
		commute,
		start_latlng,
		end_latlng,
		co2_avoided_grams
	];
	const result = await db.query(sql, values);
	return result.rows[0];
}

module.exports = {
	getActivity,
	getActivities,
	createActivity
}