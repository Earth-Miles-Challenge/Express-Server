const axios = require('axios');
const express = require('express');
const router = express.Router();
const { getClientToken } = require('../utils/strava.js');

/* GET home page. */
router.get('/strava', async (req, res, next) => {
	const redirect = req.query.state || 'http://localhost:3000'

	if (!req.query.code || !req.query.scope) {
		res.send('missing codes');
	}

	const response = await getClientToken(req.query.code);

	if (response) {
		res.json(response);
	}

	const err = new Error();
	err.status = 500;
	next(err);
	// res.redirect(redirect + '?success');

	// .then((response) => {
	// 	res.json(response.athlete);
	// })
	// .catch((err) => {
	// 	next(err);
	// });
});

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
		res.json(response.athlete);
	})
	.catch((err) => {
		next(err);
	});
});

module.exports = router;
