const pgp = require('pg-promise')();

const db = () => {
	const db = pgp(`postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
	return () => db;
}

module.exports = {
	db: db()
}