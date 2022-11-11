const db = require('./database.service');
const axios = require('axios');
const { logger } = require('../services/logger.service');
const { getEnvVariable } = require('../utils/env.utils');

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

const updateStravaConnectionDetails = async (userId, data) => {

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

const getAthleteActivities = (req) => {
	response = axios.get(`https://www.strava.com/api/v3/oauth/token`, {
		client_id: getEnvVariable('STRAVA_CLIENT_ID'),
		client_secret: getEnvVariable('STRAVA_CLIENT_SECRET'),
		code: req.body.code,
		grant_type: 'authorization_code'
	})
	.then((response) => {
		res.json(response);
	})
	.catch((err) => {
		next(err);
	});
}

module.exports = {
	getStravaConnectionDetails,
	createStravaConnectionDetails,
	updateStravaConnectionDetails,
	deleteStravaConnectionDetails,
	getClientToken,
	getAthleteActivities
}