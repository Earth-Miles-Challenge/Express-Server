const axios = require('axios');
const { logger } = require('../services/logger.service');

const getClientToken = async (code) => {
	try {
		const response = await axios.post(`https://www.strava.com/api/v3/oauth/token`, {
			client_id: process.env.STRAVA_CLIENT_ID,
			client_secret: process.env.STRAVA_CLIENT_SECRET,
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
		client_id: process.env.STRAVA_CLIENT_ID,
		client_secret: process.env.STRAVA_CLIENT_SECRET,
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
	getClientToken,
	getAthleteActivities
}