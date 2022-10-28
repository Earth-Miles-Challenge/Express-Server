const { Pool } = require('pg');
const env = process.env.NODE_ENV.toUpperCase();
const {
	[`PGUSER_${env}`]: dbUser,
	[`PGHOST_${env}`]: dbHost,
	[`PGPORT_${env}`]: dbPort,
	[`PGDATBASE_${env}`]: dbDatabase,
	[`PGPASSWORD_${env}`]: dbPassword
} = process.env;

const pool = new Pool({
	user: dbUser,
	host: dbHost,
	database: dbDatabase,
	password: dbPassword,
	port: dbPort
});

module.exports = {
	query: (text, params, callback) => {
		return pool.query(text, params, callback)
	},
}