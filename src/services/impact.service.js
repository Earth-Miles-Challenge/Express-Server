const db = require('./database.service');
const { logger } = require('./logger.service');

const getEmissionsAvoidedByUser = async (userId, args = {}) => {
	const result = await db.query(`
		SELECT COALESCE(SUM(co2_avoided_grams), 0) AS sum
		FROM activities
		WHERE user_id = $1`,
		[userId]
	);

	return parseInt(result.rows[0].sum);
}

module.exports = {
	getEmissionsAvoidedByUser
}