const db = require('./database.service');

const getEmissionsAvoidedByUser = async (userId, args = {}) => {
	const result = await db.query(`
		SELECT
			COALESCE(SUM(fossil_alternative_co2), 0) AS sum
		FROM
			activity_impact
			JOIN activity ON activity_impact.activity_id = activity.id
		WHERE
			activity.user_id = $1`,
		[userId]
	);

	return parseInt(result.rows[0].sum);
}

module.exports = {
	getEmissionsAvoidedByUser
}