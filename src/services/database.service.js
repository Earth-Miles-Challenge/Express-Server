const { Pool } = require('pg');
const { getEnvVariable } = require('../utils/env.utils');

const pool = new Pool({
	user: getEnvVariable('PGUSER'),
	host: getEnvVariable('PGHOST'),
	database: getEnvVariable('PGDATABASE'),
	password: getEnvVariable('PGPASSWORD'),
	port: getEnvVariable('PGPORT')
});

module.exports = {
	pool,
	query: async (text, params, callback) => {
		return pool.query(text, params, callback);
	},
}