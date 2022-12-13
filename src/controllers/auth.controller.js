const { logger } = require('../utils/logger.utils');
const { getUserByPlatformId, createUser, updateUser } = require('../services/users.service');
const {
	getClientToken,
	getStravaConnection,
	updateStravaConnection,
	createStravaConnection,
	parseScope,
	getStravaRefreshToken
} = require('../services/strava.service');
const { generateAccessToken } = require('../services/authentication.service');
const { onboardUser } = require('../services/onboarding.service');

const { getEnvironment } = require('../utils/env.utils');

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
		return next(err);
	}

	const scope = parseScope(req.query.scope);

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
			const stravaConnData = {
				user_id: user.id,
				strava_id: response.athlete.id,
				expires_at: response.expires_at,
				expires_in: response.expires_in,
				access_token: response.access_token,
				...scope
			}

			console.debug(stravaConnData);

			// Update or create Strava connection
			const isUpdate = !!existingUser && await getStravaConnection(user.id);
			if (isUpdate) {
				if (response.refresh_token === getStravaRefreshToken(user.id)) {
					await updateStravaConnection(user.id, stravaConnData);
				} else {
					await updateStravaConnection(user.id, {
						...stravaConnData,
						refresh_token: response.refresh_token
					});
				}
			} else {
				await createStravaConnection({
					...stravaConnData,
					refresh_token: response.refresh_token
				});
			}

			// NOTE: Onboarding runs asynchronously and we don't need to await the return.
			onboardUser(user.id);

			// Generate the token
			const token = generateAccessToken({id: user.id}, '2 days');
			console.debug(token);
			res.cookie('token', token, {
				secure: getEnvironment() === 'PRODUCTION',
				maxAge: null,
				httpOnly: false
			});

			res.json({
				success: true,
				data: {}
			});
		} catch (err) {
			logger.info(err);
			next(err);
		}
	} catch (stravaError) {
		const err = new Error(`Error while obtaining Strava client token: ${stravaError.message} [${stravaError.status}]`);
		err.status = stravaError.status;
		next(err);
	}
}

async function refreshToken(req, res, next) {

}

module.exports = {
	authenticateStrava,
	refreshToken
};
