const { Pool } = require('pg');
const env = process.env.NODE_ENV.toUpperCase();
const {
	[`PGUSER_${env}`]: dbUser,
	[`PGHOST_${env}`]: dbHost,
	[`PGPORT_${env}`]: dbPort,
	[`PGDATABASE_${env}`]: dbDatabase,
	[`PGPASSWORD_${env}`]: dbPassword
} = process.env;

const createPool = async () => {
	return await new Pool({
		user: dbUser,
		host: dbHost,
		database: dbDatabase,
		password: dbPassword,
		port: dbPort
	});
}

const pool = new Pool({
	user: dbUser,
	host: dbHost,
	database: dbDatabase,
	password: dbPassword,
	port: dbPort
});

module.exports = {
	pool,
	query: async (text, params, callback) => {
		return pool.query(text, params, callback);
	},
}