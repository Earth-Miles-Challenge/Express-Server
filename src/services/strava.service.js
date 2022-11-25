const db = require('./database.service');
const axios = require('axios');
const { logger } = require('../utils/logger.utils');
const { getEnvVariable } = require('../utils/env.utils');
const { createActivity } = require('./activities.service');

// http://localhost:3000/?state=http%3A%2F%2Flocalhost%3A3000%2F&code=8d5bb979e7253195cbfe507f40133f650f55a53b&scope=read
// http://localhost:3000/?state=http%3A%2F%2Flocalhost%3A3000%2F&code=37c97ed058b7fc0281472712169483744faed4c3&scope=read,activity:write,activity:read_all,profile:read_all

const getStravaConnection = async (userId) => {
	const result = await db.query(`SELECT * FROM strava_connection WHERE user_id = $1`, [userId]);
	return result.rows.length ? result.rows[0] : null;
}

const createStravaConnection = async (data) => {
	const {
		user_id,
		strava_id,
		expires_at,
		expires_in,
		refresh_token,
		access_token,
		activity_write,
		activity_read_all,
		profile_read_all
	} = data;

	const client = await db.pool.connect();
	try {
		await client.query('BEGIN');
		const stravaConn = await client.query(
			`INSERT INTO strava_connection(
				user_id,
				strava_id,
				expires_at,
				expires_in,
				access_token,
				activity_write,
				activity_read_all,
				profile_read_all
			)
			VALUES($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING *`,
			[
				user_id,
				strava_id,
				expires_at,
				expires_in,
				access_token,
				activity_write,
				activity_read_all,
				profile_read_all
			]
		);
		await client.query(
			`INSERT INTO strava_refresh_token(
				user_id,
				refresh_token
			)
			VALUES($1, $2)
			RETURNING *`,
			[
				user_id,
				refresh_token
			]
		);
		await client.query('COMMIT');
		return stravaConn.rows[0];
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

const updateStravaConnection = async (userId, newData) => {
	const existingData = await getStravaConnection(userId);

	if (!existingData) {
		const err = new Error(`Strava connection for user does not exist.`);
		err.name = 'invalidUser';
		throw err;
	}

	const validColumns = getStravaConnectionColumnNames();
	const [updateSql, n, updateValues, updateRefreshToken] = Object.keys(newData).reduce(([sql, n, values, updateRefreshToken], column) => {
		if (!validColumns.includes(column)) {
			const err = new Error(`Unknown column ${column} passed.`);
			err.name = 'invalidColumn';
			throw err;
		}

		if (column === 'refresh_token') {
			return [
				sql,
				n,
				values,
				true
			];
		} else {
			return [
				[...sql, `${column} = ($${n})`],
				n + 1,
				[...values, newData[column]],
				updateRefreshToken
			];
		}
	}, [[], 1, [], false]);

	const client = await db.pool.connect();
	try {
		await client.query('BEGIN');
		const stravaConn = await client.query(
			`UPDATE strava_connection
			SET ${updateSql.join(',')}
			WHERE user_id = $${n}
			RETURNING *`,
			[...updateValues, userId]
		);

		if (updateRefreshToken) {
			await client.query(
				`UPDATE strava_refresh_token
				SET refresh_token = $1
				WHERE user_id = $2;`,
				[newData.refresh_token, userId]
			);
		}

		await client.query('COMMIT');
		return stravaConn.rows[0];
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

const deleteStravaConnection = async (userId) => {
	const user = await getStravaConnection(userId);

	if (!user) {
		const err = new Error('Strava connection for user does not exist.');
		err.name = 'invalidUser';
		throw err;
	}

	const client = await db.pool.connect();
	try {
		await client.query('BEGIN');
		await client.query(`DELETE FROM strava_connection WHERE user_id = $1`, [userId]);
		await client.query(`DELETE FROM strava_refresh_token WHERE user_id = $1`, [userId]);
		await client.query('COMMIT');
		return 1;
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

const getStravaRefreshToken = async (userId) => {
	const result = await db.query(`SELECT refresh_token FROM strava_refresh_token WHERE user_id = $1`, [userId]);
	return result.rows.length ? result.rows[0] : null;
}

const updateStravaRefreshToken = async (token, userId) => {
	const result = await db.query(`UPDATE strava_refresh_token SET refresh_token = $1 WHERE user_id = $2 RETURNING refresh_token`, [token, userId]);
	return result.rows.length ? result.rows[0] : null;
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

const getUserAccessToken = async (userId) => {
	const stravaConn = await getStravaConnection(userId);
	logger.info(stravaConn.expires_at);
	logger.info(parseInt(Date.now() / 1000));
	if (stravaConn.expires_at > parseInt(Date.now() / 1000)) {
		return {
			accessToken: stravaConn.access_token,
			stravaConn: stravaConn
		};
	}
	try {
		const response = await axios.post(
			`https://www.strava.com/api/v3/oauth/token`, {
			client_id: getEnvVariable('STRAVA_CLIENT_ID'),
			client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
			grant_type: 'refresh_token',
			refresh_token: stravaConn.refresh_token
		});
		const { access_token, refresh_token, expires_at, expires_in } = response.data;

		// Update Strava connection details — returns a promise
		const getUpdateData = () => refresh_token !== stravaConn.refresh_token
			? { access_token, refresh_token, expires_at, expires_in }
			: { access_token, expires_at, expires_in };

		return {
			accessToken: access_token,
			stravaConn: await updateStravaConnection(userId, getUpdateData())
		};
	} catch (err) {
		logger.debug(`There was an error while refreshing an access token from Strava:`, err.message);
		throw err;
	}
}

const getAthleteActivities = async (userId, after = 0, perPage = 30) => {
	try {
		const accessToken = await getUserAccessToken(userId);
		const response = await axios.get(
			`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=${perPage}`, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});

		return await response.data;

		// return await activities.map(async(activityData) => {
		// 	logger.info(`getAthleteActivities: ${activityData} - ${userId}`);
		// 	const activity = await createActivityFromStravaActivity(userId, activityData);
		// 	return activity;
		// });
	} catch (err) {
		logger.debug(`There was an error fetching athlete activities:`, err.message);
		throw err;
	}
}

const createActivityFromStravaActivity = async (userId, activityData) => {
	const {
		start_date,
		distance,
		commute,
		start_latlng,
		end_latlng
	} = activityData;

	const type = getActivityType(activityData);

	// Skip unsupported activity types
	if (!type) return null;

	const data = {
		user_id: userId,
		activity_platform: 'strava',
		activity_platform_activity_id: activityData.id,
		activity_type: type,
		description: activityData.name,
		start_date,
		timezone: parseTimezone(activityData.timezone),
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
	switch (activity.type) {
		case 'Ride':
		case 'Run':
		case 'Walk':
			return activity.type.toLowerCase();

		default:
			return false;
	}
}

const getEmissionsAvoidedForActivity = (activity) => {
	if (!activity.commute) return 0;

	/**
	 * This is based on the average emissions of medium & small cars.
	 * @see https://ourworldindata.org/travel-carbon-footprint
	 */
	const estimatedEmissionsPerKm = 165;

	/**
	 * @todo Instead of taking the activity distance, calculate distance of fossil fuel powered alternative
	 */
	return Math.round(activity.distance / 1000 * estimatedEmissionsPerKm);
}

/**
 * Parse the timezone passed by Strava to return only the region.
 * @param {string} timezone
 * @returns string
 */
const parseTimezone = timezone => timezone.match(/.* (.*)/)[1];

/**
 * Parse the scope query string.
 * @param {string} scope
 * @returns object
 */
const parseScope = scope => {
	const granted = scope.replaceAll(':','_').split(',');
	return [
		'activity_write',
		'activity_read_all',
		'profile_read_all'
	].reduce((permissions, scopeName) => {
		return {
			...permissions,
			[scopeName]: granted.includes(scopeName)
		}
	}, {});
}

const getStravaConnectionColumnNames = () => [
	'user_id',
	'strava_id',
	'expires_at',
	'expires_in',
	'access_token',
	'activity_write',
	'activity_read_all',
	'profile_read_all',
	'refresh_token'
];

module.exports = {
	getStravaConnection,
	createStravaConnection,
	updateStravaConnection,
	deleteStravaConnection,
	getStravaRefreshToken,
	updateStravaRefreshToken,
	getClientToken,
	getUserAccessToken,
	getAthleteActivities,
	createActivityFromStravaActivity,
	parseTimezone,
	parseScope
}