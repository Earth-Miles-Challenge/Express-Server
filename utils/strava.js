const axios = require('axios');
const fs = require('fs');
const keys = require('../../private/keys.json');

const getClientToken = async (code) => {
	try {
		const response = await axios.post(`https://www.strava.com/api/v3/oauth/token`, {
			client_id: keys.stravaClientId,
			client_secret: keys.stravaClientSecret,
			code: code,
			grant_type: 'authorization_code'
		});
		console.log(response);
		return response.data;
	} catch (err) {
		console.log(err);
		return false;
	}
}

const getAthleteActivities = () => {
	response = axios.get(`https://www.strava.com/api/v3/oauth/token`, {
		client_id: _clientId,
		client_secret: _clientSecret,
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
	clientId: keys.stravaClientId,
	getClientToken,
	getAthleteActivities
}