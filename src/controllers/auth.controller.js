const { logger } = require('../services/logger.service');
const { getClientToken } = require('../services/strava.service');

/**
 * Strava authentication.
 *
 * This receives a Strava authorization code and uses that to
 * obtain a token from Strava. If successful, the Strava response
 * is stored in the session and the user is redirected.
 */
async function authenticateStrava(req, res, next) {
	if (!req.query || !req.query.code || !req.query.scope) {
		const err = new Error('Missing parameters for Strava authentication.');
		err.status = 400;
		next(err);
	}
	logger.debug(req.query);
	try {

		const response = await getClientToken(req.query.code);

		res.json(response);

		// Use successful response to add athlete details to the session
		// req.session.strava = response;
		// req.session.profile = {
		// 	...req.session.profile,
		// 	strava_id: response.athlete.id,
		// 	first_name: response.athlete.firstname,
		// 	last_name: response.athlete.lastname,
		// 	picture: response.athlete.profile,
		// 	city: response.athlete.city,
		// 	state: response.athlete.state,
		// 	country: response.athlete.country
		// }

		// const redirect = req.query.state || process.env.CLIENT_URI
		// res.redirect(redirect);
	} catch (stravaError) {
		const err = new Error(`Error while obtaining Strava client token: ${stravaError.message} [${stravaError.status}]`);
		err.status = stravaError.status;
		next(err);
	}

}

module.exports = {
	authenticateStrava
};
