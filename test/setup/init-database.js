const db = require('../../src/services/database.service');
const { usersSqlValues } = require('./data/users.js');

const initializeDatabase = async () => {
	try {
		await db.query(`TRUNCATE TABLE activities, strava_connection_details, users;`);
		await db.query(`ALTER SEQUENCE users_id_seq RESTART WITH 1;`);
		await db.query(`INSERT INTO users (email, first_name, last_name) VALUES ${usersSqlValues}`);
		return true;
	} catch (err) {
		console.log(err);
	}

	return false;
}

beforeAll(initializeDatabase);