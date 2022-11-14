const db = require('./database.service');
const axios = require('axios');
const { logger } = require('../services/logger.service');
const { getEnvVariable } = require('../utils/env.utils');
const { createActivity } = require('./activities.service');

const getStravaConnectionDetails = async (userId) => {
	const result = await db.query(`SELECT * FROM strava_connection_details WHERE user_id = $1`, [userId]);
	return result.rows[0];
}

const createStravaConnectionDetails = async (data) => {
	const {
		user_id,
		strava_id,
		expires_at,
		expires_in,
		refresh_token,
		access_token
	} = data;
	const sql = `INSERT INTO strava_connection_details(user_id, strava_id, expires_at, expires_in, refresh_token, access_token)
			VALUES($1, $2, $3, $4, $5, $6)
			RETURNING *`;
	const values = [user_id, strava_id, expires_at, expires_in, refresh_token, access_token];
	const result = await db.query(sql, values);
	return result.rows[0];
}

const updateStravaConnectionDetails = async (userId, newData) => {
	const existingData = await getStravaConnectionDetails(userId);

	if (!existingData) {
		const err = new Error(`Strava connection details do not exist.`);
		err.name = 'invalidUser';
		throw err;
	}

	const validColumns = ['user_id', 'strava_id', 'expires_at', 'expires_in', 'refresh_token', 'access_token'];
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

	const sql = `UPDATE strava_connection_details
				SET ${updateSql.join(',')}
				WHERE user_id = $${n}
				RETURNING *`;

	const result = await db.query(sql, [...updateValues, userId]);
	return result.rows[0];
}

const deleteStravaConnectionDetails = async (userId) => {

}

const getClientToken = async (code) => {
	try {
		const response = await axios.post(`https://www.strava.com/api/v3/oauth/token`, {
			client_id: getEnvVariable('STRAVA_CLIENT_ID'),
			client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
			code: code,
			grant_type: 'authorization_code'
		});

		return response.data;
	} catch (err) {
		logger.debug(`There was an error while getting a client token from Strava:`, err.message);
		throw err;
	}
}

const getAthleteActivities = async (accessToken, after = 0) => {
	const response = await axios.get(
		`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=30`, {
		client_id: getEnvVariable('STRAVA_CLIENT_ID'),
		client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	return response;
}

const createActivityFromStravaActivity = async (userId, activityData) => {
	const {
		start_date,
		start_date_local,
		timezone,
		utc_offset,
		distance,
		commute,
		start_latlng,
		end_latlng
	} = activityData;

	const data = {
		user_id: userId,
		activity_platform: 'strava',
		activity_platform_activity_id: activityData.id,
		activity_type: getActivityType(activityData),
		description: activityData.name,
		start_date,
		start_date_local,
		timezone,
		utc_offset,
		distance,
		commute,
		start_latlng,
		end_latlng,
		co2_avoided_grams: getEmissionsAvoidedForActivity(activityData)
	}
	const activity = await createActivity(data);
	return activity;
}

const getActivityType = (activity) => {
	if (activity.type === 'Ride') return 'ride';
	if (activity.type === 'Run') return 'run';
}

const getEmissionsAvoidedForActivity = (activity) => {
	/**
	 * This is based on the average emissions of medium & small cars.
	 * @see https://ourworldindata.org/travel-carbon-footprint
	 */
	const estimatedEmissionsPerKm = 165;

	/**
	 * @todo Instead of taking the activity distance, calculate distance of fossil fuel powered alternative
	 */
	return distance / 100 * estimatedEmissionsPerKm;
}

module.exports = {
	getStravaConnectionDetails,
	createStravaConnectionDetails,
	updateStravaConnectionDetails,
	deleteStravaConnectionDetails,
	getClientToken,
	getAthleteActivities,
	createActivityFromStravaActivity
}