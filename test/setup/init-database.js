const db = require('../../src/services/database.service');

const initializeDatabase = async () => {
	console.log('initializing database...');
	try {
		await db.query(`TRUNCATE TABLE "users"`);
		await db.query(`TRUNCATE TABLE "strava_connection_details"`);
		await db.query(`TRUNCATE TABLE "activities"`);
		return true;
	} catch (err) {
		console.log(err);
	}

	return false;
}

beforeAll(initializeDatabase);