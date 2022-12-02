const db = require('../../src/services/database.service');
const { usersSqlValues } = require('../../__fixtures__/users');
const { logger } = require('../../src/utils/logger.utils');

/**
 * Set up database initially using a transaction.
 *
 * @see https://node-postgres.com/features/transactions
 */
const initializeDatabase = async () => {
	logger.info('Initializing database for tests.');

	const client = await getClient();
	try {
		await client.query('BEGIN');
		await client.query(`TRUNCATE TABLE activity_impact, activity, strava_connection, strava_refresh_token, user_account;`);
		await client.query(`ALTER SEQUENCE user_account_id_seq RESTART WITH 1;`);
		await client.query(`ALTER SEQUENCE activity_id_seq RESTART WITH 1;`);
		await client.query('COMMIT');
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
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

const populateUsers = async () => {
	const client = await getClient();
	return await client.query(`INSERT INTO user_account (email, first_name, last_name) VALUES ${usersSqlValues} RETURNING *`);
}

module.exports = {
	initializeDatabase,
	getClient,
	closePool,
	getNextUserId,
	populateUsers
}
