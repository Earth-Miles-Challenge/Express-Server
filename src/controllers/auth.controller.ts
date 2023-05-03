import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.utils';
import { getUserByPlatformId, createUser, updateUser } from '../services/users.service';
import {
	getClientToken,
	getStravaConnection,
	updateStravaConnection,
	createStravaConnection,
	parseScope,
	getStravaRefreshToken
} from '../services/strava.service';
import { generateAccessToken } from '../services/authentication.service';
import { onboardUser } from '../services/onboarding.service';

import { getEnvironment } from '../utils/env.utils';
import { ErrorType } from '../types/error.types';

/**
 * Strava authentication.
 *
 * This receives a Strava authorization code and uses that to
 * obtain a token from Strava. If successful, the Strava response
 * is stored in the session and the user is redirected.
 */
async function authenticateStrava(req: Request, res: Response, next: NextFunction) {
	if ( !req.query?.code || !req.query?.scope) {
		return next({
			error: new Error('Missing parameters for Strava authentication.'),
			status: 400
		});
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
			logger.info(token);
			res.cookie('token', token, {
				secure: getEnvironment() === 'PRODUCTION',
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
		next({
			error: new Error(`Error while obtaining Strava client token: ${stravaError.message} [${stravaError.status}]`),
			status: stravaError.status
		});
	}
}

async function refreshToken(req: Request, res: Response, next: NextFunction) {

}

module.exports = {
	authenticateStrava,
	refreshToken
};
