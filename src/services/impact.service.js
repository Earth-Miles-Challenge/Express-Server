const db = require('./database.service');
const { logger } = require('./logger.service');

const getEmissionsAvoidedByUser = async (userId, args = {}) => {
	// const { before, after } = args;
	const result = await db.query(`
		SELECT SUM(co2_avoided_grams)
		FROM activities
		WHERE user_id = $1`,
		[userId]
	);
	return result.rows[0].sum;
}

module.exports = {
	getEmissionsAvoidedByUser
}