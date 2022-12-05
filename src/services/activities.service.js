const db = require('./database.service');
const { logger } = require('../utils/logger.utils');
const { getFilteredObject } = require('../utils/object.utils');
const { createActivityImpact, getActivityImpact } = require('./activity-impact.service');

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
			map_polyline,
			activity_impact.fossil_alternative_distance,
			activity_impact.fossil_alternative_polyline,
			activity_impact.fossil_alternative_co2
		FROM
			activity
			LEFT JOIN activity_impact ON activity.id = activity_impact.activity_id
		WHERE id = $1`,
		[activityId]
	);

	return result.rows.length ? getActivityResponseObject(result.rows[0]) : null;
}

const getMostRecentActivity = async(userId) => {
	const activities = await getActivities(userId, {number: 1});
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
			map_polyline,
			activity_impact.fossil_alternative_distance,
			activity_impact.fossil_alternative_polyline,
			activity_impact.fossil_alternative_co2
		FROM
			activity
			LEFT JOIN activity_impact ON activity.id = activity_impact.activity_id
		WHERE user_id = $1
		ORDER BY start_date DESC
		LIMIT $2
		OFFSET $3`,
		[userId, number, pageOffset]
	);

	return result.rows.map(getActivityResponseObject);
}

const createActivity = async (data) => {
	if (validate(data)) {
		const sql = `INSERT INTO activity(
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
			map_polyline
		)
		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING *`;
		const values = [
			data.user_id,
			data.activity_platform,
			data.activity_platform_activity_id,
			data.activity_type,
			data.description,
			data.start_date,
			data.timezone,
			data.distance,
			data.commute,
			data.start_latlng,
			data.end_latlng,
			data.map_polyline
		];

		const result = await db.query(sql, values);
		const impact = data.activity_impact
			? await createActivityImpact(data.activity_impact)
			: null;

		return {
			...result.rows[0],
			activity_impact: getFilteredObject(impact, ([key]) => key !== 'activity_id')
		};
	}
}

const updateActivity = async (activityId, newData) => {
	const existingData = await getActivity(activityId);

	if (!existingData) {
		const err = new Error(`Activity does not exist.`);
		err.name = 'invalidActivity';
		throw err;
	}

	if (validate(Object.assign(existingData, newData))) {
		const validColumns = getColumnNames();
		const [updateSql, n, updateValues] = Object.keys(newData).reduce(([sql, n, values], column) => {
			if (!validColumns.includes(column)) {
				const err = new Error(`Unknown column ${column} passed.`);
				err.name = 'invalidColumn';
				throw err;
			}

			return [
				[...sql, `${column} = ($${n})`],
				n + 1,
				[...values, newData[column]]
			];
		}, [[], 1, []]);

		const sql = `UPDATE activity
					SET ${updateSql.join(',')}
					WHERE id = $${n}
					RETURNING *`;

		const result = await db.query(sql, [...updateValues, activityId]);
		const impact = await getActivityImpact(activityId);
		return {
			...result.rows[0],
			activity_impact: impact.fossil_alternative_distance
				? getFilteredObject(impact, ([key]) => key !== 'activity_id')
				: null
		};
	}
}

/**
 * Validate activity data before inserting/updating.
 * @param {object} data
 * @returns Error|true
 */
const validate = (data) => {
	const requiredFields = [
		'user_id',
		'activity_platform',
		'activity_platform_activity_id',
		'activity_type',
		'start_date',
		'timezone',
		'distance'
	];

	const requiredFieldErrors = requiredFields.reduce((errors, field) => {
		if (!data.hasOwnProperty(field) || !data[field]) {
			return [
				...errors,
				field
			];
		} else {
			return errors;
		}
	}, []);

	if (requiredFieldErrors.length) {
		const err = new Error(`Missing required fields: ${requiredFieldErrors.join(', ')}`);
		err.name = 'missingRequiredFields';
		throw err;
	}

	if (false === getSupportedActivityTypes().includes(data.activity_type)) {
		const err = new Error(`Invalid activity type: ${data.activity_type}`);
		err.name = 'invalidActivityType';
		throw err;
	}

	if (!getSupportedPlatforms().includes(data.activity_platform)) {
		const err = new Error(`Invalid activity platform: ${data.activity_platform}`);
		err.name = 'invalidActivityPlatform';
		throw err;
	}

	return true;
}

const getColumnNames = () => [
	'user_id',
	'activity_platform',
	'activity_platform_activity_id',
	'activity_type',
	'description',
	'start_date',
	'timezone',
	'distance',
	'commute',
	'start_latlng',
	'end_latlng',
	'map_polyline'
];
const getSupportedActivityTypes = () => ['run', 'ride', 'walk'];
const getSupportedPlatforms = () => ['strava']

const getActivityResponseObject = (activityData) => {
	const impactFields = [
		'fossil_alternative_distance',
		'fossil_alternative_polyline',
		'fossil_alternative_co2'
	];
	return {
		...getFilteredObject(activityData, ([key]) => {
			return !impactFields.includes(key)
		}),
		activity_impact: activityData.fossil_alternative_distance
			? getFilteredObject(activityData, ([key]) => {
				return impactFields.includes(key)
			})
			: null
	}
}

module.exports = {
	getActivity,
	getMostRecentActivity,
	getActivities,
	createActivity,
	updateActivity,
	getSupportedActivityTypes,
	getSupportedPlatforms,
	getActivityResponseObject
}