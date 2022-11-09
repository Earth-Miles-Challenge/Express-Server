const { logger } = require('../services/logger.service');
const { getUserByPlatformId, createUser, updateUser } = require('../services/users.service');
const { getClientToken } = require('../services/strava.service');
const { generateAccessToken } = require('../services/authentication.service');

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
		try {
			const userData = {
				'first_name': response.athlete.firstname,
				'last_name': response.athlete.lastname,
				'profile_photo': response.athlete.profile,
				'activity_platform': 'strava',
				'activity_platform_id': response.athlete.id
			};
			const existingUser = await getUserByPlatformId('strava', response.athlete.id)
			const user = existingUser
				? await updateUser(existingUser.id, userData)
				: await createUser(userData);
			const tokenKeys = [ 'id', 'first_name', 'last_name', 'profile_photo', 'activity_platform' ];
			const filteredData = Object.entries(user).filter(([key, value]) => -1 !== tokenKeys.indexOf(key) );
			const tokenData = Object.fromEntries(filteredData);
			const token = generateAccessToken(tokenData, '2 days');
			res.send(token);
		} catch (err) {
			next(err);
		}
	} catch (stravaError) {
		const err = new Error(`Error while obtaining Strava client token: ${stravaError.message} [${stravaError.status}]`);
		err.status = stravaError.status;
		next(err);
	}
}

module.exports = {
	authenticateStrava
};
