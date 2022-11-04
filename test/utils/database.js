const db = require('../../src/services/database.service');
const { usersSqlValues } = require('./data/users.js');

const initializeDatabase = async () => {
	try {
		await db.query(`INSERT INTO users (email, first_name, last_name) VALUES ${usersSqlValues}`);
	} catch (err) {
		console.log(err);
	}
}

const clearDatabase = async () => {
	try {
		await db.query(`TRUNCATE TABLE activities, strava_connection_details, users;`);
		await db.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
	} catch (err) {
		console.log(err);
	}
}

const closePool = () => {
	db.pool.end();
}

module.exports = {
	initializeDatabase,
	clearDatabase,
	closePool
}
