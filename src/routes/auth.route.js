const axios = require('axios');
const express = require('express');
const router = express.Router();
const { getClientToken } = require('../services/strava.service');

/**
 * Strava authentication.
 *
 * This receives a Strava authorization code and uses that to
 * obtain a token from Strava. If successful, the Strava response
 * is stored in the session and the user is redirected.
 */
router.get('/strava', async (req, res, next) => {
	const redirect = req.query.state || 'http://localhost:3000'

	if (!req.query.code || !req.query.scope) {
		res.send('missing codes');
	}

	const response = await getClientToken(req.query.code);

	// Use successful response to add athlete details to the session
	if (response) {
		req.session.strava = response;
		req.session.profile = {
			...req.session.profile,
			strava_id: response.athlete.id,
			first_name: response.athlete.firstname,
			last_name: response.athlete.lastname,
			picture: response.athlete.profile,
			city: response.athlete.city,
			state: response.athlete.state,
			country: response.athlete.country
		}
		res.redirect(redirect);
	}

	const err = new Error();
	err.status = 500;
	next(err);
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
		res.json(response);
	})
	.catch((err) => {
		next(err);
	});
});

module.exports = router;
