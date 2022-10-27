const axios = require('axios');

const getClientToken = async (code) => {
	try {
		const response = await axios.post(`https://www.strava.com/api/v3/oauth/token`, {
			client_id: process.env.STRAVA_CLIENT_ID,
			client_secret: process.env.STRAVA_CLIENT_SECRET,
			code: code,
			grant_type: 'authorization_code'
		});
		console.log(response);
		return response.data;
	} catch (err) {
		console.log(`There was an error while getting a client token from Strava`, err.message);
		return false;
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