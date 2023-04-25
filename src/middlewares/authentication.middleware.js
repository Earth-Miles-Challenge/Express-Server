const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger.utils');

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
		if (err) {
			logger.error(err);
			return res.sendStatus(403);
		}

		req.authenticatedUser = user;
		next();
	});
}

function userHasAuthorization(req, res, next) {
	if (!req.authenticatedUser) {
		logger.error('User is not authenticated.');
		return res.sendStatus(403);
	}

	const userId = parseInt(req.params.userId);

	if (!userId) return res.sendStatus(401);
	if (userId !== req.authenticatedUser.id) return res.sendStatus(403);

	next();
}

function validateStravaAuthenticationRequest(req, res, next) {
	if (req?.query?.code && req?.query?.scope) return next();
	
	const err = new Error('Missing parameters for Strava authentication.');
	err.status = 400;
	return next(err);
}

module.exports = {
	authenticateToken,
	userHasAuthorization,
	validateStravaAuthenticationRequest
}