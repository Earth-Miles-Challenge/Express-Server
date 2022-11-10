const db = require('../../src/services/database.service');
const { usersSqlValues } = require('./data/users.js');
const { logger } = require('../../src/services/logger.service');

const initializeDatabase = async () => {
	try {
		await db.query(`INSERT INTO users (email, first_name, last_name) VALUES ${usersSqlValues}`);
	} catch (err) {
		logger.error(err);
	}
}

const clearDatabase = async () => {
	try {
		await db.query(`TRUNCATE TABLE activities, strava_connection_details, users;`);
		await db.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
		closePool();
	} catch (err) {
		logger.error(err);
	}
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

module.exports = {
	initializeDatabase,
	clearDatabase,
	closePool,
	getNextUserId
}
