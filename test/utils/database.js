const db = require('../../src/services/database.service');
const { usersSqlValues } = require('../../__fixtures__/users');
const { logger } = require('../../src/utils/logger.utils');

/**
 * Set up database initially using a transaction.
 *
 * @see https://node-postgres.com/features/transactions
 */
const initializeDatabase = async () => {
	await db.query(`TRUNCATE TABLE activity_impact, activity, strava_connection, strava_refresh_token, user_account;`);
	await db.query(`ALTER SEQUENCE user_account_id_seq RESTART WITH 1;`);
	await db.query(`ALTER SEQUENCE activity_id_seq RESTART WITH 1;`);
}

const getClient = async () => {
	return await db.pool.connect();
}

const closePool = () => {
	db.pool.end();
}

const getNextUserId = async () => {
	try {
		const userId = await db.query(`SELECT currval(pg_get_serial_sequence('user_account', 'id')) as currentid;`);
		return parseInt(userId['rows'][0].currentid);
	} catch (err) {
		logger.error(err);
	}

	// Fallback in case currval is not yet set
	return 1;
}

const getLastUserId = async () => {
	try {
		const latestUserId = await db.query(`SELECT id FROM user_account ORDER BY created_at DESC LIMIT 1;`);
		return latestUserId['rows'].length ? parseInt(latestUserId['rows'][0].id) : null;
	} catch (err) {
		logger.error(err);
	}
}

const populateUsers = async () => {
	return await db.query(`INSERT INTO user_account (email, first_name, last_name) VALUES ${usersSqlValues} RETURNING *`);
}

module.exports = {
	initializeDatabase,
	getClient,
	closePool,
	getNextUserId,
	getLastUserId,
	populateUsers
}
