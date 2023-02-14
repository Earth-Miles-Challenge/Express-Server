const { Pool } = require('pg');
const { getEnvironment } = require('../utils/env.utils');
const connectionString = getEnvironment() === 'TEST' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});

module.exports = {
	pool,
	query: async (text, params, callback) => {
		return pool.query(text, params, callback);
	},
}