import { StravaConnection } from '../types/stravaConnection.types';
import { ActivityData } from '../types/activities.types';
import db from './database.service';
import axios from 'axios';
import { logger } from '../utils/logger.utils';
import { getEnvVariable } from '../utils/env.utils';
import { createActivity } from './activities.service';
import { getEmissionsAvoidedForActivity } from './activity-impact.service';

export const getStravaConnection = async (userId: number, isStravaId = false) => {
	const result = isStravaId
		? await db.query(`SELECT * FROM strava_connection WHERE strava_id = $1`, [userId])
		: await db.query(`SELECT * FROM strava_connection WHERE user_id = $1`, [userId]);

	return result.rows.length ? result.rows[0] : null;
}

export const createStravaConnection = async (data: StravaConnection) => {
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

export const updateStravaConnection = async (userId: number, newData: StravaConnection, isStravaId = false) => {
	const existingData = await getStravaConnection(userId, isStravaId);

	if (!existingData) {
		const err = new Error(`Strava connection for user does not exist.`);
		err.name = 'invalidUser';
		throw err;
	}

	const validColumns = getStravaConnectionColumnNames();
	const [updateSql: string[], n: number, updateValues<string|number>[], updateRefreshToken: boolean] = Object.keys(newData).reduce(
		([
			sql: string[],
			n: number,
			values: <string|number>[],
			updateRefreshToken: boolean
		], column) => {
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

export const deleteStravaConnection = async (userId: number, isStravaId = false) => {
	const user = await getStravaConnection(userId, isStravaId);

	if (!user) {
		const err = new Error('Strava connection for user does not exist.');
		err.name = 'invalidUser';
		throw err;
	}

	const client = await db.pool.connect();
	try {
		await client.query('BEGIN');
		await client.query(`DELETE FROM strava_connection WHERE user_id = $1`, [user.user_id]);
		await client.query(`DELETE FROM strava_refresh_token WHERE user_id = $1`, [user.user_id]);
		await client.query('COMMIT');
		return 1;
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

export const getStravaRefreshToken = async (userId: number) => {
	const result = await db.query(`SELECT refresh_token FROM strava_refresh_token WHERE user_id = $1`, [userId]);
	return result.rows.length ? result.rows[0] : null;
}

export const updateStravaRefreshToken = async (token, userId: number) => {
	const result = await db.query(`UPDATE strava_refresh_token SET refresh_token = $1 WHERE user_id = $2 RETURNING refresh_token`, [token, userId]);
	return result.rows.length ? result.rows[0] : null;
}

export const getClientToken = async (code: string) => {
	try {
		/**
		 * Headers required with accept-encoding permitting JSON response
		 * due to Axios bug.
		 * @see https://github.com/axios/axios/issues/5298
		 */
		const response = await axios.post(`https://www.strava.com/api/v3/oauth/token`, {
			client_id: getEnvVariable('STRAVA_CLIENT_ID'),
			client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
			code: code,
			grant_type: 'authorization_code'
		}, {
			headers: { 'Accept-Encoding': 'application/json' }
		});

		return response.data;
	} catch (err) {
		logger.debug(`There was an error while getting a client token from Strava:`, err.message);
		throw err;
	}
}

export const getUserAccessToken = async (userId: number, isStravaId = false) => {
	const stravaConn = await getStravaConnection(userId, isStravaId);
	if (stravaConn.expires_at > (Date.now() / 1000)) {
		return {
			accessToken: stravaConn.access_token,
			stravaConn: stravaConn
		};
	}
	try {
		/**
		 * Headers required with accept-encoding permitting JSON response
		 * due to Axios bug.
		 * @see https://github.com/axios/axios/issues/5298
		 */
		const response = await axios.post(
			`https://www.strava.com/api/v3/oauth/token`, {
			client_id: getEnvVariable('STRAVA_CLIENT_ID'),
			client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
			grant_type: 'refresh_token',
			refresh_token: stravaConn.refresh_token
		}, {
			headers: { 'Accept-Encoding': 'application/json' }
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

export const getAthleteActivities = async (userId: number, after = 0, perPage = 30) => {
	try {
		const { accessToken } = await getUserAccessToken(userId);
		const response = await axios.get(
			`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=${perPage}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Accept-Encoding': 'application/json'
			}
		});
		return response.data;
	} catch (err) {
		logger.info(`There was an error fetching athlete activities:`, err.message);
		throw err;
	}
}

export const getActivityFromStrava = async (activityId: string, userId: number, isStravaId = false) => {
	try {
		const { accessToken } = await getUserAccessToken(userId, isStravaId);
		const response = await axios.get(
			`https://www.strava.com/api/v3/activities/${activityId}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Accept-Encoding': 'application/json'
			}
		});
		return response.data;
	} catch (err) {
		logger.info(`There was an error fetching athlete activity:`, err.message);
		throw err;
	}
}

export const createActivityFromStravaActivity = async (userId: number, activityData: ActivityData) => {
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
		start_latlng,
		end_latlng,
		map_polyline: activityData.map.summary_polyline,
		commute,
		activity_impact: activityData.commute
			? {
				fossil_alternative_distance: activityData.distance,
				fossil_alternative_co2: getEmissionsAvoidedForActivity(activityData)
			}
			: null
	}

	return await createActivity(data);
}

export const getActivityType = (activity: ActivityData) => {
	switch (activity.type) {
		case 'Ride':
		case 'Run':
		case 'Walk':
			return activity.type.toLowerCase();

		case 'Hike':
			return 'walk';

		case 'EBikeRide':
			return 'ebike-ride';

		default:
			return false;
	}
}

/**
 * Parse the timezone passed by Strava to return only the region.
 * @param {string} timezone
 * @returns string|null
 */
export const parseTimezone = (timezone: string) => {
	const tz = timezone.match(/.* (.*)/)
	return !!tz ? tz[1] : null;
}

/**
 * Parse the scope query string.
 * @param {string} scope
 * @returns object
 */
export const parseScope = (scope: string) => {
	const granted = scope.replace(/:/g,'_').split(',');
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

// export const stravaService = {
// 	getStravaConnection,
// 	createStravaConnection,
// 	updateStravaConnection,
// 	deleteStravaConnection,
// 	getStravaRefreshToken,
// 	updateStravaRefreshToken,
// 	getClientToken,
// 	getUserAccessToken,
// 	getAthleteActivities,
// 	getActivityFromStrava,
// 	createActivityFromStravaActivity,
// 	getActivityType,
// 	parseTimezone,
// 	parseScope
// };

// export default stravaService;