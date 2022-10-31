const db = require('../../src/services/database.service');

const initializeDatabase = async () => {
	try {
		await db.query(`TRUNCATE TABLE
						activities,
						strava_connection_details,
						users;`);
		return true;
	} catch (err) {
		console.log(err);
	}

	return false;
}

beforeAll(initializeDatabase);