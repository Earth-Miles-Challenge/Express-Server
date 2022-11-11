const { logger } = require('../services/logger.service');
const { getUserByPlatformId, createUser, updateUser } = require('../services/users.service');
const {
	getClientToken,
	getStravaConnectionDetails,
	updateStravaConnectionDetails,
	createStravaConnectionDetails
} = require('../services/strava.service');
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
			// Save the user
			const userData = {
				'first_name': response.athlete.firstname,
				'last_name': response.athlete.lastname,
				'profile_photo': response.athlete.profile,
				'activity_platform': 'strava',
				'activity_platform_id': response.athlete.id
			};
			const existingUser = await getUserByPlatformId('strava', response.athlete.id)

			const user = !existingUser
				? await createUser(userData)
				: await updateUser(existingUser.id, userData);

			// Save the Strava connection details
			const hasStravaConn = !! existingUser
				? await getStravaConnectionDetails(user.id)
				: false;
			const stravaConnData = {
				user_id: user.id,
				strava_id: response.athlete.id,
				expires_at: response.expires_at,
				expires_in: response.expires_in,
				refresh_token: response.refresh_token,
				access_token: response.access_token
			}
			!hasStravaConn
				? await createStravaConnectionDetails(stravaConnData)
				: await updateStravaConnectionDetails(user.id, stravaConnData);

			// Generate the token
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
