const jwt = require('jsonwebtoken');
const { logger } = require('../services/logger.service');

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
		logger.error(err);

		if (err) return res.sendStatus(403);

		req.authenticatedUser = user;
		logger.info(req.authenticatedUser);
		next();
	});
}

function userHasAuthorization(req, res, next) {
	if (!req.authenticatedUser) return res.sendStatus(403);

	const userId = parseInt(req.params.id);
	logger.info('userHasAuthorization: ' + userId);

	if (!userId) return res.sendStatus(401);
	if (userId !== req.authenticatedUser.id) return res.sendStatus(403);
	logger.info('userHasAuthorization: passed');
	
	next();
}

module.exports = {
	authenticateToken,
	userHasAuthorization
}