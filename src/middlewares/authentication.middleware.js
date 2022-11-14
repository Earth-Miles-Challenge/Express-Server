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

		next();
	});
}

function userHasAuthorization(req, res, next) {
	if (!req.authenticatedUser) return res.sendStatus(403);

	const userId = parseInt(req.params.id);

	if (!userId) return res.sendStatus(401);
	if (userId !== req.authenticatedUser.id) return res.sendStatus(403);
	next();
}

module.exports = {
	authenticateToken,
	userHasAuthorization
}