const db = require('../../src/services/database.service');
const { usersSqlValues } = require('../../__fixtures__/users');
const { logger } = require('../../src/utils/logger.utils');

/**
 * Set up database initially using a transaction.
 *
 * @see https://node-postgres.com/features/transactions
 */
const initializeDatabase = async () => {
	const client = await getClient();
	try {
		await client.query('BEGIN');
		await client.query(`TRUNCATE TABLE activities, strava_connection_details, users;`);
		await client.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
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
		const userId = await db.query(`SELECT currval(pg_get_serial_sequence('users', 'id')) as currentid;`);
		return parseInt(userId['rows'][0].currentid) + 1;
	} catch (err) {
		logger.error(err);
	}
}

const populateUsers = async () => {
	const client = await getClient();
	return await client.query(`INSERT INTO users (email, first_name, last_name) VALUES ${usersSqlValues} RETURNING *`);
}

module.exports = {
	initializeDatabase,
	getClient,
	closePool,
	getNextUserId,
	populateUsers
}
