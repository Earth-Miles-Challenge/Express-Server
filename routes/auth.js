const axios = require('axios');
const express = require('express');
const router = express.Router();
const {_clientId, _clientSecret} = require('../utils/strava.js');

/* GET home page. */
router.post('/strava', function(req, res, next) {
	if (!req.body.code || req.body.code.length === 0) {
		const err = new Error('Missing Strava code');
		err.status = 400;
		return next(err);
	}

	response = axios.post(`https://www.strava.com/api/v3/oauth/token`, {
		client_id: _clientId,
		client_secret: _clientSecret,
		code: req.body.code,
		grant_type: 'authorization_code'
	})
	.then((response) => {
		console.log(response);
		res.json(response.athlete);
	})
	.catch((err) => {
		next(err);
	});
});

module.exports = router;
