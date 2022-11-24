const { logger } = require('../utils/logger.utils');
const impactService = require('../services/impact.service');

async function getEmissionsAvoided(req, res, next) {
	try {
		const emissionsAvoided = await impactService.getEmissionsAvoided(req.user.id, req.query);
		res.json({
			success: true,
			emissionsAvoided
		});
	} catch (err) {
		// err.status = getErrorStatus(err);
		logger.debug(`Error when getting emissions avoided by user`, err.message);
		next(err);
	}
}

async function getEmissionsAvoidedByUser(req, res, next) {
	try {
		const emissionsAvoided = await impactService.getEmissionsAvoidedByUser(req.user.id, req.query);
		res.json({
			success: true,
			emissionsAvoided
		});
	} catch (err) {
		// err.status = getErrorStatus(err);
		logger.debug(`Error when getting emissions avoided by user`, err.message);
		next(err);
	}
}

module.exports = {
	getEmissionsAvoided,
	getEmissionsAvoidedByUser
}